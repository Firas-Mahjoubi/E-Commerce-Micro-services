package com.esprit.microservice.inventoryservice.controller;


import com.esprit.microservice.inventoryservice.dto.InventoryRequest;
import com.esprit.microservice.inventoryservice.dto.InventoryResponse;
import com.esprit.microservice.inventoryservice.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // CHECK STOCK - Original endpoint (Used by Product Service via OpenFeign)
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<InventoryResponse>> isInStock(@RequestParam List<String> skuCode) {
        return ResponseEntity.ok(inventoryService.isInStock(skuCode));
    }

    // CREATE - Create new inventory
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<InventoryResponse> createInventory(@RequestBody InventoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.createInventory(request));
    }

    // READ - Get all inventory
    @GetMapping("/all")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<InventoryResponse>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    // READ - Get inventory by skuCode
    @GetMapping("/{skuCode}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<InventoryResponse> getInventoryBySkuCode(@PathVariable String skuCode) {
        return ResponseEntity.ok(inventoryService.getInventoryBySkuCode(skuCode));
    }

    // UPDATE - Update inventory
    @PutMapping("/{skuCode}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<InventoryResponse> updateInventory(
            @PathVariable String skuCode,
            @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.updateInventory(skuCode, request));
    }

    // DELETE - Delete inventory
    @DeleteMapping("/{skuCode}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteInventory(@PathVariable String skuCode) {
        inventoryService.deleteInventory(skuCode);
        return ResponseEntity.noContent().build();
    }

    // ADVANCED - Increase stock
    @PatchMapping("/{skuCode}/increase")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<InventoryResponse> increaseStock(
            @PathVariable String skuCode,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(inventoryService.increaseStock(skuCode, quantity));
    }

    // ADVANCED - Decrease stock
    @PatchMapping("/{skuCode}/decrease")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<InventoryResponse> decreaseStock(
            @PathVariable String skuCode,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(inventoryService.decreaseStock(skuCode, quantity));
    }

    // ADVANCED - Get low stock items
    @GetMapping("/low-stock")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<InventoryResponse>> getLowStockItems(
            @RequestParam(defaultValue = "10") Integer threshold) {
        return ResponseEntity.ok(inventoryService.getLowStockItems(threshold));
    }

    // ADVANCED - Get out of stock items
    @GetMapping("/out-of-stock")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<InventoryResponse>> getOutOfStockItems() {
        return ResponseEntity.ok(inventoryService.getOutOfStockItems());
    }
}
