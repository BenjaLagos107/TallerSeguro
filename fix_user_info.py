import os

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# I will find the lines that unhide user-info and just comment them out, or remove them
target_lines = """            document.getElementById('user-email').textContent = `Hola, ${userName}!`;
            
            const btnQuiero = document.getElementById('btn-quiero-probarlo');
            if (btnQuiero) btnQuiero.classList.add('hidden');
            
            document.getElementById('user-info').classList.remove('hidden');"""

replacement = """            // We intentionally do not show user-info on the landing page anymore
            const btnQuiero = document.getElementById('btn-quiero-probarlo');
            if (btnQuiero) btnQuiero.classList.add('hidden');
            
            const userInfo = document.getElementById('user-info');
            if (userInfo) userInfo.classList.add('hidden');"""

js = js.replace(target_lines, replacement)

# What if user logs out?
logout_target = """            const btnQuiero = document.getElementById('btn-quiero-probarlo');
            if (btnQuiero) btnQuiero.classList.remove('hidden');
            
            document.getElementById('user-info').classList.add('hidden');"""

# This is already fine since we want user-info hidden and btnQuiero shown when logged out.

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done hiding user-info")
