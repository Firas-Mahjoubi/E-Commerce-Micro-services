package com.esprit.microservice.productservice.repository;

import com.esprit.microservice.productservice.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, String> {
}
