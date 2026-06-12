import { supabase, supabaseError } from './supabaseClient.js';
import { getCurrentSession, signIn, signUp, signOut, getUserProfile } from './auth.js';
import { getTalleres, getMisReservas, createReserva } from './userFlow.js';
import { getMisTalleres, createTallerProfile, getTallerOrders, updateOrderStatus } from './ownerFlow.js';

let currentUser = null;
let currentRole = null; // 'user' or 'owner'

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar error de Supabase crítico
    if (supabaseError) {
        showNotification("Error crítico: " + supabaseError, "error");
        return;
    }

    // 2. Inicializar estado de sesión
    await checkSession();

    // 3. Configurar Event Listeners Globales
    setupEventListeners();
});

// ==========================================
// SESIÓN Y NAVEGACIÓN
// ==========================================
async function checkSession() {
    try {
        const session = await getCurrentSession();
        if (session) {
            currentUser = session.user;
            document.getElementById('user-email').textContent = currentUser.email;
            document.getElementById('btn-show-login').classList.add('hidden');
            document.getElementById('user-info').classList.remove('hidden');
        } else {
            currentUser = null;
            document.getElementById('user-email').textContent = '';
            document.getElementById('btn-show-login').classList.remove('hidden');
            document.getElementById('user-info').classList.add('hidden');
            switchView('landing');
        }
    } catch (error) {
        console.error(error);
    }
}

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${viewName}`).classList.remove('hidden');

    if (viewName === 'user-dashboard') loadUserDashboard();
    if (viewName === 'owner-dashboard') loadOwnerDashboard();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    // Logo
    document.getElementById('nav-logo').addEventListener('click', () => switchView('landing'));

    // Auth Modal
    const authModal = document.getElementById('auth-modal');
    document.getElementById('btn-show-login').addEventListener('click', () => {
        authModal.classList.remove('hidden');
        isLoginMode = true;
        updateAuthModalUI();
    });
    document.getElementById('close-auth-modal').addEventListener('click', () => authModal.classList.add('hidden'));
    
    let isLoginMode = true;
    document.getElementById('auth-switch-link').addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        updateAuthModalUI();
    });

    function updateAuthModalUI() {
        document.getElementById('auth-title').textContent = isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta';
        document.getElementById('auth-submit-btn').textContent = isLoginMode ? 'Entrar' : 'Registrarse';
        document.getElementById('auth-switch-text').textContent = isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?';
        document.getElementById('auth-switch-link').textContent = isLoginMode ? 'Regístrate aquí' : 'Inicia Sesión';
        document.getElementById('auth-error').classList.add('hidden');
        document.getElementById('auth-error').textContent = '';
        if (isLoginMode) {
            document.getElementById('auth-name').classList.add('hidden');
            document.getElementById('auth-name').removeAttribute('required');
        } else {
            document.getElementById('auth-name').classList.remove('hidden');
            document.getElementById('auth-name').setAttribute('required', 'true');
        }
    }

    // Auth Form Submit
    document.getElementById('auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const name = document.getElementById('auth-name').value;
        const errorMsg = document.getElementById('auth-error');
        errorMsg.classList.add('hidden');
        
        try {
            if (isLoginMode) {
                await signIn(email, password);
                showNotification("Sesión iniciada", "success");
            } else {
                await signUp(email, password, name);
                showNotification("Cuenta creada exitosamente", "success");
            }
            authModal.classList.add('hidden');
            await checkSession();
            
            // Redirigir según rol si se seleccionó uno antes
            if (currentRole === 'user') switchView('user-dashboard');
            else if (currentRole === 'owner') switchView('owner-dashboard');

        } catch (error) {
            errorMsg.textContent = "Error: " + error.message;
            errorMsg.classList.remove('hidden');
            showNotification(error.message, "error");
        }
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await signOut();
        currentRole = null;
        await checkSession();
    });

    // Landing Roles Redesign
    document.getElementById('btn-quiero-probarlo').addEventListener('click', () => {
        currentRole = 'user';
        switchView('user-dashboard');
    });

    document.getElementById('btn-probar-piloto').addEventListener('click', () => {
        currentRole = 'user';
        switchView('user-dashboard');
    });

    document.getElementById('btn-probar-ia').addEventListener('click', () => {
        showNotification("El asistente de IA estará disponible próximamente.", "warning");
    });

    document.getElementById('btn-role-owner-nav').addEventListener('click', (e) => {
        e.preventDefault();
        currentRole = 'owner';
        if (currentUser) switchView('owner-dashboard');
        else document.getElementById('btn-show-login').click();
    });

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // Booking Modal
    document.getElementById('close-booking-modal').addEventListener('click', () => {
        document.getElementById('booking-modal').classList.add('hidden');
    });

    document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Si no hay usuario, registrarlo ahora mismo
            if (!currentUser) {
                const email = document.getElementById('booking-email').value;
                const password = document.getElementById('booking-password').value;
                const nombre = document.getElementById('booking-nombre').value;
                
                await signUp(email, password, nombre);
                await checkSession(); // Carga la sesión recién creada
                
                if (!currentUser) {
                    throw new Error("No se pudo iniciar sesión automáticamente. Revisa si necesitas confirmar tu correo.");
                }
            }

            const tallerId = document.getElementById('booking-taller-id').value;
            const formData = {
                marca: document.getElementById('booking-marca').value,
                modelo: document.getElementById('booking-modelo').value,
                patente: document.getElementById('booking-patente').value,
                km: document.getElementById('booking-km').value,
                date: document.getElementById('booking-date').value,
                notes: document.getElementById('booking-notes').value,
            };

            await createReserva(currentUser.id, tallerId, formData);
            document.getElementById('booking-modal').classList.add('hidden');
            showNotification("Reserva confirmada con éxito", "success");
            document.getElementById('booking-form').reset();
            switchTab('tab-mis-reservas');
            await loadUserDashboard();
        } catch (error) {
            showNotification(error.message, "error");
        }
    });

    // Owner: Add Taller Modal
    const addTallerModal = document.getElementById('modal-add-taller');
    document.getElementById('close-add-taller-modal').addEventListener('click', () => {
        addTallerModal.classList.add('hidden');
    });
    
    document.getElementById('btn-add-taller-from-profile').addEventListener('click', () => {
        addTallerModal.classList.remove('hidden');
    });
    document.getElementById('btn-add-taller-from-orders').addEventListener('click', () => {
        addTallerModal.classList.remove('hidden');
    });

    document.getElementById('form-add-taller').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener checkboxes seleccionados
        const checkboxes = document.querySelectorAll('input[name="especialidad"]:checked');
        const especialidadesArray = Array.from(checkboxes).map(cb => cb.value);
        const especialidadesText = especialidadesArray.join(', ');

        const formData = {
            nombre: document.getElementById('add-taller-nombre').value,
            direccion: document.getElementById('add-taller-direccion').value,
            telefono: document.getElementById('add-taller-telefono').value,
            especialidades: especialidadesText,
        };
        try {
            await createTallerProfile(currentUser.id, formData);
            showNotification("Taller registrado exitosamente", "success");
            document.getElementById('form-add-taller').reset();
            addTallerModal.classList.add('hidden');
            loadOwnerDashboard(); // Recargar la vista con el nuevo taller
        } catch (error) {
            showNotification(error.message, "error");
        }
    });
}

// ==========================================
// RENDER UI: CLIENTES
// ==========================================
async function loadUserDashboard() {
    // Cargar Talleres
    try {
        const talleres = await getTalleres();
        const grid = document.getElementById('talleres-list');
        grid.innerHTML = '';
        if (talleres.length === 0) {
            grid.innerHTML = '<p>No hay talleres registrados aún.</p>';
        } else {
            talleres.forEach(t => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h4>${t.nombre}</h4>
                    <p class="text-muted">📍 ${t.direccion}</p>
                    <p class="text-muted">🔧 ${t.especialidades || 'General'}</p>
                    <button class="btn btn-primary" style="margin-top:1rem; width:100%" onclick="openBookingModal('${t.id}', '${t.nombre}')">Reservar Hora</button>
                `;
                grid.appendChild(card);
            });
        }
    } catch (e) {
        console.error(e);
    }

    // Cargar Mis Reservas
    try {
        const reservas = await getMisReservas(currentUser.id);
        const grid = document.getElementById('reservas-list');
        grid.innerHTML = '';
        if (reservas.length === 0) {
            grid.innerHTML = '<p>No tienes reservas activas.</p>';
        } else {
            reservas.forEach(r => {
                const card = document.createElement('div');
                card.className = 'card';
                let statusClass = 'status-pendiente';
                if (r.estado === 'Cancelado') statusClass = 'status-error';
                else if (r.estado === 'Aceptado') statusClass = 'status-primary';
                else if (r.estado === 'En Revisión') statusClass = 'status-revision';
                else if (r.estado === 'Terminado' || r.estado === 'Entregado') statusClass = 'status-listo';
                
                card.innerHTML = `
                    <h4>Taller: ${r.talleres ? r.talleres.nombre : 'Desconocido'}</h4>
                    <p><strong>Auto:</strong> ${r.vehiculo ? r.vehiculo.marca + ' ' + r.vehiculo.modelo + ' (' + r.vehiculo.patente + ')' : 'N/A'}</p>
                    <p><strong>Ingreso:</strong> ${new Date(r.fecha_ingreso).toLocaleString()}</p>
                    <p><strong>Notas:</strong> ${r.observaciones}</p>
                    <div style="margin-top:1rem;">
                        <span class="status-badge ${statusClass}">${r.estado}</span>
                    </div>
                `;
                grid.appendChild(card);
            });
        }
    } catch (e) {
        console.error(e);
    }
}

window.openBookingModal = (tallerId, tallerNombre) => {
    document.getElementById('booking-taller-id').value = tallerId;
    document.getElementById('booking-taller-name').textContent = tallerNombre;
    
    const guestFields = document.getElementById('booking-guest-fields');
    if (!currentUser) {
        guestFields.classList.remove('hidden');
        document.getElementById('booking-nombre').required = true;
        document.getElementById('booking-email').required = true;
        document.getElementById('booking-password').required = true;
    } else {
        guestFields.classList.add('hidden');
        document.getElementById('booking-nombre').required = false;
        document.getElementById('booking-email').required = false;
        document.getElementById('booking-password').required = false;
    }

    document.getElementById('booking-modal').classList.remove('hidden');
};

// ==========================================
// RENDER UI: TALLERES
// ==========================================
async function loadOwnerDashboard() {
    try {
        const misTalleres = await getMisTalleres(currentUser.id);
        const profileList = document.getElementById('owner-talleres-list');
        const ordersContainer = document.getElementById('owner-orders-container');
        const btnAddOrders = document.getElementById('btn-add-taller-from-orders');

        profileList.innerHTML = '';
        ordersContainer.innerHTML = '';

        if (!misTalleres || misTalleres.length === 0) {
            // Estado vacío general
            profileList.innerHTML = '<p>No tienes ningún taller inscrito a tu nombre.</p>';
            ordersContainer.innerHTML = '<p class="text-muted" style="padding: 2rem 0; text-align: center;">No tienes órdenes de trabajo porque no tienes talleres registrados.</p>';
            btnAddOrders.classList.remove('hidden');
            return;
        }

        btnAddOrders.classList.add('hidden'); // Solo mostrarlo en el estado vacío en órdenes

        // 1. Renderizar Talleres en Mi Perfil
        misTalleres.forEach(taller => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${taller.nombre}</h4>
                <p class="text-muted">📍 ${taller.direccion}</p>
                <p class="text-muted">📞 ${taller.telefono || 'Sin teléfono'}</p>
                <p class="text-muted" style="margin-top: 0.5rem"><strong>Especialidades:</strong><br>${taller.especialidades || 'Ninguna especificada'}</p>
            `;
            profileList.appendChild(card);
        });

        // 2. Renderizar Kanban por cada taller en Órdenes
        for (const taller of misTalleres) {
            const tallerSection = document.createElement('div');
            tallerSection.style.marginBottom = '2rem';
            tallerSection.innerHTML = `<h4 style="margin-bottom: 1rem; color: var(--primary); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Sucursal: ${taller.nombre}</h4>`;
            
            const kanbanBoard = document.createElement('div');
            kanbanBoard.className = 'kanban-board';
            kanbanBoard.id = `kanban-${taller.id}`;
            tallerSection.appendChild(kanbanBoard);
            ordersContainer.appendChild(tallerSection);

            // Fetch órdenes para este taller
            const ordenes = await getTallerOrders(taller.id);
            renderKanbanBoard(kanbanBoard, ordenes);
        }

    } catch (e) {
        console.error("Error al cargar el panel de taller:", e);
        showNotification("Error cargando tus talleres: " + e.message, "error");
    }
}

function renderKanbanBoard(boardElement, ordenes) {
    boardElement.innerHTML = `
        <div class="kanban-col">
            <h4>Pendiente</h4>
            <div class="col-content pending-col"></div>
        </div>
        <div class="kanban-col">
            <h4>Aceptado</h4>
            <div class="col-content accepted-col"></div>
        </div>
        <div class="kanban-col">
            <h4>En Revisión</h4>
            <div class="col-content review-col"></div>
        </div>
        <div class="kanban-col">
            <h4>Terminado</h4>
            <div class="col-content finished-col"></div>
        </div>
        <div class="kanban-col">
            <h4>Entregado</h4>
            <div class="col-content delivered-col"></div>
        </div>
    `;

    const cols = {
        'Pendiente': boardElement.querySelector('.pending-col'),
        'Aceptado': boardElement.querySelector('.accepted-col'),
        'En Revisión': boardElement.querySelector('.review-col'),
        'Terminado': boardElement.querySelector('.finished-col'),
        'Entregado': boardElement.querySelector('.delivered-col'),
    };

    // Mensaje de vacío
    let hasActiveOrders = false;

    ordenes.forEach(o => {
        if (o.estado === 'Cancelado') return; // Ocultar canceladas del Kanban
        hasActiveOrders = true;

        const card = document.createElement('div');
        card.className = 'card';
        card.style.padding = '1rem';
        
        // Deshabilitar botones en los extremos
        const leftDisabled = o.estado === 'Cancelado' ? 'disabled' : '';
        const rightDisabled = o.estado === 'Entregado' ? 'disabled' : '';

        card.innerHTML = `
            <p><strong>Auto:</strong> ${o.vehiculos?.marca} ${o.vehiculos?.modelo} (${o.vehiculos?.patente})</p>
            <p><strong>Cliente:</strong> ${o.vehiculos?.usuarios?.nombre || 'Desconocido'}</p>
            <p><strong>Fecha:</strong> ${new Date(o.fecha_ingreso).toLocaleString()}</p>
            <hr style="border-color:rgba(255,255,255,0.1); margin:0.5rem 0;">
            <p class="text-muted" style="font-size:0.9rem">${o.observaciones}</p>
            <div style="margin-top:1rem; display:flex; justify-content: space-between; align-items: center;">
                <button class="btn btn-secondary btn-small" onclick="reverseOrder('${o.id}', '${o.estado}')" ${leftDisabled} title="Retroceder o Cancelar">⬅️</button>
                <span class="status-badge" style="background: rgba(255,255,255,0.1); color: var(--text-light); font-size: 0.7rem;">${o.estado}</span>
                <button class="btn btn-secondary btn-small" onclick="advanceOrder('${o.id}', '${o.estado}')" ${rightDisabled} title="Avanzar etapa">➡️</button>
            </div>
        `;

        if (cols[o.estado]) cols[o.estado].appendChild(card);
        else cols['Pendiente'].appendChild(card); // Fallback
    });

    if(!hasActiveOrders) {
        cols['Pendiente'].innerHTML = '<p style="text-align:center;color:var(--text-muted); font-size: 0.9rem;">Sin órdenes activas</p>';
    }
}

const orderStates = ['Cancelado', 'Pendiente', 'Aceptado', 'En Revisión', 'Terminado', 'Entregado'];

window.advanceOrder = async (orderId, currentState) => {
    const idx = orderStates.indexOf(currentState);
    if (idx >= 0 && idx < orderStates.length - 1) {
        await window.changeOrderStatus(orderId, orderStates[idx + 1]);
    }
};

window.reverseOrder = async (orderId, currentState) => {
    const idx = orderStates.indexOf(currentState);
    if (idx > 0) {
        if (orderStates[idx - 1] === 'Cancelado') {
            if (!confirm('¿Estás seguro de que quieres rechazar/cancelar esta orden? Desaparecerá del tablero.')) return;
        }
        await window.changeOrderStatus(orderId, orderStates[idx - 1]);
    }
};

window.changeOrderStatus = async (orderId, newStatus) => {
    try {
        await updateOrderStatus(orderId, newStatus);
        showNotification("Estado actualizado a: " + newStatus, "success");
        loadOwnerDashboard(); // Recargar Kanban
    } catch (error) {
        showNotification(error.message, "error");
    }
};

// ==========================================
// UTILIDADES
// ==========================================
function showNotification(msg, type) {
    const banner = document.getElementById('notification-banner');
    banner.textContent = msg;
    banner.className = `notification notif-${type}`;
    banner.classList.remove('hidden');
    setTimeout(() => {
        banner.classList.add('hidden');
    }, 4000);
}
