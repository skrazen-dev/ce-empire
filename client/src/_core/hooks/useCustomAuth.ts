import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export interface AuthUser {
  id: number;
  username: string;
  role: 'user' | 'admin';
}

export function useCustomAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // tRPC procedures
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: false, // Don't auto-fetch
  });

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await meQuery.refetch();
        if (result.data) {
          setUser(result.data);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginMutation.mutateAsync({ username, password });
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      throw new Error('Login failed');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await registerMutation.mutateAsync({
        username,
        email,
        password,
      });
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      throw new Error('Registration failed');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
