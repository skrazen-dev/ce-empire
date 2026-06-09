import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\./)?.[1];

if (!projectRef || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

// Supabase direct connection (port 5432) or pooler (6543)
// Using the transaction pooler
// Try multiple connection options
const connectionString = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL');
  
  // Check current type
  const typeCheck = await client.query(`
    SELECT data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'accounts' AND column_name = 'account_type'
  `);
  console.log('Current account_type:', typeCheck.rows[0]);
  
  if (typeCheck.rows[0]?.udt_name === '_text' || typeCheck.rows[0]?.data_type === 'ARRAY') {
    console.log('Column is already TEXT[] - no migration needed');
  } else {
    // Migrate
    await client.query(`
      ALTER TABLE accounts 
        ALTER COLUMN account_type TYPE TEXT[] 
        USING CASE 
          WHEN account_type IS NULL THEN NULL 
          ELSE ARRAY[account_type::text] 
        END;
    `);
    console.log('Migration successful! account_type is now TEXT[]');
  }
} catch (err) {
  console.error('Error:', err.message);
} finally {
  await client.end();
}
