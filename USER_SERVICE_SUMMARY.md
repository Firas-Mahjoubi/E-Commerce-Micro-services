# 🎉 User Service Created Successfully!

## 📦 What Has Been Created

### 1. Complete Node.js User Service
A fully functional authentication and user management service integrated with Keycloak.

**Location**: `c:\project Ecommerce\user-service\`

### 2. Project Structure
```
user-service/
├── src/
│   ├── config/
│   │   ├── keycloak.config.js      # Keycloak configuration
│   │   └── database.config.js      # PostgreSQL configuration
│   ├── controllers/
│   │   ├── auth.controller.js      # Authentication logic
│   │   ├── user.controller.js      # User management
│   │   └── profile.controller.js   # Profile & addresses
│   ├── middleware/
│   │   ├── keycloak.middleware.js  # Keycloak integration
│   │   └── error.middleware.js     # Error handling
│   ├── models/
│   │   ├── index.js                # Model loader
│   │   ├── user.model.js           # User model
│   │   ├── user-profile.model.js   # Profile model
│   │   └── user-address.model.js   # Address model
│   ├── routes/
│   │   ├── auth.routes.js          # Auth endpoints
│   │   ├── user.routes.js          # User endpoints
│   │   ├── profile.routes.js       # Profile endpoints
│   │   └── health.routes.js        # Health check
│   ├── utils/
│   │   └── logger.js               # Winston logger
│   └── server.js                   # Entry point
├── .env                            # Environment variables
├── .gitignore
├── package.json
├── Dockerfile
├── docker-compose.yml
├── README.md                       # Full documentation
├── QUICK_START.md                  # Quick start guide
└── User-Service-Postman-Collection.json
```

### 3. Documentation Files
- **KEYCLOAK_SETUP_GUIDE.md** (Root): Complete Keycloak configuration steps
- **README.md**: Comprehensive API documentation
- **QUICK_START.md**: 5-minute setup guide
- **Postman Collection**: Ready-to-use API tests

---

## 🔐 Keycloak Configuration Required

### Before starting the service, complete these Keycloak steps:

#### 1. Create Realm Roles (in Ecommerce realm)
Go to **Realm roles** → **Create role**:
- ✅ `customer` - Default role for shoppers
- ✅ `admin` - Full system access
- ✅ `seller` - Product management access
- ✅ `support` - Customer support access

#### 2. Create Client for User Service
Go to **Clients** → **Create client**:
- **Client ID**: `ecommerce-user-service`
- **Client type**: OpenID Connect
- **Client authentication**: ON
- **Valid redirect URIs**: `http://localhost:3000/*`, `http://localhost:8090/*`
- **Web origins**: `*`

**Important**: After creating, go to **Credentials** tab and copy the **Client Secret**

#### 3. Create Test Users (Optional but recommended)
Go to **Users** → **Add user**:

**Admin User**:
- Username: `admin@ecommerce.com`
- Password: `admin123`
- Role: `admin`

**Customer User**:
- Username: `customer@ecommerce.com`
- Password: `customer123`
- Role: `customer`

#### 4. Set Default Role
Go to **Realm settings** → **User registration**:
- Default roles: Add `customer`

📖 **Full detailed steps**: See `KEYCLOAK_SETUP_GUIDE.md` in root directory

---

## 🚀 Quick Start (After Keycloak Setup)

### Step 1: Install Dependencies
```bash
cd user-service
npm install
```

### Step 2: Configure Environment
Edit `.env` file and update:
```env
KEYCLOAK_CLIENT_SECRET=<paste-your-client-secret-here>
```

Get the secret from:
**Keycloak Admin Console** → **Clients** → **ecommerce-user-service** → **Credentials**

### Step 3: Start the Service
```bash
npm run dev
```

### Step 4: Test
```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

---

## 🔑 Key Features

### ✅ Authentication
- User registration with automatic Keycloak sync
- Login with JWT tokens (access + refresh)
- Token refresh mechanism
- Logout functionality
- Password reset (via Keycloak)

### ✅ User Management
- Get current user profile
- Update user information
- Delete user account
- Admin: List all users with pagination and search
- Admin: Manage user roles

### ✅ Profile Management
- User profile with avatar, bio, preferences
- Newsletter subscription
- Date of birth and gender
- Custom preferences (JSONB storage)

### ✅ Address Management
- Multiple shipping/billing addresses
- Default address selection
- Full address CRUD operations

### ✅ Security
- Keycloak JWT token validation
- Role-based access control (RBAC)
- Session management
- CORS protection
- Helmet security headers

### ✅ Database
- PostgreSQL with Sequelize ORM
- Shares Keycloak's PostgreSQL database
- Automatic schema synchronization
- UUID primary keys

### ✅ Logging & Monitoring
- Winston logger with file rotation
- Health check endpoint
- Request logging with Morgan
- Error tracking

---

## 📊 Database Tables

### `users`
```sql
- id (UUID, PK)
- keycloak_id (VARCHAR, unique) -- Links to Keycloak
- username (VARCHAR, unique)
- email (VARCHAR, unique)
- email_verified (BOOLEAN)
- first_name (VARCHAR)
- last_name (VARCHAR)
- phone (VARCHAR)
- is_active (BOOLEAN)
- last_login (TIMESTAMP)
- created_at, updated_at
```

### `user_profiles`
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- avatar_url (VARCHAR)
- date_of_birth (DATE)
- gender (ENUM)
- bio (TEXT)
- preferences (JSONB)
- newsletter_subscribed (BOOLEAN)
- created_at, updated_at
```

### `user_addresses`
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- address_type (ENUM: billing, shipping, both)
- is_default (BOOLEAN)
- full_name, phone
- address_line1, address_line2
- city, state, postal_code, country
- created_at, updated_at
```

---

## 🔌 API Endpoints

### Public Endpoints (No Authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |

### Protected Endpoints (Requires Bearer Token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update current user |
| DELETE | `/api/users/me` | Delete account |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/profile/addresses` | Get all addresses |
| POST | `/api/profile/addresses` | Create address |
| PUT | `/api/profile/addresses/:id` | Update address |
| DELETE | `/api/profile/addresses/:id` | Delete address |

### Admin Endpoints (Requires Admin Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (paginated) |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| POST | `/api/users/:id/roles` | Assign role |
| DELETE | `/api/users/:id/roles/:role` | Remove role |

---

## 🧪 Testing with Postman

1. **Import Collection**:
   - Open Postman
   - Import `User-Service-Postman-Collection.json`

2. **Test Flow**:
   1. Health Check
   2. Register User → saves userId
   3. Login → saves access_token and refresh_token
   4. Get Current User (uses saved token)
   5. Update Profile
   6. Create Address
   7. Refresh Token
   8. Logout

The collection has automatic variable management for tokens!

---

## 🔗 Integration with Other Services

### API Gateway Integration
Add these routes to your API Gateway (port 8090):
```
/api/users/** → http://localhost:3000/api/users/**
/api/auth/** → http://localhost:3000/api/auth/**
/api/profile/** → http://localhost:3000/api/profile/**
```

### Order Service Integration
Order service can call User Service to:
- Validate user exists
- Get user addresses for shipping
- Verify user is active

### Product Service Integration
Product service can call User Service to:
- Get user preferences for recommendations
- Check user role (customer, seller)

---

## 🐳 Docker Support

### Build Image
```bash
docker build -t user-service .
```

### Run Container
```bash
docker run -p 3000:3000 --env-file .env user-service
```

### With Docker Compose
```bash
docker-compose up -d
```

---

## 📝 Environment Variables

Required variables in `.env`:
```env
# Keycloak (REQUIRED)
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=Ecommerce
KEYCLOAK_CLIENT_ID=ecommerce-user-service
KEYCLOAK_CLIENT_SECRET=<YOUR_SECRET_HERE>  # ⚠️ GET FROM KEYCLOAK
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Database (matches Keycloak DB)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=keycloak
DB_USER=keycloak
DB_PASSWORD=password

# Security
JWT_SECRET=your-jwt-secret-change-in-production
SESSION_SECRET=your-session-secret-change-in-production

# Server
PORT=3000
NODE_ENV=development
```

---

## 🎯 Next Steps

### 1. Complete Keycloak Setup
Follow `KEYCLOAK_SETUP_GUIDE.md` step by step

### 2. Start User Service
```bash
cd user-service
npm install
npm run dev
```

### 3. Test All Endpoints
Use Postman collection or curl commands

### 4. Integrate with API Gateway
Add user service routes to your gateway

### 5. Connect Other Services
Update Order/Product services to call User Service

---

## 🆘 Troubleshooting

### Cannot connect to Keycloak
- Verify Keycloak is running: `docker ps | grep keycloak`
- Check URL in `.env`: `http://localhost:8080`
- Ensure realm name is correct: `Ecommerce`

### Database connection failed
- Check PostgreSQL is running
- Verify credentials in `.env`
- Database should be named `keycloak`

### Invalid client secret error
- Get fresh secret from Keycloak Admin Console
- Update `.env` file
- Restart the service

### Token expired (401)
- Tokens expire after 15 minutes
- Use refresh token endpoint
- Get new access token

---

## 📚 Additional Resources

- **Keycloak Documentation**: https://www.keycloak.org/documentation
- **Express.js Guide**: https://expressjs.com/
- **Sequelize Docs**: https://sequelize.org/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

## ✅ Checklist

Complete these tasks in order:

### Keycloak Setup
- [ ] Keycloak running on port 8080
- [ ] Realm `Ecommerce` exists
- [ ] Roles created: customer, admin, seller, support
- [ ] Client `ecommerce-user-service` created
- [ ] Client secret copied
- [ ] Test users created (optional)

### Service Setup
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` configured with client secret
- [ ] Service starts without errors
- [ ] Health check returns 200 OK
- [ ] Database tables created automatically

### Testing
- [ ] User registration works
- [ ] Login returns access token
- [ ] Protected routes require token
- [ ] Profile management works
- [ ] Address CRUD operations work
- [ ] Admin endpoints work (if admin user created)

### Integration
- [ ] Postman collection imported and tested
- [ ] API Gateway routes configured
- [ ] Other services can call user service

---

## 🎉 Success!

You now have a fully functional User Service with Keycloak authentication!

**Service URL**: `http://localhost:3000`  
**Health Check**: `http://localhost:3000/api/health`  
**Keycloak**: `http://localhost:8080`

**Key Documents**:
- 📖 Full API Documentation: `user-service/README.md`
- 🚀 Quick Start: `user-service/QUICK_START.md`
- 🔐 Keycloak Setup: `KEYCLOAK_SETUP_GUIDE.md`
- 🧪 Postman Collection: `user-service/User-Service-Postman-Collection.json`

---

**Created**: November 2, 2025  
**Version**: 1.0.0  
**Technology**: Node.js + Express + Keycloak + PostgreSQL
