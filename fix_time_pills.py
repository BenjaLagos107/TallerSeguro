import os

# 1. Update style.css
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

new_css = """
.time-pill {
    padding: 0.5rem;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 0.5rem;
    background: transparent;
    color: white;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
}

.time-pill:hover {
    background: rgba(255,255,255,0.1);
}

.time-pill.selected {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
    font-weight: 600;
}
"""
if '.time-pill' not in css:
    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css + new_css)

# 2. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target_html = """                <input type="datetime-local" id="booking-date" required step="900">"""
replacement_html = """                <h4 style="margin-bottom: 0.5rem;">Fecha de Atención</h4>
                <input type="date" id="booking-date-only" required style="width: 100%; margin-bottom: 1rem; padding: 0.75rem; border-radius: 0.5rem; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1);">
                
                <h4 style="margin-bottom: 0.5rem;">Hora Disponible</h4>
                <input type="hidden" id="booking-time-only" required>
                <div id="booking-time-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;">
                    <!-- Se llenará con JS -->
                </div>"""
html = html.replace(target_html, replacement_html)

# Bump css cache
html = html.replace('<link rel="stylesheet" href="./style.css?v=2">', '<link rel="stylesheet" href="./style.css?v=3">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 3. Update main.js
with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

target_js_modal = """    // Resetear formulario
    document.getElementById('booking-form').reset();"""

replacement_js_modal = """    // Resetear formulario
    document.getElementById('booking-form').reset();

    // Generar horas disponibles para el selector visual
    const timeGrid = document.getElementById('booking-time-grid');
    const timeHidden = document.getElementById('booking-time-only');
    if (timeGrid && timeHidden) {
        timeHidden.value = ''; 
        timeGrid.innerHTML = '';
        
        // Horarios de 09:00 a 17:30 cada 30 min
        const hours = [];
        for (let h = 9; h <= 17; h++) {
            hours.push(`${h.toString().padStart(2, '0')}:00`);
            hours.push(`${h.toString().padStart(2, '0')}:30`);
        }
        
        hours.forEach(time => {
            const btn = document.createElement('div');
            btn.className = 'time-pill';
            btn.textContent = time;
            btn.onclick = () => {
                document.querySelectorAll('.time-pill').forEach(el => el.classList.remove('selected'));
                btn.classList.add('selected');
                timeHidden.value = time;
            };
            timeGrid.appendChild(btn);
        });
    }"""
js = js.replace(target_js_modal, replacement_js_modal)

target_js_submit = """            const formData = {
                marca: document.getElementById('booking-marca').value,
                modelo: document.getElementById('booking-modelo').value,
                patente: document.getElementById('booking-patente').value,
                kilometraje: document.getElementById('booking-km').value ? parseInt(document.getElementById('booking-km').value.replace(/\\./g, ''), 10) : null,
                fecha_ingreso: document.getElementById('booking-date').value,
                notes: document.getElementById('booking-notes').value,
                servicio_solicitado: selectedRadio ? selectedRadio.value : 'Servicio Personalizado',
                precio_acordado: selectedRadio && selectedRadio.dataset.precio ? parseFloat(selectedRadio.dataset.precio) : null
            };"""

replacement_js_submit = """            const dateOnly = document.getElementById('booking-date-only').value;
            const timeOnly = document.getElementById('booking-time-only').value;
            
            if (!timeOnly) {
                showNotification("Por favor, selecciona una hora para la reserva.", "error");
                return;
            }
            
            const combinedDateTime = `${dateOnly}T${timeOnly}:00`;

            const formData = {
                marca: document.getElementById('booking-marca').value,
                modelo: document.getElementById('booking-modelo').value,
                patente: document.getElementById('booking-patente').value,
                kilometraje: document.getElementById('booking-km').value ? parseInt(document.getElementById('booking-km').value.replace(/\\./g, ''), 10) : null,
                fecha_ingreso: combinedDateTime,
                notes: document.getElementById('booking-notes').value,
                servicio_solicitado: selectedRadio ? selectedRadio.value : 'Servicio Personalizado',
                precio_acordado: selectedRadio && selectedRadio.dataset.precio ? parseFloat(selectedRadio.dataset.precio) : null
            };"""
js = js.replace(target_js_submit, replacement_js_submit)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done ui feature")
