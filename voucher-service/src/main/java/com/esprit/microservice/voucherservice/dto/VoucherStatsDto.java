package com.esprit.microservice.voucherservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherStatsDto {
    private Long totalVouchers;
    private Long activeVouchers;
    private Long inactiveVouchers;
    private Long expiredVouchers;
    private Long scheduledVouchers;
}
