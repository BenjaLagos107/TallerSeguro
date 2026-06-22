const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// Chunk 1:
code = code.replace(
    /\\s*switchView\\('landing'\\);\\s*\\}\\s*\\} catch \\(error\\) \\{/,
    \`
            if (!preserveView) {
                switchView('landing');
            }
        }
    } catch (error) {\`
);

// Chunk 2:
const newLogout = \`    const logoutAction = async () => {
        await signOut();
        currentRole = 'user';
        await checkSession(true);
        switchView('user-dashboard');
        switchTab('tab-perfil');
    };\`;

code = code.replace(
    /\\s*const logoutAction = async \\(\\) => \\{[\\s\\S]*?await checkSession\\(\\);\\s*\\};/,
    "\\n" + newLogout
);

fs.writeFileSync('main.js', code);
