package com.esprit.microservice.voucherservice.controller;

import com.esprit.microservice.voucherservice.dto.VoucherStatsDto;
import com.esprit.microservice.voucherservice.entity.Voucher;
import com.esprit.microservice.voucherservice.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/voucher")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @PostMapping
    public ResponseEntity<Voucher> createVoucher(@RequestBody Voucher voucher) {
        Voucher createdVoucher = voucherService.createVoucher(voucher);
        return new ResponseEntity<>(createdVoucher, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Voucher>> getAllVouchers() {
        List<Voucher> vouchers = voucherService.getAllVouchers();
        return ResponseEntity.ok(vouchers);
    }

    @GetMapping("/{code}")
    public ResponseEntity<Voucher> getVoucherByCode(@PathVariable String code) {
        return voucherService.getVoucherByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Voucher>> getActiveVouchers() {
        List<Voucher> activeVouchers = voucherService.getActiveVouchers();
        return ResponseEntity.ok(activeVouchers);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Voucher>> getVouchersByCategory(@PathVariable String category) {
        List<Voucher> vouchers = voucherService.getVouchersByCategory(category);
        return ResponseEntity.ok(vouchers);
    }

    @PutMapping("/{code}")
    public ResponseEntity<Voucher> updateVoucher(
            @PathVariable String code,
            @RequestBody Voucher voucherDetails) {
        try {
            Voucher updatedVoucher = voucherService.updateVoucher(code, voucherDetails);
            return ResponseEntity.ok(updatedVoucher);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable String code) {
        try {
            voucherService.deleteVoucher(code);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{code}/deactivate")
    public ResponseEntity<Voucher> deactivateVoucher(@PathVariable String code) {
        try {
            Voucher deactivatedVoucher = voucherService.deactivateVoucher(code);
            return ResponseEntity.ok(deactivatedVoucher);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<VoucherStatsDto> getVoucherStatistics() {
        VoucherStatsDto stats = voucherService.getVoucherStatistics();
        return ResponseEntity.ok(stats);
    }
}
