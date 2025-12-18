import express from 'express';
import { Pool } from 'pg';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const COMMODITIES = [
  "Copper", "Lithium", "Gold", "Silver", "Nickel", "Cobalt",
  "Platinum", "Palladium", "Uranium", "REE", "Hydrogen", "Helium",
  "Phosphate", "Potash", "Borates", "Tin", "Tungsten", "Manganese", "Graphite",
  "Diamond", "Emerald", "Ruby", "Sapphire"
];

const FUSION_URL = process.env.FUSION_SERVICE_URL || 'http://localhost:4003';
const LIKELIHOOD_URL = process.env.LIKELIHOOD_SERVICE_URL || 'http://localhost:4002';
const ERE_URL = process.env.ERE_SERVICE_URL || 'http://localhost:4004';

let scanStates: Record<number, 'running' | 'paused' | 'aborted'> = {};

/**
 * Phase 12 Global Matrix Trigger
 * Orchestrates full 23-commodity scan sequences across regional nodes with persistent state controls.
 */
app.post('/scan/start', async (req, res) => {
  const { region_id, commodities = COMMODITIES, is_minimal_test = false } = req.body;
  const targetCommodities = is_minimal_test ? ["Lithium", "Copper", "Gold"] : commodities;

  try {
    const result = await pool.query(
      'INSERT INTO scans (region_id, status, metadata) VALUES ($1, $2, $3) RETURNING id',
      [region_id, 'scanning', JSON.stringify({ 
        commodities_requested: targetCommodities,
        environment: 'production',
        release: 'v12-matrix-prod',
        matrix_size: targetCommodities.length,
        is_minimal: is_minimal_test,
        timestamp: new Date().toISOString()
      })]
    );
    const scanId = result.rows[0].id;
    scanStates[scanId] = 'running';
    
    console.log(`[PHASE 12] Production Matrix Scan #${scanId} initiated. Active Matrix: ${targetCommodities.length} Commodities`);
    
    // Background execution of the scan process
    processScanMatrix(scanId, region_id, targetCommodities).catch(err => {
      console.error(`[PHASE 12] Fatal loop error in Scan #${scanId}:`, err);
    });

    res.status(202).json({ 
      scan_id: scanId, 
      status: 'production_scan_initiated', 
      matrix_size: targetCommodities.length,
      protocol: 'AUR-V12-INSTITUTIONAL'
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/scan/:id/pause', (req, res) => {
  const id = parseInt(req.params.id);
  if (scanStates[id]) {
    scanStates[id] = 'paused';
    console.log(`[STATE] Scan #${id} PAUSED by Operator.`);
  }
  res.json({ scan_id: id, status: 'paused' });
});

app.post('/scan/:id/resume', (req, res) => {
  const id = parseInt(req.params.id);
  if (scanStates[id] === 'paused') {
    scanStates[id] = 'running';
    console.log(`[STATE] Scan #${id} RESUMED.`);
  }
  res.json({ scan_id: id, status: 'resumed' });
});

async function processScanMatrix(scanId: number, regionId: number, commodities: string[]) {
  const startTime = Date.now();
  try {
    for (const commodity of commodities) {
      // 1. Process State Validation (Pause/Resume Check)
      while (scanStates[scanId] === 'paused') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      if (scanStates[scanId] === 'aborted') {
        console.log(`[STATE] Scan #${scanId} ABORTED.`);
        break;
      }

      console.log(`[PHASE 12] Processing matrix node: ${commodity} for Scan #${scanId}`);

      // 2. Multi-spectral Evidence Accumulation (Likelihoods)
      const likelihoodResponse = await axios.post(`${LIKELIHOOD_URL}/likelihoods`, { 
        scan_id: scanId, 
        region_id: regionId,
        commodities: [commodity] 
      });
      
      // 3. Bayesian Fusion Kernel Integration (Intelligence Layer)
      const fusionResponse = await axios.post(`${FUSION_URL}/fuse`, { 
        scan_id: scanId,
        commodity_target: commodity 
      });
      
      const fusionResults = fusionResponse.data.results || [];

      // 4. ERE Estimation & Persistent Database Sync
      for (const discovery of fusionResults) {
        if (discovery.probability >= 0.5) {
          const ereResponse = await axios.post(`${ERE_URL}/calculate`, {
            commodity: discovery.commodity_name,
            probability: discovery.probability,
            region_id: regionId
          });

          // Neon/PostgreSQL Discovery Table Update
          await pool.query(
            `UPDATE discoveries 
             SET metadata = metadata || $1::jsonb 
             WHERE scan_id = $2 AND commodity_id = (SELECT id FROM commodities WHERE name = $3 LIMIT 1)`,
            [JSON.stringify({ 
              ere: ereResponse.data.ere_value, 
              protocol: 'Phase 12 Production Loop',
              audit_ref: `AUR-B-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              timestamp: new Date().toISOString()
            }), scanId, commodity]
          );
        }
      }
    }
    
    // Finalize Scan Record
    await pool.query(
      'UPDATE scans SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2', 
      ['completed', scanId]
    );

    console.log(`[PHASE 12] SUCCESS: Global Matrix Scan #${scanId} completed in ${Date.now() - startTime}ms`);
  } catch (err) {
    console.error(`[PHASE 12] Pipeline Critical Failure - Scan #${scanId}:`, (err as Error).message);
    await pool.query('UPDATE scans SET status = $1 WHERE id = $2', ['failed', scanId]);
  } finally {
    delete scanStates[scanId];
  }
}

app.listen(4001, () => console.log('Aurora Phase 12 Matrix Controller active on 4001'));