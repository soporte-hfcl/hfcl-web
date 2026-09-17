/**
 * Sistema de Turnos y Bitácora Multiservicio - Hospital Lanco
 * Sincronizado con auth.js centralizado
 */

const API_URL = "https://script.google.com/macros/s/AKfycbyCATCxSsqlGj_vZF4V84nHsG6VN_MHZrOKAVIYMuvw7gIlaxwFM_vp3Z1icehP04nfWA/exec";

// ==========================================
// CONFIGURACIÓN DE SERVICIOS Y DOTACIONES REALES
// ==========================================
const SERVICIOS_CONFIG = {
    tic: {
        nombre: "TIC",
        icono: "fa-gears",
        color: "#38bdf8",
        detalleDotacion: "1 Técnico por turno",
        gruposTurno: [
            { id: 'tic_a', name: 'Sandro', detalle: '👤 Sandro Cuvertino (Técnico TIC)', color: '#3b82f6', isJefe: false },
            { id: 'tic_b', name: 'Juan', detalle: '👤 Juan Mora (Técnico TIC)', color: '#10b981', isJefe: false },
            { id: 'tic_c', name: 'Sergio', detalle: '👤 Sergio Sayago (Técnico TIC)', color: '#f59e0b', isJefe: false },
            { id: 'tic_d', name: 'Willy', detalle: '👤 Willy Ramirez (Técnico TIC)', color: '#8b5cf6', isJefe: false }
        ]
    },
    urgencia: {
        nombre: "Urgencia",
        icono: "fa-ambulance",
        color: "#ef4444",
        detalleDotacion: "1 Matrón(a) • 1 Enfermera(o) • 2 TENS • 1 Aux. Aseo",
        gruposTurno: [
            { 
                id: 'urg_a', 
                name: 'Urgencia A', 
                detalle: '• Matrón: Gustavo Gallardo • Enf:  Elizabeth Contrera>• TENS: Ana Lopez<br>• Aux: Hernan Aedo', 
                color: '#ef4444', 
                isJefe: false 
            },
            { 
                id: 'urg_b', 
                name: 'Urgencia B', 
                detalle: '• Matrón(a): ...<br>• Enf: ...<br>• TENS: Patricia Quilapan<br>• Aux: Ariel Amigo', 
                color: '#dc2626', 
                isJefe: false 
            },
            { 
                id: 'urg_c', 
                name: 'Urgencia C', 
                detalle: '• Matrón: Victor Sanhueza<br>• Enf: Camila Vargas<br>• TENS: Nancy Fernandez<br>• Aux: Marcos Guarda', 
                color: '#b91c1c', 
                isJefe: false 
            },
            { 
                id: 'urg_d', 
                name: 'Urgencia D', 
                detalle: '• Matrón(a): ...<br>• Enf: ...<br>• TENS: ...<br>• Aux: Simon Almonacid', 
                color: '#991b1b', 
                isJefe: false 
            }
        ]
    },
    samu: {
        nombre: "SAMU",
        icono: "fa-phone-alt",
        color: "#f59e0b",
        detalleDotacion: "1 Conductor • 1 Enfermero(a) • 1 TENS",
        gruposTurno: [
            { id: 'samu_a', name: 'SAMU A', detalle: '• Cond: Pedro L.<br>• Enf: Sofía V.<br>• TENS: Mario K.', color: '#f59e0b', isJefe: false },
            { id: 'samu_b', name: 'SAMU B', detalle: '• Cond: ...<br>• Enf: ...<br>• TENS: ...', color: '#d97706', isJefe: false },
            { id: 'samu_c', name: 'SAMU C', detalle: '• Cond: ...<br>• Enf: ...<br>• TENS: ...', color: '#b45309', isJefe: false },
            { id: 'samu_d', name: 'SAMU D', detalle: '• Cond: ...<br>• Enf: ...<br>• TENS: ...', color: '#92400e', isJefe: false }
        ]
    },
    hospitalizacion: {
        nombre: "Hospitalización",
        icono: "fa-bed",
        color: "#10b981",
        detalleDotacion: "1 Enfermera(o) • 2 TENS • 1 Aux. Aseo",
        gruposTurno: [
            { id: 'hosp_a', name: 'Hosp. A', detalle: '• Enf: Barbara Vivanco<br>• TENS: Yenny Melo<br>• Aux: Jose Abello.', color: '#10b981', isJefe: false },
            { id: 'hosp_b', name: 'Hosp. B', detalle: '• Enf: ...<br>• TENS: ...<br>• Aux: ...', color: '#059669', isJefe: false },
            { id: 'hosp_c', name: 'Hosp. C', detalle: '• Enf: ...<br>• TENS: ...<br>• Aux: ...', color: '#047857', isJefe: false },
            { id: 'hosp_d', name: 'Hosp. D', detalle: '• Enf: ...<br>• TENS: ...<br>• Aux: ...', color: '#065f46', isJefe: false }
        ]
    },
    guardias: {
        nombre: "Guardias",
        icono: "fa-shield-alt",
        color: "#8b5cf6",
        detalleDotacion: "5 Día / 3 Noche",
        gruposTurno: [
            { id: 'g_a', name: 'Guardia A', detalle: '• Personal: [Listado 5 Día / 3 Noche]', color: '#8b5cf6', isJefe: false },
            { id: 'g_b', name: 'Guardia B', detalle: '• Personal: [Listado 5 Día / 3 Noche]', color: '#7c3aed', isJefe: false },
            { id: 'g_c', name: 'Guardia C', detalle: '• Personal: [Listado 5 Día / 3 Noche]', color: '#6d28d9', isJefe: false },
            { id: 'g_d', name: 'Guardia D', detalle: '• Personal: [Listado 5 Día / 3 Noche]', color: '#5b21b6', isJefe: false }
        ]
    },
    conductores: {
        nombre: "Conductores",
        icono: "fa-car",
        color: "#ec4899",
        detalleDotacion: "2 Conductores por turno",
        gruposTurno: [
            { id: 'cond_a', name: 'Conductores A', detalle: '• Conductor 1: Jorge V.<br>• Conductor 2: Marcelo B.', color: '#ec4899', isJefe: false },
            { id: 'cond_b', name: 'Conductores B', detalle: '• Conductor 1: ...<br>• Conductor 2: ...', color: '#db2777', isJefe: false },
            { id: 'cond_c', name: 'Conductores C', detalle: '• Conductor 1: ...<br>• Conductor 2: ...', color: '#be185d', isJefe: false },
            { id: 'cond_d', name: 'Conductores D', detalle: '• Conductor 1: ...<br>• Conductor 2: ...', color: '#9d174d', isJefe: false }
        ]
    }
};

let servicioActual = 'tic'; // Servicio por defecto al cargar

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const REF_DATE = new Date(2026, 0, 1); 

let currentDate = new Date();
let selectedWorkerFilter = ""; 
let currentUser = null; 
let bitacoraRemotaCache = []; 

function getChileanHoliday(year, month, day) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const keyMMDD = `${mm}-${dd}`;

    const fixedHolidays = {
        '01-01': 'Año Nuevo',
        '05-01': 'Día del Trabajo',
        '05-21': 'Glorias Navales',
        '06-20': 'Pueblos Indígenas',
        '06-29': 'San Pedro y San Pablo',
        '07-16': 'Virgen del Carmen',
        '08-15': 'Asunción de la Virgen',
        '09-18': 'Fiestas Patrias',
        '09-19': 'Glorias del Ejército',
        '10-12': 'Encuentro 2 Mundos',
        '10-31': 'Iglesias Evangélicas',
        '11-01': 'Todos los Santos',
        '12-08': 'Inmaculada Concepción',
        '12-25': 'Navidad'
    };

    return fixedHolidays[keyMMDD] || null;
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initControls();
    initFiltroServicio(); 
    initBitacora();
    initModal();
    renderTurnantesCards();
    renderCalendar();
    fetchBitacoraRemota();
    initAuth(); 

    // Asegurar visibilidad del contenedor del calendario
    const calSection = document.getElementById('seccionCalendario');
    if (calSection) calSection.classList.remove('hidden');
});

/* ==========================================================================
   0. GESTIÓN DEL SELECTOR DE SERVICIOS
   ========================================================================== */
function initFiltroServicio() {
    const selector = document.getElementById('filtroServicioSelect');
    if (!selector) return;

    selector.addEventListener('change', (e) => {
        servicioActual = e.target.value;
        selectedWorkerFilter = ""; 
        renderTurnantesCards();
        renderCalendar();
    });
}

/* ==========================================================================
   1. MÓDULO DE AUTENTICACIÓN Y ROLES
   ========================================================================== */
function initAuth() {
    sincronizarSesionAuth();
}

function sincronizarSesionAuth() {
    const sesionGuardada = localStorage.getItem('usuarioActivo');
    const authDropdownContainer = document.getElementById('authDropdownContainer');
    
    const btnNewBitacora = document.getElementById('btnNewBitacora');
    const btnOpenBitacoraList = document.getElementById('btnOpenBitacoraList');
    const btnOpenStatsModal = document.getElementById('btnOpenStatsModal');
    const userDashboard = document.getElementById('userDashboard');

    if (sesionGuardada) {
        try {
            const usuario = JSON.parse(sesionGuardada);
            
            currentUser = SERVICIOS_CONFIG.tic.gruposTurno.find(w => w.name.toLowerCase().includes(usuario.nombre.split(' ')[0].toLowerCase())) || {
                id: usuario.nombre.toLowerCase().split(' ')[0],
                name: usuario.nombre,
                isJefe: usuario.rol === 'admin' || usuario.rol === 'consultor_datos'
            };

            if (authDropdownContainer) {
                authDropdownContainer.innerHTML = `
                    <div class="dropdown" style="position: relative; display: inline-block;">
                        <button class="nav-auth-btn" style="background: #1e3a8a; color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-user-check" style="color: #4ade80;"></i> <span>Hola, ${usuario.nombre.split(' ')[0]}</span> <i class="fas fa-chevron-down" style="font-size: 0.65rem;"></i>
                        </button>
                        <div class="dropdown-content" style="right: 0; left: auto; min-width: 160px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: none; position: absolute; top: 100%; margin-top: 5px; z-index: 100;">
                            <a href="javascript:void(0);" onclick="cerrarSesion()" style="padding: 10px 15px; display: flex; align-items: center; gap: 8px; color: #dc2626; font-size: 0.8rem; font-weight: 600; text-decoration: none;">
                                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                            </a>
                        </div>
                    </div>
                `;

                const dropBtn = authDropdownContainer.querySelector('.nav-auth-btn');
                const dropContent = authDropdownContainer.querySelector('.dropdown-content');
                
                dropBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropContent.style.display = dropContent.style.display === 'block' ? 'none' : 'block';
                });

                window.addEventListener('click', () => {
                    if (dropContent) dropContent.style.display = 'none';
                });
            }

            if (userDashboard) userDashboard.classList.remove('hidden');
            if (btnOpenStatsModal) btnOpenStatsModal.classList.remove('hidden');
            if (btnOpenBitacoraList) btnOpenBitacoraList.classList.remove('hidden');
            if (btnNewBitacora) btnNewBitacora.classList.remove('hidden');

            renderUserDashboard();

        } catch (e) {
            console.error("Error al sincronizar sesión:", e);
        }
    } else {
        currentUser = null;
        
        if (authDropdownContainer) {
            authDropdownContainer.innerHTML = `
                <button class="nav-auth-btn" onclick="openAccesoFuncionarioModal()" style="background: #1e3a8a; color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-user-circle"></i> <span id="authButtonText">Acceso Funcionario</span>
                </button>
            `;
        }

        if (userDashboard) userDashboard.classList.add('hidden');
        if (btnNewBitacora) btnNewBitacora.classList.add('hidden');
        if (btnOpenBitacoraList) btnOpenBitacoraList.classList.add('hidden');
        if (btnOpenStatsModal) btnOpenStatsModal.classList.add('hidden');
    }
}

function getNextShiftForWorker(workerId) {
    const now = new Date();
    const currentHour = now.getHours();

    for (let i = 0; i < 45; i++) {
        const checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        const shifts = getShiftsForDate(checkDate);
        
        const isLargoWorker = (shifts.largo.id === workerId);
        const isNocheWorker = (shifts.noche.id === workerId);

        if (isLargoWorker || isNocheWorker) {
            let isCurrentOrPast = false;

            if (i === 0) {
                if (isLargoWorker && currentHour >= 20) isCurrentOrPast = true; 
                if (isNocheWorker && currentHour >= 8 && currentHour < 20) isCurrentOrPast = true; 
            } else if (i < 0) {
                isCurrentOrPast = true;
            }

            if (i > 0 || (i === 0 && !isCurrentOrPast)) {
                if (isLargoWorker) {
                    return {
                        type: '☀️ Turno Largo (08:00 - 20:00)',
                        dateStr: `${checkDate.getDate()} de ${MONTH_NAMES[checkDate.getMonth()]}`
                    };
                }
                if (isNocheWorker) {
                    return {
                        type: '🌙 Turno Noche (20:00 - 08:00)',
                        dateStr: `${checkDate.getDate()} de ${MONTH_NAMES[checkDate.getMonth()]}`
                    };
                }
            }
        }
    }
    return { type: 'No programado', dateStr: 'Próximamente' };
}

function renderUserDashboard() {
    if (!currentUser) return;
    const userDashboard = document.getElementById('userDashboard');
    const dashUserName = document.getElementById('dashUserName');
    const dashGrid = document.getElementById('dashGrid');

    dashUserName.innerText = `Bienvenido, ${currentUser.name} ${currentUser.isJefe ? '(Jefatura)' : ''}`;
    userDashboard?.classList.remove('hidden');
}

/* ==========================================================================
   2. CÁLCULO DE TURNOS Y RENDERIZADO DE TARJETAS LATERALES
   ========================================================================== */
function getShiftsForDate(dateObj) {
    const d1 = new Date(REF_DATE.getFullYear(), REF_DATE.getMonth(), REF_DATE.getDate());
    const d2 = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    
    const grupos = SERVICIOS_CONFIG[servicioActual].gruposTurno;
    const turnantes = grupos.filter(w => !w.isJefe);
    
    const largoIdx = ((diffDays % turnantes.length) + turnantes.length) % turnantes.length;
    const nocheIdx = ((largoIdx - 1) + turnantes.length) % turnantes.length;
    
    return {
        largo: turnantes[largoIdx],
        noche: turnantes[nocheIdx]
    };
}

function getMonthlyShiftsForWorker(workerId, year, month) {
    const totalDays = new Date(year, month + 1, 0).getDate();
    let countL = 0;
    let countN = 0;
    for (let d = 1; d <= totalDays; d++) {
        const evalDate = new Date(year, month, d);
        const shifts = getShiftsForDate(evalDate);
        if (shifts.largo.id === workerId) countL++;
        if (shifts.noche.id === workerId) countN++;
    }
    return { countL, countN, total: countL + countN };
}

function renderTurnantesCards() {
    const container = document.getElementById('turnantesCards');
    if (!container) return;
    container.innerHTML = '';

    const servicioInfo = SERVICIOS_CONFIG[servicioActual];
    const gruposServicio = servicioInfo.gruposTurno;

    if (servicioInfo.detalleDotacion) {
        const infoBox = document.createElement('div');
        infoBox.style.cssText = "background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 0.78rem; color: #475569; margin-bottom: 4px;";
        infoBox.innerHTML = `<strong>Dotación por Turno:</strong><br>${servicioInfo.detalleDotacion}`;
        container.appendChild(infoBox);
    }

    const now = new Date();
    const currentHour = now.getHours();
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterdayShifts = getShiftsForDate(yesterday);
    const todayShifts = getShiftsForDate(now);
    const tomorrowShifts = getShiftsForDate(tomorrow);

    let currentTurnanteId = null;
    let nextTurnanteId = null;

    if (currentHour >= 8 && currentHour < 20) {
        currentTurnanteId = todayShifts.largo.id;
        nextTurnanteId = todayShifts.noche.id;
    } else if (currentHour < 8) {
        currentTurnanteId = yesterdayShifts.noche.id;
        nextTurnanteId = todayShifts.largo.id;
    } else {
        currentTurnanteId = todayShifts.noche.id;
        nextTurnanteId = tomorrowShifts.largo.id;
    }

    gruposServicio.forEach(worker => {
        if (worker.isJefe) return;

        let todayRole = "<i class='fas fa-circle' style='font-size: 0.5rem; opacity: 0.7;'></i> Libre";
        let roleStyle = "background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1;";

        if (worker.id === currentTurnanteId) {
            todayRole = "<i class='fas fa-broadcast-tower'></i> En Turno";
            roleStyle = "background: #16a34a; color: white; border-color: #15803d;";
        } else if (worker.id === nextTurnanteId) {
            todayRole = "<i class='fas fa-clock'></i> Próximo";
            roleStyle = "background: #f59e0b; color: white; border-color: #d97706;";
        }

        const card = document.createElement('div');
        const isActive = selectedWorkerFilter === worker.id;
        card.className = `turnante-item ${isActive ? 'active' : ''}`;
        let estilosCard = "background: var(--card-bg, #fff); border: 1px solid var(--border-color, #cbd5e1); border-radius: 8px; padding: 10px; margin-bottom: 6px; cursor: pointer; transition: all 0.2s ease;";
        if (isActive) {
            estilosCard += " border: 2px solid var(--primary-color, #0284c7); background: #f0f9ff; box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);";
        }
        card.style.cssText = estilosCard;
        
        card.onclick = () => {
            selectedWorkerFilter = selectedWorkerFilter === worker.id ? "" : worker.id;
            renderTurnantesCards();
            renderCalendar();
        };

        // Estructura vertical: Nombre arriba, etiqueta de estado abajo y los detalles al pie
        card.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px;">
                <span style="font-weight: 700; color: var(--primary-color, #0f172a); font-size: 0.85rem;">${worker.name}</span>
                <div>
                    <span style="font-size: 0.68rem; padding: 2px 8px; border-radius: 4px; font-weight: 600; display: inline-block; ${roleStyle}">${todayRole}</span>
                </div>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted, #475569); line-height: 1.3; border-top: 1px dashed var(--border-color, #cbd5e1); padding-top: 4px;">
                ${worker.detalle}
            </div>
        `;
        container.appendChild(card);
    });
}

/* ==========================================================================
   3. RENDERIZADO DEL CALENDARIO
   ========================================================================== */
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const titleElem = document.getElementById('calendarTitle');
    if (titleElem) {
        const nombreServicio = SERVICIOS_CONFIG[servicioActual].nombre;
        titleElem.innerText = `${MONTH_NAMES[month]} ${year} — ${nombreServicio}`;
    }
    
    const calendarBody = document.getElementById('calendarBody');
    if (!calendarBody) return;
    calendarBody.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    let dayCounter = 1;
    let nextMonthDay = 1;

    for (let row = 0; row < 6; row++) {
        const tr = document.createElement('tr');
        let hasCurrentMonthDays = false;

        for (let col = 0; col < 7; col++) {
            const td = document.createElement('td');
            let cellDate;
            const isSunday = (col === 6);

            if (row === 0 && col < startDayOfWeek) {
                const dayNum = prevMonthDays - startDayOfWeek + col + 1;
                cellDate = new Date(year, month - 1, dayNum);
                td.classList.add('other-month');
            } else if (dayCounter > totalDaysInMonth) {
                cellDate = new Date(year, month + 1, nextMonthDay);
                td.classList.add('other-month');
                nextMonthDay++;
            } else {
                hasCurrentMonthDays = true;
                cellDate = new Date(year, month, dayCounter);
                dayCounter++;
            }

            if (isSunday) td.classList.add('sunday-cell');
            
            const now = new Date();
            if (cellDate.getFullYear() === now.getFullYear() && cellDate.getMonth() === now.getMonth() && cellDate.getDate() === now.getDate()) {
                td.classList.add('today-cell');
            }

            const holidayName = getChileanHoliday(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
            let holidayHtml = holidayName ? `<span class="feriado-badge" title="${holidayName}">${holidayName}</span>` : '';
            if(holidayName) td.classList.add('feriado-cell');

            td.innerHTML = `<div class="day-header"><span class="day-num">${cellDate.getDate()}</span>${holidayHtml}</div>`;

            const shiftsToday = getShiftsForDate(cellDate);
            const turnoLargo = shiftsToday.largo;  
            const turnoNoche = shiftsToday.noche;  

            const isAnyFilterActive = Boolean(selectedWorkerFilter);

            // --- FILA 1: TURNO LARGO (Día) ---
            const isLargoSelected = selectedWorkerFilter && turnoLargo.id === selectedWorkerFilter;
            const largoRow = document.createElement('div');
            largoRow.className = `shift-row largo ${isLargoSelected ? 'highlighted' : ''}`;
            if (isAnyFilterActive && !isLargoSelected) largoRow.style.opacity = '0.25';

            largoRow.innerHTML = `
                <div class="shift-info-main">
                    <span>☀️ ${turnoLargo.name}</span>
                </div>
                <span class="shift-time-hint">08 - 20</span>
            `;

            // --- FILA 2: TURNO NOCHE ---
            const isNocheSelected = selectedWorkerFilter && turnoNoche.id === selectedWorkerFilter;
            const nocheRow = document.createElement('div');
            nocheRow.className = `shift-row noche ${isNocheSelected ? 'highlighted' : ''}`;
            if (isAnyFilterActive && !isNocheSelected) nocheRow.style.opacity = '0.25';

            nocheRow.innerHTML = `
                <div class="shift-info-main">
                    <span>🌙 ${turnoNoche.name}</span>
                </div>
                <span class="shift-time-hint">20 ➔ 08</span>
            `;

            td.appendChild(largoRow);
            td.appendChild(nocheRow);

            tr.appendChild(td);
        }
        if (hasCurrentMonthDays || row < 5) calendarBody.appendChild(tr);
    }
}

/* ==========================================================================
   4. CONTROLES Y UTILIDADES
   ========================================================================== */
function initTheme() {
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function initControls() {
    const selectMonth = document.getElementById('selectMonth');
    const selectYear = document.getElementById('selectYear');

    if (selectMonth && selectYear) {
        selectMonth.innerHTML = '';
        MONTH_NAMES.forEach((m, idx) => selectMonth.appendChild(new Option(m, idx)));

        selectYear.innerHTML = '';
        for (let y = 2024; y <= 2030; y++) selectYear.appendChild(new Option(y, y));

        selectMonth.value = currentDate.getMonth();
        selectYear.value = currentDate.getFullYear();

        selectMonth.addEventListener('change', (e) => { 
            currentDate.setMonth(parseInt(e.target.value, 10)); 
            renderCalendar(); 
            renderTurnantesCards();
        });
        selectYear.addEventListener('change', (e) => { 
            currentDate.setFullYear(parseInt(e.target.value, 10)); 
            renderCalendar(); 
            renderTurnantesCards();
        });
    }

    document.getElementById('btnPrev')?.addEventListener('click', () => { 
        currentDate.setMonth(currentDate.getMonth() - 1); 
        renderCalendar(); 
        renderTurnantesCards();
    });
    document.getElementById('btnNext')?.addEventListener('click', () => { 
        currentDate.setMonth(currentDate.getMonth() + 1); 
        renderCalendar(); 
        renderTurnantesCards();
    });
    document.getElementById('btnToday')?.addEventListener('click', () => { 
        currentDate = new Date(); 
        renderCalendar(); 
        renderTurnantesCards();
    });
}

function initBitacora() { /* Módulo de bitácora conservado */ }
function initModal() { /* Módulo de estadísticas conservado */ }
async function fetchBitacoraRemota() { /* Sincronización remota conservada */ }