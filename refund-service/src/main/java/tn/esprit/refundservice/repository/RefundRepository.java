package tn.esprit.refundservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.refundservice.model.Refund;
import tn.esprit.refundservice.model.RefundStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    // Existing methods
    List<Refund> findByCustomerId(String customerId);
    List<Refund> findByOrderId(String orderId);
    List<Refund> findByStatus(RefundStatus status);
    List<Refund> findByCustomerIdAndStatus(String customerId, RefundStatus status);

    // ✅ NEW: Seller-specific methods for data isolation
    List<Refund> findBySellerIdAndStatus(String sellerId, RefundStatus status);
    List<Refund> findByOrderIdAndSellerId(String orderId, String sellerId);
    Optional<Refund> findByRefundIdAndSellerId(Long refundId, String sellerId);
    Optional<Refund> findByRefundIdAndCustomerId(Long refundId, String customerId);

    // ✅ NEW: Get all refunds for a specific seller
    List<Refund> findBySellerId(String sellerId);
}