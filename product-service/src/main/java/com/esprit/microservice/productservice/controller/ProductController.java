package com.esprit.microservice.productservice.controller;


import com.esprit.microservice.productservice.dto.ProductRequest;
import com.esprit.microservice.productservice.dto.ProductResponse;
import com.esprit.microservice.productservice.service.ProductService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // CREATE - Create a new product
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ProductResponse> createProduct(
            @RequestBody ProductRequest productRequest,
            HttpServletRequest request) {  // ✅ ADD HttpServletRequest parameter

        try {
            // ✅ Extract seller ID from JWT token
            String sellerId = extractSellerIdFromToken(request);
            productRequest.setSellerId(sellerId);

            ProductResponse response = productService.createProduct(productRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ ADD these JWT extraction methods
    private String extractSellerIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header missing or invalid");
        }
        String token = authHeader.substring(7);
        return extractSubFromJWT(token);
    }

    private String extractSubFromJWT(String token) {
        try {
            String[] chunks = token.split("\\.");
            if (chunks.length != 3) {
                throw new RuntimeException("Invalid JWT token format");
            }
            Base64.Decoder decoder = Base64.getUrlDecoder();
            String payload = new String(decoder.decode(chunks[1]));
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(payload);
            String sub = jsonNode.get("sub").asText();
            if (sub == null || sub.isEmpty()) {
                throw new RuntimeException("User ID (sub) not found in token");
            }
            return sub;
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract user ID from token: " + e.getMessage());
        }
    }

    // READ - Get all products
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ProductResponse>> getAllProducts(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");

            // ✅ No auth header = public access (all products for customers/catalog)
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("🌐 Public access - returning all products");
                return ResponseEntity.ok(productService.getAllProducts());
            }

            // ✅ Extract seller ID from token
            String sellerId = extractSellerIdFromToken(request);
            System.out.println("👤 Authenticated user - sellerId: " + sellerId);

            // ✅ Return only products that belong to this seller
            List<ProductResponse> sellerProducts = productService.getProductsBySeller(sellerId);
            System.out.println("📦 Found " + sellerProducts.size() + " products for seller: " + sellerId);

            return ResponseEntity.ok(sellerProducts);

        } catch (Exception e) {
            System.err.println("⚠️ Error in token processing, fallback to public access: " + e.getMessage());
            // Fallback to public access for any token issues
            return ResponseEntity.ok(productService.getAllProducts());
        }
    }

    // READ - Get product by ID
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<ProductResponse> getProductById(@PathVariable String id, HttpServletRequest request) {
        try {
            ProductResponse product = productService.getProductById(id);

            String authHeader = request.getHeader("Authorization");

            // ✅ No auth = public access (anyone can view individual products)
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.ok(product);
            }

            String sellerId = extractSellerIdFromToken(request);

            // ✅ If authenticated, seller can only view their own products
            if (!product.getSellerId().equals(sellerId)) {
                System.out.println("🚫 Access denied - Product belongs to seller: " + product.getSellerId() +
                        ", but requester is: " + sellerId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
            }

            System.out.println("✅ Access granted - Seller viewing their own product");
            return ResponseEntity.ok(product);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // READ - Get products by category
    @GetMapping("/category/{category}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    // READ - Search products by name
    @GetMapping("/search")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ProductResponse>> searchProductsByName(@RequestParam String name) {
        return ResponseEntity.ok(productService.searchProductsByName(name));
    }

    // UPDATE - Update product
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable String id,
            @RequestBody ProductRequest productRequest) {
        return ResponseEntity.ok(productService.updateProduct(id, productRequest));
    }

    // DELETE - Delete product
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // ADVANCED - Get active products only
    @GetMapping("/active")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ProductResponse>> getActiveProducts() {
        return ResponseEntity.ok(productService.getActiveProducts());
    }

    // ADVANCED - Get products by price range
    @GetMapping("/price-range")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ProductResponse>> getProductsByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        return ResponseEntity.ok(productService.getProductsByPriceRange(minPrice, maxPrice));
    }

    // ADVANCED - Get low stock products
    @GetMapping("/low-stock")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ProductResponse>> getLowStockProducts(
            @RequestParam(defaultValue = "10") Integer threshold) {
        return ResponseEntity.ok(productService.getLowStockProducts(threshold));
    }

    // SELLER - Get products by seller ID
    @GetMapping("/seller/{sellerId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ProductResponse>> getProductsBySeller(@PathVariable String sellerId) {
        return ResponseEntity.ok(productService.getProductsBySeller(sellerId));
    }
}
