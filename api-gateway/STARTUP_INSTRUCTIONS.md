# API Gateway Startup Instructions

## Quick Start (Testing Mode - No Dependencies)

The API Gateway is currently configured to run **standalone** without requiring Eureka or Keycloak.

### Start the Gateway:
1. Stop any running instance in IntelliJ
2. Run the `ApiGatewayApplication` main class
3. Gateway will start on port **8090**

---

## Production Mode (With All Services)

### Prerequisites Order:

1. **Start Postgres** (for Keycloak):
   ```powershell
   docker-compose up -d postgres
   ```

2. **Start Keycloak**:
   ```powershell
   docker-compose up -d keycloak
   ```
   Wait ~30 seconds for Keycloak to fully start.

3. **Start Config Server** (optional):
   - In IntelliJ: Run `ConfigServerApplication`
   - OR via Docker: `docker-compose up -d configserver`

4. **Start Eureka Server**:
   - In IntelliJ: Run `EurekaServerApplication`
   - OR via Docker: `docker-compose up -d eureka-server`
   Wait until you see "Eureka Server started" message.

5. **Re-enable Production Configuration**:
   
   **In `application.properties`**, change:
   ```properties
   # Enable Eureka
   eureka.client.enabled=true
   eureka.client.register-with-eureka=true
   eureka.client.fetch-registry=true
   
   # Enable OAuth2
   spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/Ecommerce
   ```
   
   **In `SecurityConfig.java`**, uncomment:
   ```java
   .oauth2ResourceServer(spec -> spec.jwt(Customizer.withDefaults()));
   ```
   
   And restore the proper path matchers.

6. **Start API Gateway**:
   - In IntelliJ: Run `ApiGatewayApplication`
   - Gateway will start on port **8090**

---

## Verify Services:

- **Eureka Dashboard**: http://localhost:8761
- **Keycloak Admin**: http://localhost:8080 (admin/admin)
- **API Gateway**: http://localhost:8090
- **Zipkin**: http://localhost:9411

---

## Troubleshooting:

### "Application is stuck on startup"
- **Cause**: Debugger is in suspend mode or waiting for services
- **Fix**: 
  - Press **F9** or click Resume (▶️) in Debug panel
  - Ensure required services are running first

### "Cannot connect to Eureka"
- **Cause**: Eureka Server not running
- **Fix**: Start Eureka first, then API Gateway

### "JWT validation error"
- **Cause**: Keycloak not running or realm not configured
- **Fix**: Start Keycloak and import realm-export.json

---

## Current Configuration Status:

✅ **Testing Mode Active**
- Eureka: Disabled
- OAuth2: Disabled
- Security: Permit all

⚠️ **Before deploying to production**: Re-enable security settings!
