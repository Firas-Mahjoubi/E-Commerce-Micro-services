package tn.esprit.refundservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import tn.esprit.refundservice.dto.ProductDto;

import java.util.List;

/**
 * Feign Client for Product Service
 * Enables refund-service to communicate with product-service via REST API calls
 */
@FeignClient(name = "product-service", url = "${product.service.url}")
public interface ProductClient {

    /**
     * Get all products
     * 
     * @return list of all products
     */
    @GetMapping("/api/product")
    ResponseEntity<List<ProductDto>> getAllProducts();

    /**
     * Get product by ID
     * 
     * @param id the product ID
     * @return product details
     */
    @GetMapping("/api/product/{id}")
    ResponseEntity<ProductDto> getProductById(@PathVariable("id") String id);

    /**
     * Get products by category
     * 
     * @param category the category name
     * @return list of products in category
     */
    @GetMapping("/api/product/category/{category}")
    ResponseEntity<List<ProductDto>> getProductsByCategory(@PathVariable("category") String category);

    /**
     * Search products by name
     * 
     * @param name search term
     * @return list of matching products
     */
    @GetMapping("/api/product/search")
    ResponseEntity<List<ProductDto>> searchProductsByName(@RequestParam("name") String name);

    /**
     * Get products by seller ID
     * 
     * @param sellerId the seller ID
     * @return list of seller's products
     */
    @GetMapping("/api/product/seller/{sellerId}")
    ResponseEntity<List<ProductDto>> getProductsBySeller(@PathVariable("sellerId") String sellerId);

    /**
     * Get active products only
     * 
     * @return list of active products
     */
    @GetMapping("/api/product/active")
    ResponseEntity<List<ProductDto>> getActiveProducts();

    /**
     * Get products by price range
     * 
     * @param minPrice minimum price
     * @param maxPrice maximum price
     * @return list of products in price range
     */
    @GetMapping("/api/product/price-range")
    ResponseEntity<List<ProductDto>> getProductsByPriceRange(
            @RequestParam("minPrice") Double minPrice,
            @RequestParam("maxPrice") Double maxPrice);
}
