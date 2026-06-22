import os

# 1. Update style.css
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace the previous "Final Mobile Fixes" and "Workshop Cards" logic
target_css = """  /* 10. Final Mobile Fixes */
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
}"""

replacement_css = """  /* 10. Final Mobile Fixes */
  .logo {
    font-size: 1rem !important;
    white-space: nowrap !important;
    display: flex !important;
    align-items: center !important;
  }
  .auth-controls {
    flex-wrap: nowrap !important;
  }
  #btn-soy-taller {
    white-space: nowrap !important;
  }
  #btn-quiero-probarlo {
    white-space: nowrap !important;
  }
  .workshop-card {
    padding: 0.75rem !important;
    gap: 0.25rem !important;
  }
  .workshop-header {
    margin-bottom: 0 !important;
  }
  .workshop-rating {
    margin-bottom: 0.1rem !important;
  }
  .workshop-title {
    font-size: 1.1rem !important;
    margin-bottom: 0.1rem !important;
  }
  .workshop-attributes {
    gap: 0 !important;
    margin-bottom: 0 !important;
  }
  .workshop-attr {
    padding: 0.15rem 0 !important;
    font-size: 0.8rem !important;
  }
  .workshop-actions {
    margin-top: 0.25rem !important;
  }
}"""

if target_css in css:
    css = css.replace(target_css, replacement_css)
else:
    # If not found, just append
    idx = css.rfind('}')
    if idx != -1:
        css = css[:idx] + replacement_css + css[idx:]

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)


# Bump cache buster
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<link rel="stylesheet" href="./style.css?v=9">', '<link rel="stylesheet" href="./style.css?v=10">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done applying ultimate mobile fixes")
