const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

const targetStr = `            // Perfil View
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = currentUser.user_metadata?.nombre || 'Usuario';
                document.getElementById('profile-email').textContent = currentUser.email;
                document.getElementById('profile-avatar-initial').textContent = (currentUser.user_metadata?.nombre || currentUser.email).charAt(0).toUpperCase();
            }
        } else {
            currentUser = null;
            const userEmailEl = document.getElementById('user-email');
            if (userEmailEl) userEmailEl.textContent = '';
            
            const btnQuiero = document.getElementById('btn-quiero-probarlo');
            if (btnQuiero) btnQuiero.classList.remove('hidden');
            
            const userInfoEl = document.getElementById('user-info');
            if (userInfoEl) userInfoEl.classList.add('hidden');
            
            switchView('landing');
        }`;

const replaceStr = `            // Perfil View
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
            
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = 'Invitado';
                document.getElementById('profile-email').textContent = 'No has iniciado sesión';
                document.getElementById('profile-avatar-initial').textContent = '?';
                
                const logoutBtn = document.getElementById('btn-logout-profile');
                if (logoutBtn) {
                    logoutBtn.textContent = 'Iniciar Sesión / Volver';
                    logoutBtn.style.color = 'var(--text)';
                    logoutBtn.style.borderColor = 'var(--text-muted)';
                }
            }
            
            switchView('landing');
        }`;

// Try normal replace
let newCode = code.replace(targetStr, replaceStr);

// If it didn't work because of line endings, try standardizing
if (newCode === code) {
    code = code.replace(/\\r\\n/g, '\\n');
    let targetStrLf = targetStr.replace(/\\r\\n/g, '\\n');
    let replaceStrLf = replaceStr.replace(/\\r\\n/g, '\\n');
    newCode = code.replace(targetStrLf, replaceStrLf);
}

fs.writeFileSync('main.js', newCode);
