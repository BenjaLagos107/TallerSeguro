import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = '<button class="btn btn-primary" id="btn-ir-a-taller" style="width: 100%; margin-top: 1rem;">⚙️ Inscribir / Administrar mi Taller</button>'

if target in html:
    html = html.replace(target, '')
else:
    print("Could not find the target string exactly, falling back to line by line removal.")
    lines = html.split('\n')
    new_lines = [line for line in lines if 'Inscribir / Administrar mi Taller' not in line]
    html = '\n'.join(new_lines)

# Bump cache
html = html.replace('href="./style.css?v=12"', 'href="./style.css?v=13"')
html = html.replace('src="./main.js?v=20"', 'src="./main.js?v=21"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done removing button")
