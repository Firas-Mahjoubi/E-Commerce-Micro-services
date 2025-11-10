FROM eclipse-temurin:17-jre-alpine
EXPOSE 8090
ADD target/api-gateway-0.0.1-SNAPSHOT.jar api-gateway.jar
ENTRYPOINT ["java", "-jar","api-gateway.jar"]