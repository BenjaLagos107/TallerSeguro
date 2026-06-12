import { supabase, supabaseError } from './supabaseClient.js';
import { getCurrentSession, signIn, signUp, signOut, getUserProfile } from './auth.js';
import { getTalleres, getMisReservas, createReserva } from './userFlow.js';
import { getMiTaller, saveTallerProfile, getTallerOrders, updateOrderStatus } from './ownerFlow.js';

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
            showNotification(error.message, "error");
        }
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await signOut();
        currentRole = null;
        await checkSession();
    });

    // Landing Roles
    document.getElementById('btn-role-user').addEventListener('click', () => {
        currentRole = 'user';
        switchView('user-dashboard');
    });

    document.getElementById('btn-role-owner').addEventListener('click', () => {
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

    // Owner Profile Form
    document.getElementById('form-taller-profile').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            nombre: document.getElementById('taller-nombre').value,
            direccion: document.getElementById('taller-direccion').value,
            telefono: document.getElementById('taller-telefono').value,
            especialidades: document.getElementById('taller-especialidades').value,
        };
        try {
            await saveTallerProfile(currentUser.id, formData);
            showNotification("Perfil de taller guardado", "success");
            loadOwnerDashboard(); // Reload to fetch real id and orders
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
                if (r.estado.toLowerCase().includes('revis')) statusClass = 'status-revision';
                if (r.estado.toLowerCase().includes('listo') || r.estado.toLowerCase().includes('entreg')) statusClass = 'status-listo';
                
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
        const miTaller = await getMiTaller(currentUser.id);
        if (!miTaller) {
            showNotification("Primero debes registrar tu taller en la pestaña 'Mi Perfil'.", "warning");
            switchTab('tab-owner-profile');
            return;
        }

        // Llenar formulario si existe
        document.getElementById('taller-nombre').value = miTaller.nombre;
        document.getElementById('taller-direccion').value = miTaller.direccion;
        document.getElementById('taller-telefono').value = miTaller.telefono || '';
        document.getElementById('taller-especialidades').value = miTaller.especialidades || '';

        // Cargar Órdenes
        const ordenes = await getTallerOrders(miTaller.id);
        renderKanban(ordenes);

    } catch (e) {
        console.error(e);
    }
}

function renderKanban(ordenes) {
    const board = document.getElementById('owner-orders-board');
    board.innerHTML = `
        <div class="kanban-col" id="col-pendiente"><h4>Pendientes</h4></div>
        <div class="kanban-col" id="col-revision"><h4>En Revisión</h4></div>
        <div class="kanban-col" id="col-listo"><h4>Listo/Entregado</h4></div>
    `;

    const colPendiente = document.getElementById('col-pendiente');
    const colRevision = document.getElementById('col-revision');
    const colListo = document.getElementById('col-listo');

    if(ordenes.length === 0) {
        colPendiente.innerHTML += '<p style="text-align:center;color:var(--text-muted)">Vacío</p>';
    }

    ordenes.forEach(o => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.padding = '1rem';
        card.innerHTML = `
            <p><strong>Auto:</strong> ${o.vehiculos?.marca} ${o.vehiculos?.modelo} (${o.vehiculos?.patente})</p>
            <p><strong>Cliente:</strong> ${o.vehiculos?.usuarios?.nombre || 'Desconocido'}</p>
            <p><strong>Fecha:</strong> ${new Date(o.fecha_ingreso).toLocaleString()}</p>
            <hr style="border-color:rgba(255,255,255,0.1); margin:0.5rem 0;">
            <p class="text-muted" style="font-size:0.9rem">${o.observaciones}</p>
            <div style="margin-top:1rem; display:flex; gap:0.5rem;">
                <select class="btn btn-secondary btn-small" onchange="changeOrderStatus('${o.id}', this.value)">
                    <option value="Pendiente" ${o.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En Revisión" ${o.estado === 'En Revisión' ? 'selected' : ''}>En Revisión</option>
                    <option value="Listo" ${o.estado === 'Listo' ? 'selected' : ''}>Listo</option>
                </select>
            </div>
        `;

        if (o.estado === 'Pendiente') colPendiente.appendChild(card);
        else if (o.estado === 'En Revisión') colRevision.appendChild(card);
        else colListo.appendChild(card);
    });
}

window.changeOrderStatus = async (orderId, newStatus) => {
    try {
        await updateOrderStatus(orderId, newStatus);
        showNotification("Estado actualizado", "success");
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
