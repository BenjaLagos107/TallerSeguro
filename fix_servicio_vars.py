import os

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace in payload
js = js.replace("servicio_nombre: document.getElementById('add-servicio-nombre').value,", "nombre: document.getElementById('add-servicio-nombre').value,")

# Replace in rendering logic (loadOwnerDashboard)
js = js.replace("s.servicio_nombre", "s.nombre")

# Look specifically for the booking modal template
target_booking_template = """<input type="radio" name="booking-servicio" value="${s.nombre}" data-precio="${s.precio}" ${index === 0 ? 'required' : ''} style="margin: 0; width: 1.2rem; height: 1.2rem; accent-color: var(--primary);">
                    <div style="flex: 1;">
                        <strong style="display: block; color: var(--primary-color); font-size: 1.05rem;">${s.nombre}</strong>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">$${s.precio} (A"""
# The text from Python output was cut off, let me do a regex replace for data-precio and $${s.precio}
import re

# We will replace data-precio="${s.precio}" with data-precio="${s.precio_estimado}"
js = js.replace('data-precio="${s.precio}"', 'data-precio="${s.precio_estimado}"')

# We will replace $${s.precio} (A with $${s.precio_estimado} (A
js = js.replace('$${s.precio} (A', '$${s.precio_estimado} (A')

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done fixing servicio variables")
