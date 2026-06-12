import { supabase } from './supabaseClient.js';

export async function getMiTaller(userId) {
    const { data, error } = await supabase
        .from('talleres')
        .select('*')
        .eq('dueño_id', userId)
        .maybeSingle(); // Un usuario puede no tener taller registrado aún
    
    if (error) throw error;
    return data;
}

export async function saveTallerProfile(userId, formData) {
    // Buscar si ya existe
    const existente = await getMiTaller(userId);

    const payload = {
        dueño_id: userId,
        nombre: formData.nombre,
        direccion: formData.direccion,
        telefono: formData.telefono,
        especialidades: formData.especialidades
    };

    let result;
    if (existente) {
        // Update
        const { data, error } = await supabase
            .from('talleres')
            .update(payload)
            .eq('id', existente.id)
            .select()
            .single();
        if (error) throw error;
        result = data;
    } else {
        // Insert
        const { data, error } = await supabase
            .from('talleres')
            .insert([payload])
            .select()
            .single();
        if (error) throw error;
        result = data;
    }
    return result;
}

export async function getTallerOrders(tallerId) {
    const { data, error } = await supabase
        .from('ordenes_trabajo')
        .select(`
            *,
            vehiculos ( marca, modelo, patente, usuarios(nombre, telefono) )
        `)
        .eq('taller_id', tallerId)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}

export async function updateOrderStatus(orderId, newStatus) {
    const { data, error } = await supabase
        .from('ordenes_trabajo')
        .update({ estado: newStatus })
        .eq('id', orderId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}
