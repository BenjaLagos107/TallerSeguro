import re

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update loadVehiculos logic
old_vehiculos = """                window.userVehicles.forEach(v => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <h4>${v.marca} ${v.modelo}</h4>
                        <p class="text-muted">🚗 Patente: <strong>${v.patente}</strong></p>
                        <p class="text-muted">⏱ Kilometraje: ${v.kilometraje ? v.kilometraje.toLocaleString('es-CL') : 'No registrado'}</p>
                    `;
                    gridVehiculos.appendChild(card);
                });"""

new_vehiculos = """                window.userVehicles.forEach(v => {
                    const card = document.createElement('div');
                    card.className = 'card hoverable-card';
                    card.style.cursor = 'pointer';
                    card.innerHTML = `
                        <h4>${v.marca} ${v.modelo}</h4>
                        <p class="text-muted">🚗 Patente: <strong>${v.patente}</strong></p>
                        <p class="text-muted">⏱ Kilometraje: ${v.kilometraje ? v.kilometraje.toLocaleString('es-CL') : 'No registrado'}</p>
                        <button class="btn btn-secondary btn-small" style="width: 100%; margin-top: 1rem;">Ver Historial de Servicios</button>
                    `;
                    card.onclick = () => window.openVehicleHistoryModal(v.id, `${v.marca} ${v.modelo}`);
                    gridVehiculos.appendChild(card);
                });"""

if old_vehiculos in js:
    js = js.replace(old_vehiculos, new_vehiculos)
else:
    # try replacing line endings just in case
    js = js.replace(old_vehiculos.replace('\\n', '\\r\\n'), new_vehiculos.replace('\\n', '\\r\\n'))

# 2. Add history modal logic at the very end
history_logic = """
// =====================================
// HISTORIAL DE VEHICULO
// =====================================

window.openVehicleHistoryModal = async (vehiculoId, vehiculoName) => {
    const modal = document.getElementById('vehicle-history-modal');
    const title = document.getElementById('history-modal-title');
    const list = document.getElementById('vehicle-history-list');
    
    if (!modal || !title || !list) return;
    
    title.textContent = `Historial: ${vehiculoName}`;
    list.innerHTML = '<div class="spinner"></div>';
    modal.classList.remove('hidden');
    
    try {
        const { supabase } = await import('./supabaseClient.js');
        // Get reservations for this vehicle
        const { data, error } = await supabase
            .from('reservas')
            .select('*, talleres(nombre)')
            .eq('vehiculo_id', vehiculoId)
            .order('fecha_ingreso', { ascending: false });
            
        if (error) throw error;
        
        list.innerHTML = '';
        if (!data || data.length === 0) {
            list.innerHTML = '<p class="text-muted" style="text-align: center;">Aún no hay servicios registrados para este vehículo.</p>';
            return;
        }
        
        data.forEach(r => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.padding = '1rem';
            card.style.backgroundColor = 'rgba(255,255,255,0.02)';
            
            let statusClass = 'status-pending';
            if (r.estado === 'aprobada') statusClass = 'status-approved';
            else if (r.estado === 'rechazada') statusClass = 'status-rejected';
            else if (r.estado === 'completada') statusClass = 'status-completed';
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong style="color: var(--primary);">${r.talleres?.nombre || 'Taller Desconocido'}</strong>
                    <span class="status-badge ${statusClass}" style="font-size: 0.75rem;">${r.estado}</span>
                </div>
                <p style="margin: 0; font-size: 0.9rem;"><strong>Fecha:</strong> ${new Date(r.fecha_ingreso).toLocaleDateString()}</p>
                <p style="margin: 0; font-size: 0.9rem;" class="text-muted"><strong>Motivo:</strong> ${r.observaciones || 'Sin detalles'}</p>
            `;
            list.appendChild(card);
        });
        
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p class="text-error" style="text-align: center;">Error al cargar el historial.</p>';
    }
};

document.getElementById('close-vehicle-history-modal')?.addEventListener('click', () => {
    document.getElementById('vehicle-history-modal').classList.add('hidden');
});
"""

js = js + "\n" + history_logic

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done main.js modifications")
