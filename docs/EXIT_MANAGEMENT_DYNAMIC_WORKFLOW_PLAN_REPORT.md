# Exit Management — Dynamic Workflow Plan Report

**Project:** HRIS / HRIS_API (Multi-tenant HRMS)  
**Document type:** Architecture & gap analysis report  
**Date:** 29 May 2026  
**Purpose:** Summarize the agreed Exit Management evolution plan (from product/architecture discussion) and current codebase state, for stakeholders and for AI assistants (e.g. ChatGPT) continuing implementation.

---

## 1. Executive Summary

Exit Management in a **multi-tenant HRMS** must not be built as a single fixed “resignation module.” Each tenant (company) has different policies: approval chains, notice periods, clearance departments, documents, asset rules, exit interviews, Full & Final (FnF) calculations, and role-based approvals.

**Recommended direction:**

| Layer | Description |
|-------|-------------|
| **Universal Exit Module** | One runtime that handles all exit types (resignation, termination, retirement, etc.) |
| **Tenant-configurable workflow** | Per-tenant workflow templates define steps and rules |
| **Dynamic forms + approval engine** | Forms and approvers resolved per step, not hard-coded in code |
| **Role-based clearance** | Department/task clearance driven by templates and workflow nodes |
| **Pluggable FnF & documents** | Settlement and letter generation as workflow node types |

The existing HRIS implementation is a **mature fixed-pipeline module** with **partial configuration** (clearance templates, termination types). The plan is to add a **workflow engine layer** without discarding current domain tables (clearance, settlement, interviews, documents).

---

## 2. Business Problem

### Why a fixed module fails

| Tenant variation | Fixed module limitation |
|------------------|-------------------------|
| Different approval chains | Single approve/reject step |
| Different notice periods | Hard-coded or manual fields only |
| Different clearance departments | Templates help, but not tied to workflow order/parallelism |
| Different document requirements | Fixed document type list in validator |
| Different asset return rules | Separate asset table, not workflow-driven |
| Different exit interview flows | Optional status step, not configurable skip/parallel |
| Different FnF calculations | One settlement form; no tenant calculator plugins |
| Different role-based approvals | Permission-based API only; no multi-level routing |

### Target user journey (conceptual)

```
Employee submits resignation
    → System loads tenant-specific exit workflow
    → Approvals (one or many steps, possibly parallel)
    → Department clearance(s)
    → Asset / document requirements
    → Exit interview (if configured)
    → FnF settlement
    → Experience / relieving letters
    → Employee marked exited
```

---

## 3. Proposed Target Architecture

### 3.1 Core idea

```
┌─────────────────────────────────────────────────────────────┐
│              TENANT CONFIGURATION (per tenant DB)            │
│  workflow_templates · workflow_nodes · transitions          │
│  exit_policies · form_definitions · clearance_templates      │
└──────────────────────────┬──────────────────────────────────┘
                           │ snapshot on start
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              UNIVERSAL EXIT RUNTIME                          │
│  exit_requests · workflow_instances · step_instances         │
│  → handlers: approval, clearance, form, asset, interview,    │
│              fnf, document, system_action                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              EXISTING DOMAIN TABLES (retained)               │
│  clearance_tasks · asset_returns · exit_interviews           │
│  final_settlements · exit_documents · exit_audit_logs        │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Configuration entities (new)

| Entity | Role |
|--------|------|
| `exit_workflow_templates` | Named flows: e.g. Standard Resignation, UK Redundancy |
| `exit_workflow_nodes` | Typed steps: `approval`, `clearance`, `form`, `asset_return`, `interview`, `fnf`, `document`, `system_action` |
| `exit_workflow_edges` | Transitions + optional conditions |
| `exit_policies` | Notice rules, document packs, FnF calculator key |
| `exit_form_definitions` | JSON schema / fields for dynamic forms |
| `clearance_task_templates` | **Already exists** — seed clearance nodes |

**Template selection:** `exit_type` + employment attributes + country + `termination_type_id` → pick active template version.

### 3.3 Runtime entities (new + evolved)

| Entity | Role |
|--------|------|
| `exit_requests` | Evolve from `exit_records` — master exit case |
| `workflow_instances` | Running workflow; **frozen snapshot** of template |
| `workflow_step_instances` | Per-step state, assignees, SLA, due dates |
| `approval_actions` | Approve / reject / delegate audit per step |

**Critical rule:** When an exit starts, **snapshot** the template version so in-flight cases are not broken when HR changes policy later.

### 3.4 Workflow engine (shared module)

Suggested responsibilities:

- `loadTemplate(tenant, triggerContext)`
- `startInstance(exitRequestId, templateId)`
- `getCurrentSteps(instanceId)`
- `completeStep(stepId, payload)`
- `rejectStep` / `escalateStep` / `skipStep` (if policy allows)
- `evaluateTransitions()` — advance when parallel branches complete

**Node handlers (strategy pattern):**

| Node type | Behavior |
|-----------|----------|
| `approval` | Resolve approver: reporting manager, role, department head, user list |
| `clearance` | Seed tasks from templates; block until complete |
| `form` | Validate dynamic form definition |
| `asset_return` | Enforce asset rules; link to asset module |
| `interview` | Create/update `exit_interviews` |
| `fnf` | Run tenant FnF calculator plugin |
| `document` | Generate Experience Letter, Relieving, FnF PDF, etc. |
| `system_action` | Update `employment_status`, mark exited, notifications |

### 3.5 How tenant differences map to config (not code)

| Policy | Configuration mechanism |
|--------|-------------------------|
| Approval chains | Node sequence + `approver_resolver` |
| Notice periods | `exit_policies` |
| Clearance departments | Clearance nodes + templates |
| Documents | Document nodes + required types |
| Asset rules | Asset node + asset settings integration |
| Exit interview | Optional node or skip edge |
| FnF | FnF node + `fnf_calculator_key` |
| Role approvals | RBAC + resolver in engine |

---

## 4. Current State (HRIS / HRIS_API) — As-Is

### 4.1 Multi-tenancy

- **Pattern:** Database-per-tenant (Postgres DB per tenant).
- **Resolution:** Subdomain, `x-tenant-id` / `x-tenant-domain` headers, or JWT `tenant_id`.
- **Data access:** `getTenantPool(tenant.dbName)` — exit tables have **no `tenant_id` column**; isolation is by database.
- **Implication:** All workflow configuration tables live in **tenant migrations**, same as existing exit tables.

### 4.2 Backend module

| Item | Location |
|------|----------|
| Routes | `HRIS_API/src/modules/exitManagement/exitManagement.routes.js` — base `/api/v1/exit-management` |
| Service | `HRIS_API/src/modules/exitManagement/exitManagement.service.js` (~1.7k lines) |
| Settings | `HRIS_API/src/modules/exitSettings/` — termination types, clearance templates |
| SLA job | `HRIS_API/src/jobs/exitSlaEscalation.job.js` |
| Permissions | `exit.view`, `exit.manage`, module `exit-management` |

### 4.3 Fixed status pipeline (resignation)

```
Pending Approval → Approved → clearance → interview → settlement → Completed
        └── Rejected
```

**Termination** skips approval: `In Progress → clearance → … → Completed`

Status transitions enforced in service/validator. HR can skip optional steps by jumping to `Completed`.

### 4.4 Database tables (tenant DB)

| Migration | Tables / changes |
|-----------|------------------|
| `009_create_exit_management_table.sql` | `exit_records`, `asset_returns` |
| `060_exit_management_v2.sql` | `termination_types`, `clearance_tasks`, `exit_documents` |
| `061_exit_management_v3.sql` | `exit_interviews`, `final_settlements`, `exit_audit_logs` |
| `062_clearance_task_templates.sql` | Per-tenant clearance templates |
| `063_exit_management_enhancements.sql` | SLA, withdrawal, proof uploads |

### 4.5 What is already configurable

| Feature | Status |
|---------|--------|
| Clearance task templates | API-backed (`/admin/settings/...`) |
| Termination types | API-backed CRUD |
| Clearance SLA + escalation | Backend + cron job |
| Audit logging | `exit_audit_logs` |
| WebSockets | `exit:workflow_updated`, `exit:task_updated`, `exit:sla_breached` |
| Documents | Experience Letter, Relieving, FnF Statement, etc. (fixed type enum) |
| Withdrawal workflow | Supported (enhancement migration) |

### 4.6 What is fixed / not workflow-driven

| Feature | Limitation |
|---------|------------|
| Resignation approval | Single `PUT /:id/approve` and `/:id/reject` |
| Status lifecycle | Hard-coded enum and transition matrix |
| Multi-level approval chain | **Not implemented** |
| Exit workflow settings UI | **localStorage only** — not persisted to API |
| Generic workflow engine | **Does not exist** for exit (or globally) |

### 4.7 Frontend

| Page | Route | File |
|------|-------|------|
| HR dashboard | `/admin/exit-management` | `src/pages/exit/ExitManagement.jsx` |
| Detail + stepper | `/admin/exit-management/:id` | `src/pages/exit/ExitDetail.jsx` |
| Manager approvals | `/admin/exit-approvals` | `src/pages/exit/ManagerExitApprovals.jsx` |
| Employee self-service | `/admin/my-exit` | `src/pages/exit/EmployeeExit.jsx` |
| Workflow settings (UI only) | Admin Settings | `src/pages/admin/settings/ExitWorkflowSettings.jsx` |
| Clearance templates | Admin Settings | `src/pages/admin/settings/ClearanceChecklist.jsx` |

**Documentation:** `HRIS/docs/EXIT_MANAGEMENT.md` describes current flows, APIs, and business rules.

**Legacy note:** `src/pages/admin/hr/ExitManagement.jsx` appears unused; active UI is under `src/pages/exit/`.

### 4.8 Related patterns to reuse (not exit-specific)

| Module | Reuse idea |
|--------|------------|
| Onboarding workflow | Status enum + checklist seeding pattern |
| Leave settings | `approver` + `auto_approval` per type (single step) |
| Expenses | Status + role-gated approve/reject |
| Letter builder | Document templates with Exit category |

---

## 5. Gap Analysis (As-Is vs Target)

| Capability | As-Is | Target | Gap severity |
|------------|-------|--------|--------------|
| Tenant workflow definition | UI prototype (localStorage) | DB-backed templates + versioning | **High** |
| Workflow execution engine | Fixed status in service | `WorkflowEngine` + step instances | **High** |
| Multi-step approvals | Single approve/reject | Approval nodes + resolver | **High** |
| Parallel steps | Not supported | Parallel node groups in engine | **Medium** |
| Dynamic forms | Static modals | `form_definitions` per node | **Medium** |
| Clearance | Templates seed tasks | Clearance as workflow node | **Low** (extend existing) |
| FnF | Single settlement endpoint | Pluggable calculators per tenant | **Medium** |
| Documents | Fixed types + PDF service | Document nodes in workflow | **Low** (extend existing) |
| Audit / SLA / sockets | Implemented | Keep; emit per step instance | **Low** |
| UI stepper | 6 fixed steps | Render from `step_instances` | **Medium** |

---

## 6. Recommended Migration Phases

### Phase 1 — Unify configuration (low risk)

- Persist exit workflow settings via API (replace `exitService.js` localStorage).
- Align `ExitWorkflowSettings` with `clearance_task_templates` or new workflow tables.
- Remove duplicate fallback logic in `exitManagementService.js` where possible.

### Phase 2 — Workflow schema + engine skeleton

- Add migrations: `exit_workflow_templates`, `nodes`, `edges`, `workflow_instances`, `step_instances`.
- Implement `WorkflowEngine` module (can start exit-only).
- Map current behavior to **“Default Resignation Template v1”** and **“Default Termination Template v1”**.

### Phase 3 — Route APIs through engine

- `approve` / `reject` / `updateStatus` → `completeStep`.
- Keep `exit_records.status` as **computed summary** for dashboards during transition.

### Phase 4 — Advanced workflow features

- Multi-level and parallel approvals.
- Conditional edges (e.g. skip interview if policy says so).
- Dynamic forms on submission and mid-flow.

### Phase 5 — FnF plugins & document packs

- Tenant-selectable settlement calculators.
- Required document packs per template.

---

## 7. Design Principles (lock early)

1. **Template versioning + snapshot** — policy changes never break in-flight exits.
2. **Node types, not hard-coded statuses** — UI reads active steps from runtime.
3. **Config APIs vs runtime APIs** — separate admin settings from exit execution.
4. **Retain domain tables** — clearance, settlement, interview, documents stay; engine orchestrates.
5. **Generalize later** — engine design should allow leave/onboarding to adopt same core over time.

---

## 8. API Surface (current — reference)

Base: `GET/POST/PUT /api/v1/exit-management/...`

Key endpoints today:

- `POST /resignation`, `POST /termination`
- `PUT /:id/approve`, `PUT /:id/reject`, `PUT /:id/status`
- Clearance, assets, documents, interviews, settlements, audit-log
- Settings: termination types, clearance templates (admin settings module)

Permission: `EXIT_MANAGE` on most mutating/list operations.

Full list: see `HRIS/docs/EXIT_MANAGEMENT.md`.

---

## 9. Success Criteria (definition of done for the plan)

- [ ] Tenant admin can define exit workflow (steps, order, parallel groups) without code deploy.
- [ ] Employee/HR submission starts a **workflow instance** from tenant template.
- [ ] Approvals route to configured roles/users; full history in audit log.
- [ ] Clearance, assets, interview, FnF, documents run only when workflow reaches those nodes.
- [ ] In-flight exits unaffected by template edits (snapshot).
- [ ] Existing SLA escalation and WebSocket notifications work at step level.
- [ ] UI stepper and tabs driven by runtime steps, not fixed six statuses.

---

## 10. Context Block for ChatGPT / Other AI Assistants

Copy the section below when continuing implementation in a new chat:

```
PROJECT: Multi-tenant HRIS (React frontend d:\HRIS, Node API d:\HRIS_API)
TASK: Evolve Exit Management from fixed status pipeline to tenant-configurable workflow engine.

CURRENT STATE:
- Full exit vertical exists: exit_records, clearance_tasks, asset_returns, exit_documents,
  exit_interviews, final_settlements, exit_audit_logs, clearance_task_templates, termination_types.
- Fixed statuses: Pending Approval → Approved → clearance → interview → settlement → Completed.
- Single-step approve/reject for resignations. Terminations start at In Progress.
- Tenancy: one Postgres DB per tenant; no tenant_id on exit rows.
- ExitWorkflowSettings.jsx saves to localStorage only (exitService.js) — NOT wired to API.
- clearance_task_templates ARE API-backed and seed tasks on approval/termination create.

TARGET:
- Universal exit runtime + per-tenant workflow templates (nodes: approval, clearance, form,
  asset_return, interview, fnf, document, system_action).
- workflow_instances + step_instances with template snapshot on start.
- Shared WorkflowEngine; node handler strategy pattern.
- Phased migration: (1) persist settings (2) schema+engine (3) route APIs (4) parallel/forms (5) FnF plugins.

KEY FILES:
- API: HRIS_API/src/modules/exitManagement/*
- Settings: HRIS_API/src/modules/exitSettings/*
- Migrations: HRIS_API/src/migrations/tenants/009, 060-063
- UI: HRIS/src/pages/exit/*, HRIS/src/components/exit/*
- Docs: HRIS/docs/EXIT_MANAGEMENT.md, HRIS/docs/EXIT_MANAGEMENT_DYNAMIC_WORKFLOW_PLAN_REPORT.md

DO NOT: Throw away existing tables; extend with workflow layer.
DO: Snapshot template version when exit starts.
```

---

## 11. Document History

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-05-29 | Initial report from architecture discussion and codebase review |

---

*End of report*
