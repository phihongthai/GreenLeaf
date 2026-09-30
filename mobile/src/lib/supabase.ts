import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://dcwzojgvahiqyrhvkdyh.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd3pvamd2YWhpcXlyaHZrZHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Mzg1MTksImV4cCI6MjA5ODAxNDUxOX0.WLBr_FwiX0I9ZQQD8wWe7qLG096l3OPvqfDs3dowMPQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
