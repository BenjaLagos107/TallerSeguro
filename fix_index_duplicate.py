import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# I want to completely remove the old tab-mi-auto.
# It looks like:
# <div id="tab-mi-auto" class="tab-content hidden">
#     <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
#         <h2>🚗 Mi Garage</h2>
#         <button class="btn btn-primary btn-small" id="btn-open-add-vehiculo">+ Añadir Vehículo</button>
#     </div>
#     <div id="vehiculos-list" class="grid-list" style="margin-top: 1rem;">
#         <!-- Cards de vehiculos insertadas por JS -->
#         <p style="color: var(--text-muted);">Cargando vehículos...</p>
#     </div>
# </div>

# Wait, if btn-open-add-vehiculo is already in tab-perfil, I can just find the ONE in tab-mi-auto and remove the whole div.
tab_regex = r'<div id="tab-mi-auto".*?</div>\\s*</div>'
html = re.sub(tab_regex, '', html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done removing tab-mi-auto")
