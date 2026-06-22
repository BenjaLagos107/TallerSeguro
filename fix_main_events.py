import os

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

target = """    document.getElementById('btn-probar-piloto').addEventListener('click', () => {
        currentRole = 'user';
        switchView('user-dashboard');
    });"""

replacement = """    document.getElementById('btn-probar-piloto').addEventListener('click', () => {
        currentRole = 'user';
        switchView('user-dashboard');
    });
    
    const btnSoyTaller = document.getElementById('btn-soy-taller');
    if (btnSoyTaller) {
        btnSoyTaller.addEventListener('click', () => {
            currentRole = 'owner';
            isLoginMode = true; // Forzamos inicio de sesion (o creación)
            const authModal = document.getElementById('auth-modal');
            if(authModal) {
                authModal.classList.remove('hidden');
                document.getElementById('auth-title').textContent = 'Iniciar Sesión (Taller)';
            }
        });
    }

    const btnIrATaller = document.getElementById('btn-ir-a-taller');
    if (btnIrATaller) {
        btnIrATaller.addEventListener('click', () => {
            currentRole = 'owner';
            switchView('owner-dashboard');
        });
    }"""

if target in js:
    js = js.replace(target, replacement)
else:
    target_crlf = target.replace('\\n', '\\r\\n')
    js = js.replace(target_crlf, replacement)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done main.js fix")
