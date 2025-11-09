export const environment = {
  production: false,
  apiUrl: '/api',  // Use proxy in development (Angular dev server will proxy to http://localhost:8090/api)
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
