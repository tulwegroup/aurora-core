# Aurora Core Deployment Guide

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Local Development

1. **Clone and Setup**
   ```bash
   git clone https://github.com/tulwegroup/aurora-core.git
   cd aurora-core
   git checkout 721a365
   chmod +x setup-dev.sh
   ./setup-dev.sh
   ```

2. **Manual Setup (if script fails)**
   ```bash
   # Setup Database
   createdb aurora_core
   psql aurora_core -f db/init.sql
   
   # Backend Setup
   cd aurora/backend
   npm install
   cp ../.env.example ../.env
   # Edit .env with your database credentials
   
   # Frontend Setup  
   cd ../frontend
   npm install
   echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api" > .env.local
   ```

3. **Run Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd aurora/backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd aurora/frontend  
   npm run dev
   ```

## Production Deployment

### Frontend on Vercel

1. **Connect Repository**
   - Connect your GitHub repository to Vercel
   - Set root directory to `aurora/frontend`

2. **Environment Variables**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api
   ```

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Node.js Version: `18.x`

### Backend on Render

1. **Create Web Service**
   - Connect your GitHub repository
   - Set root directory to `aurora/backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

2. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=8000
   DATABASE_URL=your_render_database_url
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

3. **Database Setup**
   - Add PostgreSQL database on Render
   - Run initialization script:
     ```sql
     -- Copy contents of db/init.sql and run in Render SQL editor
     ```

### Environment Configuration

#### Production Environment Variables

**Backend (Render):**
```
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CORS_ORIGIN=https://your-domain.vercel.app
JWT_SECRET=your_secure_jwt_secret
LOG_LEVEL=info
```

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check database is running and accessible
   - Ensure SSL is properly configured for production

2. **CORS Errors**
   - Verify CORS_ORIGIN includes your frontend domain
   - Check API endpoints are properly prefixed with `/api`

3. **Build Failures**
   - Ensure all dependencies are installed
   - Check TypeScript configuration
   - Verify environment variables are set

4. **Port Conflicts**
   - Backend uses port 8000 by default
   - Frontend uses port 3000 by default
   - Ensure ports are available in your environment

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/scan/start` - Start new scan
- `POST /api/scan/:id/pause` - Pause scan
- `POST /api/scan/:id/resume` - Resume scan  
- `GET /api/export/portfolio` - Get portfolio data (JSON)
- `GET /api/export/portfolio/csv` - Download portfolio (CSV)
- `GET /api/export/commodity/:name` - Get commodity-specific data

### Database Schema

The application uses the following main tables:
- `regions` - Geographic regions
- `commodities` - Available commodities  
- `scans` - Scan records
- `discoveries` - Discovery results

See `db/init.sql` for complete schema.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the logs in your deployment platform
3. Verify environment variables are correctly set
4. Ensure database schema is properly initialized