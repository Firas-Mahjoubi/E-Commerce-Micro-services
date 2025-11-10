# E-Commerce Microservices - Docker Deployment

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- At least 8GB RAM allocated to Docker
- Ports available: 3000, 3306, 5432, 8080, 8081, 8090, 8091, 8092, 8761, 8888, 9092, 9411, 27017

### 1. Setup Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and update with your credentials:
```bash
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
```

### 2. Build All Services

```bash
# Build all Docker images
docker-compose build
```

### 3. Start All Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f product-service
```

### 4. Verify Services

Wait 2-3 minutes for all services to start, then check:

| Service | URL | Status |
|---------|-----|--------|
| Eureka Server | http://localhost:8761 | All services registered |
| Config Server | http://localhost:8888/actuator/health | UP |
| API Gateway | http://localhost:8090/actuator/health | UP |
| User Service | http://localhost:3000/api/health | OK |
| Product Service | http://localhost:8092/actuator/health | UP |
| Inventory Service | http://localhost:8091/actuator/health | UP |
| Keycloak | http://localhost:8080 | admin/admin |
| Kafka UI | http://localhost:8081 | Dashboard |
| Zipkin | http://localhost:9411 | Traces |

## 📦 Services Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (8090)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │  User   │   │ Product │   │Inventory│
   │ Service │   │ Service │   │ Service │
   │  :3000  │   │  :8092  │   │  :8091  │
   └────┬────┘   └────┬────┘   └────┬────┘
        │             │              │
   ┌────▼────┐   ┌───▼────┐   ┌────▼────┐
   │Postgres │   │ MongoDB │   │  MySQL  │
   │  :5432  │   │ :27017  │   │  :3306  │
   └─────────┘   └─────────┘   └─────────┘

   ┌──────────────────────────────────────┐
   │  Keycloak (Auth) - :8080             │
   │  Eureka (Discovery) - :8761          │
   │  Config Server - :8888               │
   │  Kafka + Zookeeper - :9092, :2181    │
   │  Zipkin (Tracing) - :9411            │
   │  Kafka UI - :8081                    │
   └──────────────────────────────────────┘
```

## 🛠️ Service Details

### Infrastructure Services

#### **Eureka Server** (Service Discovery)
- **Port**: 8761
- **Image**: `firasmahjoubi/eureka-server:latest`
- **Purpose**: Service registration and discovery
- **Dashboard**: http://localhost:8761

#### **Config Server** (Configuration Management)
- **Port**: 8888
- **Image**: `firasmahjoubi/configserver:latest`
- **Purpose**: Centralized configuration
- **Health**: http://localhost:8888/actuator/health

#### **API Gateway** (Entry Point)
- **Port**: 8090
- **Image**: `firasmahjoubi/api-gateway:latest`
- **Purpose**: Single entry point, routing, load balancing
- **Routes**: All requests through /api/*

#### **Keycloak** (Authentication & Authorization)
- **Port**: 8080
- **Image**: `quay.io/keycloak/keycloak:23.0.0`
- **Credentials**: admin/admin
- **Purpose**: OAuth2, JWT tokens, user management
- **Database**: PostgreSQL

#### **Kafka** (Message Broker)
- **Ports**: 9092 (external), 29092 (internal)
- **Image**: `confluentinc/cp-kafka:7.0.1`
- **Purpose**: Event streaming, async communication
- **UI**: http://localhost:8081

#### **Zipkin** (Distributed Tracing)
- **Port**: 9411
- **Image**: `openzipkin/zipkin:latest`
- **Purpose**: Track requests across microservices
- **Dashboard**: http://localhost:9411

### Business Services

#### **User Service** (Node.js)
- **Port**: 3000
- **Image**: `firasmahjoubi/user-service:latest`
- **Technology**: Node.js, Express, Sequelize
- **Database**: PostgreSQL (shared with Keycloak)
- **Purpose**: User management, authentication integration

#### **Product Service** (Spring Boot)
- **Port**: 8092
- **Image**: `firasmahjoubi/product-service:latest`
- **Technology**: Spring Boot, MongoDB
- **Database**: MongoDB
- **Features**: Product CRUD, Email notifications, Kafka events

#### **Inventory Service** (Spring Boot)
- **Port**: 8091
- **Image**: `firasmahjoubi/inventory-service:latest`
- **Technology**: Spring Boot, JPA, MySQL
- **Database**: MySQL
- **Purpose**: Stock management, inventory tracking

### Databases

#### **PostgreSQL** (Keycloak + User Service)
- **Port**: 5432
- **Credentials**: keycloak/password
- **Database**: keycloak

#### **MongoDB** (Product Service)
- **Port**: 27017
- **Database**: product-service

#### **MySQL** (Inventory Service)
- **Port**: 3306
- **Credentials**: inventory/inventory123
- **Database**: inventory_db

## 📋 Common Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d product-service

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart a service
docker-compose restart product-service
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f product-service

# Last 100 lines
docker-compose logs --tail=100 product-service
```

### Service Status

```bash
# List running containers
docker-compose ps

# Check specific service
docker-compose ps product-service

# View resource usage
docker stats
```

### Rebuild Services

```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build product-service

# Rebuild without cache
docker-compose build --no-cache product-service

# Rebuild and restart
docker-compose up -d --build product-service
```

### Database Access

```bash
# PostgreSQL
docker exec -it postgres psql -U keycloak -d keycloak

# MongoDB
docker exec -it mongo mongosh product-service

# MySQL
docker exec -it mysql mysql -u inventory -pinventory123 inventory_db
```

### Cleanup

```bash
# Remove stopped containers
docker-compose rm

# Remove all (containers, networks, volumes)
docker-compose down -v

# Remove unused images
docker image prune -a

# Complete cleanup
docker system prune -a --volumes
```

## 🔧 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs service-name

# Check if port is in use
netstat -ano | findstr :PORT  # Windows
lsof -i :PORT                 # Linux/Mac

# Restart service
docker-compose restart service-name
```

### Service Can't Connect to Database

```bash
# Ensure database is running
docker-compose ps postgres

# Check network
docker network inspect ecommerce-net

# Restart both services
docker-compose restart postgres product-service
```

### Out of Memory

```bash
# Check resource usage
docker stats

# Increase Docker memory in Docker Desktop settings
# Recommended: At least 8GB RAM
```

### Config Server Not Found

```bash
# Ensure config-server started before other services
docker-compose up -d configserver
sleep 30
docker-compose up -d product-service inventory-service
```

### Eureka Registration Failed

```bash
# Ensure eureka-server is running
docker-compose ps eureka-server

# Check eureka logs
docker-compose logs eureka-server

# Restart services in order
docker-compose restart eureka-server
sleep 20
docker-compose restart api-gateway product-service
```

## 🔐 Security Notes

1. **Change Default Passwords** in production:
   - Keycloak admin password
   - Database passwords
   - Keycloak client secrets

2. **Email Configuration**:
   - Use Gmail App Password (not regular password)
   - Generate at: https://myaccount.google.com/apppasswords
   - Add to `.env` file

3. **Environment Variables**:
   - Never commit `.env` to git
   - Use secrets management in production
   - Different `.env` for each environment

## 📊 Monitoring

### Health Checks

```bash
# Check all services health
curl http://localhost:8761  # Eureka dashboard
curl http://localhost:8888/actuator/health  # Config Server
curl http://localhost:8090/actuator/health  # API Gateway
curl http://localhost:3000/api/health       # User Service
curl http://localhost:8092/actuator/health  # Product Service
curl http://localhost:8091/actuator/health  # Inventory Service
```

### View Traces

Visit http://localhost:9411 to see distributed traces across microservices

### Kafka Messages

Visit http://localhost:8081 to monitor Kafka topics and messages

## 🚀 Production Deployment

For production deployment, consider:

1. **Use Kubernetes** instead of docker-compose
2. **External Configuration**: Use Spring Cloud Config with Git
3. **Service Mesh**: Implement Istio or Linkerd
4. **Load Balancing**: Use NGINX or cloud load balancer
5. **Monitoring**: Add Prometheus + Grafana
6. **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
7. **Secrets**: Use Kubernetes Secrets or HashiCorp Vault
8. **CI/CD**: GitHub Actions, Jenkins, or GitLab CI
9. **Auto-scaling**: Horizontal Pod Autoscaler
10. **Backup**: Regular database backups

## 📝 Development Workflow

### 1. Make Changes to Service

```bash
# Edit code in your service directory
cd product-service
# Make changes...
```

### 2. Rebuild Service

```bash
# For Java services
cd product-service
./mvnw clean package -DskipTests

# For Node.js service
cd user-service
npm install
```

### 3. Rebuild Docker Image

```bash
# From project root
docker-compose build product-service
```

### 4. Restart Service

```bash
docker-compose up -d product-service
docker-compose logs -f product-service
```

## 🎯 Startup Order

Services start in this order:

1. **Infrastructure**: PostgreSQL, MySQL, MongoDB
2. **Keycloak**: Authentication server
3. **Service Discovery**: Eureka Server
4. **Configuration**: Config Server
5. **Messaging**: Zookeeper → Kafka
6. **Tracing**: Zipkin
7. **Gateway**: API Gateway
8. **Business Services**: User, Product, Inventory services

Wait 2-3 minutes after `docker-compose up -d` for all services to fully start.

## 📧 Support

For issues or questions:
- Check logs: `docker-compose logs -f service-name`
- Review environment variables in `.env`
- Ensure all ports are available
- Verify Docker has enough resources (8GB+ RAM)

---

**Happy Coding! 🎉**
