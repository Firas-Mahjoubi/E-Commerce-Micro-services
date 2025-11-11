package tn.esprit.refundservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Allow credentials
        config.setAllowCredentials(true);

        // Allow Angular frontend origin
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:4200",
                "http://localhost:4201"));

        // Allow all headers
        config.addAllowedHeader("*");

        // Allow all HTTP methods
        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Expose authorization header
        config.setExposedHeaders(Arrays.asList("Authorization"));

        // Apply CORS configuration to all endpoints
        source.registerCorsConfiguration("/api/**", config);

        return new CorsFilter(source);
    }
}
