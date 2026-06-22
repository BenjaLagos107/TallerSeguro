import os

with open('main.js', 'r', encoding='utf-8') as f:
    code = f.read()

old_btn = """                const logoutBtn = document.getElementById('btn-logout-profile');
                if (logoutBtn) {
                    logoutBtn.textContent = 'Iniciar Sesión';
                    logoutBtn.style.color = 'var(--text)';
                    logoutBtn.style.borderColor = 'rgba(255,255,255,0.1)';
                }"""

new_btn = """                const logoutBtn = document.getElementById('btn-logout-profile');
                if (logoutBtn) {
                    logoutBtn.textContent = 'Iniciar Sesión / Crear Cuenta';
                    logoutBtn.style.color = 'var(--text)';
                    logoutBtn.style.borderColor = 'rgba(255,255,255,0.1)';
                }"""

code = code.replace(old_btn, new_btn)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("done btn replace")
