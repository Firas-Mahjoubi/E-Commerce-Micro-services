# Kubernetes Deployment Guide

This directory contains Kubernetes configuration files for deploying the E-Commerce Microservices application.

## Architecture

The application consists of:
- **Infrastructure Services**: PostgreSQL, MySQL, MongoDB, Kafka, Zookeeper, Keycloak
- **Spring Cloud Services**: Eureka Server, Config Server, API Gateway
- **Business Services**: Product, Inventory, Order, Review, Refund, Voucher, User Services
- **Monitoring**: Zipkin, Kafka UI

## Prerequisites

1. Kubernetes cluster (Minikube, Kind, or cloud provider)
2. kubectl installed and configured
3. Docker images built and pushed to Docker Hub

## Deployment Order

### 1. Create Namespace
```bash
kubectl apply -f namespace.yaml
```

### 2. Deploy Databases
```bash
kubectl apply -f postgres-deployment.yaml
kubectl apply -f mysql-deployment.yaml
kubectl apply -f mongodb-deployment.yaml
```

### 3. Deploy Messaging Infrastructure
```bash
kubectl apply -f zookeeper-deployment.yaml
kubectl apply -f kafka-deployment.yaml
kubectl apply -f kafka-ui-deployment.yaml
```

### 4. Deploy Keycloak
```bash
kubectl apply -f keycloak-deployment.yaml
```

### 5. Deploy Monitoring
```bash
kubectl apply -f zipkin-deployment.yaml
```

### 6. Deploy Spring Cloud Services
```bash
kubectl apply -f eureka-server-deployment.yaml
# Wait for Eureka to be ready
kubectl wait --for=condition=ready pod -l app=eureka-server -n ecommerce --timeout=120s

kubectl apply -f config-server-deployment.yaml
# Wait for Config Server to be ready
kubectl wait --for=condition=ready pod -l app=config-server -n ecommerce --timeout=120s
```

### 7. Deploy API Gateway
```bash
kubectl apply -f api-gateway-deployment.yaml
```

### 8. Deploy Business Services
```bash
kubectl apply -f user-service-deployment.yaml
kubectl apply -f product-service-deployment.yaml
kubectl apply -f inventory-service-deployment.yaml
kubectl apply -f order-service-deployment.yaml
kubectl apply -f review-service-deployment.yaml
kubectl apply -f refund-service-deployment.yaml
kubectl apply -f voucher-service-deployment.yaml
```

## Quick Deploy All
```bash
# Deploy everything in order
kubectl apply -f namespace.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f mysql-deployment.yaml
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f zookeeper-deployment.yaml
kubectl apply -f kafka-deployment.yaml
kubectl apply -f kafka-ui-deployment.yaml
kubectl apply -f keycloak-deployment.yaml
kubectl apply -f zipkin-deployment.yaml
kubectl apply -f eureka-server-deployment.yaml

# Wait for Eureka
sleep 30

kubectl apply -f config-server-deployment.yaml

# Wait for Config Server
sleep 20

kubectl apply -f api-gateway-deployment.yaml
kubectl apply -f user-service-deployment.yaml
kubectl apply -f product-service-deployment.yaml
kubectl apply -f inventory-service-deployment.yaml
kubectl apply -f order-service-deployment.yaml
kubectl apply -f review-service-deployment.yaml
kubectl apply -f refund-service-deployment.yaml
kubectl apply -f voucher-service-deployment.yaml
```

## Verification

Check all pods are running:
```bash
kubectl get pods -n ecommerce
```

Check all services:
```bash
kubectl get svc -n ecommerce
```

## Accessing Services

### Using LoadBalancer (Cloud Provider)
Services exposed via LoadBalancer will have external IPs assigned automatically.

### Using Minikube
```bash
# Get service URLs
minikube service api-gateway -n ecommerce --url
minikube service eureka-server -n ecommerce --url
minikube service keycloak -n ecommerce --url
minikube service zipkin -n ecommerce --url
minikube service kafka-ui -n ecommerce --url
```

### Using Port Forwarding
```bash
# API Gateway
kubectl port-forward -n ecommerce svc/api-gateway 8090:8090

# Eureka Server
kubectl port-forward -n ecommerce svc/eureka-server 8761:8761

# Keycloak
kubectl port-forward -n ecommerce svc/keycloak 8080:8080

# Zipkin
kubectl port-forward -n ecommerce svc/zipkin 9411:9411

# Kafka UI
kubectl port-forward -n ecommerce svc/kafka-ui 8081:8080
```

## Scaling Services

Scale a specific service:
```bash
kubectl scale deployment product-service -n ecommerce --replicas=3
```

## Updating Services

Update a service with a new image:
```bash
kubectl set image deployment/product-service product-service=firasmahjoubi/product-service:v2 -n ecommerce
```

## Monitoring

View logs:
```bash
kubectl logs -f deployment/product-service -n ecommerce
```

View resource usage:
```bash
kubectl top pods -n ecommerce
kubectl top nodes
```

## Troubleshooting

Check pod status:
```bash
kubectl describe pod <pod-name> -n ecommerce
```

Check events:
```bash
kubectl get events -n ecommerce --sort-by='.lastTimestamp'
```

## Cleanup

Delete all resources:
```bash
kubectl delete namespace ecommerce
```

Or delete specific deployments:
```bash
kubectl delete -f <filename>.yaml
```

## Configuration Notes

1. **Secrets**: Update the base64 encoded secrets in the YAML files with your actual credentials
2. **Email Configuration**: Add your email credentials to `product-service-secret`
3. **Persistent Volumes**: Ensure your cluster supports dynamic volume provisioning or create PVs manually
4. **Resource Limits**: Add resource limits and requests based on your cluster capacity
5. **Ingress**: Consider adding an Ingress controller for production deployments

## Production Considerations

1. Use proper secrets management (Sealed Secrets, External Secrets Operator)
2. Implement proper backup strategies for databases
3. Add resource limits and requests
4. Configure HPA (Horizontal Pod Autoscaler)
5. Use Ingress for external access
6. Implement network policies
7. Use monitoring solutions (Prometheus, Grafana)
8. Configure proper logging (EFK stack)
