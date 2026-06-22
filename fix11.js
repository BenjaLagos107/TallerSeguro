const fs = require('fs');

function fixLogout() {
  let text = fs.readFileSync('main.js', 'utf8');

  // Change checkSession signature
  text = text.replace('async function checkSession() {', 'async function checkSession(preserveView = false) {');

  // Change landing redirect
  text = text.replace(
    "switchView('landing');\\n        }\\n    } catch (error) {",
    "if (!preserveView) { switchView('landing'); }\\n        }\\n    } catch (error) {"
  );
  text = text.replace(
    "switchView('landing');\\r\\n        }\\r\\n    } catch (error) {",
    "if (!preserveView) { switchView('landing'); }\\r\\n        }\\r\\n    } catch (error) {"
  );

  // Change logout action
  const searchLogout = "    const logoutAction = async () => {\\n        await signOut();\\n        currentRole = null;\\n        await checkSession();\\n    };";
  const searchLogoutCrLf = "    const logoutAction = async () => {\\r\\n        await signOut();\\r\\n        currentRole = null;\\r\\n        await checkSession();\\r\\n    };";
  
  const replacementLogout = "    const logoutAction = async () => {\\n        await signOut();\\n        currentRole = 'user';\\n        await checkSession(true);\\n        switchView('user-dashboard');\\n    };";

  text = text.replace(searchLogout, replacementLogout);
  text = text.replace(searchLogoutCrLf, replacementLogout.replace(/\\n/g, '\\r\\n'));

  fs.writeFileSync('main.js', text);
}

fixLogout();
