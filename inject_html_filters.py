import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Filter HTML to inject
filter_html_template = """
                    <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 1rem; width: 100%;">
                        <button id="{toggle_id}" class="btn btn-secondary btn-small mobile-only" style="display: none;">Filtros ▾</button>
                    </div>
                    <div id="{container_id}" style="display: flex; gap: 0.5rem; flex-wrap: wrap; width: 100%; margin-bottom: 1rem;" class="mobile-filters-hidden">
                        <select id="{sort_id}" style="padding: 0.5rem; border-radius: 0.5rem; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); flex: 1; min-width: 200px;">
                            <option value="default">Orden por Defecto</option>
                            <option value="rating">Mejor Calificados</option>
                            <option value="precio_asc">Precio: Menor a Mayor</option>
                            <option value="precio_desc">Precio: Mayor a Menor</option>
                        </select>
                        <select id="{sector_id}" style="padding: 0.5rem; border-radius: 0.5rem; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); flex: 1; min-width: 200px;">
                            <option value="">Todos los sectores</option>
                            <option value="Estación Central">Estación Central</option>
                            <option value="Huechuraba">Huechuraba</option>
                            <option value="Independencia">Independencia</option>
                            <option value="La Florida">La Florida</option>
                            <option value="La Reina">La Reina</option>
                            <option value="Las Condes">Las Condes</option>
                            <option value="Lo Barnechea">Lo Barnechea</option>
                            <option value="Macul">Macul</option>
                            <option value="Maipú">Maipú</option>
                            <option value="Peñalolén">Peñalolén</option>
                            <option value="Providencia">Providencia</option>
                            <option value="Puente Alto">Puente Alto</option>
                            <option value="Quilicura">Quilicura</option>
                            <option value="Recoleta">Recoleta</option>
                            <option value="San Miguel">San Miguel</option>
                            <option value="Santiago Centro">Santiago Centro</option>
                            <option value="Vitacura">Vitacura</option>
                            <option value="Ñuñoa">Ñuñoa</option>
                        </select>
                        <button id="{clear_id}" class="btn btn-secondary btn-small" style="padding: 0.5rem 1rem; width: 100%;" title="Limpiar Filtros">✖ Limpiar Filtros</button>
                    </div>
"""

# 1. Inject into Servicios
servicios_filter_html = filter_html_template.format(
    toggle_id="btn-toggle-mobile-filters-servicios",
    container_id="servicios-filters-container",
    sort_id="sort-servicios",
    sector_id="filter-sector-servicios",
    clear_id="btn-clear-filters-servicios"
)

if 'id="servicios-filters-container"' not in html:
    html = html.replace('<div id="servicios-list" class="grid-list"></div>', servicios_filter_html + '\n                    <div id="servicios-list" class="grid-list"></div>')

# 2. Inject into Assistant
assistant_filter_html = filter_html_template.format(
    toggle_id="btn-toggle-mobile-filters-assistant",
    container_id="assistant-filters-container",
    sort_id="sort-assistant",
    sector_id="filter-sector-assistant",
    clear_id="btn-clear-filters-assistant"
)

if 'id="assistant-filters-container"' not in html:
    html = html.replace('<div id="assistant-talleres-list" class="grid-list" style="margin-top: 1rem;"></div>', assistant_filter_html + '\n                        <div id="assistant-talleres-list" class="grid-list" style="margin-top: 1rem;"></div>')

# Bump Cache
html = html.replace('href="./style.css?v=10"', 'href="./style.css?v=11"')
html = html.replace('src="./main.js?v=18"', 'src="./main.js?v=19"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done HTML injection")
