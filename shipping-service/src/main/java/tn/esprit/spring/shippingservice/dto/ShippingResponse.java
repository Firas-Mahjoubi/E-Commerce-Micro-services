package tn.esprit.spring.shippingservice.dto;

import lombok.Getter;
import lombok.Setter;
import tn.esprit.spring.shippingservice.model.Shipping;

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

    // Constructeur vide (déjà fourni par Lombok si @NoArgsConstructor)
    public ShippingResponse() {}

    // Constructeur pour mapper directement depuis l'entité Shipping
    public ShippingResponse(Shipping shipping) {
        this.id = shipping.getId();
        this.orderId = shipping.getOrderId();
        this.customerId = shipping.getCustomerId();
        this.address = shipping.getAddress();
        this.status = shipping.getStatus();
        this.createdAt = shipping.getCreatedAt();
    }
}
