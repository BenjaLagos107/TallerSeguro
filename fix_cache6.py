import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = '<script type="module" src="./main.js?v=7"></script>'
replacement = '<script type="module" src="./main.js?v=8"></script>'

html = html.replace(target, replacement)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done v8 cache buster")
