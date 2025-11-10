package com.esprit.microservice.voucherservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDto {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Boolean emailVerified;
}
