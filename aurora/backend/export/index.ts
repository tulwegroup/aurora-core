import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Institutional Claim-Safety Formatter
 * Wraps absolute Bayesian probabilities into conservative geoscientific ranges.
 */
const formatClaimSafe = (prob: number) => {
  const low = Math.max(0, prob - 0.05).toFixed(2);
  const high = Math.min(1, prob + 0.05).toFixed(2);
  return `${(parseFloat(low) * 100).toFixed(0)}% - ${(parseFloat(high) * 100).toFixed(0)}%`;
};

/**
 * Global Portfolio CSV Export
 */
app.get('/export/portfolio', async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id as discovery_id, 
        c.name as commodity, 
        r.name as region, 
        r.country as country,
        d.probability, 
        d.metadata->>'ere_magnitude' as ere,
        s.completed_at as scan_timestamp
      FROM discoveries d
      JOIN commodities c ON d.commodity_id = c.id
      JOIN scans s ON d.scan_id = s.id
      JOIN regions r ON s.region_id = r.id
      ORDER BY s.completed_at DESC
    `;
    const result = await pool.query(query);
    
    if (result.rows.length === 0) return res.status(404).send("Discovery Registry Empty.");

    const csvRows = result.rows.map(row => {
      const range = formatClaimSafe(row.probability);
      return {
        Discovery_ID: `AUR-${row.discovery_id}`,
        Asset_Class: row.commodity,
        Geographic_Sector: row.region,
        Jurisdiction: row.country,
        Certainty_Confidence: range,
        Volume_ERE: row.ere || "Pending Verification",
        Timestamp: row.scan_timestamp,
        Audit_Logic: "Phase 12 Bayesian v14",
        Compliance_Note: "Institutional Discovery Record (Claim-Safe)"
      };
    });

    const headers = Object.keys(csvRows[0]).join(',');
    const data = csvRows.map(row => 
      Object.values(row).map(v => `"${v}"`).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${data}`;

    console.log(`[AUDIT] Portfolio CSV Export initiated for Investor Access at ${new Date().toISOString()}`);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=aurora_core_portfolio_v12.csv');
    res.send(csvContent);
  } catch (err) {
    console.error("[EXPORT] Critical Failure:", err);
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * JSON Data Stream for Individual Assets
 */
app.get('/export/commodity/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const query = `
      SELECT 
        d.id, d.probability, d.coordinates, d.metadata,
        r.name as region_name, r.country
      FROM discoveries d 
      JOIN commodities c ON d.commodity_id = c.id 
      JOIN scans s ON d.scan_id = s.id
      JOIN regions r ON s.region_id = r.id
      WHERE LOWER(c.name) = LOWER($1)
    `;
    const result = await pool.query(query, [name]);
    
    const formatted = result.rows.map(r => ({
      ...r,
      probability_range: formatClaimSafe(r.probability),
      methodology: "AUR-B-V12_PROD"
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(4006, () => console.log('Aurora Export Service Phase 12 active on 4006'));