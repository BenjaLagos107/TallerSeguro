import os

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

mobile_css = """
/* ==========================================
   GLOBAL MOBILE RESPONSIVENESS OVERRIDES
   ========================================== */
@media (max-width: 768px) {
  /* 1. Global Container */
  .container {
    padding: 1rem !important;
  }

  /* 2. Landing Page */
  .landing-redesign {
    padding: 1rem 0 2rem !important;
  }
  .landing-redesign h1 {
    font-size: 2rem !important;
    margin-bottom: 1rem !important;
  }
  .hero-subtitle {
    font-size: 1rem !important;
    margin-bottom: 1.5rem !important;
  }
  .badge-pill {
    margin-bottom: 1rem !important;
  }

  /* 3. General Buttons */
  .btn-large {
    padding: 0.75rem 1rem !important;
    font-size: 1rem !important;
  }
  
  /* 4. Filter / Search Service Buttons */
  .services-filter-container {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 0.5rem !important;
  }
  .btn-service-filter {
    padding: 0.5rem 0.75rem !important;
    font-size: 0.85rem !important;
    flex: 1 1 auto !important;
    text-align: center;
  }

  /* 5. Cards & Modals */
  .card, .workshop-card {
    padding: 1rem !important;
  }
  .modal-content {
    padding: 1.5rem !important;
  }

  /* 6. Fix for inputs in mobile */
  input, textarea, select {
    font-size: 16px !important; /* Prevents iOS auto-zoom on focus */
  }
}
"""

if "GLOBAL MOBILE RESPONSIVENESS OVERRIDES" not in css:
    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css + mobile_css)

# Bump cache buster
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<link rel="stylesheet" href="./style.css?v=4">', '<link rel="stylesheet" href="./style.css?v=5">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done applying mobile styles")
