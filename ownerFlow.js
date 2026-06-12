import { supabase } from './supabaseClient.js';

export async function getMisTalleres(userId) {
    const { data, error } = await supabase
        .from('talleres')
        .select('*')
        .eq('dueno_id', userId);
    
    if (error) throw error;
    return data || [];
}

export async function createTallerProfile(userId, formData) {
    const payload = {
        dueno_id: userId,
        nombre: formData.nombre,
        direccion: formData.direccion,
        telefono: formData.telefono,
        especialidades: formData.especialidades
    };

    const { data, error } = await supabase
        .from('talleres')
        .insert([payload])
        .select()
        .single();
        
    if (error) throw error;
    return data;
}

export async function getTallerOrders(tallerId) {
    const { data, error } = await supabase
        .from('ordenes_trabajo')
        .select(`
            *,
            vehiculos ( marca, modelo, patente, usuarios(nombre, telefono) )
        `)
        .eq('taller_id', tallerId);
    
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

export async function getTallerServicios(tallerId) {
    const { data, error } = await supabase
        .from('taller_servicios')
        .select('*')
        .eq('taller_id', tallerId);
    
    if (error) throw error;
    return data || [];
}

export async function addTallerServicio(payload) {
    const { data, error } = await supabase
        .from('taller_servicios')
        .insert([payload])
        .select()
        .single();
        
    if (error) throw error;
    return data;
}
