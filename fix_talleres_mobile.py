import os
import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target_html = """            <!-- TAB TALLERES (EXISTENTE) -->
            <div id="tab-talleres" class="tab-content hidden">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <button class="btn btn-secondary btn-small" onclick="switchTab('tab-home-app')" style="padding: 0.3rem 0.6rem; border-radius: 0.5rem;" title="Volver al inicio">&larr;</button>
                        <h3 style="margin: 0;">Talleres Disponibles</h3>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">"""

replacement_html = """            <!-- TAB TALLERES (EXISTENTE) -->
            <div id="tab-talleres" class="tab-content hidden">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; width: 100%; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <button class="btn btn-secondary btn-small" onclick="switchTab('tab-home-app')" style="padding: 0.3rem 0.6rem; border-radius: 0.5rem;" title="Volver al inicio">&larr;</button>
                            <h3 style="margin: 0;">Talleres Disponibles</h3>
                        </div>
                        <button id="btn-toggle-mobile-filters" class="btn btn-secondary btn-small mobile-only" style="display: none;">Filtros ▾</button>
                    </div>
                    <div id="talleres-filters-container" style="display: flex; gap: 0.5rem; flex-wrap: wrap; width: 100%;" class="mobile-filters-hidden">"""

html = html.replace(target_html, replacement_html)

# Bump cache to v8
html = html.replace('href="./style.css?v=7"', 'href="./style.css?v=8"')
html = html.replace('src="./main.js?v=15"', 'src="./main.js?v=16"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)


# 2. Update style.css
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

mobile_css = """
  /* 9. Workshop Cards & Mobile Filters */
  .mobile-only {
    display: block !important;
  }
  .mobile-filters-hidden {
    display: none !important;
  }
  #talleres-filters-container.show {
    display: flex !important;
    flex-direction: column !important;
  }
  #talleres-filters-container select {
    width: 100% !important;
  }
  #btn-clear-filters {
    width: 100% !important;
  }
  
  /* Shrink workshop cards */
  .workshop-card {
    padding: 0.75rem !important;
    border-radius: 0.5rem !important;
  }
  .workshop-header {
    margin-bottom: 0.5rem !important;
  }
  .workshop-title {
    font-size: 1.1rem !important;
  }
  .workshop-attributes {
    gap: 0.25rem !important;
    margin-bottom: 0.75rem !important;
  }
  .workshop-attr {
    font-size: 0.8rem !important;
  }
  .workshop-actions {
    gap: 0.5rem !important;
  }
  .workshop-actions button {
    padding: 0.4rem !important;
    font-size: 0.85rem !important;
  }
}
"""

desktop_css_additions = """
/* Filtros Desktop */
#talleres-filters-container select {
  flex: 1;
  min-width: 200px;
}
@media (min-width: 769px) {
  #btn-toggle-mobile-filters {
    display: none !important;
  }
  .mobile-filters-hidden {
    display: flex !important;
  }
}
"""

# Insert inside @media max-width: 768px block
if "Workshop Cards & Mobile Filters" not in css:
    idx = css.rfind('}')
    if idx != -1:
        css = css[:idx] + mobile_css + css[idx:] + desktop_css_additions
        with open('style.css', 'w', encoding='utf-8') as f:
            f.write(css)


# 3. Update main.js
with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

toggle_logic = """
// Mobile filters toggle
document.getElementById('btn-toggle-mobile-filters')?.addEventListener('click', function() {
    const container = document.getElementById('talleres-filters-container');
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
"""

if "Mobile filters toggle" not in js:
    # Append to the end of DOMContentLoaded or globally
    js += "\n" + toggle_logic
    with open('main.js', 'w', encoding='utf-8') as f:
        f.write(js)

print("done applying workshop filters and card sizing")
