import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# We know the content from the diff:
to_remove = """            <div id="tab-mi-auto" class="tab-content hidden">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>🚗 Mi Garage</h2>
                    <button class="btn btn-primary btn-small" id="btn-open-add-vehiculo">+ Añadir Vehículo</button>
                </div>
                <div id="vehiculos-list" class="grid-list" style="margin-top: 1rem;">
                    <!-- Cards de vehiculos insertadas por JS -->
                    <p style="color: var(--text-muted);">Cargando vehículos...</p>
                </div>
            </div>"""

if to_remove in html:
    html = html.replace(to_remove, "")
else:
    # Try normalizing line endings just in case
    to_remove_crlf = to_remove.replace("\\n", "\\r\\n")
    html = html.replace(to_remove_crlf, "")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done removing exact string")
