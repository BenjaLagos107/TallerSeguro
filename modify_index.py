import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add btn-soy-taller
auth_controls = '''            <div class="auth-controls" id="auth-controls">
                <button id="btn-quiero-probarlo" class="btn btn-primary">Quiero probarlo</button>'''

new_auth_controls = '''            <div class="auth-controls" id="auth-controls">
                <button id="btn-soy-taller" class="btn btn-secondary" style="margin-right: 1rem; border: none; background: transparent; padding: 0.5rem 1rem;">Soy Taller</button>
                <button id="btn-quiero-probarlo" class="btn btn-primary">Quiero probarlo</button>'''

html = html.replace(auth_controls, new_auth_controls)

# 2. Add btn-ir-a-taller inside tab-perfil
perfil_section = '''                    <button class="btn btn-secondary" id="btn-logout-profile" style="color: var(--error); border-color: var(--error); margin-top: 2rem; width: 100%;">
                        Cerrar Sesión
                    </button>'''

new_perfil_section = '''                    <button class="btn btn-primary" id="btn-ir-a-taller" style="width: 100%; margin-top: 1rem;">⚙️ Inscribir / Administrar mi Taller</button>
                    
                    <button class="btn btn-secondary" id="btn-logout-profile" style="color: var(--error); border-color: var(--error); margin-top: 1rem; width: 100%;">
                        Cerrar Sesión
                    </button>'''

html = html.replace(perfil_section, new_perfil_section)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done index.html")
