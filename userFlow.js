import { supabase } from './supabaseClient.js';

export async function getTalleres() {
    const { data, error } = await supabase
        .from('talleres')
        .select('*');
    if (error) throw error;
    return data;
}

export async function getMisReservas(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('ordenes_trabajo')
        .select(`
            *,
            talleres ( nombre ),
            vehiculos ( marca, modelo, patente )
        `)
        .eq('vehiculos.usuario_id', userId); 
        // En supabase si filtramos por relación a veces es complejo,
        // Mejor hacemos un select con inner join:
        // .eq('vehiculo_id.usuario_id', userId) -> requiere configuración.
    
    // Alternativa más simple para el MVP: traer vehículos del usuario y luego órdenes
    const { data: vehiculos, error: vError } = await supabase
        .from('vehiculos')
        .select('id, marca, modelo, patente')
        .eq('usuario_id', userId);
    
    if (vError) throw vError;
    if (!vehiculos || vehiculos.length === 0) return [];

    const vIds = vehiculos.map(v => v.id);
    
    const { data: ordenes, error: oError } = await supabase
        .from('ordenes_trabajo')
        .select('*, talleres(nombre)')
        .in('vehiculo_id', vIds)
        .order('created_at', { ascending: false });

    if (oError) throw oError;

    // Mezclar info para renderizar
    return ordenes.map(o => {
        const v = vehiculos.find(v => v.id === o.vehiculo_id);
        return { ...o, vehiculo: v };
    });
}

export async function createReserva(userId, tallerId, formData) {
    // 1. Buscar o crear vehículo
    let vehiculoId;
    const { data: vExistente, error: checkErr } = await supabase
        .from('vehiculos')
        .select('id')
        .eq('patente', formData.patente)
        .eq('usuario_id', userId)
        .maybeSingle();

    if (checkErr) throw checkErr;

    if (vExistente) {
        vehiculoId = vExistente.id;
    } else {
        const { data: newV, error: vErr } = await supabase
            .from('vehiculos')
            .insert([{
                usuario_id: userId,
                marca: formData.marca,
                modelo: formData.modelo,
                patente: formData.patente,
                kilometraje: formData.km || null
            }])
            .select()
            .single();
        if (vErr) throw vErr;
        vehiculoId = newV.id;
    }

    // 2. Crear Orden
    const { data: orden, error: oErr } = await supabase
        .from('ordenes_trabajo')
        .insert([{
            taller_id: tallerId,
            vehiculo_id: vehiculoId,
            estado: 'Pendiente',
            fecha_ingreso: formData.date,
            observaciones: formData.notes
        }])
        .select()
        .single();
    
    if (oErr) throw oErr;
    return orden;
}
