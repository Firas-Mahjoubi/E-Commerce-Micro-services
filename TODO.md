# Review-Service Development Plan

## Steps to Complete
- [x] Create review-service directory structure mirroring product-service
- [x] Set up pom.xml with dependencies (Spring Boot, MongoDB, Eureka client, Feign, Kafka)
- [x] Configure application.properties for Eureka, config-server, MongoDB
- [x] Create Review model (MongoDB document)
- [x] Create DTOs: ReviewRequest, ReviewResponse
- [x] Create ReviewRepository (MongoDB)
- [x] Create clients: UserClient (Feign for user-service), ProductClient (Feign for product-service)
- [x] Implement ReviewService with CRUD operations, validation via clients
- [x] Create ReviewController with REST endpoints
- [x] Add exception handling and logging
- [x] Create ReviewServiceApplication.java
- [x] Update config-server with review-service.properties if needed
- [ ] Build and run the service
- [ ] Test interactions with user-service and product-service
- [ ] Add to docker-compose.yml if needed
