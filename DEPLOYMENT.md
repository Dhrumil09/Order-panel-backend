# 🚀 Railway Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation

- [ ] All code is committed to GitHub
- [ ] TypeScript builds successfully (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Database migrations work locally (`npm run migrate`)
- [ ] Environment variables are documented

### ✅ Railway Account Setup

- [ ] Railway account created at [railway.app](https://railway.app)
- [ ] GitHub account connected to Railway
- [ ] Railway CLI installed (`npm install -g @railway/cli`)

## Deployment Steps

### Step 1: GitHub Repository

```bash
# Ensure your code is on GitHub
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Railway Project Setup

1. **Create New Project**

   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Add PostgreSQL Database**
   - In project dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Wait for database to be provisioned

### Step 3: Environment Variables

Add these variables in Railway dashboard → Variables tab:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (Railway auto-provides these)
DB_HOST=${DATABASE_HOST}
DB_PORT=${DATABASE_PORT}
DB_NAME=${DATABASE_NAME}
DB_USER=${DATABASE_USER}
DB_PASSWORD=${DATABASE_PASSWORD}

# Security
JWT_SECRET=your-super-secret-jwt-key-here-change-this
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS (update with your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com
```

### Step 4: Deploy and Migrate

```bash
# Link to Railway project
railway link

# Run migrations
railway run npm run migrate

# Optionally seed data
railway run npm run seed
```

### Step 5: Verify Deployment

- [ ] Check health endpoint: `https://your-app.railway.app/health`
- [ ] Review deployment logs in Railway dashboard
- [ ] Test database connection
- [ ] Verify all environment variables are set

## Post-Deployment

### ✅ Verification Checklist

- [ ] Application starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Database migrations completed successfully
- [ ] All environment variables are correctly set
- [ ] SSL/HTTPS is working
- [ ] Custom domain is configured (if needed)

### 🔧 Troubleshooting

**Build Failures:**

- Check Railway logs for TypeScript compilation errors
- Ensure all dependencies are in `package.json`
- Verify `railway.toml` configuration

**Database Issues:**

- Verify PostgreSQL service is provisioned
- Check environment variables are correctly mapped
- Run migrations manually: `railway run npm run migrate`

**Application Crashes:**

- Check application logs in Railway dashboard
- Verify `PORT` environment variable is set
- Ensure all required environment variables are configured

## Quick Commands

```bash
# Deploy using our script
npm run deploy:railway

# Manual deployment steps
railway login
railway link
railway run npm run migrate
railway run npm run seed

# Check deployment status
railway status

# View logs
railway logs
```

## Support

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Project Issues**: Create an issue in your GitHub repository
