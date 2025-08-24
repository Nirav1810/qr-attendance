# Azure Web App deployment script
# Run this from the backend directory

# Install Azure CLI if not already installed:
# winget install Microsoft.AzureCLI

# Login to Azure
az login

# Create resource group (replace with your preferred region)
az group create --name qr-attendance-rg --location "East US"

# Create App Service Plan (Free tier to start)
az appservice plan create --name qr-attendance-plan --resource-group qr-attendance-rg --sku F1 --is-linux

# Create Web App
az webapp create --resource-group qr-attendance-rg --plan qr-attendance-plan --name qr-attendance-backend-app --runtime "NODE|18-lts" --deployment-local-git

# Set environment variables (replace with your actual values)
az webapp config appsettings set --resource-group qr-attendance-rg --name qr-attendance-backend-app --settings MONGO_URI="your-mongodb-connection-string" JWT_SECRET="your-jwt-secret"

# Deploy from local git
git remote add azure https://qr-attendance-backend-app.scm.azurewebsites.net:443/qr-attendance-backend-app.git
git push azure main
