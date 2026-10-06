# EMS — People & Progress

EMS is a full-stack employee and task workspace. Administrators provision employee accounts, organize the team directory, assign tasks, and review live workload. Employees see only their own assigned work and can move tasks through the supported workflow.

The visual system is designed for an everyday product workspace: a quiet people-operations palette, a focused work queue, responsive team directory, light/dark themes, and restrained motion. Dashboard figures are derived from API data; the application does not use fabricated analytics.

## Features

- Administrator and employee sign-in with BCrypt password hashing and short-lived JWT access tokens.
- Administrator-only employee provisioning and account activation/deactivation.
- Employee password changes with immediate invalidation of tokens issued under the previous password.
- Role-protected employee directory and task-assignment APIs.
- Employee-scoped task reads and task updates; task ownership is checked on the server.
- Task transitions: `NEW → ACTIVE → COMPLETED|FAILED`.
- Live dashboard metrics, workload distribution, searchable employee/task lists, task status filters, and explicit loading/error/empty states.
- Responsive mobile navigation and directory cards, persistent light/dark preference, keyboard-friendly forms, and reduced-motion-aware transitions.
- MySQL schema migrations through Flyway and an optional local MySQL Docker Compose service.

## Stack

- **Frontend:** React 18, Vite 8, Framer Motion, Lucide, CSS.
- **Backend:** Java 17+, Spring Boot 3.5, Spring Security, Spring Data JPA, Flyway, JJWT.
- **Database:** MySQL 8.4.
- **Tests:** ESLint and Vite production build on the frontend; JUnit, Spring Boot Test, MockMvc, and H2 test profile on the backend.

There are two roles in this codebase (`ADMIN` and `EMPLOYEE`); the former local prototype did not contain a six-role permission model.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` and npm.
- Java 17 or later.
- Maven 3.9 or later.
- Docker Compose is optional if MySQL is already available.

## Local setup

### 1. Configure MySQL and secrets

From the repository root, copy the example environment file and replace every placeholder with local values:

```powershell
Copy-Item .env.example .env
```

Generate a signing key with PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Put the resulting Base64 value in `EMS_JWT_SECRET`. Set unique values for the database passwords and a unique 12-character-or-longer bootstrap administrator password. `.env` is ignored by Git; do not commit secrets.

To run the included MySQL service:

```powershell
docker compose up -d mysql
```

To load `.env` into the current PowerShell process before starting the API:

```powershell
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    Set-Item -Path "Env:$($matches[1].Trim())" -Value $matches[2]
  }
}
```

### 2. Start the API

In the same PowerShell session where the environment values were loaded:

```powershell
Set-Location backend
mvn spring-boot:run
```

On first startup, Flyway creates the schema. If `EMS_BOOTSTRAP_ADMIN_EMAIL` and `EMS_BOOTSTRAP_ADMIN_PASSWORD` are configured, one administrator account is created when that email is not already present. Employee accounts are created later by an administrator in the application.

### 3. Start the frontend

In a second terminal from the repository root:

```powershell
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The frontend calls `http://localhost:8080/api` by default. To use another API origin, define `VITE_API_BASE_URL` before starting Vite.

## Vercel and public demo accounts

Vercel can host the Vite frontend, but it does not run this Spring Boot API as part of the static frontend deployment. To use the application after merging or deploying the frontend, first deploy the API to a Java-capable host with a persistent MySQL database, then configure:

- **Vercel build environment:** `VITE_API_BASE_URL` set to the deployed API's HTTPS URL ending in `/api`, plus `VITE_DEMO_ADMIN_EMAIL`, `VITE_DEMO_ADMIN_PASSWORD`, `VITE_DEMO_EMPLOYEE_EMAIL`, and `VITE_DEMO_EMPLOYEE_PASSWORD`.
- **API environment:** `MYSQL_URL`, `MYSQL_USER`, `MYSQL_PASSWORD`, `EMS_JWT_SECRET`, and `EMS_CORS_ALLOWED_ORIGIN` set to the production values; set `EMS_DEMO_ACCOUNTS_ENABLED=true` and matching `EMS_DEMO_ADMIN_EMAIL`, `EMS_DEMO_ADMIN_PASSWORD`, `EMS_DEMO_EMPLOYEE_EMAIL`, and `EMS_DEMO_EMPLOYEE_PASSWORD`. `EMS_DEMO_EMPLOYEE_NAME` is optional.

The demo credentials in `.env.example` are deliberately public preview credentials, not private secrets. The login page displays them and lets a visitor fill them in. The administrator demo account has normal administrator permissions, and the employee account has normal employee permissions; all demo users share the same data. Use a disposable demo database with no real employee information. The API creates each account when absent and restores its configured password and active status on startup; an existing account at either demo email with a different role causes startup to fail.

After setting Vercel environment variables, redeploy so Vite embeds them in the frontend bundle. Set the API's allowed CORS origin to the exact production Vercel/custom domain. Vercel preview domains need their own CORS configuration if they must call the API. Merging the branch alone does not configure or deploy the API/database.

## API overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate and issue an access token |
| `GET` | `/api/auth/me` | Authenticated | Read the current account |
| `POST` | `/api/auth/change-password` | Authenticated | Change password and invalidate earlier access tokens |
| `GET` | `/api/employees/me` | Authenticated | Read the current employee |
| `GET` | `/api/employees` | Admin | List the team directory |
| `POST` | `/api/employees` | Admin | Provision an employee |
| `PATCH` | `/api/employees/{id}/active` | Admin | Activate/deactivate an employee |
| `GET` | `/api/tasks` | Authenticated | List all tasks for admins or only owned tasks for employees |
| `POST` | `/api/tasks` | Admin | Assign a task to an active employee |
| `PATCH` | `/api/tasks/{id}/status` | Authenticated | Update a task status, subject to owner and transition checks |

The API returns JSON error messages for validation, authentication, authorization, conflict, and not-found cases.

## Verification

```powershell
npm run lint
npm run build
Set-Location backend
mvn test
```

Backend tests use H2 and do not require a running MySQL server. For a live UI/API smoke test, run MySQL, the Spring Boot API, and Vite together; test administrator provisioning, employee login, cross-account task isolation, and status transitions.

## Security and operational boundaries

- JWTs are stored in browser `localStorage` for this SPA; an XSS issue could expose an active token. For a public production deployment, consider an HttpOnly secure-cookie session design, HTTPS, a restrictive Content Security Policy, rate limiting, forgotten-password recovery, and operational monitoring.
- Seeded demo credentials and old browser-local prototype data are not migrated. Create the first administrator through the configured bootstrap values, then provision team members in the workspace.
- The backend supports the verified two-role workflow and employee/task data model. Department management, audit history, notifications, leave/attendance, self-service registration, and six-role permission editing are not implemented.
- Local Docker Compose credentials and fallback datasource settings are for development only. Use a managed secret store and production database settings before deployment.
