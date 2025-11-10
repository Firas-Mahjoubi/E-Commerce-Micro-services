package tn.esprit.spring.shippingservice.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.spring.shippingservice.dto.CreateShippingRequest;
import tn.esprit.spring.shippingservice.dto.ShippingResponse;
import tn.esprit.spring.shippingservice.model.Shipping;
import tn.esprit.spring.shippingservice.repository.ShippingRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ShippingService {

    private final ShippingRepository shippingRepository;

    public ShippingService(ShippingRepository shippingRepository) {
        this.shippingRepository = shippingRepository;
    }

    public ShippingResponse createShipping(CreateShippingRequest request) {
        Shipping shipping = new Shipping();
        shipping.setOrderId(request.getOrderId());
        shipping.setCustomerId(request.getCustomerId());
        shipping.setAddress(request.getAddress());

        Shipping saved = shippingRepository.save(shipping);
        return mapToResponse(saved);
    }

    public List<ShippingResponse> getShippingsByCustomer(String customerId) {
        return shippingRepository.findByCustomerId(customerId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ShippingResponse updateShippingStatus(Long id, String status) {
        Shipping shipping = shippingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipping not found"));
        shipping.setStatus(status);
        return mapToResponse(shippingRepository.save(shipping));
    }

    private ShippingResponse mapToResponse(Shipping shipping) {
        ShippingResponse response = new ShippingResponse();
        response.setId(shipping.getId());
        response.setOrderId(shipping.getOrderId());
        response.setCustomerId(shipping.getCustomerId());
        response.setAddress(shipping.getAddress());
        response.setStatus(shipping.getStatus());
        response.setCreatedAt(shipping.getCreatedAt());
        return response;
    }
}
