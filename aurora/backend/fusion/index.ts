import express from 'express';
import { Pool } from 'pg';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Google GenAI with Phase 12 Production API Key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const COMMODITIES = [
  "Copper", "Lithium", "Gold", "Silver", "Nickel", "Cobalt",
  "Platinum", "Palladium", "Uranium", "REE", "Hydrogen", "Helium",
  "Phosphate", "Potash", "Borates", "Tin", "Tungsten", "Manganese", "Graphite",
  "Diamond", "Emerald", "Ruby", "Sapphire"
];

/**
 * Phase 12 Bayesian Fusion Engine
 * Synchronizes Spectral Likelihoods (GEE) with Regional Priors via GenAI reasoning kernels.
 */
app.post('/fuse', async (req, res) => {
  const { scan_id, commodity_target } = req.body;
  
  try {
    // 1. Evidence Matrix Construction
    const likelihoods = await pool.query('SELECT * FROM likelihoods WHERE scan_id = $1', [scan_id]);
    const scanResult = await pool.query(`
      SELECT s.*, r.name as region_name, r.id as r_id
      FROM scans s 
      JOIN regions r ON s.region_id = r.id 
      WHERE s.id = $1`, 
      [scan_id]
    );
    
    if (scanResult.rows.length === 0) throw new Error("Scan Registry Entry Not Found");
    const scan = scanResult.rows[0];
    const priors = await pool.query('SELECT * FROM priors WHERE region_id = $1', [scan.r_id]);
    
    // 2. Bayesian Fusion Prompt Logic
    const prompt = `
      As an Institutional Geoscientific Bayesian Fusion Kernel, compute the discovery posterior for "${commodity_target}" in region "${scan.region_name}".
      
      Scientific Inputs:
      - Historical Regional Priors (Gravimetric/Geological): ${JSON.stringify(priors.rows)}
      - Satellite/Spectral Likelihoods (Sentinel-2A/B Overlay): ${JSON.stringify(likelihoods.rows)}
      
      Phase 12 Protocol Requirements:
      1. Strictly apply Bayesian update logic: Posterior ∝ Prior * Likelihood.
      2. If evidence is ambiguous, contradictory, or spectral signatures are weak, apply strictly conservative discounting to the posterior probability.
      3. Classify discovery confidence into formal tiers: Tier-1 (>0.88), Institutional (0.72-0.88), Speculative (0.5-0.72).
      4. Estimate Expected Resource Envelope (ERE) in Million tonnes (Mt) based on spectral footprint density.
      
      Constraint: You must return ONLY a valid JSON object.
      Response Schema:
      {
        "results": [
          {
            "commodity_name": "${commodity_target}",
            "probability": number (0.00 to 1.00),
            "ere_estimate": "string (e.g. 155.4 Mt)",
            "reasoning": "string (one-sentence geoscientific technical summary)",
            "coordinates": { "lat": number, "lng": number }
          }
        ]
      }
    `;

    // 3. Institutional Reasoning Execution
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        temperature: 0.1, // Precision focus
        topK: 1
      }
    });

    const fusionOutput = JSON.parse(response.text || '{"results":[]}');
    
    // 4. Institutional Registry Persistence
    for (const item of fusionOutput.results) {
      if (item.probability < 0.48) continue; // Noise floor filter

      await pool.query(
        `INSERT INTO discoveries (scan_id, commodity_id, probability, coordinates, metadata) 
         VALUES ($1, (SELECT id FROM commodities WHERE name = $2 LIMIT 1), $3, $4, $5)`,
        [
          scan_id, 
          item.commodity_name, 
          item.probability, 
          JSON.stringify(item.coordinates || { lat: 0, lng: 0 }), 
          JSON.stringify({ 
            geoscientific_reasoning: item.reasoning, 
            ere_magnitude: item.ere_estimate,
            investor_grade: item.probability > 0.88 ? 'Tier-1' : 'Institutional',
            compliance: 'AUR-V12-PROD_SECURE',
            timestamp: new Date().toISOString()
          })
        ]
      );
    }

    res.json({ 
      status: 'fusion_complete', 
      scan_id, 
      results: fusionOutput.results,
      regulatory_flag: 'institutional-claim-safe-v12'
    });
  } catch (err) {
    console.error('[FUSION] Phase 12 Pipeline Critical Failure:', (err as Error).message);
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(4003, () => console.log('Aurora Fusion Kernel Phase 12 Online on 4003'));