import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { scanRoutes } from './routes/scan';
import { exportRoutes } from './routes/export';
import { healthRoutes } from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Routes
app.use('/api/scan', scanRoutes);
app.use('/api/export', exportRoutes);
app.use('/api', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Aurora Core Backend API',
    version: 'v12.0',
    status: 'operational'
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Aurora Core Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});