import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Migrating account_type column to TEXT[]...');
  
  // Try raw SQL via RPC
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE accounts 
        ALTER COLUMN account_type TYPE TEXT[] 
        USING CASE 
          WHEN account_type IS NULL THEN NULL 
          ELSE ARRAY[account_type::text] 
        END;
    `
  });
  
  if (error) {
    console.log('RPC not available, trying direct approach...');
    // Check current column type
    const { data: cols, error: colErr } = await supabase
      .from('information_schema.columns')
      .select('data_type, udt_name')
      .eq('table_name', 'accounts')
      .eq('column_name', 'account_type');
    
    if (colErr) {
      console.log('Cannot check column type:', colErr.message);
    } else {
      console.log('Current account_type column:', cols);
    }
    
    console.log('Migration needs to be run directly in Supabase SQL editor.');
    console.log('SQL to run:');
    console.log(`
ALTER TABLE accounts 
  ALTER COLUMN account_type TYPE TEXT[] 
  USING CASE 
    WHEN account_type IS NULL THEN NULL 
    ELSE ARRAY[account_type::text] 
  END;
    `);
    return;
  }
  
  console.log('Migration successful!', data);
}

migrate().catch(console.error);
