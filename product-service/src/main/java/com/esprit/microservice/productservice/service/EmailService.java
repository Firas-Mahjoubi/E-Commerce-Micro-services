package com.esprit.microservice.productservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Async
    public void sendProductAddedNotification(String sellerEmail, String productName, String productId) {
        // Check if email is configured
        if (fromEmail == null || fromEmail.isEmpty()) {
            log.warn("Email notifications are disabled. To enable, set EMAIL_USERNAME and EMAIL_PASSWORD environment variables.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(sellerEmail);
            helper.setSubject("Product Successfully Added - " + productName);

            String htmlContent = buildProductAddedEmailTemplate(productName, productId);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Product added notification email sent to: {}", sellerEmail);
        } catch (MessagingException e) {
            log.error("Failed to send product added notification email to: {}", sellerEmail, e);
        } catch (Exception e) {
            log.error("Unexpected error while sending email to: {}. Error: {}", sellerEmail, e.getMessage());
        }
    }

    private String buildProductAddedEmailTemplate(String productName, String productId) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .header {
                            background-color: #4F46E5;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: white;
                            padding: 30px;
                            border-radius: 0 0 5px 5px;
                        }
                        .product-info {
                            background-color: #EEF2FF;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                        .success-icon {
                            font-size: 48px;
                            text-align: center;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Product Successfully Added!</h1>
                        </div>
                        <div class="content">
                            <div class="success-icon">✅</div>
                            <h2>Hello Seller,</h2>
                            <p>Great news! Your product has been successfully added to our marketplace.</p>
                            
                            <div class="product-info">
                                <h3>Product Details:</h3>
                                <p><strong>Product Name:</strong> %s</p>
                                <p><strong>Product ID:</strong> %s</p>
                                <p><strong>Status:</strong> <span style="color: #10B981;">Active</span></p>
                            </div>
                            
                            <p>Your product is now live and visible to customers on the platform.</p>
                            
                            <p><strong>Next Steps:</strong></p>
                            <ul>
                                <li>Monitor your product performance in the seller dashboard</li>
                                <li>Update inventory as needed</li>
                                <li>Respond promptly to customer inquiries</li>
                                <li>Keep your product information up to date</li>
                            </ul>
                            
                            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                            
                            <p>Best regards,<br>
                            <strong>E-Commerce Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification. Please do not reply to this email.</p>
                            <p>&copy; 2025 E-Commerce Platform. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(productName, productId);
    }
}
