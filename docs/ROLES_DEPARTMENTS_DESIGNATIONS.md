# Roles, Departments, Designations, Department Head & Reporting Manager

> **Source audit:** June 2026 — derived from live codebase at `d:\HRIS` (frontend) and `d:\HRIS_API` (backend).

---

## Table of Contents

1. [Concept Overview](#1-concept-overview)
2. [Database Schema](#2-database-schema)
3. [Roles & Permissions (RBAC)](#3-roles--permissions-rbac)
4. [Data Scopes](#4-data-scopes)
5. [Departments](#5-departments)
6. [Department Head](#6-department-head)
7. [Designations](#7-designations)
8. [Reporting Manager / Team Lead](#8-reporting-manager--team-lead)
9. [How Everything Connects](#9-how-everything-connects)
10. [Approval Workflows (Attendance, Leave, Exit)](#10-approval-workflows-attendance-leave-exit)
11. [API Reference](#11-api-reference)
12. [Permission Slugs](#12-permission-slugs)
13. [Known Issues & Limitations](#13-known-issues--limitations)

---

## 1. Concept Overview

| Concept | What it is | Where stored |
|---|---|---|
| **Role** | Portal access + permission set for an employee's login | `rbac_roles` table + `employees.rbac_role_id` FK |
| **Data Scope** | What records a role's members can see (SELF / TEAM / DEPARTMENT / ALL) | `role_data_scopes.scope` |
| **Department** | Organisational unit that groups employees | `departments` table + `employees.department_id` FK |
| **Department Head** | The one employee who manages a department | `departments.manager_id` FK → `employees.id` |
| **Designation** | Job title label scoped to a department | `designations` table; linked by name to `employees.job_title` |
| **Reporting Manager** | An employee's direct manager in the reporting hierarchy | `employees.reporting_manager_id` self-referencing FK |
| **Team Lead** | No separate concept in DB — referred to as the Reporting Manager in approvals | Same as Reporting Manager |

**Key design rules:**
- Role ↔ Designation have **no FK relationship**. They are completely independent concepts.
- Designation has **no FK on the employee record** (`employees.job_title` is a free-text string, not an ID).
- An employee can be a Department Head and have any data scope simultaneously — the two are independent.

---

## 2. Database Schema

### `employees` (relevant columns)

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `emp_id` | VARCHAR(20) UNIQUE | Auto-generated, e.g. `EMP-001` |
| `full_name` | VARCHAR(255) | |
| `job_title` | VARCHAR(255) | Free-text copy of a designation name — **not an FK** |
| `department` | VARCHAR(255) | Denormalized string copy of department name |
| `department_id` | INTEGER FK → `departments(id)` ON DELETE SET NULL | Added in migration `022` |
| `reporting_manager_id` | INTEGER FK → `employees(id)` ON DELETE SET NULL | Self-reference |
| `rbac_role_id` | INTEGER FK → `rbac_roles(id)` ON DELETE SET NULL | Portal login role |
| `grade` | VARCHAR | Employee grade level (separate from `designations.grade`) |
| `employment_status` | VARCHAR(50) | Active / Probation / Notice Period / On Leave / Terminated / Onboarding |
| `portal_enabled` | BOOLEAN DEFAULT false | Whether the employee has a portal login |

> **No `team_lead` column. No `designation_id` column. No `department_head` boolean on employees.**

---

### `departments`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `name` | VARCHAR(255) NOT NULL | |
| `code` | VARCHAR(50) UNIQUE NOT NULL | Auto-generated (prefix + 6 random hex chars) if not provided |
| `description` | TEXT | |
| `parent_id` | INTEGER FK → `departments(id)` ON DELETE SET NULL | Supports departmental hierarchy |
| `manager_id` | INTEGER FK → `employees(id)` ON DELETE SET NULL | The Department Head |
| `manager_emp_id` | VARCHAR(50) | Denormalized string copy of manager's `emp_id` (informational) |
| `is_active` | BOOLEAN DEFAULT true | |
| `status` | VARCHAR(20) CHECK ('active', 'inactive') | |
| `created_by` | INTEGER | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

---

### `designations`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `name` | VARCHAR(255) NOT NULL | The job title label |
| `department_id` | INTEGER FK → `departments(id)` ON DELETE CASCADE | **Required** |
| `department_name` | VARCHAR(150) | Denormalized copy, kept in sync on updates |
| `description` | TEXT | |
| `grade` | VARCHAR(20) | e.g. L1 / L2 / Senior |
| `is_active` | BOOLEAN DEFAULT true | |
| `status` | VARCHAR(20) CHECK ('active', 'inactive') | |
| `created_by` | INTEGER | |
| UNIQUE | `(LOWER(name), department_id)` | Same designation name is unique per department |

---

### `rbac_roles`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `name` | VARCHAR(128) NOT NULL UNIQUE | |
| `description` | TEXT | |
| `is_system` | BOOLEAN DEFAULT false | System roles cannot be edited or deleted |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

---

### `rbac_permissions`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `key` | VARCHAR(64) UNIQUE | Permission slug, e.g. `departments.manage` |
| `label` | VARCHAR(128) | Human-readable name shown in the Roles UI |
| `sort_order` | INTEGER | |

---

### `rbac_role_permissions` (M:N join)

`role_id` FK → `rbac_roles(id)` ON DELETE CASCADE  
`permission_id` FK → `rbac_permissions(id)` ON DELETE CASCADE

---

### `role_data_scopes`

`role_id` INTEGER PRIMARY KEY FK → `rbac_roles(id)` ON DELETE CASCADE  
`scope` VARCHAR(20) CHECK IN (`'SELF'`, `'TEAM'`, `'DEPARTMENT'`, `'ALL'`)

One row per role. The scope determines what employee records members of that role can see.

---

## 3. Roles & Permissions (RBAC)

### Nature of Roles

- Roles are **tenant-specific** — stored per-tenant DB schema, never shared between tenants.
- Every tenant starts with one built-in system role: **"Organisation Admin"** (`is_system = TRUE`).
  - Always gets `scope = 'ALL'` and all plan-permitted permissions.
  - Cannot be renamed, edited, or deleted.
- Tenants can create unlimited custom roles (any user with `system-settings` or the `departments.manage` permission can manage roles — guarded by `requireOrgSettingsAccess` middleware).

### Permissions: Dual-Key System

Permissions have two parallel naming schemes that the system bridges automatically:

| Legacy key | Action slug | Meaning |
|---|---|---|
| `departments` | `departments.manage` | Manage departments and designations |
| `attendance` | `attendance.view`, `attendance.manage` | View / manage attendance |
| `employees` | `employee.view`, `employee.create`, `employee.edit`, `employee.delete` | Employee CRUD |
| `payroll` | `payroll.view`, `payroll.manage` | Payroll access |
| *(see `permissions.js` for full list)* | | |

The `expandPermissionKeys()` function in `authz.service.js` bi-directionally expands both sets into a flat `Set` at runtime — so checking either form always works.

`filterPermissionsByTenantPlan()` further limits the available permissions to those enabled by the tenant's subscription plan (via `public.tenant_access_controls`).

### Role → Designation

**There is no relationship.** A role is a portal access/permission bundle linked to an employee. A designation is a job-title label linked to a department. They do not share a FK or any constraint.

An employee has both:
- `employees.rbac_role_id` → their portal access role
- `employees.job_title` → their designation name (free text)

---

## 4. Data Scopes

Each role carries one data scope that gates what employee records its members can see.

| Scope | Who sees what |
|---|---|
| `SELF` | Only their own employee record |
| `TEAM` | Their direct reports (`employees.reporting_manager_id = auth.employeeId`) AND/OR all employees in their managed department (`employees.department_id = auth.managedDepartmentId`) |
| `DEPARTMENT` | All employees in the same department string (`employees.department = auth.department`) |
| `ALL` | All employees in the tenant — no restriction (only Organisation Admin can hold this; it cannot be changed) |

**Source:** `d:\HRIS_API\src\utils\applyDataScope.js` — `buildEmployeeScopeConditions()` and `assertEmployeeRecordAccess()`.

**How `auth.managedDepartmentId` is populated:**  
On every authenticated request, `authz.service.js → loadAuthContext()` runs:
```sql
SELECT id FROM departments WHERE manager_id = $1 AND is_active = true LIMIT 1
```
This sets `auth.managedDepartmentId` if the employee is a department head. It is read fresh from the DB on every request — no JWT caching issue, but a small performance overhead.

**TEAM scope is cumulative:** A TEAM-scoped user who is also a dept head sees both their direct reports AND all employees in the department they manage.

---

## 5. Departments

**Backend:** `d:\HRIS_API\src\modules\departments\`  
**Frontend:** `d:\HRIS\src\pages\admin\settings\Departments.jsx`  
**Service:** `d:\HRIS\src\services\departmentService.js`

### Fields

| Field | Editable? | Notes |
|---|---|---|
| Name | Yes | Min 2, max 150 chars |
| Code | Yes (optional) | Alphanumeric + `_-`, max 20; auto-generated if omitted |
| Description | Yes | Free text |
| Parent Department | Yes | Enables multi-level hierarchy |
| Department Head | Yes | Employee picker via `GET /departments/managers` |
| Status | Yes | Active / Inactive |

### Soft Delete

Departments are soft-deleted (set `is_active = false`), not hard-deleted.

- **Blocked** if employees are assigned, unless `?force=true` is passed.
- On deactivation, all child designations are also deactivated.
- The `employees.department_id` FK is `ON DELETE SET NULL` — this only fires on a **hard** DELETE, not soft-delete. Existing employee assignments survive a soft-delete.

### List Response (stats block)

```json
{
  "total": 12,
  "active": 10,
  "inactive": 2,
  "assignedHeads": 7
}
```

`assignedHeads` = count of departments where `manager_id IS NOT NULL`.

### Hierarchy

`departments.parent_id` supports multi-level hierarchies. There is no enforced depth limit and no cycle detection (cycle prevention is the responsibility of the UI). The list API returns a flat paginated list, not a tree. No tree-rendering feature exists in the current frontend.

---

## 6. Department Head

**How stored:** `departments.manager_id` — INTEGER FK to `employees.id`.

### Setting a Department Head

Set via `POST /departments` or `PUT /departments/:id` with `manager_id` (or `managerId`) in the request body.

- Validated: the employee must exist and be active.
- The `GET /departments/managers` endpoint provides the employee search picker.
  - Accepts optional `?roleId` to filter to employees of a specific role.
  - Returns all active employees (any role) by default.
- A notification/email is sent to the employee when assigned as department head.

### What Department Head Unlocks

Being a department head is not a role — it is a property of the `departments` row. It affects:

| Feature | Effect |
|---|---|
| **Data scope** | Expands TEAM-scoped view to include all employees in the managed department (even with SELF/TEAM role scope) |
| **Attendance Stage 2** | Can approve regularization and overtime at the "Department" stage (if OT workflow requires dept approval) |
| **Attendance fallback** | If an employee has no `reporting_manager_id`, the dept head can act at Stage 1 |
| **Leave routing** | If employee has no `reporting_manager_id`, initial leave status is `Pending Dept Approval` (dept head approves) |
| **Exit management** | Notified as part of the clearance/exit hierarchy |
| **Exit access** | Can view and act on exit requests for employees in their department |

### One Employee, Multiple Departments

The schema allows an employee to be `manager_id` of multiple departments. However, `loadManagedDepartmentId()` uses `LIMIT 1` — only the first matching department is recognized for access control purposes. Managing multiple departments is **not fully supported**.

---

## 7. Designations

**Backend:** `d:\HRIS_API\src\modules\designations\`  
**Frontend:** `d:\HRIS\src\pages\admin\settings\Designations.jsx`  
**Service:** `d:\HRIS\src\services\designationService.js`

### Fields

| Field | Required? | Notes |
|---|---|---|
| Name | Yes | The job title label, max 255 chars |
| Department | Yes | Must link to an existing department (`department_id` FK) |
| Grade | No | e.g. L1 / L2 / Senior — for HR reporting only |
| Description | No | Free text |
| Status | Yes | Active / Inactive |

### Unique Constraint

Same designation name is allowed in different departments:  
`UNIQUE (LOWER(name), department_id)`

### Relationship to Employees

- There is **no `designation_id` FK** on the employee record.
- An employee's `job_title` is a free-text string that is expected to match a designation name, but this is not enforced by the database.
- Employee count per designation is computed dynamically:
  ```sql
  employees.job_title = ds.name AND employees.department_id = ds.department_id
  ```
  If a designation name is changed, its employee count silently drops to 0 until employee records are updated.

### Relationship to Roles

None. Designation and role are independent. Assigning a designation does not grant or change portal permissions.

### Designation Picker on Employee Form

When creating or editing an employee, the frontend calls:
```
GET /employees/designations-for-department?departmentId=1
```
Returns active designations for the selected department to populate the Job Title dropdown.

### Delete Behavior

Designations are **hard-deleted** (unlike departments which are soft-deleted). No cascade to employee records — their `job_title` string remains unchanged.

---

## 8. Reporting Manager / Team Lead

**How stored:** `employees.reporting_manager_id` — self-referencing FK to `employees.id` ON DELETE SET NULL.

### Setting a Reporting Manager

Set on employee create or update via:
- `reportingManagerId` — direct integer employee ID
- `reportingManagerEmpId` — string like `EMP-005`, resolved to an ID server-side

Any user with `employee.edit` permission can assign or change a reporting manager.

### Team Lead

**There is no `team_lead` column or separate concept in the database.**

The constant `APPROVER_ROLES.TEAM_LEAD = 'Team Lead'` exists in `attendance.constants.js` — this is a legacy label from the old step-based approval workflow (stored in `attendance_regularization_steps.approver_role`). In the current column-based approval system, the "team lead" role is effectively the **direct reporting manager** (`employees.reporting_manager_id`). If a user refers to "team lead" they mean the reporting manager.

### Where Reporting Manager Is Used

| Feature | How `reporting_manager_id` is used |
|---|---|
| **Employee directory** | Shown as "Manager" column (joined as `manager_name`) |
| **Data scope — TEAM** | Employees where `reporting_manager_id = auth.employeeId` are visible |
| **Attendance: Stage 1** | The reporting manager is the default Stage-1 approver for regularization and overtime |
| **Attendance fallback** | If employee has no reporting manager, dept head or HR acts at Stage 1 |
| **Leave routing** | If employee has `reporting_manager_id`, initial leave status is `Pending Manager Approval`; otherwise `Pending Dept Approval` |
| **Regularization workflow** | `'manager'` stage is only included in the chain if `emp.reporting_manager_id` is non-null |
| **Exit management** | Reporting manager is fetched and notified for clearance routing |
| **Exit access** | A user is in the "hierarchy" of an exit request if they are the employee's reporting manager |

### Approval Chain Summary

```
Employee submits request
        │
        ▼
Stage 1: Reporting Manager
  ├── If no reporting_manager_id → Dept Head acts here
  └── If no dept head either → HR/Admin acts
        │
        ▼
Stage 2: Department Head (attendance regularization/OT only)
  └── Skip if workflow does not require dept approval
        │
        ▼
Stage 3: HR / Org Admin
```

Leave approval is **two-stage only** (Manager → HR), not three-stage.

---

## 9. How Everything Connects

```
rbac_roles (portal permissions + data scope)
    │
    │ rbac_role_id (FK)
    ▼
employees
    │ ├── department_id ──────────► departments
    │ │                                 │ manager_id ──── points back to one employee (Dept Head)
    │ │                                 │ parent_id  ──── self-reference (hierarchy)
    │ │
    │ ├── reporting_manager_id ──────── points back to one employee (Team Lead / Manager)
    │ │
    │ └── job_title (string) ──────────► matches designations.name (no FK)
    │                                        │ department_id ──► departments
    │
    └── rbac_role_id ──► role_data_scopes.scope (SELF/TEAM/DEPARTMENT/ALL)
```

### Data flow at login

1. Employee logs in → JWT issued with `employeeId`, `db_name`, `role`.
2. On every API request, `loadAuthContext()` runs:
   - Loads `rbac_role_id` → fetches permissions → `auth.allowedModules`
   - Loads `role_data_scopes.scope` → `auth.scope`
   - Fetches `departments.id WHERE manager_id = employeeId` → `auth.managedDepartmentId`
3. Scope filters, approval guards, and visibility checks all use `auth.scope`, `auth.employeeId`, and `auth.managedDepartmentId`.

---

## 10. Approval Workflows (Attendance, Leave, Exit)

### Attendance Regularization

```
Pending
  → (Stage 1: Reporting Manager) → Pending Dept Approval
  → (Stage 2: Dept Head)         → Pending HR Approval
  → (Stage 3: HR/Admin)          → Approved | Rejected
```

- Stage 1 is skipped if the employee has no `reporting_manager_id` — goes directly to Dept or HR.
- Stage 2 is included only if the employee has a `reporting_manager_id`.

### Overtime

```
Pending
  → (Stage 1: Reporting Manager) → Manager_Approved
  → (Stage 2: Dept Head)         → Dept_Approved
  → (Stage 3: HR/Admin)          → Approved | Rejected
```

OT workflow is configurable via `overtime_approval_workflow` setting (stored but not all variants fully wired — see attendance-leave-audit.md).

### Leave

```
Pending Manager Approval    ← if employee has reporting_manager_id
Pending Dept Approval       ← if employee has NO reporting_manager_id
  → (Dept Head approves)    → Pending HR Approval
  → (HR approves)           → Approved | Rejected
```

Leave is **two-stage at most** (no separate dept approval stage after manager approval).

### Exit

The exit hierarchy check includes both `reporting_manager_id` and `departments.manager_id` — either the reporting manager or the dept head can view and act on an exit clearance. Notifications are sent to both.

---

## 11. API Reference

### Departments

| Method | Endpoint | Permission | Notes |
|---|---|---|---|
| GET | `/departments` | `departments.manage` | Paginated list + stats |
| GET | `/departments/filter-options` | `departments.manage` | For filter dropdowns |
| GET | `/departments/export` | `departments.manage` | PDF or Excel |
| GET | `/departments/managers` | `departments.manage` | Employee search for dept head picker |
| GET | `/departments/:id` | `departments.manage` | Single department detail |
| POST | `/departments` | `departments.manage` | Create department |
| PUT | `/departments/:id` | `departments.manage` | Update department (incl. setting/clearing dept head) |
| DELETE | `/departments/:id` | `departments.manage` | Soft delete; `?force=true` to archive with employees |

### Designations

| Method | Endpoint | Permission | Notes |
|---|---|---|---|
| GET | `/designations` | `departments.manage` | Paginated list |
| GET | `/designations/filter-options` | `departments.manage` | |
| GET | `/designations/export` | `departments.manage` | |
| GET | `/designations/by-department/:deptName` | `departments.manage` | Look up by name |
| GET | `/designations/by-department-id/:deptId` | `departments.manage` | Look up by ID |
| GET | `/designations/:id` | `departments.manage` | |
| POST | `/designations` | `departments.manage` | |
| PUT | `/designations/:id` | `departments.manage` | |
| DELETE | `/designations/:id` | `departments.manage` | **Hard delete** |

### RBAC Roles

| Method | Endpoint | Permission | Notes |
|---|---|---|---|
| GET | `/rbac/permissions` | org-settings | All permissions |
| GET | `/rbac/permissions/available` | org-settings | Plan-filtered permissions |
| GET | `/rbac/roles` | org-settings | All roles for this tenant |
| GET | `/rbac/roles/:id` | org-settings | Role detail with permissions |
| POST | `/rbac/roles` | org-settings | Create custom role |
| PUT | `/rbac/roles/:id` | org-settings | Update name/description/scope |
| PUT | `/rbac/roles/:roleId/permissions` | org-settings | Assign permissions + scope to role |
| DELETE | `/rbac/roles/:id` | org-settings | Delete (not allowed for system roles) |

### Employees — Reporting Manager

| Method | Endpoint | Permission | Notes |
|---|---|---|---|
| GET | `/employees/designations-for-department` | `employee.view` | `?departmentId=N` — job title picker |
| PATCH | `/employees/:id` | `employee.edit` | Set `reportingManagerId` or `reportingManagerEmpId` |

---

## 12. Permission Slugs

| Slug | Controls |
|---|---|
| `departments.manage` | Create / edit / delete departments AND designations |
| `employee.view` | List and view employee records |
| `employee.create` | Create employees (including setting dept + reporting manager) |
| `employee.edit` | Update employees (including changing reporting manager or dept head assignment) |
| `employee.delete` | Delete/terminate employees |
| `system-settings` / `org-settings` | Manage RBAC roles and permissions |

---

## 13. Known Issues & Limitations

| # | Severity | Description |
|---|---|---|
| 1 | **HIGH** | `DEPT_MANAGER` scope is referenced in `applyDataScope.js` (dead code) but is not a valid value in the `role_data_scopes` CHECK constraint — it can never be stored or assigned |
| 2 | **HIGH** | `loadManagedDepartmentId` uses `LIMIT 1` — an employee managing multiple departments only gets access control for the first one |
| 3 | **MEDIUM** | No `designation_id` FK on employees — renaming a designation silently drops its employee count to 0 and the link breaks for existing employees |
| 4 | **MEDIUM** | `DEPARTMENT` scope compares `employees.department` (string) against `auth.department` — a department rename does not update existing employees, breaking dept-scoped access for already-assigned employees |
| 5 | **MEDIUM** | `manager_emp_id` on departments is a denormalized string that can become stale if the employee's `emp_id` changes |
| 6 | **MEDIUM** | Designation delete is a **hard DELETE** — unlike department soft-delete, no soft-delete cascade or audit trail |
| 7 | **LOW** | No org chart view or tree-rendering — the hierarchy implied by `reporting_manager_id` and `departments.parent_id` is not visually surfaced |
| 8 | **LOW** | "Team Lead" has no DB concept — only a legacy label in `attendance.constants.js`; all approvals use `reporting_manager_id` as the de-facto team lead |
| 9 | **LOW** | `auth.managedDepartmentId` is DB-read on every request — correct but adds latency for every authenticated call |
| 10 | **LOW** | `assertCanActOnPendingStep()` in `attendanceAuth.service.js` references undefined `STEP_KIND`/`normalizeStepKind` — marked `@deprecated`, harmless only because the new column-based path is used exclusively |

---

## Related Documents

- [Attendance Management](./ATTENDANCE_MANAGEMENT.md)
- [Leave Management](./LEAVE_MANAGEMENT.md)
- [Exit Management](./EXIT_MANAGEMENT.md)
