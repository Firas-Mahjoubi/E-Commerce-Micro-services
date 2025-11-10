package tn.esprit.spring.shippingservice.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ShippingResponse {
    private Long id;
    private Long orderId;
    private String customerId;
    private String address;
    private String status;
    private LocalDateTime createdAt;
}
