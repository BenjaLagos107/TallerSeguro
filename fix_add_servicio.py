import os

# 1. Update main.js
with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix the payload
js = js.replace("precio: parseFloat(document.getElementById('add-servicio-precio').value),", "precio_estimado: parseFloat(document.getElementById('add-servicio-precio').value),")

# Fix the rendering logic (the one added in fix_dashboard_cards.py)
target_rendering = "ul.innerHTML = servicios.map(s => `<li>${s.servicio_nombre} - $${s.precio} (Aprox. ${s.tiempo_estimado})</li>`).join('');"
replacement_rendering = "ul.innerHTML = servicios.map(s => `<li>${s.servicio_nombre} - $${s.precio_estimado} (Aprox. ${s.tiempo_estimado})</li>`).join('');"
js = js.replace(target_rendering, replacement_rendering)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)


# 2. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make the inputs split the width 50/50
target_input = '<input type="number" id="add-servicio-tiempo-valor" placeholder="Ej. 2" required min="1" style="margin-bottom: 0;">'
replacement_input = '<input type="number" id="add-servicio-tiempo-valor" placeholder="Ej. 2" required min="1" style="margin-bottom: 0; flex: 1; min-width: 0;">'
html = html.replace(target_input, replacement_input)

target_select = '<select id="add-servicio-tiempo-unidad" required style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1);">'
replacement_select = '<select id="add-servicio-tiempo-unidad" required style="flex: 1; min-width: 0; padding: 0.75rem; border-radius: 0.5rem; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1);">'
html = html.replace(target_select, replacement_select)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done fixing add servicio bugs")
