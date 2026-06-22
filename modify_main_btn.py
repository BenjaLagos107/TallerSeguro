import os

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add event listeners for the new buttons
old_event_listeners = """    document.getElementById('btn-probar-piloto').addEventListener('click', () => {
        currentRole = 'user';
        isLoginMode = false;
        authModal.classList.remove('hidden');
        updateAuthModalUI();
    });"""

new_event_listeners = """    document.getElementById('btn-probar-piloto').addEventListener('click', () => {
        currentRole = 'user';
        isLoginMode = false;
        authModal.classList.remove('hidden');
        updateAuthModalUI();
    });
    
    const btnSoyTaller = document.getElementById('btn-soy-taller');
    if (btnSoyTaller) {
        btnSoyTaller.addEventListener('click', () => {
            currentRole = 'owner';
            isLoginMode = true;
            authModal.classList.remove('hidden');
            updateAuthModalUI();
        });
    }

    const btnIrATaller = document.getElementById('btn-ir-a-taller');
    if (btnIrATaller) {
        btnIrATaller.addEventListener('click', () => {
            currentRole = 'owner';
            switchView('owner-dashboard');
        });
    }"""

js = js.replace(old_event_listeners, new_event_listeners)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done main.js")
