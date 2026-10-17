# ---------- Stage 1: Build ----------
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy Maven wrapper + pom first for layer caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (cached unless pom.xml changes)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build
COPY src src
RUN ./mvnw clean package -DskipTests -B

# ---------- Stage 2: Runtime ----------
FROM eclipse-temurin:25-jre
WORKDIR /app

# Copy the built jar
COPY --from=build /app/target/inventory-0.0.1-SNAPSHOT.jar app.jar

# Expose default port (Render overrides via PORT env var)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]