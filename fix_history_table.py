import os

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix table name
js = js.replace(".from('reservas')", ".from('ordenes_trabajo')")

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done fixing table name")
