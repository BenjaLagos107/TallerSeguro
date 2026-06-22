import os

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace payload
js = js.replace("tiempo_estimado: `${tiempoValor} ${tiempoUnidad}`", "tiempo_estimado_valor: parseInt(tiempoValor, 10),\n                tiempo_estimado_unidad: tiempoUnidad")

# Replace in UI
js = js.replace("${s.tiempo_estimado}", "${s.tiempo_estimado_valor} ${s.tiempo_estimado_unidad}")

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done fixing tiempo_estimado")
