# Attendance, Overtime, Regularization & Leave — Approval Workflow Design

> Type: **Design specification** (target model).
> Scope: Frontend `d:\HRIS` + Backend `d:\HRIS_API` (Node/Express, PostgreSQL, database‑per‑tenant).
> Companion: [ATTENDANCE_LEAVE_RBAC_SETTINGS.md](./ATTENDANCE_LEAVE_RBAC_SETTINGS.md) (as‑is reference) · [LEAVE_MANAGEMENT.md](./LEAVE_MANAGEMENT.md) · [REGULARIZATION_FLOW.md](./REGULARIZATION_FLOW.md)

This document defines the **unified, settings‑driven approval workflow** for My Attendance, Overtime, Regularization, Manual Attendance, and Leave — and the **single‑record, column‑based** data model used to track multi‑level approvals.

---

## 1. Core principles

1. **One request = one record.** A request is never split into multiple rows per approval level. Each approval stage is a **set of columns** on the single record:
   `manager_approval_status / manager_approved_by / manager_approved_at`,
   `department_approval_status / department_approved_by / department_approved_at`,
   `hr_approval_status / hr_approved_by / hr_approved_at`,
   plus `current_stage` and an overall `status`.
2. **Scope decides visibility; RBAC decides action; settings decide the chain.** These three are independent and all apply (see §2–§4).
3. **No self‑approval.** A user can never approve their own request, at any stage — even an admin.
4. **Sequential escalation.** A request moves Employee → Reporting Manager → Department Head → HR. Any stage's **rejection ends the request**; only the final stage's approval marks it fully approved.

---

## 2. Access scope (who sees / acts on whose records)

Set per role (`role_data_scopes`), resolved into `req.auth.scope`:

| Scope | Sees / acts on |
|---|---|
| **Self** | Only their own records |
| **Team** | Their direct reports (`reporting_manager_id`) and/or managed team |
| **Department** | All employees in their department |
| **All** | All employees in the tenant (HR/Admin) |

Applied to every list/report query and single‑record action. Example: a manager with approve rights + **Team** scope can approve — but only for their own team's requests.

---

## 3. Approval hierarchy & escalation

**Standard chain:**

```
Employee → Reporting Manager → Department Head → HR
```

**Escalation rules (settings‑aware):**
- If the employee **has no Reporting Manager**, the chain skips straight to **Department Head → HR**.
- If the employee's **department has no Department Head**, that stage is skipped (`department_approval_status = N/A`).
- The **number of stages is governed by settings** (`approval_workflow_type`): `SINGLE`, `TWO` (default), `THREE`, `CUSTOM` — see §7. Stages not in the configured chain are stored as `N/A`.
- A stage with no eligible approver is auto‑skipped (never leaves a request stuck with nobody able to act).

**Stage authorization (who may act on the current stage):**

| Stage | Eligible actor |
|---|---|
| Manager | The employee's Reporting Manager (`reporting_manager_id`) |
| Department Head | A user managing the employee's department |
| HR | A user with HR approval rights (`*.approve` + `view.all`/`manage`) |
| Any | Tenant Admin / `*.manage` may override any stage (still no self‑approval) |

---

## 4. RBAC (permissions to act)

| Feature | Submit / create | Approve / reject |
|---|---|---|
| My Attendance | `attendance.create` (self punch) | — |
| Overtime | `attendance.create` (self) / `attendance.manage` | `attendance.approve` / `attendance.reject` / `attendance.manage` |
| Regularization | `attendance.regularization.request` | `attendance.approve` / `attendance.reject` / `attendance.manage` |
| Manual Attendance | — | `attendance.manage` (All scope only) |
| Leave | `leave.apply` | `leave.approve` |

---

## 5. Single‑record, column‑based data model

Instead of one row per approval step, each request record carries the full approval trail in columns. Generic shape (applied per feature table):

| Column | Meaning |
|---|---|
| `status` | Overall: `Pending` / `Approved` / `Rejected` (`Draft` for leave) |
| `current_stage` | `manager` / `department` / `hr` / `done` |
| `manager_approval_status` | `Pending` / `Approved` / `Rejected` / `N/A` |
| `manager_approved_by`, `manager_approved_at` | Who/when |
| `department_approval_status` | `Pending` / `Approved` / `Rejected` / `N/A` |
| `department_approved_by`, `department_approved_at` | Who/when |
| `hr_approval_status` | `Pending` / `Approved` / `Rejected` / `N/A` |
| `hr_approved_by`, `hr_approved_at` | Who/when |
| `rejection_reason` | Set when any stage rejects |

**Lifecycle:** on submit, the stages in the configured chain start `Pending` (others `N/A`), `current_stage` = first active stage. Each approval stamps that stage's `*_approved_by/at`, flips its status to `Approved`, and advances `current_stage` to the next active stage. The last stage's approval sets `status = Approved`, `current_stage = done`. Any rejection sets `status = Rejected` and stops.

> This is exactly how **Leave** already works (`manager_approved_by/at` + `hr_approved_by/at` on one `leave_requests` row). The design extends the same pattern to **Regularization** (which currently uses a multi‑row steps table) and adds the **Department Head** stage where required.

---

## 6. Per‑feature specification

### 6.1 My Attendance (check‑in / check‑out)
- **No approval workflow** — punches are recorded directly.
- **Access:** Self punch only (non‑managers cannot back‑date or punch for others). Visibility by scope (Self/Team/Department/All).
- **Settings that drive it:** shift `work_start_time`/`work_end_time`, `break_duration_minutes`, `grace_days_per_month`, `late_mark_auto_calculation`, `min_hours_for_present`, `early_departure_rule`, `weekend_mode`/`custom_week_off_days`, `overtime_eligibility` (for OT detection on checkout).

### 6.2 Overtime
- **Submit:** any employee may request OT (auto‑detected on checkout, or manually added for self).
- **Approval chain (column‑based):** Employee → Reporting Manager → Department Head → HR (per `overtime_approval_workflow`).
- **Columns:** `overtime_status` (overall) + the manager/department/hr approval columns.
- **Settings that drive it:** `overtime_eligibility` (gate), `total_required_hours` (threshold), `overtime_custom_multiplier`/`overtime_calculation_rule` (pay), `overtime_minimum_threshold_minutes`, `overtime_max_per_month_hours`, `overtime_require_reason`, **`overtime_approval_workflow`** (chain), **`overtime_approver`** (final authority).
- **Guards:** no self‑approval; scope‑limited; only `Approved` OT counts in payroll summary.

### 6.3 Regularization
- **Submit:** for Missed Check‑In, Missed Check‑Out, Incorrect Attendance, System Issue. Governed by `who_can_submit_request` (All employees / Manager only / HR only).
- **Approval chain (column‑based):** Employee → Reporting Manager → Department Head → HR (per `approval_workflow_type`).
- **Columns:** `regularization_status` (overall) + `current_stage` + manager/department/hr approval columns. **One row per request** — no per‑step rows.
- **Settings that drive it:** **`approver`** + **`approval_workflow_type`** (build the chain), **`auto_rejection_after_days`** (auto‑reject stale pending), `who_can_submit_request`, `regularization_max_per_month` (cap), `regularization_auto_approve_*` (auto‑approve when an approver is absent).
- **Guards:** no self‑approval; per‑stage hierarchy (manager = reporting manager, department = dept head, HR = HR rights); auto‑reject after N days.

### 6.4 Manual Attendance / Override
- **Access:** **All scope only** (HR/Admin), permission `attendance.manage`.
- **No approval workflow** — entries are **auto‑approved** on save (`manager/department/hr_approval_status = N/A`, `status = Approved`).
- **Always audited.**
- **Settings:** the calc engine applies when an explicit status isn't forced.

### 6.5 Leave & Absence
- **Submit:** any employee with `leave.apply` (for self). Approvers may apply on behalf of others within scope.
- **Approval chain (column‑based):** Employee → Reporting Manager → Department Head → HR. (Today: Manager → HR; Department Head stage is the design addition.)
- **Columns:** `status` (`Draft`/`Pending …`/`Approved`/`Rejected`/`Cancelled`) + manager/department/hr approval columns.
- **Settings that drive it (per leave type):** `annualEntitlementDays` (balance), `paidOrUnpaid`, **`autoApproval`** (skip chain, auto‑approve + deduct), `documentRequired`, `noticePeriodRequired`, `genderRestriction`, `carryForward`/`maxCarryForwardDays`, `accrual`, `lossOfPayRule`, `probationRestriction`, `minimumServiceMonths`, applicable departments/designations/employment types, **`approver`** (authority).
- **Guards:** non‑approvers can only apply for themselves; no self‑approval; balance consumed only on final approval; restored on cancel of an approved request.

---

## 7. Settings catalog — how each setting drives the workflow

### Attendance settings (`attendance_settings`, Settings → Attendance)
| Setting | Drives |
|---|---|
| `approver` | The configured final authority for regularization (e.g. HR). |
| `approval_workflow_type` | Number of approval stages: SINGLE / TWO / THREE / CUSTOM. |
| `auto_rejection_after_days` | Pending regularization auto‑rejected after N days (default 3). |
| `who_can_submit_request` | Who may raise a regularization (All / Manager only / HR only). |
| `overtime_eligibility` | Master gate for overtime (default OFF). |
| `overtime_approval_workflow` | Overtime approval chain (e.g. Manager → HR). |
| `overtime_approver` | Overtime final authority. |
| `overtime_require_reason`, `overtime_minimum_threshold_minutes`, `overtime_max_per_month_hours`, `overtime_calculation_rule`/`overtime_custom_multiplier` | OT validation & pay. |
| `regularization_max_per_month`, `regularization_auto_approve_*` | Submission cap; auto‑approve when approver absent. |
| shift/late/half‑day settings | Status & hours computation (My Attendance). |

### Leave settings (leave types, Settings → Leave Settings)
| Setting | Drives |
|---|---|
| `autoApproval` | If ON, the request skips the approval chain and is approved on apply. |
| `approver` | The configured approval authority for the type. |
| `annualEntitlementDays`, `carryForward`, `maxCarryForwardDays`, `accrual` | Balance allocation & roll‑over. |
| `paidOrUnpaid`, `lossOfPayRule` | Whether balance/payroll is affected. |
| `documentRequired`, `noticePeriodRequired`, `genderRestriction`, `probationRestriction`, `minimumServiceMonths` | Eligibility checks on apply. |
| applicable departments / designations / employment types | Who the type is offered to. |

---

## 8. Stage lifecycle (example: regularization, 3‑stage chain)

```
submit
  status = Pending, current_stage = manager
  manager_approval_status = Pending
  department_approval_status = Pending (or N/A if no dept head)
  hr_approval_status = Pending
        │
  manager approves  → manager_approved_by/at set, current_stage = department
        │
  dept head approves → department_approved_by/at set, current_stage = hr
        │
  HR approves        → hr_approved_by/at set, status = Approved, current_stage = done
        │
  (any stage rejects → status = Rejected, rejection_reason set, stop)
  (no action in N days → auto-reject via auto_rejection_after_days)
```

The history list shows **one row** per request, with `current_stage` indicating who it's waiting on.

---

## 9. Current vs target (what this design changes)

| Area | Current | Target (this design) |
|---|---|---|
| Leave approval | Single row, columns (Manager → HR) | Add **Department Head** stage column |
| Regularization | **Multiple rows** in `attendance_regularization_steps` | **Single row**, manager/department/hr columns |
| Overtime | Single stage (`overtime_status`) | Manager → Dept Head → HR columns |
| Manual attendance | Auto‑approved, All scope | Unchanged (already matches) |
| Configurable chain | `approval_workflow_type` drives a steps table | Same setting drives which stage columns are active (`N/A` for unused) |

**Implementation note:** moving regularization to columns requires a migration (add the approval columns to `attendance`), rewrites of `submitRegularization` / `regularize` / the authorization guard / history queries, and an FE tweak to read `current_stage`. The flexible N‑level steps table is replaced by the fixed Manager/Department/HR stage columns gated by `approval_workflow_type`.
