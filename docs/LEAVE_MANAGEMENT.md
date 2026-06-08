# Leave Management — How It Works

This document explains the HRIS Leave & Absence module end‑to‑end: the two screens
(`/admin/leave` and `/admin/settings?tab=leave`), the multi‑stage approval workflow,
leave balances, carry‑forward, permissions, the API surface, the database schema,
and **every field of the "Add Leave Type" modal**.

> Scope reviewed: frontend (`LeaveAbsence.jsx`, `LeaveSettings.jsx`, `AddLeaveModal.jsx`,
> `leaveService.js`, `adminSettingsService.js`) and backend (`employees/leave/*`,
> `leaveSettings/*`, tenant migrations `004, 019, 041, 042, 100, 101, 109`).

---

## 1. Big picture

There are **two distinct sub‑systems**:

| Area | Screen | Backend module | Purpose |
|------|--------|----------------|---------|
| **Leave configuration** | `/admin/settings?tab=leave` | `leaveSettings/*` | Define **leave types** (Annual, Sick, …) and their policy rules. |
| **Leave operations** | `/admin/leave` | `employees/leave/*` | Employees **apply**; managers/HR **approve/reject**; balances are tracked. |

A **leave type** is the policy template. A **leave request** is one employee asking for
days off against a type. A **leave balance** row tracks `allocated / used / carry‑forward`
per employee per type per year.

The two systems are linked by the **leave type name** (a string), which is the canonical
key copied onto `leave_requests.leave_type` and `leave_balances.leave_type`.

---

## 2. Leave configuration — `/admin/settings?tab=leave`

`LeaveSettings.jsx` renders a single section: a searchable, paginated **table of leave
types** with **Add / Edit / Delete**. Table columns: **Leave Name** (icon + name + code),
**Quota** (annual days or custom label), **Carry Forward** (max days or "Not allowed"),
**Type** (Paid/Unpaid badge), **Actions**.

- Default leave types (`is_custom = false`) **cannot be deleted** and their **name is locked** in edit mode.
- Custom types are fully editable/deletable.
- The 8 seeded defaults: Annual Leave (21d), Sick Leave (10d), Unpaid Leave, Casual Leave (6d),
  Emergency Leave (3d), Maternity/Paternity (90d), Compensatory Off ("Earned days").

### 2.1 The "Add / Edit Leave Type" modal — ALL fields

State lives in `formData` (`LeaveSettings.jsx`). Frontend uses **camelCase**; the backend
accepts both camelCase and snake_case and stores snake_case.

**Section A — Basic Information**

| # | Label | Field (state key) | Input | Options / rules | Default | Required |
|---|-------|-------------------|-------|-----------------|---------|----------|
| 1 | Leave Type Name | `name` | text | 2–100 chars, unique (case‑insensitive); **locked for default types** | `''` | ✅ |
| 2 | Code (Optional) | `code` | text | uppercased in UI | `''` | — |

**Section B — Quota & Classification**

| # | Label | Field | Input | Options / rules | Default | Required |
|---|-------|-------|-------|-----------------|---------|----------|
| 3 | Annual Quota (Days) | `annualEntitlementDays` | number | integer 0–365 | `0` | — |
| 4 | Financial Classification | `paidOrUnpaid` | select | `Paid`, `Unpaid` | `Paid` | — |

**Section C — Accrual & Loss of Pay**

| # | Label | Field | Input | Options / rules | Default | Required |
|---|-------|-------|-------|-----------------|---------|----------|
| 5 | Accrual Model | `accrual` | select | `Monthly`, `Yearly`, `None` | `Monthly` | — |
| 6 | Negative Balance (LOP) | `lossOfPayRule` | select | `No LOP`, `Full LOP`, `Half LOP` | `No LOP` | — |

**Section D — Description**

| # | Label | Field | Input | Notes | Default | Required |
|---|-------|-------|-------|-------|---------|----------|
| 7 | Description | `entitlementLabel` | textarea | ⚠️ Labeled "Description" but bound to **`entitlementLabel`** (max 30 chars, used as the custom quota label). The separate `description` TEXT column exists in DB but is **not** wired to this textarea. | `''` | — |

**Section E — Notice & Eligibility**

| # | Label | Field | Input | Options / rules | Default | Required |
|---|-------|-------|-------|-----------------|---------|----------|
| 8 | Notice Period Required (Days) | `noticePeriodRequired` | number | ≥ 0; enforced at apply time | `0` | — |
| 9 | Gender Restriction | `genderRestriction` | select | `Both`, `Male`, `Female` | `Both` | — |
| 10 | Default Approver Authority | `approver` | select | dynamic: `Manager`, `HR`, `HR Manager`, `Direct Manager` + tenant role names | `Manager` | — |
| 11 | Minimum Service (Months) | `minimumServiceMonths` | number | ≥ 0; enforced at apply time | `0` | — |
| 12 | Document Mandatory After (Days) | `documentMandatoryAfterDays` | number | ≥ 0 | `0` | — |

**Section F — Toggles (boolean policy flags)**

| # | Label | Field | Default | Effect |
|---|-------|-------|---------|--------|
| 13 | Carry Forward Allowed | `carryForwardAllowed` | `true` | Unused days roll into next year (capped by #14). |
| 14 | Maximum Rollover Days | `maxCarryForwardDays` | `0` | **Conditional** — only shown when #13 is on. Caps carry‑forward. |
| 15 | Evidence Required | `documentRequired` | `false` | Require an attachment URL when applying. |
| 16 | Autonomous Approval | `autoApproval` | `false` | Requests of this type are **auto‑approved** on submit (balance deducted immediately). |
| 17 | Encashment Allowed | `encashmentAllowed` | `false` | Unused days can be paid out (policy flag; no payout engine reviewed). |
| 18 | Probation Restriction | `probationRestriction` | `false` | Employees on probation cannot apply; enforced at apply time. |

**Hidden / internal fields** (not user‑editable in the modal):
`isActive` (always sent `true`), `isCustom` (server‑controlled; stripped from input),
and three **Phase‑2 placeholders** persisted but with no UI:
`applicableDepartments`, `applicableDesignations`, `applicableEmploymentTypes` (JSONB arrays).

> ⚠️ **Field‑wiring gaps to be aware of**
> - **#7 Description** writes `entitlementLabel`, not the DB `description` column.
> - `encashmentAllowed`, `documentMandatoryAfterDays`, `minimumServiceMonths`,
>   `probationRestriction` and the `applicable*` arrays are **saved by the repository**
>   (they're in `UPDATABLE_COLUMNS`) but are **not in the service's camelCase response
>   mapper** (`mapRow`) and **not in the route validators** — so they persist and are
>   enforced by the leave engine, yet won't appear in the mapped API response and aren't
>   schema‑validated on write. Worth tightening if these become first‑class.

### 2.2 Config API (`/api/v1/admin/settings/leave-types`)

| Method | Path | Action |
|--------|------|--------|
| GET | `/leave-types` | List all types + `approverOptions` + `meta.total` |
| GET | `/leave-types/:id` | One type |
| POST | `/leave-types` | Create (always `is_custom = true`) |
| PUT | `/leave-types/:id` | Update; **reconciles** employee balances for the current year if name or allocation changed |
| DELETE | `/leave-types/:id` | Delete — **only** `is_custom = true` (defaults are 403‑protected) |

All require the `system-settings` permission; tenant DB is derived from the JWT (`db_name`),
not from a header.

---

## 3. Leave operations — `/admin/leave`

`LeaveAbsence.jsx` has two tabs: **Leave Requests** and **Holiday Listing**.

**KPI cards:** Present Today (`present / total`), On Leave Today, Approved Leaves (year),
Pending Requests.

**Requests table columns:** Employee · Leave Type · From · To · Days · Status · Actions.
**Filters:** search, year (±2), status, leave type, reset.

### 3.1 Applying for leave — the "Add Leave" modal (`AddLeaveModal.jsx`)

| Field | State key | Type | Notes |
|-------|-----------|------|-------|
| Employee | `employeeId` | select | **Locked to self** for non‑approvers; approvers pick anyone. |
| Leave Type | `leaveTypeId` (+ name) | select | From active leave types. |
| From / To | `fromDate` / `toDate` | date | `toDate ≥ fromDate`. |
| No of Days | `totalDays` | number | Auto‑calculated calendar days. |
| Remaining Days | — | display | `(total_allocated + carry_forward) − used`, fetched live. |
| Reason | `reason` | textarea | Required. |
| Supporting Document (Optional) | `supportingDocumentUrl` | url | **URL only — no file upload.** |

Actions: **Save as Draft** (`isDraft: true`) and **Submit Request**. `handoverNote` exists
in the form model but is **not rendered**. **There is no half‑day option** — only whole days.

### 3.2 Status values & badge colors

`Draft` · `Pending Manager Approval` · `Pending Dept Approval` · `Pending HR Approval` ·
`Approved` · `Rejected by Manager` · `Rejected by Dept` · `Rejected by HR` · `Cancelled`.

### 3.3 Row actions (who sees what)

- **View** (always).
- **Approve / Reject** — shown when `canActOnRequest(row)` = `canApprove && !isOwnRequest(row)`
  and status is one of the three `Pending …` states. (No self‑approval, even for approvers.)
- **Submit** — owner of a `Draft`.
- **Cancel** — owner, on `Pending* / Draft / Approved`.

Reject and Cancel require a reason (confirmation modal).

---

## 4. The approval workflow (backend `leave.service.js`)

**Intended chain:** Employee → Reporting Manager → Department Head → HR → Approved.

**Initial status on submit:**
- `Draft` if saved as draft.
- `Approved` immediately if the leave type has `auto_approval` (balance deducted now).
- `Pending Manager Approval` normally.
- `Pending Dept Approval` if the employee has **no `reporting_manager_id`** (manager stage skipped).

**Stage columns on `leave_requests`:**
`manager_approved_by / manager_approved_at` (mig 100),
`department_approved_by / department_approved_at` (mig 101),
`dept_approved_by / dept_approved_at / dept_remarks` (mig 109),
`hr_approved_by / hr_approved_at`, plus final `approved_by / approved_at` and `rejection_reason`.

**Authorization per stage:**
- Manager: `user.role === 'manager'` **and** is the employee's `reporting_manager_id`.
- HR (final): roles `admin, superadmin, hr_admin, hr_executive, hr`.
- No self‑approval at any stage.

**Balance timing:** balance is deducted **only at final HR approval** (under a `FOR UPDATE`
row lock, with a re‑check), or **immediately** for auto‑approved types. Cancelling an
already‑Approved request **restores** the used days. Drafts never touch balance.

> ⚠️ **Known inconsistency — the Department stage is only half‑implemented.**
> The statuses, the `Pending Dept Approval` label, and the `dept_*`/`department_*` columns
> all exist (migrations 101 & 109, and the UI lists the status), **but `processLeave()`
> only transitions Manager → HR** — it does not handle a Department‑Head approval step.
> So a request that starts at `Pending Dept Approval` (employee without a manager) has no
> coded transition to advance it, and the normal Manager→HR path skips Department entirely.
> This is the main gap to reconcile if the spec calls for a true 3‑level chain like the
> Overtime/Regularization modules now use (see `attendance-approval-workflow`).
> Also note migrations **101 and 109 add overlapping department columns**
> (`department_approved_*` vs `dept_approved_*`) — pick one before building the stage.

---

## 5. Balances & carry‑forward

- **`leave_balances`**: unique `(employee_id, leave_type, year)` with
  `total_allocated`, `used`, `carry_forward`. Remaining = `allocated + carry_forward − used`.
- A balance row is created on demand, seeded from the type's `annual_entitlement_days`.
- **Carry‑forward** (`leaveCarryForward.service.js`, `POST /api/v1/leave/carry-forward`):
  for each prior‑year balance of an active type, `carry = allowed ? min(remaining, max_carry_forward_days) : 0`,
  then upserts the target year (preserving any already‑allocated/used values). Idempotent.

---

## 6. Apply‑time validations (backend)

`toDate ≥ fromDate` · no overlapping Pending/Approved request · notice period · gender ·
probation restriction · minimum service months · document‑required · balance ≥ requested
(skipped for Unpaid). The balance pre‑check at apply is advisory; the authoritative check
happens under lock at approval.

---

## 7. Permissions

**Frontend slugs** (`rbac.js`): `leave.approve` → `canApproveLeave`;
`leave.apply` (or approve) → `canApplyLeave`. Non‑approvers are scoped to their own
employee id (apply + view own only).

**Backend permissions** (`leave.routes.js`): `P.LEAVE_VIEW`, `P.LEAVE_APPLY`,
`P.LEAVE_APPROVE`. Admin list/balances apply **data‑scope** filtering
(`appendScopeToConditions`) so SELF/TEAM/DEPARTMENT/ALL visibility is enforced server‑side.

---

## 8. Operations API (`/api/v1/leave`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/leave/types` | Active leave types for the tenant |
| GET | `/leave` | List requests (filters: status, year, department, leaveType, search; paginated; returns `stats`) |
| GET | `/leave/balances` | All employee balances for a year |
| POST | `/leave` | Apply (draft or submit) |
| PATCH | `/leave/:id` | `action: approve \| reject \| cancel \| submit` (+ `reason`) |
| POST | `/leave/carry-forward` | Run carry‑forward for a target year |
| GET | `/employees/:employeeId/leave` | Employee‑scoped: own requests + balances |

---

## 9. Database schema (tenant DBs)

**`leave_types`** (mig 019 + 041 + 042): `id (uuid)`, `name`, `code`, `paid_or_unpaid`,
`annual_entitlement_days`, `entitlement_label`, `accrual`, `carry_forward_allowed`,
`max_carry_forward_days`, `notice_period_required`, `gender_restriction`, `loss_of_pay_rule`,
`document_required`, `auto_approval`, `approver`, `is_active`, `is_custom`, `sort_order`,
`description`, `encashment_allowed`, `document_mandatory_after_days`, `applicable_departments`,
`applicable_designations`, `applicable_employment_types`, `probation_restriction`,
`minimum_service_months`, `created_at`, `updated_at`.

**`leave_requests`** (mig 004 + 100 + 101 + 109): `id`, `employee_id`, `leave_type`,
`from_date`, `to_date`, `total_days`, `reason`, `handover_note`, `alternate_contact`,
`supporting_document_url`, `status`, `approved_by`, `approved_at`, `rejection_reason`,
`manager_approved_by/at`, `department_approved_by/at`, `dept_approved_by/at`, `dept_remarks`,
`hr_approved_by/at`, `created_at`, `updated_at`.

**`leave_balances`** (mig 004): `id`, `employee_id`, `leave_type`, `year`,
`total_allocated`, `used`, `carry_forward`, `created_at`, `updated_at` — unique
`(employee_id, leave_type, year)`.

---

## 10. Summary of gaps / recommendations

1. **Department approval stage is incomplete** — statuses/columns exist but `processLeave()`
   never advances through Department. Either implement the Dept step (mirroring the
   attendance Overtime/Regularization `can_act` pattern) or remove the dead status/columns.
2. **Duplicate dept columns** (`department_approved_*` vs `dept_approved_*`) — consolidate.
3. **"Description" field** is wired to `entitlementLabel`, not the `description` column.
4. **Phase‑2 leave‑type fields** persist but are missing from the service response mapper
   and route validators — add them for consistency/validation.
5. **No half‑day leave** and **no per‑stage button gating like attendance** — the apply UI
   and the approval UI could adopt the same `can_act` model used by attendance for a
   consistent, role‑accurate experience.
6. **URL‑only attachments** — consider a real file upload for supporting documents.
