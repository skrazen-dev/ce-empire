import { describe, it, expect } from 'vitest';

describe('Supabase Configuration', () => {
  it('should have VITE_SUPABASE_URL env variable', () => {
    const url = process.env.VITE_SUPABASE_URL;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https:\/\//);
  });

  it('should have VITE_SUPABASE_PUBLISHABLE_KEY env variable', () => {
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(10);
  });

  it('should have SUPABASE_SERVICE_ROLE_KEY env variable', () => {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(10);
  });

  it('should create supabase admin client without throwing', async () => {
    const { supabaseAdmin } = await import('./supabase');
    expect(supabaseAdmin).toBeDefined();
    expect(typeof supabaseAdmin.from).toBe('function');
  });

  it('should be able to query supabase (connection test)', async () => {
    const { supabaseAdmin } = await import('./supabase');
    // Test connection by querying a system table - should not throw
    const { error } = await supabaseAdmin.from('users').select('id').limit(1);
    // Either succeeds or returns a table-not-found error (not a connection error)
    if (error) {
      // Table might not exist yet - that's OK, just check it's not a connection error
      expect(error.message).not.toContain('Failed to fetch');
      expect(error.message).not.toContain('ECONNREFUSED');
    }
  });
});
