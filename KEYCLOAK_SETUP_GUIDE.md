# Keycloak Setup Guide for E-Commerce Microservices

## Overview
This guide will help you configure Keycloak for the E-Commerce application with proper roles, clients, and user management.

## Prerequisites
- Keycloak running on `http://localhost:8080`
- PostgreSQL database configured with:
  - Database: `keycloak`
  - Username: `keycloak`
  - Password: `password`
- Realm: `Ecommerce` (already created)

---

## Step 1: Access Keycloak Admin Console

1. Open browser: `http://localhost:8080`
2. Login with admin credentials
3. Select the **Ecommerce** realm from the dropdown (top-left corner)

---

## Step 2: Create Realm Roles

Roles define what users can do in your application.

### 2.1 Navigate to Roles
1. Click **Realm roles** in the left menu
2. Click **Create role** button

### 2.2 Create the Following Roles:

#### Role 1: `customer`
- **Role name**: `customer`
- **Description**: `Regular customer with access to shopping features`
- Click **Save**

#### Role 2: `admin`
- **Role name**: `admin`
- **Description**: `Administrator with full system access`
- Click **Save**

#### Role 3: `seller`
- **Role name**: `seller`
- **Description**: `Seller who can manage products and view orders`
- Click **Save**

#### Role 4: `support`
- **Role name**: `support`
- **Description**: `Customer support with limited administrative access`
- Click **Save**

---

## Step 3: Create Client for User Service

Clients represent applications that can request authentication.

### 3.1 Navigate to Clients
1. Click **Clients** in the left menu
2. Click **Create client** button

### 3.2 General Settings
- **Client type**: `OpenID Connect`
- **Client ID**: `ecommerce-user-service`
- Click **Next**

### 3.3 Capability Config
- **Client authentication**: `ON` (Enable for server-side applications)
- **Authorization**: `OFF`
- **Authentication flow**:
  - ✅ Standard flow
  - ✅ Direct access grants
  - ✅ Service accounts roles
- Click **Next**

### 3.4 Login Settings
- **Root URL**: `http://localhost:3000`
- **Home URL**: `http://localhost:3000`
- **Valid redirect URIs**: 
  - `http://localhost:3000/*`
  - `http://localhost:8090/*` (for API Gateway)
- **Valid post logout redirect URIs**: `http://localhost:3000/*`
- **Web origins**: `*` (or `http://localhost:3000` for production)
- Click **Save**

### 3.5 Get Client Secret
1. After saving, go to **Credentials** tab
2. Copy the **Client secret** (you'll need this for the Node.js service)

---

## Step 4: Create Client for Frontend Application

### 4.1 Create Public Client
1. Click **Clients** → **Create client**
2. **Client ID**: `ecommerce-frontend`
3. **Client type**: `OpenID Connect`
4. Click **Next**

### 4.2 Capability Config
- **Client authentication**: `OFF` (Public client for frontend)
- **Authorization**: `OFF`
- **Authentication flow**:
  - ✅ Standard flow
  - ✅ Implicit flow (if needed for SPA)
- Click **Next**

### 4.3 Login Settings
- **Root URL**: `http://localhost:4200`
- **Valid redirect URIs**: `http://localhost:4200/*`
- **Valid post logout redirect URIs**: `http://localhost:4200/*`
- **Web origins**: `*`
- Click **Save**

---

## Step 5: Create Client Scopes (Optional but Recommended)

### 5.1 Create Profile Scope
1. Click **Client scopes** in the left menu
2. Click **Create client scope**
3. **Name**: `ecommerce-profile`
4. **Type**: `Optional`
5. **Protocol**: `OpenID Connect`
6. Click **Save**

### 5.2 Add Mappers
1. Go to **Mappers** tab
2. Click **Add mapper** → **By configuration**
3. Select **User Attribute**

#### Mapper 1: User ID
- **Name**: `user-id`
- **User Attribute**: `id`
- **Token Claim Name**: `user_id`
- **Claim JSON Type**: `String`
- **Add to ID token**: `ON`
- **Add to access token**: `ON`
- **Add to userinfo**: `ON`

#### Mapper 2: Email
- **Name**: `email`
- **User Attribute**: `email`
- **Token Claim Name**: `email`
- **Claim JSON Type**: `String`
- **Add to ID token**: `ON`
- **Add to access token**: `ON`
- **Add to userinfo**: `ON`

---

## Step 6: Configure Default Roles

### 6.1 Set Default Role for New Users
1. Click **Realm settings** → **User registration** tab
2. In **Default roles** section:
   - Add `customer` role
3. Click **Save**

This ensures all new registered users automatically get the `customer` role.

---

## Step 7: Create Test Users

### 7.1 Create Admin User
1. Click **Users** in the left menu
2. Click **Add user**
3. Fill in:
   - **Username**: `admin@ecommerce.com`
   - **Email**: `admin@ecommerce.com`
   - **First name**: `Admin`
   - **Last name**: `User`
   - **Email verified**: `ON`
   - **Enabled**: `ON`
4. Click **Create**

#### Set Password
1. Go to **Credentials** tab
2. Click **Set password**
3. **Password**: `admin123`
4. **Temporary**: `OFF`
5. Click **Save**

#### Assign Roles
1. Go to **Role mapping** tab
2. Click **Assign role**
3. Select `admin` role
4. Click **Assign**

### 7.2 Create Customer User
Repeat the same process with:
- **Username**: `customer@ecommerce.com`
- **Password**: `customer123`
- **Role**: `customer`

### 7.3 Create Seller User
- **Username**: `seller@ecommerce.com`
- **Password**: `seller123`
- **Role**: `seller`

---

## Step 8: Configure Token Settings

### 8.1 Realm Token Settings
1. Click **Realm settings** → **Tokens** tab
2. Configure:
   - **Access Token Lifespan**: `15 minutes` (default: 5 minutes)
   - **Refresh Token Lifespan**: `30 minutes`
   - **SSO Session Idle**: `30 minutes`
   - **SSO Session Max**: `10 hours`
3. Click **Save**

---

## Step 9: Enable User Registration (Optional)

1. Click **Realm settings** → **Login** tab
2. Enable:
   - ✅ **User registration**
   - ✅ **Forgot password**
   - ✅ **Remember me**
   - ✅ **Email as username** (if you want to use email for login)
3. Click **Save**

---

## Step 10: Configure SMTP for Email Verification (Optional)

### 10.1 Email Settings
1. Click **Realm settings** → **Email** tab
2. Configure SMTP settings:
   - **Host**: `smtp.gmail.com` (for Gmail)
   - **Port**: `587`
   - **From**: `noreply@ecommerce.com`
   - **Enable SSL**: `OFF`
   - **Enable StartTLS**: `ON`
   - **Username**: `your-email@gmail.com`
   - **Password**: `your-app-password`
3. Click **Save**

### 10.2 Test Email
1. Go to **Users** → Select a user
2. Click **Send email verification**

---

## Step 11: Export Realm Configuration (Backup)

1. Click **Realm settings**
2. Go to **Action** dropdown (top-right)
3. Click **Partial export**
4. Select:
   - ✅ Export clients
   - ✅ Export groups and roles
   - ✅ Export realm roles
5. Click **Export**

Save this file as backup: `Ecommerce-realm-export.json`

---

## Important Information to Note

After completing the setup, you'll need these values for the Node.js service:

```env
# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=Ecommerce
KEYCLOAK_CLIENT_ID=ecommerce-user-service
KEYCLOAK_CLIENT_SECRET=<your-client-secret-from-step-3.5>

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=keycloak
DB_USER=keycloak
DB_PASSWORD=password
```

---

## Roles Summary

| Role | Description | Permissions |
|------|-------------|-------------|
| `customer` | Default role for shoppers | View products, place orders, manage own profile |
| `admin` | System administrator | Full access to all resources |
| `seller` | Product seller | Manage products, view orders |
| `support` | Customer support | View orders, manage customer issues |

---

## Next Steps

1. ✅ Complete all Keycloak configuration steps above
2. 🔄 Note down the Client Secret from Step 3.5
3. 🚀 Proceed to create the Node.js User Service
4. 🔗 Integrate the service with Keycloak using the configuration

---

## Useful Keycloak Admin URLs

- **Admin Console**: http://localhost:8080/admin
- **Realm URL**: http://localhost:8080/realms/Ecommerce
- **OpenID Configuration**: http://localhost:8080/realms/Ecommerce/.well-known/openid-configuration
- **Token Endpoint**: http://localhost:8080/realms/Ecommerce/protocol/openid-connect/token
- **User Info Endpoint**: http://localhost:8080/realms/Ecommerce/protocol/openid-connect/userinfo

---

## Testing Authentication

You can test the configuration using curl:

```bash
# Get Access Token
curl -X POST http://localhost:8080/realms/Ecommerce/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=ecommerce-user-service" \
  -d "client_secret=<your-client-secret>" \
  -d "grant_type=password" \
  -d "username=admin@ecommerce.com" \
  -d "password=admin123"
```

---

## Troubleshooting

### Issue: Can't access Admin Console
- **Solution**: Check if Keycloak is running: `docker ps`
- Restart: `docker-compose restart keycloak`

### Issue: Invalid redirect URI
- **Solution**: Make sure redirect URIs in client settings match your application URLs

### Issue: Token expired
- **Solution**: Adjust token lifespan in Realm settings → Tokens

### Issue: Email not sending
- **Solution**: Verify SMTP settings and use app-specific password for Gmail

---

**Created**: November 2, 2025  
**Last Updated**: November 2, 2025  
**Version**: 1.0
