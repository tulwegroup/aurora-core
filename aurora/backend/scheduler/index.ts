
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

const SCAN_CONTROLLER_URL = process.env.SCAN_CONTROLLER_URL || 'http://scan-controller:4000';

interface ScheduleState {
  status: 'running' | 'paused' | 'stopped';
  currentTask: string | null;
  queue: any[];
}

let state: ScheduleState = {
  status: 'stopped',
  currentTask: null,
  queue: []
};

// Background worker logic
const runScheduler = async () => {
  if (state.status !== 'running' || state.queue.length === 0) return;

  const task = state.queue.shift();
  state.currentTask = `Scanning ${task.region_name} for ${task.commodities.length} items`;

  try {
    console.log(`[SCHEDULER] Triggering scan for: ${task.region_name}`);
    await axios.post(`${SCAN_CONTROLLER_URL}/scan/start`, {
      region_id: task.region_id,
      commodities: task.commodities
    });
    
    // Log success in DB
    await pool.query(
      'INSERT INTO scheduler_logs (task_description, status) VALUES ($1, $2)',
      [state.currentTask, 'success']
    );
  } catch (err) {
    console.error(`[SCHEDULER] Task failed: ${state.currentTask}`, (err as Error).message);
    await pool.query(
      'INSERT INTO scheduler_logs (task_description, status, error) VALUES ($1, $2, $3)',
      [state.currentTask, 'failed', (err as Error).message]
    );
  } finally {
    if (state.queue.length === 0) {
      state.status = 'stopped';
      state.currentTask = null;
    } else if (state.status === 'running') {
      // Small delay between batch triggers to respect API quotas
      setTimeout(runScheduler, 5000);
    }
  }
};

app.post('/scheduler/start', (req, res) => {
  const { targets } = req.body; // Array of {region_id, region_name, commodities}
  state.queue = [...state.queue, ...targets];
  if (state.status !== 'running') {
    state.status = 'running';
    runScheduler();
  }
  res.json({ status: 'scheduler_started', queueSize: state.queue.length });
});

app.post('/scheduler/pause', (req, res) => {
  state.status = 'paused';
  res.json({ status: 'scheduler_paused' });
});

app.post('/scheduler/resume', (req, res) => {
  if (state.status === 'paused') {
    state.status = 'running';
    runScheduler();
  }
  res.json({ status: 'scheduler_resumed' });
});

app.post('/scheduler/stop', (req, res) => {
  state.status = 'stopped';
  state.queue = [];
  state.currentTask = null;
  res.json({ status: 'scheduler_stopped' });
});

app.get('/scheduler/status', (req, res) => {
  res.json(state);
});

app.listen(4000, () => console.log('Aurora Scheduler active on port 4000'));
