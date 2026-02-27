import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://pybpalvrtjsxfadtjusx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnBhbHZydGpzeGZhZHRqdXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODU5NjMsImV4cCI6MjA4Nzc2MTk2M30.mhbgOzXgX0CucS8Gm078WOdsQ5UsRMv2N8A0k7E0n4g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
