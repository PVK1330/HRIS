# Exit Management Module — Flow Documentation

## Overview

The Exit Management module handles the complete employee offboarding lifecycle for both **Resignations** (voluntary) and **Terminations** (involuntary). It covers approval workflows, clearance tracking, exit interviews, final settlements, document generation, and full audit logging.

---

## Status Flow

### Resignation Flow

```
Pending Approval ──► Approved ──► clearance ──► interview ──► settlement ──► Completed
       │
       └──► Rejected
```

1. **Pending Approval** — HR submits resignation on behalf of the employee. Record awaits manager/HR approval.
2. **Approved** — Resignation approved. Employee status set to "Notice Period". Default clearance tasks auto-seeded.
3. **clearance** — Clearance tasks and asset returns are tracked. HR manually transitions to this status.
4. **interview** — Exit interview conducted and recorded.
5. **settlement** — Final settlement (unpaid salary, leave encashment, gratuity, deductions) processed.
6. **Completed** — Process complete. Employee status set to "Terminated". Exit documents generated.

### Termination Flow

```
In Progress ──► clearance ──► interview ──► settlement ──► Completed
```

1. **In Progress** — HR initiates termination. Employee status immediately set to "Notice Period". Clearance tasks auto-seeded. Skips the approval step since termination is an HR decision.
2. **clearance → interview → settlement → Completed** — Same as resignation flow from step 3 onward.

### Rejection Flow

- Only **Resignations** in `Pending Approval` status can be rejected.
- Rejected records are terminal — no further transitions allowed.
- A `rejection_reason` is recorded.

### Valid Status Transitions (Backend)

| Current Status      | Allowed Next Statuses             |
|---------------------|-----------------------------------|
| `Pending Approval`  | `Approved`, `Rejected` (via approve/reject endpoints) |
| `Approved`          | `In Progress`, `clearance`        |
| `In Progress`       | `clearance`, `Completed`          |
| `clearance`         | `interview`, `Completed`          |
| `interview`         | `settlement`, `Completed`         |
| `settlement`        | `Completed`                       |

> Note: Any status can transition directly to `Completed` to allow skipping optional steps.

---

## API Endpoints

### Exit Records

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/exit-management` | List exit records (paginated, filterable) |
| GET    | `/api/v1/exit-management/stats` | Get exit statistics |
| GET    | `/api/v1/exit-management/:id` | Get single exit record with all related data |
| POST   | `/api/v1/exit-management/resignation` | Create a resignation |
| POST   | `/api/v1/exit-management/termination` | Create a termination |
| PUT    | `/api/v1/exit-management/:id` | Update exit record fields |
| PUT    | `/api/v1/exit-management/:id/approve` | Approve a resignation |
| PUT    | `/api/v1/exit-management/:id/reject` | Reject a resignation |
| PUT    | `/api/v1/exit-management/:id/status` | Transition to next status |

### Clearance Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/exit-management/:id/clearance` | List clearance tasks |
| POST   | `/api/v1/exit-management/:id/clearance` | Add a clearance task |
| PUT    | `/api/v1/exit-management/:id/clearance/:taskId` | Update/complete a task |

### Asset Returns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/exit-management/:id/assets` | List asset returns |
| POST   | `/api/v1/exit-management/:id/assets` | Add an asset return |
| PUT    | `/api/v1/exit-management/:id/assets/:assetId` | Update an asset return |

### Exit Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/exit-management/:id/documents` | List generated documents |
| POST   | `/api/v1/exit-management/:id/documents/generate` | Generate a document |

Accepted document types: `Experience Letter`, `Relieving Letter`, `Final Payslip`, `Termination Letter`, `No Objection Certificate`, `NOC`, `Full & Final Statement`, `Full & Final Settlement`.

### Exit Interviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/exit-management/:id/interview` | Get exit interview |
| POST   | `/api/v1/exit-management/interviews` | Submit exit interview |

### Final Settlements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/exit-management/:id/settlement` | Get settlement |
| POST   | `/api/v1/exit-management/settlements` | Process settlement |

### Audit Log

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/exit-management/:id/audit-log` | Get full audit trail |

### Termination Types (Settings)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/exit-management/termination-types` | Dropdown list (active only) |
| GET    | `/api/v1/admin/settings/termination-types` | Full CRUD list (paginated) |
| POST   | `/api/v1/admin/settings/termination-types` | Create termination type |
| PUT    | `/api/v1/admin/settings/termination-types/:id` | Update termination type |
| DELETE | `/api/v1/admin/settings/termination-types/:id` | Delete termination type |

---

## Frontend Pages

### 1. Exit Management Dashboard (`/admin/exit-management`)
**File:** `src/pages/exit/ExitManagement.jsx`

The main HR admin dashboard. Features:
- **KPI Cards** — Total Exits, Pending, In Clearance, Completed. Each card filters the table when clicked.
- **Filters** — Search bar, status dropdown, exit type dropdown.
- **Table** — Shows all exit records with employee details, status badges, clearance progress, and action buttons.
- **View Modal** — Two tabs: "Information" (employee details grid) and "Exit Progress" (status stepper). Includes a "View Full Details" link.
- **CSV Export** — Download all records as CSV.
- **Modals** — ResignationModal and TerminationModal for creating new exit records.

### 2. Exit Detail (`/admin/exit-management/:id`)
**File:** `src/pages/exit/ExitDetail.jsx`

Full detail page for a single exit record. Features:
- **Header Card** — Employee name, exit type badge, status badge, days remaining counter.
- **Status Stepper** — Visual progress indicator (6 steps). Shows rejected state with red X if applicable.
- **6 Tabs** — One per workflow step, auto-activated based on current status:
  - **Submitted** — Exit info grid, reason detail, rejection banner (if rejected), audit section.
  - **Approved** — Approval status. Approve/Reject buttons (if pending). "Move to Clearance" button.
  - **Clearance** — ClearanceChecklist component. "Move to Interview" button.
  - **Interview** — ExitInterviewForm component. "Move to Settlement" button.
  - **Settlement** — SettlementForm component. "Mark Completed" button.
  - **Exited** — Completion banner, ExitDocuments component, audit trail.

### 3. Manager Exit Approvals (`/admin/exit-approvals`)
**File:** `src/pages/exit/ManagerExitApprovals.jsx`

Manager-specific view:
- **Stats Cards** — Pending approvals count, outstanding clearance tasks.
- **Pending Approvals Section** — Cards with approve/reject actions for each pending resignation.
- **Clearance Tasks Section** — Toggle-based checklist for tasks assigned to the manager's department.

### 4. Employee Self-Service (`/admin/my-exit`)
**File:** `src/pages/exit/EmployeeExit.jsx`

Employee-facing view:
- **Exit Status Card** — Shows current status, status stepper, clearance progress.
- **Personal Checklist** — UI-only checklist (persisted in localStorage) for personal exit tasks.
- **GDPR Section** — Data export request card.

---

## Reusable Components

| Component | File | Description |
|-----------|------|-------------|
| `ExitStatusStepper` | `src/components/exit/ExitStatusStepper.jsx` | 6-step visual stepper with progress connectors. Handles Rejected state (red X). |
| `ClearanceChecklist` | `src/components/exit/ClearanceChecklist.jsx` | Interactive checklist for clearance tasks with toggle/complete functionality. |
| `ExitInterviewForm` | `src/components/exit/ExitInterviewForm.jsx` | Form with format, feedback, rating, rehire eligibility fields. |
| `SettlementForm` | `src/components/exit/SettlementForm.jsx` | Financial form with auto-calculated net payable. UK redundancy guidance. |
| `ExitDocuments` | `src/components/exit/ExitDocuments.jsx` | Document generation buttons and status display. |
| `ResignationModal` | `src/components/exit/ResignationModal.jsx` | Modal for creating resignation records with employee search. |
| `TerminationModal` | `src/components/exit/TerminationModal.jsx` | Modal for creating termination records with SweetAlert confirmation. |

---

## Database Tables

### Core Tables (from `exit_management.sql`)
- **`exit_records`** — Main exit record. FK to `employees` and `termination_types`.
- **`clearance_tasks`** — Clearance checklist items linked to an exit record.
- **`asset_returns`** — Asset return tracking linked to an exit record.
- **`exit_documents`** — Generated documents linked to an exit record.
- **`termination_types`** — CRUD-managed types (e.g., Gross Misconduct, Redundancy).

### Extended Tables (from `061_exit_management_v3.sql`)
- **`exit_interviews`** — Stores exit interview data (format, feedback, rating, rehire eligibility). FK: `exit_request_id` → `exit_records.id`.
- **`final_settlements`** — Stores financial settlement data (salary, leave, gratuity, deductions, net payable). FK: `exit_request_id` → `exit_records.id`.
- **`exit_audit_logs`** — Full audit trail of every action on an exit record. FK: `exit_request_id` → `exit_records.id`.

### Key Columns Added to Existing Tables
- `exit_records`: `initiated_by`, `is_voluntary`, `reason_detail`, `rtw_status`, `contract_notice_days`, `statutory_notice_days`
- `clearance_tasks`: `assigned_to_role`, `remarks`
- `exit_documents`: `generated_by`

---

## Audit Logging

Every mutating action is logged to `exit_audit_logs`:

| Action | Trigger |
|--------|---------|
| `resignation_submitted` | New resignation created |
| `termination_initiated` | New termination created |
| `resignation_approved` | Resignation approved |
| `resignation_rejected` | Resignation rejected |
| `status_changed` | Status transition (clearance → interview → settlement → Completed) |
| `record_updated` | Exit record fields edited |
| `exit_interview_submitted` | Exit interview submitted |
| `settlement_processed` | Final settlement processed |

Each log entry records: `performed_by` (user ID), `performed_by_name`, `action`, `before_value` (JSON), `after_value` (JSON), and `created_at`.

---

## Business Rules

1. **One active exit per employee** — Cannot create a new exit record if one exists with status other than `Completed` or `Rejected`.
2. **Only resignations can be approved/rejected** — Terminations skip approval and start at `In Progress`.
3. **Default clearance tasks** — 10 tasks auto-seeded across IT, HR, Finance, and Admin departments on approval (resignation) or creation (termination). Tasks are only seeded once per record.
4. **Employee status updates** — Set to `Notice Period` on approval/creation, `Terminated` on completion.
5. **Document types must match backend validator** — Title Case format required.
6. **Settlement net payable** — Computed server-side as: `unpaid_salary + leave_encashment + gratuity - deductions`.
7. **Completed/Rejected records are immutable** — Cannot be edited via the update endpoint.

---

## Permission

All exit management endpoints require the `EXIT_MANAGE` permission via `requirePermission('EXIT_MANAGE')` middleware.

---

## UK Compliance Notes

- Statutory minimum notice: 1 week per year of service, max 12 weeks.
- Termination requires documented grounds (PIP records, written warnings).
- GDPR data export request available in the employee self-service view.
- UK redundancy guidance shown in settlement form when employee tenure > 2 years.
