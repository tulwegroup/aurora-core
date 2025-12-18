
import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/priors', async (req, res) => {
  const result = await pool.query('SELECT * FROM priors');
  res.json(result.rows);
});

app.post('/priors', async (req, res) => {
  const { commodity_id, region_id, value } = req.body;
  await pool.query('INSERT INTO priors (commodity_id, region_id, value) VALUES ($1, $2, $3)', [commodity_id, region_id, value]);
  res.sendStatus(201);
});

app.listen(4000, () => console.log('Priors Service active on port 4000'));
