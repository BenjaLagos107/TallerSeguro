const fs = require('fs');

let lines = fs.readFileSync('main.js', 'utf8').split(/\\r?\\n/);

// Fix errorMsg logic around line 190
for (let i = 185; i < 200; i++) {
    if (lines[i] && lines[i].includes("errorMsg.classList.add('hidden');")) {
        lines[i] = lines[i].replace("add('hidden')", "remove('hidden')");
        break;
    }
}

// Replace logoutAction around line 195
let startLogout = -1;
let endLogout = -1;
for (let i = 190; i < 210; i++) {
    if (lines[i] && lines[i] === "    const logoutAction = async () => {") {
        startLogout = i;
    }
    if (startLogout !== -1 && lines[i] && lines[i] === "    };") {
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
        "        // Activamos la pestaña de perfil",
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
console.log('done modifying main.js');
