package com.esprit.microservice.productservice.client;

import com.esprit.microservice.productservice.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "user-service", url = "${user.service.url:http://localhost:3000}")
public interface UserClient {
    
    @GetMapping("/api/users/{userId}/basic")
    UserResponse getUserById(
        @PathVariable("userId") String userId,
        @RequestHeader("Authorization") String token
    );
}
