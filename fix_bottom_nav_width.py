import os

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

target_css = """.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}"""

replacement_css = """.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem 0;
  flex: 1;
  margin: 0 0.2rem;
  transition: color 0.2s, background-color 0.2s;
}"""

if target_css in css:
    css = css.replace(target_css, replacement_css)
else:
    print("Could not find the target CSS block exactly.")

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Bump cache buster
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('href="./style.css?v=14"', 'href="./style.css?v=15"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done fixing bottom nav uniform width")
