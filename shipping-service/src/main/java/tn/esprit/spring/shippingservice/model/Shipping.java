package tn.esprit.spring.shippingservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "shippings")
@Getter
@Setter
public class Shipping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private String customerId;
    private String address;
    private String status;
    private LocalDateTime createdAt;

    public Shipping() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
    }
}
