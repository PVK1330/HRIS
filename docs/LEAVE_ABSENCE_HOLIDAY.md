# Leave, Absence Management & Holiday

> **Source audit:** June 2026 — derived from live codebase at `d:\HRIS` (frontend) and `d:\HRIS_API` (backend).

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Database Schema](#2-database-schema)
3. [Leave Types & Settings](#3-leave-types--settings)
4. [Leave Application Flow](#4-leave-application-flow)
5. [Leave Approval Workflow](#5-leave-approval-workflow)
6. [Leave Balance & Carry-Forward](#6-leave-balance--carry-forward)
7. [Leave Cancellation](#7-leave-cancellation)
8. [Absence Management](#8-absence-management)
9. [Holiday Module](#9-holiday-module)
10. [Shift Management](#10-shift-management)
11. [API Reference](#11-api-reference)
12. [Notification Events](#12-notification-events)
13. [Leave Type Settings — Enforcement Status](#13-leave-type-settings--enforcement-status)
14. [Known Bugs & Gaps](#14-known-bugs--gaps)

---

## 1. Module Overview

| Sub-module | What it does | Status |
|---|---|---|
| **Leave** | Full leave request lifecycle — apply, draft, approve, reject, cancel | Fully implemented |
| **Leave Balance** | Balance allocation, deduction on approval, carry-forward | Fully implemented |
| **Leave Types** | Configurable leave types with 20+ settings fields | Partially enforced (see §13) |
| **Absence Management** | UI to resolve raw attendance absences (convert to leave / mark present) | Fully implemented |
| **Holiday Calendar** | Per-region UK holiday calendars + manual holidays | Fully implemented |
| **Holiday Notifications** | Notify employees on holiday CRUD | Fully implemented |
| **Shift Management** | Shift table + assignment table exist; used in attendance calc | DB ready; no assignment API |
| **Leave Encashment** | Toggle stored; no encashment endpoint | Dead feature |
| **Leave Accrual** | Monthly/Yearly accrual stored; no accrual engine | Dead feature |

---

## 2. Database Schema

### `leave_types`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `name` | VARCHAR(100) | |
| `code` | VARCHAR(20) | |
| `paid_or_unpaid` | VARCHAR(10) | `'Paid'` \| `'Unpaid'` |
| `annual_entitlement_days` | INTEGER | Used to seed balance |
| `entitlement_label` | VARCHAR(30) | Short label, max 30 chars |
| `accrual` | VARCHAR(20) | `'Monthly'` \| `'Yearly'` \| `'None'` — stored, not enforced |
| `carry_forward_allowed` | BOOLEAN | |
| `max_carry_forward_days` | INTEGER | |
| `notice_period_required` | INTEGER | Business days |
| `gender_restriction` | VARCHAR(20) | `'Both'` \| `'Male'` \| `'Female'` |
| `loss_of_pay_rule` | VARCHAR(20) | `'No LOP'` \| `'Full LOP'` \| `'Half LOP'` — stored, not enforced |
| `document_required` | BOOLEAN | |
| `auto_approval` | BOOLEAN | |
| `approver` | VARCHAR(30) | `'Manager'` \| `'HR'` \| `'HR Manager'` \| etc. — stored, not enforced |
| `is_active` | BOOLEAN | |
| `is_custom` | BOOLEAN | Only custom types can be deleted |
| `sort_order` | INTEGER | |
| `description` | TEXT | |
| `encashment_allowed` | BOOLEAN | Stored; no encashment endpoint |
| `document_mandatory_after_days` | INTEGER | Stored; not enforced |
| `applicable_departments` | JSONB | Array; stored, not enforced |
| `applicable_designations` | JSONB | Array; stored, not enforced |
| `applicable_employment_types` | JSONB | Array; stored, not enforced |
| `probation_restriction` | BOOLEAN | Enforced |
| `minimum_service_months` | INTEGER | Enforced (with day-rounding bug — see §14) |

**Default leave types seeded per tenant:**

| Type | Days | Accrual | Carry-Forward |
|---|---|---|---|
| Annual Leave | 21 | Monthly | 5 max |
| Sick Leave | 10 | Monthly | — |
| Unpaid Leave | 0 (Full LOP) | None | — |
| Casual Leave | 6 | Monthly | — |
| Emergency Leave | 3 | None | — |
| Maternity Leave | 90 | None | — |
| Paternity Leave | 10 | None | — |
| Compensatory Off | 0 (earned) | None | — |

---

### `leave_requests`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `employee_id` | INTEGER FK → employees | |
| `leave_type` | VARCHAR(50) | Name string, not FK |
| `from_date` | DATE | |
| `to_date` | DATE | |
| `total_days` | INTEGER | Server-authoritative (client value ignored) |
| `reason` | TEXT | |
| `handover_note` | TEXT | |
| `alternate_contact` | VARCHAR(255) | |
| `supporting_document_url` | VARCHAR(500) | |
| `status` | VARCHAR(50) | See statuses below |
| `approved_by` | INTEGER FK → employees | Final HR approver (legacy column) |
| `approved_at` | TIMESTAMPTZ | |
| `manager_approved_by` / `_at` | INTEGER / TIMESTAMPTZ | Stage 1 stamp |
| `department_approved_by` / `_at` | INTEGER / TIMESTAMPTZ | Stage 2 stamp |
| `dept_approved_by` / `_at` / `_remarks` | INTEGER / TIMESTAMPTZ / TEXT | **Duplicate of dept stage** (see bugs) |
| `hr_approved_by` / `_at` | INTEGER / TIMESTAMPTZ | Stage 3 stamp |
| `rejection_reason` | TEXT | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

---

### `leave_balances`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `employee_id` | INTEGER FK → employees | |
| `leave_type` | VARCHAR(50) | Name string |
| `total_allocated` | INTEGER | |
| `used` | INTEGER | |
| `carry_forward` | INTEGER | |
| `year` | INTEGER | |
| UNIQUE | `(employee_id, leave_type, year)` | |

---

### `holiday_calendars`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `name` | VARCHAR(100) | e.g. `England 2025` |
| `region` | VARCHAR(30) | `'England'` \| `'Scotland'` \| `'Wales'` \| `'Northern Ireland'` \| `'Global'` |
| `year` | INTEGER | |
| `is_active` | BOOLEAN | |
| UNIQUE | `(region, year)` | |

---

### `holiday_dates`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `calendar_id` | INTEGER FK → holiday_calendars ON DELETE CASCADE | |
| `holiday_date` | DATE | |
| `name` | VARCHAR(255) | |
| UNIQUE | `(calendar_id, holiday_date)` | |

---

## 3. Leave Types & Settings

### Leave Type CRUD

- Managed via **Settings → Leave** tab (`LeaveSettings.jsx`).
- System/default leave types cannot be deleted; custom types (`is_custom = true`) can.
- Name must be unique per tenant.
- `entitlementLabel` max 30 chars — UI textarea is labelled "Description" but hits this limit (see bugs).

### Leave Type API

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/settings/leave-types` | `system-settings` | List all with approver options |
| GET | `/api/v1/settings/leave-types/:id` | `system-settings` | Single leave type (UUID) |
| POST | `/api/v1/settings/leave-types` | `system-settings` | Create custom type |
| PUT | `/api/v1/settings/leave-types/:id` | `system-settings` | Update |
| DELETE | `/api/v1/settings/leave-types/:id` | `system-settings` | Delete (custom only) |

### Balance Reconciliation on Update

When `annual_entitlement_days` or `name` changes, `reconcileBalancesForLeaveType` runs:
- **Name change:** renames `leave_type` column in `leave_balances` for the current year.
- **Entitlement change:** sets `total_allocated` to the new value for the current year only. Past years are untouched.

---

## 4. Leave Application Flow

### Who Can Apply

- **Employee:** applies for themselves (only own `employee_id`).
- **Admin/HR** (`P.LEAVE_APPROVE`): can apply on behalf of any employee.

### Validation at Apply-Time

1. **Dates:** `from_date` must not be in the past (unless admin). `from_date ≤ to_date`.
2. **Notice period:** `from_date` must be ≥ `notice_period_required` working days from today (business-day aware).
3. **Overlap:** No existing active request overlaps the requested dates.
4. **Gender restriction:** employee's gender must match `gender_restriction` (or be `'Both'`).
5. **Probation restriction:** if `probation_restriction = true`, `probation_end_date` must be in the past.
6. **Minimum service months:** `join_date` + `minimum_service_months` must be ≤ `from_date`.
7. **Document required:** if `document_required = true` and no file URL provided, 400 error.
8. **Balance check:** for Paid leave, available balance ≥ `totalDays` (respects in-flight pending requests, runs under `FOR UPDATE` row lock).
9. **`applicable_departments/designations/employmentTypes`:** stored but **not checked** — any employee can apply regardless of these arrays.

### Working Days Calculation (authoritative)

Client-supplied `totalDays` is **completely ignored**. The server recalculates:

```js
calcWorkingDays(pool, fromDate, toDate):
  - Iterates each calendar day in range
  - Excludes weekends per work_week_days setting (or weekend_mode fallback)
  - Excludes holidays: WHERE hd.holiday_date BETWEEN dates AND (hc.region = tenantRegion OR hc.region = 'Global') AND hc.is_active = true
  - Falls back to calendar-day count on any error
  - Throws if result = 0 working days (prevents zero-day leave)
```

### Draft

- `status = 'Draft'` saves the request without triggering any workflow.
- Employee can convert Draft → active via a separate submit action.

### Auto-Approval

If `leave_types.auto_approval = true`:
- Status immediately set to `'Approved'`.
- Balance deducted at creation.
- Employee notified directly.
- No approval workflow triggered.

---

## 5. Leave Approval Workflow

### Status Flow

```
Draft
  └─ (Submit) ──► Pending Manager Approval   ← if employee has reporting_manager_id
                  Pending Dept Approval       ← if employee has NO reporting_manager_id
                       │
                  (Manager / Dept Head approves)
                       │
                  Pending HR Approval
                       │
                  (HR approves) ──► Approved   (balance deducted here)
                       │
                  (Any stage rejects) ──► Rejected by Manager / Rejected by Dept / Rejected by HR
                       │
                  (Employee / Admin cancels) ──► Cancelled
```

### Who Acts at Each Stage

| Stage | Status | Approver |
|---|---|---|
| 1 — Manager | `Pending Manager Approval` | Reporting Manager (`reporting_manager_id`) — or any user with leave-approve scope if manager is absent |
| 1 alt — Dept | `Pending Dept Approval` | Department Head (`departments.manager_id`) — reached when employee has no reporting manager |
| 2 — HR | `Pending HR Approval` | `HR_ROLES`: `admin`, `superadmin`, `hr_admin`, `hr_executive`, `hr`; or tenant admin; or ALL-scope users |

**Self-approval:** blocked at every stage (`isOwnRequest` check).

**Remarks:** Mandatory on rejection at every stage; stored in `rejection_reason`.

### Balance Deduction Timing

Balance is **deducted only on final HR `Approved`** (or on `auto_approval = true` creation). Not during intermediate stages.

---

## 6. Leave Balance & Carry-Forward

### Balance Seeding

Balance row is seeded **lazily** on first application by the employee. Starting values:
- `total_allocated = annual_entitlement_days`
- `used = 0`
- `carry_forward = 0`
- `year = current_year`

### Deduction & Restoration

- **Deduct:** `incrementUsed(+totalDays)` on final HR approval (atomic, row-locked).
- **Restore on cancel:** `incrementUsed(-totalDays)` on cancellation of an Approved request. Cross-year cancellations trigger `reconcileEmployeeCarryForward` to re-propagate the balance chain.

### Pending Reservation

`sumPendingDaysForType(employeeId, leaveType, year, excluding: requestId)` counts days in all other in-flight Pending requests of the same type+year. This prevents double-booking the same balance across multiple concurrent pending requests.

### Carry-Forward Job

- **Automatic:** Cron runs on Jan 1 at 00:30 for all active tenants.
- **Manual:** `POST /api/v1/leave/carry-forward` (requires `P.LEAVE_APPROVE`).
- **Algorithm:**
  ```
  remaining = max(0, total_allocated + carry_forward − used)
  carry     = min(remaining, max_carry_forward_days)  [capped by leave type config]
  ```
- Sets `carry_forward` for the new year. Refreshes `total_allocated` to current `annual_entitlement_days` (idempotent on re-run).
- Handles renamed/deleted leave types: carries the full remaining uncapped when type no longer exists.

### Accrual

The `accrual` setting (`Monthly` / `Yearly` / `None`) is **stored but not implemented**. No accrual engine or scheduled job exists. Balances are seeded once from `annual_entitlement_days`; monthly accrual (e.g., 1.75 days/month for a 21-day annual leave) is not calculated.

---

## 7. Leave Cancellation

### Who Can Cancel

- **Employee:** their own requests in any open status (`Draft`, any Pending, `Approved`).
- **Approver** (`P.LEAVE_APPROVE`): can cancel on behalf of others.

### What Happens

1. Status set to `'Cancelled'`.
2. Balance restored **only if** the request was in `'Approved'` status.
3. Cross-year approved cancellations re-propagate `carry_forward` via `reconcileEmployeeCarryForward`.
4. No notification is sent on cancellation.

### Note

`reason` is required by the frontend form on cancellation, but the API accepts it as optional — an admin bypassing the UI can cancel without reason.

---

## 8. Absence Management

Absence Management is **not a separate backend module**. It is a resolution UI (`AbsenceManagement.jsx`) built on top of the attendance module.

### What It Shows

Employees whose attendance record for a selected date has `status = 'Absent'`. Fetched from `GET /api/v1/attendance?status=Absent&date=<date>`.

### Available Actions Per Row

| Action | What it does |
|---|---|
| **Convert to Leave** | Opens AddLeaveModal pre-filled with the absence date; calls `POST /api/v1/leave` to create a retroactive leave request |
| **Mark as Present** | Calls `markAttendanceOverride` — prompts for check-in/out times |
| **Mark as Half Day** | Same as above, writes Half Day status |
| **Mark as Absent** | Re-marks as Absent (for undoing an accidental override) |

### Key Difference from Leave Module

- **Leave module** (`LeaveAbsence.jsx`) manages *leave requests* in `leave_requests` — applications, approvals, balances.
- **Absence Management** manages *attendance records* in `attendance` — resolving raw absences by retroactively converting them to leave or correcting the attendance status.

---

## 9. Holiday Module

### Two Sources of Holidays

| Source | How Created | Region | Where Used |
|---|---|---|---|
| **Seeded (UK bank holidays)** | `POST /api/v1/holidays/seed` from `uk-bank-holidays.json` | England / Scotland / Wales / Northern Ireland | Leave + attendance calc, per `uk_holiday_region` setting |
| **Manual** | Settings UI → add holiday | Always `'Global'` | Leave + attendance calc (Global always applies) |

### Region Logic

- The tenant setting `uk_holiday_region` (in `attendance_settings`) selects which UK regional calendar applies.
- Any holiday in a `'Global'` calendar always applies regardless of region.
- Leave day calculation:
  ```sql
  WHERE hd.holiday_date BETWEEN from AND to
    AND (hc.region = $tenantRegion OR hc.region = 'Global')
    AND hc.is_active = true
  ```
- Attendance: same query in `findHolidayForDate` — if matched, `status = 'Holiday'`, `paid_day = true`.

### Multiple Calendars Per Year

The `holiday_calendars` table has `UNIQUE (region, year)` — so up to 5 calendars per year (4 UK regions + 1 Global). The frontend `HolidaysSection` loads all calendars for a year but only shows and allows editing `calendars[0]` — the first result. If multiple calendars exist, only one is visible.

### Holiday Notifications

On every create/update/delete of a `holiday_dates` row, `notifyHolidayEvent()`:
- Resolves all eligible recipients (employees with attendance permissions).
- Deduplicates via `holiday_notification_history` UNIQUE constraint: `(holiday_id, employee_id, notification_type)`.
- Sends in-app + email.

Upcoming reminders: `sendUpcomingReminders()` finds holidays within the next N days (default 7) — called from a separate cron.

### Holiday API

All endpoints under `/api/v1/holidays`:

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/` | `ATTENDANCE_SETTINGS_VIEW` or view | List all holiday calendars |
| POST | `/` | `ATTENDANCE_SETTINGS_MANAGE` | Create a calendar |
| GET | `/:calendarId` | view | Get calendar + all its dates |
| POST | `/seed` | manage | Seed from `uk-bank-holidays.json` |
| POST | `/:calendarId/dates` | manage | Add a holiday date |
| PATCH | `/dates/:id` | manage | Update a holiday date |
| DELETE | `/dates/:id` | manage | Delete a holiday date |

> No endpoint to delete an entire calendar.

---

## 10. Shift Management

### What Exists in the DB

**`shifts` table** — seeded with one default row: `General Shift` (09:00–18:00, 30 min break, 10 min grace, 6h min for Present, 8h OT threshold, `is_night_shift = false`).

**`employee_shift_assignments` table** — UNIQUE per `(employee_id, effective_from)`. Supports `effective_to` (null = open-ended) and `is_rotational` flag.

### How Shifts Are Used

`getEmployeeShift(pool, employeeId, date)` in `attendanceCalculation.service.js`:
1. Queries `employee_shift_assignments` for the employee + date (most recent effective assignment).
2. Falls back to the first active row in `shifts` (always General Shift by default).

The returned shift overrides attendance settings in these fields:

| Shift field | Overrides setting |
|---|---|
| `start_time` | `work_start_time` |
| `end_time` | `work_end_time` |
| `break_minutes` | `break_duration_minutes` |
| `grace_minutes` | `grace_period_minutes` |
| `minimum_hours` | `min_hours_for_present` |
| `overtime_after_hours` | `total_required_hours` |
| `is_night_shift` | Enables midnight-crossing duration (adds 24h when `outMins < inMins`) |

### What is Missing

**No API endpoints exist for:**
- Creating or editing shifts
- Assigning shifts to employees
- Viewing an employee's shift schedule

Shift assignment is effectively dead from the API/UI perspective. All employees use the default General Shift.

---

## 11. API Reference

### Leave

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/leave` | `P.LEAVE_VIEW` | List leave requests (scope-filtered) |
| POST | `/api/v1/leave` | `P.LEAVE_VIEW` | Apply for leave (or save draft) |
| GET | `/api/v1/leave/types` | `P.LEAVE_VIEW` | Get active leave types |
| GET | `/api/v1/leave/balances` | `P.LEAVE_VIEW` | Get leave balances for an employee |
| GET | `/api/v1/leave/stats` | `P.LEAVE_VIEW` | Pending/approved/rejected counts |
| GET | `/api/v1/leave/:id` | `P.LEAVE_VIEW` | Get single request |
| PATCH | `/api/v1/leave/:id/process` | `P.LEAVE_APPROVE` | Approve / reject |
| PATCH | `/api/v1/leave/:id/cancel` | `P.LEAVE_VIEW` | Cancel (own) or `P.LEAVE_APPROVE` for others |
| GET | `/api/v1/leave/export/pdf` | `P.LEAVE_VIEW` | PDF export |
| GET | `/api/v1/leave/export/excel` | `P.LEAVE_VIEW` | XLSX export |
| POST | `/api/v1/leave/carry-forward` | `P.LEAVE_APPROVE` | Trigger manual carry-forward |

### Leave Settings

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/settings/leave-types` | `system-settings` | List all leave types |
| POST | `/api/v1/settings/leave-types` | `system-settings` | Create custom type |
| PUT | `/api/v1/settings/leave-types/:id` | `system-settings` | Update |
| DELETE | `/api/v1/settings/leave-types/:id` | `system-settings` | Delete (custom only) |

### Holidays

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/holidays` | View | List calendars |
| POST | `/api/v1/holidays` | Manage | Create calendar |
| GET | `/api/v1/holidays/:calendarId` | View | Calendar + dates |
| POST | `/api/v1/holidays/seed` | Manage | Seed UK holidays |
| POST | `/api/v1/holidays/:calendarId/dates` | Manage | Add holiday date |
| PATCH | `/api/v1/holidays/dates/:id` | Manage | Update holiday date |
| DELETE | `/api/v1/holidays/dates/:id` | Manage | Delete holiday date |

---

## 12. Notification Events

| Event | Trigger | Recipients |
|---|---|---|
| New application (Pending Manager Approval) | Submit leave | HR / admin group (`forAdmin: true`) |
| Draft submitted | Draft → submitted | HR / admin group |
| Auto-approved | `auto_approval = true` | Employee |
| Manager approved → Pending HR | Manager stage approved | HR / admin group |
| HR final approval | HR approves → Approved | Employee |
| Rejected (any stage) | Any rejection | Employee |
| Cancel | Leave cancelled | No notification |
| Holiday created | `createHolidayDate` | All employees with attendance permissions |
| Holiday updated | `updateHolidayDate` | Same |
| Holiday deleted | `deleteHolidayDate` | Same |
| Holiday reminder | Cron: upcoming holidays | Same |

---

## 13. Leave Type Settings — Enforcement Status

| Field | UI | DB | Enforced at apply-time |
|---|---|---|---|
| `name` | Yes | Yes | Yes — required, unique |
| `paid_or_unpaid` | Yes | Yes | Yes — Unpaid skips balance check |
| `annual_entitlement_days` | Yes | Yes | Yes — seeds and caps balance |
| `entitlement_label` | Yes | Yes | Display only (max 30 chars) |
| `accrual` | Yes | Yes | **No** — no accrual engine |
| `carry_forward_allowed` | Yes | Yes | Yes — enforced by carry-forward job |
| `max_carry_forward_days` | Yes | Yes | Yes — enforced by carry-forward job |
| `notice_period_required` | Yes | Yes | Yes — business-day aware check |
| `gender_restriction` | Yes | Yes | Yes — checks `emp.gender` |
| `loss_of_pay_rule` | Yes | Yes | **No** — returned in response but no deduction |
| `document_required` | Yes | Yes | Yes — 400 if doc missing |
| `document_mandatory_after_days` | Yes | Yes | **No** — no threshold comparison against `total_days` |
| `auto_approval` | Yes | Yes | Yes — immediate approval |
| `approver` | Yes | Yes | **No** — always routes Manager→Dept→HR regardless |
| `encashment_allowed` | Yes | Yes | **No** — no encashment endpoint |
| `applicable_departments` | Yes | Yes | **No** — not checked on apply |
| `applicable_designations` | Yes | Yes | **No** — not checked on apply |
| `applicable_employment_types` | Yes | Yes | **No** — not checked on apply |
| `probation_restriction` | Yes | Yes | Yes — checks `emp.probation_end_date` |
| `minimum_service_months` | Yes | Yes | Yes — checks `emp.join_date` (with day-rounding bug) |

---

## 14. Known Bugs & Gaps

| # | Severity | File:Line | Description |
|---|---|---|---|
| 1 | HIGH | `leave.service.js:621` | `processLeave` passes `user.id` (auth users table) as `actorId` instead of `user.employeeId` — wrong FK stored in `approved_by`, breaking "approved by" display |
| 2 | HIGH | `LeaveAbsence.jsx:170-182` | `liveBalance` is always null — `form.leaveType` is never set by the leave-type selector; client-side balance validation is dead code |
| 3 | HIGH | `leave_requests` table | Duplicate dept-approval columns: migration 101 adds `department_approved_by/at`; migration 109 adds `dept_approved_by/at/remarks`. The service only writes the `department_` variant; the `dept_` columns are never written |
| 4 | HIGH | `leave.routes.js:67` | `leaveTypeId` accepted as integer but `leave_types.id` is UUID — runtime type error if ID lookup path is used |
| 5 | MEDIUM | `leave.service.js:330-335` | Minimum service months calculation ignores day-of-month — employees can access leave up to 1 month early |
| 6 | MEDIUM | `LeaveSettings.jsx:499-508` | `entitlementLabel` textarea is labelled "Description" but has a 30-char server limit — user can silently exceed it |
| 7 | MEDIUM | `HolidaysSection.jsx:74-80` | Only `calendars[0]` is shown and edited — tenants with multiple calendars per year (seeded + manual) see only one |
| 8 | MEDIUM | `leave.service.js` | `approver` field on leave type is not read by the approval workflow — always routes Manager→Dept→HR |
| 9 | MEDIUM | `leave.service.js` | `document_mandatory_after_days` is stored and returned but never compared against `total_days` — the conditional document requirement does not work |
| 10 | MEDIUM | `leave.service.js` | `applicable_departments`, `applicable_designations`, `applicable_employment_types` are stored but not enforced at apply-time |
| 11 | MEDIUM | `leave.routes.js:86` | Cancel `reason` is optional on the API even though the UI requires it — admins bypassing UI can cancel without reason |
| 12 | MEDIUM | No file | `accrual` setting (`Monthly`/`Yearly`/`None`) is stored and shown in UI but no accrual engine exists |
| 13 | MEDIUM | No file | `encashment_allowed` is stored and shown in UI but no encashment endpoint or calculation exists |
| 14 | LOW | `leave.service.js` | `loss_of_pay_rule` is returned in the leave config response but no payroll deduction hook consumes it |
| 15 | INFO | `shifts` / `employee_shift_assignments` | Full schema exists and is used in attendance calculation, but no API exists to create or assign shifts — all employees use the default General Shift |
