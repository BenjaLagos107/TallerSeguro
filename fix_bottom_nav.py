import os

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

target_css = """.bottom-nav-item.active {
  color: var(--primary-color);
}"""

replacement_css = """.bottom-nav-item.active {
  color: var(--primary-color);
  background-color: rgba(59, 130, 246, 0.2);
  border-radius: 12px;
}"""

if target_css in css:
    css = css.replace(target_css, replacement_css)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Bump cache buster
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('href="./style.css?v=13"', 'href="./style.css?v=14"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done adding active background")
