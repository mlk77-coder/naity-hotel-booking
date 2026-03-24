/**
 * NEW Authentication Hook - Replace useAuth.tsx with this
 * 
 * This version uses the custom API backend instead of Supabase
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient } from "@/lib/apiClient";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "hotel_manager" | "user";
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null; // For compatibility with existing code
  loading: boolean;
  role: "admin" | "hotel_manager" | "user" | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"admin" | "hotel_manager" | "user" | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
        setRole(response.data.role);
      } else {
        // Invalid token
        localStorage.removeItem('token');
        setUser(null);
        setRole(null);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('token');
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setRole(response.user.role);
        return { error: null };
      }
      
      return { error: new Error(response.message || 'Login failed') };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        email,
        password,
        full_name: fullName,
      });
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setRole(response.user.role);
        return { error: null };
      }
      
      return { error: new Error(response.message || 'Registration failed') };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setRole(null);
  };

  // Create session object for compatibility
  const session = user ? { user } : null;

  return (
    <AuthContext.Provider value={{ user, session, loading, role, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
