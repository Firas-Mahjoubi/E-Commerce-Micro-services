package com.esprit.microservice.voucherservice.service;

import com.esprit.microservice.voucherservice.client.UserClient;
import com.esprit.microservice.voucherservice.dto.CustomersResponse;
import com.esprit.microservice.voucherservice.dto.VoucherStatsDto;
import com.esprit.microservice.voucherservice.entity.Voucher;
import com.esprit.microservice.voucherservice.repository.VoucherRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoucherService {

    private final VoucherRepo voucherRepo;
    private final UserClient userClient;
    private final EmailService emailService;

    @Transactional
    public Voucher createVoucher(Voucher voucher) {
        log.info("Creating new voucher with code: {}", voucher.getCode());
        voucher.setStartDate(LocalDateTime.now());
        voucher.setActive(true);
        Voucher savedVoucher = voucherRepo.save(voucher);
        log.info("Voucher created successfully with code: {}", savedVoucher.getCode());

        // Send email notifications to all customers asynchronously
        try {
            log.info("Fetching customers to send voucher notifications");
            CustomersResponse customersResponse = userClient.getAllCustomers();
            log.info("Found {} customers to notify", customersResponse.getCount());

            if (customersResponse.getCustomers() != null && !customersResponse.getCustomers().isEmpty()) {
                emailService.sendVoucherNotificationToCustomers(customersResponse.getCustomers(), savedVoucher);
            } else {
                log.warn("No customers found to send voucher notification");
            }
        } catch (Exception e) {
            log.error("Failed to send voucher notification emails: {}", e.getMessage(), e);
            // Don't fail voucher creation if email sending fails
        }

        return savedVoucher;
    }

    public List<Voucher> getAllVouchers() {
        log.info("Fetching all vouchers");
        return voucherRepo.findAll();
    }

    public Optional<Voucher> getVoucherByCode(String code) {
        log.info("Fetching voucher by code: {}", code);
        return voucherRepo.findByCode(code);
    }

    @Transactional
    public Voucher updateVoucher(String code, Voucher voucherDetails) {
        log.info("Updating voucher with code: {}", code);
        Voucher voucher = voucherRepo.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher not found with code: " + code));

        voucher.setDescription(voucherDetails.getDescription());
        voucher.setDiscountPercentage(voucherDetails.getDiscountPercentage());
        voucher.setStartDate(voucherDetails.getStartDate());
        voucher.setEndDate(voucherDetails.getEndDate());
        voucher.setActive(voucherDetails.getActive());
        voucher.setApplicableCategory(voucherDetails.getApplicableCategory());

        Voucher updatedVoucher = voucherRepo.save(voucher);
        log.info("Voucher updated successfully with code: {}", code);
        return updatedVoucher;
    }

    @Transactional
    public void deleteVoucher(String code) {
        log.info("Deleting voucher with code: {}", code);
        Voucher voucher = voucherRepo.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher not found with code: " + code));
        voucherRepo.delete(voucher);
        log.info("Voucher deleted successfully with code: {}", code);
    }

    @Transactional
    public Voucher deactivateVoucher(String code) {
        log.info("Deactivating voucher with code: {}", code);
        Voucher voucher = voucherRepo.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher not found with code: " + code));
        voucher.setActive(false);
        Voucher deactivatedVoucher = voucherRepo.save(voucher);
        log.info("Voucher deactivated successfully with code: {}", code);
        return deactivatedVoucher;
    }

    public List<Voucher> getActiveVouchers() {
        log.info("Fetching all active vouchers");
        return voucherRepo.findByActiveTrue();
    }

    public List<Voucher> getVouchersByCategory(String category) {
        log.info("Fetching vouchers by category: {}", category);
        return voucherRepo.findByApplicableCategory(category);
    }

    public VoucherStatsDto getVoucherStatistics() {
        log.info("Calculating voucher statistics");
        List<Voucher> allVouchers = voucherRepo.findAll();
        LocalDateTime now = LocalDateTime.now();

        long totalVouchers = allVouchers.size();
        long activeVouchers = allVouchers.stream()
                .filter(v -> v.getActive() &&
                        v.getEndDate().isAfter(now) &&
                        v.getStartDate().isBefore(now))
                .count();

        long inactiveVouchers = allVouchers.stream()
                .filter(v -> !v.getActive())
                .count();

        long expiredVouchers = allVouchers.stream()
                .filter(v -> v.getEndDate().isBefore(now))
                .count();

        long scheduledVouchers = allVouchers.stream()
                .filter(v -> v.getStartDate().isAfter(now))
                .count();

        return VoucherStatsDto.builder()
                .totalVouchers(totalVouchers)
                .activeVouchers(activeVouchers)
                .inactiveVouchers(inactiveVouchers)
                .expiredVouchers(expiredVouchers)
                .scheduledVouchers(scheduledVouchers)
                .build();
    }
}
