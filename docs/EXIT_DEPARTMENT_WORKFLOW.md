# Exit Management — Department Workflow (Multi-Tenant)

**Replaces:** Exit Workflow Engine (templates, dynamic forms, workflow instances)

## Overview

Each tenant configures exit approvals **per exit request** using their own **departments** and **department heads**. Workflow is assigned from the Exit Management listing or exit detail page.

## Run migration

```bash
cd D:\HRIS_API
npm run migrate:tenants
```

Migration: `071_exit_department_workflow.sql`

- Drops old `exit_workflows*` / `workflow_step_forms*` tables
- Creates `exit_department_workflows`, `exit_approvals`, `exit_status_logs`, `exit_organization_workflow_templates`
- Adds `pipeline_stage`, `workflow_configured` on `exit_records`

## Configure (HR/Admin)

1. **Settings → Exit Management**
   - **Termination Types** — exit reason catalog
   - **Clearance Checklist** — tasks seeded after approvals
   - **Department Workflow** — default org-wide approval sequence (HR → IT → Finance, etc.)
2. **Organization → Departments** — ensure each department has a **manager** (department head)
3. **Exit Management** — create resignation/termination
4. Click **Workflow** on a row → select departments, reorder, set mandatory/optional, add remarks → **Save**

## Pipeline stages

`Submitted → Approved → Clearance → Interview → Settlement → Exited`

Department approvals run during the **approval** stage. When all mandatory steps complete, status moves to **clearance** and clearance tasks are seeded.

## API endpoints

| Method | Path |
|--------|------|
| GET | `/admin/settings/termination-types/department-workflow-template` |
| PUT | `/admin/settings/termination-types/department-workflow-template` |
| GET | `/exit-management/departments/with-heads` |
| GET | `/exit-management/:id/workflow` |
| PUT | `/exit-management/:id/workflow/assign` |
| PUT | `/exit-management/:id/workflow/reorder` |
| PUT | `/exit-management/:id/workflow/restart` |
| PUT | `/exit-management/:id/workflow/steps/:stepId/approve` |
| PUT | `/exit-management/:id/workflow/steps/:stepId/reject` |
| PUT | `/exit-management/:id/workflow/steps/:stepId/skip` |
| PUT | `/exit-management/:id/workflow/steps/:stepId/reassign` |

## Rules

- **Reject** any active step → exit status `Rejected`
- **Mandatory** steps must be approved before proceeding
- **Optional** steps can be skipped (HR/manager or assignee)
- Full history in `exit_approvals` and `exit_status_logs`
- Notifications sent to department heads when a step becomes active

## Frontend components

- `DepartmentWorkflowModal.jsx` — assign/reorder departments
- `ExitProgressHeader.jsx` — sticky pipeline stepper
- `ExitApprovalTimeline.jsx` — steps + approval history on exit detail

## Multi-tenant isolation

Database-per-tenant: each organization’s departments and workflows are isolated by tenant database. No cross-tenant access.
