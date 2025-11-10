# Get Keycloak Client Secret

## Steps to Get the Client Secret:

### Option 1: Via Keycloak Admin UI (Easiest)

1. **Go to Keycloak Admin Console:**
   - URL: http://localhost:8080
   - Login: `admin` / `admin`

2. **Switch to Ecommerce Realm:**
   - Click the realm dropdown (top-left)
   - Select **"Ecommerce"**

3. **Get the Client Secret:**
   - Click **"Clients"** in the left menu
   - Click on **"ecommerce-user-service"** client
   - Go to **"Credentials"** tab
   - You'll see **"Client Secret"**
   - Click the 👁️ (eye icon) to reveal it
   - **Copy the secret**

4. **Update docker-compose.yml:**
   Replace this line:
   ```yaml
   - KEYCLOAK_CLIENT_SECRET=**********
   ```
   With:
   ```yaml
   - KEYCLOAK_CLIENT_SECRET=<the-secret-you-copied>
   ```

5. **Restart user-service:**
   ```powershell
   docker compose restart user-service
   ```

---

### Option 2: Regenerate the Secret

If you want to create a new secret:

1. Go to **Clients** → **ecommerce-user-service** → **Credentials** tab
2. Click **"Regenerate"** next to the Client Secret
3. Copy the new secret
4. Update docker-compose.yml
5. Restart user-service

---

### Option 3: Use PowerShell to Get Secret via API

```powershell
# Get admin token
$adminBody = "username=admin&password=admin&grant_type=password&client_id=admin-cli"
$adminToken = (Invoke-RestMethod -Uri "http://localhost:8080/realms/master/protocol/openid-connect/token" -Method POST -Body $adminBody -ContentType "application/x-www-form-urlencoded").access_token

# Get client secret
$headers = @{ Authorization = "Bearer $adminToken" }
$clients = Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/Ecommerce/clients" -Headers $headers
$userServiceClient = $clients | Where-Object { $_.clientId -eq "ecommerce-user-service" }
$clientId = $userServiceClient.id

$secret = Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/Ecommerce/clients/$clientId/client-secret" -Headers $headers
Write-Host "Client Secret: $($secret.value)"
```

---

## After Getting the Secret:

1. Update the secret in `docker-compose.yml`
2. Restart: `docker compose restart user-service`
3. Try logging in again!

Your login should work after this! ✅
