FROM eclipse-temurin:17-jre-alpine
EXPOSE 8092
ADD target/product-service-0.0.1-SNAPSHOT.jar product-service.jar
ENTRYPOINT ["java", "-jar","product-service.jar"]