package com.esprit.microservice.voucherservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Id;

import java.time.LocalDateTime;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity

public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    String code; // e.g., "SAVE10"
    String description;
    Double discountPercentage; // e.g., 10.0
    LocalDateTime startDate;
    LocalDateTime endDate;
    Boolean active;
    String applicableCategory;
}
