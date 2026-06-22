const fs = require('fs');
let lines = fs.readFileSync('main.js', 'utf8').split('\n');

const newCode = `            { text: 'Mi problema no está aquí', next: 'fallback' }
        ]
    }
};

let assistantHistory = [];
let currentAssistantNodeId = 'start';

window.goBackAssistant = function() {
    if (assistantHistory.length === 0) {
        switchTab('tab-home-app');
    } else {
        const prevNodeId = assistantHistory.pop();
        window.renderAssistantNode(prevNodeId, true);
    }
};

window.renderAssistantNode = function(nodeId, isBack = false) {
    if (!isBack && currentAssistantNodeId !== 'diagnosis_state') {
        assistantHistory.push(currentAssistantNodeId);
    }
    currentAssistantNodeId = nodeId;

    const node = assistantTree[nodeId];
    if (!node) {
        if (nodeId === 'fallback') {
            document.getElementById('assistant-chat-container').classList.add('hidden');
            document.getElementById('assistant-result-container').classList.remove('hidden');
            document.getElementById('assistant-result-title').textContent = 'No logramos diagnosticarlo';
            document.getElementById('assistant-result-title').style.color = '#ef4444';
            document.getElementById('assistant-result-text').textContent = 'Por favor, describe brevemente qué le ocurre a tu vehículo. Te recomendaremos talleres de Mecánica General para una revisión presencial.';
            document.getElementById('assistant-fallback-input').classList.remove('hidden');
            document.getElementById('assistant-suggested-talleres').classList.add('hidden');
        }
        return;
    }
    
    document.getElementById('assistant-chat-container').classList.remove('hidden');
    document.getElementById('assistant-result-container').classList.add('hidden');
    document.getElementById('assistant-question').textContent = node.question;
    
    const optionsContainer = document.getElementById('assistant-options');
    optionsContainer.innerHTML = '';
    
    node.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.style.width = '100%';
        btn.style.textAlign = 'center';
        btn.textContent = opt.text;
        btn.onclick = () => window.handleAssistantOption(opt);
        optionsContainer.appendChild(btn);
    });
};

window.handleAssistantOption = function(option) {
    if (option.next) {
        window.renderAssistantNode(option.next);
    } else if (option.diagnosis) {
        window.showAssistantDiagnosis(option.diagnosis, option.specialty);
    }
};

window.showAssistantDiagnosis = async function(diagnosisText, specialty) {
    assistantHistory.push(currentAssistantNodeId);
    currentAssistantNodeId = 'diagnosis_state';

    document.getElementById('assistant-chat-container').classList.add('hidden');
    document.getElementById('assistant-result-container').classList.remove('hidden');
    document.getElementById('assistant-fallback-input').classList.add('hidden');
    
    document.getElementById('assistant-result-title').textContent = 'Diagnóstico Sugerido';
    document.getElementById('assistant-result-title').style.color = 'var(--primary)';
    document.getElementById('assistant-result-text').innerHTML = \`<strong>\${diagnosisText}</strong><br><br><span style="color: var(--text-muted); font-size: 0.9rem;">Especialidad recomendada: \${specialty}</span>\`;
    
    const talleresContainer = document.getElementById('assistant-suggested-talleres');
    const listContainer = document.getElementById('assistant-talleres-list');
    talleresContainer.classList.remove('hidden');
    listContainer.innerHTML = '<div class="spinner"></div>';
    
    try {
        const { supabase } = await import('./supabaseClient.js');
        const { data, error } = await supabase.from('talleres').select('*');
            
        if (error) throw error;
        
        const filtered = (data || []).filter(t => t.especialidades && t.especialidades.includes(specialty));
        
        listContainer.innerHTML = '';
        if (filtered.length === 0) {
            listContainer.innerHTML = '<p class="text-muted" style="width:100%;text-align:center;grid-column:1/-1;">No encontramos talleres cercanos con esta especialidad en este momento.</p>';
        } else {
            filtered.forEach(taller => {
                const card = document.createElement('div');
                card.className = 'card hoverable-card';
                card.innerHTML = \`
                    <h4>\${taller.nombre}</h4>
                    <p class="text-muted" style="margin-bottom: 1rem;">📍 \${taller.direccion}</p>
                    <button class="btn btn-primary btn-small" style="width:100%" onclick="window.openBookingModal('\${taller.id}', '\${taller.nombre}').then(() => { document.getElementById('booking-notes').value = 'Diagnóstico previo: \${diagnosisText}'; });">Reservar Aquí</button>
                \`;
                listContainer.appendChild(card);
            });
        }
    } catch (err) {
        console.error(err);
        listContainer.innerHTML = '<p class="text-error" style="width:100%;text-align:center;grid-column:1/-1;">Error al cargar talleres recomendados.</p>';
    }
};

document.getElementById('btn-restart-assistant')?.addEventListener('click', () => {
    document.getElementById('assistant-custom-problem').value = '';
    assistantHistory = [];
    currentAssistantNodeId = 'start';
    window.renderAssistantNode('start', true);
});

document.getElementById('btn-submit-custom-problem')?.addEventListener('click', async () => {
    const userText = document.getElementById('assistant-custom-problem').value.trim();
    if (!userText) {
        showNotification('Por favor describe tu problema antes de continuar.', 'error');
        return;
    }
    await window.showAssistantDiagnosis(\`Problema descrito por el cliente: "\${userText}"\`, 'Mecánica General');
});`;

// Remove lines 1049 to 1051 (0-indexed 1049 to 1051 inclusive)
lines.splice(1049, 3, newCode);

fs.writeFileSync('main.js', lines.join('\n'));
