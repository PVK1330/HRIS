# Attendance, Overtime & Regularization

> **Source audit:** June 2026 — derived from live codebase at `d:\HRIS` (frontend) and `d:\HRIS_API` (backend).

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Database Schema](#2-database-schema)
3. [Attendance — Check-In / Check-Out](#3-attendance--check-in--check-out)
4. [Status Computation Logic](#4-status-computation-logic)
5. [Manual Override (Admin)](#5-manual-override-admin)
6. [Overtime](#6-overtime)
7. [Regularization](#7-regularization)
8. [Attendance Reports](#8-attendance-reports)
9. [Attendance Settings — Complete Field Reference](#9-attendance-settings--complete-field-reference)
10. [Notification Events](#10-notification-events)
11. [API Reference](#11-api-reference)
12. [Known Bugs & Gaps](#12-known-bugs--gaps)

---

## 1. Module Overview

| Sub-module | What it does | Status |
|---|---|---|
| **Check-In/Out** | Employee self-punch with timezone awareness, late detection, WFH gating | Fully implemented |
| **Manual Override** | Admin marks attendance directly, bypassing workflow | Fully implemented |
| **Regularization** | Employee requests correction; multi-stage manager→dept→HR approval | Fully implemented |
| **Overtime** | Detected on checkout or manually created; multi-stage approval | Fully implemented |
| **Attendance Dashboard** | KPI cards, 7-day trend, department breakdown, late list, missing checkouts | Functional (trend % hardcoded — see bugs) |
| **Reports** | 9 report types, scope-filtered, PDF + Excel export | Fully implemented |
| **Attendance Settings** | Full settings CRUD with 30+ fields | Fully implemented (some fields dead — see §9) |
| **Shift Management** | Shift table exists; shifts used in calculation | DB schema ready; no assignment UI (see §9) |

---

## 2. Database Schema

### `attendance` table

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `employee_id` | INTEGER FK → employees | |
| `date` | DATE | UNIQUE per (employee_id, date) |
| `check_in_time` | VARCHAR | HH:mm |
| `check_out_time` | VARCHAR | HH:mm |
| `work_mode` | VARCHAR | `'In Office'` \| `'Remote'` \| `'Work From Home'` \| `'Field Duty'` |
| `status` | VARCHAR | See status values below |
| `total_hours` | NUMERIC | Same as worked_hours |
| `worked_hours` | NUMERIC | Gross hours minus break |
| `break_hours` | NUMERIC | |
| `overtime_hours` | NUMERIC | After multiplier applied |
| `overtime_status` | VARCHAR | `'None'` \| `'Pending'` \| `'Manager_Approved'` \| `'Dept_Approved'` \| `'Approved'` \| `'Rejected'` |
| `late_minutes` | INTEGER | |
| `early_departure_minutes` | INTEGER | |
| `is_late` | BOOLEAN | |
| `early_departure` | BOOLEAN | |
| `notes` | TEXT | |
| `leave_type` | VARCHAR | Populated when status = On Leave |
| `holiday_region` | VARCHAR | |
| `paid_day` | BOOLEAN | False for Absent/Weekend |
| `regularization_status` | VARCHAR | `'N/A'` \| `'Pending'` \| `'Approved'` \| `'Rejected'` \| `'Cancelled'` |
| `regularization_reason` | TEXT | |
| `regularization_remarks` | TEXT | |
| `reg_current_stage` | VARCHAR | `'manager'` \| `'department'` \| `'hr'` \| `'done'` |
| `manager_approval_status` | VARCHAR | `'Pending'` \| `'Approved'` \| `'Rejected'` \| `'N/A'` |
| `department_approval_status` | VARCHAR | Same values |
| `hr_approval_status` | VARCHAR | Same values |
| `manager_approved_by` | INTEGER FK → employees | |
| `department_approved_by` | INTEGER FK → employees | |
| `hr_approved_by` | INTEGER FK → employees | |
| `manager_approved_at` | TIMESTAMPTZ | |
| `department_approved_at` | TIMESTAMPTZ | |
| `hr_approved_at` | TIMESTAMPTZ | |
| `overtime_manager_approved_by` | INTEGER FK | |
| `overtime_dept_approved_by` | INTEGER FK | |
| `overtime_hr_approved_by` | INTEGER FK | |
| `overtime_manager_approved_at` | TIMESTAMPTZ | |
| `overtime_dept_approved_at` | TIMESTAMPTZ | |
| `overtime_hr_approved_at` | TIMESTAMPTZ | |
| `overtime_manager_remarks` | VARCHAR | |
| `overtime_dept_remarks` | VARCHAR | |
| `overtime_hr_remarks` | VARCHAR | |
| `overtime_approved_by` | INTEGER FK | Legacy — mirrored from hr stage |
| `overtime_approved_at` | TIMESTAMPTZ | Legacy |
| `overtime_forwarded_at` | TIMESTAMPTZ | |
| `overtime_rejection_reason` | TEXT | |
| `is_closed` | BOOLEAN | Pay-period lock flag |
| `punch_timezone` | VARCHAR | |
| `check_in_ip` / `check_out_ip` | VARCHAR | |
| `check_in_device` / `check_out_device` | TEXT | |
| `check_in_latitude` / `check_out_latitude` | NUMERIC | |
| `check_in_longitude` / `check_out_longitude` | NUMERIC | |
| `check_in_address` / `check_out_address` | TEXT | |
| `created_by` / `updated_by` | INTEGER FK | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### `shifts` table

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `name` | VARCHAR(100) | e.g. `General Shift` |
| `shift_type` | VARCHAR(30) | `'General Shift'` \| `'Morning'` \| `'Night'` \| `'Rotational'` |
| `start_time` | TIME | |
| `end_time` | TIME | |
| `break_minutes` | INTEGER | Default 30 |
| `grace_minutes` | INTEGER | Default 10 |
| `minimum_hours` | NUMERIC(4,2) | Default 6 — hours needed for Present |
| `overtime_after_hours` | NUMERIC(4,2) | Default 8 — OT trigger |
| `is_night_shift` | BOOLEAN | Default false |
| `is_active` | BOOLEAN | |

### `employee_shift_assignments` table

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `employee_id` | INTEGER FK → employees ON DELETE CASCADE | |
| `shift_id` | INTEGER FK → shifts ON DELETE CASCADE | |
| `effective_from` | DATE | |
| `effective_to` | DATE | NULL = open-ended |
| `is_rotational` | BOOLEAN | |
| UNIQUE | `(employee_id, effective_from)` | |

> **Note:** No API endpoints exist to create or manage shift assignments. All employees fall back to the default `General Shift` seed row.

---

## 3. Attendance — Check-In / Check-Out

### Check-In Flow (`attendance.service.js → checkIn`)

1. Resolve `employeeId` from JWT; or match `work_email` against employees table as fallback.
2. Assert employee is active. Allowed statuses: `Active`, `Probation`, `Notice Period`. Onboarding employees with a completed workflow are auto-healed to Active.
3. Non-admin employees cannot pass `date`, `checkInTime`, or `checkOutTime` in the body.
4. WFH blocked when `wfh_marking_allowed = false` in settings.
5. Timezone-aware: `date = todayInTenantTime(timezone)`, `time = nowInTenantTime(timezone)`. Admins can override both.
6. Blocked for: future dates, closed pay periods (`is_closed = true`), double check-in.
7. Upsert uses `forceCheckIn: false` (COALESCE guard against concurrent double-punch race condition).
8. Fires:
   - `notifyCheckIn` → employee + reporting manager
   - `notifyLateArrival` → employee + reporting manager (if computed status = `Late`)

### Check-Out Flow (`attendance.service.js → checkOut`)

1. Same employee/active checks.
2. Requires `check_in_time` to already exist (or `body.checkInTime` for admin).
3. Night-shift guard: if `shift.is_night_shift && checkout_time <= checkin_time`, duration wraps `+24h`.
4. After checkout, if `overtime_hours > 0`:
   - `overtime_approval_workflow === 'Auto-approve'` → `markOvertimeAutoApproved` + `notifyOtApproved`
   - Otherwise → `markOvertimePending` + `notifyOtRequested` (to reporting manager)

---

## 4. Status Computation Logic

Priority chain (highest priority wins):

| Priority | Condition | Resulting Status |
|---|---|---|
| 1 | Approved `leave_requests` record for the date | `On Leave` |
| 2 | Matching `holiday_dates` (region = configured OR `'Global'`) | `Holiday` |
| 3 | Day not in `work_week_days` setting | `Weekend` |
| 4 | No punch record at all | `Absent` |
| 5 | Worked hours < `half_day_threshold_hours` | `Half Day` |
| 6 | Late arrival (after `start_time + grace_period_minutes + optional_10min_buffer`) | `Late` |
| 7 | Work mode = `Remote` / `Work From Home` / `Field Duty` | Respective label |
| 8 | All other cases | `Present` |

### Grace Engine (`attendanceGrace.service.js`)

- Counts late arrivals in the current calendar month before the current date.
- If `arrivalIndex <= grace_days_per_month`, absorbs the late mark → status becomes `Present` (or `Half Day` if hours low), `is_late = false`.
- Otherwise → `Late` (or `Half Day`).

### Overtime Calculation

```
rawOT     = workedHours - otAfterHours
           (otAfterHours = shift.overtime_after_hours ?? settings.total_required_hours)
multiplier = overtime_custom_multiplier (preferred)
           OR parsed Nx from overtime_calculation_rule string
           OR 1 (fallback)
overtime_hours = rawOT × multiplier
```

Only computed when `overtime_eligibility = true`. Capped by `overtime_max_per_month_hours` (0 = unlimited).

---

## 5. Manual Override (Admin)

**Endpoint:** `POST /api/attendance/override` or `POST /api/attendance/` (requires `ATTENDANCE_MANAGE` or `isTenantAdmin`)

- Can mark any date for any employee (scope-unrestricted for admins).
- Blocked for: future dates, closed pay periods.
- Night-shift guard: checkout must be after check-in unless `is_night_shift`.
- Preserves original IP/device provenance for fields not being overridden.
- Fires audit log + `notifyOverride` → employee + all HR/admin employees.

This bypasses the regularization workflow entirely — the record is written immediately.

---

## 6. Overtime

### Approval Workflow

```
None
  └── Employee/admin creates OT → Pending
         │
         ▼ (Reporting Manager approves)
    Manager_Approved
         │
         ▼ (Department Head approves)
    Dept_Approved
         │
         ▼ (HR / Org Admin approves)
    Approved
         │
         └── Rejected (any stage)
```

### Stage-to-Approver Mapping

| DB Status | Stage | Approver |
|---|---|---|
| `Pending` | Stage 1 | Reporting Manager (`reporting_manager_id`) |
| `Manager_Approved` | Stage 2 | Department Head (`departments.manager_id` or `auth.managedDepartmentId`) |
| `Dept_Approved` | Stage 3 | HR group (`admin`, `hr_admin`, `superadmin`) or ALL-scope users |
| `Approved` | Terminal | — |
| `Rejected` | Terminal | — |

### Escalation (no manager / no dept)

- If employee has no `reporting_manager_id` → submit directly as `Manager_Approved` (skip Stage 1).
- If also no `department_id` → submit directly as `Dept_Approved` (skip Stage 2).

### Self-approval Block

Self-approval is blocked at every stage via `assertNotSelfApproval()` and a secondary check in `createOvertime`.

### Auto-Approve Path

When `overtime_approval_workflow = 'Auto-approve'`: checkout with OT detected immediately writes `overtime_status = 'Approved'` and stamps `overtime_hr_approved_at` for payroll compatibility.

### Column Stamps Per Stage

| Stage | Columns Written |
|---|---|
| Manager | `overtime_manager_approved_by`, `overtime_manager_approved_at`, `overtime_manager_remarks` |
| Dept | `overtime_dept_approved_by`, `overtime_dept_approved_at`, `overtime_dept_remarks` |
| HR | `overtime_hr_approved_by`, `overtime_hr_approved_at`, `overtime_hr_remarks` + mirrors to legacy `overtime_approved_by/at` |

### Edit / Delete Rules

- Only `Pending` OT can be edited or deleted.
- If OT-only row (no punch data): attendance row physically deleted.
- If punches exist: OT fields are zeroed.

---

## 7. Regularization

### Approval Workflow

```
Employee submits → Pending (reg_current_stage = 'manager')
                       │
                  Manager approves
                       │
                  reg_current_stage = 'department' (status stays 'Pending')
                       │
                  Dept Head approves
                       │
                  reg_current_stage = 'hr' (status stays 'Pending')
                       │
                  HR approves → regularization_status = 'Approved', reg_current_stage = 'done'
                       │
                  Any stage Rejects → regularization_status = 'Rejected', reg_current_stage = 'done'
```

> `regularization_status` stays `'Pending'` through Stages 1 and 2. It only changes to `'Approved'` or `'Rejected'` on the final action. The current position is tracked by `reg_current_stage`.

### Stage Chain Construction (`attendanceWorkflow.service.js`)

| `approval_workflow_type` setting | Stage chain built |
|---|---|
| `'Single Level'` | `['hr']` |
| `'Two Level'` (default) | `['manager', 'hr']` — manager pruned if no `reporting_manager_id` |
| `'Three Level'` or `'Custom'` | `['manager', 'department', 'hr']` — each pruned if no applicable approver |
| Any other / fallback | `['hr']` |

### `can_act` Flag

Computed server-side in `getRegularizationHistory` and `getPendingRegularizations`. Passed to frontend as `can_act: true/false`. Self-approval is always `false`. Logic: `attendanceAuth.service.js → canActOnStage`.

### Attendance Status During Regularization

| Phase | `regularization_status` | `status` (attendance) |
|---|---|---|
| After submit | `Pending` | `Regularization Pending` |
| After intermediate approval | `Pending` | `Regularization Pending` |
| After final approval | `Approved` | `Regularization Approved` |
| After any rejection | `Rejected` | `Regularization Rejected` |

### Employee Can Set (via regularization form)

- `date` (required — must be past date, within open pay period)
- `checkInTime` (optional)
- `checkOutTime` (optional)
- `workMode` (`'In Office'` / `'Remote'` / `'Work From Home'`)
- `reason` (text)
- `notes` (optional)

### `who_can_submit_request` Enforcement

| Setting value | Who can submit |
|---|---|
| `'All employees'` | Any employee with `ATTENDANCE_REGULARIZATION_REQUEST` permission |
| `'Manager only'` | Must have direct reports OR HR scope |
| `'HR only'` | Must have HR approval scope |

### Other Guards

- `regularization_allow_self = false` → submitter cannot target their own record (unless admin).
- `regularization_max_per_month` → blocks if month count already reached.
- Initial status escalation: employee with no `reporting_manager_id` starts at `Manager_Approved` (Stage 2) instead of `Pending`.

---

## 8. Attendance Reports

### 9 Report Types

| Type | Description | Output |
|---|---|---|
| `employee` | Per-record for one or all employees | date, punches, status, hours, OT |
| `department` | Per-department aggregation | present/absent/late/OT totals |
| `organization` | Single-row org-wide summary | all counts |
| `summary` | Per-employee monthly summary | working days, present, absent, late, OT, payable days |
| `overtime` | Records with OT > 0 | punches + OT hours |
| `late` | Late arrival records only | check-in time, late minutes |
| `absenteeism` | Employees with >0 absent days | absent count vs total |
| `regularization` | All regularization requests | status, reason, current approver |
| `payroll` | Payroll-ready data per employee | payable days, LOP, OT |

**Filters:** `dateFrom`, `dateTo`, `year`, `month`, `employeeId`, `department`, `designation`, `location`, `shiftId`, `status`. Default limit: 2000 rows, max 5000.

**Scope:** All queries go through `appendScopeToConditions` — SELF/TEAM/DEPT/ALL scopes are fully respected.

**Export:** PDF (with tenant logo) and Excel (XLSX) via `attendanceExport.service.js` using ExcelJS.

---

## 9. Attendance Settings — Complete Field Reference

**Table:** `attendance_settings` (one row per tenant, in `attendance_settings` table)

### Work Hours

| DB Column | UI Label | Default | Enforced |
|---|---|---|---|
| `work_start_time` | Shift Start | `09:00` | Yes — late/early calc anchor |
| `work_end_time` | Shift End | `18:00` | Yes — early departure threshold |
| `break_duration_minutes` | Break Duration | `30` | Yes — subtracted from worked hours |
| `total_required_hours` | Required Hours | `8.5` | Yes — OT threshold when auto-calculate is off |
| `auto_calculate_hours` | Auto Calculate | `true` | Yes — derives required hours from shift window |

### Attendance Rules

| DB Column | UI Label | Default | Enforced |
|---|---|---|---|
| `min_hours_for_present` | Min Hours for Present | `6` | Yes |
| `ten_minute_buffer` | 10-min Buffer | `false` | Yes — adds 10 min to grace window |
| `late_mark_auto_calculation` | Auto Calculate Late | `true` | Yes — if false, late never computed |
| `grace_days_per_month` | Grace Days/Month | `2` | Yes — absorbs early late marks |
| `grace_period_minutes` | Grace Period | `10` | Yes — added to `work_start_time` |
| `half_day_threshold_hours` | Half-Day Threshold | `4` | Yes |
| `early_departure_rule` | Early Departure Rule | `'Mark half day'` | Yes |

### Regularization Settings

| DB Column | UI Label | Default | Enforced |
|---|---|---|---|
| `who_can_submit_request` | Who Can Submit | `'All employees'` | Yes |
| `approval_workflow_type` | Workflow Type | `'Two Level'` | Yes — drives stage chain |
| `approver` | Approver | `'HR'` | **Partial** — used in legacy path only; `buildStageChain` ignores it |
| `auto_rejection_after_days` | Auto-Reject After | `3` | Yes — via cron |
| `regularization_allow_self` | Allow Self | `true` | Yes |
| `regularization_max_per_month` | Max/Month | `3` | Yes |
| `regularization_auto_approve_enabled` | Auto-Approve | `false` | Yes — via cron |
| `regularization_auto_approve_after_days` | Auto-Approve After | `3` | Yes — via cron |

### Overtime Settings

| DB Column | UI Label | Default | Enforced |
|---|---|---|---|
| `overtime_eligibility` | Enable OT | `false` | Yes — gates entire OT feature |
| `overtime_calculation_rule` | Calculation Rule | `'1.5x hourly'` | Partial — overridden by custom multiplier |
| `overtime_approval_workflow` | Approval Workflow | `'Manager → HR'` | Partial — only `'Auto-approve'` has a distinct code path; `'HR only'`/`'Manager only'` have no effect on stage routing |
| `overtime_approver` | Approver | `'HR Department'` | **No** — stored but never read by stage routing |
| `overtime_minimum_threshold_minutes` | Min Threshold | `30` | Yes |
| `overtime_max_per_month_hours` | Monthly Cap | `0` (unlimited) | Yes |
| `overtime_custom_multiplier` | Pay Multiplier | `1.5` | Yes — preferred over calculation_rule |
| `overtime_require_reason` | Require Reason | `true` | Yes |

### Shift Settings (UI commented out)

| DB Column | Default | Enforced |
|---|---|---|
| `shift_type_default` | `'General'` | No — no shift assignment UI |
| `shift_allow_employee_view` | `true` | No |
| `shift_change_request_enabled` | `false` | No |

### General / Other Settings

| DB Column | Default | Enforced |
|---|---|---|
| `work_week_days` | `'Mon,Tue,Wed,Thu,Fri'` | Yes — weekend detection |
| `weekend_mode` | null | Yes — fallback when `work_week_days` not set |
| `custom_week_off_days` | null | Yes — when mode = `'Custom Week Off'` |
| `uk_holiday_region` | `'England'` | Yes — holiday lookup region |
| `wfh_marking_allowed` | `true` | Yes — blocks self WFH check-in when false |
| `biometric_sync_enabled` | `false` | **No** — stored, no biometric integration exists |
| `attendance_location_tracking` | `false` | Yes — gates lat/lng capture; no geofencing however |

---

## 10. Notification Events

| Event | Trigger | Recipients |
|---|---|---|
| `attendance.check_in` | Check in | Employee + Reporting Manager |
| `attendance.check_out` | Check out | Employee |
| `attendance.late` | Late check-in | Employee + Reporting Manager |
| `attendance.missing` | Cron: no checkout by EOD | Employee + Reporting Manager |
| `attendance.absent` | Cron: marks Absent | Employee + Reporting Manager |
| `attendance.override` | Admin manual override | Employee + all HR/admin employees |
| `attendance.regularization.submitted` | Regularization submitted | First approver (manager or dept head) |
| `attendance.regularization.forwarded` | Stage approved → next stage | Next stage approver |
| `attendance.regularization.approved` | Final HR approval | Employee |
| `attendance.regularization.rejected` | Any stage rejection | Employee |
| `attendance.regularization.auto_rejected` | Cron SLA breach | Employee + all HR/admin employees |
| `attendance.overtime.requested` | Checkout with OT (non-auto) | Reporting Manager |
| `attendance.overtime.approved` | HR stage final approval | Employee |
| `attendance.overtime.rejected` | Any stage rejection | Employee |
| `attendance.overtime.forwarded` | Manager→Dept or Dept→HR | Dept manager or HR group |

**Dedup:** `notification_history` table — SHA hash of `(type, entityType, entityId, recipientId, sentVia, title)`. Prevents duplicate sends on retry.

**Template override:** `notification_templates` table — an active row for an event type overrides the hardcoded fallback. Variables: `{{name}}`, `{{date}}`, `{{time}}`, `{{hours}}`, `{{reason}}`, `{{stage}}`, `{{overriderName}}`.

---

## 11. API Reference

### Attendance Settings

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/attendance-settings` | `ATTENDANCE_SETTINGS_VIEW` or `ATTENDANCE_MANAGE` | Get all settings |
| PUT | `/api/attendance-settings` | `ATTENDANCE_SETTINGS_MANAGE` or `ATTENDANCE_MANAGE` | Partial patch (nested or flat body) |

### Attendance

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/attendance/me/today` | `ATTENDANCE_CREATE` or view | Today's record for self |
| GET | `/api/attendance/dashboard` | Any view | Dashboard widgets + KPIs |
| GET | `/api/attendance/reports/data` | Any view | Run any of 9 report types |
| GET | `/api/attendance/reports/export/pdf` | Any view | PDF export |
| GET | `/api/attendance/reports/export/excel` | Any view | XLSX export |
| GET | `/api/attendance/regularizations` | Any view | Pending regularizations (scope-filtered) |
| GET | `/api/attendance/regularizations/history` | Any view | Full regularization history |
| GET | `/api/attendance/overtime/pending` | Any view | OT awaiting action |
| GET | `/api/attendance/overtime` | Any view | All OT records |
| POST | `/api/attendance/overtime` | `ATTENDANCE_MANAGE` or `ATTENDANCE_CREATE` | Create/request OT |
| PATCH | `/api/attendance/overtime/:id` | `ATTENDANCE_MANAGE` or `ATTENDANCE_APPROVE` | Edit pending OT |
| DELETE | `/api/attendance/overtime/:id` | `ATTENDANCE_MANAGE` or `ATTENDANCE_APPROVE` | Delete pending OT |
| GET | `/api/attendance/payroll-summary` | Any view | Payroll data for employee/month |
| GET | `/api/attendance` | Any view | List attendance (scope-filtered) |
| POST | `/api/attendance/check-in` | `ATTENDANCE_CREATE` | Check in |
| POST | `/api/attendance/check-out` | `ATTENDANCE_CREATE` | Check out |
| POST | `/api/attendance/regularization` | `ATTENDANCE_REGULARIZATION_REQUEST` | Submit regularization |
| POST | `/api/attendance/override` | `ATTENDANCE_MANAGE` | Admin override (bypasses workflow) |
| GET | `/api/attendance/:id` | Any view | Record detail |
| PATCH | `/api/attendance/:id/regularize` | `ATTENDANCE_APPROVE` or `ATTENDANCE_REJECT` | Approve/reject regularization |
| PATCH | `/api/attendance/:id/overtime` | `ATTENDANCE_APPROVE` or `ATTENDANCE_REJECT` | Approve/reject OT |
| GET | `/api/employees/:employeeId/attendance` | Any view | Employee's attendance by month |

---

## 12. Known Bugs & Gaps

| # | Severity | File:Line | Description |
|---|---|---|---|
| 1 | MEDIUM | `attendance.service.js:1027-1028` | When approver directly creates OT as `Approved`, both `notifyOtApproved` AND `notifyOtForwardedToDept` fire — employee gets a confusing "forwarded" message for an already-approved record |
| 2 | MEDIUM | `attendanceSettings.service.js:229-240` | `payMultiplier` and `customMultiplier` both map to `overtime_custom_multiplier` column — last-write-wins; `customMultiplier` is effectively always overwritten |
| 3 | MEDIUM | `Attendance.jsx:326-330` | Department filter dropdown has hardcoded options (`Engineering`, `HR`, `Finance`) — breaks all tenants with different dept names |
| 4 | MEDIUM | `OvertimeApprovals.jsx:83` | `canApprove` uses `canApproveRegularization` permission slug instead of overtime-specific permission |
| 5 | MEDIUM | `attendance.service.js` | `overtime_approval_workflow` values `'HR only'` and `'Manager only'` are stored and validated but have zero effect on stage routing — stages always follow manager→dept→HR |
| 6 | MEDIUM | `attendance.service.js:727-729` | `getPendingRegularizations` returns `records.length` (page count) as `total` — breaks pagination when >50 records exist |
| 7 | HIGH | `AttendanceDashboard.jsx:136` | "Export Report" button has no `onClick` handler — completely non-functional |
| 8 | HIGH | `AttendanceDashboard.jsx:161-163` | Trend percentages (`+12%`, `-2%`, `+5%`) are hardcoded — misleading for all tenants |
| 9 | HIGH | `OvertimeApprovals.jsx:352-356` | Edit button appears for `Manager_Approved`/`Dept_Approved` rows but backend rejects those with 400 — false affordance |
| 10 | LOW | `AttendanceSection.jsx:447-471` | Entire "Shift Settings" UI card is commented out — `shift_type_default`, `shift_allow_employee_view`, `shift_change_request_enabled` are DB-stored but admin has no way to edit them |
| 11 | LOW | `attendance.constants.js` | `REGULARIZATION_STATUSES` constant is missing `'Manager_Approved'` and `'Dept_Approved'` values; `'Cancelled'` is in the constant but never set anywhere |
| 12 | INFO | `employee_shift_assignments` | Table and queries exist and are used in attendance calculation, but no API endpoints exist to assign shifts to employees — all fall back to the default General Shift |
