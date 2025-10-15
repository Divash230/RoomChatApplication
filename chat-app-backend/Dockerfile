# Use official Maven image to build the app
FROM maven:3.9.4-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom and source code
COPY pom.xml .
COPY src ./src

# Build the application and skip tests (optional)
RUN mvn clean package -DskipTests

# Use a lightweight OpenJDK runtime image to run the app
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built jar from the previous stage
COPY --from=build /app/target/chat-app-backend-0.0.1-SNAPSHOT.jar ./app.jar

# Expose port 8080
EXPOSE 8080

# Command to run the jar, using the PORT env variable Render sets
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
