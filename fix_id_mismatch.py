import os

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# First check if the assistant html injection actually worked
if 'id="assistant-filters-container"' not in html:
    # the previous injection string:
    # '<div id="assistant-talleres-list" class="grid-list" style="margin-top: 1rem;"></div>'
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

    servicios_filter_html = filter_html_template.format(
        toggle_id="btn-toggle-mobile-filters-servicios",
        container_id="servicios-filters-container",
        sort_id="sort-servicios",
        sector_id="filter-sector-servicios",
        clear_id="btn-clear-filters-servicios"
    )

    assistant_filter_html = filter_html_template.format(
        toggle_id="btn-toggle-mobile-filters-assistant",
        container_id="assistant-filters-container",
        sort_id="sort-assistant",
        sector_id="filter-sector-assistant",
        clear_id="btn-clear-filters-assistant"
    )

    # Let's do it properly now by injecting right above the list
    html = html.replace(
        '<div id="servicios-talleres-list" class="grid-list">',
        servicios_filter_html + '\n                <div id="servicios-talleres-list" class="grid-list">'
    )
    
    html = html.replace(
        '<div id="assistant-talleres-list" class="grid-list" style="margin-top: 1rem;">',
        assistant_filter_html + '\n                        <div id="assistant-talleres-list" class="grid-list" style="margin-top: 1rem;">'
    )
    
    # Bump cache
    html = html.replace('href="./style.css?v=11"', 'href="./style.css?v=12"')
    html = html.replace('src="./main.js?v=19"', 'src="./main.js?v=20"')

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)

# 2. Update main.js
with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# I used 'servicios-list' in two places:
# 1. Inside `updateServiciosList` function
js = js.replace("'servicios-list'", "'servicios-talleres-list'")

# 2. Inside `btn.addEventListener('click', ...)` replacing what I thought was 'servicios-list'
# Wait, let's just make sure all instances of 'servicios-list' are replaced with 'servicios-talleres-list'
# except maybe the variable `serviciosList` (which is without quotes)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done fixing IDs")
