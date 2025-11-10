package tn.esprit.spring.shippingservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.spring.shippingservice.dto.CreateShippingRequest;
import tn.esprit.spring.shippingservice.dto.ShippingResponse;
import tn.esprit.spring.shippingservice.service.ShippingService;

import java.util.List;

@RestController
@RequestMapping("/api/shippings")
@CrossOrigin(origins = "*")
public class ShippingController {

    private final ShippingService shippingService;

    public ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @PostMapping
    public ResponseEntity<ShippingResponse> createShipping(@RequestBody CreateShippingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shippingService.createShipping(request));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ShippingResponse>> getShippingsByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(shippingService.getShippingsByCustomer(customerId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ShippingResponse> updateShippingStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(shippingService.updateShippingStatus(id, status));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Shipping Service is running!");
    }
}
