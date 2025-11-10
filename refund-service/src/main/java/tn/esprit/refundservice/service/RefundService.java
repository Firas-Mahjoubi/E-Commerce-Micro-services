package tn.esprit.refundservice.service;

import tn.esprit.refundservice.dto.RefundRequestDto;
import tn.esprit.refundservice.dto.RefundResponseDto;
import tn.esprit.refundservice.model.RefundStatus;

import java.util.List;

public interface RefundService {

    //CUSTOMER OPERATIONS
    RefundResponseDto requestRefund(RefundRequestDto request);
    List<RefundResponseDto> getMyRefunds(String customerId);
    RefundResponseDto getRefundDetails(Long refundId, String customerId);

    // SELLER OPERATIONS
    RefundResponseDto approveRefund(Long refundId, String sellerId);
    RefundResponseDto rejectRefund(Long refundId, String sellerId, String rejectionReason);
    List<RefundResponseDto> getPendingRefunds(String sellerId);
    List<RefundResponseDto> getRefundsByOrder(String orderId, String sellerId);

    // ADMIN OPERATIONS (optional)
    List<RefundResponseDto> getAllRefunds();
    RefundResponseDto updateRefundStatus(Long refundId, RefundStatus status);
}
