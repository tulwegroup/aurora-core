
import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/portfolio/summary', async (req, res) => {
  try {
    const summary = await pool.query(`
      SELECT 
        c.name as commodity,
        COUNT(d.id) as discovery_count,
        ROUND(AVG(d.probability)::numeric, 3) as avg_certainty,
        SUM((d.metadata->>'ere_estimate')::float) as total_ere
      FROM discoveries d
      JOIN commodities c ON d.commodity_id = c.id
      GROUP BY c.name
    `);
    
    const regional = await pool.query(`
      SELECT 
        r.name as region,
        COUNT(d.id) as discovery_count,
        AVG(d.probability) as avg_prob
      FROM discoveries d
      JOIN scans s ON d.scan_id = s.id
      JOIN regions r ON s.region_id = r.id
      GROUP BY r.name
    `);

    // Added Country/District level breakdown for Phase 13
    const distribution = await pool.query(`
      SELECT 
        d.metadata->>'country' as country,
        COUNT(d.id) as count
      FROM discoveries d
      WHERE d.metadata->>'country' IS NOT NULL
      GROUP BY d.metadata->>'country'
    `);

    res.json({
      commodities: summary.rows,
      regions: regional.rows,
      distribution: distribution.rows,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(4000, () => console.log('Portfolio Aggregator active on port 4000'));
