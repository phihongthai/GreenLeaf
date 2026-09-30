import { NextRequest } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient, type User, type SupabaseClient } from '@supabase/supabase-js';

export interface AuthResult {
  user: User | null;
  supabase: SupabaseClient;
  error?: string;
}

/**
 * Unified auth helper that supports both:
 * 1. Bearer token in Authorization header (Mobile App / API clients)
 * 2. Cookie-based session (Next.js Web App)
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
  const serviceClient = createServiceClient();

  // 1. Check Bearer token in Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      try {
        const { data, error } = await serviceClient.auth.getUser(token);
        if (!error && data?.user) {
          return { user: data.user, supabase: serviceClient };
        }
      } catch (e) {
        console.warn('[auth] serviceClient getUser error:', e);
      }

      try {
        const anonClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data, error } = await anonClient.auth.getUser(token);
        if (!error && data?.user) {
          return { user: data.user, supabase: serviceClient };
        }
      } catch (e) {
        console.warn('[auth] anonClient getUser error:', e);
      }
    }
  }

  // 2. Fallback to Cookie-based session (Web)
  try {
    const cookieSupabase = await createClient();
    const { data: { user }, error } = await cookieSupabase.auth.getUser();
    if (!error && user) {
      return { user, supabase: cookieSupabase as unknown as SupabaseClient };
    }
  } catch (e) {
    console.warn('[auth] cookie getUser error:', e);
  }

  return { user: null, supabase: serviceClient, error: 'Not authenticated' };
}
