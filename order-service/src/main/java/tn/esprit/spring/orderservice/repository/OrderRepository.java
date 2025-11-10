package tn.esprit.spring.orderservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.spring.orderservice.entity.Order;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Trouver toutes les commandes d'un client
    List<Order> findByCustomerId(Long customerId);

    // Trouver les commandes par statut
    List<Order> findByStatus(String status);

    // Trouver les commandes d'un client avec un statut spécifique
    List<Order> findByCustomerIdAndStatus(Long customerId, String status);

    // Trouver une commande par ID et customer ID (pour la sécurité)
    Optional<Order> findByIdAndCustomerId(Long id, Long customerId);
}