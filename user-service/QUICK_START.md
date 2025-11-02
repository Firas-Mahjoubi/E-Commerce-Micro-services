# Quick Start Guide - User Service

## 🚀 Get Started in 5 Minutes

### Step 1: Complete Keycloak Setup (10 minutes)

📖 **Follow the detailed guide**: [KEYCLOAK_SETUP_GUIDE.md](../KEYCLOAK_SETUP_GUIDE.md)

**Quick checklist**:
- [ ] Keycloak running on `http://localhost:8080`
- [ ] Realm `Ecommerce` created
- [ ] Roles created: `customer`, `admin`, `seller`, `support`
- [ ] Client `ecommerce-user-service` created (confidential)
- [ ] Client secret copied
- [ ] Test users created

### Step 2: Install Dependencies

```bash
cd user-service
npm install
```

### Step 3: Configure Environment

1. Open `.env` file
2. Update `KEYCLOAK_CLIENT_SECRET` with the secret from Keycloak:
   - Go to Keycloak Admin Console
   - Navigate to: **Clients** → **ecommerce-user-service** → **Credentials** tab
   - Copy the **Client secret**
   - Paste it in `.env` file

```env
KEYCLOAK_CLIENT_SECRET=<paste-your-secret-here>
```

3. Verify other settings match your setup:
```env
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=Ecommerce
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

DB_HOST=localhost
DB_PORT=5432
DB_NAME=keycloak
DB_USER=keycloak
DB_PASSWORD=password
```

### Step 4: Start the Service

```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully
✅ Database models synchronized
✅ Keycloak middleware initialized
🚀 User Service is running on port 3000
```

### Step 5: Test the API

#### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "user-service",
  "database": "connected"
}
```

#### Test 2: Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890"
  }'
```

#### Test 3: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

Save the `access_token` from the response.

#### Test 4: Get Current User (Protected Route)
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <your_access_token>"
```

### Step 6: Import Postman Collection

1. Open Postman
2. Click **Import**
3. Select `User-Service-Postman-Collection.json`
4. The collection includes:
   - Health check
   - Register, Login, Refresh Token, Logout
   - User management endpoints
   - Profile management
   - Address management

### 🎉 You're Ready!

The User Service is now running and integrated with Keycloak.

## Next Steps

1. **Test all endpoints** using the Postman collection
2. **Create test users** with different roles (customer, admin, seller)
3. **Integrate with other services**:
   - Add to API Gateway routes
   - Connect Order Service to validate users
   - Connect Product Service for user preferences

## Common Issues

### Issue: "Failed to authenticate with Keycloak"
**Solution**: 
- Verify `KEYCLOAK_ADMIN_USERNAME` and `KEYCLOAK_ADMIN_PASSWORD` are correct
- Check Keycloak is accessible at `http://localhost:8080`

### Issue: "Database connection failed"
**Solution**:
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database `keycloak` exists

### Issue: "Client secret invalid"
**Solution**:
- Get fresh client secret from Keycloak Admin Console
- Update `.env` file
- Restart the service

### Issue: Port 3000 already in use
**Solution**:
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change port in .env
PORT=3001
```

## Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│ User Service │─────▶│  Keycloak   │
│ (Frontend)  │      │  (Node.js)   │      │  (Auth)     │
└─────────────┘      └──────────────┘      └─────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │  PostgreSQL  │
                     │  (Database)  │
                     └──────────────┘
```

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/refresh` | No | Refresh token |
| POST | `/api/auth/logout` | No | Logout user |
| GET | `/api/users/me` | Yes | Get current user |
| PUT | `/api/users/me` | Yes | Update current user |
| DELETE | `/api/users/me` | Yes | Delete current user |
| GET | `/api/users` | Admin | Get all users |
| GET | `/api/profile` | Yes | Get user profile |
| PUT | `/api/profile` | Yes | Update profile |
| GET | `/api/profile/addresses` | Yes | Get addresses |
| POST | `/api/profile/addresses` | Yes | Create address |

## Useful Commands

```bash
# Start in development mode
npm run dev

# Start in production mode
npm start

# Run with Docker
docker build -t user-service .
docker run -p 3000:3000 --env-file .env user-service

# Check logs
tail -f logs/combined.log

# Test database connection
psql -h localhost -U keycloak -d keycloak
```

## Resources

- [Full Documentation](README.md)
- [Keycloak Setup Guide](../KEYCLOAK_SETUP_GUIDE.md)
- [API Documentation](README.md#api-endpoints)
- [Keycloak Documentation](https://www.keycloak.org/documentation)

## Support

Need help? Check:
1. [Troubleshooting section](README.md#troubleshooting)
2. Service logs in `logs/` directory
3. Keycloak admin console for auth issues

---

**Happy coding! 🎉**
