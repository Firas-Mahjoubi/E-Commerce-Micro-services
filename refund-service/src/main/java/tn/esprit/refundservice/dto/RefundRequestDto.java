package tn.esprit.refundservice.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefundRequestDto {
    String orderId;
    String customerId;
    BigDecimal refundAmount;
    String reason;

    Boolean fullOrderRefund;  // Lombok will generate isFullOrderRefund() and setFullOrderRefund()
    List<String> productIds;


}