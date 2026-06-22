import os

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

target = """    start: {
        question: '¿Qué tipo de problema o síntoma tiene tu vehículo?',
        options: [
            { text: 'Escucho un ruido raro', next: 'ruido' },
            { text: 'El auto no arranca / no prende', next: 'no_prende' },
            { text: 'Hay una luz encendida en el tablero', next: 'luces' },
            { text: 'Siento que frena mal', next: 'frenos' },
            { text: 'Mi problema no está aquí', next: 'fallback' }
        ]
    },"""

replacement = """    start: {
        question: '¿Qué tipo de problema o síntoma tiene tu vehículo?',
        options: [
            { text: '👂 Escucho un ruido raro', next: 'ruido' },
            { text: '⚡ El auto no arranca / no prende', next: 'no_prende' },
            { text: '💡 Hay una luz encendida en el tablero', next: 'luces' },
            { text: '🛑 Siento que frena mal', next: 'frenos' },
            { text: '❓ Mi problema no está aquí', next: 'fallback' }
        ]
    },"""

js = js.replace(target, replacement)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done adding emojis")
