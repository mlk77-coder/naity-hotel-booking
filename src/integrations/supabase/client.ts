// DEPRECATED - Supabase client stub for backward compatibility
// This file is kept to prevent import errors during migration
// All new code should use: import { apiClient } from "@/lib/apiClient";

// Create a mock supabase object to prevent errors
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: new Error('Use apiClient instead') }),
    signUp: async () => ({ data: null, error: new Error('Use apiClient instead') }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null }),
      }),
      then: async () => ({ data: [], error: null }),
    }),
    insert: () => ({ then: async () => ({ data: null, error: null }) }),
    update: () => ({ eq: () => ({ then: async () => ({ data: null, error: null }) }) }),
    delete: () => ({ eq: () => ({ then: async () => ({ data: null, error: null }) }) }),
  }),
};

console.warn('⚠️ Supabase client is deprecated. Please use apiClient from @/lib/apiClient instead.');