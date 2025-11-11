package com.esprit.microservice.voucherservice.service;

import com.esprit.microservice.voucherservice.dto.CustomerDto;
import com.esprit.microservice.voucherservice.entity.Voucher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send voucher notification email to a single customer
     */
    @Async
    public void sendVoucherNotification(CustomerDto customer, Voucher voucher) {
        try {
            log.info("========================================");
            log.info("Preparing to send email:");
            log.info("  From: {}", fromEmail);
            log.info("  To: {} (Username: {}, Name: {} {})",
                    customer.getEmail(),
                    customer.getUsername(),
                    customer.getFirstName(),
                    customer.getLastName());
            log.info("  Voucher Code: {}", voucher.getCode());
            log.info("  Discount: {}%", voucher.getDiscountPercentage());
            log.info("========================================");

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(customer.getEmail());
            helper.setSubject("🎉 New Voucher Available: " + voucher.getCode());

            String htmlContent = buildVoucherEmailTemplate(customer, voucher);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Voucher notification email sent successfully to: {} ({})", customer.getEmail(),
                    customer.getUsername());
        } catch (MessagingException e) {
            log.error("❌ Failed to send voucher notification email to: {} - Error: {}", customer.getEmail(),
                    e.getMessage());
        } catch (Exception e) {
            log.error("❌ Unexpected error sending email to: {} - Error: {}", customer.getEmail(),
                    e.getMessage(), e);
        }
    }

    /**
     * Send voucher notification emails to multiple customers
     */
    @Async
    public void sendVoucherNotificationToCustomers(List<CustomerDto> customers, Voucher voucher) {
        log.info("========================================");
        log.info("📧 EMAIL NOTIFICATION DETAILS");
        log.info("========================================");
        log.info("Total customers to notify: {}", customers.size());
        log.info("Voucher Code: {}", voucher.getCode());
        log.info("Sender Email: {}", fromEmail);
        log.info("========================================");
        log.info("📋 CUSTOMER LIST:");

        for (int i = 0; i < customers.size(); i++) {
            CustomerDto customer = customers.get(i);
            log.info("  {}. Username: {}, Email: {}, Name: {} {}",
                    (i + 1),
                    customer.getUsername(),
                    customer.getEmail(),
                    customer.getFirstName(),
                    customer.getLastName());
        }
        log.info("========================================");

        for (CustomerDto customer : customers) {
            if (customer.getEmail() != null && !customer.getEmail().isEmpty()) {
                sendVoucherNotification(customer, voucher);
            } else {
                log.warn("⚠️ Customer {} has no email address", customer.getUsername());
            }
        }

        log.info("✅ Finished sending voucher notification emails");
    }

    /**
     * Build HTML email template for voucher notification
     */
    private String buildVoucherEmailTemplate(CustomerDto customer, Voucher voucher) {
        DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        String customerName = (customer.getFirstName() != null && customer.getLastName() != null)
                ? customer.getFirstName() + " " + customer.getLastName()
                : customer.getUsername();

        String categoryInfo = (voucher.getApplicableCategory() != null && !voucher.getApplicableCategory().isEmpty())
                ? "<p style=\"background-color: #FEF3C7; padding: 10px; border-radius: 5px; margin: 15px 0;\">" +
                        "📦 <strong>Applicable to:</strong> " + voucher.getApplicableCategory() + " category only</p>"
                : "<p style=\"background-color: #D1FAE5; padding: 10px; border-radius: 5px; margin: 15px 0;\">" +
                        "🛒 <strong>Applicable to:</strong> All products</p>";

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: ##333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: ##f9f9f9;
                        }
                        .header {
                            background: linear-gradient(135deg, ##667eea 0%%, ##764ba2 100%%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            background-color: white;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        .voucher-card {
                            background: linear-gradient(135deg, ##667eea 0%%, ##764ba2 100%%);
                            color: white;
                            padding: 25px;
                            border-radius: 10px;
                            text-align: center;
                            margin: 25px 0;
                            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                        }
                        .voucher-code {
                            font-size: 36px;
                            font-weight: bold;
                            letter-spacing: 3px;
                            margin: 15px 0;
                            padding: 15px;
                            background-color: rgba(255, 255, 255, 0.2);
                            border-radius: 5px;
                            border: 2px dashed white;
                        }
                        .discount-badge {
                            display: inline-block;
                            background-color: ##10B981;
                            color: white;
                            padding: 10px 20px;
                            border-radius: 50px;
                            font-size: 24px;
                            font-weight: bold;
                            margin: 10px 0;
                        }
                        .info-box {
                            background-color: ##F3F4F6;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 10px 0;
                            border-bottom: 1px solid ##E5E7EB;
                        }
                        .info-row:last-child {
                            border-bottom: none;
                        }
                        .cta-button {
                            display: inline-block;
                            background: linear-gradient(135deg, ##667eea 0%%, ##764ba2 100%%);
                            color: white;
                            padding: 15px 40px;
                            text-decoration: none;
                            border-radius: 50px;
                            font-weight: bold;
                            font-size: 16px;
                            margin: 20px 0;
                            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            color: ##666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎁 Special Voucher Just For You!</h1>
                        </div>
                        <div class="content">
                            <h2>Hello %s! 👋</h2>
                            <p>We're excited to share a special discount voucher with you!</p>

                            <div class="voucher-card">
                                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your Voucher Code</p>
                                <div class="voucher-code">%s</div>
                                <div class="discount-badge">%.0f%%%% OFF</div>
                            </div>

                            <div class="info-box">
                                <h3 style="margin-top: 0;">📋 Voucher Details</h3>
                                <div class="info-row">
                                    <span><strong>Code:</strong></span>
                                    <span>%s</span>
                                </div>
                                <div class="info-row">
                                    <span><strong>Discount:</strong></span>
                                    <span>%.0f%%%%</span>
                                </div>
                                <div class="info-row">
                                    <span><strong>Valid From:</strong></span>
                                    <span>%s</span>
                                </div>
                                <div class="info-row">
                                    <span><strong>Valid Until:</strong></span>
                                    <span>%s</span>
                                </div>
                            </div>

                            {{CATEGORY_INFO}}

                            <p style="background-color: ##FEE2E2; padding: 15px; border-radius: 5px; border-left: 4px solid ##EF4444;">
                                <strong>⏰ Limited Time Offer!</strong><br>
                                Don't miss out! This voucher is valid until %s.
                            </p>

                            <div style="text-align: center;">
                                <a href="http://localhost:4200/products" class="cta-button">
                                    🛍️ Start Shopping Now
                                </a>
                            </div>

                            <p style="margin-top: 30px; font-size: 14px; color: ##666;">
                                Simply enter the voucher code <strong>%s</strong> at checkout to enjoy your discount!
                            </p>
                        </div>
                        <div class="footer">
                            <p>This email was sent to %s</p>
                            <p>© 2025 E-Commerce Platform. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        customerName,
                        voucher.getCode(),
                        voucher.getDiscountPercentage(),
                        voucher.getCode(),
                        voucher.getDiscountPercentage(),
                        voucher.getStartDate().format(dateFormat),
                        voucher.getEndDate().format(dateFormat),
                        voucher.getEndDate().format(dateFormat),
                        voucher.getCode(),
                        customer.getEmail())
                .replace("{{CATEGORY_INFO}}", categoryInfo);
    }
}
