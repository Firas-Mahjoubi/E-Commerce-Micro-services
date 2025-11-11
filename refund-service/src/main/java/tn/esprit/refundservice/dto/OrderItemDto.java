package tn.esprit.refundservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDto {
    private Long id;
    private String productId; // MongoDB ObjectId from product-service
    private Integer quantity;
    private Double price;
    private Double totalPrice;
}
