# Payroll Module

> **Source audit:** June 2026 — derived from live codebase at `d:\HRIS` (frontend) and `d:\HRIS_API` (backend).

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [What Is Implemented vs. What Is Not](#2-what-is-implemented-vs-what-is-not)
3. [Database Schema](#3-database-schema)
4. [Salary Registry (Employee Salaries)](#4-salary-registry-employee-salaries)
5. [Payroll Items Catalog](#5-payroll-items-catalog)
6. [API Reference](#6-api-reference)
7. [Frontend Pages](#7-frontend-pages)
8. [Known Bugs & Gaps](#8-known-bugs--gaps)

---

## 1. Module Overview

The payroll module is **minimal and partially scaffolded**. It provides a flat salary record store and a payroll items catalog. The payslip, payroll run, LOP calculation, tax deduction, and most CRUD operations exist in the UI as dead buttons with no backend connection.

| Feature | Status |
|---|---|
| Employee salary record (store net salary + JSONB components) | Implemented |
| Payroll items catalog (additions, overtime, deductions) | Implemented |
| Payslip generation | **Not implemented** (static hardcoded HTML) |
| Payroll run (monthly batch) | **Not implemented** |
| Attendance feed into payroll (LOP, OT pay) | **Not implemented** |
| Tax / statutory deductions | **Not implemented** |
| Payroll approval / lock workflow | **Not implemented** |
| Salary structure templates | **Not implemented** |
| Bulk salary run | **Not implemented** |
| Export | **Not implemented** (button present, no handler) |
| Edit salary (from table row) | **Not implemented** (button has no onClick) |
| Delete salary | **Not implemented** (button has no onClick) |

---

## 2. What Is Implemented vs. What Is Not

### Implemented End-to-End

- **Store a salary record per employee:** net salary + free-form `earnings` JSONB + `deductions` JSONB (upsert — one record per employee).
- **List salary records:** paginated, searchable by name/emp_code, filterable by `departmentId`.
- **Payroll items catalog:** Add, list items with `name`, `type` (addition/overtime/deduction), `category`, `amount`.
- **Notifications:** In-app notification to employee on salary update; admin notification on new payroll item creation.

### Dead UI (no backend wired)

| Dead element | File | Notes |
|---|---|---|
| `Payslip.jsx` (entire file) | `src/pages/admin/finance/Payslip.jsx` | Fully hardcoded static HTML — company "XYZ Technologies", employee "Anthony Lewis", amounts are string literals. No API calls. |
| "Payslip" button in `Payroll.jsx` | `Payroll.jsx:152` | Renders a button with no `onClick`. Clicking does nothing. |
| Edit salary button | `Payroll.jsx:164` | No `onClick`. |
| Delete salary button | `Payroll.jsx:165` | No `onClick`. |
| "Export" button | `Payroll.jsx:208` | No `onClick`. |
| `PayrollSettings.jsx` (entire file) | `src/pages/admin/finance/PayrollSettings.jsx` | Static hardcoded arrays. All modal forms call `e.preventDefault()` and do nothing. Superseded by Payroll Items tab inside `Payroll.jsx`. |

---

## 3. Database Schema

### `employee_salaries`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `employee_id` | INTEGER NOT NULL FK → employees ON DELETE CASCADE | |
| `net_salary` | DECIMAL(15,2) NOT NULL DEFAULT 0.00 | |
| `earnings` | JSONB DEFAULT `'{}'` | Free-form key/value map of earning components |
| `deductions` | JSONB DEFAULT `'{}'` | Free-form key/value map of deduction components |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| UNIQUE | `(employee_id)` | One record per employee — upsert model |

**Note:** `earnings` and `deductions` are free-form JSONB with no schema enforcement. The UI Add Salary modal only collects `employee_id` and `net_salary` — both JSONB fields default to `{}` and are never populated from the UI.

### `payroll_items`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `name` | VARCHAR(255) NOT NULL | |
| `type` | VARCHAR(50) CHECK | `'addition'` \| `'overtime'` \| `'deduction'` |
| `category` | VARCHAR(255) | e.g. `'Monthly Remuneration'`, `'Additional Remuneration'` |
| `amount` | DECIMAL(15,2) DEFAULT 0.00 | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**No relationship between `payroll_items` and `employee_salaries`.** Items catalog and salary records are completely disconnected — there is no FK or reference from `employee_salaries.earnings` to `payroll_items.id`.

### Tables That Do NOT Exist

The following tables are **not** in any tenant migration:

- `payroll_runs` — no payroll run cycle table
- `pay_periods` — no period table (pay period concept exists in attendance for `is_closed` flag but is not a formal payroll table)
- `payslips` — no generated payslip records
- `tax_brackets` / `tax_components` — no tax tables
- `salary_structures` / `salary_templates` — no template system

---

## 4. Salary Registry (Employee Salaries)

### Add / Update Salary

`POST /admin/payroll/salaries` — upserts on `(employee_id)` conflict.

Body:
```json
{
  "employee_id": 12,
  "net_salary": 85000.00,
  "earnings": {},
  "deductions": {}
}
```

### List Salaries

`GET /admin/payroll/salaries`

Query params:
- `search` — filters by `full_name` or `emp_code` (ILIKE)
- `departmentId` — filters by `department_id`

Response includes employee join: `full_name`, `emp_code`, `work_email`, `phone`, `department`, `designation`.

### Notifications on Salary Update

After an upsert, an in-app notification is sent to the employee informing them their salary record has been updated.

---

## 5. Payroll Items Catalog

### Purpose

A catalog of named addition/overtime/deduction component templates. Used for reference or future linking to salary records (currently not linked to any employee record).

### List Items

`GET /admin/payroll/items?type=addition|overtime|deduction`

Returns items filtered by type (or all if `type` omitted).

### Create Item

`POST /admin/payroll/items`

Body:
```json
{
  "name": "Transport Allowance",
  "type": "addition",
  "category": "Monthly Remuneration",
  "amount": 2000.00
}
```

After creation, an admin notification is sent.

### Missing Operations

No `PUT`, `PATCH`, or `DELETE` endpoints exist for either salaries or items. Editing or removing requires direct database access.

---

## 6. API Reference

All routes require authentication + `payroll.view` permission.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/payroll/salaries` | List salary records (with employee join). Query: `search`, `departmentId` |
| POST | `/admin/payroll/salaries` | Upsert salary record. Body: `employee_id`, `net_salary`, `earnings`, `deductions` |
| GET | `/admin/payroll/items` | List payroll items. Query: `type` |
| POST | `/admin/payroll/items` | Create payroll item. Body: `name`, `type`, `category`, `amount` |

**Missing endpoints (no backend routes exist):**

| Operation | Missing endpoint |
|---|---|
| Update salary | `PUT /admin/payroll/salaries/:id` |
| Delete salary | `DELETE /admin/payroll/salaries/:id` |
| Update item | `PUT /admin/payroll/items/:id` |
| Delete item | `DELETE /admin/payroll/items/:id` |
| Generate payslip | `GET /admin/payroll/payslip/:employeeId` |
| Run payroll | `POST /admin/payroll/run` |
| Export | `GET /admin/payroll/export` |

---

## 7. Frontend Pages

### `Payroll.jsx` (`src/pages/admin/finance/Payroll.jsx`)

The main payroll page. Two tabs:

**Tab 1 — Salary Registry:**
- Table: lists employees with their salary records (live data from API).
- "Add Salary" button → modal → calls `POST /admin/payroll/salaries`.
- Edit row button → no handler (dead).
- Delete row button → no handler (dead).
- "Payslip" button → no handler (dead).
- "Export" button → no handler (dead).
- Department filter → hardcoded options: "All Departments" + "Finance (id: 1)" only.

**Tab 2 — Payroll Items:**
- Table: lists items from `GET /admin/payroll/items` (live data).
- "Add Item" button → modal → calls `POST /admin/payroll/items`.
- Edit/Delete buttons per row → no handlers (dead).

### `PayrollSettings.jsx` (`src/pages/admin/finance/PayrollSettings.jsx`)

Standalone page with three hardcoded data arrays (`additionsData`, `overtimeData`, `deductionsData`). All modal form submissions call `e.preventDefault()` and do nothing. This page appears to be an old stub superseded by the Payroll Items tab.

### `Payslip.jsx` (`src/pages/admin/finance/Payslip.jsx`)

Entirely static hardcoded HTML displaying a dummy payslip:
- Company: "XYZ Technologies"
- Employee: "Anthony Lewis"
- Salary figures and deductions are hardcoded strings
- No API calls, no props, no dynamic data

---

## 8. Known Bugs & Gaps

| # | Severity | File:Line | Description |
|---|---|---|---|
| 1 | CRITICAL | `payroll.routes.js:16,19` | Both `POST /salaries` and `POST /items` (write operations) use `requirePermission(P.PAYROLL_VIEW)` instead of a write permission — any read-only payroll viewer can create or overwrite salary records |
| 2 | HIGH | `Payroll.jsx:164-165` | Edit and Delete buttons on salary table rows have no `onClick` handlers — dead UI |
| 3 | HIGH | `Payroll.jsx:208` | Export button has no `onClick` handler — dead UI |
| 4 | HIGH | `Payroll.jsx:152` | Payslip button has no `onClick` handler — dead UI |
| 5 | HIGH | `Payslip.jsx` (entire file) | Fully static hardcoded HTML with fake company/employee data. No API calls, not usable for real payslip generation |
| 6 | HIGH | No backend | No payroll run, no pay period management, no LOP calculation from attendance, no OT pay computation, no tax tables — the payroll module is effectively a flat salary data store |
| 7 | MEDIUM | `Payroll.jsx:269` | Department filter dropdown hardcoded to "Finance (id: 1)" — breaks for all other tenants |
| 8 | MEDIUM | `PayrollSettings.jsx` (entire file) | Entire file is a dead stub — all form submissions call `e.preventDefault()` and do nothing; data is hardcoded |
| 9 | MEDIUM | `employee_salaries` schema | `earnings` and `deductions` are free-form JSONB; the UI never populates them (only `net_salary` is collected). The JSONB component structure is completely disconnected from the `payroll_items` catalog |
| 10 | INFO | No file | No endpoints for `DELETE` or `PUT` on either salaries or payroll items — edits and deletes require direct DB access |
