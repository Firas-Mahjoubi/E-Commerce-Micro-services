package com.esprit.microservice.voucherservice.client;

import com.esprit.microservice.voucherservice.dto.CustomerDto;
import com.esprit.microservice.voucherservice.dto.CustomersResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "user-service", path = "/api/users")
public interface UserClient {

    @GetMapping("/customers/all")
    CustomersResponse getAllCustomers();
}
