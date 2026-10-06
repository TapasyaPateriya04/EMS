# Structure

## Repository layout

```text
.
├── backend/
│   ├── src/main/java/com/ems/
│   │   ├── auth/             Login, JWT issue/validation, auth controller
│   │   ├── config/           Security, CORS, optional bootstrap admin
│   │   ├── employee/         Employee entity, repository, service, API DTOs
│   │   ├── shared/            API errors and shared exceptions
│   │   └── task/              Task entity, repository, service, API DTOs
│   ├── src/main/resources/   Application profiles and Flyway migrations
│   ├── src/test/java/        JWT and API authorization tests
│   └── pom.xml
├── src/
│   ├── components/Auth/      Sign-in screen
│   ├── components/Dashboard/ Role-specific dashboard wrappers and workspace
│   ├── context/              Authentication provider and context hook
│   ├── utils/                API client and access-token storage
│   ├── App.jsx               Session-aware route selection
│   ├── index.css             Product styles, themes, responsive breakpoints
│   └── main.jsx              React entry point
├── public/                   EMS favicon
├── docs/codebase/            Seven codebase knowledge documents
├── docker-compose.yml        Optional local MySQL service
└── package.json              Frontend commands and dependencies
```

## Entry points

- `index.html` loads `src/main.jsx`.
- `main.jsx` wraps the React app with `AuthProvider`.
- `App.jsx` restores and checks the persisted token, then selects login, admin, or employee UI.
- `backend/src/main/java/com/ems/EmsApplication.java` is the Spring Boot entry point.
- `backend/src/main/resources/db/migration/` contains SQL applied by Flyway on startup.

## Evidence

- `index.html`
- `src/main.jsx`
- `src/App.jsx`
- `src/context/AuthProvider.jsx`
- `src/components/Dashboard/Workspace.jsx`
- `backend/src/main/java/com/ems/EmsApplication.java`
- `backend/src/main/java/com/ems/`
- `backend/src/main/resources/db/migration/V1__create_users_and_tasks.sql`
- `docker-compose.yml`
- `package.json`
