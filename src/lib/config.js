// Konfiguráció – töltsd ki a .env.local fájlban (vagy írd át a placeholder értékeket).
const env = import.meta.env

export const SUPABASE_URL = env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE'
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE'
export const TMDB_API_KEY = env.VITE_TMDB_API_KEY || 'YOUR_TMDB_API_KEY_HERE'
export const APP_PIN = String(env.VITE_APP_PIN || '1357')

export const TMDB_IMG = 'https://image.tmdb.org/t/p/w342'

export const isSupabaseConfigured = !SUPABASE_URL.includes('YOUR_')
export const isTmdbConfigured = !TMDB_API_KEY.includes('YOUR_')

