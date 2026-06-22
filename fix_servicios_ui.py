import os

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Replace the initial HTML structure
target_html = """<ul id="lista-servicios-${taller.id}" style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 1rem; padding-left: 1.5rem;">
                        <li>Cargando...</li>
                    </ul>"""
replacement_html = """<div id="lista-servicios-${taller.id}" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Cargando...</div>
                    </div>"""
js = js.replace(target_html, replacement_html)

# 2. Replace the empty state
target_empty = "ul.innerHTML = '<li style=\"color: var(--text-muted);\">No hay ningún servicio inscrito.</li>';"
replacement_empty = "ul.innerHTML = '<div style=\"color: var(--text-muted); font-size: 0.9rem;\">No hay ningún servicio inscrito.</div>';"
js = js.replace(target_empty, replacement_empty)

# 3. Replace the map function
target_map = "ul.innerHTML = servicios.map(s => `<li>${s.nombre} - $${s.precio_estimado} (Aprox. ${s.tiempo_estimado_valor} ${s.tiempo_estimado_unidad})</li>`).join('');"
replacement_map = """ul.innerHTML = servicios.map(s => `
                        <div class="card" style="padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); margin-bottom: 0;">
                            <strong style="color: var(--primary); display: block; margin-bottom: 0.25rem; font-size: 0.95rem;">${s.nombre}</strong>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                                <span>Precio: <strong style="color: white;">$${Number(s.precio_estimado).toLocaleString('es-CL')}</strong></span>
                                <span>Aprox: <strong style="color: white;">${s.tiempo_estimado_valor} ${s.tiempo_estimado_unidad}</strong></span>
                            </div>
                        </div>
                    `).join('');"""
js = js.replace(target_map, replacement_map)

# 4. Replace the error state
target_error = "ul.innerHTML = '<li style=\"color: var(--error);\">Error al cargar servicios.</li>';"
replacement_error = "ul.innerHTML = '<div style=\"color: var(--error); font-size: 0.9rem;\">Error al cargar servicios.</div>';"
js = js.replace(target_error, replacement_error)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done styling servicios list to cards")
