import { createClient } from '@supabase/supabase-js';

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side environment
// as it bypasses all RLS policies!

// This function creates a new client with the service role key.
// It should be called only within server actions where admin privileges are required.
export function getSupabaseAdmin() {
    // Hardcoded credentials to bypass environment variable loading issues.
    const supabaseUrl = 'https://edojuauoelfakimundid.supabase.co';
    const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkb2p1YXVvZWxmYWtpbXVuZGlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM4NTQwMiwiZXhwIjoyMDY3OTYxNDAyfQ.5-5HaN0jBo6Zscj1nQ3_MXBHd28uPmpbdeLYdubOBMI';

    if (!supabaseUrl || !supabaseServiceRoleKey || supabaseServiceRoleKey === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
        console.error("Supabase URL or Service Role Key is missing or is still a placeholder.");
        return null;
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });
}
