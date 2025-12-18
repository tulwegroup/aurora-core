
import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/licenses', async (req, res) => {
  const result = await pool.query('SELECT l.*, r.name as region_name FROM licenses l JOIN regions r ON l.region_id = r.id');
  res.json(result.rows);
});

app.post('/licenses', async (req, res) => {
  const { holder_name, region_id, permit_code, valid_until } = req.body;
  try {
    await pool.query(
      'INSERT INTO licenses (holder_name, region_id, permit_code, valid_until) VALUES ($1, $2, $3, $4)',
      [holder_name, region_id, permit_code, valid_until]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(4000, () => console.log('License Service active on port 4000'));
