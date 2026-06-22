const fs = require('fs');

let lines = fs.readFileSync('main.js', 'utf8').split('\n');

// Find start and end of checkSession
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('async function checkSession() {')) {
        startIndex = i;
    }
    if (startIndex !== -1 && lines[i].startsWith('}')) {
        endIndex = i;
        break; // this assumes checkSession ends at the first outer brace
    }
}

const newCheckSession = \`async function checkSession() {
    try {
        const session = await getCurrentSession();
        if (session) {
            currentUser = session.user;
            const userName = currentUser.user_metadata?.nombre || currentUser.email.split('@')[0];
            document.getElementById('user-email').textContent = \\\`Hola, \${userName}!\\\`;
            
            const btnQuiero = document.getElementById('btn-quiero-probarlo');
            if (btnQuiero) btnQuiero.classList.add('hidden');
            
            document.getElementById('user-info').classList.remove('hidden');
            
            // Perfil View
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = currentUser.user_metadata?.nombre || 'Usuario';
                document.getElementById('profile-email').textContent = currentUser.email;
                document.getElementById('profile-avatar-initial').textContent = (currentUser.user_metadata?.nombre || currentUser.email).charAt(0).toUpperCase();
                
                const logoutBtn = document.getElementById('btn-logout-profile');
                if (logoutBtn) {
                    logoutBtn.textContent = 'Cerrar Sesión';
                    logoutBtn.style.color = 'var(--error)';
                    logoutBtn.style.borderColor = 'var(--error)';
                }
            }
        } else {
            currentUser = null;
            const userEmailEl = document.getElementById('user-email');
            if (userEmailEl) userEmailEl.textContent = '';
            
            const btnQuiero = document.getElementById('btn-quiero-probarlo');
            if (btnQuiero) btnQuiero.classList.remove('hidden');
            
            const userInfoEl = document.getElementById('user-info');
            if (userInfoEl) userInfoEl.classList.add('hidden');
            
            // Perfil View (Guest)
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = 'Invitado';
                document.getElementById('profile-email').textContent = 'No has iniciado sesión';
                document.getElementById('profile-avatar-initial').textContent = '?';
                
                const logoutBtn = document.getElementById('btn-logout-profile');
                if (logoutBtn) {
                    logoutBtn.textContent = 'Iniciar Sesión / Volver';
                    logoutBtn.style.color = 'var(--text)';
                    logoutBtn.style.borderColor = 'rgba(255,255,255,0.1)';
                }
            }
            
            switchView('landing');
        }
    } catch (error) {
        console.error(error);
    }
}\`;

lines.splice(startIndex, endIndex - startIndex + 1, newCheckSession);
fs.writeFileSync('main.js', lines.join('\\n'));
console.log('done, replaced from', startIndex, 'to', endIndex);
