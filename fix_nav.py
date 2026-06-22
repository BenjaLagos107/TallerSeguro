import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Exact string replacement to be extremely safe
target = '                    <button class="nav-item" data-tab="tab-mi-auto">🚗 Mi Garage</button>\\n'
if target in html:
    html = html.replace(target, '')
else:
    # Try with \r\n
    target_crlf = '                    <button class="nav-item" data-tab="tab-mi-auto">🚗 Mi Garage</button>\\r\\n'
    html = html.replace(target_crlf, '')

# If it still didn't work because of spaces, let's just do a substring replacement without the indentation
target2 = '<button class="nav-item" data-tab="tab-mi-auto">🚗 Mi Garage</button>'
html = html.replace(target2, '')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done removing garage nav item")
