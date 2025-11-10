package com.esprit.microservice.voucherservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class FeignClientInterceptor implements RequestInterceptor {

    @Value("${internal.api.key:internal-service-secret-key-2024}")
    private String internalApiKey;

    @Override
    public void apply(RequestTemplate template) {
        // Add internal API key header for service-to-service communication
        template.header("X-Internal-API-Key", internalApiKey);
    }
}
