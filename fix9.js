const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// Chunk 1: Replace switchView('landing'); in checkSession
// We know checkSession has exactly one switchView('landing'); at the end of the else block.
code = code.replace(
    "switchView('landing');\\n        }\\n    } catch (error) {",
    "if (!preserveView) switchView('landing');\\n        }\\n    } catch (error) {"
);

// Fallback if the whitespace was slightly different
if (!code.includes("if (!preserveView)")) {
    code = code.replace(
        "            switchView('landing');\\r\\n        }\\r\\n    } catch (error) {",
        "            if (!preserveView) switchView('landing');\\r\\n        }\\r\\n    } catch (error) {"
    );
}

// Chunk 2: Replace logoutAction
const oldLogout = \`    const logoutAction = async () => {
        await signOut();
        currentRole = null;
        await checkSession();
    };\`;

const newLogout = \`    const logoutAction = async () => {
        await signOut();
        currentRole = 'user';
        await checkSession(true);
        switchView('user-dashboard');
        switchTab('tab-perfil');
    };\`;

let newCode = code.replace(oldLogout, newLogout);

if (newCode === code) {
    // Try with normalized line endings
    let codeLf = code.replace(/\\r\\n/g, '\\n');
    let oldLogoutLf = oldLogout.replace(/\\r\\n/g, '\\n');
    let newLogoutLf = newLogout.replace(/\\r\\n/g, '\\n');
    newCode = codeLf.replace(oldLogoutLf, newLogoutLf);
}

fs.writeFileSync('main.js', newCode);
