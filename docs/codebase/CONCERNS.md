# Concerns

## Security and production hardening

- The SPA stores JWTs in `localStorage`; XSS could expose an active token. Consider an HttpOnly secure-cookie session approach for a public production deployment.
- Stateless JWTs expire after the configured lifetime (8 hours by default) but have no refresh mechanism. Password changes revoke earlier tokens, but there is no standalone administrator session-revocation action or forgotten-password recovery.
- Login rate limiting, account lockout, email invitations, audit events, and security monitoring are not implemented.
- Local MySQL fallback values in `application.yml` are development-only. Production must set database credentials and a high-entropy Base64 `EMS_JWT_SECRET` outside source control.

## Product and data gaps

- Only the two roles found in the original source (`ADMIN` and `EMPLOYEE`) were carried forward; the six-role model in the attached prompt was not present to preserve.
- No departments, manager hierarchy, leave/attendance, documents, global audit log, real notifications, pagination, or bulk employee import is implemented.
- The former prototype stored demo users and task data in browser localStorage. Those records are not migrated to MySQL; no sample production account or credential is seeded.
- The application has not been exercised against a live MySQL instance in this environment; automated backend tests use H2.

## Runtime and operations

- Docker Compose provides a local MySQL service only, not a packaged/deployed API and frontend.
- No CI/CD pipeline or frontend component tests are configured.
- The README now requires Node versions compatible with Vite 8, which is newer than the previous README's Node 14 claim.
- [TODO] Target production hosting, database backup/restore policy, and monitoring provider are not established by repository files or the selected implementation scope.

## Change-risk / history

- The pre-change repository had a short history: the README appeared repeatedly, while recent source changes were distributed across individual task components. The sample is too small for a strong long-term churn signal.
- The older components with broken task callbacks and the local plaintext demo records were removed as part of replacing that prototype workflow with the server-backed implementation.

## Intent vs. implementation

- The selected direction is Java/Spring Boot + MySQL, and employee account provisioning is administrator-only.
- The attached prompt's broader enterprise feature wish list is not claimed as implemented; this repository now has working employee provisioning, account activation, and task assignment/status flows backed by the API.
- MongoDB was not added because the verified domain does not require a second database.

## Evidence

- `src/utils/api.js`
- `src/context/AuthProvider.jsx`
- `backend/src/main/resources/application.yml`
- `backend/src/main/java/com/ems/auth/JwtService.java`
- `backend/src/main/java/com/ems/config/BootstrapAdmin.java`
- `backend/src/main/java/com/ems/employee/Role.java`
- `backend/src/main/java/com/ems/task/TaskService.java`
- `backend/src/main/resources/db/migration/V1__create_users_and_tasks.sql`
- `backend/src/test/java/com/ems/WorkspaceAuthorizationTest.java`
- `docker-compose.yml`
- `package.json`
- `README.md`
- Recent pre-change `git log --name-only` output
