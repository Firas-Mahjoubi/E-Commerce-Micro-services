FROM eclipse-temurin:17-jre-alpine
EXPOSE 8091
ADD target/inventory-service-0.0.1-SNAPSHOT.jar inventory-service.jar
ENTRYPOINT ["java", "-jar","inventory-service.jar"]