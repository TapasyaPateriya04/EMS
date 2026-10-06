# Testing

## Frontend checks

- `npm run lint` runs ESLint with the repository's React and React Hooks rules; warnings fail the command.
- `npm run build` runs the Vite production build.
- No frontend component test framework or test files are configured.

## Backend tests

- `JwtServiceTest` checks JWT subject handling and minimum signing-key length.
- `WorkspaceAuthorizationTest` uses Spring Boot Test, MockMvc, and H2 to verify admin employee provisioning, employee directory denial, task ownership isolation, allowed status transitions, and password-change token invalidation.
- Run from `backend/` with `mvn test`; the tests do not require MySQL or Docker.

## Manual browser/API verification

- Run MySQL (or use a configured database), Spring Boot, and Vite.
- Sign in as the bootstrap admin; provision an employee; assign a task; verify the employee can see and transition only their own task.
- Verify theme persistence, keyboard search shortcut, mobile directory cards, loading/error/empty states, and reduced-motion behavior.

## Latest observed results

- `npm run lint` — passed.
- `npm run build` — passed with Vite 8.
- `npm audit` — zero advisories.
- `mvn -f backend/pom.xml test` — 7 tests passed, 0 failures, 0 errors; Flyway migration and Hibernate schema validation passed against H2.
- Browser/API smoke test against the H2 profile — administrator sign-in, employee provisioning, task assignment, employee sign-in, status transitions, dark-theme persistence, mobile directory cards, and the account confirmation dialog were exercised successfully.
- Production MySQL integration has not been run in this environment.

## Evidence

- `package.json`
- `.eslintrc.cjs`
- `backend/pom.xml`
- `backend/src/test/java/com/ems/auth/JwtServiceTest.java`
- `backend/src/test/java/com/ems/WorkspaceAuthorizationTest.java`
- `backend/src/main/resources/application.yml`
