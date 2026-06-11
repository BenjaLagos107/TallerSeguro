import { createClient } from '@supabase/supabase-js'

// REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO DE SUPABASE
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Inicializar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
