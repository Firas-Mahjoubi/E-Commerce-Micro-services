package tn.esprit.refundservice.model;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Refund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long refundId;

    String orderId;
    String customerId;
    String reason;
    LocalDateTime refundedAt;

    @Enumerated(EnumType.STRING)
    RefundStatus status;

    @Column(precision = 10, scale = 2)
    BigDecimal refundAmount;

    @ElementCollection
    @CollectionTable(name = "refund_products")
    List<String> productIds;

    @Column
    Boolean fullOrderRefund;

    @Column(name = "seller_id", nullable = false)
    private String sellerId;
}