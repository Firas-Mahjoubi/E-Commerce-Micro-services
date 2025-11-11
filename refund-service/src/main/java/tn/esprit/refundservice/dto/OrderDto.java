package tn.esprit.refundservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDto {
    private Long id;
    private String customerId;
    private LocalDateTime orderDate;
    private Double totalAmount;
    private String status;
    private List<OrderItemDto> items;
}
