# Create User in Keycloak

## Method 1: Via Keycloak Admin UI (Easiest)

1. **Go to Keycloak Admin Console:**
   - URL: http://localhost:8080
   - Login: `admin` / `admin`

2. **Switch to Ecommerce Realm:**
   - Click the realm dropdown (top-left, shows "master")
   - Select **"Ecommerce"**

3. **Create a New User:**
   - Click **"Users"** in the left menu
   - Click **"Create new user"** button
   - Fill in:
     - **Username:** `mahjoubi.firas@esprit.tn`
     - **Email:** `mahjoubi.firas@esprit.tn`
     - **Email verified:** ✅ ON
     - **First name:** `Firas`
     - **Last name:** `Mahjoubi`
     - **Enabled:** ✅ ON
   - Click **"Create"**

4. **Set Password:**
   - After creating user, go to **"Credentials"** tab
   - Click **"Set password"**
   - Enter password (e.g., `password123`)
   - Turn OFF **"Temporary"** (so user doesn't need to change it)
   - Click **"Save"**
   - Confirm by clicking **"Save password"**

5. **Assign Roles (Optional):**
   - Go to **"Role mapping"** tab
   - Click **"Assign role"**
   - Select roles like `admin`, `user`, `seller`, etc.
   - Click **"Assign"**

✅ **Done!** Now you can login with:
- Username: `mahjoubi.firas@esprit.tn`
- Password: `password123` (or whatever you set)

---

## Method 2: Via REST API

```powershell
# Get admin token
$body = @{
    client_id = "admin-cli"
    username = "admin"
    password = "admin"
    grant_type = "password"
} | ConvertTo-Json

$token = (Invoke-RestMethod -Uri "http://localhost:8080/realms/master/protocol/openid-connect/token" -Method POST -Body $body -ContentType "application/json").access_token

# Create user
$newUser = @{
    username = "mahjoubi.firas@esprit.tn"
    email = "mahjoubi.firas@esprit.tn"
    firstName = "Firas"
    lastName = "Mahjoubi"
    enabled = $true
    emailVerified = $true
    credentials = @(
        @{
            type = "password"
            value = "password123"
            temporary = $false
        }
    )
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/Ecommerce/users" -Method POST -Headers $headers -Body $newUser
```

---

## Method 3: Register Through Your App

Since registration is also failing, this won't work until we fix the Keycloak admin credentials issue in the user-service.

Let me check the user-service configuration...
