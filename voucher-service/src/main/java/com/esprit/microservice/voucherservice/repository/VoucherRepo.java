package com.esprit.microservice.voucherservice.repository;

import com.esprit.microservice.voucherservice.entity.Voucher;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


@Repository
public interface VoucherRepo extends JpaRepository<Voucher,Long> {
    Optional<Voucher> findByCode(String code);

    List<Voucher> findByActiveTrue();

    List<Voucher> findByApplicableCategory(String category);
}
