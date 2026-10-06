# Integrations

## Database

- MySQL 8.4 stores employee and task records.
- Flyway applies the initial schema migration.
- `docker-compose.yml` can start a local MySQL container with a named data volume.
- H2 is test-scoped and is used only by the test Spring profile.

## Authentication and security

- Spring Security uses BCrypt password hashes, stateless Bearer JWT authentication, role-based endpoint protections, and configured CORS.
- An authenticated employee can change their password; incrementing the persisted token version invalidates tokens issued before that update.
- `EMS_JWT_SECRET`, token lifetime, allowed frontend origin, MySQL connection settings, and optional bootstrap administrator credentials come from environment variables.
- `.env.example` documents local configuration; `.env` is ignored by Git.
- Employee creation is administrator-only; public self-registration is not implemented.

## Frontend/API connection

- `src/utils/api.js` calls `VITE_API_BASE_URL` when set, otherwise `http://localhost:8080/api`.
- API errors are returned as JSON with a message and timestamp.
- The user selects light/dark preference and stores it locally; the access token is also stored locally for this SPA.

## Not integrated

- The repository does not use MongoDB, external identity providers, hosted monitoring, email delivery, or third-party HR services.
- Department/leave/attendance integrations, audit history, notifications, forgotten-password recovery, and multi-tenant provisioning are not present.

## Evidence

- `backend/pom.xml`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/db/migration/V1__create_users_and_tasks.sql`
- `backend/src/main/java/com/ems/config/SecurityConfig.java`
- `backend/src/main/java/com/ems/config/BootstrapAdmin.java`
- `src/utils/api.js`
- `src/components/Dashboard/Workspace.jsx`
- `.env.example`
- `.gitignore`
- `docker-compose.yml`
