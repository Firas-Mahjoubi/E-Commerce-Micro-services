export const environment = {
  production: true,
  apiUrl: 'http://localhost:8090/api',  // API Gateway URL in production
  eurekaUrl: 'http://localhost:8761',
  keycloakUrl: 'http://localhost:8080',
  keycloakRealm: 'Ecommerce',
  services: {
    userService: 'user-service',
    productService: 'product-service',
    orderService: 'order-service',
    inventoryService: 'inventory-service'
  }
};
