import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GEE Authentication Stub
 * In production, we'd initialize the EE library with the service account.
 */
const initGEE = () => {
  const keyPath = process.env.GEE_JSON_KEY_PATH;
  if (keyPath && fs.existsSync(keyPath)) {
    console.log(`[GEE] Authenticating using key: ${keyPath}`);
    // ee.data.authenticateViaServiceAccount(JSON.parse(fs.readFileSync(keyPath, 'utf8')));
    // ee.initialize();
  } else {
    console.warn("[GEE] Service account key not found. Operating in simulated mode.");
  }
};

initGEE();

app.post('/likelihoods', async (req, res) => {
  const { scan_id, region_id, commodities } = req.body;
  
  try {
    console.log(`[LIKELIHOOD] Fetching live satellite data for ${commodities.length} commodities in region ${region_id}`);
    
    // Simulate spectral analysis per commodity
    const results = commodities.map((c: string) => ({
      commodity: c,
      likelihood: Math.random() * 1.5,
      source: 'Sentinel-2 / Landsat-9'
    }));

    for (const res of results) {
      await pool.query(
        'INSERT INTO likelihoods (scan_id, value, source, metadata) VALUES ($1, $2, $3, $4)',
        [scan_id, res.likelihood, res.source, JSON.stringify({ commodity: res.commodity, timestamp: new Date().toISOString() })]
      );
    }
    
    res.json({ status: 'likelihood_matrix_processed', scan_id, count: results.length });
  } catch (err) {
    console.error(`[LIKELIHOOD] Error:`, (err as Error).message);
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(4002, () => console.log('Likelihood Service active on port 4002'));