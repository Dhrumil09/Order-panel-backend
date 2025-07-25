# Deploying to Render.com

This guide will walk you through deploying your Order Panel Backend to Render.com.

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Render.com Account**: Sign up at [render.com](https://render.com)
3. **Node.js Knowledge**: Basic understanding of Node.js deployment

## Step 1: Prepare Your Repository

### 1.1 Ensure your code is ready

```bash
# Test your application locally
npm run build
npm start
```

### 1.2 Commit your changes

```bash
git add .
git commit -m "Add Render.com deployment configuration"
git push origin main
```

## Step 2: Create a Render.com Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

## Step 3: Deploy Your Application

### Option A: Using render.yaml (Recommended)

1. **Create a New Web Service**:

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables**:

   - Go to your service settings
   - Add the following environment variables:
     ```
     NODE_ENV=production
     PORT=10000
     JWT_SECRET=your-super-secret-jwt-key-here
     RATE_LIMIT_WINDOW_MS=900000
     RATE_LIMIT_MAX_REQUESTS=100
     CORS_ORIGIN=https://your-frontend-domain.com
     ```

3. **Create Database**:
   - Click "New +" → "PostgreSQL"
   - Name it `order-panel-db`
   - Render will automatically link it to your web service

### Option B: Manual Setup

1. **Create Web Service**:

   - Name: `order-panel-backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

2. **Create PostgreSQL Database**:

   - Name: `order-panel-db`
   - Plan: Free
   - Database: `order_panel`
   - User: `order_panel_user`

3. **Link Database to Web Service**:
   - In your web service settings
   - Add the `DATABASE_URL` environment variable
   - Copy the connection string from your database

## Step 4: Configure Environment Variables

Add these environment variables to your web service:

| Variable                  | Value                       | Description                      |
| ------------------------- | --------------------------- | -------------------------------- |
| `NODE_ENV`                | `production`                | Environment mode                 |
| `PORT`                    | `10000`                     | Server port (Render requirement) |
| `JWT_SECRET`              | `your-secret-key`           | JWT signing secret               |
| `RATE_LIMIT_WINDOW_MS`    | `900000`                    | Rate limiting window             |
| `RATE_LIMIT_MAX_REQUESTS` | `100`                       | Max requests per window          |
| `CORS_ORIGIN`             | `https://your-frontend.com` | Frontend domain                  |
| `DATABASE_URL`            | `auto-generated`            | Database connection (auto-set)   |

## Step 5: Deploy and Test

1. **Deploy**:

   - Render will automatically deploy when you push to your main branch
   - Or manually deploy from the Render dashboard

2. **Check Logs**:

   - Monitor the deployment logs
   - Ensure migrations run successfully
   - Check for any errors

3. **Test Your API**:
   - Health check: `https://your-app.onrender.com/health`
   - API endpoints: `https://your-app.onrender.com/api/v1/...`

## Step 6: Database Migrations

Your application will automatically run migrations on startup. If you need to run them manually:

1. Go to your web service in Render
2. Click "Shell"
3. Run: `npm run migrate`

## Step 7: Custom Domain (Optional)

1. In your web service settings
2. Go to "Custom Domains"
3. Add your domain
4. Configure DNS records as instructed

## Troubleshooting

### Common Issues

1. **Build Failures**:

   - Check build logs
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

2. **Database Connection Issues**:

   - Verify `DATABASE_URL` is set correctly
   - Check database is running
   - Ensure migrations complete successfully

3. **Port Issues**:

   - Render requires port 10000 or the `PORT` environment variable
   - Ensure your app listens on the correct port

4. **Environment Variables**:
   - Double-check all required variables are set
   - Ensure no typos in variable names

### Useful Commands

```bash
# Check deployment status
curl https://your-app.onrender.com/health

# View logs
# (Use Render dashboard or CLI)

# Test database connection
npm run test:neon
```

## Monitoring and Maintenance

1. **Health Checks**: Your app includes a `/health` endpoint
2. **Logs**: Monitor logs in the Render dashboard
3. **Scaling**: Upgrade to paid plans for better performance
4. **Backups**: Render handles database backups automatically

## Cost Considerations

- **Free Tier**: Limited to 750 hours/month
- **Paid Plans**: Start at $7/month for always-on service
- **Database**: Free tier available for PostgreSQL

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **JWT Secret**: Use a strong, unique secret
3. **CORS**: Configure properly for your frontend domain
4. **Rate Limiting**: Already configured in your app
5. **HTTPS**: Render provides SSL certificates automatically

## Next Steps

1. Set up your frontend to use the new API URL
2. Configure CI/CD for automatic deployments
3. Set up monitoring and alerting
4. Consider upgrading to paid plans for production use

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Your App Logs](https://dashboard.render.com)
