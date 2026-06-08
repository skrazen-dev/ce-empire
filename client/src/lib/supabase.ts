import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '');

export type Database = {
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          id: string;
          user_id: string;
          bank_name: string;
          account_number: string;
          account_name: string;
          balance: number;
          account_types: string[];
          status: 'active' | 'inactive' | 'suspended';
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bank_accounts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bank_accounts']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string | null;
          type: 'income' | 'expense' | 'transfer';
          amount: number;
          description: string;
          category: string;
          date: string;
          reference_number: string | null;
          slip_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      agents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string | null;
          line_id: string | null;
          bank_name: string | null;
          bank_account: string | null;
          status: 'active' | 'inactive' | 'suspended';
          tier: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['agents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['agents']['Insert']>;
      };
    };
  };
};
