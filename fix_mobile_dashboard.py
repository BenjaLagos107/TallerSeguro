import os

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

mobile_css_additions = """
  /* 7. Navbar Mobile Fix (Logo left, Button right) */
  .nav-container {
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 0 1rem !important;
  }
  .logo {
    font-size: 1.25rem !important;
  }
  .auth-controls {
    gap: 0.5rem !important;
  }
  #btn-soy-taller {
    padding: 0.4rem 0.5rem !important;
    font-size: 0.85rem !important;
    margin-right: 0 !important;
  }
  #btn-quiero-probarlo {
    padding: 0.4rem 0.75rem !important;
    font-size: 0.85rem !important;
  }

  /* 8. Dashboard Home Action Buttons */
  #tab-home-app > div {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.75rem !important;
  }
  #tab-home-app .card {
    padding: 1rem !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    text-align: left !important;
    gap: 1rem !important;
  }
  #tab-home-app .card span {
    font-size: 2rem !important;
    margin-bottom: 0 !important;
    flex-shrink: 0;
  }
  #tab-home-app .card h3 {
    font-size: 1.1rem !important;
    margin-bottom: 0.2rem !important;
  }
  #tab-home-app .card p {
    font-size: 0.8rem !important;
    margin-top: 0 !important;
    line-height: 1.2 !important;
  }
"""

# Insert before the last closing brace of the media query
if "Navbar Mobile Fix" not in css:
    # Find the last '}' which should be the end of the @media (max-width: 768px) block
    idx = css.rfind('}')
    if idx != -1:
        css = css[:idx] + mobile_css_additions + css[idx:]
        with open('style.css', 'w', encoding='utf-8') as f:
            f.write(css)

# Bump cache buster
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<link rel="stylesheet" href="./style.css?v=5">', '<link rel="stylesheet" href="./style.css?v=6">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done applying dashboard mobile styles")
