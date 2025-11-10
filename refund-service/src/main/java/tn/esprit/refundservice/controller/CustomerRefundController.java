package tn.esprit.refundservice.controller;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.refundservice.dto.RefundRequestDto;
import tn.esprit.refundservice.dto.RefundResponseDto;
import tn.esprit.refundservice.service.RefundService;

import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/customer/refunds")
@CrossOrigin(origins = "*")
public class CustomerRefundController {

    @Autowired
    private RefundService refundService;

    /**
     * Customer requests a new refund
     * POST /api/customer/refunds
     */
    @PostMapping
    public ResponseEntity<RefundResponseDto> requestRefund(
            @RequestBody RefundRequestDto request,
            HttpServletRequest httpRequest) {
        try {
            // ✅ Extract customer ID from JWT token automatically
            String customerId = extractCustomerIdFromToken(httpRequest);
            request.setCustomerId(customerId);

            RefundResponseDto response = refundService.requestRefund(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Customer views all their refunds
     * GET /api/customer/refunds (no customer ID in URL!)
     */
    @GetMapping
    public ResponseEntity<List<RefundResponseDto>> getMyRefunds(HttpServletRequest request) {
        try {
            String customerId = extractCustomerIdFromToken(request);
            List<RefundResponseDto> refunds = refundService.getMyRefunds(customerId);
            return ResponseEntity.ok(refunds);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Customer views details of a specific refund
     * GET /api/customer/refunds/{refundId}/details (no customer ID in URL!)
     */
    @GetMapping("/{refundId}/details")
    public ResponseEntity<RefundResponseDto> getRefundDetails(
            @PathVariable Long refundId,
            HttpServletRequest request) {
        try {
            String customerId = extractCustomerIdFromToken(request);
            RefundResponseDto refund = refundService.getRefundDetails(refundId, customerId);
            return ResponseEntity.ok(refund);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Health check for customer service
     * GET /api/customer/refunds/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Customer Refund Service is running!");
    }

    // ✅ JWT Token extraction method
    private String extractCustomerIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header missing or invalid");
        }
        String token = authHeader.substring(7);
        return extractSubFromJWT(token);
    }

    private String extractSubFromJWT(String token) {
        try {
            String[] chunks = token.split("\\.");
            if (chunks.length != 3) {
                throw new RuntimeException("Invalid JWT token format");
            }
            Base64.Decoder decoder = Base64.getUrlDecoder();
            String payload = new String(decoder.decode(chunks[1]));
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(payload);
            String sub = jsonNode.get("sub").asText();
            if (sub == null || sub.isEmpty()) {
                throw new RuntimeException("User ID (sub) not found in token");
            }
            return sub;
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract user ID from token: " + e.getMessage());
        }
    }
}