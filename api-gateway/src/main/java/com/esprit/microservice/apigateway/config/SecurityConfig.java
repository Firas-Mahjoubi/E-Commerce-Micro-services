package com.esprit.microservice.apigateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}")
    private String issuerUri;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity serverHttpSecurity) {
        serverHttpSecurity
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange.pathMatchers("/eureka/**")
                        .permitAll()
                        .pathMatchers("/api/auth/**") // Allow unauthenticated access to auth endpoints
                        .permitAll()
                        .pathMatchers("/api/health/**") // Allow health check endpoints
                        .permitAll()
                        .pathMatchers("/api/product/**") // Allow public access to products
                        .permitAll()
                        .pathMatchers("/api/inventory/**") // Allow public access to inventory
                        .permitAll()
                        .pathMatchers("/api/voucher/**") // Allow public access to vouchers
                        .permitAll()
                        .anyExchange()
                        .authenticated())
                .oauth2ResourceServer(spec -> spec.jwt(Customizer.withDefaults()));
        return serverHttpSecurity.build();
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        // Provide a custom ReactiveJwtDecoder bean
        if (issuerUri != null && !issuerUri.trim().isEmpty()) {
            return NimbusReactiveJwtDecoder.withIssuerLocation(issuerUri).build();
        }
        // Return a no-op decoder when no issuer URI is configured
        return jwt -> {
            throw new IllegalStateException("JWT authentication is not configured. Please set spring.security.oauth2.resourceserver.jwt.issuer-uri");
        };
    }
}