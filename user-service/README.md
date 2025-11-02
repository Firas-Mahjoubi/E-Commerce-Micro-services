# User Service

Node.js-based user authentication and management service integrated with Keycloak for the E-Commerce microservices platform.

## Features

- ✅ User registration and authentication via Keycloak
- ✅ JWT token management (access + refresh tokens)
- ✅ Role-based access control (customer, admin, seller, support)
- ✅ User profile management
- ✅ Multiple address management
- ✅ PostgreSQL database integration
- ✅ RESTful API with Express.js
- ✅ Comprehensive error handling and logging

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: Keycloak Connect
- **Database**: PostgreSQL (shared with Keycloak)
- **ORM**: Sequelize
- **Logging**: Winston
- **Validation**: Express Validator

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Keycloak 23.0+ running on `http://localhost:8080`
- Keycloak realm `Ecommerce` configured (see KEYCLOAK_SETUP_GUIDE.md)

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   - Copy `.env` file and update the following:
     - `KEYCLOAK_CLIENT_SECRET`: Get from Keycloak Admin Console → Clients → ecommerce-user-service → Credentials
     - `KEYCLOAK_ADMIN_USERNAME` and `KEYCLOAK_ADMIN_PASSWORD`: Your Keycloak admin credentials
     - Database credentials (if different from defaults)

3. **Create logs directory**:
   ```bash
   mkdir logs
   ```

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will start on `http://localhost:3000`

## API Endpoints

### Health Check
```http
GET /api/health
```

### Authentication (Public)

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "message": "Login successful",
  "token_type": "Bearer",
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "roles": ["customer"]
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

#### Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

### User Management (Protected)

All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <access_token>
```

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <access_token>
```

#### Update Current User
```http
PUT /api/users/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe Updated",
  "phone": "+1234567890",
  "email": "john.updated@example.com"
}
```

#### Delete Current User
```http
DELETE /api/users/me
Authorization: Bearer <access_token>
```

### Admin Endpoints (Admin Role Required)

#### Get All Users
```http
GET /api/users?page=1&limit=10&search=john
Authorization: Bearer <admin_access_token>
```

#### Get User by ID
```http
GET /api/users/{userId}
Authorization: Bearer <admin_access_token>
```

#### Update User
```http
PUT /api/users/{userId}
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "firstName": "Updated",
  "isActive": true
}
```

#### Delete User
```http
DELETE /api/users/{userId}
Authorization: Bearer <admin_access_token>
```

#### Assign Role
```http
POST /api/users/{userId}/roles
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "role": "seller"
}
```

#### Remove Role
```http
DELETE /api/users/{userId}/roles/{roleName}
Authorization: Bearer <admin_access_token>
```

### Profile Management (Protected)

#### Get Profile
```http
GET /api/profile
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PUT /api/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "avatarUrl": "https://example.com/avatar.jpg",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "bio": "Software developer and tech enthusiast",
  "preferences": {
    "language": "en",
    "currency": "USD",
    "notifications": {
      "email": true,
      "sms": false
    }
  },
  "newsletterSubscribed": true
}
```

### Address Management (Protected)

#### Get All Addresses
```http
GET /api/profile/addresses
Authorization: Bearer <access_token>
```

#### Create Address
```http
POST /api/profile/addresses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "addressType": "shipping",
  "isDefault": true,
  "fullName": "John Doe",
  "phone": "+1234567890",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA"
}
```

#### Update Address
```http
PUT /api/profile/addresses/{addressId}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "addressLine1": "456 Updated Street",
  "city": "Los Angeles"
}
```

#### Delete Address
```http
DELETE /api/profile/addresses/{addressId}
Authorization: Bearer <access_token>
```

#### Set Default Address
```http
PUT /api/profile/addresses/{addressId}/default
Authorization: Bearer <access_token>
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  keycloak_id VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  first_name VARCHAR,
  last_name VARCHAR,
  phone VARCHAR,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  avatar_url VARCHAR,
  date_of_birth DATE,
  gender VARCHAR,
  bio TEXT,
  preferences JSONB,
  newsletter_subscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### User Addresses Table
```sql
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  address_type VARCHAR,
  is_default BOOLEAN DEFAULT false,
  full_name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  address_line1 VARCHAR NOT NULL,
  address_line2 VARCHAR,
  city VARCHAR NOT NULL,
  state VARCHAR,
  postal_code VARCHAR NOT NULL,
  country VARCHAR NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Testing with Postman/curl

### 1. Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

### 3. Get current user (use token from login)
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <your_access_token>"
```

## Roles and Permissions

| Role | Permissions |
|------|-------------|
| **customer** | Access own profile, manage addresses, place orders |
| **seller** | Customer permissions + manage products, view related orders |
| **admin** | Full access to all resources, user management |
| **support** | View users and orders, limited modification access |

## Error Handling

All errors return JSON with the following structure:
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": [] // Optional
}
```

### Common HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

## Logging

Logs are stored in the `logs/` directory:
- `combined.log`: All logs
- `error.log`: Error logs only

Log levels: error, warn, info, http, verbose, debug, silly

## Integration with Other Services

### API Gateway
The service should be registered with the API Gateway at `http://localhost:8090`

### Product Service
Can be called for user-specific product recommendations

### Order Service
Will call user service to validate users and fetch addresses

## Security Best Practices

1. **Always use HTTPS in production**
2. **Rotate Keycloak client secrets regularly**
3. **Set strong JWT secrets**
4. **Enable rate limiting** (implement in API Gateway)
5. **Validate all user inputs**
6. **Keep dependencies updated**
7. **Use environment variables for sensitive data**
8. **Enable CORS only for trusted origins**

## Troubleshooting

### Issue: Cannot connect to Keycloak
- Verify Keycloak is running: `docker ps | grep keycloak`
- Check Keycloak URL in `.env`
- Ensure realm name is correct

### Issue: Database connection failed
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### Issue: Invalid client secret
- Get the correct secret from Keycloak Admin Console
- Update `KEYCLOAK_CLIENT_SECRET` in `.env`
- Restart the service

### Issue: 401 Unauthorized
- Token might be expired (default: 15 minutes)
- Use refresh token to get a new access token
- Ensure Bearer token is in Authorization header

## Development

### Code Structure
```
user-service/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
├── logs/                 # Log files
├── .env                  # Environment variables
├── package.json
└── README.md
```

### Adding New Endpoints
1. Create route in `src/routes/`
2. Implement controller in `src/controllers/`
3. Add validation middleware if needed
4. Register route in `src/server.js`
5. Update this README

## Monitoring

Check service health:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "user-service",
  "timestamp": "2025-11-02T10:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "keycloak": {
    "url": "http://localhost:8080",
    "realm": "Ecommerce"
  }
}
```

## License

ISC

## Support

For issues and questions, please create an issue in the repository.

---

**Created**: November 2, 2025  
**Last Updated**: November 2, 2025  
**Version**: 1.0.0
