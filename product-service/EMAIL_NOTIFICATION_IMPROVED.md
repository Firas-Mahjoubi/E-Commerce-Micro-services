# Email Notification System - Improved Implementation

## Overview
Email notifications are sent to sellers when they create new products. The system now extracts the seller's email directly from the JWT token instead of making an additional API call to the user-service.

## Why This Approach is Better

### Previous Approach (Problematic)
1. Extract JWT token from SecurityContext
2. Make API call to user-service: `GET /api/users/{sellerId}`
3. Parse response to get email
4. Send email

**Problems:**
- ❌ Extra network call (latency)
- ❌ Dependency on user-service availability
- ❌ 404 errors if user not found in database
- ❌ 403 errors due to authorization issues
- ❌ More points of failure

### Current Approach (Optimized)
1. Extract JWT token from SecurityContext
2. Read email claim directly from token
3. Send email

**Benefits:**
- ✅ No additional API calls
- ✅ Faster execution (no network latency)
- ✅ No dependency on user-service availability
- ✅ No database lookup required
- ✅ Works even if user record doesn't exist in DB
- ✅ Simpler error handling

## Implementation Details

### Email Extraction Method
```java
private String getEmailFromToken() {
    try {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            // Try multiple possible email claims
            String email = jwt.getClaimAsString("email");
            if (email == null || email.isEmpty()) {
                email = jwt.getClaimAsString("preferred_username");
            }
            if (email == null || email.isEmpty()) {
                email = jwt.getClaimAsString("upn");
            }
            return email;
        }
    } catch (Exception e) {
        log.error("Error extracting email from token: {}", e.getMessage());
    }
    return null;
}
```

### Integration in Product Creation
```java
// Send email notification to seller - Extract email from JWT token
try {
    String sellerEmail = getEmailFromToken();
    if (sellerEmail != null && !sellerEmail.isEmpty()) {
        emailService.sendProductAddedNotification(
            sellerEmail, 
            product.getName(), 
            product.getId()
        );
        log.info("Email notification sent to seller: {}", sellerEmail);
    } else {
        log.warn("No email found in JWT token, skipping email notification");
    }
} catch (Exception e) {
    log.error("Failed to send email notification for product {}: {}", 
        product.getId(), e.getMessage());
    // Don't fail the product creation if email fails
}
```

## JWT Token Structure

### Keycloak Token Claims
Keycloak JWT tokens typically include:
- `email`: User's email address
- `preferred_username`: Username (might be email)
- `upn`: User Principal Name
- `sub`: Subject (user ID)
- `name`: Full name
- `realm_access`: Roles and permissions

### Example JWT Payload
```json
{
  "exp": 1699876543,
  "iat": 1699876243,
  "auth_time": 1699876240,
  "jti": "abc123",
  "iss": "http://localhost:8080/realms/Ecommerce",
  "sub": "67c9bef0-2e54-40dc-b489-aba8b77470cb",
  "typ": "Bearer",
  "azp": "ecommerce-client",
  "session_state": "xyz789",
  "preferred_username": "seller@example.com",
  "email": "seller@example.com",
  "email_verified": true,
  "name": "John Seller",
  "given_name": "John",
  "family_name": "Seller",
  "realm_access": {
    "roles": ["seller", "user"]
  }
}
```

## Email Configuration

### Gmail SMTP Settings
```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=frsmahjoubi@gmail.com
spring.mail.password=pfuqncpymqkgnbyq
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.debug=true
```

### Email Template
Professional HTML email with:
- Product name
- Product ID
- Success message
- Styled with CSS
- Mobile-responsive design

## Error Handling

### Graceful Degradation
- If email extraction fails → Log warning, continue
- If email sending fails → Log error, continue
- Product creation is NEVER blocked by email failures

### Logging
```java
// Success
log.info("Email notification sent to seller: {}", sellerEmail);

// Warning - no email in token
log.warn("No email found in JWT token, skipping email notification");

// Error - sending failed
log.error("Failed to send email notification for product {}: {}", 
    product.getId(), e.getMessage());
```

## Testing

### Test Scenario
1. Login as seller in frontend
2. Navigate to seller dashboard
3. Click "Add Product"
4. Fill product details and submit
5. Check logs for: `Email notification sent to seller: {email}`
6. Check email inbox for notification

### Expected Log Output
```
2025-11-10T16:05:45.550 INFO - Product 6911f1382813e9044acd2ebb is created 
  with skuCode IPHONE_15_PRO by seller a3973adf-f8aa-4ead-bcae-7c033902345c
2025-11-10T16:05:45.596 INFO - Email notification sent to seller: frsmahjoubi@gmail.com
```

## Troubleshooting

### No Email Received
1. **Check Gmail App Password**: Must be 16 characters, no spaces
2. **Check Spam Folder**: First emails might go to spam
3. **Check Logs**: Look for "Email notification sent" message
4. **Verify Token**: Ensure JWT has email claim
5. **Test SMTP**: Use `spring.mail.properties.mail.debug=true`

### Email Not in Token
If Keycloak doesn't include email in token:
1. Go to Keycloak Admin Console
2. Navigate to Client → Mappers
3. Add "email" mapper to token
4. Ensure email is marked as included in token

### Gmail Blocks Sending
- Enable "Less secure app access" (if using regular password)
- Use App Password (recommended)
- Check Gmail's security settings
- Verify SMTP settings are correct

## Dependencies

### Maven Dependencies
```xml
<!-- Spring Boot Mail -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- Spring Security OAuth2 Resource Server (for JWT) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

### Required Components
- `EmailService.java` - Sends emails asynchronously
- `AsyncConfig.java` - Enables @Async support
- `ProductService.java` - Integrates email notification
- `application.properties` - Email configuration

## Future Enhancements

### Potential Improvements
1. **Email Templates**: Add more templates for different events
2. **Email Preferences**: Let sellers opt-in/out of notifications
3. **Email Queue**: Use message queue (Kafka) for reliability
4. **Email Tracking**: Track delivery status, opens, clicks
5. **Multi-language**: Support different languages based on user preference
6. **Rich Content**: Add product images, links to dashboard
7. **Batch Notifications**: Digest emails for multiple products

### Alternative Email Providers
- **SendGrid**: Professional email service with API
- **AWS SES**: Amazon Simple Email Service
- **Mailgun**: Transactional email service
- **Azure Email**: Microsoft email communication service

## Conclusion

✅ **Simplified Architecture**: Removed unnecessary user-service dependency  
✅ **Better Performance**: No additional API calls  
✅ **More Reliable**: Fewer points of failure  
✅ **Easier Debugging**: Simpler flow to trace  
✅ **Cost Effective**: Less network traffic

This implementation follows the **Single Responsibility Principle** and **KISS** (Keep It Simple, Stupid) principles by using data already available in the JWT token instead of fetching it from another service.
