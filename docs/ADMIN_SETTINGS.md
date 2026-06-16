# Admin Settings

> **Source audit:** June 2026 — derived from live codebase at `d:\HRIS` (frontend) and `d:\HRIS_API` (backend).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Settings Navigation & Tabs](#2-settings-navigation--tabs)
3. [General / Company Profile](#3-general--company-profile)
4. [Attendance Settings](#4-attendance-settings)
5. [Holiday Settings](#5-holiday-settings)
6. [Leave Settings](#6-leave-settings)
7. [Roles & Permissions](#7-roles--permissions)
8. [Security Settings](#8-security-settings)
9. [Notification Settings](#9-notification-settings)
10. [Email Settings](#10-email-settings)
11. [Billing](#11-billing)
12. [Document Settings](#12-document-settings)
13. [Audit Logs](#13-audit-logs)
14. [Backup & Restore](#14-backup--restore)
15. [Integration Settings](#15-integration-settings)
16. [Exit Settings](#16-exit-settings)
17. [Asset Settings](#17-asset-settings)
18. [Dead Settings (Stored But Never Enforced)](#18-dead-settings-stored-but-never-enforced)
19. [Known Bugs & Gaps](#19-known-bugs--gaps)

---

## 1. Architecture Overview

### Two Parallel Settings Systems

| System | Routes | Auth | Storage | Purpose |
|---|---|---|---|---|
| **Superadmin settings** | `/api/v1/settings/*` | Superadmin only | `public.settings` (key/value/group) | Platform-level config: SMTP, branding, reCAPTCHA, feature flags |
| **Tenant admin settings** | `/api/v1/admin/settings/*` | Tenant org admin | Per-tenant DB tables | Company profile, RBAC, notifications, documents, assets, etc. |

> The frontend `EmailSettings.jsx` section falls under the tenant admin UI path but the actual email configuration backend is superadmin-only. **There is no working email settings path for tenant admins.**

### Save/Discard Bar Pattern

`AdminSettings.jsx` uses a `registerToolbar` callback pattern:
- Sections that want the top Save/Discard bar call `registerToolbar({ dirty, saving, onSave, onDiscard, disableSave })`.
- Sections that manage their own saves (Holiday, Leave, Billing, Notifications, Email, Audit, Backup, Integrations) do **not** register a toolbar — the top bar is inert when these tabs are active.
- Holiday and Leave tabs explicitly pass `disableSave: true`, permanently disabling the top bar button.

---

## 2. Settings Navigation & Tabs

`AdminSettings.jsx` routes by `?tab=<id>` in the URL:

| Tab ID | Section Component | Has Save Bar | Backend API |
|---|---|---|---|
| `general` | Company profile | Yes | `/api/v1/admin/settings/` |
| `attendance` | AttendanceSection | Yes | `/api/attendance-settings` |
| `holidays` | HolidaysSection | No (own saves) | `/api/v1/holidays/*` |
| `leave` | LeaveSettings | No (own saves) | `/api/v1/settings/leave-types` |
| `roles` | RolesPermissions | Yes | `/api/v1/rbac/*` |
| `security` | PasswordSecurity | Yes | `/api/v1/admin/settings/password-policy` |
| `notifications` | NotificationSettings | No | `/api/v1/admin/settings/notifications` |
| `email` | EmailSettings | No | ❌ Not wired (see §10) |
| `billing` | BillingSettings | No (Stripe/PayPal flow) | Subscription routes |
| `documents` | DocumentSettings | No (own saves) | `/admin/settings/documents` |
| `audit` | AuditLogs | No | ❌ Not wired (placeholder) |
| `backup` | BackupRestore | No | ❌ Not wired (placeholder) |
| `exit` | ExitSettingsSection | No (own saves) | Exit management routes |
| `assets` | AssetSettingsSection | No (own saves) | `/admin/settings/asset-categories` |

---

## 3. General / Company Profile

**File:** `d:\HRIS\src\pages\admin\settings\sections\GeneralSection.jsx`  
**API:** `GET/PUT /api/v1/admin/settings/`  
**DB Table:** `tenant_admin_settings` (migrations 011, 024)

### Editable Fields (UI Exposed)

| Field | DB Column | Notes |
|---|---|---|
| Company Name | `company_name` | |
| Company Logo | `logo_url` | File upload, PNG/JPG, 2MB max — separate endpoint `POST /api/v1/admin/settings/logo` |
| Company Address | `address` | Textarea |
| Phone / Contact | `contact_details` | |
| Country | `country` | |
| Timezone | `timezone` | Used by `TimezoneContext` throughout the app |
| Financial Year Start | `financial_year_start` | Jan 1 / Apr 1 / Jul 1 / Oct 1 |
| Working Days | `working_days` | JSONB — 7-button Mon–Sun toggle |
| Office Locations | `locations` | JSONB array of strings |

### Fields Stored But NOT Exposed in UI

| DB Column | Notes |
|---|---|
| `default_work_calendar` | Stored but no UI field |
| `regional_holidays_enabled` | Stored but no UI field |
| `multiple_calendars_enabled` | Stored but no UI field |
| `default_probation_period` | Stored but no UI field; not read by any service |
| `default_notice_period` | Stored but no UI field; not read by exit management |
| `auto_assign_policies` | Stored; **enforced** by policy auto-assignment workflow |

### Enforcement

- `timezone` — enforced; used throughout the app for attendance timestamps.
- `auto_assign_policies` — enforced; read by `policies.employee.js` for auto-assigning compliance policies to new employees.
- `financial_year_start`, `default_probation_period`, `default_notice_period`, `working_days` (from this table) — stored but not consumed by any business logic currently.

---

## 4. Attendance Settings

Documented in full in [ATTENDANCE_OVERTIME_REGULARIZATION.md](./ATTENDANCE_OVERTIME_REGULARIZATION.md) — Section 9.

**File:** `d:\HRIS\src\pages\admin\settings\sections\AttendanceSection.jsx`  
**API:** `GET/PUT /api/attendance-settings`  
**DB Table:** `attendance_settings`

Summary of dead settings in this section:

| Setting | Why Dead |
|---|---|
| `overtime_approver` | Stored; stage routing ignores it — always hardcoded manager→dept→HR |
| `overtime_approval_workflow` (partial) | Only `'Auto-approve'` has a code path; `'HR only'`/`'Manager only'` have no effect |
| `regularization.approver` | Used only in legacy `buildApprovalChain`; active `buildStageChain` ignores it |
| `biometric_sync_enabled` | No biometric integration exists |
| `shift_type_default` / `shift_allow_employee_view` / `shift_change_request_enabled` | Shift Settings UI card is commented out; settings stored but not editable |
| `attendance_location_tracking` | Enables coordinate capture but no geofencing or radius enforcement |

---

## 5. Holiday Settings

Documented in full in [LEAVE_ABSENCE_HOLIDAY.md](./LEAVE_ABSENCE_HOLIDAY.md) — Section 9.

**File:** `d:\HRIS\src\pages\admin\settings\sections\HolidaysSection.jsx`  
**API:** `/api/v1/holidays/*`

Key notes:
- Section registers `disableSave: true` — the top-level Save button is always disabled on this tab.
- Saves happen per-action (Add / Edit / Delete holiday buttons).
- `HolidaySeedPanel` component inside `AttendanceSection.jsx` (not `HolidaysSection.jsx`) triggers UK bank holiday seeding.
- `HolidaySeedPanel` is missing a return statement — it renders nothing (see bugs).

---

## 6. Leave Settings

Documented in full in [LEAVE_ABSENCE_HOLIDAY.md](./LEAVE_ABSENCE_HOLIDAY.md) — Section 3.

**File:** `d:\HRIS\src\pages\admin\settings\LeaveSettings.jsx`  
**API:** `/api/v1/settings/leave-types`

Key notes:
- Section registers `disableSave: true` — the top-level Save button is disabled on this tab.
- All saves are per leave-type via Add / Edit modals.
- `entitlementLabel` field in the modal is labelled "Description" but has a 30-char server limit.

---

## 7. Roles & Permissions

Documented in full in [ROLES_DEPARTMENTS_DESIGNATIONS.md](./ROLES_DEPARTMENTS_DESIGNATIONS.md) — Section 3.

**File:** `d:\HRIS\src\pages\admin\settings\RolesPermissions.jsx`  
**API:** `/api/v1/rbac/*`

---

## 8. Security Settings

**File:** `d:\HRIS\src\pages\admin\settings\PasswordSecurity.jsx`  
**API:** `GET/PUT /api/v1/admin/settings/password-policy`  
**DB Table:** `password_policy` (per-tenant)

### Fields

| Field | DB Column | Default | Enforced |
|---|---|---|---|
| Minimum Password Length | `min_length` | 8 | Yes — enforced at password change/reset |
| Require Uppercase | `require_uppercase` | false | Yes |
| Require Numbers | `require_numbers` | false | Yes |
| Require Special Characters | `require_special_chars` | false | Yes |
| Password Expiry (days) | `password_expiry_days` | 0 (never) | Yes — blocks login if expired |
| Max Failed Login Attempts | `max_failed_attempts` | 5 | Yes — triggers account lockout |
| Lockout Duration (minutes) | `lockout_duration_minutes` | 30 | Yes |
| Session Timeout (minutes) | `session_timeout_minutes` | 60 | Yes |
| Two-Factor Authentication | `two_factor_enabled` | false | Yes — enforces 2FA at login |

---

## 9. Notification Settings

**File:** `d:\HRIS\src\pages\admin\settings\NotificationSettings.jsx`  
**API:** `GET/PUT /api/v1/admin/settings/notifications`  
**DB Table:** `notification_settings` (migration 016)

### Fields

| Field | DB Column | UI | Enforced |
|---|---|---|---|
| Email Notifications (global) | `email_notifications` | Toggle | **No** — emails sent regardless of this flag |
| SMS Notifications (global) | `sms_notifications` | Toggle | **No** — no SMS provider integrated |
| In-App Alerts (global) | `in_app_alerts` | Toggle | **No** — in-app always sent |
| Event matrix (7 events × 3 channels) | `event_notifications` JSONB | Checkboxes | **No** — no module reads this before sending |

### Event Types in the Matrix

`leave_approval`, `document_approval`, `visa_expiry`, `policy_assignment`, `performance_review_due`, `asset_issue_return`, `attendance_reminders`

### Why All Settings Are Dead

No module (leave, document, visa, policy, performance, asset, attendance) reads `notification_settings` before firing notifications or emails. All notifications are sent unconditionally from their respective services. The settings are stored and visible in the UI but have zero functional effect.

---

## 10. Email Settings

**File:** `d:\HRIS\src\pages\admin\settings\sections\EmailSettings.jsx`

### Current State — CRITICAL GAP

`EmailSettings.jsx` is a completely isolated component:
- **No `useEffect`** — settings are not loaded from the server on mount.
- **No API call** — no `axios`/`api.get` or `api.put` anywhere in the file.
- **No `registerToolbar` call** — the top-level Save button does nothing for this tab.
- All user input is held in local `useState` and silently discarded on page reload.

### Actual Email Backend

The real email settings backend (`settings.service.js`) stores SMTP configuration in the `public.settings` key/value table (superadmin DB) with these fields:
- `systemEmail`, `systemFromName`, `emailDelivery`
- `smtpHost`, `smtpPort`, `smtpUsername`, `smtpPassword` (masked on read), `smtpEncryption`

**Routes:** `GET/PUT /api/v1/settings/email` — require `requireRole('superadmin')`.  
**Test endpoint:** `POST /api/v1/settings/email/test`

**Enforcement:** On save, `Mailer.invalidate()` is called, so SMTP config is immediately live for system emails. Only a superadmin can configure this through the correct route.

**Mismatch:** The tenant admin `EmailSettings.jsx` tab exists in the admin UI but has no working connection to either the superadmin API or any tenant-level email table. Email configuration for tenant admins is currently impossible through the UI.

---

## 11. Billing

**File:** `d:\HRIS\src\pages\admin\settings\sections\BillingSettings.jsx`

### Current State — Fully Implemented

- Loads live plan data and current subscription status on mount.
- Supports Stripe and PayPal checkout flows.
- Returns from Stripe via `?stripe=success&session_id=` → `confirmCheckout`.
- Returns from PayPal via `?paypal=success&token=` → `confirmPaypalCheckout`.
- Displays current plan features, billing cycle, next payment date.

---

## 12. Document Settings

**File:** `d:\HRIS\src\pages\admin\settings\DocumentSettings.jsx`  
**API:** `GET/POST /admin/settings/documents`, `PUT/DELETE /admin/settings/documents/:id`  
**DB Table:** `document_types` (migration 017 + migration 037 for integer PK)

### Fields

| Field | DB Column | Enforced |
|---|---|---|
| Document Name | `name` | Required |
| Requirement | `mandatory_or_optional` | Yes — used in onboarding document prompts |
| Uploaded By | `who_must_upload` | `'Employee'` \| `'HR'` \| `'Both'` — stored |
| Applies to Roles | `applies_to_roles` | JSONB — stored; enforcement unclear (see bugs) |
| Visibility | `visibility` | `'HR only'` \| `'Manager + HR'` \| `'All'` \| `'Employee own only'` — partially enforced |
| HR Approval Required | `hr_approval_required` | **No** — stored but document approval workflow ignores this flag |
| Track Expiry Date | `expiry_tracking` | Yes — expiry date collected on upload |
| Reminder Before Expiry (days) | `reminder_before_expiry_days` | **No** — no background job sends expiry reminders |
| Status | `is_active` | Yes |

### Partial Enforcement

- `mandatory_or_optional` is read during onboarding to determine required upload prompts.
- `hr_approval_required` is stored but the document approval flow routes all documents for approval regardless — the flag is not checked.
- `reminder_before_expiry_days` is stored and saved correctly but no cron job or scheduled task reads it to send reminders.

---

## 13. Audit Logs

**File:** `d:\HRIS\src\pages\admin\settings\sections\AuditLogs.jsx`

### Current State — Placeholder

The component renders a **hardcoded static array of 4 fake log entries**. No API calls. No backend audit log module exists for tenant-level operations. No audit log table in tenant DB migrations.

> Note: Superadmin `accountSettings` has queries for some audit-adjacent data, but there is no tenant-level audit trail.

---

## 14. Backup & Restore

**File:** `d:\HRIS\src\pages\admin\settings\sections\BackupRestore.jsx`

### Current State — Placeholder

- Renders a hardcoded list of 3 fake backup entries.
- "Backup Now" button triggers a `setTimeout` (3 seconds) that sets `isBackingUp = false` — a fake loading state with no actual backup operation.
- "Restore" and "Select Backup" buttons are unstyled and do nothing.
- No backend module, no endpoint, no storage.

---

## 15. Integration Settings

**File:** `d:\HRIS\src\pages\admin\settings\sections\IntegrationSettings.jsx`

### Current State — Placeholder

- Renders a hardcoded list of 3 integrations: REST API, Webhooks, SSO/LDAP.
- "Configure" buttons do nothing.
- Data is a constant array (no `useState` mutation).
- No backend integration module exists.

---

## 16. Exit Settings

**File:** `d:\HRIS\src\pages\admin\settings\sections\ExitSettingsSection.jsx`

### Current State — Fully Implemented

Three sub-tabs:
- **Department Workflow** (`ExitWorkflowConfig`) — configure which departments participate in clearance.
- **Clearance Items** (`ClearanceItemsCatalog`) — manage checklist items per department.
- **Termination Types** (`TerminationTypes`) — manage termination reason codes.

All three call real API endpoints. Documented separately in exit management documentation.

---

## 17. Asset Settings

**File:** `d:\HRIS\src\pages\admin\settings\sections\AssetSettingsSection.jsx`  
**API:** `GET/POST/PATCH/DELETE /admin/settings/asset-categories`  
**DB Table:** `asset_categories`

### Asset Categories (in UI)

| Field | DB Column | Notes |
|---|---|---|
| Name | `name` VARCHAR(100) | Required |
| Icon | `icon` VARCHAR(50) | Optional |
| Color | `color` VARCHAR(20) | Optional |
| Active | `is_active` | Toggle |
| Sort Order | `sort_order` | Integer |

Full CRUD is implemented and functional via `useAssetSettings` hook.

### Asset Rules (Backend-Only — Not in UI)

`asset_rules` table (seeded with defaults) has full `GET/PUT /admin/settings/asset-rules` API, but **no UI in `AssetSettingsSection.jsx`**:

| Field | DB Column | Enforced |
|---|---|---|
| Assigning Rule | `assigning_rule` | **No** — asset assignment workflow doesn't read this |
| Return Rule | `return_rule` | **No** |
| Lost/Damaged Policy | `lost_damaged_policy` | **No** |
| Approval Workflow | `approval_workflow` | **No** |

All asset rule settings are stored via API and default-seeded, but the asset module never reads them to gate or route any action.

---

## 18. Dead Settings (Stored But Never Enforced)

| Setting | Table/Column | Stored | Enforced | Notes |
|---|---|---|---|---|
| `default_probation_period` | `tenant_admin_settings` | Yes | No | Not read by employee creation or onboarding |
| `default_notice_period` | `tenant_admin_settings` | Yes | No | Not read by exit management |
| `financial_year_start` | `tenant_admin_settings` | Yes | No | No leave-year or reporting calculations use this |
| `default_work_calendar` | `tenant_admin_settings` | Yes | No | |
| `regional_holidays_enabled` | `tenant_admin_settings` | Yes | No | |
| `multiple_calendars_enabled` | `tenant_admin_settings` | Yes | No | |
| `sms_notifications` (global) | `notification_settings` | Yes | No | No SMS provider |
| `email_notifications` (global toggle) | `notification_settings` | Yes | No | Emails always sent regardless |
| All event-level notification toggles | `notification_settings.event_notifications` | Yes | No | No module reads before sending |
| `expiry_tracking` reminder threshold | `document_types.reminder_before_expiry_days` | Yes | No | No background reminder job |
| `hr_approval_required` | `document_types` | Yes | No | Approval workflow ignores this flag |
| `assigning_rule` / `return_rule` / `lost_damaged_policy` / `approval_workflow` | `asset_rules` | Yes | No | Asset module doesn't read these |
| `overtime_approver` | `attendance_settings` | Yes | No | Stage routing ignores it |
| `biometric_sync_enabled` | `attendance_settings` | Yes | No | No biometric integration |
| `shift_type_default` / `shift_allow_employee_view` / `shift_change_request_enabled` | `attendance_settings` | Yes | No | Shift Settings UI card commented out |

---

## 19. Known Bugs & Gaps

| # | Severity | File | Description |
|---|---|---|---|
| 1 | CRITICAL | `EmailSettings.jsx` (entire file) | Zero API wiring — no `useEffect`, no `api.get`, no `api.put`. All email configuration input is silently discarded on page reload |
| 2 | HIGH | `AdminSettings.jsx` | No `case 'onboarding'` in the tab switch statement — `OnboardingSettingsSection` is imported but never rendered |
| 3 | HIGH | `AuditLogs.jsx` | Entirely hardcoded placeholder — no backend, no real log data |
| 4 | HIGH | `BackupRestore.jsx` | "Backup Now" runs a fake 3-second `setTimeout`. No actual backup. No backend |
| 5 | HIGH | `IntegrationSettings.jsx` | Fully static placeholder — no API, no backend integrations |
| 6 | MEDIUM | `document_types` migration 017 | `applies_to_roles` column is referenced in service and UI but may not be in the original migration — document type saves may silently drop role assignments |
| 7 | MEDIUM | `AssetSettingsSection.jsx` | `asset_rules` table has full GET/PUT API and default seed, but `AssetSettingsSection.jsx` only shows categories — rules UI is absent |
| 8 | MEDIUM | `notification_settings` | All 10+ notification toggle settings (global and event-level) are stored and displayed but have zero effect — no module reads them before sending notifications |
| 9 | MEDIUM | `tenant_admin_settings` | `default_probation_period` and `default_notice_period` are stored but not read by employee creation, onboarding, or exit management |
| 10 | LOW | `HolidaysSection.jsx` + `LeaveSettings.jsx` | Both register `disableSave: true` on mount — global "Save changes" button is permanently disabled when these tabs are active with no explanation to the user |
| 11 | LOW | `AttendanceSection.jsx:447-471` | Entire Shift Settings UI card is commented out — `shift_type_default`, `shift_allow_employee_view`, `shift_change_request_enabled` are DB-stored but admin has no way to edit them |
