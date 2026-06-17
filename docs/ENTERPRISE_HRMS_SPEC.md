# Enterprise HRMS Enhancement Specification

> **Version:** 1.0 — June 2026  
> **Baseline:** Existing HRIS codebase audit (see `ATTENDANCE_OVERTIME_REGULARIZATION.md`, `LEAVE_ABSENCE_HOLIDAY.md`, `PAYROLL.md`, `ADMIN_SETTINGS.md`, `ROLES_DEPARTMENTS_DESIGNATIONS.md`)

---

## Design Principles

1. **Reuse, don't replace.** The exit workflow engine (`exit_workflows`, `exit_workflow_stages`, `exit_approvals`) is already enterprise-grade with SLA, escalation, QUORUM/ANY/ALL/SEQUENTIAL modes, and checklist support. Every new approval workflow reuses this pattern, not a separate engine.
2. **Reuse the hierarchy.** All approver resolution uses `employees.reporting_manager_id`, `departments.manager_id`, and `rbac_roles` — exactly as they exist today.
3. **Extend, don't rewrite.** Every existing table gets migration-based additions. No table is dropped.
4. **Column-based → engine-based migration.** Attendance regularization, OT, and leave currently use hardcoded stage columns on their tables. These are migrated to the generic workflow engine while keeping the old columns for historical records.

---

## Table of Contents

- [Phase 1 — Enterprise Approval Engine](#phase-1--enterprise-approval-engine)
- [Phase 2 — Shift Management](#phase-2--shift-management)
- [Phase 3 — Attendance Enhancements](#phase-3--attendance-enhancements)
- [Phase 4 — Overtime Enhancements](#phase-4--overtime-enhancements)
- [Phase 5 — Leave Enhancements](#phase-5--leave-enhancements)
- [Phase 6 — Payroll Engine](#phase-6--payroll-engine)
- [Phase 7 — Audit & Compliance](#phase-7--audit--compliance)
- [Phase 8 — Dashboards](#phase-8--dashboards)
- [Migration Sequence](#migration-sequence)
- [API Reference — New Endpoints](#api-reference--new-endpoints)
- [Permission Slugs — New](#permission-slugs--new)

---

## Phase 1 — Enterprise Approval Engine

### 1.1 What Already Exists (Do Not Recreate)

The exit module already has a fully working workflow engine:

```
exit_workflows            → workflow template definitions (name, type, version, active)
exit_workflow_stages      → ordered stages (SLA, escalation, approval modes ANY/ALL/QUORUM/SEQUENTIAL)
exit_stage_departments    → which departments approve at a stage
exit_stage_roles          → which RBAC roles approve at a stage
exit_stage_users          → specific employees who approve at a stage
exit_approvals            → audit log of every action (approve/reject/comment/escalate/reassign)
exit_request_checklist_items → per-stage tasks
```

### 1.2 New Generic Workflow Tables

Create a **generic** approval engine that mirrors the exit pattern but applies to any module.

**Migration:** `200_create_approval_workflow_engine.sql`

```sql
-- Workflow template (generic version of exit_workflows)
CREATE TABLE approval_workflows (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(128) NOT NULL,
  module          VARCHAR(32) NOT NULL CHECK (module IN (
                    'attendance_regularization','overtime','leave',
                    'shift_change','payroll_run','expense','asset_request'
                  )),
  description     TEXT,
  is_active       BOOLEAN DEFAULT true,
  is_default      BOOLEAN DEFAULT false,  -- one default per module
  version         INTEGER DEFAULT 1,
  created_by      INTEGER REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (module, is_default) WHERE is_default = true
);

-- Approval stages (generic version of exit_workflow_stages)
CREATE TABLE approval_workflow_stages (
  id                          SERIAL PRIMARY KEY,
  workflow_id                 INTEGER NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
  stage_order                 INTEGER NOT NULL CHECK (stage_order BETWEEN 1 AND 10),
  name                        VARCHAR(64) NOT NULL,    -- 'Manager Approval', 'HR Review', etc.

  -- Who approves
  approver_type               VARCHAR(32) NOT NULL CHECK (approver_type IN (
                                'REPORTING_MANAGER','DEPARTMENT_HEAD','HR','PAYROLL',
                                'ROLE','SPECIFIC_EMPLOYEE','SKIP'
                              )),
  approver_role_id            INTEGER REFERENCES rbac_roles(id),     -- when type=ROLE
  approver_employee_id        INTEGER REFERENCES employees(id),      -- when type=SPECIFIC_EMPLOYEE

  -- How they approve
  approval_mode               VARCHAR(16) DEFAULT 'ANY' CHECK (approval_mode IN ('ANY','ALL','QUORUM','SEQUENTIAL')),
  quorum_count                INTEGER DEFAULT 1,

  -- Conditions (JSON rules engine)
  -- Example: {"field":"total_days","operator":">","value":5}
  -- If condition fails, this stage is SKIPPED
  condition                   JSONB,

  -- SLA
  sla_hours                   INTEGER,                 -- NULL = no SLA
  auto_action_on_sla_breach   VARCHAR(16) CHECK (auto_action_on_sla_breach IN ('APPROVE','REJECT','ESCALATE',NULL)),

  -- Escalation
  escalation_enabled          BOOLEAN DEFAULT false,
  escalation_after_hours      INTEGER,
  escalation_approver_type    VARCHAR(32),             -- same enum as approver_type
  escalation_role_id          INTEGER REFERENCES rbac_roles(id),
  escalation_employee_id      INTEGER REFERENCES employees(id),

  -- UX rules
  mandatory_comment           BOOLEAN DEFAULT false,
  allow_delegation            BOOLEAN DEFAULT true,

  is_active                   BOOLEAN DEFAULT true,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workflow_id, stage_order)
);

-- Running instances (one row per submitted request undergoing approval)
CREATE TABLE approval_requests (
  id                  SERIAL PRIMARY KEY,
  workflow_id         INTEGER NOT NULL REFERENCES approval_workflows(id),
  module              VARCHAR(32) NOT NULL,   -- mirrors approval_workflows.module
  entity_type         VARCHAR(64) NOT NULL,   -- 'attendance','leave_request','overtime', etc.
  entity_id           INTEGER NOT NULL,       -- FK to the actual record
  employee_id         INTEGER NOT NULL REFERENCES employees(id),
  current_stage_id    INTEGER REFERENCES approval_workflow_stages(id),
  status              VARCHAR(32) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','IN_PROGRESS','APPROVED','REJECTED','CANCELLED','WITHDRAWN')),
  initiated_by        INTEGER REFERENCES employees(id),
  submitted_at        TIMESTAMPTZ DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  rejection_reason    TEXT,
  metadata            JSONB,                  -- module-specific data snapshot at submission
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_requests_entity ON approval_requests(entity_type, entity_id);
CREATE INDEX idx_approval_requests_employee ON approval_requests(employee_id, status);
CREATE INDEX idx_approval_requests_stage ON approval_requests(current_stage_id, status);

-- Audit trail of every action (mirrors exit_approvals)
CREATE TABLE approval_actions (
  id                  SERIAL PRIMARY KEY,
  approval_request_id INTEGER NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  stage_id            INTEGER REFERENCES approval_workflow_stages(id),
  stage_order         INTEGER,
  actor_id            INTEGER REFERENCES employees(id),
  actor_name          VARCHAR(255),
  action              VARCHAR(32) NOT NULL CHECK (action IN (
                        'SUBMITTED','APPROVED','REJECTED','SENT_BACK',
                        'ESCALATED','DELEGATED','COMMENTED','AUTO_APPROVED',
                        'AUTO_REJECTED','SLA_BREACHED','WITHDRAWN','CANCELLED'
                      )),
  comments            TEXT,
  delegated_to_id     INTEGER REFERENCES employees(id),
  sla_due_at          TIMESTAMPTZ,
  is_sla_breached     BOOLEAN DEFAULT false,
  ip_address          VARCHAR(64),
  device_info         TEXT,
  metadata            JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_actions_request ON approval_actions(approval_request_id);
CREATE INDEX idx_approval_actions_actor ON approval_actions(actor_id, created_at DESC);

-- Delegation table (temporary reassignment while someone is on leave)
CREATE TABLE approval_delegations (
  id                  SERIAL PRIMARY KEY,
  delegator_id        INTEGER NOT NULL REFERENCES employees(id),
  delegate_id         INTEGER NOT NULL REFERENCES employees(id),
  module              VARCHAR(32),             -- NULL = all modules
  valid_from          DATE NOT NULL,
  valid_to            DATE NOT NULL,
  reason              TEXT,
  is_active           BOOLEAN DEFAULT true,
  created_by          INTEGER REFERENCES employees(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  CHECK (delegator_id != delegate_id),
  CHECK (valid_from <= valid_to)
);
```

### 1.3 Default Workflow Seed Data

On tenant creation, seed these default workflows (run after migration 200):

```sql
-- Regularization: Manager → Dept Head → HR (3-level default)
INSERT INTO approval_workflows (name, module, is_default) VALUES ('Default Regularization', 'attendance_regularization', true);
-- Stage 1: Reporting Manager (skip if none exists)
INSERT INTO approval_workflow_stages (workflow_id, stage_order, name, approver_type, sla_hours, auto_action_on_sla_breach)
  VALUES (1, 1, 'Manager Approval', 'REPORTING_MANAGER', 48, 'ESCALATE');
-- Stage 2: Department Head (conditional: only if department_id set)
INSERT INTO approval_workflow_stages (workflow_id, stage_order, name, approver_type, condition)
  VALUES (1, 2, 'Department Approval', 'DEPARTMENT_HEAD', '{"field":"employee.department_id","operator":"!=","value":null}');
-- Stage 3: HR (always present)
INSERT INTO approval_workflow_stages (workflow_id, stage_order, name, approver_type, mandatory_comment)
  VALUES (1, 3, 'HR Approval', 'HR', false);

-- Overtime: Manager → Dept Head → HR → Payroll (4-level)
-- With conditional: if overtime_hours > 5, add Payroll stage
INSERT INTO approval_workflows (name, module, is_default) VALUES ('Default Overtime', 'overtime', true);
-- ... similar stage inserts with condition on stage 4

-- Leave: Manager → HR (2-level default)
-- With conditional: leave > 5 days → add HR → Dept Head
INSERT INTO approval_workflows (name, module, is_default) VALUES ('Default Leave', 'leave', true);

-- Shift Change: Reporting Manager → HR
INSERT INTO approval_workflows (name, module, is_default) VALUES ('Default Shift Change', 'shift_change', true);
```

### 1.4 ApprovalEngine Service

**File:** `d:\HRIS_API\src\services\approvalEngine.service.js`

```
approvalEngine.submit(pool, { module, entityType, entityId, employeeId, initiatedBy, metadata, pool })
  → Finds default workflow for module
  → Creates approval_requests row
  → Evaluates stage conditions against the employee + entity data
  → Sets current_stage_id to first eligible stage
  → Inserts approval_actions with action='SUBMITTED'
  → Notifies first stage approver(s)
  → Returns { requestId, currentStage }

approvalEngine.act(pool, { requestId, actorId, action, comments, delegateTo, ip, device })
  → Validates actor is authorized for current stage
  → Checks delegation table
  → Inserts approval_actions row
  → Advances to next eligible stage (evaluating conditions)
  → If final stage → marks approval_requests.status = 'APPROVED'/'REJECTED'
  → Fires module-specific post-approval hook
  → Returns { newStatus, nextStage }

approvalEngine.canAct(pool, { requestId, actorId })
  → Resolves approver_type against actor's context (managedDepartmentId, rbacRoleId, scope)
  → Checks delegation
  → Returns { canAct: bool, reason }

approvalEngine.getHistory(pool, { entityType, entityId })
  → Returns approval_actions with stage, actor details, timestamps

approvalEngine.runSLACheck(pool)
  → Called by cron every hour
  → Finds requests where current stage sla_due_at < NOW() and is_sla_breached = false
  → Executes auto_action_on_sla_breach (approve/reject/escalate)
```

**Approver resolution in `resolveStageApprovers(pool, stage, employeeId)`:**

| `approver_type` | Resolved as |
|---|---|
| `REPORTING_MANAGER` | `employees.reporting_manager_id` of the requesting employee |
| `DEPARTMENT_HEAD` | `departments.manager_id` where `id = employee.department_id` |
| `HR` | All employees with `attendance.approve` or `leave.approve` permission AND `scope IN ('ALL','DEPARTMENT')` |
| `PAYROLL` | All employees with `payroll.manage` permission |
| `ROLE` | All employees with `rbac_role_id = stage.approver_role_id` |
| `SPECIFIC_EMPLOYEE` | `stage.approver_employee_id` |

If resolved list is empty, escalate to next higher type (e.g., no reporting manager → fall to DEPARTMENT_HEAD → HR).

### 1.5 Condition Engine

Conditions stored as JSONB on `approval_workflow_stages.condition`. Evaluated at submit time and at each stage transition:

```json
{ "operator": "AND", "rules": [
    { "field": "request.overtime_hours", "operator": ">", "value": 5 },
    { "field": "employee.employment_type", "operator": "IN", "value": ["Full-time","Part-time"] }
]}
```

Simple operators: `>`, `<`, `>=`, `<=`, `=`, `!=`, `IN`, `NOT_IN`, `IS_NULL`, `IS_NOT_NULL`  
Compound: `AND`, `OR`  
Field prefixes: `request.*` (entity fields), `employee.*` (submitter fields), `date.*` (current date)

### 1.6 Frontend — Workflow Configuration UI

**New Settings Tab:** Settings → Approval Workflows

**`WorkflowBuilder.jsx`** — drag-and-drop stage builder:
- Select module
- Add stages (1–10)
- Per stage: approver type dropdown, SLA hours, condition builder, escalation setup
- Preview workflow as a flowchart
- Save as named template
- Mark as default for module

**`ApprovalInbox.jsx`** — unified pending approvals across all modules:
- Tabs: All / Regularization / Overtime / Leave / Shift Change / Payroll
- Shows: requester, dates, hours/days, submitted at, SLA countdown
- Bulk approve/reject
- Comment field (mandatory if stage requires it)
- Delegation setup

---

## Phase 2 — Shift Management

### 2.1 DB Changes

**Migration:** `201_enhance_shift_management.sql`

```sql
-- Enhance existing shifts table
ALTER TABLE shifts
  ADD COLUMN code            VARCHAR(20) UNIQUE,
  ADD COLUMN description     TEXT,
  ADD COLUMN color           VARCHAR(7),         -- hex color for calendar UI
  ADD COLUMN work_days       VARCHAR(50) DEFAULT 'Mon,Tue,Wed,Thu,Fri',  -- applicable days
  ADD COLUMN effective_from  DATE,
  ADD COLUMN effective_to    DATE,
  ADD COLUMN created_by      INTEGER REFERENCES employees(id),
  ADD COLUMN updated_at      TIMESTAMPTZ DEFAULT NOW();

-- Rotational shift schedule (Week 1 → Morning, Week 2 → Evening, etc.)
CREATE TABLE shift_rotation_plans (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(128) NOT NULL,
  description     TEXT,
  cycle_weeks     INTEGER NOT NULL DEFAULT 2,    -- how many weeks before repeating
  is_active       BOOLEAN DEFAULT true,
  created_by      INTEGER REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shift_rotation_slots (
  id              SERIAL PRIMARY KEY,
  plan_id         INTEGER NOT NULL REFERENCES shift_rotation_plans(id) ON DELETE CASCADE,
  week_number     INTEGER NOT NULL,              -- 1-based
  shift_id        INTEGER NOT NULL REFERENCES shifts(id),
  UNIQUE (plan_id, week_number)
);

-- Enhance employee_shift_assignments
ALTER TABLE employee_shift_assignments
  ADD COLUMN assigned_by         INTEGER REFERENCES employees(id),
  ADD COLUMN assignment_reason   TEXT,
  ADD COLUMN rotation_plan_id    INTEGER REFERENCES shift_rotation_plans(id),
  ADD COLUMN rotation_start_date DATE;           -- anchor date for rotation cycle calc

-- Shift change request (goes through approval engine)
CREATE TABLE shift_change_requests (
  id                    SERIAL PRIMARY KEY,
  employee_id           INTEGER NOT NULL REFERENCES employees(id),
  current_shift_id      INTEGER REFERENCES shifts(id),
  requested_shift_id    INTEGER NOT NULL REFERENCES shifts(id),
  effective_date        DATE NOT NULL,
  reason                TEXT NOT NULL,
  swap_with_employee_id INTEGER REFERENCES employees(id),  -- for shift swap
  approval_request_id   INTEGER REFERENCES approval_requests(id),
  status                VARCHAR(32) DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
  approved_shift_id     INTEGER REFERENCES shifts(id),    -- what was actually approved
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Shift audit history
CREATE TABLE shift_audit_log (
  id              SERIAL PRIMARY KEY,
  employee_id     INTEGER NOT NULL REFERENCES employees(id),
  shift_id        INTEGER REFERENCES shifts(id),
  action          VARCHAR(32) NOT NULL CHECK (action IN ('ASSIGNED','REMOVED','CHANGED','SWAP_REQUESTED','SWAP_APPROVED')),
  old_shift_id    INTEGER REFERENCES shifts(id),
  new_shift_id    INTEGER REFERENCES shifts(id),
  effective_from  DATE,
  effective_to    DATE,
  performed_by    INTEGER REFERENCES employees(id),
  reason          TEXT,
  ip_address      VARCHAR(64),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 API Endpoints

**Base path:** `/api/shifts`  
**Permission:** `shift.manage` (new slug) for write, `shift.view` for read

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/shifts` | List all active shifts (paginated, filterable by type) |
| POST | `/api/shifts` | Create shift |
| GET | `/api/shifts/:id` | Get shift detail |
| PUT | `/api/shifts/:id` | Update shift |
| DELETE | `/api/shifts/:id` | Soft-delete shift |
| GET | `/api/shifts/export` | Export shifts to Excel |
| GET | `/api/shifts/rotation-plans` | List rotation plans |
| POST | `/api/shifts/rotation-plans` | Create rotation plan |
| PUT | `/api/shifts/rotation-plans/:id` | Update rotation plan |
| DELETE | `/api/shifts/rotation-plans/:id` | Delete rotation plan |
| POST | `/api/shifts/assign` | Assign shift to employee(s) — bulk supported via `employeeIds[]` |
| POST | `/api/shifts/assign/department` | Assign shift to all employees in a department |
| POST | `/api/shifts/assign/designation` | Assign shift to all employees with a designation |
| GET | `/api/shifts/assignments` | List shift assignments (filterable by employee, department, date range) |
| GET | `/api/shifts/assignments/:employeeId` | All assignments for one employee |
| DELETE | `/api/shifts/assignments/:id` | Remove assignment |
| GET | `/api/shifts/calendar` | Monthly shift roster (returns employee → date → shift_name mapping) |
| GET | `/api/shifts/calendar/:employeeId` | One employee's monthly calendar |
| POST | `/api/shifts/change-request` | Submit shift change request |
| GET | `/api/shifts/change-requests` | List shift change requests (scope-filtered) |
| GET | `/api/shifts/change-requests/pending` | Pending approvals for current user |
| PATCH | `/api/shifts/change-requests/:id/act` | Approve / reject shift change |
| GET | `/api/shifts/history/:employeeId` | Full shift audit trail for employee |

### 2.3 Shift Resolution Logic (Updated)

`getEmployeeShift(pool, employeeId, date)` — enhanced priority:

1. Check `employee_shift_assignments` for this employee + date range (most specific, highest priority).
2. If `rotation_plan_id` is set on the assignment: compute week number from `(date - rotation_start_date) / 7` modulo `cycle_weeks`, look up `shift_rotation_slots`.
3. If no employee-specific assignment: check department-level assignment (`shift_department_assignments` — see bulk assign endpoint creating these).
4. If no department assignment: check designation-level assignment.
5. Fallback: first active shift in `shifts` (General Shift seed).

### 2.4 Frontend Components

**`ShiftMaster.jsx`** — Settings → Shifts tab (new):
- Shift list with type filter (General / Morning / Evening / Night / Flexible / Rotational)
- Create/Edit modal: all fields (name, code, type, start/end, break, grace, minimum hours, OT threshold, night shift toggle, work days checkboxes, color picker)
- Shift preview: shows effective work window as a timeline bar

**`ShiftAssignment.jsx`** — HR → Shifts → Assignment:
- Employee search + filter by department / designation / location
- Assign shift + effective date
- Bulk selection (checkbox table) → bulk assign
- Rotation plan selector (if shift type = Rotational)

**`ShiftCalendar.jsx`** — HR → Shifts → Roster:
- Monthly grid: rows = employees, columns = dates
- Color-coded by shift
- Click cell to view/edit assignment
- Export as PDF/Excel

**`ShiftChangeRequests.jsx`** — HR → Shifts → Change Requests:
- Table of pending/history requests
- Approve / Reject with comment
- Swap request shows both employees' current shifts

---

## Phase 3 — Attendance Enhancements

### 3.1 DB Changes

**Migration:** `202_enhance_attendance.sql`

```sql
-- Enhance attendance table with new sources and statuses
ALTER TABLE attendance
  ADD COLUMN punch_source     VARCHAR(32) CHECK (punch_source IN (
                                'WEB','MOBILE','BIOMETRIC','FACE','QR','GPS','MANUAL','SYSTEM'
                              )),
  ADD COLUMN geo_fence_status VARCHAR(16) CHECK (geo_fence_status IN ('INSIDE','OUTSIDE','UNKNOWN',NULL)),
  ADD COLUMN qr_code_id       VARCHAR(64),
  ADD COLUMN face_confidence  NUMERIC(5,2),        -- 0-100 for face recognition
  ADD COLUMN approval_request_id INTEGER REFERENCES approval_requests(id);  -- links to engine

-- New statuses for attendance (extend CHECK constraint)
-- Add: 'On Duty', 'Missing Punch', 'Week Off' (Weekend renamed)
-- Existing: Present, Absent, Half Day, Late, On Leave, Holiday, Remote, Work From Home, Field Duty

-- Regularization request type (what kind of correction is requested)
ALTER TABLE attendance
  ADD COLUMN regularization_type VARCHAR(32) CHECK (regularization_type IN (
    'MISSED_CHECK_IN','MISSED_CHECK_OUT','WRONG_PUNCH',
    'BIOMETRIC_FAILURE','FIELD_VISIT','ATTENDANCE_CORRECTION'
  ));

-- Geofencing zones
CREATE TABLE geo_fence_zones (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  latitude        NUMERIC(10,8) NOT NULL,
  longitude       NUMERIC(11,8) NOT NULL,
  radius_meters   INTEGER NOT NULL DEFAULT 200,
  is_active       BOOLEAN DEFAULT true,
  location_name   VARCHAR(100),
  created_by      INTEGER REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- QR code sessions (for QR attendance)
CREATE TABLE qr_attendance_codes (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(64) UNIQUE NOT NULL,
  location_name   VARCHAR(100),
  geo_fence_id    INTEGER REFERENCES geo_fence_zones(id),
  valid_from      TIMESTAMPTZ NOT NULL,
  valid_to        TIMESTAMPTZ NOT NULL,
  max_uses        INTEGER,
  use_count       INTEGER DEFAULT 0,
  created_by      INTEGER REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly attendance lock (replaces per-row is_closed)
CREATE TABLE attendance_period_locks (
  id              SERIAL PRIMARY KEY,
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  locked_at       TIMESTAMPTZ,
  locked_by       INTEGER REFERENCES employees(id),
  is_locked       BOOLEAN DEFAULT false,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (year, month)
);
```

### 3.2 New Attendance Statuses

| Status | When Set |
|---|---|
| `Present` | Worked ≥ min_hours, not late |
| `Late` | Check-in after grace window |
| `Half Day` | Worked < half_day_threshold |
| `Absent` | No punch, not on leave/holiday/weekend |
| `On Leave` | Approved leave_request exists |
| `Holiday` | Holiday in calendar matches date |
| `Week Off` | Day not in work_week_days (was `Weekend`) |
| `Work From Home` | work_mode = WFH |
| `On Duty` | work_mode = Field Duty |
| `Missing Punch` | Check-in exists but no check-out by EOD |
| `Remote` | work_mode = Remote |

### 3.3 Punch Sources

| Source | How it works |
|---|---|
| `WEB` | Browser portal check-in (current) |
| `MOBILE` | Mobile app — captures GPS coordinates |
| `BIOMETRIC` | Hardware device pushes to API endpoint `POST /api/attendance/biometric-push` |
| `FACE` | Face recognition — sends `face_confidence` score |
| `QR` | Employee scans QR code at location — `POST /api/attendance/qr-checkin` with `code` param |
| `GPS` | Passive location check (no QR) — compares against geo_fence_zones |
| `MANUAL` | Admin override |
| `SYSTEM` | Cron-set (absent marking, missing punch) |

### 3.4 Regularization — Engine Migration

Replace the current column-based regularization with the approval engine:

- On `POST /api/attendance/regularization` → call `approvalEngine.submit()` with module `'attendance_regularization'`
- `approval_request_id` written back to `attendance.approval_request_id`
- The `reg_current_stage`, `manager_approval_status`, etc. columns remain for historical rows
- New rows use engine; old rows keep working via existing `attendanceAuth.service.js`

New `regularization_type` field enables type-specific routing:
- `BIOMETRIC_FAILURE` can auto-approve if `regularization_auto_approve_enabled = true`
- `FIELD_VISIT` requires supporting document

### 3.5 Monthly Lock

Replace per-row `is_closed` with `attendance_period_locks`:
- `POST /api/attendance/lock` — lock a month (HR/Admin only)
- `GET /api/attendance/locks` — list lock status by month
- `DELETE /api/attendance/lock/:year/:month` — unlock (admin only)
- Attendance writes check: `SELECT is_locked FROM attendance_period_locks WHERE year=$1 AND month=$2`

---

## Phase 4 — Overtime Enhancements

### 4.1 DB Changes

**Migration:** `203_enhance_overtime.sql`

```sql
-- Add payroll integration fields and multiplier variants
ALTER TABLE attendance
  ADD COLUMN ot_holiday_multiplier   NUMERIC(4,2),    -- OT on holidays
  ADD COLUMN ot_weekend_multiplier   NUMERIC(4,2),    -- OT on weekends
  ADD COLUMN ot_pay_amount           NUMERIC(10,2),   -- calculated pay (from payroll engine)
  ADD COLUMN ot_payroll_run_id       INTEGER,         -- FK to payroll_runs (set in Phase 6)
  ADD COLUMN ot_payroll_processed    BOOLEAN DEFAULT false;

-- Add new settings columns to attendance_settings
ALTER TABLE attendance_settings
  ADD COLUMN overtime_holiday_multiplier   NUMERIC(4,2) DEFAULT 2.0,
  ADD COLUMN overtime_weekend_multiplier   NUMERIC(4,2) DEFAULT 1.5,
  ADD COLUMN overtime_comp_off_eligible    BOOLEAN DEFAULT false,
  ADD COLUMN overtime_payroll_auto_feed    BOOLEAN DEFAULT true;   -- auto-push to payroll
```

### 4.2 Overtime Multiplier Logic (Updated)

```
if date is a Holiday → apply overtime_holiday_multiplier
else if date is a Week Off (weekend) → apply overtime_weekend_multiplier
else → apply overtime_custom_multiplier (base setting)
```

Calculation runs in `attendanceOvertime.service.js` after checkout.

### 4.3 Payroll Feed

When OT is finally approved (HR/Payroll stage final action):
- `ot_payroll_processed = false` initially
- Payroll engine reads all `ot_payroll_processed = false AND overtime_status = 'Approved'` rows for a pay period
- Computes `ot_pay_amount = overtime_hours × hourly_rate × multiplier`
- Sets `ot_payroll_processed = true`, `ot_payroll_run_id = <run.id>`

### 4.4 OT Workflow (4-Level via Engine)

Default OT workflow seeded with conditions:

```
Stage 1 — Reporting Manager (always)
Stage 2 — Department Head (condition: employee.department_id IS NOT NULL)
Stage 3 — HR (always)
Stage 4 — Payroll (condition: request.overtime_hours > 5)
```

---

## Phase 5 — Leave Enhancements

### 5.1 DB Changes

**Migration:** `204_enhance_leave.sql`

```sql
-- Add approval engine link to leave_requests
ALTER TABLE leave_requests
  ADD COLUMN approval_request_id   INTEGER REFERENCES approval_requests(id);

-- Monthly accrual tracking
CREATE TABLE leave_accrual_ledger (
  id                  SERIAL PRIMARY KEY,
  employee_id         INTEGER NOT NULL REFERENCES employees(id),
  leave_type          VARCHAR(100) NOT NULL,
  year                INTEGER NOT NULL,
  month               INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  accrued_days        NUMERIC(5,2) NOT NULL,     -- e.g. 1.75 for 21/12
  source              VARCHAR(16) DEFAULT 'CRON' CHECK (source IN ('CRON','MANUAL','CARRY_FORWARD','ADJUSTMENT')),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (employee_id, leave_type, year, month)
);

-- Leave encashment records
CREATE TABLE leave_encashment_requests (
  id                  SERIAL PRIMARY KEY,
  employee_id         INTEGER NOT NULL REFERENCES employees(id),
  leave_type          VARCHAR(100) NOT NULL,
  days_to_encash      INTEGER NOT NULL,
  encashment_amount   NUMERIC(10,2),             -- calculated from salary
  year                INTEGER NOT NULL,
  status              VARCHAR(32) DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','APPROVED','REJECTED','PROCESSED')),
  approval_request_id INTEGER REFERENCES approval_requests(id),
  payroll_run_id      INTEGER,                    -- set when processed in payroll
  processed_at        TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Leave restriction enforcement (previously dead)
-- applicable_departments, applicable_designations, applicable_employment_types
-- are already JSONB columns on leave_types — just needs enforcement in service

-- Compensatory off ledger (earn comp-off from OT, spend as leave)
CREATE TABLE comp_off_ledger (
  id                  SERIAL PRIMARY KEY,
  employee_id         INTEGER NOT NULL REFERENCES employees(id),
  source_attendance_id INTEGER REFERENCES attendance(id),   -- the OT record that earned it
  days_earned         NUMERIC(5,2) NOT NULL,
  days_used           NUMERIC(5,2) DEFAULT 0,
  expiry_date         DATE,
  status              VARCHAR(16) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','USED','EXPIRED')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Accrual Engine

**Monthly cron** (`leaveAccrual.cron.js`) — runs on the 1st of each month:

```
for each active tenant:
  for each active leave_type where accrual IN ('Monthly', 'Yearly'):
    for each active employee:
      accrual_days = annual_entitlement_days / 12   (for Monthly)
      OR annual_entitlement_days / 1               (for Yearly — only on Jan 1)
      
      INSERT INTO leave_accrual_ledger (employee_id, leave_type, year, month, accrued_days)
      ON CONFLICT DO NOTHING   -- idempotent
      
      UPDATE leave_balances SET total_allocated = total_allocated + accrual_days
      WHERE employee_id = emp.id AND leave_type = type.name AND year = current_year
```

Balances are no longer seeded entirely upfront from `annual_entitlement_days`. For Monthly accrual types, the balance starts at 0 and grows 1/12th each month. For Yearly types, the full balance is seeded on Jan 1 (existing behavior retained for `accrual='None'`).

### 5.3 Leave Encashment

**Endpoint:** `POST /api/v1/leave/encashment`

- Body: `{ employee_id, leave_type, days_to_encash, year }`
- Validates: `encashment_allowed = true` on the leave type
- Checks available balance: `total_allocated - used - days_to_encash >= 0`
- Calculates `encashment_amount = (net_salary / 26) × days_to_encash` (using `employee_salaries.net_salary`)
- Submits to approval engine (module: `leave`) with 1-stage HR approval
- On approval: deducts balance, sets `payroll_run_id` when included in next payroll run

### 5.4 Restriction Enforcement (NOW LIVE)

Previously dead fields now enforced in `applyLeave()`:

```js
// applicable_departments (JSONB array of dept names)
if (leaveType.applicableDepartments?.length > 0) {
  if (!leaveType.applicableDepartments.includes(employee.department)) {
    throw ApiError.forbidden('Your department is not eligible for this leave type');
  }
}

// applicable_designations
if (leaveType.applicableDesignations?.length > 0) {
  if (!leaveType.applicableDesignations.includes(employee.job_title)) {
    throw ApiError.forbidden('Your designation is not eligible for this leave type');
  }
}

// applicable_employment_types
if (leaveType.applicableEmploymentTypes?.length > 0) {
  if (!leaveType.applicableEmploymentTypes.includes(employee.employment_type)) {
    throw ApiError.forbidden('Your employment type is not eligible for this leave type');
  }
}
```

### 5.5 document_mandatory_after_days Enforcement (NOW LIVE)

```js
if (!data.supportingDocumentUrl && leaveType.documentMandatoryAfterDays > 0) {
  if (totalDays > leaveType.documentMandatoryAfterDays) {
    throw ApiError.badRequest(`Document required for leave exceeding ${leaveType.documentMandatoryAfterDays} days`);
  }
}
```

### 5.6 Conditional Workflow (Leave > 5 Days)

Using the approval engine condition:

```json
Stage 3 condition: { "field": "request.total_days", "operator": ">", "value": 5 }
Stage 3 approver_type: "DEPARTMENT_HEAD"
```

This means: if leave ≤ 5 days → Manager → HR. If leave > 5 days → Manager → HR → Dept Head.

### 5.7 Leave Calendar & Team Calendar

**`GET /api/v1/leave/calendar`** — returns JSON suitable for a monthly calendar:

```json
{
  "month": 6, "year": 2026,
  "days": [
    { "date": "2026-06-10", "type": "holiday", "name": "King's Birthday" },
    { "date": "2026-06-14", "type": "weekend" }
  ],
  "leaves": [
    { "employee_id": 12, "employee_name": "Alice", "from_date": "2026-06-16", "to_date": "2026-06-18", "leave_type": "Annual Leave", "status": "Approved" }
  ]
}
```

Query params: `year`, `month`, `employeeId` (self or scope-filtered), `includeTeam=true`

**`GET /api/v1/leave/team-calendar`** — same shape but scoped to all direct reports of the authenticated user.

---

## Phase 6 — Payroll Engine

### 6.1 DB Schema

**Migration:** `205_payroll_engine.sql`

```sql
-- Payroll component definitions (named salary components per tenant)
CREATE TABLE salary_components (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  code            VARCHAR(20) UNIQUE NOT NULL,    -- 'BASIC', 'HRA', 'PF', 'TDS' etc.
  component_type  VARCHAR(20) NOT NULL CHECK (component_type IN ('EARNING','DEDUCTION','EMPLOYER_CONTRIBUTION')),
  category        VARCHAR(50),                   -- 'Fixed','Variable','Statutory'
  calculation_type VARCHAR(20) NOT NULL CHECK (calculation_type IN (
                    'FIXED','PERCENTAGE_OF_BASIC','PERCENTAGE_OF_GROSS','FORMULA','STATUTORY'
                  )),
  formula         TEXT,                          -- for FORMULA type: 'BASIC * 0.12'
  percentage      NUMERIC(5,2),                  -- for PERCENTAGE types
  is_taxable      BOOLEAN DEFAULT true,
  is_statutory    BOOLEAN DEFAULT false,         -- PF, ESI, PT, TDS
  statutory_code  VARCHAR(20),                   -- 'PF','ESI','PT','TDS'
  is_active       BOOLEAN DEFAULT true,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Default components seeded per tenant:
-- EARNINGS: Basic (FIXED), HRA (40% of Basic), Conveyance (FIXED), Special Allowance (FIXED),
--           Bonus (FIXED/Variable), Incentive (FIXED), Overtime (computed from attendance)
-- DEDUCTIONS: PF (12% of Basic, STATUTORY), ESI (0.75% of Gross, STATUTORY),
--             PT (STATUTORY, slab-based), TDS (STATUTORY, formula), Loan Recovery (FIXED), LOP (computed)

-- Salary structure templates
CREATE TABLE salary_structures (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  code            VARCHAR(20) UNIQUE NOT NULL,
  basis           VARCHAR(20) CHECK (basis IN ('DEPARTMENT','DESIGNATION','EMPLOYEE','GRADE')),
  basis_value     VARCHAR(255),                  -- dept name / designation name / grade
  description     TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_by      INTEGER REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Components in a structure (with per-structure overrides)
CREATE TABLE salary_structure_components (
  id                  SERIAL PRIMARY KEY,
  structure_id        INTEGER NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
  component_id        INTEGER NOT NULL REFERENCES salary_components(id),
  amount              NUMERIC(10,2),             -- overrides component default
  percentage          NUMERIC(5,2),              -- overrides component default
  calculation_type    VARCHAR(20),               -- overrides component default
  is_active           BOOLEAN DEFAULT true,
  UNIQUE (structure_id, component_id)
);

-- Employee salary assignment (replaces/extends employee_salaries)
ALTER TABLE employee_salaries
  ADD COLUMN structure_id       INTEGER REFERENCES salary_structures(id),
  ADD COLUMN basic_salary       NUMERIC(10,2),
  ADD COLUMN gross_salary       NUMERIC(10,2),   -- computed on save
  ADD COLUMN effective_from     DATE,
  ADD COLUMN effective_to       DATE,
  ADD COLUMN revised_by         INTEGER REFERENCES employees(id),
  ADD COLUMN revision_reason    TEXT;

-- Salary revision history
CREATE TABLE employee_salary_revisions (
  id              SERIAL PRIMARY KEY,
  employee_id     INTEGER NOT NULL REFERENCES employees(id),
  structure_id    INTEGER REFERENCES salary_structures(id),
  old_basic        NUMERIC(10,2),
  new_basic        NUMERIC(10,2),
  old_gross        NUMERIC(10,2),
  new_gross        NUMERIC(10,2),
  effective_date   DATE NOT NULL,
  reason           TEXT,
  revised_by       INTEGER REFERENCES employees(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Pay periods (monthly cycles)
CREATE TABLE pay_periods (
  id              SERIAL PRIMARY KEY,
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  status          VARCHAR(16) DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN','PROCESSING','DRAFT','REVIEW','APPROVED','LOCKED','PAID')),
  attendance_locked BOOLEAN DEFAULT false,
  payroll_run_id  INTEGER,                       -- set when run is created
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (year, month)
);

-- Payroll runs
CREATE TABLE payroll_runs (
  id                    SERIAL PRIMARY KEY,
  pay_period_id         INTEGER NOT NULL REFERENCES pay_periods(id),
  name                  VARCHAR(100) NOT NULL,   -- 'June 2026 Payroll'
  status                VARCHAR(16) DEFAULT 'DRAFT'
                          CHECK (status IN ('DRAFT','REVIEW','APPROVED','LOCKED','PAID')),
  total_employees       INTEGER DEFAULT 0,
  total_gross           NUMERIC(12,2) DEFAULT 0,
  total_deductions      NUMERIC(12,2) DEFAULT 0,
  total_net             NUMERIC(12,2) DEFAULT 0,
  total_employer_cost   NUMERIC(12,2) DEFAULT 0,
  generated_by          INTEGER REFERENCES employees(id),
  generated_at          TIMESTAMPTZ,
  approved_by           INTEGER REFERENCES employees(id),
  approved_at           TIMESTAMPTZ,
  locked_by             INTEGER REFERENCES employees(id),
  locked_at             TIMESTAMPTZ,
  paid_by               INTEGER REFERENCES employees(id),
  paid_at               TIMESTAMPTZ,
  approval_request_id   INTEGER REFERENCES approval_requests(id),
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Employee payslip records (one row per employee per run)
CREATE TABLE payslips (
  id                      SERIAL PRIMARY KEY,
  payroll_run_id          INTEGER NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id             INTEGER NOT NULL REFERENCES employees(id),
  pay_period_id           INTEGER NOT NULL REFERENCES pay_periods(id),

  -- Salary inputs
  basic_salary            NUMERIC(10,2) NOT NULL,
  gross_salary            NUMERIC(10,2) NOT NULL,
  structure_id            INTEGER REFERENCES salary_structures(id),

  -- Attendance inputs (pulled from attendance for the period)
  working_days            INTEGER NOT NULL,
  payable_days            INTEGER NOT NULL,
  present_days            INTEGER NOT NULL,
  absent_days             INTEGER NOT NULL,
  late_days               INTEGER NOT NULL,
  leave_days              INTEGER NOT NULL,
  holiday_count           INTEGER NOT NULL,
  lop_days                NUMERIC(5,2) DEFAULT 0,

  -- OT
  overtime_hours          NUMERIC(6,2) DEFAULT 0,
  overtime_amount         NUMERIC(10,2) DEFAULT 0,

  -- Computed totals
  earnings_breakdown      JSONB NOT NULL DEFAULT '{}',  -- {component_name: amount}
  deductions_breakdown    JSONB NOT NULL DEFAULT '{}',
  employer_contributions  JSONB NOT NULL DEFAULT '{}',
  total_earnings          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_deductions        NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_pay                 NUMERIC(10,2) NOT NULL DEFAULT 0,
  employer_pf_contribution NUMERIC(10,2) DEFAULT 0,
  employer_esi_contribution NUMERIC(10,2) DEFAULT 0,

  -- Payslip file
  pdf_url                 VARCHAR(500),
  pdf_generated_at        TIMESTAMPTZ,

  -- Status
  status                  VARCHAR(16) DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT','FINALIZED','SENT')),
  sent_at                 TIMESTAMPTZ,
  sent_by                 INTEGER REFERENCES employees(id),

  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (payroll_run_id, employee_id)
);

-- LOP deduction log
CREATE TABLE lop_records (
  id                SERIAL PRIMARY KEY,
  payslip_id        INTEGER NOT NULL REFERENCES payslips(id),
  employee_id       INTEGER NOT NULL REFERENCES employees(id),
  pay_period_id     INTEGER NOT NULL REFERENCES pay_periods(id),
  absent_days       NUMERIC(5,2) DEFAULT 0,
  unpaid_leave_days NUMERIC(5,2) DEFAULT 0,
  total_lop_days    NUMERIC(5,2) NOT NULL,
  daily_rate        NUMERIC(10,2) NOT NULL,    -- basic / working_days_in_month
  lop_amount        NUMERIC(10,2) NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Payroll Run Flow

```
1. DRAFT
   POST /api/v1/payroll/runs
   → Creates payroll_run (status=DRAFT)
   → Fetches all active employees
   → For each employee:
       a. Loads salary structure + components
       b. Pulls attendance summary for the pay period
       c. Calculates LOP days (absent + unpaid leave)
       d. Pulls approved OT hours + amount
       e. Computes earnings_breakdown (each component)
       f. Computes deductions_breakdown (each deduction including LOP)
       g. Writes payslip row (status=DRAFT)
   → Updates payroll_run totals

2. REVIEW
   PUT /api/v1/payroll/runs/:id/status → 'REVIEW'
   → HR reviews individual payslips
   → Can override individual components
   → Can add ad-hoc earning/deduction items

3. APPROVED
   POST /api/v1/payroll/runs/:id/approve
   → Submits to approval engine (module: 'payroll_run')
   → Approval workflow: HR → Payroll Manager
   → On approval → status = 'APPROVED'

4. LOCKED
   PUT /api/v1/payroll/runs/:id/status → 'LOCKED'
   → Generates PDF payslips for all employees
   → Sets payslips.status = 'FINALIZED'
   → Marks OT records as payroll_processed = true
   → Deducts encashment from leave balances

5. PAID
   PUT /api/v1/payroll/runs/:id/status → 'PAID'
   → Marks run as paid
   → Sends payslip emails to employees
```

### 6.3 LOP Engine

`lopEngine.calculateLOP(pool, { employeeId, payPeriodId })`:

```
1. Count attendance.status = 'Absent' AND date IN pay_period range
2. Count leave_requests WHERE status = 'Approved' AND leave_type.paid_or_unpaid = 'Unpaid'
   AND from_date <= period.end_date AND to_date >= period.start_date
   (cap total_days overlap to period)
3. total_lop_days = absent_days + unpaid_leave_days
4. daily_rate = employee.basic_salary / working_days_in_month
   (working_days_in_month from count of non-weekend, non-holiday days in period)
5. lop_amount = total_lop_days × daily_rate
6. INSERT INTO lop_records
7. Return lop_amount → subtracted from gross in payslip computation
```

### 6.4 Payslip PDF

**`payslip.pdf.service.js`** using `pdfkit` or `puppeteer`:

Sections:
1. **Header** — Company logo, name, address
2. **Employee Details** — Name, emp_id, department, designation, PAN, bank account
3. **Pay Period** — Month/Year, working days, payable days
4. **Attendance Summary** — Present, Absent, Late, Leave, LOP days
5. **Earnings** — Component-wise breakdown (Basic, HRA, Allowances, OT) → Total Earnings
6. **Deductions** — PF, ESI, PT, TDS, LOP, Loan Recovery → Total Deductions
7. **Net Pay** — Total Earnings − Total Deductions (highlighted)
8. **Employer Contribution** — EPF + ESI (informational)
9. **Footer** — "Computer generated payslip. Signature not required."

### 6.5 Payroll API

**Base path:** `/api/v1/payroll`  
**Permission:** `payroll.view` (read), `payroll.manage` (write/run)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/salary-components` | List all components |
| POST | `/salary-components` | Create component |
| PUT | `/salary-components/:id` | Update component |
| DELETE | `/salary-components/:id` | Delete (soft) |
| GET | `/salary-structures` | List structures |
| POST | `/salary-structures` | Create structure |
| PUT | `/salary-structures/:id` | Update structure + components |
| DELETE | `/salary-structures/:id` | Delete structure |
| GET | `/employees/:empId/salary` | Get employee's current salary |
| PUT | `/employees/:empId/salary` | Assign/update salary |
| GET | `/employees/:empId/salary-history` | All revisions |
| GET | `/pay-periods` | List pay periods |
| POST | `/pay-periods` | Create pay period |
| PUT | `/pay-periods/:id/lock-attendance` | Lock attendance for period |
| GET | `/runs` | List payroll runs |
| POST | `/runs` | Create/generate run (DRAFT) |
| GET | `/runs/:id` | Run detail + totals |
| PUT | `/runs/:id/status` | Advance run status |
| POST | `/runs/:id/approve` | Submit for approval |
| GET | `/runs/:id/payslips` | All payslips for a run |
| GET | `/runs/:id/payslips/:empId` | Individual payslip |
| PUT | `/runs/:id/payslips/:empId` | Override individual payslip components |
| POST | `/runs/:id/generate-pdfs` | Generate all payslip PDFs |
| POST | `/runs/:id/send-payslips` | Email payslips to employees |
| GET | `/payslips/my` | Employee's own payslip history |
| GET | `/runs/:id/reports/register` | Payroll Register (all employees) |
| GET | `/runs/:id/reports/bank` | Bank Transfer Report |
| GET | `/runs/:id/reports/pf` | PF Report |
| GET | `/runs/:id/reports/esi` | ESI Report |
| GET | `/runs/:id/reports/tds` | TDS Report |
| GET | `/runs/:id/export/excel` | Full payroll Excel export |
| GET | `/encashment/requests` | Leave encashment requests |
| POST | `/encashment/requests` | Request encashment |
| GET | `/lop/:empId/:year/:month` | LOP breakdown for employee |

---

## Phase 7 — Audit & Compliance

### 7.1 Centralized Audit Log

**Migration:** `206_centralized_audit_log.sql`

```sql
CREATE TABLE audit_log (
  id              BIGSERIAL PRIMARY KEY,
  tenant_id       VARCHAR(50) NOT NULL,          -- for cross-tenant queries at superadmin level
  module          VARCHAR(50) NOT NULL,           -- 'attendance','leave','payroll','shift',etc.
  entity_type     VARCHAR(64) NOT NULL,
  entity_id       VARCHAR(64) NOT NULL,           -- string to support UUID and integer
  action          VARCHAR(32) NOT NULL,           -- 'CREATE','UPDATE','DELETE','APPROVE','REJECT','LOGIN','EXPORT'
  actor_id        INTEGER REFERENCES employees(id),
  actor_name      VARCHAR(255),
  actor_role      VARCHAR(64),
  old_value       JSONB,
  new_value       JSONB,
  changed_fields  TEXT[],                         -- list of field names that changed
  ip_address      VARCHAR(64),
  device_info     TEXT,
  user_agent      TEXT,
  session_id      VARCHAR(64),
  comments        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_module_entity ON audit_log(module, entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_log(actor_id, created_at DESC);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
```

### 7.2 Audit Service

`auditLog.service.js`:

```js
auditLog.record(pool, {
  module,        // 'attendance'
  entityType,    // 'attendance_regularization'
  entityId,      // record ID
  action,        // 'APPROVE'
  actorId,
  actorName,
  actorRole,
  oldValue,      // snapshot before change
  newValue,      // snapshot after change
  ip,
  device,
  comments
})
```

All service functions that modify records call `auditLog.record()` as the last step (inside the same transaction).

### 7.3 Audit Log API

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/audit-log` | `audit.view` | Query logs (filters: module, entity_type, entity_id, actor_id, action, date range) |
| GET | `/api/v1/audit-log/export` | `audit.view` | Export filtered audit log to Excel |

Frontend: **Settings → Audit Logs** (replace current placeholder).

---

## Phase 8 — Dashboards

### 8.1 Attendance Dashboard (Enhanced)

**Current** (`/api/attendance/dashboard`): Returns 7-day trend, dept breakdown, KPI cards, late list, missing checkouts.

**Add to response:**
- `punch_source_breakdown`: `{ WEB: n, MOBILE: n, BIOMETRIC: n, QR: n }`
- `trend_vs_yesterday`: real delta (replace hardcoded +12%)
- `missing_punch_count`: employees with `status = 'Missing Punch'`
- `wfh_count`: today's WFH employees

**Add Remind button handler:**
- `POST /api/attendance/dashboard/remind` — triggers `attendance.missing` notification to selected employees

### 8.2 Leave Dashboard

**New endpoint:** `GET /api/v1/leave/dashboard`

```json
{
  "pending_count": 12,
  "approved_this_month": 45,
  "rejected_this_month": 3,
  "on_leave_today": 7,
  "leave_type_breakdown": [
    { "leave_type": "Annual Leave", "pending": 3, "approved": 20 }
  ],
  "upcoming_leaves": [
    { "employee_name": "Alice", "from_date": "2026-06-20", "to_date": "2026-06-22", "leave_type": "Annual Leave" }
  ]
}
```

### 8.3 Payroll Dashboard

**New endpoint:** `GET /api/v1/payroll/dashboard`

```json
{
  "current_run_status": "DRAFT",
  "total_employees_in_run": 85,
  "total_gross": 4250000,
  "total_net": 3680000,
  "total_ot_cost": 45000,
  "total_lop_cost": 12000,
  "pending_approvals": 2,
  "last_run_paid_at": "2026-05-31T14:00:00Z"
}
```

### 8.4 Manager Dashboard

**New endpoint:** `GET /api/v1/manager/dashboard`

Returns scope-filtered data for the authenticated manager (TEAM scope):

```json
{
  "pending_approvals": {
    "regularizations": 3,
    "overtime": 5,
    "leave": 2,
    "shift_changes": 1
  },
  "team_today": {
    "present": 12,
    "absent": 2,
    "on_leave": 1,
    "wfh": 3,
    "late": 2
  },
  "team_leave_this_week": [...],
  "team_ot_this_month": [...]
}
```

---

## Migration Sequence

Run in this exact order to avoid FK violations:

| Migration | File | Depends On |
|---|---|---|
| 200 | `200_create_approval_workflow_engine.sql` | employees, rbac_roles |
| 201 | `201_enhance_shift_management.sql` | shifts (090), approval_requests (200) |
| 202 | `202_enhance_attendance.sql` | attendance (090), approval_requests (200) |
| 203 | `203_enhance_overtime.sql` | attendance (202) |
| 204 | `204_enhance_leave.sql` | leave_requests (004/100), approval_requests (200) |
| 205 | `205_payroll_engine.sql` | employee_salaries (038), pay_periods→payroll_runs→payslips chain |
| 206 | `206_centralized_audit_log.sql` | employees |
| 200_seed | `200_seed_default_workflows.sql` | approval_workflows (200), rbac_roles |
| 205_seed | `205_seed_salary_components.sql` | salary_components (205) |

---

## API Reference — New Endpoints

### Approval Engine

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/workflows` | List workflow templates |
| POST | `/api/v1/workflows` | Create workflow |
| GET | `/api/v1/workflows/:id` | Workflow detail with stages |
| PUT | `/api/v1/workflows/:id` | Update workflow + stages |
| DELETE | `/api/v1/workflows/:id` | Deactivate workflow |
| GET | `/api/v1/approvals/inbox` | All pending approvals for auth user (all modules) |
| GET | `/api/v1/approvals/requests/:id` | Approval request detail + history |
| POST | `/api/v1/approvals/requests/:id/act` | Approve/Reject/Comment/Delegate |
| GET | `/api/v1/approvals/delegations` | My active delegations |
| POST | `/api/v1/approvals/delegations` | Create delegation |
| DELETE | `/api/v1/approvals/delegations/:id` | Remove delegation |

### Shift Management

*(See Phase 2 — all `/api/shifts/*` endpoints)*

### Payroll

*(See Phase 6 — all `/api/v1/payroll/*` endpoints)*

### Leave Enhancements

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/leave/calendar` | Monthly leave calendar |
| GET | `/api/v1/leave/team-calendar` | Team leave calendar (manager) |
| GET | `/api/v1/leave/accrual/:empId` | Accrual ledger for employee |
| POST | `/api/v1/leave/encashment` | Request leave encashment |
| GET | `/api/v1/leave/encashment` | List encashment requests |
| GET | `/api/v1/leave/comp-off` | Comp-off balance and ledger |
| GET | `/api/v1/leave/dashboard` | Leave dashboard data |

### Audit

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/audit-log` | Query audit log |
| GET | `/api/v1/audit-log/export` | Export audit log |

---

## Permission Slugs — New

Add to `rbac_permissions` seed:

| Slug | Label | Module |
|---|---|---|
| `shift.view` | View Shifts | Shifts |
| `shift.manage` | Manage Shifts & Assignments | Shifts |
| `shift.change.request` | Request Shift Change | Shifts |
| `shift.change.approve` | Approve Shift Changes | Shifts |
| `workflow.view` | View Approval Workflows | Settings |
| `workflow.manage` | Configure Approval Workflows | Settings |
| `approval.delegate` | Delegate Approvals | Approvals |
| `payroll.manage` | Run & Approve Payroll | Payroll |
| `payroll.run` | Execute Payroll Run | Payroll |
| `payroll.view.own` | View Own Payslip | Payroll (employee) |
| `audit.view` | View Audit Logs | Compliance |
| `leave.encash` | Request Leave Encashment | Leave |
| `geofence.manage` | Manage Geo-Fence Zones | Attendance |

---

## Frontend Pages Summary

### New Pages

| Page | Route | Phase |
|---|---|---|
| `WorkflowBuilder.jsx` | `/settings?tab=workflows` | 1 |
| `ApprovalInbox.jsx` | `/hr/approvals` | 1 |
| `ShiftMaster.jsx` | `/settings?tab=shifts` | 2 |
| `ShiftAssignment.jsx` | `/hr/shifts/assignment` | 2 |
| `ShiftCalendar.jsx` | `/hr/shifts/calendar` | 2 |
| `ShiftChangeRequests.jsx` | `/hr/shifts/change-requests` | 2 |
| `RotationPlanner.jsx` | `/hr/shifts/rotations` | 2 |
| `SalaryComponents.jsx` | `/settings?tab=salary-components` | 6 |
| `SalaryStructures.jsx` | `/settings?tab=salary-structures` | 6 |
| `EmployeeSalary.jsx` | `/hr/payroll/salaries` | 6 |
| `PayrollRuns.jsx` | `/hr/payroll/runs` | 6 |
| `PayslipView.jsx` | `/hr/payroll/payslips/:runId/:empId` | 6 |
| `MyPayslips.jsx` | `/me/payslips` | 6 |
| `PayrollReports.jsx` | `/hr/payroll/reports` | 6 |
| `LeaveCalendar.jsx` | `/hr/leave/calendar` | 5 |
| `LeaveEncashment.jsx` | `/hr/leave/encashment` | 5 |
| `AuditLogViewer.jsx` | `/settings?tab=audit` | 7 |
| `ManagerDashboard.jsx` | `/manager/dashboard` | 8 |

### Modified Pages

| Page | Change |
|---|---|
| `Attendance.jsx` | Department filter fetched from API; punch source column added |
| `AttendanceDashboard.jsx` | Real trend data; Remind button wired; punch source chart |
| `AttendanceSection.jsx` | Shift Settings card uncommented; geo-fence settings added |
| `LeaveAbsence.jsx` | Balances tab rendered; team calendar link; encashment button |
| `OvertimeApprovals.jsx` | Edit button hidden for non-Pending; holiday/weekend multiplier shown |
| `AdminSettings.jsx` | New tabs: shifts, salary-components, salary-structures, workflows, audit |
| `EmailSettings.jsx` | Wire to actual API (`GET/PUT /api/v1/admin/settings/email`) |
| `Payroll.jsx` | Replace dead stub with real payroll run flow |

---

## Implementation Notes

### What to NOT Change

- `employees.reporting_manager_id` — approver resolution reads this directly, no change needed
- `departments.manager_id` — `DEPARTMENT_HEAD` approver type resolves via this, no change needed
- `role_data_scopes` — data scope filtering unchanged; all new APIs call `applyDataScope` identically
- `exit_workflows` / `exit_approvals` — exit module is untouched; the new `approval_workflows` is a parallel system for other modules
- `attendance_regularization_steps` — legacy rows kept; new submissions go to `approval_requests`

### What to Fix Before New Features

These existing bugs must be fixed before Phase 3/4/5 or they will contaminate the new engine:

1. `leave.service.js:621` — `actorId: user.id` → `user.employeeId` (breaks `approved_by` FK)
2. `EmailSettings.jsx` — wire to API before Settings Phase goes live
3. `payroll.routes.js:16,19` — change `PAYROLL_VIEW` → `PAYROLL_MANAGE` on write routes
4. `HolidaySeedPanel` missing return statement — `AttendanceSection.jsx:566`
5. `OvertimeApprovals.jsx:83` — `canApproveRegularization` → `canApproveOvertime`
