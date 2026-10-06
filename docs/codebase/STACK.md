# Stack

## Frontend

- JavaScript and JSX; React 18.2.
- Vite 8 for local development and production builds; `@vitejs/plugin-react` 6.
- Framer Motion for restrained transitions and scroll progress; Lucide React for interface icons.
- Handwritten CSS with CSS custom properties for light/dark themes. Tailwind was removed because the rebuilt interface does not use utility classes.
- React Context for authentication state; browser `localStorage` stores the access token and theme preference.

### Frontend dependencies

**Runtime:** `framer-motion` `^14.0.0`, `lucide-react` `^1.52.0`, `prop-types` `^15.8.1`, `react` `^18.2.0`, `react-dom` `^18.2.0`.

**Development:** `@types/react` `^18.2.66`, `@types/react-dom` `^18.2.22`, `@vitejs/plugin-react` `^6.1.2`, `eslint` `^8.57.0`, `eslint-plugin-react` `^7.34.1`, `eslint-plugin-react-hooks` `^4.6.0`, `eslint-plugin-react-refresh` `^0.4.6`, and `vite` `^8.3.3`.

## Backend

- Java 17+ and Spring Boot 3.5.7.
- Spring Web, Spring Security, Spring Data JPA, and Jakarta Bean Validation.
- MySQL 8.4 for application persistence; Flyway manages schema migrations.
- JJWT 0.12.6 for signed access tokens; BCrypt (strength 12) for password hashes.

### Backend dependencies

Spring-managed dependencies: Spring Boot Web, Security, Data JPA, Validation, MySQL Connector/J, Flyway Core, Flyway MySQL, Spring Boot Test, and Spring Security Test. Explicitly versioned JJWT dependencies: `jjwt-api`, `jjwt-impl`, and `jjwt-jackson` `0.12.6`. H2 is test-scoped.

## Development and test tools

- Maven manages the backend build.
- ESLint with React and React Hooks plugins checks the frontend.
- JUnit, Spring Boot Test, Spring Security Test, MockMvc, and test-scoped H2 support backend tests.
- `npm run lint`, `npm run build`, and `mvn test` are the main checks.

## Evidence

- `package.json`
- `backend/pom.xml`
- `backend/src/main/resources/application.yml`
- `backend/src/main/java/com/ems/config/SecurityConfig.java`
- `backend/src/main/java/com/ems/auth/JwtService.java`
- `backend/src/main/resources/db/migration/V1__create_users_and_tasks.sql`
- `README.md`
