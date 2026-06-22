import os

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace emojis only in top-nav
target_inicio = '<button class="nav-item active" data-tab="tab-home-app">🏠 Inicio</button>'
html = html.replace(target_inicio, '<button class="nav-item active" data-tab="tab-home-app">Inicio</button>')

target_reservas = '<button class="nav-item" data-tab="tab-mis-reservas">📅 Reservas</button>'
html = html.replace(target_reservas, '<button class="nav-item" data-tab="tab-mis-reservas">Reservas</button>')

target_perfil = '<button class="nav-item" data-tab="tab-perfil">👤 Mi Perfil</button>'
html = html.replace(target_perfil, '<button class="nav-item" data-tab="tab-perfil">Mi Perfil</button>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Update main.js
with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace "Mis Reservas" empty state
target_reservas_empty = "grid.innerHTML = '<p>No tienes reservas activas.</p>';"
replacement_reservas_empty = """grid.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; width: 100%; grid-column: 1 / -1; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                    <p style="color: var(--text-muted); margin-bottom: 1rem; font-size: 1.1rem;">Aún no tienes reservas activas.</p>
                    <button class="btn btn-primary" onclick="switchTab('tab-home-app')">Buscar Servicios</button>
                </div>
            `;"""
js = js.replace(target_reservas_empty, replacement_reservas_empty)

# Replace "Mi garage" empty state
target_vehiculos_empty = "gridVehiculos.innerHTML = '<p>Aún no tienes vehículos guardados. Se guardarán automáticamente cuando hagas una reserva.</p>';"
replacement_vehiculos_empty = """gridVehiculos.innerHTML = `
                <div style="text-align: center; padding: 2rem 1rem; width: 100%; grid-column: 1 / -1; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                    <p style="color: var(--text-muted); margin-bottom: 1rem;">No tienes vehículos registrados en tu garage.</p>
                    <button class="btn btn-primary btn-small" onclick="document.getElementById('modal-add-vehiculo').classList.remove('hidden')">+ Añadir mi primer vehículo</button>
                </div>
            `;"""
js = js.replace(target_vehiculos_empty, replacement_vehiculos_empty)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

# Bump cache buster
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('href="./style.css?v=15"', 'href="./style.css?v=16"')
html = html.replace('src="./main.js?v=21"', 'src="./main.js?v=22"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done fixing details")
