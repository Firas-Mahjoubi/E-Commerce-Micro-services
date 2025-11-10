# Order Service - API Documentation

## Description

Service de gestion des commandes pour l'application e-commerce microservices.

## Fonctionnalités

- ✅ Création de commandes
- ✅ Consultation des commandes par client
- ✅ Mise à jour du statut des commandes
- ✅ Annulation des commandes
- ✅ Gestion des items de commande avec calcul automatique

## APIs Disponibles

### 1. Créer une nouvelle commande

**POST** `/api/orders`

```json
{
  "customerId": 1,
  "items": [
    {
      "productId": 101,
      "quantity": 2,
      "price": 25.99
    },
    {
      "productId": 102,
      "quantity": 1,
      "price": 15.5
    }
  ]
}
```

**Réponse:**

```json
{
  "id": 1,
  "customerId": 1,
  "orderDate": "2025-11-10T13:45:00",
  "totalAmount": 67.48,
  "status": "PENDING",
  "items": [
    {
      "id": 1,
      "productId": 101,
      "quantity": 2,
      "price": 25.99,
      "totalPrice": 51.98
    },
    {
      "id": 2,
      "productId": 102,
      "quantity": 1,
      "price": 15.5,
      "totalPrice": 15.5
    }
  ]
}
```

### 2. Récupérer toutes les commandes d'un client

**GET** `/api/orders/customer/{customerId}`

### 3. Récupérer une commande par ID

**GET** `/api/orders/{orderId}`

### 4. Récupérer une commande par ID pour un client spécifique

**GET** `/api/orders/{orderId}/customer/{customerId}`

### 5. Mettre à jour le statut d'une commande

**PUT** `/api/orders/{orderId}/status?status=CONFIRMED`

### 6. Annuler une commande

**PUT** `/api/orders/{orderId}/cancel/customer/{customerId}`

### 7. Health Check

**GET** `/api/orders/health`

## Statuts des commandes

- `PENDING` - En attente
- `CONFIRMED` - Confirmée
- `SHIPPED` - Expédiée
- `DELIVERED` - Livrée
- `CANCELLED` - Annulée

## Démarrage du service

1. **Compilation:**

```bash
mvn clean compile
```

2. **Démarrage:**

```bash
mvn spring-boot:run
```

3. **Accès:**

- Application: http://localhost:8100
- H2 Console: http://localhost:8100/h2-console
- Health Check: http://localhost:8100/api/orders/health

## Configuration H2

- URL JDBC: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (vide)

## Structure du projet

```
src/main/java/tn/esprit/spring/orderservice/
├── entity/
│   ├── Order.java          # Entité principale des commandes
│   └── OrderItem.java      # Items de commande
├── dto/
│   ├── CreateOrderRequest.java  # DTO pour créer une commande
│   └── OrderResponse.java       # DTO de réponse
├── repository/
│   ├── OrderRepository.java     # Repository des commandes
│   └── OrderItemRepository.java # Repository des items
├── service/
│   └── OrderService.java        # Service métier
├── controller/
│   ├── OrderController.java     # Contrôleur REST
│   └── OrderTestDataLoader.java # Données de test
├── config/
│   └── GlobalExceptionHandler.java # Gestion des erreurs
└── OrderServiceApplication.java    # Classe principale
```

## Exemples d'utilisation avec curl

### Créer une commande

```bash
curl -X POST http://localhost:8100/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {
        "productId": 101,
        "quantity": 2,
        "price": 25.99
      }
    ]
  }'
```

### Récupérer les commandes d'un client

```bash
curl http://localhost:8100/api/orders/customer/1
```

### Mettre à jour le statut

```bash
curl -X PUT "http://localhost:8100/api/orders/1/status?status=CONFIRMED"
```
