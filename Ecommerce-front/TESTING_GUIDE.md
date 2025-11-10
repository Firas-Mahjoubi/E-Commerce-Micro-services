# E-Commerce Frontend - User Authentication Testing Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Angular CLI installed globally: `npm install -g @angular/cli`
- User Service backend running on `http://localhost:3000`

### Installation

1. **Install dependencies**:
   ```powershell
   cd "c:\project Ecommerce\Ecommerce-front"
   npm install
   ```

2. **Start the development server**:
   ```powershell
   npm start
   # Or
   ng serve
   ```

3. **Open your browser**:
   Navigate to `http://localhost:4200`

## 🔐 Testing the Authentication Flow

### Test Scenario 1: User Registration

1. **Navigate to Registration**:
   - App should redirect to `/login` by default
   - Click on "Sign up" link to go to `/register`

2. **Fill the Registration Form**:
   ```
   Username: testuser123
   First Name: John
   Last Name: Doe
   Email: john.doe@test.com
   Phone: +1234567890 (optional)
   Password: Test@123456
   Confirm Password: Test@123456
   ```

3. **Validate Password Strength**:
   - Notice the password strength indicator (Weak/Medium/Strong)
   - Password must contain:
     - At least 8 characters
     - Uppercase letter (A-Z)
     - Lowercase letter (a-z)
     - Number (0-9)
     - Special character (!@#$%^&*...)

4. **Submit**:
   - Check the "Terms of Service" checkbox
   - Click "Create Account"
   - Should redirect to `/dashboard` on success
   - Access token stored in localStorage

5. **Expected Backend Call**:
   ```
   POST http://localhost:3000/api/auth/register
   {
     "username": "testuser123",
     "email": "john.doe@test.com",
     "password": "Test@123456",
     "firstName": "John",
     "lastName": "Doe",
     "phone": "+1234567890"
   }
   ```

### Test Scenario 2: User Login

1. **Navigate to Login**:
   - Click on "Sign in" link from register page
   - Or navigate to `http://localhost:4200/login`

2. **Fill Login Form**:
   ```
   Username: testuser123
   Password: Test@123456
   ```

3. **Features to Test**:
   - Toggle password visibility (eye icon)
   - "Remember me" checkbox (visual only for now)
   - Form validation on empty fields

4. **Submit**:
   - Click "Sign In"
   - Should show loading spinner
   - On success: redirect to `/dashboard`
   - On error: display error message

5. **Expected Backend Call**:
   ```
   POST http://localhost:3000/api/auth/login
   {
     "username": "testuser123",
     "password": "Test@123456"
   }
   ```

### Test Scenario 3: Dashboard Access

1. **Authenticated User**:
   - After login, should see dashboard with:
     - Header with logo and user info
     - User avatar (first letter of name)
     - User details card
     - Feature cards (Profile, Orders, Addresses, Settings)
     - Logout button

2. **View User Information**:
   - Check that user data is displayed correctly
   - Email verification status
   - Account status (Active/Inactive)
   - User roles
   - Last login time

3. **Backend Call**:
   ```
   GET http://localhost:3000/api/users/me
   Authorization: Bearer <access_token>
   ```

### Test Scenario 4: Logout

1. **Click Logout Button**:
   - Confirmation dialog should appear
   - Click "OK" to confirm

2. **Expected Behavior**:
   - Call logout API
   - Clear localStorage (tokens and user data)
   - Redirect to `/login`

3. **Backend Call**:
   ```
   POST http://localhost:3000/api/auth/logout
   {
     "refresh_token": "<refresh_token>"
   }
   ```

### Test Scenario 5: Route Guards

1. **Protected Routes**:
   - Try accessing `/dashboard` without logging in
   - Should redirect to `/login` with return URL

2. **Guest Routes**:
   - After logging in, try accessing `/login` or `/register`
   - Should redirect to `/dashboard`

## 🐛 Common Issues & Troubleshooting

### Issue 1: CORS Error
**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**: Make sure your backend (user-service) has CORS enabled for `http://localhost:4200`

In `user-service/src/server.js`, check:
```javascript
app.use(cors({
  origin: ['http://localhost:4200'],
  credentials: true
}));
```

### Issue 2: Backend Not Running
**Error**: `Http failure response for http://localhost:3000/api/auth/login: 0 Unknown Error`

**Solution**: Start the user service backend:
```powershell
cd "c:\project Ecommerce\user-service"
npm run dev
```

### Issue 3: Network Error
**Error**: `Invalid username or password`

**Solution**: 
- Check if Keycloak is running on `http://localhost:8080`
- Verify user exists in Keycloak
- Check backend logs for detailed error

### Issue 4: Token Expired
**Error**: `401 Unauthorized` on API calls

**Solution**:
- Token expires in 15 minutes by default
- Implement automatic token refresh (future enhancement)
- Or logout and login again

## 📝 Testing Checklist

### Registration Page
- [ ] Form validation works (required fields)
- [ ] Email format validation
- [ ] Phone number format validation (E.164)
- [ ] Username format validation (alphanumeric, dots, underscores, hyphens)
- [ ] Password strength indicator shows correctly
- [ ] Password confirmation matches
- [ ] Password visibility toggle works
- [ ] Loading state shows during registration
- [ ] Error messages display correctly
- [ ] Success: redirects to dashboard
- [ ] "Sign in" link works

### Login Page
- [ ] Form validation works
- [ ] Password visibility toggle works
- [ ] "Remember me" checkbox (visual)
- [ ] "Forgot password" link (not implemented yet)
- [ ] Loading state shows during login
- [ ] Error messages display correctly
- [ ] Success: redirects to dashboard or return URL
- [ ] "Sign up" link works
- [ ] Social login buttons (coming soon message)

### Dashboard Page
- [ ] User info loads correctly
- [ ] User avatar displays with initial
- [ ] User details card shows all information
- [ ] Email verification badge shows correct status
- [ ] Account status badge shows correct status
- [ ] Roles display correctly
- [ ] Last login time formats correctly
- [ ] Feature cards are displayed
- [ ] Logout button works
- [ ] Logout confirmation dialog appears
- [ ] Loading state shows while fetching data

### Route Guards
- [ ] Cannot access dashboard without login
- [ ] Redirects to login with return URL
- [ ] Cannot access login/register when logged in
- [ ] Redirects to dashboard when already logged in

### Authentication Flow
- [ ] Access token stored in localStorage
- [ ] Refresh token stored in localStorage
- [ ] User data stored in localStorage
- [ ] Authorization header added to API calls
- [ ] Tokens cleared on logout
- [ ] User data cleared on logout

## 🎨 UI/UX Features

### Responsive Design
- Desktop (1200px+): Full layout
- Tablet (768px-1200px): Adjusted layout
- Mobile (320px-768px): Single column, stacked elements

### Visual Feedback
- Loading spinners during API calls
- Error messages with icons
- Success animations
- Form validation feedback (red borders, error text)
- Button hover effects
- Card hover effects
- Smooth transitions

### Animations
- Slide-in animation on page load
- Shake animation on errors
- Spin animation on loading
- Smooth color transitions

## 🔧 Developer Tools

### Browser DevTools

1. **Network Tab**:
   - Monitor API calls
   - Check request/response headers
   - Verify authorization tokens
   - Check status codes

2. **Console**:
   - View console logs from AuthService
   - Check for JavaScript errors
   - Monitor component lifecycle

3. **Application Tab**:
   - Inspect localStorage
   - View stored tokens
   - Check user data

### Angular DevTools

Install Angular DevTools extension for Chrome/Edge:
- Inspect component tree
- View component properties
- Monitor change detection
- Profile performance

## 📊 Expected API Responses

### Registration Success
```json
{
  "message": "User registered successfully",
  "token_type": "Bearer",
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "username": "testuser123",
    "email": "john.doe@test.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": false,
    "isActive": true,
    "roles": ["customer"]
  }
}
```

### Login Success
```json
{
  "message": "Login successful",
  "token_type": "Bearer",
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "username": "testuser123",
    "email": "john.doe@test.com",
    "roles": ["customer"]
  }
}
```

### Error Response
```json
{
  "error": "Validation Error",
  "message": "Username already exists",
  "details": ["Username 'testuser123' is already taken"]
}
```

## 🚀 Next Steps

After testing the authentication flow:

1. **Implement Profile Management**:
   - View/Edit profile page
   - Upload avatar
   - Update user preferences

2. **Implement Address Management**:
   - List addresses
   - Add new address
   - Edit/Delete address
   - Set default address

3. **Token Refresh**:
   - Automatic token refresh
   - Handle expired tokens gracefully

4. **Password Reset**:
   - Forgot password flow
   - Reset password page

5. **Email Verification**:
   - Resend verification email
   - Verify email page

## 📚 Additional Resources

- [User Service API Documentation](../user-service/README.md)
- [Keycloak Setup Guide](../KEYCLOAK_SETUP_GUIDE.md)
- [Angular Documentation](https://angular.dev)

## 🤝 Contributing

If you find any issues:
1. Check this guide first
2. Check browser console for errors
3. Check backend logs
4. Create an issue with detailed information

---

**Happy Testing! 🎉**
