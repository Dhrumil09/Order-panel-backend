# Order Panel Backend

A modern Node.js backend API built with TypeScript, Express, and PostgreSQL.

## 🚀 Features

- **TypeScript** - Full type safety and modern JavaScript features
- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Robust relational database with Knex.js ORM
- **Security** - Helmet, CORS, rate limiting, and input validation
- **Error Handling** - Centralized error handling and logging
- **Environment Configuration** - Flexible configuration management
- **Database Migrations** - Version-controlled database schema changes
- **Railway Ready** - Optimized for Railway deployment

## 📁 Project Structure

```
src/
├── controllers/     # Request handlers
├── db/             # Database setup and migrations
├── middlewares/    # Express middlewares
├── routes/         # API route definitions
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── app.ts          # Express app configuration
└── index.ts        # Server entry point
```

## 🛠️ Local Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd order-panel-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your database credentials and other settings.

4. **Database Setup**

   ```bash
   # Create database
   createdb order_panel

   # Run migrations
   npm run build
   npm run migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:db` - Test database connection
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run migrate` - Run database migrations
- `npm run seed` - Run database seeds

## 🔧 Configuration

The application uses environment variables for configuration. See `env.example` for all available options:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password

## 🗄️ Database

The project uses Knex.js for database operations and migrations:

- **Migrations**: `src/db/migrations/`
- **Seeds**: `src/db/seeds/`
- **Connection**: `src/db/index.ts`

### Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Create new migration
npm run migrate:make migration_name
```

## 🚀 API Endpoints

### Health Check

- `GET /health` - Application health status
- `GET /api/v1/health` - Versioned health check

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Input Validation** - Request data validation
- **SQL Injection Protection** - Parameterized queries

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## 📦 Railway Deployment

### Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub and push
git remote add origin https://github.com/yourusername/order-panel-backend.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Railway

1. **Go to Railway Dashboard**

   - Visit [railway.app](https://railway.app)
   - Sign in with your GitHub account

2. **Create New Project**

   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `order-panel-backend` repository

3. **Add PostgreSQL Database**

   - In your project dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically provision a PostgreSQL database

4. **Configure Environment Variables**

   - Go to your project's "Variables" tab
   - Add the following variables (Railway will auto-detect some):

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
   JWT_SECRET=your-super-secret-jwt-key-here
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # CORS (update with your frontend URL)
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

5. **Deploy**
   - Railway will automatically build and deploy your application
   - The build process will:
     - Install dependencies
     - Build TypeScript (`npm run build`)
     - Start the application (`npm start`)

### Step 3: Run Database Migrations

After deployment, you need to run migrations:

1. **Open Railway CLI** (optional but recommended)

   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Run Migrations**

   ```bash
   # Connect to your Railway project
   railway link

   # Run migrations
   railway run npm run migrate

   # Optionally seed data
   railway run npm run seed
   ```

### Step 4: Verify Deployment

1. **Check Health Endpoint**

   - Visit: `https://your-app-name.railway.app/health`
   - Should return a JSON response with health status

2. **Monitor Logs**
   - In Railway dashboard, go to "Deployments" tab
   - Click on your deployment to view logs

### Railway-Specific Features

- **Auto-scaling** - Railway automatically scales based on traffic
- **Health checks** - Configured to check `/health` endpoint
- **SSL/HTTPS** - Automatically provided
- **Custom domains** - Can be configured in Railway dashboard
- **Environment variables** - Securely managed in Railway dashboard

### Troubleshooting Railway Deployment

1. **Build Failures**

   - Check Railway logs for build errors
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation works locally

2. **Database Connection Issues**

   - Verify environment variables are correctly set
   - Check if PostgreSQL service is provisioned
   - Run migrations using Railway CLI

3. **Application Crashes**
   - Check application logs in Railway dashboard
   - Verify `PORT` environment variable is set
   - Ensure all required environment variables are configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License
