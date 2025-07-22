import { createServerClient as createClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerClient() {
  const cookieStore = cookies();

  return createClient(
    'https://edojuauoelfakimundid.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkb2p1YXVvZWxmYWtpbXVuZGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODU0MDIsImV4cCI6MjA2Nzk2MTQwMn0.69o3b7D1BTvAYNjuOylPbC-qDIqKZtGwrV7-2XC-8p0',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
