import { supabase, supabaseError } from './supabaseClient.js';
import { getCurrentSession, signIn, signUp, signOut, getUserProfile } from './auth.js';
import { getTalleres, getMisReservas, createReserva, createResena, getAllResenas, getVehiculos } from './userFlow.js';
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
async function checkSession(preserveView = false) {
    try {
        const session = await getCurrentSession();
        if (session) {
            currentUser = session.user;
            const userName = currentUser.user_metadata?.nombre || currentUser.email.split('@')[0];
            // We intentionally do not show user-info on the landing page anymore
            const btnQuiero = document.getElementById('btn-quiero-probarlo');
            if (btnQuiero) btnQuiero.classList.add('hidden');
            
            const userInfo = document.getElementById('user-info');
            if (userInfo) userInfo.classList.add('hidden');
            
            // Perfil View
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = currentUser.user_metadata?.nombre || 'Usuario';
                document.getElementById('profile-email').textContent = currentUser.email;
                document.getElementById('profile-avatar-initial').textContent = (currentUser.user_metadata?.nombre || currentUser.email).charAt(0).toUpperCase();
                
                const logoutBtn = document.getElementById('btn-logout-profile');
                if (logoutBtn) {
                    logoutBtn.textContent = 'Cerrar Sesión';
                    logoutBtn.style.color = 'var(--error)';
                    logoutBtn.style.borderColor = 'var(--error)';
                }
            }
        } else {
            currentUser = null;
            const userEmailEl = document.getElementById('user-email');
            if (userEmailEl) userEmailEl.textContent = '';
            
            const btnQuiero = document.getElementById('btn-quiero-probarlo');
            if (btnQuiero) btnQuiero.classList.remove('hidden');
            
            const userInfoEl = document.getElementById('user-info');
            if (userInfoEl) userInfoEl.classList.add('hidden');
            
            // Perfil View
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = 'Invitado';
                document.getElementById('profile-email').textContent = 'No has iniciado sesión';
                document.getElementById('profile-avatar-initial').textContent = '?';
                
                const logoutBtn = document.getElementById('btn-logout-profile');
                if (logoutBtn) {
                    logoutBtn.textContent = 'Iniciar Sesión / Crear Cuenta';
                    logoutBtn.style.color = 'var(--text)';
                    logoutBtn.style.borderColor = 'rgba(255,255,255,0.1)';
                }
            }
            
            if (!preserveView) { switchView('landing'); }
        }
    } catch (error) {
        console.error(error);
    }
}

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${viewName}`).classList.remove('hidden');

    const btnQuiero = document.getElementById('btn-quiero-probarlo');
    if (btnQuiero) {
        if (viewName === 'landing' && !currentUser) {
            btnQuiero.classList.remove('hidden');
        } else {
            btnQuiero.classList.add('hidden');
        }
    }

    if (viewName === 'user-dashboard') loadUserDashboard();
    if (viewName === 'owner-dashboard') loadOwnerDashboard();
}
window.switchView = switchView;

function switchTab(tabId) {
    const targetContent = document.getElementById(tabId);
    if (!targetContent) return;
    
    const container = targetContent.closest('.view-section');
    container.querySelectorAll('.tab-btn, .nav-item, .bottom-nav-item').forEach(b => b.classList.remove('active'));
    container.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    
    const activeBtns = container.querySelectorAll(`[data-tab="${tabId}"]`);
    activeBtns.forEach(btn => btn.classList.add('active'));
    
    targetContent.classList.remove('hidden');

    if (tabId === 'tab-asistente' && window.renderAssistantNode) {
        window.renderAssistantNode('start');
    }
}
window.switchTab = switchTab;

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    // Logo
    document.getElementById('nav-logo').addEventListener('click', () => switchView('landing'));

    // Auth Modal
    const authModal = document.getElementById('auth-modal');
    const btnShowLogin = document.getElementById('btn-show-login');
    if (btnShowLogin) {
        btnShowLogin.addEventListener('click', () => {
            authModal.classList.remove('hidden');
            isLoginMode = true;
            updateAuthModalUI();
        });
    }
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
    const logoutAction = async () => {
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
    };
    
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', logoutAction);
    
    const btnLogoutProfile = document.getElementById('btn-logout-profile');
    if (btnLogoutProfile) {
        btnLogoutProfile.addEventListener('click', async () => {
            if (currentUser) {
                await logoutAction();
            } else {
                const authModal = document.getElementById('auth-modal');
                if (authModal) {
                    authModal.classList.remove('hidden');
                    isLoginMode = true;
                    if (typeof updateAuthModalUI === 'function') {
                        updateAuthModalUI();
                    }
                }
            }
        });
    }

    // Landing Roles Redesign
    document.getElementById('btn-quiero-probarlo').addEventListener('click', () => {
        currentRole = 'user';
        switchView('user-dashboard');
    });

    document.getElementById('btn-probar-piloto').addEventListener('click', () => {
        currentRole = 'user';
        switchView('user-dashboard');
    });
    
    const btnSoyTaller = document.getElementById('btn-soy-taller');
    if (btnSoyTaller) {
        btnSoyTaller.addEventListener('click', () => {
            currentRole = 'owner';
            isLoginMode = true; // Forzamos inicio de sesion (o creación)
            const authModal = document.getElementById('auth-modal');
            if(authModal) {
                authModal.classList.remove('hidden');
                document.getElementById('auth-title').textContent = 'Iniciar Sesión (Taller)';
            }
        });
    }

    const btnIrATaller = document.getElementById('btn-ir-a-taller');
    if (btnIrATaller) {
        btnIrATaller.addEventListener('click', () => {
            currentRole = 'owner';
            switchView('owner-dashboard');
        });
    }

    const btnProbarIa = document.getElementById('btn-probar-ia');
    if (btnProbarIa) {
        btnProbarIa.addEventListener('click', () => {
            showNotification("El asistente de IA estará disponible próximamente.", "warning");
        });
    }

    const btnRoleOwnerNav = document.getElementById('btn-role-owner-nav');
    if (btnRoleOwnerNav) {
        btnRoleOwnerNav.addEventListener('click', (e) => {
            e.preventDefault();
            currentRole = 'owner';
            if (currentUser) switchView('owner-dashboard');
            else {
                const loginBtn = document.getElementById('btn-show-login');
                if (loginBtn) loginBtn.click();
            }
        });
    }

    // Tabs and Nav Items
    document.querySelectorAll('.tab-btn, .nav-item, .bottom-nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            if (tabId) switchTab(tabId);
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
            const selectedRadio = document.querySelector('input[name="booking-servicio"]:checked') || document.querySelector('input[name="booking-servicio"][type="hidden"]');
            
            const dateOnly = document.getElementById('booking-date-only').value;
            const timeOnly = document.getElementById('booking-time-only').value;
            
            if (!timeOnly) {
                showNotification("Por favor, selecciona una hora para la reserva.", "error");
                return;
            }
            
            const combinedDateTime = `${dateOnly}T${timeOnly}:00`;

            const formData = {
                marca: document.getElementById('booking-marca').value,
                modelo: document.getElementById('booking-modelo').value,
                patente: document.getElementById('booking-patente').value,
                km: document.getElementById('booking-km').value.replace(/\D/g, ''),
                date: combinedDateTime,
                notes: document.getElementById('booking-notes').value,
                servicio_solicitado: selectedRadio ? selectedRadio.value : 'Servicio Personalizado',
                precio_acordado: selectedRadio && selectedRadio.dataset.precio ? parseFloat(selectedRadio.dataset.precio) : null
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
    
    // Add Vehiculo Modal
    const addVehiculoModal = document.getElementById('modal-add-vehiculo');
    const btnOpenAddVehiculo = document.getElementById('btn-open-add-vehiculo');
    const btnCloseAddVehiculo = document.getElementById('close-add-vehiculo-modal');
    const formAddVehiculo = document.getElementById('form-add-vehiculo');

    if (btnOpenAddVehiculo) {
        btnOpenAddVehiculo.addEventListener('click', () => {
            addVehiculoModal.classList.remove('hidden');
        });
    }

    if (btnCloseAddVehiculo) {
        btnCloseAddVehiculo.addEventListener('click', () => {
            addVehiculoModal.classList.add('hidden');
        });
    }

    if (formAddVehiculo) {
        formAddVehiculo.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                marca: document.getElementById('add-vehiculo-marca').value,
                modelo: document.getElementById('add-vehiculo-modelo').value,
                patente: document.getElementById('add-vehiculo-patente').value,
                kilometraje: document.getElementById('add-vehiculo-km').value.replace(/\D/g, '')
            };
            try {
                // Importación dinámica porque addVehiculo está en userFlow.js
                const { addVehiculo } = await import('./userFlow.js');
                await addVehiculo(currentUser.id, formData);
                showNotification("Vehículo guardado exitosamente", "success");
                formAddVehiculo.reset();
                addVehiculoModal.classList.add('hidden');
                // Recargar el dashboard de cliente para actualizar la pestaña
                await loadUserDashboard();
            } catch (error) {
                showNotification(error.message, "error");
            }
        });
    }
    
    // Formateo de KM para el modal de añadir vehículo
    const addVehiculoKm = document.getElementById('add-vehiculo-km');
    if (addVehiculoKm) {
        addVehiculoKm.addEventListener('input', function(e) {
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
            const tiempoValor = document.getElementById('add-servicio-tiempo-valor').value;
            const tiempoUnidad = document.getElementById('add-servicio-tiempo-unidad').value;
            
            const payload = {
                taller_id: tallerId,
                nombre: document.getElementById('add-servicio-nombre').value,
                precio_estimado: parseFloat(document.getElementById('add-servicio-precio').value),
                tiempo_estimado_valor: parseInt(tiempoValor, 10),
                tiempo_estimado_unidad: tiempoUnidad
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
    
    const filterEspecialidad = document.getElementById('filter-especialidad');
    if (filterEspecialidad) filterEspecialidad.addEventListener('change', loadUserDashboard);
    
    const sortTalleres = document.getElementById('sort-talleres');
    if (sortTalleres) sortTalleres.addEventListener('change', loadUserDashboard);

    const btnClearFilters = document.getElementById('btn-clear-filters');
    if (btnClearFilters) {
        btnClearFilters.addEventListener('click', () => {
            if (filterSector) filterSector.value = "";
            if (filterEspecialidad) filterEspecialidad.value = "";
            if (sortTalleres) sortTalleres.value = "default";
            loadUserDashboard();
        });
    }

    
    // Eventos de Servicios
    const sectorServicios = document.getElementById('filter-sector-servicios');
    const sortServicios = document.getElementById('sort-servicios');
    const clearServicios = document.getElementById('btn-clear-filters-servicios');
    
    function updateServiciosList() {
        if (!window.currentSelectedService) return;
        window.filterSortAndRenderTalleres(
            window.talleres, 
            'servicios-talleres-list', 
            window.currentSelectedService, 
            sectorServicios ? sectorServicios.value : '', 
            sortServicios ? sortServicios.value : 'default'
        );
    }
    
    if (sectorServicios) sectorServicios.addEventListener('change', updateServiciosList);
    if (sortServicios) sortServicios.addEventListener('change', updateServiciosList);
    if (clearServicios) clearServicios.addEventListener('click', () => {
        if (sectorServicios) sectorServicios.value = "";
        if (sortServicios) sortServicios.value = "default";
        updateServiciosList();
    });

    // Eventos de Assistant
    const sectorAssistant = document.getElementById('filter-sector-assistant');
    const sortAssistant = document.getElementById('sort-assistant');
    const clearAssistant = document.getElementById('btn-clear-filters-assistant');
    
    function updateAssistantList() {
        if (!window.currentAssistantSpecialty) return;
        window.filterSortAndRenderTalleres(
            window.talleres, 
            'assistant-talleres-list', 
            window.currentAssistantSpecialty, 
            sectorAssistant ? sectorAssistant.value : '', 
            sortAssistant ? sortAssistant.value : 'default'
        );
    }
    
    if (sectorAssistant) sectorAssistant.addEventListener('change', updateAssistantList);
    if (sortAssistant) sortAssistant.addEventListener('change', updateAssistantList);
    if (clearAssistant) clearAssistant.addEventListener('click', () => {
        if (sectorAssistant) sectorAssistant.value = "";
        if (sortAssistant) sortAssistant.value = "default";
        updateAssistantList();
    });
    
    setupMobileFilterToggles();


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

window.sortAndHighlightBestTaller = function(talleresArray) {
    if (!talleresArray || talleresArray.length === 0) return null;
    
    let bestTallerId = null;
    let bestTallerIndex = -1;
    let maxBayesianScore = -1;
    
    // Constantes del promedio Bayesiano
    const C = 3; // Nmero de reseas asumidas (peso del promedio base)
    const m = 4.0; // Promedio base asumido (estrellas)
    
    talleresArray.forEach((t, i) => {
        if (t.total_resenas > 0) {
            // Formula Bayesiana
            const score = (t.promedio * t.total_resenas + C * m) / (t.total_resenas + C);
            if (score > maxBayesianScore) {
                maxBayesianScore = score;
                bestTallerId = t.id;
                bestTallerIndex = i;
            }
        }
    });
    
    if (bestTallerIndex > -1) {
        const bestTaller = talleresArray.splice(bestTallerIndex, 1)[0];
        talleresArray.unshift(bestTaller);
    }
    
    return bestTallerId;
};

// ==========================================
async function loadUserDashboard() {
    // Cargar Talleres
    try {
        window.talleres = await getTalleres();
        let talleres = [...window.talleres];
        window.allResenas = await getAllResenas();

        const filterEl = document.getElementById('filter-sector');
        if (filterEl && filterEl.value) {
            talleres = talleres.filter(t => t.sector === filterEl.value);
        }

        const filterEspecialidadEl = document.getElementById('filter-especialidad');
        if (filterEspecialidadEl && filterEspecialidadEl.value) {
            talleres = talleres.filter(t => t.especialidades && t.especialidades.includes(filterEspecialidadEl.value));
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
        if (sortEl) {
            if (sortEl.value === 'rating') {
                talleres.sort((a, b) => b.promedio - a.promedio);
            } else if (sortEl.value === 'precio_asc') {
                talleres.sort((a, b) => (a.rango_precios || '').length - (b.rango_precios || '').length);
            } else if (sortEl.value === 'precio_desc') {
                talleres.sort((a, b) => (b.rango_precios || '').length - (a.rango_precios || '').length);
            }
        }

                const bestTallerId = window.sortAndHighlightBestTaller(talleres);

        const grid = document.getElementById('talleres-list');
        grid.innerHTML = '';
        if (talleres.length === 0) {
            grid.innerHTML = '<p>No hay talleres disponibles con estos filtros.</p>';
        } else {
            talleres.forEach(t => {
                grid.appendChild(createWorkshopCardNode(t, bestTallerId));
            });
        }
    } catch (e) {
        console.error(e);
    }

    // Cargar Mis Reservas
    try {
        const userId = currentUser ? currentUser.id : null;
        const reservas = await getMisReservas(userId);
        const grid = document.getElementById('reservas-list');
        if (grid) {
            grid.innerHTML = '';
            if (reservas.length === 0) {
                grid.innerHTML = `
                    <div style="text-align: center; padding: 3rem 1rem; width: 100%; grid-column: 1 / -1; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                        <p style="color: var(--text-muted); margin-bottom: 1rem; font-size: 1.1rem;">Aún no tienes reservas activas.</p>
                        <button class="btn btn-primary" onclick="switchTab('tab-home-app')">Buscar Servicios</button>
                    </div>
                `;
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
        }
    } catch (e) {
        console.error('Error cargando reservas:', e);
        const grid = document.getElementById('reservas-list');
        if (grid) grid.innerHTML = `<p class="text-error">Error al cargar reservas: ${e.message || e}</p>`;
    }

    // Cargar Vehículos (Mi Auto)
    try {
        const userId = currentUser ? currentUser.id : null;
        window.userVehicles = await getVehiculos(userId);
        const gridVehiculos = document.getElementById('vehiculos-list');
        if (gridVehiculos) {
            gridVehiculos.innerHTML = '';
            if (window.userVehicles.length === 0) {
                gridVehiculos.innerHTML = `
                    <div style="text-align: center; padding: 2rem 1rem; width: 100%; grid-column: 1 / -1; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                        <p style="color: var(--text-muted); margin-bottom: 1rem;">No tienes vehículos registrados en tu garage.</p>
                        <button class="btn btn-primary btn-small" onclick="document.getElementById('modal-add-vehiculo').classList.remove('hidden')">+ Añadir mi primer vehículo</button>
                    </div>
                `;
            } else {
                window.userVehicles.forEach(v => {
                    const card = document.createElement('div');
                    card.className = 'card hoverable-card';
                    card.style.cursor = 'pointer';
                    card.innerHTML = `
                        <h4>${v.marca} ${v.modelo}</h4>
                        <p class="text-muted">🚗 Patente: <strong>${v.patente}</strong></p>
                        <p class="text-muted">⏱ Kilometraje: ${v.kilometraje ? v.kilometraje.toLocaleString('es-CL') : 'No registrado'}</p>
                        <button class="btn btn-secondary btn-small" style="width: 100%; margin-top: 1rem;">Ver Historial de Servicios</button>
                    `;
                    card.onclick = () => window.openVehicleHistoryModal(v.id, `${v.marca} ${v.modelo}`);
                    gridVehiculos.appendChild(card);
                });
            }
        }
    } catch (e) {
        console.error('Error cargando vehículos:', e);
        const gridVehiculos = document.getElementById('vehiculos-list');
        if (gridVehiculos) gridVehiculos.innerHTML = `<p class="text-error">Error al cargar vehículos: ${e.message || e}</p>`;
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

    // Resetear formulario
    document.getElementById('booking-form').reset();

    // Generar horas disponibles para el selector visual
    const timeGrid = document.getElementById('booking-time-grid');
    const timeHidden = document.getElementById('booking-time-only');
    if (timeGrid && timeHidden) {
        timeHidden.value = ''; 
        timeGrid.innerHTML = '';
        
        // Horarios de 09:00 a 17:30 cada 30 min
        const hours = [];
        for (let h = 9; h <= 17; h++) {
            hours.push(`${h.toString().padStart(2, '0')}:00`);
            hours.push(`${h.toString().padStart(2, '0')}:30`);
        }
        
        hours.forEach(time => {
            const btn = document.createElement('div');
            btn.className = 'time-pill';
            btn.textContent = time;
            btn.onclick = () => {
                document.querySelectorAll('.time-pill').forEach(el => el.classList.remove('selected'));
                btn.classList.add('selected');
                timeHidden.value = time;
            };
            timeGrid.appendChild(btn);
        });
    }

    // Llenar selector de vehículos si existen
    const vehiculoSelectorContainer = document.getElementById('booking-vehiculo-selector-container');
    const vehiculoSelect = document.getElementById('booking-saved-vehicle');
    
    if (window.userVehicles && window.userVehicles.length > 0) {
        vehiculoSelect.innerHTML = '';
        window.userVehicles.forEach(v => {
            const option = document.createElement('option');
            option.value = v.patente;
            option.textContent = `${v.marca} ${v.modelo} (${v.patente})`;
            option.dataset.marca = v.marca;
            option.dataset.modelo = v.modelo;
            option.dataset.patente = v.patente;
            option.dataset.km = v.kilometraje || '';
            vehiculoSelect.appendChild(option);
        });
        
        const newOption = document.createElement('option');
        newOption.value = 'new';
        newOption.textContent = 'Ingresar nuevo vehículo...';
        vehiculoSelect.appendChild(newOption);
        
        vehiculoSelect.onchange = (e) => {
            const selectedOpt = e.target.options[e.target.selectedIndex];
            const marcaInput = document.getElementById('booking-marca');
            const modeloInput = document.getElementById('booking-modelo');
            const patenteInput = document.getElementById('booking-patente');
            const kmInput = document.getElementById('booking-km');

            if (e.target.value === 'new') {
                marcaInput.value = '';
                modeloInput.value = '';
                patenteInput.value = '';
                kmInput.value = '';
            } else {
                marcaInput.value = selectedOpt.dataset.marca;
                modeloInput.value = selectedOpt.dataset.modelo;
                patenteInput.value = selectedOpt.dataset.patente;
                const km = selectedOpt.dataset.km;
                kmInput.value = km ? parseInt(km, 10).toLocaleString('es-CL') : '';
            }
        };
        
        vehiculoSelect.selectedIndex = 0;
        vehiculoSelect.dispatchEvent(new Event('change'));
        
        vehiculoSelectorContainer.classList.remove('hidden');
    } else {
        vehiculoSelectorContainer.classList.add('hidden');
    }

    // Cargar servicios
    const serviciosContainer = document.getElementById('booking-servicios-container');
    serviciosContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Cargando servicios...</p>';
    try {
        const servicios = await getTallerServicios(tallerId);
        if (servicios.length === 0) {
            serviciosContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Este taller no tiene servicios registrados. Solo se permite servicio personalizado.</p>';
            serviciosContainer.innerHTML += `<input type="hidden" name="booking-servicio" value="Servicio Personalizado" data-precio="">`;
        } else {
            serviciosContainer.innerHTML = servicios.map((s, index) => `
                <label class="card hoverable-radio" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; transition: all 0.3s;">
                    <input type="radio" name="booking-servicio" value="${s.nombre}" data-precio="${s.precio_estimado}" ${index === 0 ? 'required' : ''} style="margin: 0; width: 1.2rem; height: 1.2rem; accent-color: var(--primary);">
                    <div style="flex: 1;">
                        <strong style="display: block; color: var(--primary-color); font-size: 1.05rem;">${s.nombre}</strong>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">$${s.precio_estimado} (Aprox. ${s.tiempo_estimado_valor} ${s.tiempo_estimado_unidad})</span>
                    </div>
                </label>
            `).join('');
            
            // Añadir CSS para el hover si no existe
            if (!document.getElementById('radio-hover-style')) {
                const style = document.createElement('style');
                style.id = 'radio-hover-style';
                style.innerHTML = `
                    .hoverable-radio:hover { border-color: var(--primary) !important; background: rgba(59, 130, 246, 0.05); }
                    .hoverable-radio:has(input:checked) { border-color: var(--primary) !important; background: rgba(59, 130, 246, 0.1); }
                `;
                document.head.appendChild(style);
            }
        }
    } catch (e) {
        console.error(e);
        serviciosContainer.innerHTML = '<p style="color: red; font-size: 0.9rem;">Error cargando servicios</p>';
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
                <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.5rem;">${r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recientemente'}</p>
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
            card.className = 'workshop-card'; // Cambiamos a la clase del diseño de busqueda
            
            // Reutilizamos la lógica de formateo
            let especialidadesText = 'Multimarca';
            if (taller.especialidades) {
                let arr = [];
                if (Array.isArray(taller.especialidades)) {
                    arr = taller.especialidades;
                } else {
                    try {
                        arr = JSON.parse(taller.especialidades);
                        if (!Array.isArray(arr)) arr = [taller.especialidades];
                    } catch(e) {
                        arr = [taller.especialidades];
                    }
                }
                especialidadesText = [...new Set(arr)].join(', ');
            }

            card.innerHTML = `
                <div class="workshop-header">
                    <h4 class="workshop-title" style="margin-top: 0; padding-top: 0;">${taller.nombre}</h4>
                </div>
                
                <div class="workshop-attributes">
                    <div class="workshop-attr">
                        <span class="workshop-attr-label">Dirección</span>
                        <span class="workshop-attr-value">${taller.direccion}</span>
                    </div>
                    <div class="workshop-attr">
                        <span class="workshop-attr-label">Teléfono</span>
                        <span class="workshop-attr-value">${taller.telefono || 'Sin teléfono'}</span>
                    </div>
                    <div class="workshop-attr">
                        <span class="workshop-attr-label">Especialidad</span>
                        <span class="workshop-attr-value">${especialidadesText || 'Ninguna'}</span>
                    </div>
                </div>

                <div style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                    <span class="workshop-attr-label" style="display: block; margin-bottom: 0.5rem;">Servicios Ofrecidos</span>
                    <div id="lista-servicios-${taller.id}" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Cargando...</div>
                    </div>
                    <button class="btn btn-secondary btn-small" onclick="openAddServicioModal('${taller.id}')" style="width: 100%;">+ Agregar Servicio</button>
                </div>
            `;
            profileList.appendChild(card);
            
            // Cargar servicios
            getTallerServicios(taller.id).then(servicios => {
                const ul = document.getElementById(`lista-servicios-${taller.id}`);
                if (!servicios || servicios.length === 0) {
                    ul.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">No hay ningún servicio inscrito.</div>';
                } else {
                    ul.innerHTML = servicios.map(s => `
                        <div class="card" style="padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); margin-bottom: 0;">
                            <strong style="color: var(--primary); display: block; margin-bottom: 0.25rem; font-size: 0.95rem;">${s.nombre}</strong>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                                <span>Precio: <strong style="color: white;">$${Number(s.precio_estimado).toLocaleString('es-CL')}</strong></span>
                                <span>Aprox: <strong style="color: white;">${s.tiempo_estimado_valor} ${s.tiempo_estimado_unidad}</strong></span>
                            </div>
                        </div>
                    `).join('');
                }
            }).catch(e => {
                console.error("Error cargando servicios:", e);
                const ul = document.getElementById(`lista-servicios-${taller.id}`);
                if (ul) ul.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">No hay ningún servicio inscrito.</div>';
            });
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

        card.classList.add('hoverable-card');
        card.style.cursor = 'pointer';
        card.onclick = () => window.openOrderDetailsModal(o);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <p style="color: var(--primary-color); font-weight: bold; font-size: 1rem; margin: 0; flex: 1; padding-right: 0.5rem;">${o.servicio_solicitado || 'Servicio Personalizado'}</p>
                <span style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.5rem; border-radius: 4px; font-family: monospace; font-size: 0.85rem; font-weight: bold; white-space: nowrap;">${o.vehiculos?.patente || 'N/A'}</span>
            </div>
            <p class="text-muted" style="font-size:0.85rem; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${o.observaciones || 'Sin observaciones'}</p>
            <div style="display:flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.8rem;">
                <button class="btn btn-secondary" style="font-size: 1.3rem; width: 45px; height: 35px; padding: 0; display: flex; align-items: center; justify-content: center;" onclick="event.stopPropagation(); reverseOrder('${o.id}', '${o.estado}')" ${leftDisabled} title="${leftTitle}">${leftIcon}</button>
                <span class="status-badge" style="background: rgba(255,255,255,0.1); color: var(--text-light); font-size: 0.75rem;">${o.estado}</span>
                <button class="btn btn-secondary" style="font-size: 1.3rem; width: 45px; height: 35px; padding: 0; display: flex; align-items: center; justify-content: center;" onclick="event.stopPropagation(); advanceOrder('${o.id}', '${o.estado}')" ${rightDisabled} title="Avanzar etapa">${rightIcon}</button>
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

// ==========================================
// SERVICIOS Y ASISTENTE (V2)
// ==========================================

// Eliminado switchTab duplicado

// Lógica de Búsqueda por Servicios
document.getElementById('filter-servicio-especifico')?.addEventListener('change', async (e) => {
    const servicioName = e.target.value;
    const container = document.getElementById('servicios-talleres-list');
    container.innerHTML = '<div class="spinner"></div>';
    
    try {
        const { supabase } = await import('./supabaseClient.js');
        const { data, error } = await supabase
            .from('taller_servicios')
            .select('precio_estimado, tiempo_estimado_valor, tiempo_estimado_unidad, talleres(*)');
            
        if (error) throw error;
        
        const filtered = (data || []).filter(item => item.nombre === servicioName);
        
        container.innerHTML = '';
        if (filtered.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%; grid-column: 1 / -1;">No encontramos talleres que ofrezcan este servicio aún.</p>';
            return;
        }
        
        filtered.forEach(item => {
            if (!item.talleres) return;
            const taller = item.talleres;
            
            const card = document.createElement('div');
            card.className = 'card hoverable-card';
            card.innerHTML = `
                <div class="card-badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; margin-bottom: 1rem; display: inline-block; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem; font-weight: bold;">Ofrece ${servicioName}</div>
                <h4>${taller.nombre}</h4>
                <p class="text-muted" style="margin-bottom: 1rem;">📍 ${taller.direccion}</p>
                <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span class="text-muted">Precio Estimado:</span>
                        <strong style="color: white;">$${item.precio_estimado ? item.precio_estimado.toLocaleString('es-CL') : 'A convenir'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span class="text-muted">Tiempo Estimado:</span>
                        <span style="color: white;">${item.tiempo_estimado_valor || '?'} ${item.tiempo_estimado_unidad || ''}</span>
                    </div>
                </div>
                <button class="btn btn-primary" style="width: 100%;" onclick="window.openBookingModal('${taller.id}', '${taller.nombre}').then(() => { document.getElementById('booking-notes').value = 'Solicito servicio de: ${servicioName}'; });">Agendar este servicio</button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color: var(--error); text-align:center;">Error al cargar talleres.</p>';
    }
});

// Lógica del Asistente
const assistantTree = {
    start: {
        question: '¿Qué tipo de problema o síntoma tiene tu vehículo?',
        options: [
            { text: '👂 Escucho un ruido raro', next: 'ruido' },
            { text: '⚡ El auto no arranca / no prende', next: 'no_prende' },
            { text: '💡 Hay una luz encendida en el tablero', next: 'luces' },
            { text: '🛑 Siento que frena mal', next: 'frenos' },
            { text: '❓ Mi problema no está aquí', next: 'fallback' }
        ]
    },
    ruido: {
        question: '¿En qué momento escuchas el ruido?',
        options: [
            { text: 'Al pisar el freno (Chillido metálico)', audio: './assets/audio/frenos.mp3', diagnosis: 'Problema en pastillas o discos de freno.', specialty: 'Frenos' },
            { text: 'Chillido agudo al acelerar (Correa)', audio: './assets/audio/correa.mp3', diagnosis: 'Posible falla de correas o poleas.', specialty: 'Mecánica General' },
            { text: 'Constantemente desde el motor (Golpeteo)', audio: './assets/audio/motor.mp3', diagnosis: 'Posible falla interna del motor, válvulas o metales.', specialty: 'Mecánica General' },
            { text: 'Al pasar un bache (Ruido sordo)', audio: './assets/audio/suspension.mp3', diagnosis: 'Problema en dirección o suspensión.', specialty: 'Suspensión y Dirección' },
            { text: 'No estoy seguro', next: 'fallback' }
        ]
    },
    no_prende: {
        question: '¿Hace algún sonido al girar la llave o apretar el botón?',
        options: [
            { text: "Hace un sonido rápido como 'click click' y no enciende", audio: './assets/audio/falla_motor.mp3', diagnosis: 'Batería descargada o terminales sueltos.', specialty: 'Electromecánica' },
            { text: 'Gira el motor normalmente pero no arranca', diagnosis: 'Problema de inyección o encendido (bujías/bobinas).', specialty: 'Mecánica General' },
            { text: 'No hace absolutamente nada, todo apagado', diagnosis: 'Batería completamente muerta o fusible principal quemado.', specialty: 'Electromecánica' },
            { text: 'Mi problema no está aquí', next: 'fallback' }
        ]
    },
    luces: {
        question: '¿Qué color tiene la luz del tablero principal que te preocupa?',
        options: [
            { text: 'Roja (Aceite, Temperatura, Batería)', diagnosis: 'Alerta crítica. Detén el vehículo. Requiere revisión urgente.', specialty: 'Mecánica General' },
            { text: 'Amarilla / Naranja (Check Engine, ABS)', diagnosis: 'Alerta de precaución. El sistema detectó un fallo.', specialty: 'Diagnóstico Electrónico' },
            { text: 'No sé el color, pero está prendida', next: 'fallback' }
        ]
    },
    frenos: {
        question: '¿Qué sientes exactamente al frenar?',
        options: [
            { text: 'El pedal se va al fondo o se siente esponjoso', diagnosis: 'Fuga de líquido de frenos o aire en el sistema.', specialty: 'Frenos' },
            { text: 'El auto vibra o tiembla mucho', diagnosis: 'Discos de freno rectificados o deformados.', specialty: 'Frenos' },
            { text: 'Mi problema no está aquí', next: 'fallback' }
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
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '0.5rem';
        wrapper.style.width = '100%';

        if (opt.audio) {
            const audioBtn = document.createElement('button');
            audioBtn.className = 'btn btn-secondary';
            audioBtn.style.padding = '0.5rem 1rem';
            audioBtn.style.fontSize = '1.2rem';
            audioBtn.innerHTML = '🔊';
            audioBtn.title = 'Escuchar sonido de ejemplo';
            audioBtn.onclick = (e) => {
                e.stopPropagation();
                new Audio(opt.audio).play();
            };
            wrapper.appendChild(audioBtn);
        }

        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.style.flex = '1';
        btn.style.textAlign = 'center';
        btn.textContent = opt.text;
        btn.onclick = () => window.handleAssistantOption(opt);
        
        wrapper.appendChild(btn);
        optionsContainer.appendChild(wrapper);
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
    document.getElementById('assistant-result-text').innerHTML = `<strong>${diagnosisText}</strong><br><br><span style="color: var(--text-muted); font-size: 0.9rem;">Especialidad recomendada: ${specialty}</span>`;
    
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
                card.innerHTML = `
                    <h4>${taller.nombre}</h4>
                    <p class="text-muted" style="margin-bottom: 1rem;">📍 ${taller.direccion}</p>
                    <button class="btn btn-primary btn-small" style="width:100%" onclick="window.openBookingModal('${taller.id}', '${taller.nombre}').then(() => { document.getElementById('booking-notes').value = 'Diagnóstico previo: ${diagnosisText}'; });">Reservar Aquí</button>
                `;
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
    await window.showAssistantDiagnosis(`Problema descrito por el cliente: "${userText}"`, 'Mecánica General');
});


// =====================================
// FUNCIONES GLOBALES Y UTILIDADES
// =====================================

function createWorkshopCardNode(t, bestTallerId) {
    const card = document.createElement('div');
    card.className = 'workshop-card';
    
    let starsDisplay = '';
    if (t.total_resenas > 0) {
        const fullStars = Math.round(t.promedio);
        starsDisplay = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    } else {
        starsDisplay = 'Nuevo';
    }

    const reviewsText = t.total_resenas > 0 ? `(${t.total_resenas})` : '(Sin reseñas)';
    
    let badgeHtml = '';
    if (t.id === bestTallerId) {
        badgeHtml = `<div class="badge-destacado">★ DESTACADO</div>`;
    }

    let especialidadesText = 'Multimarca';
    if (t.especialidades) {
        let arr = [];
        if (Array.isArray(t.especialidades)) {
            arr = t.especialidades;
        } else {
            try {
                arr = JSON.parse(t.especialidades);
                if (!Array.isArray(arr)) arr = [t.especialidades];
            } catch(e) {
                arr = [t.especialidades];
            }
        }
        especialidadesText = [...new Set(arr)].join(', ');
    }

    card.innerHTML = `
        ${badgeHtml}
        <div class="workshop-header">
            <div class="workshop-rating">
                ${starsDisplay} <span class="reviews-count">${reviewsText}</span>
            </div>
            <h4 class="workshop-title">${t.nombre}</h4>
        </div>
        
        <div class="workshop-attributes">
            <div class="workshop-attr">
                <span class="workshop-attr-label">Dirección</span>
                <span class="workshop-attr-value">${t.direccion}</span>
            </div>
            <div class="workshop-attr">
                <span class="workshop-attr-label">Sector</span>
                <span class="workshop-attr-value">${t.sector || 'Sin sector'}</span>
            </div>
            <div class="workshop-attr">
                <span class="workshop-attr-label">Precios</span>
                <span class="workshop-attr-value">${t.rango_precios || '$$'}</span>
            </div>
            <div class="workshop-attr">
                <span class="workshop-attr-label">Especialidad</span>
                <span class="workshop-attr-value">${especialidadesText}</span>
            </div>
        </div>
        
        <div class="workshop-actions">
            ${t.total_resenas > 0 ? `<button class="btn btn-secondary" style="width:100%" onclick="openViewResenasModal('${t.id}', '${t.nombre}')">Ver Comentarios</button>` : ''}
            <button class="btn btn-primary" style="width:100%" onclick="openBookingModal('${t.id}', '${t.nombre}')">Reservar</button>
        </div>
    `;
    return card;
}

// Inicializar Búsqueda por Servicios
document.addEventListener('DOMContentLoaded', () => {
    const serviceButtons = document.querySelectorAll('.btn-service-filter');
    const serviciosList = document.getElementById('servicios-talleres-list');
    
    serviceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover 'active' de todos
            serviceButtons.forEach(b => b.classList.remove('active'));
            // Activar este
            btn.classList.add('active');
            
            const selectedService = btn.getAttribute('data-service');
            
            if (!window.talleres || window.talleres.length === 0) {
                if (serviciosList) serviciosList.innerHTML = '<p>No hay talleres cargados en el sistema.</p>';
                return;
            }
            
            // Filtrar talleres
            window.currentSelectedService = selectedService;
            const sectorServicios = document.getElementById('filter-sector-servicios');
            const sortServicios = document.getElementById('sort-servicios');
            window.filterSortAndRenderTalleres(
                window.talleres, 
                'servicios-talleres-list', 
                selectedService, 
                sectorServicios ? sectorServicios.value : '', 
                sortServicios ? sortServicios.value : 'default'
            );
        });
    });
});



window.currentSelectedService = null;
window.currentAssistantSpecialty = null;

window.filterSortAndRenderTalleres = function(baseTalleresArray, containerId, specialtyParam, sectorValue, sortValue) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!baseTalleresArray || baseTalleresArray.length === 0) {
        container.innerHTML = '<p>No hay talleres disponibles.</p>';
        return;
    }
    
    // 1. Filter by specialty (if provided)
    let filtered = [...baseTalleresArray];
    if (specialtyParam) {
        filtered = filtered.filter(t => {
            if (!t.especialidades) return false;
            let arr = [];
            if (Array.isArray(t.especialidades)) arr = t.especialidades;
            else {
                try {
                    arr = JSON.parse(t.especialidades);
                    if (!Array.isArray(arr)) arr = [t.especialidades];
                } catch(e) {
                    arr = [t.especialidades];
                }
            }
            return arr.includes(specialtyParam);
        });
    }
    
    // 2. Filter by sector
    if (sectorValue) {
        filtered = filtered.filter(t => t.sector === sectorValue);
    }
    
    // 3. Sort
    if (sortValue === 'rating') {
        filtered.sort((a, b) => b.promedio - a.promedio);
    } else if (sortValue === 'precio_asc') {
        filtered.sort((a, b) => (a.rango_precios || '').length - (b.rango_precios || '').length);
    } else if (sortValue === 'precio_desc') {
        filtered.sort((a, b) => (b.rango_precios || '').length - (a.rango_precios || '').length);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '<p>No hay talleres que coincidan con estos filtros.</p>';
        return;
    }
    
    // 4. Highlight best (Bayesian)
    const bestId = window.sortAndHighlightBestTaller(filtered);
    
    // 5. Render
    filtered.forEach(t => {
        container.appendChild(createWorkshopCardNode(t, bestId));
    });
};

// Eventos universales para toggle mobile
function setupMobileFilterToggles() {
    ['talleres', 'servicios', 'assistant'].forEach(prefix => {
        const btn = document.getElementById(`btn-toggle-mobile-filters-${prefix === 'talleres' ? '' : prefix}`);
        // para talleres el boton era btn-toggle-mobile-filters, mantendremos compatibilidad o lo mapeamos
        const realBtn = document.getElementById(`btn-toggle-mobile-filters${prefix === 'talleres' ? '' : '-'+prefix}`);
        const container = document.getElementById(`${prefix}-filters-container`);
        
        if (realBtn && container) {
            // Remove previous listeners if any by cloning
            const newBtn = realBtn.cloneNode(true);
            realBtn.parentNode.replaceChild(newBtn, realBtn);
            
            newBtn.addEventListener('click', function() {
                if (container.classList.contains('mobile-filters-hidden')) {
                    container.classList.remove('mobile-filters-hidden');
                    container.classList.add('show');
                    this.textContent = 'Filtros ▴';
                } else {
                    container.classList.add('mobile-filters-hidden');
                    container.classList.remove('show');
                    this.textContent = 'Filtros ▾';
                }
            });
        }
    });
}


// =====================================
// HISTORIAL DE VEHICULO
// =====================================

window.openVehicleHistoryModal = async (vehiculoId, vehiculoName) => {
    const modal = document.getElementById('vehicle-history-modal');
    const title = document.getElementById('history-modal-title');
    const list = document.getElementById('vehicle-history-list');
    
    if (!modal || !title || !list) return;
    
    title.textContent = `Historial: ${vehiculoName}`;
    list.innerHTML = '<div class="spinner"></div>';
    modal.classList.remove('hidden');
    
    try {
        const { supabase } = await import('./supabaseClient.js');
        // Get reservations for this vehicle
        const { data, error } = await supabase
            .from('ordenes_trabajo')
            .select('*, talleres(nombre)')
            .eq('vehiculo_id', vehiculoId)
            .order('fecha_ingreso', { ascending: false });
            
        if (error) throw error;
        
        list.innerHTML = '';
        if (!data || data.length === 0) {
            list.innerHTML = '<p class="text-muted" style="text-align: center;">Aún no hay servicios registrados para este vehículo.</p>';
            return;
        }
        
        data.forEach(r => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.padding = '1rem';
            card.style.backgroundColor = 'rgba(255,255,255,0.02)';
            
            let statusClass = 'status-pending';
            if (r.estado === 'aprobada') statusClass = 'status-approved';
            else if (r.estado === 'rechazada') statusClass = 'status-rejected';
            else if (r.estado === 'completada') statusClass = 'status-completed';
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong style="color: var(--primary);">${r.talleres?.nombre || 'Taller Desconocido'}</strong>
                    <span class="status-badge ${statusClass}" style="font-size: 0.75rem;">${r.estado}</span>
                </div>
                <p style="margin: 0; font-size: 0.9rem;"><strong>Fecha:</strong> ${new Date(r.fecha_ingreso).toLocaleDateString()}</p>
                <p style="margin: 0; font-size: 0.9rem;" class="text-muted"><strong>Motivo:</strong> ${r.observaciones || 'Sin detalles'}</p>
            `;
            list.appendChild(card);
        });
        
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p class="text-error" style="text-align: center;">Error al cargar el historial.</p>';
    }
};

document.getElementById('close-vehicle-history-modal')?.addEventListener('click', () => {
    document.getElementById('vehicle-history-modal').classList.add('hidden');
});


// Mobile filters toggle
document.getElementById('btn-toggle-mobile-filters')?.addEventListener('click', function() {
    const container = document.getElementById('talleres-filters-container');
    if (container.classList.contains('mobile-filters-hidden')) {
        container.classList.remove('mobile-filters-hidden');
        container.classList.add('show');
        this.textContent = 'Filtros ▴';
    } else {
        container.classList.add('mobile-filters-hidden');
        container.classList.remove('show');
        this.textContent = 'Filtros ▾';
    }
});

window.openOrderDetailsModal = (o) => {
    const content = document.getElementById('order-detail-content');
    content.innerHTML = `
        <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            <p style="margin-bottom: 0.5rem;"><strong style="color: var(--primary);">Servicio Solicitado:</strong></p>
            <p style="font-size: 1.1rem; font-weight: 500; margin-bottom: 1rem;">${o.servicio_solicitado || 'Servicio Personalizado'}</p>
            
            <p style="margin-bottom: 0.5rem;"><strong style="color: var(--primary);">Cliente y Vehículo:</strong></p>
            <p style="margin-bottom: 0.2rem;">👤 ${o.vehiculos?.usuarios?.nombre || 'Desconocido'}</p>
            <p style="margin-bottom: 1rem;">🚗 ${o.vehiculos?.marca} ${o.vehiculos?.modelo} <span style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.4rem; border-radius: 4px; font-family: monospace;">${o.vehiculos?.patente}</span></p>

            <p style="margin-bottom: 0.5rem;"><strong style="color: var(--primary);">Detalles Financieros y Tiempo:</strong></p>
            <p style="margin-bottom: 0.2rem;">💰 Precio: <strong>${o.precio_acordado ? '$' + Number(o.precio_acordado).toLocaleString('es-CL') : 'A convenir'}</strong></p>
            <p style="margin-bottom: 1rem;">📅 Ingreso: ${new Date(o.fecha_ingreso).toLocaleString()}</p>

            <p style="margin-bottom: 0.5rem;"><strong style="color: var(--primary);">Observaciones del cliente:</strong></p>
            <div style="background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 6px; font-size: 0.95rem; color: var(--text-light); line-height: 1.4;">
                ${o.observaciones || 'Sin observaciones adicionales.'}
            </div>
        </div>
    `;
    document.getElementById('modal-view-order').classList.remove('hidden');
};
