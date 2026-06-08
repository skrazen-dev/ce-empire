import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lxrxknhhsnwxyctkzvop.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_SXEoA5gnh_QJc13NKN2Qgg_JabiTrfq';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Read migration SQL
const sqlPath = join(__dirname, '..', 'supabase-migration.sql');
const sql = readFileSync(sqlPath, 'utf-8');

// Use Supabase's pg endpoint to run raw SQL
const pgUrl = `${supabaseUrl}/rest/v1/`;

async function runSQL(query) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ sql: query })
  });
  
  if (!res.ok) {
    const text = await res.text();
    return { error: text };
  }
  return { error: null };
}

// Try using the pg connection via supabase-js
// The best approach is to use the Supabase REST API with a custom function
// Let's create the exec_sql function first, then use it

const CREATE_EXEC_SQL = `
CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

console.log('Testing Supabase connection...');

// Test connection
const { data: testData, error: testError } = await supabase
  .from('users')
  .select('id')
  .limit(1);

if (testError && testError.code === 'PGRST116') {
  console.log('Table "users" not found - need to run migration');
} else if (testError && testError.message.includes('relation') && testError.message.includes('does not exist')) {
  console.log('Tables do not exist yet - need to run migration');
} else if (!testError) {
  console.log('✅ Tables already exist! Migration not needed.');
  process.exit(0);
}

// Parse SQL into individual statements
// Handle multi-line statements (functions, triggers)
const statements = [];
let current = '';
let inFunction = false;

for (const line of sql.split('\n')) {
  const trimmed = line.trim();
  
  // Skip pure comment lines
  if (trimmed.startsWith('--')) {
    continue;
  }
  
  current += line + '\n';
  
  // Track if we're inside a function/procedure body
  if (trimmed.includes('$$')) {
    inFunction = !inFunction;
  }
  
  // Statement ends with ; and we're not inside a function
  if (!inFunction && trimmed.endsWith(';')) {
    const stmt = current.trim();
    if (stmt.length > 1) {
      statements.push(stmt);
    }
    current = '';
  }
}

console.log(`Found ${statements.length} SQL statements to execute`);

// Execute each statement via Supabase pg connection
// Since exec_sql doesn't exist yet, we'll use a different approach
// We'll send the entire SQL as one batch via the pg REST endpoint

const fullSQL = sql;

// Try sending full SQL via fetch to the pg endpoint
const pgEndpoint = `${supabaseUrl}/pg/query`;
const altEndpoint = `${supabaseUrl}/rest/v1/`;

// Method: Use supabase-js to call a stored procedure
// First, let's check if we can use the Management API approach

// Actually, let's use the direct pg connection via the supabase SDK
// The supabase JS client doesn't support raw SQL directly
// But we can use the REST API with a custom function

// Best approach: send statements one by one using supabase.rpc or REST
let successCount = 0;
let skipCount = 0;
let errorCount = 0;

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  const preview = stmt.substring(0, 60).replace(/\n/g, ' ');
  
  // Use fetch to call the pg REST endpoint
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: stmt })
  });
  
  if (res.ok) {
    console.log(`  ✅ [${i+1}/${statements.length}] ${preview}`);
    successCount++;
  } else {
    const errText = await res.text();
    
    // Check if it's just "already exists" - that's OK
    if (errText.includes('already exists') || errText.includes('duplicate')) {
      console.log(`  ⚠️  [${i+1}/${statements.length}] Already exists: ${preview}`);
      skipCount++;
    } else if (errText.includes('PGRST202')) {
      // exec_sql function doesn't exist - we need another approach
      console.log(`  ❌ exec_sql not available. Need to create it first.`);
      console.log(`\n⚠️  Cannot run migration automatically.`);
      console.log(`Please run the SQL manually in Supabase Dashboard:`);
      console.log(`https://supabase.com/dashboard/project/lxrxknhhsnwxyctkzvop/sql/new`);
      process.exit(1);
    } else {
      console.log(`  ❌ [${i+1}/${statements.length}] Error: ${errText.substring(0, 100)}`);
      errorCount++;
    }
  }
}

console.log(`\n✅ Done: ${successCount} success, ${skipCount} skipped, ${errorCount} errors`);
