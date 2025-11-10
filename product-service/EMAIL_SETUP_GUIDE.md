# Email Notification Setup Guide

This guide explains how to configure email notifications for the Product Service.

## Features

When a seller adds a new product, they will receive an email notification with:
- Product name and ID
- Confirmation that the product is live
- Next steps and recommendations
- Professional HTML email template

## Email Configuration

### Using Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication on your Gmail account**
   - Go to your Google Account settings
   - Security → 2-Step Verification

2. **Generate an App Password**
   - Go to Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "E-Commerce Product Service"
   - Copy the generated 16-character password

3. **Set Environment Variables**

   **Windows (PowerShell):**
   ```powershell
   $env:EMAIL_USERNAME="your-email@gmail.com"
   $env:EMAIL_PASSWORD="your-16-char-app-password"
   ```

   **Windows (Command Prompt):**
   ```cmd
   set EMAIL_USERNAME=your-email@gmail.com
   set EMAIL_PASSWORD=your-16-char-app-password
   ```

   **Linux/Mac:**
   ```bash
   export EMAIL_USERNAME="your-email@gmail.com"
   export EMAIL_PASSWORD="your-16-char-app-password"
   ```

4. **Or Update application.properties directly:**
   ```properties
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-16-char-app-password
   ```

   ⚠️ **Never commit real credentials to Git!**

## Configuration Properties

The following properties are configured in `application.properties`:

```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${EMAIL_USERNAME:your-email@gmail.com}
spring.mail.password=${EMAIL_PASSWORD:your-app-password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
```

## Using Other Email Providers

### Outlook/Hotmail
```properties
spring.mail.host=smtp.office365.com
spring.mail.port=587
```

### Yahoo
```properties
spring.mail.host=smtp.mail.yahoo.com
spring.mail.port=587
```

### Custom SMTP Server
```properties
spring.mail.host=your-smtp-server.com
spring.mail.port=587
spring.mail.username=your-username
spring.mail.password=your-password
```

## Testing Email Functionality

1. **Start the services:**
   ```bash
   # Start user-service (port 3000)
   # Start product-service (port 8092)
   ```

2. **Add a product via the seller dashboard:**
   - Login as a seller
   - Navigate to "Add Product"
   - Fill in product details
   - Submit the form

3. **Check the logs:**
   ```
   INFO - Product xyz is created with skuCode ABC123 by seller seller-id
   INFO - Email notification sent to seller: seller@example.com
   ```

4. **Check your email inbox**
   - The seller should receive a professional HTML email
   - Subject: "Product Successfully Added - [Product Name]"

## Troubleshooting

### Issue: "Authentication failed"
- ✅ Make sure you're using an App Password, not your regular Gmail password
- ✅ Check that 2FA is enabled on your Google account

### Issue: "Failed to send email"
- ✅ Check internet connection
- ✅ Verify SMTP settings are correct
- ✅ Check firewall settings (port 587 should be open)
- ✅ Look at the service logs for detailed error messages

### Issue: Email not received
- ✅ Check spam/junk folder
- ✅ Verify the seller's email address in user-service
- ✅ Check service logs for successful send confirmation

### Issue: "Connection timeout"
- ✅ Check if your ISP blocks port 587
- ✅ Try using port 465 with SSL instead
- ✅ Check firewall/antivirus settings

## Email Service Architecture

```
ProductService.createProduct()
    ↓
1. Save product to database
    ↓
2. Send Kafka events
    ↓
3. Call UserClient to get seller email
    ↓
4. Call EmailService.sendProductAddedNotification()
    ↓
5. Email sent asynchronously (@Async)
```

## Production Recommendations

1. **Use a dedicated email service:**
   - SendGrid
   - Amazon SES
   - Mailgun
   - Postmark

2. **Implement email queue:**
   - Use Kafka for email events
   - Retry failed emails
   - Track email delivery status

3. **Security:**
   - Store credentials in a secrets manager (AWS Secrets Manager, Azure Key Vault)
   - Use OAuth2 instead of App Passwords
   - Implement rate limiting

4. **Monitoring:**
   - Track email delivery rates
   - Monitor bounce rates
   - Set up alerts for failures

## Email Template Customization

To customize the email template, edit:
```
src/main/java/com/esprit/microservice/productservice/service/EmailService.java
```

The method `buildProductAddedEmailTemplate()` contains the HTML template.

## Dependencies Added

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

## Related Files

- `EmailService.java` - Email sending logic
- `AsyncConfig.java` - Enables async email sending
- `UserClient.java` - Feign client to fetch seller details
- `ProductService.java` - Integration point for email notifications
- `application.properties` - Email configuration

## Support

If you encounter issues, check:
1. Service logs in the terminal
2. Email provider's status page
3. Network/firewall configuration
4. Environment variables are set correctly
