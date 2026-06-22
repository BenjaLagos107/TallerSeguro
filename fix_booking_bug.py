import os

# 1. Update logo color in index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<div class="logo" id="nav-logo" style="color: #10b981;">', '<div class="logo" id="nav-logo" style="color: #ffffff;">')

# Bump css cache
html = html.replace('<script type="module" src="./main.js?v=11"></script>', '<script type="module" src="./main.js?v=12"></script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Update booking submit logic in main.js
with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

target_js_submit = """            const formData = {
                marca: document.getElementById('booking-marca').value,
                modelo: document.getElementById('booking-modelo').value,
                patente: document.getElementById('booking-patente').value,
                km: document.getElementById('booking-km').value.replace(/\\D/g, ''),
                date: document.getElementById('booking-date').value,
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
                km: document.getElementById('booking-km').value.replace(/\\D/g, ''),
                date: combinedDateTime,
                notes: document.getElementById('booking-notes').value,
                servicio_solicitado: selectedRadio ? selectedRadio.value : 'Servicio Personalizado',
                precio_acordado: selectedRadio && selectedRadio.dataset.precio ? parseFloat(selectedRadio.dataset.precio) : null
            };"""

js = js.replace(target_js_submit, replacement_js_submit)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done bugfix")
