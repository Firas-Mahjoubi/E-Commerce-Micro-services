package com.esprit.microservice.productservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdatedEvent {
    private String productId;
    private String skuCode;
    private String name;
    private Integer quantity;
    private String action; // UPDATE or DELETE
}
