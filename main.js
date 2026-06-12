import { supabase, supabaseError } from './supabaseClient.js';
import { getCurrentSession, signIn, signUp, signOut, getUserProfile } from './auth.js';
import { getTalleres, getMisReservas, createReserva, createResena, getAllResenas } from './userFlow.js';
import { getMisTalleres, createTallerProfile, getTallerOrders, updateOrderStatus, getTallerServicios, addTallerServicio } from './ownerFlow.js';

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
            const userName = currentUser.user_metadata?.nombre || currentUser.email.split('@')[0];
            document.getElementById('user-email').textContent = `Hola, ${userName}!`;
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
window.switchView = switchView;

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
            const selectEl = document.getElementById('booking-servicio');
            const selectedOption = selectEl.options[selectEl.selectedIndex];

            const formData = {
                marca: document.getElementById('booking-marca').value,
                modelo: document.getElementById('booking-modelo').value,
                patente: document.getElementById('booking-patente').value,
                km: document.getElementById('booking-km').value.replace(/\D/g, ''),
                date: document.getElementById('booking-date').value,
                notes: document.getElementById('booking-notes').value,
                servicio_solicitado: selectEl.value || 'Servicio Personalizado',
                precio_acordado: selectedOption && selectedOption.dataset.precio ? parseFloat(selectedOption.dataset.precio) : null
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

    const bookingKm = document.getElementById('booking-km');
    if (bookingKm) {
        bookingKm.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value !== '') {
                value = parseInt(value, 10).toLocaleString('es-CL');
            }
            e.target.value = value;
        });
    }

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
            sector: document.getElementById('add-taller-sector').value,
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

    const formAddServicio = document.getElementById('form-add-servicio');
    if (formAddServicio) {
        formAddServicio.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tallerId = document.getElementById('add-servicio-taller-id').value;
            const payload = {
                taller_id: tallerId,
                servicio_nombre: document.getElementById('add-servicio-nombre').value,
                precio: parseFloat(document.getElementById('add-servicio-precio').value),
                tiempo_estimado: document.getElementById('add-servicio-tiempo').value
            };
            try {
                await addTallerServicio(payload);
                showNotification("Servicio agregado exitosamente", "success");
                document.getElementById('modal-add-servicio').classList.add('hidden');
                formAddServicio.reset();
                loadOwnerDashboard(); // Recargar para mostrar
            } catch (err) {
                showNotification("Error agregando servicio: " + err.message, "error");
            }
        });
    }

    const closeAddServicioModal = document.getElementById('close-add-servicio-modal');
    if (closeAddServicioModal) {
        closeAddServicioModal.addEventListener('click', () => {
            document.getElementById('modal-add-servicio').classList.add('hidden');
        });
    }

    const filterSector = document.getElementById('filter-sector');
    if (filterSector) filterSector.addEventListener('change', loadUserDashboard);
    
    const sortTalleres = document.getElementById('sort-talleres');
    if (sortTalleres) sortTalleres.addEventListener('change', loadUserDashboard);

    const formAddResena = document.getElementById('form-add-resena');
    if (formAddResena) {
        formAddResena.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                orden_id: document.getElementById('add-resena-orden-id').value,
                taller_id: document.getElementById('add-resena-taller-id').value,
                usuario_id: currentUser.id,
                calificacion: parseInt(document.getElementById('add-resena-calificacion').value),
                comentario: document.getElementById('add-resena-comentario').value
            };
            try {
                await createResena(payload);
                showNotification("¡Reseña guardada exitosamente!", "success");
                document.getElementById('modal-add-resena').classList.add('hidden');
                formAddResena.reset();
                loadUserDashboard(); // Refresh to update reviews
            } catch (err) {
                showNotification("Error guardando reseña: " + err.message, "error");
            }
        });
    }

    const closeAddResenaModal = document.getElementById('close-add-resena-modal');
    if (closeAddResenaModal) closeAddResenaModal.addEventListener('click', () => document.getElementById('modal-add-resena').classList.add('hidden'));

    const closeViewResenasModal = document.getElementById('close-view-resenas-modal');
    if (closeViewResenasModal) closeViewResenasModal.addEventListener('click', () => document.getElementById('modal-view-resenas').classList.add('hidden'));

}

// ==========================================
// RENDER UI: CLIENTES
// ==========================================
async function loadUserDashboard() {
    // Cargar Talleres
    try {
        let talleres = await getTalleres();
        window.allResenas = await getAllResenas();

        const filterEl = document.getElementById('filter-sector');
        if (filterEl && filterEl.value) {
            talleres = talleres.filter(t => t.sector === filterEl.value);
        }

        // Calcular promedios
        talleres.forEach(t => {
            const tResenas = window.allResenas.filter(r => r.taller_id === t.id);
            if (tResenas.length > 0) {
                t.promedio = tResenas.reduce((acc, r) => acc + r.calificacion, 0) / tResenas.length;
                t.total_resenas = tResenas.length;
            } else {
                t.promedio = 0;
                t.total_resenas = 0;
            }
        });

        // Ordenar
        const sortEl = document.getElementById('sort-talleres');
        if (sortEl && sortEl.value === 'rating') {
            talleres.sort((a, b) => b.promedio - a.promedio);
        }

        const grid = document.getElementById('talleres-list');
        grid.innerHTML = '';
        if (talleres.length === 0) {
            grid.innerHTML = '<p>No hay talleres disponibles con estos filtros.</p>';
        } else {
            talleres.forEach(t => {
                const card = document.createElement('div');
                card.className = 'card';
                const starsHtml = t.total_resenas > 0 ? `⭐ ${t.promedio.toFixed(1)} (${t.total_resenas} reseñas)` : 'Nuevo (Sin reseñas)';
                const reviewsBtn = t.total_resenas > 0 ? `<button class="btn btn-secondary btn-small" style="margin-top:0.5rem; width:100%" onclick="openViewResenasModal('${t.id}', '${t.nombre}')">Ver Comentarios</button>` : '';

                card.innerHTML = `
                    <h4>${t.nombre}</h4>
                    <p class="text-muted">📍 ${t.direccion} (${t.sector || 'Sin sector especificado'})</p>
                    <p class="text-muted">🔧 ${t.especialidades || 'General'}</p>
                    <p style="margin-top:0.5rem; font-weight: bold; color: #fbbf24;">${starsHtml}</p>
                    ${reviewsBtn}
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
                
                let reviewBtn = '';
                if (r.estado === 'Entregado' && !r.tiene_resena) {
                    reviewBtn = `<button class="btn btn-primary btn-small" style="margin-top:1rem; width:100%" onclick="openAddResenaModal('${r.id}', '${r.taller_id}')">Dejar Reseña ⭐</button>`;
                } else if (r.estado === 'Entregado' && r.tiene_resena) {
                    reviewBtn = `<p class="text-muted" style="margin-top:1rem; font-size:0.9rem; text-align:center;">Ya dejaste una reseña ✅</p>`;
                }

                card.innerHTML = `
                    <h4>Taller: ${r.talleres ? r.talleres.nombre : 'Desconocido'}</h4>
                    <p><strong>Auto:</strong> ${r.vehiculo ? r.vehiculo.marca + ' ' + r.vehiculo.modelo + ' (' + r.vehiculo.patente + ')' : 'N/A'}</p>
                    <p><strong>Ingreso:</strong> ${new Date(r.fecha_ingreso).toLocaleString()}</p>
                    <p><strong>Notas:</strong> ${r.observaciones}</p>
                    <div style="margin-top:1rem;">
                        <span class="status-badge ${statusClass}">${r.estado}</span>
                    </div>
                    ${reviewBtn}
                `;
                grid.appendChild(card);
            });
        }
    } catch (e) {
        console.error(e);
    }
}

window.openBookingModal = async (tallerId, tallerNombre) => {
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

    // Cargar servicios
    const servicioSelect = document.getElementById('booking-servicio');
    servicioSelect.innerHTML = '<option value="">Cargando servicios...</option>';
    try {
        const servicios = await getTallerServicios(tallerId);
        if (servicios.length === 0) {
            servicioSelect.innerHTML = '<option value="">Este taller no tiene servicios registrados</option>';
            servicioSelect.required = false;
        } else {
            servicioSelect.innerHTML = '<option value="" disabled selected>Elige un servicio...</option>' + 
                servicios.map(s => `<option value="${s.servicio_nombre}" data-precio="${s.precio}">${s.servicio_nombre} - $${s.precio} (aprox ${s.tiempo_estimado})</option>`).join('');
            servicioSelect.required = true;
        }
    } catch (e) {
        console.error(e);
        servicioSelect.innerHTML = '<option value="">Error cargando servicios</option>';
    }

    document.getElementById('booking-modal').classList.remove('hidden');
};

window.openAddResenaModal = (ordenId, tallerId) => {
    document.getElementById('add-resena-orden-id').value = ordenId;
    document.getElementById('add-resena-taller-id').value = tallerId;
    document.getElementById('modal-add-resena').classList.remove('hidden');
};

window.openViewResenasModal = (tallerId, tallerNombre) => {
    const container = document.getElementById('resenas-list-container');
    container.innerHTML = '';
    
    const tResenas = (window.allResenas || []).filter(r => r.taller_id === tallerId);
    if (tResenas.length === 0) {
        container.innerHTML = '<p>No hay comentarios.</p>';
    } else {
        tResenas.forEach(r => {
            const div = document.createElement('div');
            div.style.marginBottom = '1rem';
            div.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            div.style.paddingBottom = '1rem';
            div.innerHTML = `
                <p><strong>${r.usuarios?.nombre || 'Anónimo'}</strong> - <span style="color: #fbbf24;">⭐ ${r.calificacion}</span></p>
                <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.95rem;">"${r.comentario || ''}"</p>
                <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.5rem;">${new Date(r.created_at).toLocaleDateString()}</p>
            `;
            container.appendChild(div);
        });
    }
    document.getElementById('modal-view-resenas').classList.remove('hidden');
};

window.openAddServicioModal = (tallerId) => {
    document.getElementById('add-servicio-taller-id').value = tallerId;
    document.getElementById('modal-add-servicio').classList.remove('hidden');
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
            ordersContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem 0;">
                    <p class="text-muted" style="margin-bottom: 1rem;">No tienes órdenes de trabajo porque no tienes talleres registrados.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('modal-add-taller').classList.remove('hidden')">Inscribir Taller</button>
                </div>
            `;
            btnAddOrders.classList.add('hidden');
            return;
        }

        btnAddOrders.classList.add('hidden'); // Solo mostrarlo en el estado vacío en órdenes

        // 1. Renderizar Talleres en Mi Perfil
        for (const taller of misTalleres) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${taller.nombre}</h4>
                <p class="text-muted">📍 ${taller.direccion}</p>
                <p class="text-muted">📞 ${taller.telefono || 'Sin teléfono'}</p>
                <p class="text-muted" style="margin-top: 0.5rem"><strong>Especialidades:</strong><br>${taller.especialidades || 'Ninguna especificada'}</p>
                <div style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                    <h5>Servicios Ofrecidos</h5>
                    <ul id="lista-servicios-${taller.id}" style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 1rem; padding-left: 1.5rem;">
                        <li>Cargando...</li>
                    </ul>
                    <button class="btn btn-secondary btn-small" onclick="openAddServicioModal('${taller.id}')">Agregar Servicio</button>
                </div>
            `;
            profileList.appendChild(card);
            
            // Cargar servicios
            getTallerServicios(taller.id).then(servicios => {
                const ul = document.getElementById(`lista-servicios-${taller.id}`);
                if (servicios.length === 0) {
                    ul.innerHTML = '<li>Ningún servicio estandarizado agregado.</li>';
                } else {
                    ul.innerHTML = servicios.map(s => `<li>${s.servicio_nombre} - $${s.precio} (Aprox. ${s.tiempo_estimado})</li>`).join('');
                }
            }).catch(e => console.error(e));
        }

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
        
        if (o.estado === 'Entregado' && o.updated_at) {
            const updatedAt = new Date(o.updated_at);
            const now = new Date();
            const diffMinutes = (now - updatedAt) / (1000 * 60);
            
            if (diffMinutes >= 5) {
                return; // Ocultar si pasaron 5 minutos
            } else {
                // Programar recarga para cuando pasen los 5 minutos
                const msRemaining = Math.max(0, (5 - diffMinutes) * 60 * 1000);
                setTimeout(() => {
                    loadOwnerDashboard();
                }, msRemaining);
            }
        }

        hasActiveOrders = true;

        const card = document.createElement('div');
        card.className = 'card';
        card.style.padding = '1rem';
        
        // Deshabilitar botones en los extremos
        const leftDisabled = o.estado === 'Cancelado' ? 'disabled' : '';
        const rightDisabled = o.estado === 'Entregado' ? 'disabled' : '';

        const leftIcon = o.estado === 'Pendiente' ? '&#10006;' : '&larr;';
        const leftTitle = o.estado === 'Pendiente' ? 'Rechazar / Cancelar' : 'Retroceder';
        const rightIcon = '&rarr;';

        card.innerHTML = `
            <p style="color: var(--primary-color); font-weight: bold; font-size: 1.1rem; margin-bottom: 0.25rem;">${o.servicio_solicitado || 'Servicio Personalizado'}</p>
            <p style="margin-bottom: 0.5rem;"><strong>Precio:</strong> ${o.precio_acordado ? '$' + o.precio_acordado : 'A convenir'}</p>
            <p><strong>Auto:</strong> ${o.vehiculos?.marca} ${o.vehiculos?.modelo} (${o.vehiculos?.patente})</p>
            <p><strong>Cliente:</strong> ${o.vehiculos?.usuarios?.nombre || 'Desconocido'}</p>
            <p><strong>Fecha:</strong> ${new Date(o.fecha_ingreso).toLocaleString()}</p>
            <hr style="border-color:rgba(255,255,255,0.1); margin:0.5rem 0;">
            <p class="text-muted" style="font-size:0.9rem">${o.observaciones}</p>
            <div style="margin-top:1rem; display:flex; justify-content: space-between; align-items: center;">
                <button class="btn btn-secondary btn-small" onclick="reverseOrder('${o.id}', '${o.estado}')" ${leftDisabled} title="${leftTitle}">${leftIcon}</button>
                <span class="status-badge" style="background: rgba(255,255,255,0.1); color: var(--text-light); font-size: 0.7rem;">${o.estado}</span>
                <button class="btn btn-secondary btn-small" onclick="advanceOrder('${o.id}', '${o.estado}')" ${rightDisabled} title="Avanzar etapa">${rightIcon}</button>
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
