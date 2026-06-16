# HRIS – Complete Codebase Overview
> Share this document with ChatGPT to get context-aware assistance on any module.

---

## 1. PROJECT OVERVIEW

This is a **multi-tenant SaaS HRMS** (Human Resource Management System) built with:

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router v7, Recharts, Socket.io Client |
| Backend | Node.js, Express 4, PostgreSQL, Redis, Socket.io, node-cron |
| Auth | JWT + bcrypt + optional MFA (TOTP) |
| File Storage | AWS S3 (via Multer) |
| Email | Nodemailer with template engine |
| Payments | Stripe, Razorpay, PayPal |
| PDF | pdfkit, pdf-lib, Puppeteer |
| Real-time | Socket.io 4.8 |

**Multi-tenancy model**: Each tenant (company) gets its own isolated PostgreSQL database. The backend resolves the tenant from a JWT claim and switches connection pools at request time.

**Roles** (per tenant): `admin`, `hr_admin`, `hr_executive`, `manager`, `employee`  
**Platform roles**: `superadmin`, `support_admin`, `billing_admin`

---

## 2. REPOSITORY STRUCTURE

```
d:\HRIS/               ← React frontend
  src/
    pages/             ← All page-level components (~119 files)
    components/        ← Reusable UI components (~40+ files)
    routes/AppRouter.jsx
    context/           ← AuthContext, CurrencyContext, TimezoneContext
    hooks/             ← 15+ custom hooks (settings, socket, etc.)
    layouts/           ← AdminLayout, SuperAdminLayout

d:\HRIS_API/           ← Express backend
  src/
    modules/           ← 52 feature modules (controller/service/repository/routes)
    middlewares/       ← auth, tenant, RBAC, rate-limit, timezone, upload
    jobs/              ← 12 node-cron scheduled jobs
    migrations/        ← 165+ SQL migration files (tenants + superadmin)
    helpers/           ← mailer, payment gateway verifiers
    utils/             ← 24+ utilities
    config/            ← db, redis, aws, cors, env
```

---

## 3. SETTINGS MODULE

### 3.1 Frontend

| File | Purpose |
|---|---|
| `pages/admin/settings/AdminSettings.jsx` | Master settings container page with tab navigation |
| `components/admin/settings/SettingsTabs.jsx` | Tab component for settings sections |
| `pages/admin/settings/sections/AttendanceSection.jsx` | Attendance policy config UI |
| `pages/admin/settings/sections/HolidaysSection.jsx` | Holiday list config UI |
| `pages/admin/settings/sections/OnboardingSettingsSection.jsx` | Onboarding workflow config |
| `pages/admin/settings/sections/AssetSettingsSection.jsx` | Asset categories & rules |
| `pages/admin/settings/sections/ExitSettingsSection.jsx` | Exit workflow settings |
| `pages/admin/settings/sections/BillingSettings.jsx` | Subscription/billing info |
| `pages/admin/settings/sections/IntegrationSettings.jsx` | 3rd-party integrations |
| `pages/admin/settings/Departments.jsx` | Manage departments |
| `pages/admin/settings/Designations.jsx` | Manage designations |
| `pages/admin/settings/LeaveSettings.jsx` | Leave types, accrual rules |
| `pages/admin/settings/RolesPermissions.jsx` | RBAC role editor |
| `pages/admin/settings/PasswordSecurity.jsx` | Password policy config |
| `pages/admin/settings/NotificationSettings.jsx` | Email/in-app notification toggles |
| `pages/admin/settings/DocumentSettings.jsx` | Document type configuration |
| `pages/admin/settings/SensitiveData.jsx` | Sensitive field visibility |
| `pages/admin/settings/TerminationTypes.jsx` | Exit/termination type config |
| `pages/admin/settings/ClearanceItemsCatalog.jsx` | Exit clearance items |
| `hooks/settings/` | 6 hooks: useLeaveSettings, useNotificationSettings, useDocumentSettings, usePasswordSecurity, useSensitiveData, useRbac |

### 3.2 Backend Modules

| Module | Path | Purpose |
|---|---|---|
| tenantSettings | `modules/tenantSettings/` | Core company-level settings (name, logo, timezone, etc.) |
| attendanceSettings | `modules/attendanceSettings/` | Shift rules, grace, OT policy, punch modes |
| leaveSettings | `modules/leaveSettings/` | Leave types, accrual rules, carry-forward |
| assetSettings | `modules/assetSettings/` | Asset categories, custom fields |
| accountSettings | `modules/accountSettings/` | Account-level config |
| documentSettings | `modules/documentSettings/` | Document type definitions |
| emailSettings | `modules/emailSettings/` | SMTP config, email templates |
| notificationSettings | `modules/notificationSettings/` | Notification channel toggles |
| passwordSecurity | `modules/passwordSecurity/` | Password complexity, lockout policy |
| settings (general) | `modules/settings/` | Catch-all settings with audit trail |

### 3.3 Key API Patterns
- All settings endpoints are protected by `auth.middleware` + `orgSettingsAccess.middleware`
- `attendanceSettings` module has its own `attendanceSettingsAudit.service.js` for change tracking
- Settings changes emit socket events to connected clients for live updates

---

## 4. ONBOARDING MODULE

### 4.1 Frontend

| File | Purpose |
|---|---|
| `pages/admin/hr/Onboarding.jsx` | Admin view: manage candidates, send offers, track steps |
| `pages/admin/hr/CandidateInformationCard.jsx` | Candidate detail card component |
| `pages/public/onboarding/CandidateOffer.jsx` | Public page: candidate views/accepts offer letter |
| `pages/public/onboarding/CandidateSign.jsx` | Public page: digital signature for offer |
| `pages/public/onboarding/CandidateDocuments.jsx` | Public page: candidate uploads documents |
| `pages/admin/settings/sections/OnboardingSettingsSection.jsx` | Config: checklist items, workflow stages |

### 4.2 Backend

| File | Purpose |
|---|---|
| `modules/employees/onboarding/onboarding.controller.js` | CRUD for onboarding records |
| `modules/employees/onboarding/onboarding.service.js` | Business logic |
| `modules/employees/onboarding/onboarding.workflow.js` | Stage-based workflow engine |
| `modules/employees/onboarding/onboarding.workflow.repository.js` | Workflow state persistence |
| `modules/employees/onboarding/onboarding.mailer.js` | Send offer/welcome emails |
| `modules/employees/onboarding/onboardingEvents.service.js` | Socket events for status changes |
| `modules/employees/onboarding/onboardingNotification.service.js` | Notification triggers |
| `modules/employees/onboarding/candidatePublic.controller.js` | Token-authenticated public endpoints |
| `modules/employees/onboarding/candidatePublic.service.js` | Public-facing business logic |
| `modules/employees/onboarding/offerPdf.generator.js` | Generate offer letter PDF |
| `modules/employees/onboarding/signedOfferPdf.generator.js` | Stamp signature on offer PDF |
| `modules/employees/onboarding/candidatePortalUrl.js` | Generate secure candidate portal link |
| `modules/employees/onboarding/utils/onboardingChecklist.utils.js` | Checklist completion utilities |
| `modules/employees/onboarding/utils/onboardingRecipients.utils.js` | Email recipient resolution |
| `modules/onboardingHandover/` | Post-onboarding handover workflow (4 files) |

### 4.3 Workflow
1. Admin creates candidate → system sends offer email with secure link
2. Candidate visits public portal → views/signs offer letter (digital signature)
3. Candidate uploads required documents
4. Admin reviews and approves → converts to employee record
5. Scheduled job `jobs/onboardingTaskEscalation.job.js` escalates overdue tasks

---

## 5. EMPLOYEE MODULE

### 5.1 Frontend

| File | Purpose |
|---|---|
| `pages/admin/employees/EmployeeDirectory.jsx` | Searchable/filterable employee list with bulk actions |
| `pages/admin/employees/EmployeeProfile.jsx` | Full employee profile: personal info, documents, history |
| `pages/employee/` | Employee self-service pages (directory at `src/pages/employee/`) |

### 5.2 Backend

| File | Purpose |
|---|---|
| `modules/employees/employees.controller.js` | CRUD + bulk import/export |
| `modules/employees/employees.service.js` | Core business logic |
| `modules/employees/employees.repository.js` | DB queries |
| `modules/employees/employees.validator.js` | Joi/express-validator schemas |
| `modules/employees/employees.export.js` | CSV/Excel export |
| `modules/employees/employees.gdpr.js` | Right-to-erasure / data anonymization |
| `modules/employees/employees.mailer.js` | Welcome emails, password-set links |

### 5.3 Sub-modules (under `modules/employees/`)
- `attendance/` – 23 files (see §6)
- `leave/` – 5 files (see §8)
- `onboarding/` – 16 files (see §4)
- `assets/` – 4 files (employee asset assignment)
- `performance/` – 4 files (reviews, goals)
- `documents/` – employee document store

### 5.4 Employee ID
- Format controlled by `utils/empIdFormat.js`
- Configurable prefix + auto-increment per tenant

---

## 6. DEPARTMENTS & DESIGNATIONS MODULE

### 6.1 Frontend

| File | Purpose |
|---|---|
| `pages/admin/settings/Departments.jsx` | Create/edit/delete departments, assign head |
| `pages/admin/settings/Designations.jsx` | Create/edit/delete designations, link to department |

### 6.2 Backend

**Departments** (`modules/departments/`):

| File | Purpose |
|---|---|
| `departments.controller.js` | REST endpoints |
| `departments.service.js` | Business logic |
| `departments.routes.js` | Express routes |
| `departments.validator.js` | Input validation |
| `departments.export.js` | CSV export |

**Designations** (`modules/designations/`):

| File | Purpose |
|---|---|
| `designations.controller.js` | REST endpoints |
| `designations.service.js` | Business logic |
| `designations.routes.js` | Express routes |
| `designations.validator.js` | Input validation |
| `designations.export.js` | CSV export |

### 6.3 DB Schema
- `departments` table: id, tenant_id, name, head_employee_id, parent_id (hierarchy), created_at
- `designations` table: id, tenant_id, name, department_id, level, created_at

---

## 7. ATTENDANCE MODULE

### 7.1 Frontend

| File | Purpose |
|---|---|
| `pages/admin/hr/AttendanceLayout.jsx` | Layout wrapper with tab nav for attendance sub-pages |
| `pages/admin/hr/Attendance.jsx` | Overview / daily view |
| `pages/admin/hr/attendance/MyAttendance.jsx` | Employee self-service attendance view |
| `pages/admin/hr/attendance/AttendanceDashboard.jsx` | HR dashboard: stats, trends, absent list |
| `pages/admin/hr/attendance/AttendanceRegularization.jsx` | Submit/approve regularization requests |
| `pages/admin/hr/attendance/AttendanceOverride.jsx` | Admin manual override of attendance records |
| `pages/admin/hr/attendance/OvertimeApprovals.jsx` | OT request list with approve/reject actions |
| `pages/admin/hr/attendance/AttendanceReports.jsx` | Monthly reports, export |
| `components/attendance/AttendancePunchCard.jsx` | Punch-in/out widget with geo-fence support |
| `components/attendance/AttendanceDetailModal.jsx` | Day-level detail popup |
| `components/attendance/AddOvertimeModal.jsx` | OT request submission form |
| `components/attendance/AttendanceExportMenu.jsx` | Export dropdown (CSV/Excel/PDF) |
| `components/attendance/HolidayListWidget.jsx` | Sidebar holiday calendar |
| `pages/admin/settings/sections/AttendanceSection.jsx` | Admin config: punch modes, grace, OT rules |

### 7.2 Backend (23 files in `modules/employees/attendance/`)

| File | Purpose |
|---|---|
| `attendance.controller.js` | REST: punch, fetch records, reports |
| `attendance.service.js` | Main orchestrator |
| `attendance.repository.js` | DB queries |
| `attendance.routes.js` | Express routes |
| `attendance.constants.js` | Status enums, config keys |
| `attendance.validators.js` | Input validation |
| `attendanceApproval.service.js` | Regularization & OT approval workflow |
| `attendanceAudit.service.js` | Audit trail for all changes |
| `attendanceAuth.service.js` | Permission checks (who can approve what) |
| `attendanceAutoReject.service.js` | Auto-reject stale pending requests |
| `attendanceCalculation.service.js` | Compute hours, late, early-exit, half-day |
| `attendanceCalendar.service.js` | Monthly calendar view data |
| `attendanceCron.service.js` | Daily cron: auto-mark absent, process punch cutoff |
| `attendanceExport.service.js` | Excel export logic |
| `attendanceGrace.service.js` | Late-by tolerance / grace period application |
| `attendanceIntegrity.service.js` | Data consistency validation |
| `attendanceLabels.js` | UI label mappings |
| `attendanceMonthlyReport.service.js` | Monthly summary generation |
| `attendanceNotifications.service.js` | Real-time notifications on status change |
| `attendanceOvertime.service.js` | OT calculation and management |
| `attendanceReports.service.js` | Report data aggregation |
| `attendanceWorkflow.service.js` | Stage-based approval engine for reg/OT |

### 7.3 Settings (`modules/attendanceSettings/`)
- `attendanceSettings.service.js` – read/write policy (punch modes, grace, OT thresholds)
- `attendanceSettingsAudit.service.js` – log every settings change
- `attendanceSettingsAuth.service.js` – who can change settings

### 7.4 Scheduled Jobs
- `jobs/attendanceCron.job.js` – runs daily: auto-absent marking, punch cutoffs
- `jobs/attendanceMonthlyReport.job.js` – runs monthly: generate reports

### 7.5 Key DB Columns
```
attendance table:
  id, employee_id, date, punch_in, punch_out,
  status (present/absent/half_day/holiday/leave),
  late_by, early_exit_by, working_hours,
  regularization_status, overtime_status,
  regularization_stage, overtime_stage,
  created_at, updated_at
```

---

## 8. OVERTIME MODULE

### 8.1 Frontend

| File | Purpose |
|---|---|
| `pages/admin/hr/attendance/OvertimeApprovals.jsx` | Manager/HR OT request queue |
| `components/attendance/AddOvertimeModal.jsx` | Employee OT request form |

### 8.2 Backend

| File | Purpose |
|---|---|
| `modules/employees/attendance/attendanceOvertime.service.js` | OT calculation, submit, approve/reject |
| `modules/employees/attendance/attendanceApproval.service.js` | Stage-based approval (Manager → HR) |
| `modules/employees/attendance/attendanceWorkflow.service.js` | Workflow engine shared with regularization |
| `modules/approvalEngine/approvalEngine.service.js` | Generic approval aggregator |

### 8.3 Approval Flow
- **Stage 1**: Manager approval (`overtime_stage = 'manager_pending'`)
- **Stage 2**: HR approval (`overtime_stage = 'hr_pending'`)
- **Final**: `overtime_status = 'approved'` or `'rejected'`
- Notifications sent at each stage transition
- `can_act` flag pattern: only the current-stage approver gets the approve/reject buttons

---

## 9. REGULARIZATION MODULE

### 9.1 Frontend

| File | Purpose |
|---|---|
| `pages/admin/hr/attendance/AttendanceRegularization.jsx` | Submit regularization + HR approval view |

### 9.2 Backend

Uses same files as Attendance + Approval:
- `attendanceApproval.service.js` – handles regularization approval stages
- `attendanceWorkflow.service.js` – stage transitions
- `attendanceNotifications.service.js` – notifications per stage

### 9.3 Regularization Flow
1. Employee submits regularization for a date (reason + corrected times)
2. Manager reviews → approve or reject
3. HR reviews → final approve or reject
4. On final approval: attendance record updated, audit log written
5. Auto-reject: `attendanceAutoReject.service.js` cancels stale requests after configurable days

---

## 10. LEAVE / ABSENCE MODULE

### 10.1 Frontend

| File | Purpose |
|---|---|
| `pages/admin/hr/LeaveAbsence.jsx` | Main leave management: apply, view, approve |
| `pages/admin/hr/AbsenceManagement.jsx` | Absence tracking & analytics |
| `pages/admin/settings/LeaveSettings.jsx` | Configure leave types, accrual, carry-forward |
| `components/leave/AddLeaveModal.jsx` | Leave application form |

### 10.2 Backend

| File | Purpose |
|---|---|
| `modules/employees/leave/leave.controller.js` | Apply, cancel, approve, reject leave |
| `modules/employees/leave/leave.service.js` | Balance checks, overlap validation |
| `modules/employees/leave/leave.repository.js` | DB queries |
| `modules/employees/leave/leave.routes.js` | Express routes |
| `modules/employees/leave/leaveCarryForward.service.js` | Annual carry-forward calculation |
| `modules/leaveSettings/leaveSettings.service.js` | Leave type config, accrual rules |

### 10.3 Scheduled Jobs
- `jobs/leaveCarryForward.job.js` – runs on configured year-end date

### 10.4 Key DB Tables
```
leave_requests: id, employee_id, leave_type_id, from_date, to_date,
                days, status, approver_id, reason, created_at

leave_balances: employee_id, leave_type_id, allocated, used, pending, carried_forward

leave_types: id, name, is_paid, max_days, carry_forward_limit, accrual_rule
```

---

## 11. HOLIDAY LIST MODULE

### 11.1 Frontend

| File | Purpose |
|---|---|
| `pages/admin/settings/sections/HolidaysSection.jsx` | CRUD for company holiday list, import from template |
| `components/attendance/HolidayListWidget.jsx` | Calendar widget showing upcoming holidays |

### 11.2 Backend (`modules/holidays/`)

| File | Purpose |
|---|---|
| `holidays.controller.js` | CRUD endpoints for holidays |
| `holidays.service.js` | Business logic, bulk import |
| `holidays.repository.js` | DB queries |
| `holidays.routes.js` | Express routes |
| `holidayNotifications.service.js` | Remind employees of upcoming holidays |
| `holidayNotificationHistory.repository.js` | Track sent notifications to prevent duplicates |

### 11.3 DB Schema
```
holidays: id, tenant_id, name, date, type (public/optional/restricted),
          is_recurring, description, created_at
```

### 11.4 Integration
- Attendance calculation reads holidays to mark `status = 'holiday'`
- Leave calculation excludes holiday days from leave count
- Scheduled notification sent N days before each holiday (configurable)

---

## 12. SHIFT MANAGEMENT MODULE

### 12.1 Frontend

| File | Purpose |
|---|---|
| `pages/admin/shifts/ShiftManagement.jsx` | Create/edit shifts, assign to employees/departments |

### 12.2 Backend (`modules/shifts/`)

| File | Purpose |
|---|---|
| `shifts.controller.js` | CRUD for shift definitions; assign/unassign employees |
| `shifts.service.js` | Business logic: overlap checks, default shift |
| `shifts.routes.js` | Express routes |

### 12.3 DB Schema
```
shifts: id, tenant_id, name, start_time, end_time, break_duration,
        working_days (array), is_flexible, grace_in, grace_out, created_at

employee_shifts: employee_id, shift_id, effective_from, effective_to
```

### 12.4 Integration
- Attendance calculation uses assigned shift to compute late/early markers
- Shift change requests can go through Manager → HR approval (migration 127)
- `attendanceSettings` can set a default shift for all employees

---

## 13. PAYROLL MODULE

### 13.1 Frontend

| File | Purpose |
|---|---|
| `pages/admin/finance/Payroll.jsx` | Payroll run list, status, download payslips |
| `pages/admin/finance/PayrollEngine.jsx` | Configure payroll components (earnings, deductions) |
| `pages/admin/finance/PayrollSettings.jsx` | Tax tables, PF/ESI/TDS config |
| `pages/admin/finance/Payslip.jsx` | Individual payslip view + PDF download |
| `pages/admin/finance/Expenses.jsx` | Employee expense claims |

### 13.2 Backend

**Payroll Core** (`modules/payroll/`):

| File | Purpose |
|---|---|
| `payroll.controller.js` | Run payroll, fetch payslips, export |
| `payroll.service.js` | Calculation orchestration |
| `payroll.routes.js` | Express routes |
| `payrollEngine.controller.js` | Configure payroll components (salary structure) |
| `payrollEngine.service.js` | Component computation logic |
| `payrollEngine.routes.js` | Engine-specific endpoints |

**Expenses** (`modules/expenses/`):

| File | Purpose |
|---|---|
| `expenses.controller.js` | Submit, approve, reject expense claims |
| `expenses.service.js` | Business logic, receipt upload |
| `expenses.routes.js` | Express routes |

**Expense Categories** (`modules/expenseCategories/`):
- `expenseCategories.controller.js` – manage category definitions

### 13.3 Payroll Calculation Flow
1. Admin initiates payroll run for a period (month)
2. Engine fetches: base salary, attendance data (days present/absent/leave), OT hours
3. Applies: earnings components (HRA, DA, allowances), deductions (PF, ESI, TDS, advances)
4. Generates payslip per employee
5. Admin reviews → finalizes → employees notified
6. PDF payslip generated via pdfkit/Puppeteer

### 13.4 DB Schema (key tables)
```
payroll_runs: id, tenant_id, period_month, period_year, status, finalized_at

payslips: id, run_id, employee_id, gross, net, deductions (JSON), earnings (JSON)

salary_components: id, tenant_id, name, type (earning/deduction), formula, is_taxable

employee_salary: employee_id, component_id, amount, effective_from
```

---

## 14. APPROVAL INBOX (CROSS-MODULE)

### Frontend
- `pages/admin/approvals/ApprovalInbox.jsx` – aggregated view of pending approvals across:
  - Overtime requests
  - Regularization requests
  - Shift-change requests
  - Leave requests

### Backend
- `modules/approvalEngine/approvalEngine.service.js` – queries all pending items across modules for the logged-in user's role
- Each module writes its own approval rows; the inbox is a unified read-only aggregator

---

## 15. AUTHENTICATION & PERMISSIONS

### Auth Flow
1. `POST /auth/login` → validates credentials → returns JWT access token + refresh token
2. Access token carries: `userId`, `tenantId`, `role`, `permissions[]`
3. Backend `auth.middleware.js` verifies JWT on every request
4. `tenant.middleware.js` resolves the correct DB pool from `tenantId`
5. `employeeScope.middleware.js` restricts data to employee's own records where applicable

### RBAC (Role-Based Access Control)
- `modules/rbac/` manages role definitions and permission assignments
- Frontend `components/PermissionGate.jsx` wraps UI sections with permission checks
- `components/AttendanceModuleGate.jsx` gates the entire attendance module

### MFA
- `modules/auth/auth.mfa.service.js` – TOTP-based (Google Authenticator compatible)
- `pages/admin/settings/MfaCard.jsx` – enable/disable MFA per user

---

## 16. REAL-TIME & NOTIFICATIONS

### Socket.io
- Frontend hook: `hooks/useSocket.js`
- Backend: Socket.io server in `server.js`, events emitted from service layer
- Events: attendance status change, leave approval, notification badge update

### Notification System
- `modules/notifications/` – in-app notifications (CRUD + read/unread)
- `modules/notificationSettings/` – per-user toggle (email vs in-app per event type)
- `components/layout/NotificationDropdown.jsx` – real-time notification bell
- `jobs/` – various reminder jobs emit notifications

---

## 17. MULTI-TENANCY ARCHITECTURE

- Each company (tenant) registers and gets a **dedicated PostgreSQL database**
- `utils/tenantDbName.js` resolves DB name from tenant slug
- `config/db.js` maintains a pool cache per tenant
- All migrations in `migrations/tenants/` run per-tenant on registration
- `middlewares/tenant.middleware.js` reads `X-Tenant-ID` from JWT claim (NOT from HTTP header) to prevent tenant-hopping

---

## 18. SCHEDULED JOBS (node-cron)

| Job | Schedule | Purpose |
|---|---|---|
| `attendanceCron.job.js` | Daily | Auto-mark absent, punch cutoff |
| `attendanceMonthlyReport.job.js` | Monthly | Generate attendance summaries |
| `leaveCarryForward.job.js` | Yearly | Carry forward leave balances |
| `exitSlaEscalation.job.js` | Daily | Escalate overdue exit tasks |
| `exitTaskReminder.job.js` | Daily | Remind assignees of pending exit tasks |
| `onboardingTaskEscalation.job.js` | Daily | Escalate overdue onboarding steps |
| `policyAckReminder.job.js` | Daily | Remind employees to acknowledge policies |
| `tasksReminder.job.js` | Daily | General task due-date reminders |
| `announcementSchedule.job.js` | Minutely | Publish scheduled announcements |
| `visaExpiryAlert.job.js` | Daily | Alert HR about expiring visas |
| `trialExpiryReminder.job.js` | Daily | Notify tenants nearing trial end |
| `exchangeRatesRefresh.job.js` | Daily | Refresh currency exchange rates |

---

## 19. KEY ARCHITECTURAL PATTERNS

### Service Layer
```
HTTP Request → Controller → Service → Repository → PostgreSQL
                                ↓
                          Socket.io emit
                                ↓
                          Notification insert
```

### Approval Stage Pattern (used in OT, Regularization, Shift-change)
```sql
-- DB columns on the attendance table:
overtime_status      -- 'none' | 'pending' | 'approved' | 'rejected'
overtime_stage       -- 'manager_pending' | 'hr_pending' | 'done'
regularization_status
regularization_stage
```
- `can_act` flag computed server-side: true only for the current-stage approver
- Frontend shows Approve/Reject only when `can_act === true`

### Audit Trail
- Settings changes: `attendanceSettingsAudit.service.js`
- Workflow changes: `modules/workflow/workflowAudit.service.js`
- General: `modules/audit/audit.service.js`
- SuperAdmin: `pages/superadmin/system/AuditLogs.jsx`

---

## 20. FILE MAP QUICK REFERENCE

| You want to change... | Edit these files |
|---|---|
| Punch-in UI | `components/attendance/AttendancePunchCard.jsx` |
| OT approval list | `pages/admin/hr/attendance/OvertimeApprovals.jsx` |
| OT calculation logic | `modules/employees/attendance/attendanceOvertime.service.js` |
| Regularization approval | `modules/employees/attendance/attendanceApproval.service.js` |
| Leave application form | `components/leave/AddLeaveModal.jsx` |
| Leave balance logic | `modules/employees/leave/leave.service.js` |
| Holiday CRUD | `modules/holidays/holidays.service.js` |
| Shift assignment | `modules/shifts/shifts.service.js` |
| Payroll calculation | `modules/payroll/payrollEngine.service.js` |
| Payslip PDF | `modules/payroll/payroll.service.js` (uses pdfkit) |
| Department/Designation CRUD | `modules/departments/` + `modules/designations/` |
| Onboarding workflow | `modules/employees/onboarding/onboarding.workflow.js` |
| Settings tabs layout | `components/admin/settings/SettingsTabs.jsx` |
| Attendance settings config | `modules/attendanceSettings/attendanceSettings.service.js` |
| RBAC permissions | `modules/rbac/rbac.service.js` |
| Email templates | `helpers/mailer/templateEngine.js` |
| Tenant middleware | `middlewares/tenant.middleware.js` |
| JWT auth | `middlewares/auth.middleware.js` |

---

*Generated: 2026-06-16 | HRIS v1.x | React 19 + Express 4 + PostgreSQL*
