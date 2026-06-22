const fs = require('fs');

let content = fs.readFileSync('main.js', 'utf8');
let lines = content.split(/\\r?\\n/);

// 1. Find and replace switchView('landing'); in checkSession
// We will start looking from line 25, the start of checkSession
for (let i = 25; i < 90; i++) {
    if (lines[i] && lines[i].includes("switchView('landing');")) {
        lines[i] = lines[i].replace("switchView('landing');", "if (!preserveView) { switchView('landing'); }");
        break;
    }
}

// 2. Find and replace logoutAction
let startLogout = -1;
let endLogout = -1;
for (let i = 190; i < 220; i++) {
    if (lines[i] && lines[i].includes('const logoutAction = async () => {')) {
        startLogout = i;
    }
    if (startLogout !== -1 && lines[i] && lines[i].includes('};')) {
        endLogout = i;
        break;
    }
}

if (startLogout !== -1 && endLogout !== -1) {
    const newLogoutLines = [
        "    const logoutAction = async () => {",
        "        await signOut();",
        "        currentRole = 'user';",
        "        await checkSession(true);",
        "        switchView('user-dashboard');",
        "        ",
        "        const tabs = document.querySelectorAll('.nav-link');",
        "        tabs.forEach(t => t.classList.remove('active'));",
        "        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));",
        "        ",
        "        const profileTab = document.querySelector('[data-tab=\"tab-perfil\"]');",
        "        const profileContent = document.getElementById('tab-perfil');",
        "        if (profileTab) profileTab.classList.add('active');",
        "        if (profileContent) profileContent.classList.add('active');",
        "    };"
    ];
    lines.splice(startLogout, endLogout - startLogout + 1, ...newLogoutLines);
}

fs.writeFileSync('main.js', lines.join('\\n'));
console.log('done replacing by lines successfully');
