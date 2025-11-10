package tn.esprit.refundservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.refundservice.dto.RefundRequestDto;
import tn.esprit.refundservice.dto.RefundResponseDto;
import tn.esprit.refundservice.model.Refund;
import tn.esprit.refundservice.model.RefundStatus;
import tn.esprit.refundservice.repository.RefundRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class RefundServiceImpl implements RefundService {

    @Autowired
    private RefundRepository refundRepository;


    // ============================================
    // CUSTOMER OPERATIONS
    // ============================================

    /**
     * Customer requests a new refund
     */
    @Override
    public RefundResponseDto requestRefund(RefundRequestDto request) {
        // Validate full vs partial refund logic
        if (request.getFullOrderRefund() != null && request.getFullOrderRefund()) {
            if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
                throw new RuntimeException("For full order refunds, do not specify product IDs");
            }
        } else {
            if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
                throw new RuntimeException("For partial refunds, product IDs are required");
            }
        }

        // ✅ NEW: Determine seller from products
        String sellerId = determineSeller(request);

        Refund refund = new Refund();
        refund.setOrderId(request.getOrderId());
        refund.setCustomerId(request.getCustomerId());
        refund.setSellerId(sellerId); // ✅ ADD: Set seller ID
        refund.setRefundAmount(request.getRefundAmount());
        refund.setReason(request.getReason());
        refund.setFullOrderRefund(request.getFullOrderRefund());

        if (request.getFullOrderRefund() == null || !request.getFullOrderRefund()) {
            refund.setProductIds(request.getProductIds());
        }

        refund.setStatus(RefundStatus.PENDING);
        refund.setRefundedAt(LocalDateTime.now());

        Refund savedRefund = refundRepository.save(refund);
        return convertToDto(savedRefund);
    }

    /**
     * ✅ NEW: Simple seller determination for testing
     */
    private String determineSeller(RefundRequestDto request) {
        // For testing: assign based on product patterns
        if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
            String firstProductId = request.getProductIds().get(0);

            // Map your test products to your seller ID
            if (firstProductId.equals("690fc57351a0a607a5fea978")) { // seller_test1
                return "bd75d07b-8fb7-4e67-b458-d53704a64ba5"; // Your seller ID (nabil-kh11)
            }
            if (firstProductId.equals("690f32a1b36e62438db08f40")) { // glasses
                return "bd75d07b-8fb7-4e67-b458-d53704a64ba5"; // Your seller ID
            }
            if (firstProductId.equals("690f32fbb36e62438db08f41")) { // lunette
                return "bd75d07b-8fb7-4e67-b458-d53704a64ba5"; // Your seller ID
            }
            if (firstProductId.equals("690fc18151a0a607a5fea976")) { // support
                return "bd75d07b-8fb7-4e67-b458-d53704a64ba5"; // Your seller ID
            }
        }

        // Default: assign to your seller ID for testing
        return "bd75d07b-8fb7-4e67-b458-d53704a64ba5";
    }

    /**
     * Customer views all their refunds
     */
    @Override
    public List<RefundResponseDto> getMyRefunds(String customerId) {
        List<Refund> refunds = refundRepository.findByCustomerId(customerId);
        return refunds.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Customer views details of a specific refund
     */
    @Override
    public RefundResponseDto getRefundDetails(Long refundId, String customerId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));

        // Security check: ensure refund belongs to customer
        if (!refund.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Access denied");
        }

        return convertToDto(refund);
    }

    // ============================================
    // SELLER OPERATIONS - ✅ NOW WITH SECURITY
    // ============================================

    /**
     * Seller approves a refund request
     */
    @Override
    public RefundResponseDto approveRefund(Long refundId, String sellerId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));

        // ✅ SECURITY: Validate seller owns this refund
        if (!refund.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Access denied: This refund doesn't belong to you");
        }

        refund.setStatus(RefundStatus.APPROVED);
        Refund savedRefund = refundRepository.save(refund);
        return convertToDto(savedRefund);
    }

    /**
     * Seller rejects a refund request with reason
     */
    @Override
    public RefundResponseDto rejectRefund(Long refundId, String sellerId, String rejectionReason) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));

        // ✅ SECURITY: Validate seller owns this refund
        if (!refund.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Access denied: This refund doesn't belong to you");
        }

        refund.setStatus(RefundStatus.REJECTED);
        refund.setReason(refund.getReason() + " | REJECTED: " + rejectionReason);
        Refund savedRefund = refundRepository.save(refund);
        return convertToDto(savedRefund);
    }

    /**
     * Seller views all pending refunds awaiting their review
     */
    @Override
    public List<RefundResponseDto> getPendingRefunds(String sellerId) {
        // ✅ FIXED: Filter by seller ID - CRITICAL for data isolation
        List<Refund> refunds = refundRepository.findBySellerIdAndStatus(sellerId, RefundStatus.PENDING);
        return refunds.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Seller views all refunds for a specific order
     */
    @Override
    public List<RefundResponseDto> getRefundsByOrder(String orderId, String sellerId) {
        // ✅ FIXED: Validate seller owns this order
        List<Refund> refunds = refundRepository.findByOrderIdAndSellerId(orderId, sellerId);
        return refunds.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    // ============================================
    // ADMIN OPERATIONS
    // ============================================

    /**
     * Admin views all refunds in the system
     */
    @Override
    public List<RefundResponseDto> getAllRefunds() {
        List<Refund> refunds = refundRepository.findAll();
        return refunds.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Admin manually updates refund status
     */
    @Override
    public RefundResponseDto updateRefundStatus(Long refundId, RefundStatus status) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));

        refund.setStatus(status);
        Refund savedRefund = refundRepository.save(refund);
        return convertToDto(savedRefund);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Converts Refund entity to RefundResponseDto
     */
    private RefundResponseDto convertToDto(Refund refund) {
        RefundResponseDto dto = new RefundResponseDto();
        dto.setRefundId(refund.getRefundId());
        dto.setOrderId(refund.getOrderId());
        dto.setCustomerId(refund.getCustomerId());
        dto.setSellerId(refund.getSellerId()); // ✅ ADD: Include seller ID in response
        dto.setRefundAmount(refund.getRefundAmount());
        dto.setReason(refund.getReason());
        dto.setRefundedAt(refund.getRefundedAt());
        dto.setStatus(refund.getStatus());
        dto.setFullOrderRefund(refund.getFullOrderRefund());
        dto.setProductIds(refund.getProductIds());
        return dto;
    }
}