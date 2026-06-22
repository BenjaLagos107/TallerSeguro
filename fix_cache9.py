import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = '<script type="module" src="./main.js?v=10"></script>'
replacement = '<script type="module" src="./main.js?v=11"></script>'

html = html.replace(target, replacement)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done v11 cache buster")
