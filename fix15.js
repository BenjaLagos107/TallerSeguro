const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// Error message fix
code = code.replace(
    "errorMsg.classList.add('hidden');\\n            showNotification(error.message, \\"error\\");",
    "errorMsg.classList.remove('hidden');\\n            showNotification(error.message, \\"error\\");"
);
code = code.replace(
    "errorMsg.classList.add('hidden');\\r\\n            showNotification(error.message, \\"error\\");",
    "errorMsg.classList.remove('hidden');\\r\\n            showNotification(error.message, \\"error\\");"
);

// Logout fix
const oldLogout = "    const logoutAction = async () => {\\n        await signOut();\\n        currentRole = null;\\n        await checkSession();\\n    };";
const oldLogoutWin = "    const logoutAction = async () => {\\r\\n        await signOut();\\r\\n        currentRole = null;\\r\\n        await checkSession();\\r\\n    };";

const newLogout = \`    const logoutAction = async () => {
        await signOut();
        currentRole = 'user';
        await checkSession(true);
        switchView('user-dashboard');
        
        // Activamos la pestaña de perfil
        const tabs = document.querySelectorAll('.nav-link');
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        const profileTab = document.querySelector('[data-tab="tab-perfil"]');
        const profileContent = document.getElementById('tab-perfil');
        if (profileTab) profileTab.classList.add('active');
        if (profileContent) profileContent.classList.add('active');
    };\`;

code = code.replace(oldLogout, newLogout);
code = code.replace(oldLogoutWin, newLogout.replace(/\\n/g, '\\r\\n'));

fs.writeFileSync('main.js', code);
console.log('done replacing string explicitly');
