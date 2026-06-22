import os
import re

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# I need to replace the rendering logic inside loadOwnerDashboard
# It looks like:
#        for (const taller of misTalleres) {
#            const card = document.createElement('div');
#            card.className = 'card';
#            card.innerHTML = `
#                <h4>${taller.nombre}</h4>
# ...
#            // Cargar servicios
#            getTallerServicios(taller.id).then(servicios => {
# ...
#            }).catch(e => console.error(e));
#        }

target_start = "// 1. Renderizar Talleres en Mi Perfil"
target_end = "}).catch(e => console.error(e));"

idx_start = js.find(target_start)
idx_end = js.find(target_end, idx_start)

if idx_start != -1 and idx_end != -1:
    end_pos = idx_end + len(target_end)
    # Extract the block to replace
    original_block = js[idx_start:end_pos]
    
    new_block = """// 1. Renderizar Talleres en Mi Perfil
        for (const taller of misTalleres) {
            const card = document.createElement('div');
            card.className = 'workshop-card'; // Cambiamos a la clase del diseño de busqueda
            
            // Reutilizamos la lógica de formateo
            let especialidadesText = 'Multimarca';
            if (taller.especialidades) {
                let arr = [];
                if (Array.isArray(taller.especialidades)) {
                    arr = taller.especialidades;
                } else {
                    try {
                        arr = JSON.parse(taller.especialidades);
                        if (!Array.isArray(arr)) arr = [taller.especialidades];
                    } catch(e) {
                        arr = [taller.especialidades];
                    }
                }
                especialidadesText = [...new Set(arr)].join(', ');
            }

            card.innerHTML = `
                <div class="workshop-header">
                    <h4 class="workshop-title" style="margin-top: 0; padding-top: 0;">${taller.nombre}</h4>
                </div>
                
                <div class="workshop-attributes">
                    <div class="workshop-attr">
                        <span class="workshop-attr-label">Dirección</span>
                        <span class="workshop-attr-value">${taller.direccion}</span>
                    </div>
                    <div class="workshop-attr">
                        <span class="workshop-attr-label">Teléfono</span>
                        <span class="workshop-attr-value">${taller.telefono || 'Sin teléfono'}</span>
                    </div>
                    <div class="workshop-attr">
                        <span class="workshop-attr-label">Especialidad</span>
                        <span class="workshop-attr-value">${especialidadesText || 'Ninguna'}</span>
                    </div>
                </div>

                <div style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                    <span class="workshop-attr-label" style="display: block; margin-bottom: 0.5rem;">Servicios Ofrecidos</span>
                    <ul id="lista-servicios-${taller.id}" style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 1rem; padding-left: 1.5rem;">
                        <li>Cargando...</li>
                    </ul>
                    <button class="btn btn-secondary btn-small" onclick="openAddServicioModal('${taller.id}')" style="width: 100%;">+ Agregar Servicio</button>
                </div>
            `;
            profileList.appendChild(card);
            
            // Cargar servicios
            getTallerServicios(taller.id).then(servicios => {
                const ul = document.getElementById(`lista-servicios-${taller.id}`);
                if (!servicios || servicios.length === 0) {
                    ul.innerHTML = '<li style="color: var(--text-muted);">No hay ningún servicio inscrito.</li>';
                } else {
                    ul.innerHTML = servicios.map(s => `<li>${s.servicio_nombre} - $${s.precio} (Aprox. ${s.tiempo_estimado})</li>`).join('');
                }
            }).catch(e => {
                console.error("Error cargando servicios:", e);
                const ul = document.getElementById(`lista-servicios-${taller.id}`);
                if (ul) ul.innerHTML = '<li style="color: var(--text-muted);">No hay ningún servicio inscrito.</li>';
            });"""
            
    # Include the closing brace of the for loop
    original_block += "\n        }"
    new_block += "\n        }"

    js = js.replace(original_block, new_block)
    
    with open('main.js', 'w', encoding='utf-8') as f:
        f.write(js)
        
    print("Dashboard workshop cards updated!")
else:
    print("Could not find the target block.")
