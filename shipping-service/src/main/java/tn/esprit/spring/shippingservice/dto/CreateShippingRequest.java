package tn.esprit.spring.shippingservice.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateShippingRequest {

    private Long orderId;

    private String customerId;

    private String address;

}
