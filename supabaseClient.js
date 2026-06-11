import { createClient } from '@supabase/supabase-js'

// REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO DE SUPABASE
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null;
let supabaseError = null;

try {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no existen. Debes agregarlas en Vercel antes del deploy.");
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey)
} catch (error) {
    supabaseError = error.message;
}

export { supabase, supabaseError }
