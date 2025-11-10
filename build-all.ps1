# Build all microservices before Docker build
Write-Host "Building all microservices..." -ForegroundColor Green

# Build Eureka Server
Write-Host "`nBuilding Eureka Server..." -ForegroundColor Yellow
Set-Location "eureka-server"
.\mvnw.cmd clean package -DskipTests
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Failed to build Eureka Server" -ForegroundColor Red
    exit 1 
}
Set-Location ..

# Build Config Server
Write-Host "`nBuilding Config Server..." -ForegroundColor Yellow
Set-Location "config-server"
.\mvnw.cmd clean package -DskipTests
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Failed to build Config Server" -ForegroundColor Red
    exit 1 
}
Set-Location ..

# Build API Gateway
Write-Host "`nBuilding API Gateway..." -ForegroundColor Yellow
Set-Location "api-gateway"
.\mvnw.cmd clean package -DskipTests
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Failed to build API Gateway" -ForegroundColor Red
    exit 1 
}
Set-Location ..

# Build Product Service
Write-Host "`nBuilding Product Service..." -ForegroundColor Yellow
Set-Location "product-service"
.\mvnw.cmd clean package -DskipTests
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Failed to build Product Service" -ForegroundColor Red
    exit 1 
}
Set-Location ..

# Build Inventory Service
Write-Host "`nBuilding Inventory Service..." -ForegroundColor Yellow
Set-Location "inventory-service"
.\mvnw.cmd clean package -DskipTests
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Failed to build Inventory Service" -ForegroundColor Red
    exit 1 
}
Set-Location ..

Write-Host "`n✅ All microservices built successfully!" -ForegroundColor Green
Write-Host "`nNow you can run: docker compose build" -ForegroundColor Cyan
