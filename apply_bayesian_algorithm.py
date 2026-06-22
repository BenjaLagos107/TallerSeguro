import os

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Inject the helper function globally
helper_function = """
window.sortAndHighlightBestTaller = function(talleresArray) {
    if (!talleresArray || talleresArray.length === 0) return null;
    
    let bestTallerId = null;
    let bestTallerIndex = -1;
    let maxBayesianScore = -1;
    
    // Constantes del promedio Bayesiano
    const C = 3; // Nmero de reseas asumidas (peso del promedio base)
    const m = 4.0; // Promedio base asumido (estrellas)
    
    talleresArray.forEach((t, i) => {
        if (t.total_resenas > 0) {
            // Formula Bayesiana
            const score = (t.promedio * t.total_resenas + C * m) / (t.total_resenas + C);
            if (score > maxBayesianScore) {
                maxBayesianScore = score;
                bestTallerId = t.id;
                bestTallerIndex = i;
            }
        }
    });
    
    if (bestTallerIndex > -1) {
        const bestTaller = talleresArray.splice(bestTallerIndex, 1)[0];
        talleresArray.unshift(bestTaller);
    }
    
    return bestTallerId;
};

"""

if "window.sortAndHighlightBestTaller" not in js:
    # Inject it before window.openVehicleHistoryModal
    idx = js.find('window.openVehicleHistoryModal')
    if idx != -1:
        # Go back to start of line or block
        idx = js.rfind('// =====================================', 0, idx)
        js = js[:idx] + helper_function + js[idx:]
    else:
        js += "\n" + helper_function

# 2. Refactor loadUserDashboard
target_load_dashboard = """        // Determinar cuál es el mejor calificado en esta vista y forzarlo al inicio
        let bestTallerId = null;
        let bestTallerIndex = -1;
        if (talleres.length > 0) {
            let maxRating = -1;
            talleres.forEach((t, i) => {
                if (t.promedio > maxRating) {
                    maxRating = t.promedio;
                    bestTallerId = t.id;
                    bestTallerIndex = i;
                }
            });
            if (maxRating > 0 && bestTallerIndex > -1) {
                // Move it to the front
                const bestTaller = talleres.splice(bestTallerIndex, 1)[0];
                talleres.unshift(bestTaller);
            } else {
                bestTallerId = null;
            }
        }"""
# In case of unicode issues
target_load_dashboard_2 = """        let bestTallerId = null;
        let bestTallerIndex = -1;
        if (talleres.length > 0) {
            let maxRating = -1;
            talleres.forEach((t, i) => {
                if (t.promedio > maxRating) {
                    maxRating = t.promedio;
                    bestTallerId = t.id;
                    bestTallerIndex = i;
                }
            });
            if (maxRating > 0 && bestTallerIndex > -1) {
                // Move it to the front
                const bestTaller = talleres.splice(bestTallerIndex, 1)[0];
                talleres.unshift(bestTaller);
            } else {
                bestTallerId = null;
            }
        }"""

replacement_load_dashboard = """        const bestTallerId = window.sortAndHighlightBestTaller(talleres);"""

if target_load_dashboard in js:
    js = js.replace(target_load_dashboard, replacement_load_dashboard)
elif target_load_dashboard_2 in js:
    # also remove the preceding comment line if present
    js = js.replace(target_load_dashboard_2, replacement_load_dashboard)

# 3. Refactor renderTalleresPorServicio
target_servicios = """                    let bestId = null;
                    let maxRat = -1;
                    filtered.forEach(t => {
                        if (t.promedio > maxRat) {
                            maxRat = t.promedio;
                            bestId = t.id;
                        }
                    });
                    if (maxRat === 0) bestId = null;"""
replacement_servicios = """                    const bestId = window.sortAndHighlightBestTaller(filtered);"""

if target_servicios in js:
    js = js.replace(target_servicios, replacement_servicios)

# 4. Refactor showAssistantDiagnosis
target_assistant = """        let bestId = null;
        let maxRat = -1;
        filtered.forEach(t => {
            if (t.promedio > maxRat) {
                maxRat = t.promedio;
                bestId = t.id;
            }
        });
        if (maxRat === 0) bestId = null;"""
replacement_assistant = """        const bestId = window.sortAndHighlightBestTaller(filtered);"""

if target_assistant in js:
    js = js.replace(target_assistant, replacement_assistant)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

# Bump cache buster
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<script type="module" src="./main.js?v=17"></script>', '<script type="module" src="./main.js?v=18"></script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done applying Bayesian algorithm globally")
