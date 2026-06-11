import { createClient } from '@supabase/supabase-js'

// REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO DE SUPABASE
const supabaseUrl = 'https://nvjfqynslehygbnopjnu.supabase.co'
const supabaseAnonKey = 'sb_publishable_OqVZ_ni-4-UVckJVnpXVew_rqmCSQ50'

// Inicializar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
