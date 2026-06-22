import os

with open('main.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace error class
old_error = """            errorMsg.classList.add('hidden');
            showNotification(error.message, "error");"""
new_error = """            errorMsg.classList.remove('hidden');
            showNotification(error.message, "error");"""
code = code.replace(old_error, new_error)

# Replace logout action
old_action = """    const logoutAction = async () => {
        await signOut();
        currentRole = null;
        await checkSession();
    };"""

new_action = """    const logoutAction = async () => {
        await signOut();
        currentRole = 'user';
        await checkSession(true);
        switchView('user-dashboard');
        
        const tabs = document.querySelectorAll('.nav-link');
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        const profileTab = document.querySelector('[data-tab="tab-perfil"]');
        const profileContent = document.getElementById('tab-perfil');
        if (profileTab) profileTab.classList.add('active');
        if (profileContent) profileContent.classList.add('active');
    };"""
code = code.replace(old_action, new_action)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("done python replace")
