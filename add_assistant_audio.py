import os
import re

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Replace the assistantTree
target_tree_pattern = r"const assistantTree = \{.*?start: \{.*?\}\n\};\n"

new_tree = """const assistantTree = {
    start: {
        question: '¿Qué tipo de problema o síntoma tiene tu vehículo?',
        options: [
            { text: 'Escucho un ruido raro', next: 'ruido' },
            { text: 'El auto no arranca / no prende', next: 'no_prende' },
            { text: 'Hay una luz encendida en el tablero', next: 'luces' },
            { text: 'Siento que frena mal', next: 'frenos' },
            { text: 'Mi problema no está aquí', next: 'fallback' }
        ]
    },
    ruido: {
        question: '¿En qué momento escuchas el ruido?',
        options: [
            { text: 'Al pisar el freno (Chillido metálico)', audio: './assets/audio/frenos.mp3', diagnosis: 'Problema en pastillas o discos de freno.', specialty: 'Frenos' },
            { text: 'Chillido agudo al acelerar (Correa)', audio: './assets/audio/correa.mp3', diagnosis: 'Posible falla de correas o poleas.', specialty: 'Mecánica General' },
            { text: 'Constantemente desde el motor (Golpeteo)', audio: './assets/audio/motor.mp3', diagnosis: 'Posible falla interna del motor, válvulas o metales.', specialty: 'Mecánica General' },
            { text: 'Al pasar un bache (Ruido sordo)', audio: './assets/audio/suspension.mp3', diagnosis: 'Problema en dirección o suspensión.', specialty: 'Suspensión y Dirección' },
            { text: 'No estoy seguro', next: 'fallback' }
        ]
    },
    no_prende: {
        question: '¿Hace algún sonido al girar la llave o apretar el botón?',
        options: [
            { text: "Hace un sonido rápido como 'click click' y no enciende", audio: './assets/audio/falla_motor.mp3', diagnosis: 'Batería descargada o terminales sueltos.', specialty: 'Electromecánica' },
            { text: 'Gira el motor normalmente pero no arranca', diagnosis: 'Problema de inyección o encendido (bujías/bobinas).', specialty: 'Mecánica General' },
            { text: 'No hace absolutamente nada, todo apagado', diagnosis: 'Batería completamente muerta o fusible principal quemado.', specialty: 'Electromecánica' },
            { text: 'Mi problema no está aquí', next: 'fallback' }
        ]
    },
    luces: {
        question: '¿Qué color tiene la luz del tablero principal que te preocupa?',
        options: [
            { text: 'Roja (Aceite, Temperatura, Batería)', diagnosis: 'Alerta crítica. Detén el vehículo. Requiere revisión urgente.', specialty: 'Mecánica General' },
            { text: 'Amarilla / Naranja (Check Engine, ABS)', diagnosis: 'Alerta de precaución. El sistema detectó un fallo.', specialty: 'Diagnóstico Electrónico' },
            { text: 'No sé el color, pero está prendida', next: 'fallback' }
        ]
    },
    frenos: {
        question: '¿Qué sientes exactamente al frenar?',
        options: [
            { text: 'El pedal se va al fondo o se siente esponjoso', diagnosis: 'Fuga de líquido de frenos o aire en el sistema.', specialty: 'Frenos' },
            { text: 'El auto vibra o tiembla mucho', diagnosis: 'Discos de freno rectificados o deformados.', specialty: 'Frenos' },
            { text: 'Mi problema no está aquí', next: 'fallback' }
        ]
    }
};
"""
js = re.sub(target_tree_pattern, new_tree, js, flags=re.DOTALL)

# 2. Replace the renderAssistantNode buttons generation
target_render = """    node.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.style.width = '100%';
        btn.style.textAlign = 'center';
        btn.textContent = opt.text;
        btn.onclick = () => window.handleAssistantOption(opt);
        optionsContainer.appendChild(btn);
    });"""

new_render = """    node.options.forEach(opt => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '0.5rem';
        wrapper.style.width = '100%';

        if (opt.audio) {
            const audioBtn = document.createElement('button');
            audioBtn.className = 'btn btn-secondary';
            audioBtn.style.padding = '0.5rem 1rem';
            audioBtn.style.fontSize = '1.2rem';
            audioBtn.innerHTML = '🔊';
            audioBtn.title = 'Escuchar sonido de ejemplo';
            audioBtn.onclick = (e) => {
                e.stopPropagation();
                new Audio(opt.audio).play();
            };
            wrapper.appendChild(audioBtn);
        }

        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.style.flex = '1';
        btn.style.textAlign = 'center';
        btn.textContent = opt.text;
        btn.onclick = () => window.handleAssistantOption(opt);
        
        wrapper.appendChild(btn);
        optionsContainer.appendChild(wrapper);
    });"""
js = js.replace(target_render, new_render)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done adding audio logic")
