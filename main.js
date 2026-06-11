import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const statusText = document.getElementById('db-status');
    const spinner = document.getElementById('loading-spinner');

    try {
        // Hacemos una consulta rápida a una tabla genérica o verificamos el estado
        // Supabase no tiene un "ping" directo, pero podemos hacer una consulta a una tabla inexistente
        // o usar auth para comprobar que el cliente responde.
        // Aquí hacemos una consulta con límite 1 para ver si arroja error de credenciales o de tabla.
        const { data, error } = await supabase.from('_dummy_table').select('*').limit(1);
        
        // Si hay un error, revisamos si es por credenciales o simplemente la tabla no existe.
        // Un error "PGRST116" (tabla no encontrada) o similar indica que al menos la conexión a Supabase fue exitosa.
        if (error && error.message.includes('URL')) {
            throw new Error("Credenciales inválidas o no configuradas.");
        }

        spinner.classList.add('hidden');
        statusText.textContent = "¡Conectado a Supabase correctamente! 🚀";
        statusText.className = "status-success";

    } catch (err) {
        spinner.classList.add('hidden');
        if (supabase.supabaseUrl === 'TU_URL_DE_SUPABASE' || supabase.supabaseKey === 'TU_ANON_KEY') {
            statusText.textContent = "Esperando configuración de credenciales en supabaseClient.js...";
            statusText.className = "status-error";
        } else {
            statusText.textContent = "Error al conectar: " + err.message;
            statusText.className = "status-error";
        }
    }
});
