# Architecture

## Application shape

The project is a React single-page frontend backed by a Spring Boot JSON REST API and MySQL. The client has role-aware navigation, but backend authentication and authorization enforce the actual data boundary.

## Authentication flow

1. The login form posts credentials to `POST /api/auth/login`.
2. Spring Security authenticates against the employee repository and BCrypt hash.
3. The API returns a signed JWT and a password-free employee response.
4. The frontend stores the JWT in `localStorage`, fetches the current account, and sends the token as a Bearer header for protected requests.
5. The API validates each token, reloads the active employee, and derives the current role from the database.
6. A password change hashes the new password and increments the employee token version, immediately invalidating existing JWTs for that account.
7. Invalid/expired tokens clear the client session; sign-out removes the client token.

## Authorization

- Roles verified in the codebase: `ADMIN` and `EMPLOYEE`.
- Administrators can list and provision employees, activate/deactivate accounts, list the team task queue, and create tasks.
- Employees can read only their own tasks and can move them from `NEW` to `ACTIVE`, then from `ACTIVE` to `COMPLETED` or `FAILED`.
- The task service scopes employee reads and writes by the authenticated employee ID.
- Deactivated users are rejected during JWT authentication.

## Data model and flow

- `Employee` has an enum role, email, active state, BCrypt hash, and creation timestamp.
- `TaskItem` belongs to one employee and has a due date, category, and enum status.
- Flyway creates the tables and indexes. JPA repositories feed service-layer rules; controllers accept validated request records and return response records that do not expose password hashes.
- The dashboard fetches employees and task data from the API. Metrics, status distribution, directory counts, search, and filters derive from those responses.
- Employees can change their password while authenticated; the client signs out after a successful change and asks them to sign in again.

## Frontend boundaries

- `AuthProvider` owns sign-in, session restoration, and sign-out.
- `utils/api.js` centralizes fetch headers, JSON parsing, HTTP errors, and token handling.
- `Workspace.jsx` composes team/task surfaces and handles API-backed mutations, loading/error/empty states, theme, and user feedback.
- CSS variables implement the light/dark themes; Framer Motion handles page/card transitions and scroll progress with reduced-motion support.

## Evidence

- `src/App.jsx`
- `src/context/AuthProvider.jsx`
- `src/context/authContext.js`
- `src/utils/api.js`
- `src/components/Dashboard/Workspace.jsx`
- `backend/src/main/java/com/ems/auth/`
- `backend/src/main/java/com/ems/config/SecurityConfig.java`
- `backend/src/main/java/com/ems/employee/`
- `backend/src/main/java/com/ems/task/`
- `backend/src/main/resources/db/migration/V1__create_users_and_tasks.sql`
