import os
import re

# 1. Update style.css
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

mobile_css_fixes = """
  /* 10. Final Mobile Fixes */
  .logo {
    font-size: 1.1rem !important;
    white-space: nowrap !important;
  }
  .workshop-card {
    padding: 0.5rem !important;
  }
  .workshop-attributes {
    gap: 0 !important;
    margin-bottom: 0.5rem !important;
  }
  .workshop-attr {
    padding: 0.1rem 0 !important;
  }
  .workshop-header {
    margin-bottom: 0.2rem !important;
  }
}
"""

if "Final Mobile Fixes" not in css:
    idx = css.rfind('}')
    if idx != -1:
        css = css[:idx] + mobile_css_fixes + css[idx:]
        with open('style.css', 'w', encoding='utf-8') as f:
            f.write(css)


# 2. Update main.js
with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

target_js = """        // Determinar cuál es el mejor calificado en esta vista
        let bestTallerId = null;
        if (talleres.length > 0) {
            let maxRating = -1;
            talleres.forEach(t => {
                if (t.promedio > maxRating) {
                    maxRating = t.promedio;
                    bestTallerId = t.id;
                }
            });
            // Si el mejor no tiene reseñas (promedio 0), no destacamos nada
            if (maxRating === 0) bestTallerId = null;
        }"""

# Fallback for unicode issues, try to find by string prefix/suffix
if target_js not in js:
    target_js = """        // Determinar cul es el mejor calificado en esta vista
        let bestTallerId = null;
        if (talleres.length > 0) {
            let maxRating = -1;
            talleres.forEach(t => {
                if (t.promedio > maxRating) {
                    maxRating = t.promedio;
                    bestTallerId = t.id;
                }
            });
            // Si el mejor no tiene reseas (promedio 0), no destacamos nada
            if (maxRating === 0) bestTallerId = null;
        }"""

replacement_js = """        // Determinar cuál es el mejor calificado en esta vista y forzarlo al inicio
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

if "forzarlo al inicio" not in js:
    # Just to be extremely robust if exact match fails
    start_idx = js.find("let bestTallerId = null;")
    end_idx = js.find("const grid = document.getElementById('talleres-list');")
    if start_idx != -1 and end_idx != -1:
        # back up a little from start_idx to grab the comment
        start_idx = js.rfind("//", 0, start_idx)
        target_exact = js[start_idx:end_idx]
        js = js.replace(target_exact, replacement_js + "\n\n        ")
        
        with open('main.js', 'w', encoding='utf-8') as f:
            f.write(js)

# Bump cache buster
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<link rel="stylesheet" href="./style.css?v=8">', '<link rel="stylesheet" href="./style.css?v=9">')
html = html.replace('<script type="module" src="./main.js?v=16"></script>', '<script type="module" src="./main.js?v=17"></script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done applying final mobile fixes")
