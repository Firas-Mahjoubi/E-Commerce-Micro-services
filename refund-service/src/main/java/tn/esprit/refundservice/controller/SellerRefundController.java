package tn.esprit.refundservice.controller;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.refundservice.dto.RefundResponseDto;
import tn.esprit.refundservice.model.RefundStatus;
import tn.esprit.refundservice.service.RefundService;

import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/seller/refunds")
@CrossOrigin(origins = "*")
public class SellerRefundController {

    @Autowired
    private RefundService refundService;

    /**
     * Seller approves a refund request
     * PUT /api/seller/refunds/{refundId}/approve (no seller ID in URL!)
     */
    @PutMapping("/{refundId}/approve")
    public ResponseEntity<RefundResponseDto> approveRefund(
            @PathVariable Long refundId,
            HttpServletRequest request) {
        try {
            String sellerId = extractSellerIdFromToken(request);
            RefundResponseDto response = refundService.approveRefund(refundId, sellerId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Seller rejects a refund request with reason
     * PUT /api/seller/refunds/{refundId}/reject (no seller ID in URL!)
     */
    @PutMapping("/{refundId}/reject")
    public ResponseEntity<RefundResponseDto> rejectRefund(
            @PathVariable Long refundId,
            @RequestParam String rejectionReason,
            HttpServletRequest request) {
        try {
            String sellerId = extractSellerIdFromToken(request);
            RefundResponseDto response = refundService.rejectRefund(refundId, sellerId, rejectionReason);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Seller views all pending refunds awaiting their review
     * GET /api/seller/refunds/pending (no seller ID in URL!)
     */
    @GetMapping("/pending")
    public ResponseEntity<List<RefundResponseDto>> getPendingRefunds(HttpServletRequest request) {
        try {
            String sellerId = extractSellerIdFromToken(request);
            List<RefundResponseDto> pendingRefunds = refundService.getPendingRefunds(sellerId);
            return ResponseEntity.ok(pendingRefunds);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Seller views all refunds for a specific order
     * GET /api/seller/refunds/order/{orderId} (no seller ID in URL!)
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<RefundResponseDto>> getRefundsByOrder(
            @PathVariable String orderId,
            HttpServletRequest request) {
        try {
            String sellerId = extractSellerIdFromToken(request);
            List<RefundResponseDto> orderRefunds = refundService.getRefundsByOrder(orderId, sellerId);
            return ResponseEntity.ok(orderRefunds);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Seller manually updates refund status (if allowed)
     * PUT /api/seller/refunds/{refundId}/status (no seller ID in URL!)
     */
    @PutMapping("/{refundId}/status")
    public ResponseEntity<RefundResponseDto> updateRefundStatus(
            @PathVariable Long refundId,
            @RequestParam RefundStatus status,
            HttpServletRequest request) {
        try {
            String sellerId = extractSellerIdFromToken(request);
            RefundResponseDto response = refundService.updateRefundStatus(refundId, status);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Health check for seller service
     * GET /api/seller/refunds/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Seller Refund Service is running!");
    }

    // ✅ JWT Token extraction method
    private String extractSellerIdFromToken(HttpServletRequest request) {
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