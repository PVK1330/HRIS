# Enterprise HRMS SaaS – Complete Architecture Specification
> **Prompt for ChatGPT**: Act as a Senior SaaS Product Architect, Senior UX Designer, Senior NestJS Architect, and PostgreSQL Database Designer. Use this document as the complete specification to generate production-ready code.

---

## TECHNOLOGY STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, React Hook Form, TanStack Query v5, Zustand |
| Backend | Node.js, NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT + Refresh Token + RBAC + Multi-Tenant |
| Real-time | Socket.io or Server-Sent Events |
| File Storage | AWS S3 / Cloudflare R2 |
| Email | Nodemailer + React Email |
| Cache | Redis (Bull queues for background jobs) |
| Maps | Google Maps API (geo-fence, location picker) |
| Deployment | Docker + Kubernetes-ready |

---

## SIMILAR PRODUCTS (Reference)

- Darwinbox, Keka, Zoho People, UKG, BambooHR

---

## 1. FOLDER STRUCTURE

### 1.1 Frontend (`/apps/web`)

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                    ← AdminLayout (sidebar + header)
│   │   ├── page.tsx                      ← Dashboard
│   │   ├── setup/
│   │   │   ├── company/page.tsx
│   │   │   ├── locations/page.tsx
│   │   │   ├── geo-fences/page.tsx
│   │   │   ├── holiday-calendar/page.tsx
│   │   │   ├── shifts/page.tsx
│   │   │   ├── leave-policies/page.tsx
│   │   │   ├── attendance-policies/page.tsx
│   │   │   ├── ot-policies/page.tsx
│   │   │   ├── payroll-policies/page.tsx
│   │   │   └── approval-workflows/page.tsx
│   │   ├── employees/
│   │   │   ├── page.tsx                  ← Employee Directory
│   │   │   ├── [id]/page.tsx             ← Employee Profile
│   │   │   ├── onboarding/page.tsx
│   │   │   ├── shift-assignment/page.tsx
│   │   │   └── geo-assignment/page.tsx
│   │   ├── attendance/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── live/page.tsx
│   │   │   ├── logs/page.tsx
│   │   │   ├── geo-violations/page.tsx
│   │   │   ├── regularisation/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── leave/
│   │   │   ├── requests/page.tsx
│   │   │   ├── balances/page.tsx
│   │   │   └── calendar/page.tsx
│   │   ├── overtime/
│   │   │   ├── requests/page.tsx
│   │   │   ├── approval/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── payroll/
│   │   │   ├── run/page.tsx
│   │   │   ├── payslips/page.tsx
│   │   │   └── reports/page.tsx
│   │   └── settings/
│   │       ├── roles/page.tsx
│   │       ├── audit-logs/page.tsx
│   │       └── integrations/page.tsx
│   └── api/                              ← Next.js API routes (optional proxy)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── PageContainer.tsx
│   ├── ui/                               ← Shadcn/UI components
│   ├── forms/
│   │   ├── LocationForm.tsx
│   │   ├── GeoFenceForm.tsx
│   │   ├── ShiftForm.tsx
│   │   ├── EmployeeForm.tsx
│   │   ├── LeaveApplicationForm.tsx
│   │   ├── RegularisationForm.tsx
│   │   ├── OTRequestForm.tsx
│   │   └── PayrollRunForm.tsx
│   ├── tables/
│   │   ├── DataTable.tsx                 ← Generic TanStack Table wrapper
│   │   ├── columns/                      ← Per-module column definitions
│   ├── maps/
│   │   ├── LocationMap.tsx
│   │   └── GeoFenceMap.tsx
│   ├── charts/
│   │   ├── AttendanceTrend.tsx
│   │   └── PayrollSummary.tsx
│   └── cards/
│       ├── StatCard.tsx
│       └── AttendanceStatusCard.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useTenant.ts
│   ├── useAttendance.ts
│   └── usePermission.ts
├── lib/
│   ├── api.ts                            ← Axios instance with interceptors
│   ├── auth.ts
│   └── utils.ts
├── store/
│   ├── authStore.ts                      ← Zustand
│   ├── tenantStore.ts
│   └── uiStore.ts
├── types/
│   ├── api.types.ts
│   ├── employee.types.ts
│   ├── attendance.types.ts
│   └── payroll.types.ts
└── middleware.ts                         ← Next.js auth middleware
```

### 1.2 Backend (`/apps/api`)

```
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── tenant.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── tenant.guard.ts
│   │   ├── interceptors/
│   │   │   ├── tenant.interceptor.ts
│   │   │   └── audit.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── dto/
│   │       ├── pagination.dto.ts
│   │       └── response.dto.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── tenants/
│   │   ├── companies/
│   │   ├── locations/
│   │   ├── geo-fences/
│   │   ├── employees/
│   │   ├── departments/
│   │   ├── designations/
│   │   ├── shifts/
│   │   ├── shift-assignments/
│   │   ├── holiday-calendar/
│   │   ├── attendance/
│   │   ├── regularisation/
│   │   ├── leave/
│   │   ├── overtime/
│   │   ├── payroll/
│   │   ├── approvals/
│   │   ├── notifications/
│   │   ├── rbac/
│   │   └── audit/
│   ├── prisma/
│   │   └── prisma.service.ts
│   └── config/
│       ├── app.config.ts
│       ├── jwt.config.ts
│       └── redis.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── Dockerfile
└── docker-compose.yml
```

---

## 2. POSTGRESQL DATABASE SCHEMA

### 2.1 Multi-Tenancy Convention
Every table includes:
```sql
tenant_id   UUID NOT NULL REFERENCES tenants(id)
created_by  UUID REFERENCES users(id)
updated_by  UUID REFERENCES users(id)
created_at  TIMESTAMPTZ DEFAULT NOW()
updated_at  TIMESTAMPTZ DEFAULT NOW()
```

### 2.2 Complete SQL Schema

```sql
-- =============================================
-- TENANTS & PLATFORM
-- =============================================

CREATE TABLE tenants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  domain          VARCHAR(255),
  plan            VARCHAR(50) DEFAULT 'trial',  -- trial | starter | pro | enterprise
  status          VARCHAR(20) DEFAULT 'active', -- active | suspended | cancelled
  max_employees   INT DEFAULT 50,
  logo_url        TEXT,
  settings        JSONB DEFAULT '{}',
  trial_ends_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id     UUID,                          -- linked after onboarding
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  password_hash   TEXT NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  mfa_enabled     BOOLEAN DEFAULT FALSE,
  mfa_secret      TEXT,
  last_login_at   TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  failed_login_attempts INT DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            VARCHAR(100) NOT NULL,         -- super_admin | hr_admin | manager | employee
  is_system_role  BOOLEAN DEFAULT FALSE,
  description     TEXT,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE permissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module          VARCHAR(100) NOT NULL,         -- attendance | leave | payroll …
  action          VARCHAR(50) NOT NULL,          -- read | write | approve | export
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE role_permissions (
  role_id         UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id   UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id         UUID REFERENCES roles(id) ON DELETE CASCADE,
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE refresh_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL UNIQUE,
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ,
  device_info     JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMPANY STRUCTURE
-- =============================================

CREATE TABLE companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) UNIQUE,
  name            VARCHAR(255) NOT NULL,
  legal_name      VARCHAR(255),
  cin             VARCHAR(50),                   -- Company Identification Number
  gstin           VARCHAR(20),
  pan             VARCHAR(20),
  industry        VARCHAR(100),
  company_size    VARCHAR(50),
  founded_year    INT,
  website         VARCHAR(255),
  logo_url        TEXT,
  address_line1   TEXT,
  address_line2   TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  country         VARCHAR(100) DEFAULT 'India',
  pincode         VARCHAR(20),
  phone           VARCHAR(20),
  email           VARCHAR(255),
  timezone        VARCHAR(100) DEFAULT 'Asia/Kolkata',
  currency        VARCHAR(10) DEFAULT 'INR',
  date_format     VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  fiscal_year_start INT DEFAULT 4,               -- April
  week_start      VARCHAR(10) DEFAULT 'Monday',
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE branches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            VARCHAR(255) NOT NULL,
  code            VARCHAR(50),
  address_line1   TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  country         VARCHAR(100),
  pincode         VARCHAR(20),
  phone           VARCHAR(20),
  is_headquarter  BOOLEAN DEFAULT FALSE,
  status          VARCHAR(20) DEFAULT 'active',
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE departments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  branch_id       UUID REFERENCES branches(id),
  name            VARCHAR(255) NOT NULL,
  code            VARCHAR(50),
  parent_id       UUID REFERENCES departments(id),  -- hierarchy
  head_employee_id UUID,                             -- FK added after employees table
  description     TEXT,
  status          VARCHAR(20) DEFAULT 'active',
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE designations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  department_id   UUID REFERENCES departments(id),
  name            VARCHAR(255) NOT NULL,
  level           INT DEFAULT 1,                 -- seniority level
  status          VARCHAR(20) DEFAULT 'active',
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LOCATIONS & GEO-FENCING
-- =============================================

CREATE TABLE locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  branch_id       UUID REFERENCES branches(id),
  name            VARCHAR(255) NOT NULL,
  code            VARCHAR(50),
  address         TEXT,
  latitude        DECIMAL(10, 7) NOT NULL,
  longitude       DECIMAL(10, 7) NOT NULL,
  radius_meters   INT DEFAULT 200,
  timezone        VARCHAR(100) DEFAULT 'Asia/Kolkata',
  status          VARCHAR(20) DEFAULT 'active',
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE geo_fences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  location_id     UUID NOT NULL REFERENCES locations(id),
  name            VARCHAR(255) NOT NULL,
  latitude        DECIMAL(10, 7) NOT NULL,
  longitude       DECIMAL(10, 7) NOT NULL,
  radius_meters   INT NOT NULL DEFAULT 200,
  allowed_checkin  BOOLEAN DEFAULT TRUE,
  allowed_checkout BOOLEAN DEFAULT TRUE,
  require_selfie  BOOLEAN DEFAULT FALSE,
  require_gps_accuracy INT DEFAULT 50,          -- meters
  status          VARCHAR(20) DEFAULT 'active',
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EMPLOYEES
-- =============================================

CREATE TABLE employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  user_id         UUID REFERENCES users(id),
  employee_code   VARCHAR(50) NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  gender          VARCHAR(20),
  date_of_birth   DATE,
  date_of_joining DATE NOT NULL,
  date_of_leaving DATE,
  department_id   UUID REFERENCES departments(id),
  designation_id  UUID REFERENCES designations(id),
  branch_id       UUID REFERENCES branches(id),
  location_id     UUID REFERENCES locations(id),
  manager_id      UUID REFERENCES employees(id),
  employment_type VARCHAR(50) DEFAULT 'full_time', -- full_time | part_time | contract | intern
  status          VARCHAR(20) DEFAULT 'active',    -- active | inactive | on_notice | terminated
  avatar_url      TEXT,
  address         JSONB DEFAULT '{}',
  emergency_contact JSONB DEFAULT '{}',
  bank_details    JSONB DEFAULT '{}',
  documents       JSONB DEFAULT '[]',
  custom_fields   JSONB DEFAULT '{}',
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, employee_code),
  UNIQUE (tenant_id, email)
);

-- Add deferred FK (circular ref)
ALTER TABLE departments ADD CONSTRAINT fk_dept_head
  FOREIGN KEY (head_employee_id) REFERENCES employees(id) DEFERRABLE INITIALLY DEFERRED;

-- =============================================
-- HOLIDAY CALENDAR
-- =============================================

CREATE TABLE holiday_calendars (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            VARCHAR(255) NOT NULL,
  year            INT NOT NULL,
  is_default      BOOLEAN DEFAULT FALSE,
  applicable_to   JSONB DEFAULT '{}',            -- { branches: [], departments: [] }
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE holidays (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  calendar_id     UUID NOT NULL REFERENCES holiday_calendars(id),
  name            VARCHAR(255) NOT NULL,
  date            DATE NOT NULL,
  type            VARCHAR(50) DEFAULT 'national', -- national | optional | restricted | company
  is_recurring    BOOLEAN DEFAULT FALSE,
  description     TEXT,
  applicable_to   JSONB DEFAULT '{}',
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SHIFTS
-- =============================================

CREATE TYPE attendance_mode AS ENUM ('GEO_FENCE', 'BIOMETRIC', 'QR', 'WIFI', 'HYBRID', 'MOBILE');

CREATE TABLE shifts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            VARCHAR(255) NOT NULL,
  code            VARCHAR(50),
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  break_minutes   INT DEFAULT 60,
  working_hours   DECIMAL(4, 2),                 -- auto-calc: (end-start-break)
  grace_in        INT DEFAULT 15,                -- minutes allowed late
  grace_out       INT DEFAULT 15,                -- minutes allowed early exit
  half_day_hours  DECIMAL(4, 2) DEFAULT 4.0,
  attendance_mode attendance_mode DEFAULT 'GEO_FENCE',
  is_night_shift  BOOLEAN DEFAULT FALSE,
  is_flexible     BOOLEAN DEFAULT FALSE,
  flexible_start  TIME,
  flexible_end    TIME,
  working_days    INT[] DEFAULT '{1,2,3,4,5}',   -- 0=Sun … 6=Sat
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shift_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  shift_id        UUID NOT NULL REFERENCES shifts(id),
  assignment_type VARCHAR(20) NOT NULL,          -- employee | department | branch | location
  reference_id    UUID NOT NULL,                 -- employee_id / department_id etc.
  effective_from  DATE NOT NULL,
  effective_to    DATE,
  is_rotation     BOOLEAN DEFAULT FALSE,
  rotation_days   INT DEFAULT 7,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE geo_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  geo_fence_id    UUID NOT NULL REFERENCES geo_fences(id),
  assignment_type VARCHAR(20) NOT NULL,          -- employee | department | branch
  reference_id    UUID NOT NULL,
  effective_from  DATE NOT NULL,
  effective_to    DATE,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ATTENDANCE
-- =============================================

CREATE TYPE attendance_status AS ENUM (
  'present', 'absent', 'half_day', 'holiday', 'weekend',
  'leave', 'late', 'early_out', 'on_duty', 'work_from_home'
);

CREATE TYPE punch_source AS ENUM ('mobile', 'web', 'biometric', 'qr', 'manual', 'auto');

CREATE TABLE attendance_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  date            DATE NOT NULL,
  shift_id        UUID REFERENCES shifts(id),
  punch_in        TIMESTAMPTZ,
  punch_out       TIMESTAMPTZ,
  punch_in_location  JSONB,                      -- { lat, lng, accuracy, address }
  punch_out_location JSONB,
  punch_in_source    punch_source DEFAULT 'mobile',
  punch_out_source   punch_source DEFAULT 'mobile',
  punch_in_selfie    TEXT,                       -- S3 URL
  punch_out_selfie   TEXT,
  working_hours   DECIMAL(5, 2),
  ot_hours        DECIMAL(5, 2) DEFAULT 0,
  late_by         INT DEFAULT 0,                 -- minutes
  early_exit_by   INT DEFAULT 0,                 -- minutes
  status          attendance_status DEFAULT 'absent',
  is_geo_valid    BOOLEAN,
  geo_distance    INT,                           -- meters from fence center
  geo_fence_id    UUID REFERENCES geo_fences(id),
  is_manual_override BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  override_by     UUID REFERENCES users(id),
  remarks         TEXT,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, employee_id, date)
);

CREATE TABLE geo_violations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  attendance_log_id UUID REFERENCES attendance_logs(id),
  date            DATE NOT NULL,
  violation_type  VARCHAR(50),                   -- outside_fence | gps_disabled | gps_inaccurate
  punch_type      VARCHAR(20),                   -- check_in | check_out
  latitude        DECIMAL(10, 7),
  longitude       DECIMAL(10, 7),
  distance_from_fence INT,                       -- meters
  expected_fence_id UUID REFERENCES geo_fences(id),
  resolved        BOOLEAN DEFAULT FALSE,
  resolved_by     UUID REFERENCES users(id),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REGULARISATION
-- =============================================

CREATE TYPE regularisation_type AS ENUM (
  'late_in', 'early_out', 'missed_punch', 'geo_fence_failure',
  'gps_failure', 'work_from_home', 'on_duty', 'comp_off'
);

CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

CREATE TYPE approval_stage AS ENUM ('employee', 'manager', 'hr', 'done');

CREATE TABLE regularisations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  attendance_log_id UUID REFERENCES attendance_logs(id),
  date            DATE NOT NULL,
  type            regularisation_type NOT NULL,
  requested_in    TIME,
  requested_out   TIME,
  reason          TEXT NOT NULL,
  attachment_url  TEXT,
  status          approval_status DEFAULT 'pending',
  current_stage   approval_stage DEFAULT 'manager',
  manager_id      UUID REFERENCES employees(id),
  manager_action  approval_status,
  manager_remark  TEXT,
  manager_acted_at TIMESTAMPTZ,
  hr_id           UUID REFERENCES employees(id),
  hr_action       approval_status,
  hr_remark       TEXT,
  hr_acted_at     TIMESTAMPTZ,
  auto_reject_at  TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LEAVE MANAGEMENT
-- =============================================

CREATE TABLE leave_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            VARCHAR(100) NOT NULL,          -- Casual Leave | Sick Leave | Earned Leave
  code            VARCHAR(20) NOT NULL,           -- CL | SL | EL | ML | LOP
  is_paid         BOOLEAN DEFAULT TRUE,
  max_days_per_year INT DEFAULT 12,
  max_consecutive_days INT,
  carry_forward_limit INT DEFAULT 0,
  accrual_type    VARCHAR(20) DEFAULT 'monthly',  -- monthly | quarterly | yearly | upfront
  accrual_days    DECIMAL(4,1),
  applicable_gender VARCHAR(10),                  -- all | male | female
  requires_doc    BOOLEAN DEFAULT FALSE,
  min_days_notice INT DEFAULT 0,
  allow_half_day  BOOLEAN DEFAULT TRUE,
  allow_future    BOOLEAN DEFAULT TRUE,
  color           VARCHAR(7) DEFAULT '#6366f1',   -- hex
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE leave_balances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  leave_type_id   UUID NOT NULL REFERENCES leave_types(id),
  year            INT NOT NULL,
  allocated       DECIMAL(5, 1) DEFAULT 0,
  carried_forward DECIMAL(5, 1) DEFAULT 0,
  used            DECIMAL(5, 1) DEFAULT 0,
  pending         DECIMAL(5, 1) DEFAULT 0,
  lapsed          DECIMAL(5, 1) DEFAULT 0,
  available       DECIMAL(5, 1) GENERATED ALWAYS AS (allocated + carried_forward - used - pending) STORED,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, employee_id, leave_type_id, year)
);

CREATE TABLE leave_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  leave_type_id   UUID NOT NULL REFERENCES leave_types(id),
  from_date       DATE NOT NULL,
  to_date         DATE NOT NULL,
  days            DECIMAL(5, 1) NOT NULL,
  session         VARCHAR(20) DEFAULT 'full_day', -- full_day | first_half | second_half
  reason          TEXT,
  attachment_url  TEXT,
  status          approval_status DEFAULT 'pending',
  current_stage   approval_stage DEFAULT 'manager',
  manager_id      UUID REFERENCES employees(id),
  manager_action  approval_status,
  manager_remark  TEXT,
  manager_acted_at TIMESTAMPTZ,
  hr_id           UUID REFERENCES employees(id),
  hr_action       approval_status,
  hr_remark       TEXT,
  hr_acted_at     TIMESTAMPTZ,
  cancelled_reason TEXT,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- OVERTIME
-- =============================================

CREATE TABLE ot_policies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            VARCHAR(255) NOT NULL,
  calculation_type VARCHAR(20) DEFAULT 'daily',   -- daily | weekly | monthly
  ot_start_after_minutes INT DEFAULT 30,           -- OT counted after 30 min over shift
  min_ot_minutes  INT DEFAULT 30,
  max_daily_ot    DECIMAL(4, 2) DEFAULT 4.0,       -- hours
  max_weekly_ot   DECIMAL(5, 2) DEFAULT 12.0,
  ot_rate         DECIMAL(4, 2) DEFAULT 1.5,       -- multiplier
  requires_approval BOOLEAN DEFAULT TRUE,
  carry_forward_ot BOOLEAN DEFAULT FALSE,
  is_default      BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ot_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  attendance_log_id UUID REFERENCES attendance_logs(id),
  date            DATE NOT NULL,
  from_time       TIME NOT NULL,
  to_time         TIME NOT NULL,
  ot_hours        DECIMAL(5, 2) NOT NULL,
  reason          TEXT,
  type            VARCHAR(20) DEFAULT 'extra',    -- extra | comp_off | holiday_work
  status          approval_status DEFAULT 'pending',
  current_stage   approval_stage DEFAULT 'manager',
  manager_id      UUID REFERENCES employees(id),
  manager_action  approval_status,
  manager_remark  TEXT,
  manager_acted_at TIMESTAMPTZ,
  hr_id           UUID REFERENCES employees(id),
  hr_action       approval_status,
  hr_remark       TEXT,
  hr_acted_at     TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYROLL
-- =============================================

CREATE TABLE salary_components (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            VARCHAR(100) NOT NULL,          -- Basic | HRA | DA | TDS | PF
  code            VARCHAR(20) NOT NULL,
  type            VARCHAR(20) NOT NULL,           -- earning | deduction | employer_contribution
  calc_type       VARCHAR(20) DEFAULT 'fixed',    -- fixed | percentage | formula
  value           DECIMAL(10, 2),                 -- amount or percent
  formula         TEXT,                           -- custom formula expression
  percentage_of   UUID REFERENCES salary_components(id),
  is_taxable      BOOLEAN DEFAULT FALSE,
  pf_applicable   BOOLEAN DEFAULT FALSE,
  esi_applicable  BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  display_order   INT DEFAULT 0,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE employee_salary_structures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  component_id    UUID NOT NULL REFERENCES salary_components(id),
  amount          DECIMAL(12, 2) NOT NULL,
  effective_from  DATE NOT NULL,
  effective_to    DATE,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payroll_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  period_month    INT NOT NULL,                  -- 1-12
  period_year     INT NOT NULL,
  run_name        VARCHAR(255),
  status          VARCHAR(20) DEFAULT 'draft',   -- draft | processing | review | approved | finalized | paid
  total_employees INT DEFAULT 0,
  processed_count INT DEFAULT 0,
  total_gross     DECIMAL(14, 2) DEFAULT 0,
  total_net       DECIMAL(14, 2) DEFAULT 0,
  total_deductions DECIMAL(14, 2) DEFAULT 0,
  include_ot      BOOLEAN DEFAULT TRUE,
  include_leave_encash BOOLEAN DEFAULT FALSE,
  include_loan_deductions BOOLEAN DEFAULT TRUE,
  pay_date        DATE,
  finalized_at    TIMESTAMPTZ,
  finalized_by    UUID REFERENCES users(id),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, period_month, period_year)
);

CREATE TABLE payslips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  run_id          UUID NOT NULL REFERENCES payroll_runs(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  period_month    INT NOT NULL,
  period_year     INT NOT NULL,
  working_days    INT,
  present_days    DECIMAL(5, 1),
  absent_days     DECIMAL(5, 1),
  leave_days      DECIMAL(5, 1),
  lop_days        DECIMAL(5, 1) DEFAULT 0,
  holiday_days    INT,
  ot_hours        DECIMAL(6, 2) DEFAULT 0,
  gross_salary    DECIMAL(12, 2) NOT NULL,
  net_salary      DECIMAL(12, 2) NOT NULL,
  total_earnings  DECIMAL(12, 2) NOT NULL,
  total_deductions DECIMAL(12, 2) NOT NULL,
  earnings        JSONB NOT NULL DEFAULT '[]',   -- [{ code, name, amount }]
  deductions      JSONB NOT NULL DEFAULT '[]',
  employer_contributions JSONB DEFAULT '[]',
  pdf_url         TEXT,
  is_published    BOOLEAN DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, run_id, employee_id)
);

-- =============================================
-- APPROVAL WORKFLOWS
-- =============================================

CREATE TABLE approval_workflows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  module          VARCHAR(50) NOT NULL,           -- leave | regularisation | ot | shift_change
  name            VARCHAR(255) NOT NULL,
  stages          JSONB NOT NULL,                 -- [{ stage: 1, role: 'manager', action: 'approve' }]
  auto_approve_after INT,                         -- hours; null = never
  auto_reject_after  INT,
  is_default      BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  title           VARCHAR(255) NOT NULL,
  body            TEXT,
  type            VARCHAR(50),                   -- leave_request | ot_approved | regularisation …
  reference_id    UUID,
  reference_type  VARCHAR(50),
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AUDIT LOGS
-- =============================================

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  user_id         UUID REFERENCES users(id),
  action          VARCHAR(100) NOT NULL,          -- CREATE | UPDATE | DELETE | APPROVE | REJECT
  module          VARCHAR(100) NOT NULL,
  record_id       UUID,
  old_data        JSONB,
  new_data        JSONB,
  ip_address      VARCHAR(50),
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_users_tenant         ON users(tenant_id);
CREATE INDEX idx_employees_tenant     ON employees(tenant_id);
CREATE INDEX idx_employees_dept       ON employees(department_id);
CREATE INDEX idx_attendance_emp_date  ON attendance_logs(employee_id, date);
CREATE INDEX idx_attendance_tenant    ON attendance_logs(tenant_id, date);
CREATE INDEX idx_leave_requests_emp   ON leave_requests(employee_id, status);
CREATE INDEX idx_ot_requests_emp      ON ot_requests(employee_id, status);
CREATE INDEX idx_regularisations_emp  ON regularisations(employee_id, status);
CREATE INDEX idx_payslips_run         ON payslips(run_id);
CREATE INDEX idx_payslips_emp         ON payslips(employee_id);
CREATE INDEX idx_audit_tenant         ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_notifications_user   ON notifications(user_id, is_read);
CREATE INDEX idx_geo_violations_emp   ON geo_violations(employee_id, date);
```

---

## 3. PRISMA SCHEMA

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────────────────────────────

enum AttendanceMode {
  GEO_FENCE
  BIOMETRIC
  QR
  WIFI
  HYBRID
  MOBILE
}

enum AttendanceStatus {
  present
  absent
  half_day
  holiday
  weekend
  leave
  late
  early_out
  on_duty
  work_from_home
}

enum PunchSource {
  mobile
  web
  biometric
  qr
  manual
  auto
}

enum ApprovalStatus {
  pending
  approved
  rejected
  cancelled
}

enum ApprovalStage {
  employee
  manager
  hr
  done
}

enum RegularisationType {
  late_in
  early_out
  missed_punch
  geo_fence_failure
  gps_failure
  work_from_home
  on_duty
  comp_off
}

// ─── TENANT ───────────────────────────────────────────────────────────────────

model Tenant {
  id            String    @id @default(uuid())
  name          String
  slug          String    @unique
  domain        String?
  plan          String    @default("trial")
  status        String    @default("active")
  maxEmployees  Int       @default(50) @map("max_employees")
  logoUrl       String?   @map("logo_url")
  settings      Json      @default("{}")
  trialEndsAt   DateTime? @map("trial_ends_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  users         User[]
  roles         Role[]
  company       Company?
  employees     Employee[]
  locations     Location[]
  geoFences     GeoFence[]
  shifts        Shift[]
  holidayCalendars HolidayCalendar[]
  attendance    AttendanceLog[]
  leaveTypes    LeaveType[]
  leaveRequests LeaveRequest[]
  otRequests    OtRequest[]
  payrollRuns   PayrollRun[]
  notifications Notification[]
  auditLogs     AuditLog[]

  @@map("tenants")
}

// ─── USER & AUTH ──────────────────────────────────────────────────────────────

model User {
  id                  String    @id @default(uuid())
  tenantId            String    @map("tenant_id")
  employeeId          String?   @map("employee_id")
  email               String
  phone               String?
  passwordHash        String    @map("password_hash")
  firstName           String    @map("first_name")
  lastName            String    @map("last_name")
  avatarUrl           String?   @map("avatar_url")
  isActive            Boolean   @default(true) @map("is_active")
  isEmailVerified     Boolean   @default(false) @map("is_email_verified")
  mfaEnabled          Boolean   @default(false) @map("mfa_enabled")
  mfaSecret           String?   @map("mfa_secret")
  lastLoginAt         DateTime? @map("last_login_at")
  failedLoginAttempts Int       @default(0) @map("failed_login_attempts")
  lockedUntil         DateTime? @map("locked_until")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  tenant        Tenant        @relation(fields: [tenantId], references: [id])
  userRoles     UserRole[]
  refreshTokens RefreshToken[]
  notifications Notification[]

  @@unique([tenantId, email])
  @@map("users")
}

model Role {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  name          String
  isSystemRole  Boolean  @default(false) @map("is_system_role")
  description   String?
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  tenant          Tenant           @relation(fields: [tenantId], references: [id])
  userRoles       UserRole[]
  rolePermissions RolePermission[]

  @@unique([tenantId, name])
  @@map("roles")
}

model Permission {
  id              String   @id @default(uuid())
  module          String
  action          String
  description     String?
  createdAt       DateTime @default(now()) @map("created_at")

  rolePermissions RolePermission[]

  @@map("permissions")
}

model RolePermission {
  roleId        String @map("role_id")
  permissionId  String @map("permission_id")

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@map("role_permissions")
}

model UserRole {
  userId    String @map("user_id")
  roleId    String @map("role_id")
  tenantId  String @map("tenant_id")

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("user_roles")
}

model RefreshToken {
  id         String    @id @default(uuid())
  userId     String    @map("user_id")
  tokenHash  String    @unique @map("token_hash")
  expiresAt  DateTime  @map("expires_at")
  revokedAt  DateTime? @map("revoked_at")
  deviceInfo Json?     @map("device_info")
  createdAt  DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

// ─── COMPANY STRUCTURE ────────────────────────────────────────────────────────

model Company {
  id              String   @id @default(uuid())
  tenantId        String   @unique @map("tenant_id")
  name            String
  legalName       String?  @map("legal_name")
  gstin           String?
  pan             String?
  industry        String?
  timezone        String   @default("Asia/Kolkata")
  currency        String   @default("INR")
  fiscalYearStart Int      @default(4) @map("fiscal_year_start")
  weekStart       String   @default("Monday") @map("week_start")
  logoUrl         String?  @map("logo_url")
  address         Json     @default("{}")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  tenant     Tenant     @relation(fields: [tenantId], references: [id])
  branches   Branch[]

  @@map("companies")
}

model Branch {
  id          String   @id @default(uuid())
  tenantId    String   @map("tenant_id")
  companyId   String   @map("company_id")
  name        String
  code        String?
  city        String?
  state       String?
  isHeadquarter Boolean @default(false) @map("is_headquarter")
  status      String   @default("active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  company     Company     @relation(fields: [companyId], references: [id])
  departments Department[]
  employees   Employee[]

  @@map("branches")
}

model Department {
  id              String   @id @default(uuid())
  tenantId        String   @map("tenant_id")
  branchId        String?  @map("branch_id")
  name            String
  code            String?
  parentId        String?  @map("parent_id")
  headEmployeeId  String?  @map("head_employee_id")
  status          String   @default("active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  branch        Branch?      @relation(fields: [branchId], references: [id])
  parent        Department?  @relation("DeptHierarchy", fields: [parentId], references: [id])
  children      Department[] @relation("DeptHierarchy")
  designations  Designation[]
  employees     Employee[]

  @@map("departments")
}

model Designation {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  departmentId  String?  @map("department_id")
  name          String
  level         Int      @default(1)
  status        String   @default("active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  department  Department? @relation(fields: [departmentId], references: [id])
  employees   Employee[]

  @@map("designations")
}

// ─── EMPLOYEE ─────────────────────────────────────────────────────────────────

model Employee {
  id              String    @id @default(uuid())
  tenantId        String    @map("tenant_id")
  userId          String?   @map("user_id")
  employeeCode    String    @map("employee_code")
  firstName       String    @map("first_name")
  lastName        String    @map("last_name")
  email           String
  phone           String?
  gender          String?
  dateOfBirth     DateTime? @map("date_of_birth") @db.Date
  dateOfJoining   DateTime  @map("date_of_joining") @db.Date
  dateOfLeaving   DateTime? @map("date_of_leaving") @db.Date
  departmentId    String?   @map("department_id")
  designationId   String?   @map("designation_id")
  branchId        String?   @map("branch_id")
  locationId      String?   @map("location_id")
  managerId       String?   @map("manager_id")
  employmentType  String    @default("full_time") @map("employment_type")
  status          String    @default("active")
  avatarUrl       String?   @map("avatar_url")
  address         Json      @default("{}")
  bankDetails     Json      @default("{}") @map("bank_details")
  customFields    Json      @default("{}") @map("custom_fields")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  tenant          Tenant        @relation(fields: [tenantId], references: [id])
  department      Department?   @relation(fields: [departmentId], references: [id])
  designation     Designation?  @relation(fields: [designationId], references: [id])
  branch          Branch?       @relation(fields: [branchId], references: [id])
  manager         Employee?     @relation("EmpHierarchy", fields: [managerId], references: [id])
  reports         Employee[]    @relation("EmpHierarchy")
  attendance      AttendanceLog[]
  leaveBalances   LeaveBalance[]
  leaveRequests   LeaveRequest[]
  otRequests      OtRequest[]
  regularisations Regularisation[]
  salaryStructure EmployeeSalaryStructure[]
  payslips        Payslip[]
  shiftAssignments ShiftAssignment[]

  @@unique([tenantId, employeeCode])
  @@unique([tenantId, email])
  @@map("employees")
}

// ─── LOCATION & GEO-FENCE ─────────────────────────────────────────────────────

model Location {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  branchId      String?  @map("branch_id")
  name          String
  code          String?
  address       String?
  latitude      Decimal  @db.Decimal(10, 7)
  longitude     Decimal  @db.Decimal(10, 7)
  radiusMeters  Int      @default(200) @map("radius_meters")
  timezone      String   @default("Asia/Kolkata")
  status        String   @default("active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  tenant    Tenant     @relation(fields: [tenantId], references: [id])
  geoFences GeoFence[]

  @@map("locations")
}

model GeoFence {
  id                 String   @id @default(uuid())
  tenantId           String   @map("tenant_id")
  locationId         String   @map("location_id")
  name               String
  latitude           Decimal  @db.Decimal(10, 7)
  longitude          Decimal  @db.Decimal(10, 7)
  radiusMeters       Int      @map("radius_meters")
  allowedCheckin     Boolean  @default(true) @map("allowed_checkin")
  allowedCheckout    Boolean  @default(true) @map("allowed_checkout")
  requireSelfie      Boolean  @default(false) @map("require_selfie")
  requireGpsAccuracy Int      @default(50) @map("require_gps_accuracy")
  status             String   @default("active")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  tenant   Tenant @relation(fields: [tenantId], references: [id])
  location Location @relation(fields: [locationId], references: [id])

  @@map("geo_fences")
}

// ─── SHIFTS ───────────────────────────────────────────────────────────────────

model Shift {
  id              String         @id @default(uuid())
  tenantId        String         @map("tenant_id")
  name            String
  code            String?
  startTime       DateTime       @map("start_time") @db.Time()
  endTime         DateTime       @map("end_time") @db.Time()
  breakMinutes    Int            @default(60) @map("break_minutes")
  graceIn         Int            @default(15) @map("grace_in")
  graceOut        Int            @default(15) @map("grace_out")
  halfDayHours    Decimal        @default(4.0) @map("half_day_hours") @db.Decimal(4, 2)
  attendanceMode  AttendanceMode @default(GEO_FENCE) @map("attendance_mode")
  isNightShift    Boolean        @default(false) @map("is_night_shift")
  isFlexible      Boolean        @default(false) @map("is_flexible")
  workingDays     Int[]          @map("working_days")
  isActive        Boolean        @default(true) @map("is_active")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  tenant          Tenant           @relation(fields: [tenantId], references: [id])
  shiftAssignments ShiftAssignment[]

  @@map("shifts")
}

model ShiftAssignment {
  id             String   @id @default(uuid())
  tenantId       String   @map("tenant_id")
  shiftId        String   @map("shift_id")
  employeeId     String   @map("employee_id")
  effectiveFrom  DateTime @map("effective_from") @db.Date
  effectiveTo    DateTime? @map("effective_to") @db.Date
  isRotation     Boolean  @default(false) @map("is_rotation")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  shift    Shift    @relation(fields: [shiftId], references: [id])
  employee Employee @relation(fields: [employeeId], references: [id])

  @@map("shift_assignments")
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

model AttendanceLog {
  id                String           @id @default(uuid())
  tenantId          String           @map("tenant_id")
  employeeId        String           @map("employee_id")
  date              DateTime         @db.Date
  shiftId           String?          @map("shift_id")
  punchIn           DateTime?        @map("punch_in")
  punchOut          DateTime?        @map("punch_out")
  punchInLocation   Json?            @map("punch_in_location")
  punchOutLocation  Json?            @map("punch_out_location")
  punchInSource     PunchSource      @default(mobile) @map("punch_in_source")
  punchOutSource    PunchSource      @default(mobile) @map("punch_out_source")
  punchInSelfie     String?          @map("punch_in_selfie")
  punchOutSelfie    String?          @map("punch_out_selfie")
  workingHours      Decimal?         @map("working_hours") @db.Decimal(5, 2)
  otHours           Decimal          @default(0) @map("ot_hours") @db.Decimal(5, 2)
  lateBy            Int              @default(0) @map("late_by")
  earlyExitBy       Int              @default(0) @map("early_exit_by")
  status            AttendanceStatus @default(absent)
  isGeoValid        Boolean?         @map("is_geo_valid")
  geoDistance       Int?             @map("geo_distance")
  geoFenceId        String?          @map("geo_fence_id")
  isManualOverride  Boolean          @default(false) @map("is_manual_override")
  overrideReason    String?          @map("override_reason")
  createdAt         DateTime         @default(now()) @map("created_at")
  updatedAt         DateTime         @updatedAt @map("updated_at")

  tenant   Tenant   @relation(fields: [tenantId], references: [id])
  employee Employee @relation(fields: [employeeId], references: [id])

  @@unique([tenantId, employeeId, date])
  @@map("attendance_logs")
}

// ─── REGULARISATION ───────────────────────────────────────────────────────────

model Regularisation {
  id                 String             @id @default(uuid())
  tenantId           String             @map("tenant_id")
  employeeId         String             @map("employee_id")
  attendanceLogId    String?            @map("attendance_log_id")
  date               DateTime           @db.Date
  type               RegularisationType
  requestedIn        DateTime?          @map("requested_in") @db.Time()
  requestedOut       DateTime?          @map("requested_out") @db.Time()
  reason             String
  attachmentUrl      String?            @map("attachment_url")
  status             ApprovalStatus     @default(pending)
  currentStage       ApprovalStage      @default(manager) @map("current_stage")
  managerId          String?            @map("manager_id")
  managerAction      ApprovalStatus?    @map("manager_action")
  managerRemark      String?            @map("manager_remark")
  managerActedAt     DateTime?          @map("manager_acted_at")
  hrId               String?            @map("hr_id")
  hrAction           ApprovalStatus?    @map("hr_action")
  hrRemark           String?            @map("hr_remark")
  hrActedAt          DateTime?          @map("hr_acted_at")
  autoRejectAt       DateTime?          @map("auto_reject_at")
  createdAt          DateTime           @default(now()) @map("created_at")
  updatedAt          DateTime           @updatedAt @map("updated_at")

  employee Employee @relation(fields: [employeeId], references: [id])

  @@map("regularisations")
}

// ─── LEAVE ────────────────────────────────────────────────────────────────────

model LeaveType {
  id                  String   @id @default(uuid())
  tenantId            String   @map("tenant_id")
  name                String
  code                String
  isPaid              Boolean  @default(true) @map("is_paid")
  maxDaysPerYear      Int      @default(12) @map("max_days_per_year")
  carryForwardLimit   Int      @default(0) @map("carry_forward_limit")
  accrualType         String   @default("monthly") @map("accrual_type")
  accrualDays         Decimal? @map("accrual_days") @db.Decimal(4, 1)
  requiresDoc         Boolean  @default(false) @map("requires_doc")
  allowHalfDay        Boolean  @default(true) @map("allow_half_day")
  color               String   @default("#6366f1")
  isActive            Boolean  @default(true) @map("is_active")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  tenant        Tenant         @relation(fields: [tenantId], references: [id])
  leaveBalances LeaveBalance[]
  leaveRequests LeaveRequest[]

  @@unique([tenantId, code])
  @@map("leave_types")
}

model LeaveBalance {
  id             String   @id @default(uuid())
  tenantId       String   @map("tenant_id")
  employeeId     String   @map("employee_id")
  leaveTypeId    String   @map("leave_type_id")
  year           Int
  allocated      Decimal  @default(0) @db.Decimal(5, 1)
  carriedForward Decimal  @default(0) @map("carried_forward") @db.Decimal(5, 1)
  used           Decimal  @default(0) @db.Decimal(5, 1)
  pending        Decimal  @default(0) @db.Decimal(5, 1)
  updatedAt      DateTime @updatedAt @map("updated_at")

  employee  Employee  @relation(fields: [employeeId], references: [id])
  leaveType LeaveType @relation(fields: [leaveTypeId], references: [id])

  @@unique([tenantId, employeeId, leaveTypeId, year])
  @@map("leave_balances")
}

model LeaveRequest {
  id              String         @id @default(uuid())
  tenantId        String         @map("tenant_id")
  employeeId      String         @map("employee_id")
  leaveTypeId     String         @map("leave_type_id")
  fromDate        DateTime       @map("from_date") @db.Date
  toDate          DateTime       @map("to_date") @db.Date
  days            Decimal        @db.Decimal(5, 1)
  session         String         @default("full_day")
  reason          String?
  attachmentUrl   String?        @map("attachment_url")
  status          ApprovalStatus @default(pending)
  currentStage    ApprovalStage  @default(manager) @map("current_stage")
  managerId       String?        @map("manager_id")
  managerAction   ApprovalStatus? @map("manager_action")
  managerRemark   String?        @map("manager_remark")
  managerActedAt  DateTime?      @map("manager_acted_at")
  hrId            String?        @map("hr_id")
  hrAction        ApprovalStatus? @map("hr_action")
  hrRemark        String?        @map("hr_remark")
  hrActedAt       DateTime?      @map("hr_acted_at")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  tenant    Tenant    @relation(fields: [tenantId], references: [id])
  employee  Employee  @relation(fields: [employeeId], references: [id])
  leaveType LeaveType @relation(fields: [leaveTypeId], references: [id])

  @@map("leave_requests")
}

// ─── OVERTIME ─────────────────────────────────────────────────────────────────

model OtRequest {
  id              String         @id @default(uuid())
  tenantId        String         @map("tenant_id")
  employeeId      String         @map("employee_id")
  attendanceLogId String?        @map("attendance_log_id")
  date            DateTime       @db.Date
  fromTime        DateTime       @map("from_time") @db.Time()
  toTime          DateTime       @map("to_time") @db.Time()
  otHours         Decimal        @map("ot_hours") @db.Decimal(5, 2)
  reason          String?
  type            String         @default("extra")
  status          ApprovalStatus @default(pending)
  currentStage    ApprovalStage  @default(manager) @map("current_stage")
  managerId       String?        @map("manager_id")
  managerAction   ApprovalStatus? @map("manager_action")
  managerRemark   String?        @map("manager_remark")
  managerActedAt  DateTime?      @map("manager_acted_at")
  hrId            String?        @map("hr_id")
  hrAction        ApprovalStatus? @map("hr_action")
  hrRemark        String?        @map("hr_remark")
  hrActedAt       DateTime?      @map("hr_acted_at")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  tenant   Tenant   @relation(fields: [tenantId], references: [id])
  employee Employee @relation(fields: [employeeId], references: [id])

  @@map("ot_requests")
}

// ─── PAYROLL ──────────────────────────────────────────────────────────────────

model SalaryComponent {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  name          String
  code          String
  type          String
  calcType      String   @default("fixed") @map("calc_type")
  value         Decimal? @db.Decimal(10, 2)
  formula       String?
  isTaxable     Boolean  @default(false) @map("is_taxable")
  pfApplicable  Boolean  @default(false) @map("pf_applicable")
  esiApplicable Boolean  @default(false) @map("esi_applicable")
  isActive      Boolean  @default(true) @map("is_active")
  displayOrder  Int      @default(0) @map("display_order")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@unique([tenantId, code])
  @@map("salary_components")
}

model EmployeeSalaryStructure {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  employeeId    String   @map("employee_id")
  componentId   String   @map("component_id")
  amount        Decimal  @db.Decimal(12, 2)
  effectiveFrom DateTime @map("effective_from") @db.Date
  effectiveTo   DateTime? @map("effective_to") @db.Date
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  employee Employee @relation(fields: [employeeId], references: [id])

  @@map("employee_salary_structures")
}

model PayrollRun {
  id                String   @id @default(uuid())
  tenantId          String   @map("tenant_id")
  periodMonth       Int      @map("period_month")
  periodYear        Int      @map("period_year")
  runName           String?  @map("run_name")
  status            String   @default("draft")
  totalEmployees    Int      @default(0) @map("total_employees")
  processedCount    Int      @default(0) @map("processed_count")
  totalGross        Decimal  @default(0) @map("total_gross") @db.Decimal(14, 2)
  totalNet          Decimal  @default(0) @map("total_net") @db.Decimal(14, 2)
  totalDeductions   Decimal  @default(0) @map("total_deductions") @db.Decimal(14, 2)
  includeOt         Boolean  @default(true) @map("include_ot")
  payDate           DateTime? @map("pay_date") @db.Date
  finalizedAt       DateTime? @map("finalized_at")
  notes             String?
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  tenant   Tenant    @relation(fields: [tenantId], references: [id])
  payslips Payslip[]

  @@unique([tenantId, periodMonth, periodYear])
  @@map("payroll_runs")
}

model Payslip {
  id                String   @id @default(uuid())
  tenantId          String   @map("tenant_id")
  runId             String   @map("run_id")
  employeeId        String   @map("employee_id")
  periodMonth       Int      @map("period_month")
  periodYear        Int      @map("period_year")
  workingDays       Int?     @map("working_days")
  presentDays       Decimal? @map("present_days") @db.Decimal(5, 1)
  absentDays        Decimal? @map("absent_days") @db.Decimal(5, 1)
  leaveDays         Decimal? @map("leave_days") @db.Decimal(5, 1)
  lopDays           Decimal  @default(0) @map("lop_days") @db.Decimal(5, 1)
  otHours           Decimal  @default(0) @map("ot_hours") @db.Decimal(6, 2)
  grossSalary       Decimal  @map("gross_salary") @db.Decimal(12, 2)
  netSalary         Decimal  @map("net_salary") @db.Decimal(12, 2)
  totalEarnings     Decimal  @map("total_earnings") @db.Decimal(12, 2)
  totalDeductions   Decimal  @map("total_deductions") @db.Decimal(12, 2)
  earnings          Json     @default("[]")
  deductions        Json     @default("[]")
  pdfUrl            String?  @map("pdf_url")
  isPublished       Boolean  @default(false) @map("is_published")
  publishedAt       DateTime? @map("published_at")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  run      PayrollRun @relation(fields: [runId], references: [id])
  employee Employee   @relation(fields: [employeeId], references: [id])

  @@unique([tenantId, runId, employeeId])
  @@map("payslips")
}

// ─── NOTIFICATIONS & AUDIT ────────────────────────────────────────────────────

model Notification {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  userId        String   @map("user_id")
  title         String
  body          String?
  type          String?
  referenceId   String?  @map("reference_id")
  referenceType String?  @map("reference_type")
  isRead        Boolean  @default(false) @map("is_read")
  readAt        DateTime? @map("read_at")
  createdAt     DateTime @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id])
  user   User   @relation(fields: [userId], references: [id])

  @@map("notifications")
}

model AuditLog {
  id         String   @id @default(uuid())
  tenantId   String   @map("tenant_id")
  userId     String?  @map("user_id")
  action     String
  module     String
  recordId   String?  @map("record_id")
  oldData    Json?    @map("old_data")
  newData    Json?    @map("new_data")
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent")
  createdAt  DateTime @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@map("audit_logs")
}
```

---

## 4. NESTJS MODULE STRUCTURE

Each module follows this pattern:

```
modules/attendance/
├── attendance.module.ts
├── attendance.controller.ts
├── attendance.service.ts
├── attendance.repository.ts        ← Prisma queries isolated here
├── dto/
│   ├── punch-in.dto.ts
│   ├── punch-out.dto.ts
│   └── attendance-filter.dto.ts
└── types/
    └── attendance.types.ts
```

### Module List

```
modules/
├── auth/               ← login, register, refresh, logout, MFA
├── tenants/            ← tenant creation, plan management
├── companies/          ← company CRUD, branch management
├── locations/          ← location + geo-fence CRUD
├── employees/          ← employee CRUD, import, export
├── departments/        ← department + designation CRUD
├── shifts/             ← shift CRUD, clone, rotation
├── shift-assignments/  ← assign shifts to employees/depts
├── holiday-calendar/   ← calendar + holiday CRUD
├── attendance/         ← punch, validate, override, export
├── regularisation/     ← submit, approve, reject workflow
├── leave/              ← types, balances, requests, approval
├── overtime/           ← requests, approval, reports
├── payroll/            ← payroll engine, run, payslip, PDF
├── approvals/          ← unified approval inbox
├── notifications/      ← in-app + email notifications
├── rbac/               ← roles, permissions management
├── audit/              ← audit log queries
└── dashboard/          ← aggregated stats per role
```

### `app.module.ts` excerpt

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    CompaniesModule,
    LocationsModule,
    EmployeesModule,
    DepartmentsModule,
    ShiftsModule,
    HolidayCalendarModule,
    AttendanceModule,
    RegularisationModule,
    LeaveModule,
    OvertimeModule,
    PayrollModule,
    ApprovalsModule,
    NotificationsModule,
    RbacModule,
    AuditModule,
    DashboardModule,
  ],
})
export class AppModule {}
```

---

## 5. REST API DESIGN

### Base URL: `/api/v1`

All endpoints require:
- `Authorization: Bearer <access_token>`
- `X-Tenant-Slug: acme-corp` (or resolved from JWT)

### Auth

```
POST   /auth/login
POST   /auth/register
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/mfa/enable
POST   /auth/mfa/verify
```

### Company Setup

```
GET    /company
PUT    /company
GET    /company/branches
POST   /company/branches
PUT    /company/branches/:id
DELETE /company/branches/:id
```

### Locations & Geo-Fences

```
GET    /locations
POST   /locations
GET    /locations/:id
PUT    /locations/:id
DELETE /locations/:id

GET    /geo-fences
POST   /geo-fences
GET    /geo-fences/:id
PUT    /geo-fences/:id
DELETE /geo-fences/:id
POST   /geo-fences/:id/assign      ← assign to employees/depts
```

### Employees

```
GET    /employees?page=1&limit=20&dept=&search=
POST   /employees
GET    /employees/:id
PUT    /employees/:id
DELETE /employees/:id
POST   /employees/import            ← bulk CSV import
GET    /employees/export            ← CSV export
```

### Departments & Designations

```
GET    /departments
POST   /departments
PUT    /departments/:id
DELETE /departments/:id

GET    /designations
POST   /designations
PUT    /designations/:id
DELETE /designations/:id
```

### Shifts & Assignments

```
GET    /shifts
POST   /shifts
GET    /shifts/:id
PUT    /shifts/:id
DELETE /shifts/:id
POST   /shifts/:id/clone

GET    /shift-assignments
POST   /shift-assignments
POST   /shift-assignments/bulk      ← assign to many employees
PUT    /shift-assignments/:id
DELETE /shift-assignments/:id
```

### Holiday Calendar

```
GET    /holiday-calendars
POST   /holiday-calendars
GET    /holiday-calendars/:id/holidays
POST   /holiday-calendars/:id/holidays
PUT    /holiday-calendars/:id/holidays/:holidayId
DELETE /holiday-calendars/:id/holidays/:holidayId
```

### Attendance

```
POST   /attendance/punch-in
POST   /attendance/punch-out
GET    /attendance?employeeId=&date=&month=&year=
GET    /attendance/:id
PUT    /attendance/:id/override     ← admin manual correction
GET    /attendance/live             ← today's live status
GET    /attendance/reports          ← monthly report
GET    /attendance/export           ← Excel download

GET    /geo-violations
PUT    /geo-violations/:id/resolve
```

### Regularisation

```
GET    /regularisations             ← employee: own; manager/hr: team
POST   /regularisations
GET    /regularisations/:id
PUT    /regularisations/:id/approve
PUT    /regularisations/:id/reject
DELETE /regularisations/:id         ← cancel own request
```

### Leave

```
GET    /leave-types
POST   /leave-types
PUT    /leave-types/:id

GET    /leave-balances              ← ?employeeId= or current user
POST   /leave-balances/carry-forward ← year-end job trigger

GET    /leave-requests
POST   /leave-requests
GET    /leave-requests/:id
PUT    /leave-requests/:id/approve
PUT    /leave-requests/:id/reject
DELETE /leave-requests/:id          ← cancel
GET    /leave-requests/calendar     ← monthly calendar view
```

### Overtime

```
GET    /ot-requests
POST   /ot-requests
GET    /ot-requests/:id
PUT    /ot-requests/:id/approve
PUT    /ot-requests/:id/reject
DELETE /ot-requests/:id
GET    /ot-requests/reports
```

### Payroll

```
GET    /payroll/salary-components
POST   /payroll/salary-components
PUT    /payroll/salary-components/:id

GET    /payroll/salary-structures/:employeeId
POST   /payroll/salary-structures
PUT    /payroll/salary-structures/:id

GET    /payroll/runs
POST   /payroll/runs
GET    /payroll/runs/:id
PUT    /payroll/runs/:id/process    ← trigger calculation
PUT    /payroll/runs/:id/finalize
PUT    /payroll/runs/:id/lock

GET    /payslips?employeeId=&month=&year=
GET    /payslips/:id
GET    /payslips/:id/pdf            ← PDF download
POST   /payslips/publish            ← publish to employees
```

### Unified Approvals Inbox

```
GET    /approvals/inbox             ← all pending for current user
GET    /approvals/inbox/count       ← badge count
```

### Dashboard

```
GET    /dashboard/stats             ← summary cards
GET    /dashboard/attendance-today  ← present/absent/late counts
GET    /dashboard/leave-summary
GET    /dashboard/ot-summary
GET    /dashboard/payroll-status
```

---

## 6. RBAC MATRIX

| Permission | super_admin | hr_admin | manager | employee |
|---|---|---|---|---|
| company.read | ✓ | ✓ | — | — |
| company.write | ✓ | — | — | — |
| employees.read | ✓ | ✓ | team only | self only |
| employees.write | ✓ | ✓ | — | — |
| employees.delete | ✓ | — | — | — |
| attendance.read | ✓ | ✓ | team | self |
| attendance.punch | ✓ | ✓ | ✓ | ✓ |
| attendance.override | ✓ | ✓ | — | — |
| regularisation.submit | ✓ | ✓ | ✓ | ✓ |
| regularisation.approve | ✓ | ✓ | ✓ (team) | — |
| leave.apply | ✓ | ✓ | ✓ | ✓ |
| leave.approve | ✓ | ✓ | ✓ (team) | — |
| leave.settings | ✓ | ✓ | — | — |
| ot.submit | ✓ | ✓ | ✓ | ✓ |
| ot.approve | ✓ | ✓ | ✓ (team) | — |
| payroll.run | ✓ | ✓ | — | — |
| payroll.view_own | ✓ | ✓ | ✓ | ✓ |
| shifts.manage | ✓ | ✓ | — | — |
| locations.manage | ✓ | ✓ | — | — |
| geo_fences.manage | ✓ | ✓ | — | — |
| audit.read | ✓ | — | — | — |
| rbac.manage | ✓ | — | — | — |

---

## 7. APPROVAL WORKFLOW ENGINE

### Stage Pattern (shared across Leave, Regularisation, OT)

```typescript
// Approval stages stored as DB columns — NOT a generic engine table
// This allows simple SQL queries without joins

interface ApprovalRecord {
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  current_stage: 'manager' | 'hr' | 'done'

  manager_id: uuid
  manager_action: 'approved' | 'rejected' | null
  manager_remark: string | null
  manager_acted_at: timestamp | null

  hr_id: uuid
  hr_action: 'approved' | 'rejected' | null
  hr_remark: string | null
  hr_acted_at: timestamp | null
}

// can_act flag — computed server-side, sent to frontend
function canAct(record: ApprovalRecord, currentUser: User): boolean {
  if (record.status !== 'pending') return false
  if (record.current_stage === 'manager') {
    return currentUser.role === 'manager' && currentUser.employeeId === record.manager_id
  }
  if (record.current_stage === 'hr') {
    return currentUser.role === 'hr_admin' || currentUser.role === 'super_admin'
  }
  return false
}
```

### Stage Transitions

```
Submit (employee)
  → current_stage = 'manager', status = 'pending'

Manager approves
  → manager_action = 'approved', current_stage = 'hr'

Manager rejects
  → manager_action = 'rejected', status = 'rejected', current_stage = 'done'

HR approves
  → hr_action = 'approved', status = 'approved', current_stage = 'done'
  → trigger: update attendance / leave balance / OT log

HR rejects
  → hr_action = 'rejected', status = 'rejected', current_stage = 'done'
```

---

## 8. UI COMPONENT TREE (Shadcn/UI)

### Global Layout

```
<AdminLayout>
  <Sidebar>
    <SidebarLogo />
    <SidebarNav groups={SIDEBAR_GROUPS} />
    <SidebarUser />
  </Sidebar>
  <div className="flex flex-col flex-1">
    <Header>
      <Breadcrumbs />
      <SearchBar />
      <NotificationBell count={unreadCount} />
      <UserMenu />
    </Header>
    <main className="p-6">
      {children}
    </main>
  </div>
</AdminLayout>
```

### Sidebar Navigation Groups

```typescript
const SIDEBAR_GROUPS = [
  {
    label: 'SETUP',
    items: [
      { icon: Building2, label: 'Company Settings', href: '/setup/company' },
      { icon: MapPin, label: 'Locations', href: '/setup/locations' },
      { icon: Radio, label: 'Geo Fences', href: '/setup/geo-fences' },
      { icon: Calendar, label: 'Holiday Calendar', href: '/setup/holiday-calendar' },
      { icon: Clock, label: 'Shift Management', href: '/setup/shifts' },
      { icon: Umbrella, label: 'Leave Policies', href: '/setup/leave-policies' },
      { icon: Fingerprint, label: 'Attendance Policies', href: '/setup/attendance-policies' },
      { icon: Timer, label: 'OT Policies', href: '/setup/ot-policies' },
      { icon: DollarSign, label: 'Payroll Policies', href: '/setup/payroll-policies' },
      { icon: GitBranch, label: 'Approval Workflows', href: '/setup/approval-workflows' },
    ]
  },
  {
    label: 'EMPLOYEES',
    items: [
      { icon: Users, label: 'Employee Directory', href: '/employees' },
      { icon: UserPlus, label: 'Onboarding', href: '/employees/onboarding' },
      { icon: CalendarCheck, label: 'Shift Assignment', href: '/employees/shift-assignment' },
      { icon: LocateFixed, label: 'Geo Assignment', href: '/employees/geo-assignment' },
    ]
  },
  {
    label: 'ATTENDANCE',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/attendance/dashboard' },
      { icon: Activity, label: 'Live Attendance', href: '/attendance/live' },
      { icon: ClipboardList, label: 'Attendance Logs', href: '/attendance/logs' },
      { icon: AlertTriangle, label: 'Geo Violations', href: '/attendance/geo-violations' },
      { icon: RefreshCw, label: 'Regularisation', href: '/attendance/regularisation' },
      { icon: BarChart2, label: 'Reports', href: '/attendance/reports' },
    ]
  },
  {
    label: 'LEAVE',
    items: [
      { icon: FileText, label: 'Leave Requests', href: '/leave/requests' },
      { icon: PieChart, label: 'Leave Balances', href: '/leave/balances' },
      { icon: CalendarDays, label: 'Leave Calendar', href: '/leave/calendar' },
    ]
  },
  {
    label: 'OVERTIME',
    items: [
      { icon: Plus, label: 'OT Requests', href: '/overtime/requests' },
      { icon: CheckSquare, label: 'OT Approval', href: '/overtime/approval' },
      { icon: BarChart, label: 'OT Reports', href: '/overtime/reports' },
    ]
  },
  {
    label: 'PAYROLL',
    items: [
      { icon: Play, label: 'Payroll Run', href: '/payroll/run' },
      { icon: FileStack, label: 'Payslips', href: '/payroll/payslips' },
      { icon: TrendingUp, label: 'Payroll Reports', href: '/payroll/reports' },
    ]
  },
  {
    label: 'SETTINGS',
    items: [
      { icon: Shield, label: 'Roles & Permissions', href: '/settings/roles' },
      { icon: ScrollText, label: 'Audit Logs', href: '/settings/audit-logs' },
      { icon: Plug, label: 'Integrations', href: '/settings/integrations' },
    ]
  },
]
```

### Page-Level Component Patterns

```typescript
// Every page follows this structure:
<PageContainer>
  <PageHeader title="Attendance Logs" description="View and manage daily attendance records">
    <Button onClick={openFilterDrawer}><Filter /> Filters</Button>
    <ExportButton />
    <Button onClick={openAddDrawer}><Plus /> Add Manual</Button>
  </PageHeader>

  {/* Stat Cards */}
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <StatCard label="Present Today" value={312} trend={+5} color="green" icon={UserCheck} />
    <StatCard label="Absent" value={98} trend={-3} color="red" icon={UserX} />
    <StatCard label="Late" value={26} trend={+2} color="amber" icon={Clock} />
    <StatCard label="Outside Geo-Fence" value={7} color="orange" icon={MapOff} />
    <StatCard label="GPS Failed" value={4} color="gray" icon={Wifi} />
  </div>

  {/* Data Table */}
  <Card>
    <CardContent>
      <DataTable
        columns={attendanceColumns}
        data={attendanceData}
        pagination={pagination}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </CardContent>
  </Card>

  {/* Drawer/Sheet for forms */}
  <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
    <SheetContent className="w-[480px]">
      <RegularisationForm onSuccess={handleSuccess} />
    </SheetContent>
  </Sheet>
</PageContainer>
```

---

## 9. FORMS SPECIFICATION

### Attendance Form (Manual Punch)
```
Fields: Employee (SearchableSelect), Date, Check-In Time, Check-Out Time,
        Location (Select), Remarks (Textarea)
Validation: date required, check-out > check-in
```

### Regularisation Form
```
Fields: Date (DatePicker), Type (Select: Late In/Early Out/Missed Punch/…),
        In-Time (TimePicker), Out-Time (TimePicker),
        Reason (Textarea, required), Attachment (FileUpload, optional)
```

### Leave Application Form
```
Fields: Leave Type (Select with balance badge), From Date, To Date,
        Session (Radio: Full Day/First Half/Second Half),
        Days (auto-calc, read-only), Reason (Textarea), Attachment
Validation: from ≤ to, days ≤ balance, min notice days
```

### OT Request Form
```
Fields: Date, From Time, To Time, Total Hours (auto-calc),
        Type (Select: Extra/Comp-Off/Holiday Work), Reason
```

### Add Shift Form
```
Fields: Shift Name, Code, Start Time, End Time, Break (min),
        Grace In (min), Grace Out (min), Half Day Hours,
        Attendance Mode (Radio), Night Shift (Toggle),
        Flexible (Toggle), Working Days (Checkboxes)
```

### Geo-Fence Form
```
Fields: Name, Location (Select), Map Picker (Google Maps with radius drag),
        Radius (meters slider + input), Require Selfie (Toggle),
        GPS Accuracy (Select), Status (Toggle)
```

### Payroll Run Form
```
Fields: Month (Select), Year (Select), Pay Group (Select/All),
        Salary Components (multi-select checkboxes),
        Include OT (Toggle), Include Leave Encashment (Toggle),
        Include Loan Deductions (Toggle), Pay Date
```

---

## 10. SETTINGS SPECIFICATION

### Attendance Settings
```
Working Days: Mon–Sat (checkbox grid)
Shift Timing: default shift picker
Late Marking After: input (minutes)
Half Day Less Than: input (hours)
Enable Geo-Location: toggle
Enable Selfie on Check-in: toggle
Auto Check-out After: select (15min / 30min / 1hr / shift end)
```

### OT Settings
```
OT Calculation: Daily / Weekly / Monthly
OT Start After: input (hours, e.g. 9)
OT Rate: select (1.0x / 1.5x / 2.0x)
Daily OT Limit: input (hours)
Weekly OT Limit: input (hours)
OT Requires Approval: toggle
Carry Forward OT: toggle
```

### Regularisation Settings
```
Approval Workflow: select (HR Only / HR + Manager)
Auto Publish to Portal: toggle
Regularisation Allowed After (Days): input
Allow Back Date Regularisation: toggle
Require Reason: toggle
Notify Manager: toggle
```

### Leave Settings
```
Leave Types (table): Name, Code, Paid, Max Days, Carry Forward, Accrual
Leave Approval Workflow: Manager First / HR First / Both
Min Notice Days: input
Allow Half Day: toggle
Allow Future Dating: toggle
Leave Carry Forward: toggle (per type)
Leave Encashment: toggle
```

### Payroll Settings
```
Pay Period: Monthly / Bi-weekly
Pay Day: input (1–31)
Payroll Approval Workflow: HR + Finance / HR Only
Round Off: Nearest Rupee / Exact
PF Applicable: toggle (12% of Basic)
ESI Applicable: toggle (threshold)
Tax Regime: Old / New
```

---

## 11. DASHBOARD SCREENS

### HR Admin Dashboard

```
Header: "HRMS Functional Flow" subtitle "Recommended Operational Flow"

Functional Flow Banner (numbered steps with arrows):
1 → Holiday Calendar → 2 → Shift Management → 3 → Shift Assignment
4 → Attendance → 5 → Regularisation → 6 → Leave/Absence
7 → Overtime → 8 → Payroll

Summary Widget Grid (8 columns, one per flow step):
┌─────────────────────────────────────────────────────────────┐
│ Holiday Calendar │ Shift Mgmt │ Shift Assign │ Attendance   │
│ Upcoming: 3      │ Active: 5  │ Assigned: 358│ Present: 235 │
│ [Go to Holiday]  │ [Go to SM] │ [Go to SA]   │ [Go to Att]  │
├─────────────────────────────────────────────────────────────┤
│ Regularisation   │ Leave      │ Overtime     │ Payroll      │
│ Pending: 28      │ Pending: 18│ Total: 186h  │ In Progress  │
│ [Go to Reg]      │ [Go to Lv] │ [Go to OT]   │ [Run Payroll]│
└─────────────────────────────────────────────────────────────┘

Today's Attendance Card:
  Present 235 (65%) | Absent 78 (22%) | Late 32 (9%) | Half Day 13 (4%)
  [Donut chart]

My Leave Balance:
  CL: 12 | SL: 08 | PL: 04 | EL: 02
```

### Attendance Dashboard (Stats Row)
```
┌────────────┬───────────┬──────────┬─────────────────┬────────────┐
│Present 312 │Absent  98 │Late   26 │Outside Fence  7 │GPS Failed 4│
│  65.02%    │  20.48%   │   5.48%  │     1.48%       │   0.84%    │
└────────────┴───────────┴──────────┴─────────────────┴────────────┘
```

---

## 12. MOBILE ATTENDANCE SCREEN (API-driven)

```
Mobile App: React Native (or PWA with Next.js)

Check-In Screen:
  - Current time display
  - Current location (resolved address)
  - Geo-fence status chip: "Inside Chennai HQ Fence ✓" or "Outside Fence ✗"
  - Selfie capture button (if required by policy)
  - [Check In] primary button
  - GPS accuracy indicator

Check-Out Screen (same layout, after check-in):
  - Duration: "You've worked 8h 15m"
  - [Check Out] button

My Attendance Tab:
  Calendar grid with color-coded days:
    Green = Present, Red = Absent, Amber = Late, Blue = Holiday, Grey = Weekend

Today Overview widget:
  Present: 235 | Absent: 78 | Late: 32 | Half Day: 13
  [Donut chart with % in center]
```

---

## 13. PAYROLL SCREEN FLOWS

### Payroll Run Screen
```
1. Select Period: [May 2024 ▼]  Pay Group: [All Employees ▼]
2. Components toggle panel: ☑ Include Overtime  ☑ Leave Encashment  ☑ Loan Deductions
3. [Run Payroll] → status: Processing…
4. Summary table:
   Employee | Dept | Days | Gross | Deductions | Net
   ...
5. [Review & Approve] → [Finalize & Lock] → [Generate Payslips] → [Publish]

Status Badge: Draft → Processing → Review → Approved → Finalized → Paid
```

### Payslip View
```
┌─────────────────────────────────────────────────────────────┐
│ ACME CORP                                   PAYSLIP May 2024│
│ Rohit Sharma  |  EMP-001  |  Engineering  |  31 May 2024   │
├────────────────────────┬────────────────────────────────────┤
│ EARNINGS               │ DEDUCTIONS                         │
│ Basic Salary  ₹25,000  │ PF (12%)          ₹3,000          │
│ HRA           ₹10,000  │ ESI (0.75%)       ₹188            │
│ DA             ₹2,500  │ TDS               ₹2,000          │
│ OT Allowance   ₹1,500  │ Advance Recovery  ₹0              │
│ ─────────────────────  │ ─────────────────────────────      │
│ Gross         ₹39,000  │ Total             ₹5,188          │
│                        │                                    │
│                        │ NET PAY          ₹33,812          │
├────────────────────────┴────────────────────────────────────┤
│ Working Days: 26 | Present: 24 | Leave: 2 | LOP: 0 | OT: 3h│
└─────────────────────────────────────────────────────────────┘
                          [Download PDF]  [Email]
```

---

## 14. SEED DATA

```typescript
// prisma/seed.ts

async function main() {
  // 1. Tenant
  const tenant = await prisma.tenant.create({
    data: { name: 'Acme Corp', slug: 'acme-corp', plan: 'pro' }
  })

  // 2. Superadmin user
  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@acme.com',
      passwordHash: await bcrypt.hash('Admin@123', 12),
      firstName: 'Rohit', lastName: 'Sharma',
    }
  })

  // 3. System roles
  const roles = await Promise.all([
    prisma.role.create({ data: { tenantId: tenant.id, name: 'super_admin', isSystemRole: true } }),
    prisma.role.create({ data: { tenantId: tenant.id, name: 'hr_admin', isSystemRole: true } }),
    prisma.role.create({ data: { tenantId: tenant.id, name: 'manager', isSystemRole: true } }),
    prisma.role.create({ data: { tenantId: tenant.id, name: 'employee', isSystemRole: true } }),
  ])

  // 4. Company
  const company = await prisma.company.create({
    data: {
      tenantId: tenant.id, name: 'Acme Corp',
      timezone: 'Asia/Kolkata', currency: 'INR'
    }
  })

  // 5. Branches
  const hq = await prisma.branch.create({
    data: { tenantId: tenant.id, companyId: company.id,
            name: 'Head Office - Chennai', code: 'HO-CHN', isHeadquarter: true, city: 'Chennai' }
  })

  // 6. Departments
  const engineering = await prisma.department.create({
    data: { tenantId: tenant.id, branchId: hq.id, name: 'Engineering', code: 'ENG' }
  })

  // 7. Shifts
  await prisma.shift.create({
    data: {
      tenantId: tenant.id, name: 'General Shift',
      startTime: new Date('1970-01-01T09:00:00'),
      endTime: new Date('1970-01-01T18:00:00'),
      breakMinutes: 60, graceIn: 15, graceOut: 15,
      workingDays: [1,2,3,4,5], attendanceMode: 'GEO_FENCE'
    }
  })

  // 8. Locations
  await prisma.location.create({
    data: {
      tenantId: tenant.id, branchId: hq.id,
      name: 'Head Office - Chennai', code: 'HO-CHN',
      latitude: 13.0827, longitude: 80.2707, radiusMeters: 200,
      address: '123, Mount Road, Guindy, Chennai - 600032'
    }
  })

  // 9. Leave types
  const leaveTypes = [
    { name: 'Casual Leave', code: 'CL', maxDaysPerYear: 12, color: '#6366f1' },
    { name: 'Sick Leave', code: 'SL', maxDaysPerYear: 8, color: '#f59e0b' },
    { name: 'Earned Leave', code: 'EL', maxDaysPerYear: 15, carryForwardLimit: 15, color: '#10b981' },
    { name: 'Loss of Pay', code: 'LOP', isPaid: false, maxDaysPerYear: 365, color: '#ef4444' },
    { name: 'Maternity Leave', code: 'ML', maxDaysPerYear: 182, applicableGender: 'female', color: '#ec4899' },
  ]
  for (const lt of leaveTypes) {
    await prisma.leaveType.create({ data: { tenantId: tenant.id, ...lt } })
  }

  // 10. Salary components
  const components = [
    { name: 'Basic Salary', code: 'BASIC', type: 'earning', calcType: 'fixed' },
    { name: 'HRA', code: 'HRA', type: 'earning', calcType: 'percentage', value: 40 },
    { name: 'DA', code: 'DA', type: 'earning', calcType: 'percentage', value: 10 },
    { name: 'OT Allowance', code: 'OT_ALLOW', type: 'earning', calcType: 'formula' },
    { name: 'PF (Employee)', code: 'PF_EMP', type: 'deduction', calcType: 'percentage', value: 12, pfApplicable: true },
    { name: 'ESI (Employee)', code: 'ESI_EMP', type: 'deduction', calcType: 'percentage', value: 0.75, esiApplicable: true },
    { name: 'TDS', code: 'TDS', type: 'deduction', calcType: 'fixed', isTaxable: true },
  ]
  for (const comp of components) {
    await prisma.salaryComponent.create({ data: { tenantId: tenant.id, ...comp } })
  }

  console.log('Seed complete ✓')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

---

## 15. DOCKER & DEPLOYMENT

### `docker-compose.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: hrms
      POSTGRES_PASSWORD: hrms_secret
      POSTGRES_DB: hrms_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://hrms:hrms_secret@postgres:5432/hrms_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your_jwt_secret_here
      JWT_REFRESH_SECRET: your_refresh_secret_here
      JWT_EXPIRES_IN: 15m
      JWT_REFRESH_EXPIRES_IN: 7d
      AWS_S3_BUCKET: hrms-uploads
      AWS_REGION: ap-south-1
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001/api/v1
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
```

### `apps/api/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

---

## 16. COMPLETE USER JOURNEY

### Journey: Employee submits regularisation → Manager/HR approves → Attendance updated

```
1. Employee opens "My Attendance" → sees "Missed Punch" for May 15
2. Clicks "+ New Regularisation"
3. Fills Regularisation Form:
   - Date: May 15, Type: Missed Punch
   - In Time: 09:15 AM, Out Time: 06:30 PM
   - Reason: "Forgot to punch – was at client site"
4. Submits → API: POST /regularisations
   - status = 'pending', current_stage = 'manager'
   - Notification sent to Manager

5. Manager opens Approval Inbox → sees "Rohit – Regularisation – May 15"
   can_act = true (role=manager, manager_id matches)
6. Manager reviews, clicks "Approve" with remark
7. API: PUT /regularisations/:id/approve
   - manager_action = 'approved', current_stage = 'hr'
   - Notification sent to HR

8. HR opens Approval Inbox → sees same item in stage 'hr'
   can_act = true (role=hr_admin)
9. HR approves → API PUT /regularisations/:id/approve
   - hr_action = 'approved', status = 'approved', current_stage = 'done'
   - TRIGGER: attendance_logs updated: punch_in = 09:15, punch_out = 18:30,
     working_hours = 8.25, status = 'present', late_by = 15
   - Notification sent to Employee: "Regularisation Approved ✓"

10. Employee sees updated attendance record, status = Present
```

---

## 17. ENVIRONMENT VARIABLES

```env
# apps/api/.env
DATABASE_URL=postgresql://hrms:hrms_secret@localhost:5432/hrms_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=super_secret_refresh_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=hrms-uploads
AWS_REGION=ap-south-1
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@acme.com
SMTP_PASS=
GOOGLE_MAPS_API_KEY=
CORS_ORIGINS=http://localhost:3000

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
NEXT_PUBLIC_APP_NAME=HRMS
```

---

## QUICK START FOR CHATGPT

Paste this document and say:

> "Using this spec, generate the NestJS `AttendanceModule` including:
> - `attendance.module.ts`
> - `attendance.controller.ts` (punch-in, punch-out, list endpoints)
> - `attendance.service.ts` (geo-fence validation, hours calculation)
> - `attendance.repository.ts` (Prisma queries)
> - DTOs: `PunchInDto`, `PunchOutDto`, `AttendanceFilterDto`
> - Geo-fence distance formula using Haversine
> - Include `can_act` logic for regularisation"

Or for frontend:

> "Using this spec, generate the Next.js 15 `app/(dashboard)/attendance/regularisation/page.tsx` with:
> - TanStack Query for data fetching from /regularisations
> - Shadcn DataTable with columns: Employee, Date, Type, Status, can_act buttons
> - Sheet drawer with RegularisationForm using React Hook Form + Zod
> - Approve/Reject with optimistic update"

---

*Generated: 2026-06-16 | Next.js 15 + NestJS + Prisma + PostgreSQL | Enterprise HRMS v2.0*
