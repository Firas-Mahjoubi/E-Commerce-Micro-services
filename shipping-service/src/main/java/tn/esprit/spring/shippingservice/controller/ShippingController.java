package tn.esprit.spring.shippingservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.spring.shippingservice.dto.CreateShippingRequest;
import tn.esprit.spring.shippingservice.dto.ShippingResponse;
import tn.esprit.spring.shippingservice.model.Shipping;
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
    @GetMapping("/getall")
    public ResponseEntity<List<ShippingResponse>> getAllShippings() {
        List<ShippingResponse> shippings = shippingService.getAllShippings();
        return ResponseEntity.ok(shippings);
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
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShipping(@PathVariable Long id) {
        try {
            shippingService.deleteShipping(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/search")
    public ResponseEntity<List<ShippingResponse>> searchShippings(
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(shippingService.searchShippings(address, status));
    }
    @GetMapping("/sorted")
    public ResponseEntity<List<ShippingResponse>> getSortedShippings(@RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(shippingService.getAllShippingsSorted(sortBy));
    }

}
