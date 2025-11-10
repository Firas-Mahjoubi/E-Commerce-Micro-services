package tn.esprit.refundservice.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import tn.esprit.refundservice.model.RefundStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefundResponseDto {
    Long refundId;
    String orderId;
    String customerId;
    BigDecimal refundAmount;
    String reason;
    LocalDateTime refundedAt;
    RefundStatus status;

    Boolean fullOrderRefund;  // Lombok will generate isFullOrderRefund() and setFullOrderRefund()
    List<String> productIds;
    String sellerId;
}