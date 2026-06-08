import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Read migration SQL
const sqlPath = join(__dirname, '..', 'supabase-migration.sql');
const sql = readFileSync(sqlPath, 'utf-8');

// Split into individual statements (skip comments and empty lines)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Running ${statements.length} SQL statements...`);

let successCount = 0;
let errorCount = 0;

for (const stmt of statements) {
  if (!stmt.trim()) continue;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { query: stmt + ';' }).single();
    if (error) {
      // Try direct REST approach
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: stmt + ';' })
      });
      
      if (!res.ok) {
        const errText = await res.text();
        // Ignore "already exists" errors
        if (errText.includes('already exists') || errText.includes('duplicate')) {
          console.log(`  ⚠️  Already exists (skipped)`);
        } else {
          console.error(`  ❌ Error: ${errText.substring(0, 100)}`);
          errorCount++;
        }
      } else {
        successCount++;
      }
    } else {
      successCount++;
    }
  } catch (e) {
    console.error(`  ❌ Exception: ${e.message?.substring(0, 100)}`);
    errorCount++;
  }
}

console.log(`\nDone: ${successCount} succeeded, ${errorCount} errors`);
