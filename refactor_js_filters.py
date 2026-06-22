import os

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Global Filter Function and Variables
global_filter_logic = """
window.currentSelectedService = null;
window.currentAssistantSpecialty = null;

window.filterSortAndRenderTalleres = function(baseTalleresArray, containerId, specialtyParam, sectorValue, sortValue) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!baseTalleresArray || baseTalleresArray.length === 0) {
        container.innerHTML = '<p>No hay talleres disponibles.</p>';
        return;
    }
    
    // 1. Filter by specialty (if provided)
    let filtered = [...baseTalleresArray];
    if (specialtyParam) {
        filtered = filtered.filter(t => {
            if (!t.especialidades) return false;
            let arr = [];
            if (Array.isArray(t.especialidades)) arr = t.especialidades;
            else {
                try {
                    arr = JSON.parse(t.especialidades);
                    if (!Array.isArray(arr)) arr = [t.especialidades];
                } catch(e) {
                    arr = [t.especialidades];
                }
            }
            return arr.includes(specialtyParam);
        });
    }
    
    // 2. Filter by sector
    if (sectorValue) {
        filtered = filtered.filter(t => t.sector === sectorValue);
    }
    
    // 3. Sort
    if (sortValue === 'rating') {
        filtered.sort((a, b) => b.promedio - a.promedio);
    } else if (sortValue === 'precio_asc') {
        filtered.sort((a, b) => (a.rango_precios || '').length - (b.rango_precios || '').length);
    } else if (sortValue === 'precio_desc') {
        filtered.sort((a, b) => (b.rango_precios || '').length - (a.rango_precios || '').length);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '<p>No hay talleres que coincidan con estos filtros.</p>';
        return;
    }
    
    // 4. Highlight best (Bayesian)
    const bestId = window.sortAndHighlightBestTaller(filtered);
    
    // 5. Render
    filtered.forEach(t => {
        container.appendChild(createWorkshopCardNode(t, bestId));
    });
};

// Eventos universales para toggle mobile
function setupMobileFilterToggles() {
    ['talleres', 'servicios', 'assistant'].forEach(prefix => {
        const btn = document.getElementById(`btn-toggle-mobile-filters-${prefix === 'talleres' ? '' : prefix}`);
        // para talleres el boton era btn-toggle-mobile-filters, mantendremos compatibilidad o lo mapeamos
        const realBtn = document.getElementById(`btn-toggle-mobile-filters${prefix === 'talleres' ? '' : '-'+prefix}`);
        const container = document.getElementById(`${prefix}-filters-container`);
        
        if (realBtn && container) {
            // Remove previous listeners if any by cloning
            const newBtn = realBtn.cloneNode(true);
            realBtn.parentNode.replaceChild(newBtn, realBtn);
            
            newBtn.addEventListener('click', function() {
                if (container.classList.contains('mobile-filters-hidden')) {
                    container.classList.remove('mobile-filters-hidden');
                    container.classList.add('show');
                    this.textContent = 'Filtros ▴';
                } else {
                    container.classList.add('mobile-filters-hidden');
                    container.classList.remove('show');
                    this.textContent = 'Filtros ▾';
                }
            });
        }
    });
}
"""

if "window.filterSortAndRenderTalleres =" not in js:
    idx = js.find('// =====================================\n// HISTORIAL DE VEHICULO')
    if idx != -1:
        js = js[:idx] + global_filter_logic + '\n\n' + js[idx:]
    else:
        js += '\n\n' + global_filter_logic


# 2. Add event listeners for new views
new_event_listeners = """
    // Eventos de Servicios
    const sectorServicios = document.getElementById('filter-sector-servicios');
    const sortServicios = document.getElementById('sort-servicios');
    const clearServicios = document.getElementById('btn-clear-filters-servicios');
    
    function updateServiciosList() {
        if (!window.currentSelectedService) return;
        window.filterSortAndRenderTalleres(
            window.talleres, 
            'servicios-list', 
            window.currentSelectedService, 
            sectorServicios ? sectorServicios.value : '', 
            sortServicios ? sortServicios.value : 'default'
        );
    }
    
    if (sectorServicios) sectorServicios.addEventListener('change', updateServiciosList);
    if (sortServicios) sortServicios.addEventListener('change', updateServiciosList);
    if (clearServicios) clearServicios.addEventListener('click', () => {
        if (sectorServicios) sectorServicios.value = "";
        if (sortServicios) sortServicios.value = "default";
        updateServiciosList();
    });

    // Eventos de Assistant
    const sectorAssistant = document.getElementById('filter-sector-assistant');
    const sortAssistant = document.getElementById('sort-assistant');
    const clearAssistant = document.getElementById('btn-clear-filters-assistant');
    
    function updateAssistantList() {
        if (!window.currentAssistantSpecialty) return;
        window.filterSortAndRenderTalleres(
            window.talleres, 
            'assistant-talleres-list', 
            window.currentAssistantSpecialty, 
            sectorAssistant ? sectorAssistant.value : '', 
            sortAssistant ? sortAssistant.value : 'default'
        );
    }
    
    if (sectorAssistant) sectorAssistant.addEventListener('change', updateAssistantList);
    if (sortAssistant) sortAssistant.addEventListener('change', updateAssistantList);
    if (clearAssistant) clearAssistant.addEventListener('click', () => {
        if (sectorAssistant) sectorAssistant.value = "";
        if (sortAssistant) sortAssistant.value = "default";
        updateAssistantList();
    });
    
    setupMobileFilterToggles();
"""

if "Eventos de Servicios" not in js:
    # Inject near the other event listeners (search for filter-sector)
    idx = js.find("if (filterSector) filterSector.addEventListener('change', loadUserDashboard);")
    if idx != -1:
        # Find the end of this block
        end_idx = js.find("const formAddResena = document.getElementById('form-add-resena');")
        if end_idx != -1:
            js = js[:end_idx] + new_event_listeners + '\n\n    ' + js[end_idx:]


# 3. Refactor btn-service-filter click
target_btn_service = """            const filtered = window.talleres.filter(t => {
                if (!t.especialidades) return false;
                let arr = [];
                if (Array.isArray(t.especialidades)) arr = t.especialidades;
                else {
                    try {
                        arr = JSON.parse(t.especialidades);
                        if (!Array.isArray(arr)) arr = [t.especialidades];
                    } catch(e) {
                        arr = [t.especialidades];
                    }
                }
                return arr.includes(selectedService);
            });
            
            if (serviciosList) {
                serviciosList.innerHTML = '';
                if (filtered.length === 0) {
                    serviciosList.innerHTML = '<p>No hay talleres disponibles para este servicio específico.</p>';
                } else {
                    const bestId = window.sortAndHighlightBestTaller(filtered);
                    
                    filtered.forEach(t => {
                        serviciosList.appendChild(createWorkshopCardNode(t, bestId));
                    });
                }
            }"""

replacement_btn_service = """            window.currentSelectedService = selectedService;
            const sectorServicios = document.getElementById('filter-sector-servicios');
            const sortServicios = document.getElementById('sort-servicios');
            window.filterSortAndRenderTalleres(
                window.talleres, 
                'servicios-list', 
                selectedService, 
                sectorServicios ? sectorServicios.value : '', 
                sortServicios ? sortServicios.value : 'default'
            );"""

if "window.currentSelectedService = selectedService;" not in js:
    js = js.replace(target_btn_service, replacement_btn_service)


# 4. Refactor showAssistantDiagnosis
target_assistant_render = """        const filtered = window.talleres.filter(t => {
            if (!t.especialidades) return false;
            let arr = [];
            if (Array.isArray(t.especialidades)) arr = t.especialidades;
            else {
                try {
                    arr = JSON.parse(t.especialidades);
                    if (!Array.isArray(arr)) arr = [t.especialidades];
                } catch(e) {
                    arr = [t.especialidades];
                }
            }
            return arr.includes(specialty);
        });

        const bestId = window.sortAndHighlightBestTaller(filtered);

        filtered.forEach(t => {
            listContainer.appendChild(createWorkshopCardNode(t, bestId));
        });"""

replacement_assistant_render = """        window.currentAssistantSpecialty = specialty;
        const sectorAssistant = document.getElementById('filter-sector-assistant');
        const sortAssistant = document.getElementById('sort-assistant');
        window.filterSortAndRenderTalleres(
            window.talleres, 
            'assistant-talleres-list', 
            specialty, 
            sectorAssistant ? sectorAssistant.value : '', 
            sortAssistant ? sortAssistant.value : 'default'
        );"""

# Sometimes the javascript has weird characters from previous replacements, let's use a regex or string fallback
if "window.currentAssistantSpecialty = specialty;" not in js:
    # Manual finding
    a_start = js.find("const filtered = window.talleres.filter(t => {")
    a_end = js.find("listContainer.appendChild(createWorkshopCardNode(t, bestId));\n        });")
    if a_start != -1 and a_end != -1:
        # include the closing of the forEach
        a_end += len("listContainer.appendChild(createWorkshopCardNode(t, bestId));\n        });")
        js = js[:a_start] + replacement_assistant_render + js[a_end:]

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done Javascript refactor for global filters")
