import express from 'express';
import { pool } from '../index';
import axios from 'axios';

const router = express.Router();

const COMMODITIES = [
  "Copper", "Lithium", "Gold", "Silver", "Nickel", "Cobalt",
  "Platinum", "Palladium", "Uranium", "REE", "Hydrogen", "Helium",
  "Phosphate", "Potash", "Borates", "Tin", "Tungsten", "Manganese", "Graphite",
  "Diamond", "Emerald", "Ruby", "Sapphire"
];

// In-memory scan states (in production, use Redis or database)
let scanStates: Record<number, 'running' | 'paused' | 'aborted'> = {};

/**
 * Start a new scan
 */
router.post('/start', async (req, res) => {
  const { region_id = 1, commodities = COMMODITIES, is_minimal_test = false } = req.body;
  const targetCommodities = is_minimal_test ? ["Lithium", "Copper", "Gold"] : commodities;

  try {
    // Insert scan record
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
    
    // Start background processing (simplified for now)
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

/**
 * Pause a scan
 */
router.post('/:id/pause', (req, res) => {
  const id = parseInt(req.params.id);
  if (scanStates[id]) {
    scanStates[id] = 'paused';
    console.log(`[STATE] Scan #${id} PAUSED by Operator.`);
  }
  res.json({ scan_id: id, status: 'paused' });
});

/**
 * Resume a scan
 */
router.post('/:id/resume', (req, res) => {
  const id = parseInt(req.params.id);
  if (scanStates[id] === 'paused') {
    scanStates[id] = 'running';
    console.log(`[STATE] Scan #${id} RESUMED.`);
  }
  res.json({ scan_id: id, status: 'resumed' });
});

/**
 * Background scan processing (simplified)
 */
async function processScanMatrix(scanId: number, regionId: number, commodities: string[]) {
  const startTime = Date.now();
  
  try {
    for (const commodity of commodities) {
      // Check pause state
      while (scanStates[scanId] === 'paused') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      if (scanStates[scanId] === 'aborted') {
        console.log(`[STATE] Scan #${scanId} ABORTED.`);
        break;
      }

      console.log(`[PHASE 12] Processing matrix node: ${commodity} for Scan #${scanId}`);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock discovery data
      const mockDiscovery = {
        commodity_name: commodity,
        probability: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
        coordinates: {
          lat: (Math.random() - 0.5) * 0.4 + regionId * 0.2,
          lng: (Math.random() - 0.5) * 0.4 + regionId * 0.1
        }
      };

      // Insert discovery if probability is high enough
      if (mockDiscovery.probability >= 0.5) {
        await pool.query(
          `INSERT INTO discoveries (scan_id, commodity_id, probability, coordinates, metadata) 
           VALUES ($1, (SELECT id FROM commodities WHERE name = $2 LIMIT 1), $3, $4, $5)`,
          [
            scanId, 
            commodity, 
            mockDiscovery.probability, 
            JSON.stringify(mockDiscovery.coordinates),
            JSON.stringify({
              protocol: 'Phase 12 Production Loop',
              audit_ref: `AUR-B-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              timestamp: new Date().toISOString(),
              simulated: true
            })
          ]
        );
      }
    }
    
    // Finalize scan
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

export { router as scanRoutes };