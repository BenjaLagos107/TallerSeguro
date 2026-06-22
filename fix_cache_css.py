import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = '<link rel="stylesheet" href="./style.css">'
replacement = '<link rel="stylesheet" href="./style.css?v=2">'

html = html.replace(target, replacement)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done css cache buster")
