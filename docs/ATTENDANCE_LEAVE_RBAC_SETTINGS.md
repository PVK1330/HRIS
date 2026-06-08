# Attendance & Leave — Settings, RBAC & Access Scope Reference

> Scope: Frontend `d:\HRIS` + Backend `d:\HRIS_API` (Node/Express, PostgreSQL, **database‑per‑tenant**).
> Status: Verified against current code (June 2026).
> Companion deep‑dives: [ATTENDANCE_MANAGEMENT.md](./ATTENDANCE_MANAGEMENT.md) · [LEAVE_MANAGEMENT.md](./LEAVE_MANAGEMENT.md) · [REGULARIZATION_FLOW.md](./REGULARIZATION_FLOW.md)

This document explains each feature — **My Attendance, Overtime, Regularization, Manual Attendance, Leave & Absence** — through three lenses:

- **Settings** — the tenant configuration that governs the feature (and whether it's actually enforced).
- **RBAC** — the permission slug(s) required to use/act on it.
- **Access Scope** — *which employees' records* the caller can see/act on (SELF / TEAM / DEPARTMENT / ALL).

---

## 1. The three lenses, defined

### 1.1 RBAC (permissions)
Each user's role grants permission **slugs**. The backend gates every endpoint with `requirePermission(...)`; the frontend mirrors it with `hasRbacSlug(...)` helpers in `src/utils/rbac.js`. Permission catalog (`src/constants/permissions.js`):

| Domain | Slugs |
|---|---|
| Attendance | `attendance.view.own`, `attendance.view.team`, `attendance.view.all`, `attendance.create`, `attendance.update`, `attendance.regularization.request`, `attendance.approve`, `attendance.reject`, `attendance.manage`, `attendance.settings.view`, `attendance.settings.manage` |
| Leave | `leave.view`, `leave.apply`, `leave.approve` |

### 1.2 Access Scope (data visibility)
Set on the role (`role_data_scopes`) and resolved into `req.auth.scope` by `authz.loadAuthContext`. Applied to list/report queries via `appendScopeToConditions(auth, …, 'e')` and to single records via `assertCanModifyEmployee` / `assertEmployeeRecordAccess` (`src/utils/applyDataScope.js`):

| Scope | Sees / acts on |
|---|---|
| `SELF` | Only their own employee record (`e.id = employeeId`) |
| `TEAM` | Direct reports (`reporting_manager_id`), or their managed department |
| `DEPARTMENT` | Everyone in `auth.department` *(string match — see Gaps)* |
| `DEPT_MANAGER` | Everyone in the managed `department_id` |
| `ALL` / tenant admin | Everyone in the tenant (no filter) |

**RBAC vs Scope are independent and both apply.** RBAC says *what action* you may perform; scope says *whose records* you may perform it on. Example: a manager with `leave.approve` + `TEAM` scope can approve leave — but only for their direct reports.

### 1.3 Settings
Two tenant config tables drive behavior:
- **`attendance_settings`** (Settings → Attendance) — shift, late/half‑day, overtime, regularization workflow, weekends, geofence.
- **Leave types** (Settings → Leave Settings) — per‑type quota, accrual, carry‑forward, approval, restrictions.

Both settings modules read the tenant from the verified JWT `db_name`; the core attendance/leave request data is **not** mounted under `tenantResolver`, so it's isolated per tenant by the JWT.

---

## 2. Default roles → permission + scope (Demo Corp seed)

From `src/scripts/seedDemoCorpRoles.js` — a concrete picture of who can do what:

| Role | Scope | Attendance perms | Leave perms |
|---|---|---|---|
| **Employee** | SELF | view.own, create, regularization.request | apply, view |
| **Department Head** | DEPARTMENT | view.own/team, create, update, regularization.request, approve, reject | apply, view, approve |
| **HR Admin** | ALL | all (incl. manage, settings.*) | apply, view, approve |
| **Finance Head** | ALL | — | view only |
| **IT Head** | ALL | — | — |

(Organization Admin = ALL scope + every permission.)

---

## 3. My Attendance (self check‑in / check‑out)

Employee punches in/out; the engine computes status (Present/Late/Half Day/…), worked hours, late minutes, and overtime.

**Settings that govern it** (`attendance_settings`):
- ✅ **Enforced:** `work_start_time`/`work_end_time` (late & early‑departure), `break_duration_minutes`, `ten_minute_buffer`, `grace_days_per_month` + `late_mark_auto_calculation` (grace engine), `min_hours_for_present` (half‑day), `early_departure_rule`, `weekend_mode`/`custom_week_off_days`, `uk_holiday_region`, `attendance_location_tracking` (geolocation capture).
- Shift assignments (`employee_shift_assignments`) **override** the global times.
- ⚠ **Defaults:** `late_mark_auto_calculation = false` → late marking OFF until enabled.
- ❌ **Ignored:** `grace_period_minutes` (calc uses shift grace + `ten_minute_buffer`), `half_day_threshold_hours` (uses `min_hours_for_present`), `work_week_days`, `wfh_marking_allowed`, `biometric_sync_enabled`.

**RBAC:**
- `attendance.create` → check‑in / check‑out (`POST /attendance/check-in`, `/check-out`).
- Any attendance view perm → `GET /attendance/me/today`.

**Access Scope:**
- A SELF‑scope employee can only punch for themselves — `resolveEmployeeId` defaults to the caller's own id and **non‑managers cannot pass `date`/`checkInTime`/`checkOutTime`** (server forces today/now).
- `assertCanModifyEmployee` blocks punching for anyone outside the caller's scope.

---

## 4. Overtime

Extra hours, either **auto‑detected on check‑out** (worked beyond threshold) or **manually added**, then approved.

**Settings that govern it:**
- ✅ **Enforced:** `overtime_eligibility` (gates OT entirely — **default false**), `total_required_hours` (OT threshold), `overtime_custom_multiplier`/`overtime_calculation_rule` (pay multiplier), `overtime_minimum_threshold_minutes`, `overtime_max_per_month_hours` (monthly cap), `overtime_require_reason`.
- ❌ **Ignored:** `overtime_approval_workflow` (e.g. "Manager → HR", "Auto‑approve") and `overtime_approver` — OT approval uses generic permission + scope + non‑self checks only, never the configured workflow/approver.

**RBAC:**
- Add OT (`POST /attendance/overtime`) → `attendance.manage` **or** `attendance.approve` **or** `attendance.create`.
- Approve/Reject (`PATCH /attendance/:id/overtime`) → `attendance.approve` **or** `attendance.reject` **or** `attendance.manage`.
- Edit/Delete OT → `attendance.manage` / `attendance.approve` (only on `Pending` rows).

**Access Scope & guards:**
- `assertCanModifyEmployee` → a SELF‑scope employee can only add OT for themselves (lands as `Pending`).
- **No self‑approval:** `assertNotSelfApproval` — you cannot approve your own OT, even as admin.
- Only `Approved` OT counts toward the monthly summary.

**State machine:** `None → Pending → Approved | Rejected`.

---

## 5. Regularization

Employee requests a correction to an attendance record; routed through a configurable multi‑level approval chain (default **Direct Manager → HR**). Full detail in [REGULARIZATION_FLOW.md](./REGULARIZATION_FLOW.md).

**Settings that govern it:**
- ✅ **Enforced:** `approver` + `approval_workflow_type` (`SINGLE`/`TWO`/`THREE`/`CUSTOM`) build the approval chain; `auto_rejection_after_days` (default 3) auto‑rejects stale pending requests via cron.
- ❌ **Ignored:** `who_can_submit_request` (dead guard — compares `'Managers only'` vs the real value `'Manager only'`, so **never restricts**), `regularization_allow_self`, `regularization_max_per_month`, `regularization_auto_approve_*` (no auto‑approve exists — only auto‑reject).

**RBAC:**
- Submit (`POST /attendance/regularization`) → `attendance.regularization.request`.
- Approve/Reject (`PATCH /attendance/:id/regularize`) → `attendance.approve` **or** `attendance.reject` **or** `attendance.manage`.
- View inbox/history → any attendance view perm.

**Access Scope & per‑step authorization** (`assertCanActOnPendingStep`):
1. **No self‑approval** — `assertNotSelfApproval` (even admins).
2. Tenant admin / `attendance.manage` → may act on any step.
3. Otherwise must hold the action permission **and** pass the per‑step hierarchy:
   - **Direct Manager / TEAM_LEAD step** → actor must be the employee's `reporting_manager_id`.
   - **MANAGER step** → actor must be in the employee's managed department.
   - **HR step** → needs `attendance.approve` **plus** (`attendance.view.all` **or** `attendance.manage`).

**State machine:** `Regularization Pending → Approved | Rejected` (any single rejection ends it; approval finalizes only at the last level).

---

## 6. Manual Attendance / Override

An admin marks or edits an employee's attendance directly (e.g., correcting a missed punch, converting an absence).

**Settings that govern it:** the same calc engine settings apply when an explicit status isn't forced; an admin may also set an explicit `status`. A present‑like status with no check‑in and no approved regularization is rejected. Every override is **audited**.

**RBAC:**
- `POST /attendance/override` and `POST /attendance/` → `attendance.manage` (the highest attendance privilege).

**Access Scope:**
- `assertCanModifyEmployee` → an admin can only override within their data scope (ALL for HR Admin/Org Admin; a DEPARTMENT‑scoped manager only for their department).
- `forceCheckIn/forceCheckOut` overwrite existing punches.

---

## 7. Leave & Absence

Employees (or admins on their behalf) request leave; routed through a two‑stage **Manager → HR** workflow; balances tracked per type/year. Full detail in [LEAVE_MANAGEMENT.md](./LEAVE_MANAGEMENT.md).

**Settings that govern it** (Leave Settings → leave types):
- ✅ **Enforced:** `annualEntitlementDays` (balance), `paidOrUnpaid` (Unpaid skips balance), `autoApproval` (auto‑approve + deduct on apply), `documentRequired`. Notice period & gender restriction are enforced **on apply** (but can't be edited via UI — dropped on save).
- ⚠ **Carry‑forward** only used by the year‑end job, not apply/approve.
- ❌ **Ignored / dropped:** `accrual`, `lossOfPayRule` (LOP), the `approver` dropdown, applicable departments/designations/employment types, encashment, document‑after‑N‑days, description; **probation & minimum‑service checks are dead** (columns not read).

**RBAC:**
- View (`GET /leave`, `/balances`, `/types`) → `leave.view`.
- Apply (`POST /leave`) → `leave.view` **+** `leave.apply`. *(Accepts `leaveTypeId` or `leaveType` — validator fixed June 2026.)*
- Process (`PATCH /leave/:id`) → `leave.approve` for approve/reject; `leave.apply` for submit/cancel.

**Access Scope & guards:**
- **Self‑only for non‑approvers:** if the caller lacks `leave.approve`/ALL scope, `employeeId` is forced to themselves — they can apply only for their own leave.
- **No self‑approval:** a manager cannot approve their own request.
- List/stats/balances all scope‑filtered via `appendScopeToConditions`.
- **Two‑stage routing:** Stage 1 (Manager) → restricted to direct reports when the actor's role is literally `manager`; Stage 2 (HR) → gated by a hardcoded HR role set. Balance is consumed only on final HR `Approved`.

**Who can send a leave request?** Anyone whose role has `leave.apply` (Employee, Department Head, HR Admin in the seed). Finance Head (view‑only) and IT Head (no leave perms) **cannot**.

---

## 8. Quick‑reference matrix

| Feature | Permission to **act** | Scope effect | Self‑approval? | Key settings |
|---|---|---|---|---|
| My Attendance | `attendance.create` | Self only (non‑managers forced to today/self) | n/a | shift times, grace, half‑day, weekends |
| Overtime | add: create/approve/manage · decide: approve/reject/manage | self‑add only within scope | ❌ blocked | `overtime_eligibility`, threshold, multiplier, monthly cap |
| Regularization | submit: `regularization.request` · decide: approve/reject/manage | per‑step hierarchy (manager→dept→HR) | ❌ blocked | `approver`, `approval_workflow_type`, `auto_rejection_after_days` |
| Manual Attendance | `attendance.manage` | within scope | n/a | calc engine (when status not forced) |
| Leave & Absence | apply: `leave.apply` · decide: `leave.approve` | self‑only apply for non‑approvers; scoped lists | ❌ blocked | per‑type quota, paid/unpaid, auto‑approval, document required |

---

## 9. Cross‑cutting notes & known gaps

**Tenant isolation:** Attendance and leave **request/balance** data take the tenant strictly from JWT `db_name` (no `tenantResolver`, no header) — isolated. Settings routers use `tenantResolver` but the middleware/controllers force the tenant from `req.user` for non‑superadmins.

**Settings configured‑but‑not‑enforced (biggest theme):**
- Attendance: `grace_period_minutes`, `half_day_threshold_hours`, `work_week_days`, `wfh_marking_allowed`, `overtime_approval_workflow`/`overtime_approver`, `regularization_auto_approve_*`, `regularization_max_per_month`, `who_can_submit_request` (dead guard).
- Leave: `accrual`, `lossOfPayRule`, `approver`, applicable departments/designations/types, encashment, probation, minimum service.

**Scope edges:**
- `DEPARTMENT` scope matches on the department **name string** (`e.department = auth.department`) while TEAM/DEPT_MANAGER use `department_id` — a rename or casing drift silently empties results. Recommend standardizing on `department_id`.
- Leave Stage‑1 manager routing only constrains the literal role `'manager'`; other roles holding `leave.approve` can approve stage‑1 for anyone in their data scope (self‑approval still blocked).

**Recently fixed (June 2026):** leave apply validator now accepts `leaveTypeId`; regularization history no longer duplicates rows per approval step (LATERAL join); `updateRegularization` `$1::text` cast; designation dropdown loads all active designations by department id.
