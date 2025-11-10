package tn.esprit.spring.shippingservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.spring.shippingservice.model.Shipping;

import java.util.List;

@Repository
public interface ShippingRepository extends JpaRepository<Shipping, Long> {
    List<Shipping> findByCustomerId(String customerId);
    List<Shipping> findByOrderId(Long orderId);
}
