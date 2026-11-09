import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'

// Placeholder URL esetén is érvényes URL kell, hogy a kliens ne dobjon hibát betöltéskor.
const url = SUPABASE_URL.includes('YOUR_') ? 'https://placeholder.supabase.co' : SUPABASE_URL

export const supabase = createClient(url, SUPABASE_ANON_KEY)

