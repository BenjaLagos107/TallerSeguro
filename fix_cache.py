import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = '<script type="module" src="./main.js"></script>'
replacement = '<script type="module" src="./main.js?v=3"></script>'

html = html.replace(target, replacement)

# If it was already v2, update to v3
target2 = '<script type="module" src="./main.js?v=2"></script>'
html = html.replace(target2, replacement)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done cache buster")
