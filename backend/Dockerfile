FROM maven:3.9.11-eclipse-temurin-17-alpine AS build

WORKDIR /workspace
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn -B verify

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
COPY --from=build /workspace/target/ems-api-1.0.0.jar /app/ems-api.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/ems-api.jar"]
