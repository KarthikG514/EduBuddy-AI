import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://edojuauoelfakimundid.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkb2p1YXVvZWxmYWtpbXVuZGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODU0MDIsImV4cCI6MjA2Nzk2MTQwMn0.69o3b7D1BTvAYNjuOylPbC-qDIqKZtGwrV7-2XC-8p0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
