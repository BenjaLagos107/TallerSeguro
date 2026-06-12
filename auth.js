import { supabase } from './supabaseClient.js';

export async function signUp(email, password, nombre) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { nombre: nombre }
        }
    });
    if (error) throw error;
    
    // Al registrarse, Supabase dispara un trigger o debemos insertar el usuario en public.usuarios
    // Para este MVP, si la creación de usuario es exitosa, insertamos manualmente el perfil
    if (data.user) {
        const { error: profileError } = await supabase
            .from('usuarios')
            .insert([{ id: data.user.id, email: data.user.email, nombre: nombre }]);
        
        if (profileError) throw profileError;
    }
    
    return data;
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data;
}
