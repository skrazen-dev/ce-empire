import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

// Use Supabase Management API to run SQL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1];
console.log('Project ref:', projectRef);

// Try using pg connection string approach via fetch
const sql = `
ALTER TABLE accounts 
  ALTER COLUMN account_type TYPE TEXT[] 
  USING CASE 
    WHEN account_type IS NULL THEN NULL 
    ELSE ARRAY[account_type::text] 
  END;
`;

// Use the Supabase REST API with service role to execute SQL
const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  },
  body: JSON.stringify({ sql }),
});

if (!res.ok) {
  const text = await res.text();
  console.log('REST API failed:', res.status, text);
  
  // Try direct postgres connection
  console.log('\nTrying pg module...');
  try {
    const { default: pg } = await import('pg');
    // Get DB URL from env
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('No DATABASE_URL, trying to construct from Supabase...');
      // Supabase postgres URL format
      const pgUrl = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
      console.log('Trying:', pgUrl.replace(supabaseKey, '***'));
    }
  } catch (e) {
    console.log('pg not available:', e.message);
  }
} else {
  const data = await res.json();
  console.log('Success:', data);
}
