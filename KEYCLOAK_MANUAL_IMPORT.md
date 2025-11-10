# 🔧 Keycloak Realm Manual Import Guide

## ⚠️ Why Manual Import?

Your `realm-export.json` contains **JavaScript authenticators** that cannot be auto-imported due to Keycloak security restrictions. You need to import it manually through the admin console.

---

## 📋 Manual Import Steps

### Step 1: Access Keycloak Admin Console
1. Open: **http://localhost:8080**
2. Click **"Administration Console"**
3. Login:
   - Username: `admin`
   - Password: `admin`

### Step 2: Import the Realm
1. In the left sidebar, hover over the **realm dropdown** (shows "master")
2. Click **"Create Realm"** button
3. Click **"Browse"** button
4. Select: `c:\project Ecommerce\realm-export.json`
5. **IMPORTANT:** Check ✅ **"Skip if exists"** option
6. Click **"Create"**

### Step 3: Verify Import
1. Check the realm dropdown - you should see **"Ecommerce"**
2. Switch to **Ecommerce** realm
3. Go to **"Clients"** - verify your clients are there
4. Go to **"Users"** - verify users are imported
5. Go to **"Realm roles"** - verify roles exist

---

## 🎯 Alternative: Import via Keycloak CLI (Inside Container)

If the UI import fails, you can use the CLI:

```powershell
# Copy realm file into container
docker cp realm-export.json keycloak:/tmp/realm-export.json

# Execute import command
docker exec -it keycloak /opt/keycloak/bin/kc.sh import --file /tmp/realm-export.json
```

---

## 🐛 Troubleshooting

### If Import Fails with "Script Upload Disabled"

Your realm has JavaScript authenticators. You have 2 options:

#### Option 1: Remove Scripts from Realm (Recommended)
1. Open `realm-export.json` in a text editor
2. Search for `"authenticatorConfig"` sections
3. Remove or comment out any entries with JavaScript code
4. Save and try importing again

#### Option 2: Enable Script Upload (Not Recommended for Production)
If you REALLY need the JavaScript authenticators:

1. Edit `docker-compose.yml`:
```yaml
keycloak:
  command:
    - start-dev
    - --features=preview
    - --spi-script-upload-enabled=true
```

2. Restart Keycloak:
```powershell
docker compose restart keycloak
```

---

## ✅ After Successful Import

### Update Service Configurations

Your services need to know about the Ecommerce realm:

**User Service** (already configured):
- Realm: `Ecommerce`
- Client: `user-service`

**Product Service** (`config-server/src/main/resources/config/product-service.properties`):
```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://keycloak:8080/realms/Ecommerce
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://keycloak:8080/realms/Ecommerce/protocol/openid-connect/certs
```

**API Gateway** (`config-server/src/main/resources/config/api-gateway.properties`):
```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://keycloak:8080/realms/Ecommerce
```

---

## 🧪 Test the Configuration

### 1. Get a Token
```powershell
$body = @{
    client_id = "your-client-id"
    username = "testuser"
    password = "password"
    grant_type = "password"
}

$response = Invoke-RestMethod -Uri "http://localhost:8080/realms/Ecommerce/protocol/openid-connect/token" -Method POST -Body $body
$token = $response.access_token
echo $token
```

### 2. Use Token to Call APIs
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

# Test product service
Invoke-RestMethod -Uri "http://localhost:8090/api/products" -Headers $headers
```

---

## 📝 Quick Reference

| Item | Value |
|------|-------|
| **Keycloak Admin** | http://localhost:8080 |
| **Username** | admin |
| **Password** | admin |
| **Realm File** | `c:\project Ecommerce\realm-export.json` |
| **Realm Name** | Ecommerce |
| **Token Endpoint** | http://localhost:8080/realms/Ecommerce/protocol/openid-connect/token |

---

## 🔄 If You Need to Re-Import

1. Delete the Ecommerce realm in Keycloak UI
2. Or run: `docker compose down -v` (removes all data)
3. Then follow import steps again

---

**Status:** Keycloak is running and ready for manual realm import! 🚀

Access: http://localhost:8080  
Login: admin/admin
