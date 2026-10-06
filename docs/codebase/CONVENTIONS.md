# Conventions

## JavaScript and React

- Frontend source uses JavaScript and `.jsx`; no TypeScript compiler is configured.
- Components are function components with PascalCase names; local state and callbacks use camelCase.
- Component modules are grouped under `src/components/Auth` and `src/components/Dashboard`.
- PropTypes describes runtime component props because the ESLint React configuration enforces prop validation.
- The API client and auth context hook live outside component-only modules.

## Styling and motion

- `src/index.css` owns shared colors, typography, components, dark theme variables, breakpoints, and reduced-motion overrides.
- UI uses custom semantic class names rather than Tailwind utility classes.
- Motion is limited primarily to opacity/transform/layout; the `prefers-reduced-motion` preference is respected.
- Icons use Lucide React.

## Java

- Backend packages group code by domain: `auth`, `config`, `employee`, `shared`, and `task`.
- Persistence entities, Spring Data repositories, services, request/response records, and REST controllers are separate files.
- Jakarta validation annotations guard request records; exceptions are mapped centrally in `ApiExceptionHandler`.
- Roles and task states use enums and persist as string values.

## Errors and data

- Frontend HTTP errors use `ApiError`; UI presents retry, form, or toast feedback rather than relying on blocking alerts.
- API responses use dedicated records; entities and password hashes are not serialized as endpoint responses.
- Environment-backed application settings and Flyway SQL are kept under backend resources.

## Evidence

- `.eslintrc.cjs`
- `src/components/Dashboard/Workspace.jsx`
- `src/context/authContext.js`
- `src/utils/api.js`
- `src/index.css`
- `backend/src/main/java/com/ems/employee/`
- `backend/src/main/java/com/ems/task/`
- `backend/src/main/java/com/ems/shared/ApiExceptionHandler.java`
- `backend/src/main/resources/application.yml`
