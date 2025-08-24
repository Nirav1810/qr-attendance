# QR Attendance Backend - Azure Deployment Guide

## Prerequisites
- Azure account with $100 credit
- Azure CLI installed: `winget install Microsoft.AzureCLI`
- MongoDB Atlas account (free tier)
- Git repository

## Step 1: Set up MongoDB Atlas (Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for Azure)
5. Get your connection string

## Step 2: Prepare Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your MongoDB connection string and JWT secret:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/qr-attendance?retryWrites=true&w=majority
   JWT_SECRET=your-super-secure-random-string-here
   PORT=5000
   ```

## Step 3: Deploy to Azure

### Option A: Using Azure CLI (Recommended)
1. Open PowerShell in the backend directory
2. Run the deployment script:
   ```powershell
   .\deploy-azure.ps1
   ```
3. Follow the prompts to login and configure

### Option B: Manual Azure Portal Deployment
1. Login to [Azure Portal](https://portal.azure.com)
2. Create a new App Service
3. Choose Node.js 18 LTS runtime
4. Set up deployment from GitHub
5. Configure environment variables in App Service settings

## Step 4: Configure App Service
1. In Azure Portal, go to your App Service
2. Navigate to Configuration > Application settings
3. Add these environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `WEBSITE_NODE_DEFAULT_VERSION`: 18.17.0

## Step 5: Test Deployment
Your backend will be available at: `https://your-app-name.azurewebsites.net`

Test endpoints:
- GET `/api/auth/test` (if you add this)
- The app should show "Cannot GET /" for the root, which is normal

## Estimated Costs
- App Service Basic B1: ~$13/month
- MongoDB Atlas: Free tier (512MB)
- Total: Well within your $100 credit

## Scaling Options
- Start with Free tier (F1) for testing
- Upgrade to Basic (B1) for production
- Consider Standard (S1) if you need custom domains

## Troubleshooting
- Check Application logs in Azure Portal
- Verify environment variables are set
- Ensure MongoDB Atlas allows Azure IP ranges
- Face recognition models need to be uploaded or stored in Azure Blob Storage

## Next Steps
1. Update your frontend to use the Azure backend URL
2. Set up custom domain (optional)
3. Enable Application Insights for monitoring
4. Set up automated backups
