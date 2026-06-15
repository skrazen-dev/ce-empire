import bcrypt from 'bcrypt';
import { pool } from './db';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const username = process.env.SEED_USERNAME || 'BOSS';
  const password = process.env.SEED_PASSWORD;
  if (!password) {
    console.error('Please set SEED_PASSWORD in environment before running this script');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (username, password_hash, display_name) VALUES ($1,$2,$3) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash', [username, hash, username]);
    console.log(`Seeded user ${username}`);
    process.exit(0);
  } catch (e) {
    console.error('Seed error', e);
    process.exit(1);
  }
}

seed();
