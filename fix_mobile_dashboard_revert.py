import os

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

target = """/* 8. Dashboard Home Action Buttons */
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
}"""

replacement = """/* 8. Dashboard Home Action Buttons */
  #tab-home-app > div {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 1rem !important;
  }
  #tab-home-app .card {
    padding: 1.5rem !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
  }
  #tab-home-app .card span {
    font-size: 2.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  #tab-home-app .card h3 {
    font-size: 1.2rem !important;
    margin-bottom: 0 !important;
  }
  #tab-home-app .card p {
    display: none !important; /* Hide description on mobile to save space */
  }
}"""

css = css.replace(target, replacement)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Bump cache buster
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<link rel="stylesheet" href="./style.css?v=6">', '<link rel="stylesheet" href="./style.css?v=7">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done reverting button styles")
