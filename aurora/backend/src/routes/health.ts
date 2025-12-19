import express from 'express';
import { pool } from '../index';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbTest = await pool.query('SELECT NOW()');
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbTest.rows[0].now,
      services: {
        scan: 'operational',
        export: 'operational',
        database: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: (error as Error).message 
    });
  }
});

export { router as healthRoutes };