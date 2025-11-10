package com.esprit.microservice.voucherservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomersResponse {
    private Integer count;
    private List<CustomerDto> customers;
}
