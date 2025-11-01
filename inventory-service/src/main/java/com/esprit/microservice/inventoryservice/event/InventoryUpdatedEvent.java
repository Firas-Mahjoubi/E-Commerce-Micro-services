package com.esprit.microservice.inventoryservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryUpdatedEvent {
    private String skuCode;
    private Integer quantity;
    private String action; // INCREASE or DECREASE
}
