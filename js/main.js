// ==========================================
// INICIALIZACIÓN Y CONTROL DE MODALES
// ==========================================

const URL_API_SHEETS = "https://script.google.com/macros/s/AKfycby_MZCFYKhRSaKl0hoFQWW5G6nZQNX8nC8CXljeGdrgeLt_Hb43SHMIFjJ4e3AbJkQPAA/exec";

let listaFuncionarios = [];

document.addEventListener('DOMContentLoaded', () => {
    const datosGuardados = localStorage.getItem('hfc_lan_contacts_data');
    if (datosGuardados) {
        try {
            listaFuncionarios = JSON.parse(datosGuardados);
            if (typeof renderizarTablaFuncionarios === 'function') renderizarTablaFuncionarios();
            if (typeof initCumpleanosWidget === 'function') initCumpleanosWidget();
            if (typeof renderSidebarAniversariosTop === 'function') renderSidebarAniversariosTop();
        } catch (e) {
            console.error("Error al leer caché local", e);
        }
    }

    if (typeof cargarFuncionariosCloudSilencioso === 'function') cargarFuncionariosCloudSilencioso();
    if (typeof verificarSesionAdmin === 'function') verificarSesionAdmin();
});

window.addEventListener('load', () => {
    const preloader = document.getElementById('pagePreloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('fade-out');
        }, 400);
    }
});

function openOrgModal() { toggleModal('orgModal', true); }
function openMisionModal() { toggleModal('misionModal', true); }
function openPoblacionModal() { toggleModal('poblacionModal', true); }
function openAcreditacionModal() { toggleModal('acreditacionModal', true); }
function openEquipoModal() { toggleModal('equipoModal', true); poblarModalEquipo();}
function openDependenciasModal() { toggleModal('dependenciasModal', true); }
function openGremiosModal() { toggleModal('gremiosModal', true); }
function openNoticiaModal() { toggleModal('noticiaModal', true); }
function toggleMuralAvisos() { const m = document.getElementById('muralAvisosModal'); if (m) m.classList.toggle('hidden'); }

function closeModal(modalId) {
    toggleModal(modalId, false);
}

function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (modal) {
        if (show) modal.classList.remove('hidden');
        else modal.classList.add('hidden');
    }
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.add('hidden');
        if (typeof cerrarModalesNormativa === 'function') {
            cerrarModalesNormativa();
        }
    }
});

// ==========================================
// AUTENTICACIÓN Y MENÚ DE ADMINISTRADOR
// ==========================================

function verificarSesionAdmin() {
    const sesionGuardada = localStorage.getItem('usuarioActivo');
    if (sesionGuardada) {
        try {
            const usuario = JSON.parse(sesionGuardada);
            if (typeof aplicarSesionActiva === 'function') {
                aplicarSesionActiva(usuario);
            }

            const esAdmin = typeof usuarioTienePermiso === 'function' 
                ? usuarioTienePermiso(usuario, 'editar_directorio')
                : (usuario.rol === 'admin');

            if (esAdmin) {
                const adminBar = document.getElementById('adminBar');
                if (adminBar) adminBar.classList.remove('hidden');

                inyectarOpcionesAdminDropdownDirecto(usuario);
            }
        } catch (e) {
            console.error("Error al leer sesión", e);
        }
    }
}

function inyectarOpcionesAdminDropdownDirecto(usuario) {
    const contenedorAuth = document.getElementById('authDropdownContainer');
    if (!contenedorAuth) return;

    const dropdownMenu = contenedorAuth.querySelector('.dropdown-content') || 
                         contenedorAuth.querySelector('div:not(button)');

    if (dropdownMenu) {
        if (dropdownMenu.querySelector('.admin-options-header')) return;

        const separador = document.createElement('div');
        separador.style.cssText = "height: 1px; background: #e2e8f0; margin: 6px 0;";

        const headerAdmin = document.createElement('div');
        headerAdmin.className = 'admin-options-header';
        headerAdmin.style.cssText = "padding: 4px 12px; font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;";
        headerAdmin.innerText = "Panel Administrador";

// 1. Administrar Personal (Enlace directo a la subcarpeta)
        const opPersonal = document.createElement('a');
        opPersonal.href = "admin-funcionarios/index.html";
        opPersonal.innerHTML = `<i class="fas fa-user-shield" style="width: 18px; color: #0284c7;"></i> Administrar Personal`;
        opPersonal.style.cssText = "display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 0.82rem; color: #1e293b; text-decoration: none;";

        const opNoticia = document.createElement('a');
        opNoticia.href = "#";
        opNoticia.innerHTML = `<i class="fas fa-newspaper" style="width: 18px; color: #10b981;"></i> Publicar Noticia`;
        opNoticia.style.cssText = "display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 0.82rem; color: #1e293b; text-decoration: none;";
        opNoticia.onclick = (e) => {
            e.preventDefault();
            if (typeof openNoticiaModal === 'function') openNoticiaModal();
        };

        const opAviso = document.createElement('a');
        opAviso.href = "#";
        opAviso.innerHTML = `<i class="fas fa-bullhorn" style="width: 18px; color: #f59e0b;"></i> Publicar Aviso`;
        opAviso.style.cssText = "display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 0.82rem; color: #1e293b; text-decoration: none;";
        opAviso.onclick = (e) => {
            e.preventDefault();
            if (typeof toggleMuralAvisos === 'function') toggleMuralAvisos();
        };

        const botonCerrarSesion = Array.from(dropdownMenu.querySelectorAll('a')).find(el => el.textContent.includes('Cerrar Sesión'));
        
        if (botonCerrarSesion) {
            dropdownMenu.insertBefore(headerAdmin, botonCerrarSesion);
            dropdownMenu.insertBefore(opPersonal, botonCerrarSesion);
            dropdownMenu.insertBefore(opNoticia, botonCerrarSesion);
            dropdownMenu.insertBefore(opAviso, botonCerrarSesion);
            dropdownMenu.insertBefore(separador, botonCerrarSesion);
        } else {
            dropdownMenu.appendChild(separador);
            dropdownMenu.appendChild(headerAdmin);
            dropdownMenu.appendChild(opPersonal);
            dropdownMenu.appendChild(opNoticia);
            dropdownMenu.appendChild(opAviso);
        }
    }
}

// ==========================================
// MÓDULO DE AÑOS DE SERVICIO Y TRAYECTORIA (ACTUALIZADO)
// ==========================================

function obtenerAniversariosDelMes(mesNum) {
    const anioActual = new Date().getFullYear(); // 2026
    const lista = [];
    if (!Array.isArray(listaFuncionarios)) return lista;

    listaFuncionarios.forEach(datos => {
        // Busca de forma flexible cualquier variante posible del campo de fecha de ingreso
        const campoFecha = datos.fecha_ingreso || datos.fechaIngreso || datos.ingreso || 
                           datos.fecha_contrato || datos["fecha_ingreso"] || 
                           datos["Fecha Ingreso"] || datos["fecha ingreso"];
        
        if (!campoFecha) return;

        let anioIng = null;
        let mesIng = null;
        let diaIng = null;
        const fechaStr = String(campoFecha).trim();

        // Soporte para formatos DD/MM/YYYY, DD-MM-YYYY o YYYY-MM-DD
        if (fechaStr.includes('-') || fechaStr.includes('/')) {
            const separador = fechaStr.includes('-') ? '-' : '/';
            const partes = fechaStr.split(separador);
            if (partes.length >= 3) {
                if (partes[0].length === 4) {
                    anioIng = parseInt(partes[0], 10);
                    mesIng = parseInt(partes[1], 10);
                    diaIng = parseInt(partes[2], 10);
                } else {
                    diaIng = parseInt(partes[0], 10);
                    mesIng = parseInt(partes[1], 10);
                    anioIng = parseInt(partes[2], 10);
                }
            }
        }

        if (mesIng === Number(mesNum) && !isNaN(anioIng)) {
            const anosServicio = anioActual - anioIng;
            if (anosServicio >= 0) {
                const nombreCompleto = `${datos.nombre || ''} ${datos.apellido_paterno || ''} ${datos.apellido_materno || ''}`.trim();
                lista.push({
                    nombre: nombreCompleto || datos.name || 'Funcionario',
                    cargo: datos.cargo || datos.position || 'Funcionario Hospital Lanco',
                    genero: datos.genero || datos.sexo || '',
                    dia: diaIng || 1,
                    anos: anosServicio
                });
            }
        }
    });

    // Ordenar de mayor a menor cantidad de años de servicio
    lista.sort((a, b) => b.anos - a.anos);
    return lista;
}

function renderSidebarAniversariosTop() {
    const container = document.getElementById('sidebarAniversariosTop');
    if (!container) return;

    const mesActual = new Date().getMonth() + 1;
    const aniversarios = obtenerAniversariosDelMes(mesActual);

    if (aniversarios.length === 0) {
        container.innerHTML = `<p style="font-size: 0.78rem; color: #64748b; text-align: center; padding: 10px 0;">No hay aniversarios este mes.</p>`;
        return;
    }

    const topAniversarios = aniversarios.slice(0, 3);
    let html = '';

    topAniversarios.forEach(p => {
        // Limpia el cargo y lo adapta según el género si corresponde
        const cargoLimpio = typeof obtenerNombreCargoSegunGenero === 'function'
            ? obtenerNombreCargoSegunGenero(p.cargo, p.genero)
            : p.cargo;

        html += `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                <div style="overflow: hidden; padding-right: 8px;">
                    <strong style="display: block; font-size: 0.78rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.nombre}</strong>
                    <span style="display: block; font-size: 0.65rem; color: #64748b;">${cargoLimpio}</span>
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                    <span style="background: #dcfce7; color: #166534; font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-block;">${p.anos} años</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderListaAniversariosModal() {
    const selectMes = document.getElementById('mesAniversarioSelect');
    const container = document.getElementById('listaAniversariosModal');
    if (!selectMes || !container) return;

    const mesSeleccionado = parseInt(selectMes.value, 10);
    const aniversarios = obtenerAniversariosDelMes(mesSeleccionado);

    if (aniversarios.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 25px 0;">No hay registros de años de servicio para este mes.</p>`;
        return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 8px;">`;

    aniversarios.forEach(p => {
        const diaStr = String(p.dia || 1).padStart(2, '0');
        const cargoLimpio = typeof obtenerNombreCargoSegunGenero === 'function'
            ? obtenerNombreCargoSegunGenero(p.cargo, p.genero)
            : p.cargo;

        html += `
            <div style="background: var(--bg-app); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                    <div style="background: #dcfce7; color: #166534; width: 38px; height: 38px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0;">
                        ${diaStr}
                    </div>
                    <div style="overflow: hidden;">
                        <strong style="display: block; font-size: 0.85rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.nombre}</strong>
                        <span style="display: block; font-size: 0.72rem; color: var(--text-muted);">${cargoLimpio}</span>
                    </div>
                </div>
                <div style="text-align: right; flex-shrink: 0; margin-left: 10px;">
                    <span style="background: #16a34a; color: #ffffff; font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; display: inline-block;">${p.anos} años</span>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function abrirModalAniversarios() {
    const modal = document.getElementById('aniversariosModal');
    const selectMes = document.getElementById('mesAniversarioSelect');
    if (modal && selectMes) {
        selectMes.value = new Date().getMonth() + 1;
        renderListaAniversariosModal();
        modal.classList.remove('hidden');
    }
}

function cerrarModalAniversarios() {
    const modal = document.getElementById('aniversariosModal');
    if (modal) modal.classList.add('hidden');
}

function renderListaAniversariosModal() {
    const selectMes = document.getElementById('mesAniversarioSelect');
    const container = document.getElementById('listaAniversariosModal');
    if (!selectMes || !container) return;

    const mesSeleccionado = parseInt(selectMes.value, 10);
    const aniversarios = obtenerAniversariosDelMes(mesSeleccionado);

    if (aniversarios.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 25px 0;">No hay registros de años de servicio para este mes.</p>`;
        return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 8px;">`;

    aniversarios.forEach(p => {
        const diaStr = String(p.dia || 1).padStart(2, '0');
        html += `
            <div style="background: var(--bg-app); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                    <div style="background: #dcfce7; color: #166534; width: 38px; height: 38px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0;">
                        ${diaStr}
                    </div>
                    <div style="overflow: hidden;">
                        <strong style="display: block; font-size: 0.85rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.nombre}</strong>
                        <span style="display: block; font-size: 0.72rem; color: var(--text-muted);">${p.cargo}</span>
                    </div>
                </div>
                <div style="text-align: right; flex-shrink: 0; margin-left: 10px;">
                    <span style="background: #16a34a; color: #ffffff; font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; display: inline-block;">${p.anos} años</span>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// ==========================================
// MÓDULO DE CUMPLEAÑOS
// ==========================================

function obtenerCumpleanosDelMes(mesNum) {
    const lista = [];
    if (!Array.isArray(listaFuncionarios)) return lista;

    listaFuncionarios.forEach(datos => {
        const campoFecha = datos.fecha_nacimiento || datos.cumpleanos || datos["fecha nacimiento"];
        
        if (campoFecha) {
            let diaNac, mesNac;
            const fechaStr = String(campoFecha).trim();

            if (fechaStr.includes('/')) {
                const partes = fechaStr.split('/');
                if (partes.length >= 2) {
                    diaNac = parseInt(partes[0], 10);
                    mesNac = parseInt(partes[1], 10);
                }
            } else if (fechaStr.includes('-')) {
                const partes = fechaStr.split('-');
                if (partes.length >= 2) {
                    if (partes[0].length <= 2 && partes[2] && partes[2].length === 4) {
                        diaNac = parseInt(partes[0], 10);
                        mesNac = parseInt(partes[1], 10);
                    } else if (partes[0].length === 4) {
                        diaNac = parseInt(partes[2], 10);
                        mesNac = parseInt(partes[1], 10);
                    }
                }
            }

            if (mesNac === Number(mesNum) && !isNaN(diaNac)) {
                const nombreCompleto = `${datos.nombre || ''} ${datos.apellido_paterno || ''} ${datos.apellido_materno || ''}`.trim();
                lista.push({
                    nombre: nombreCompleto || 'Funcionario',
                    cargo: datos.cargo || 'Funcionario Hospital Lanco',
                    dia: diaNac,
                    mes: mesNac
                });
            }
        }
    });

    lista.sort((a, b) => a.dia - b.dia);
    return lista;
}

function initCumpleanosWidget() {
    let targetP = null;
    const cards = document.querySelectorAll('.right-sidebar-panel div, aside div, .sidebar div, section div');
    
    for (let card of cards) {
        const h3 = card.querySelector('h3');
        if (h3 && h3.textContent.includes('Cumpleaños')) {
            targetP = card.querySelector('p') || card.querySelector('div:not(:has(h3))');
            break;
        }
    }

    if (!targetP) return;

    const hoy = new Date();
    const diaActual = hoy.getDate();
    const mesActual = hoy.getMonth() + 1;

    const cumpleanerosMes = obtenerCumpleanosDelMes(mesActual);
    const cumpleanerosHoy = cumpleanerosMes.filter(p => p.dia === diaActual);

    const NOMBRES_MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const nombreMesActual = NOMBRES_MESES[mesActual - 1];

    if (cumpleanerosHoy.length > 0) {
        const infoHoy = cumpleanerosHoy.map(p => `🎂 <strong>${p.nombre}</strong> (${p.cargo})`).join(', ');
        targetP.innerHTML = `¡Hoy está de cumpleaños: ${infoHoy}! Muchas felicidades en su día.`;
    } else if (cumpleanerosMes.length > 0) {
        targetP.innerHTML = `¡Saludamos con mucho cariño a los cumpleañeros de <strong>${nombreMesActual}</strong>! Revisa la lista detallada haciendo clic abajo.`;
    } else {
        targetP.innerHTML = `No hay registros de cumpleaños para este mes (${nombreMesActual}).`;
    }
}

function initCumpleanosModal() {
    const selectMes = document.getElementById('mesCumpleanosSelect');
    if (!selectMes) return;

    const NOMBRES_MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    selectMes.innerHTML = '';
    NOMBRES_MESES.forEach((m, idx) => {
        const option = document.createElement('option');
        const numeroMes = idx + 1;
        option.value = String(numeroMes);
        option.textContent = m;
        selectMes.appendChild(option);
    });

    const mesActualReal = new Date().getMonth() + 1;
    selectMes.value = String(mesActualReal);
    
    selectMes.removeEventListener('change', renderListaCumpleanosModal);
    selectMes.addEventListener('change', renderListaCumpleanosModal);

    renderListaCumpleanosModal();
}

function openCumpleModal() {
    const modal = document.getElementById('cumpleModal') || 
                  document.getElementById('cumpleanosModal') || 
                  document.getElementById('modalCumpleanos');
            
    const selectMes = document.getElementById('mesCumpleanosSelect');

    if (modal) {
        if (selectMes) {
            const mesActualStr = String(new Date().getMonth() + 1);
            selectMes.value = mesActualStr;
            renderListaCumpleanosModal();
        }
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; 
    } else {
        alert("Error: No se encontró el contenedor HTML del modal de cumpleaños.");
    }
}

function cerrarModalCumpleanos() {
    const modal = document.getElementById('cumpleModal') || 
                  document.getElementById('cumpleanosModal') || 
                  document.getElementById('modalCumpleanos');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

function renderListaCumpleanosModal() {
    const selectMes = document.getElementById('mesCumpleanosSelect');
    const targetContainer = document.getElementById('cumpleModalListaContainer') || document.getElementById('listaCumpleanosModal');
    if (!targetContainer) return;

    const mesSeleccionado = selectMes ? parseInt(selectMes.value, 10) : (new Date().getMonth() + 1);
    const cumpleaneros = obtenerCumpleanosDelMes(mesSeleccionado);

    const agrupadosPorDia = {};
    cumpleaneros.forEach(p => {
        if (!agrupadosPorDia[p.dia]) {
            agrupadosPorDia[p.dia] = [];
        }
        agrupadosPorDia[p.dia].push(p);
    });

    const diasOrdenados = Object.keys(agrupadosPorDia).map(Number).sort((a, b) => a - b);

    if (diasOrdenados.length === 0) {
        targetContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 25px 0;">No hay registros de cumpleaños para este mes.</p>`;
        return;
    }

    let html = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px;">`;

    diasOrdenados.forEach(dia => {
        const personas = agrupadosPorDia[dia];
        const diaStr = String(dia).padStart(2, '0');
        const hoy = new Date();
        const esHoy = (hoy.getDate() === dia && (hoy.getMonth() + 1) === mesSeleccionado);

        const bgCard = esHoy ? 'background: #eff6ff; border-color: #3b82f6;' : 'background: #ffffff; border-color: #e2e8f0;';
        const bgIcon = esHoy ? 'background: #3b82f6; color: #ffffff;' : 'background: #f1f5f9; color: #475569;';

        let personasHtml = '';
        personas.forEach((p, idx) => {
            const borderStyle = idx > 0 ? 'border-top: 1px solid #f1f5f9; margin-top: 4px; padding-top: 4px;' : '';
            personasHtml += `
                <div style="${borderStyle}">
                    <strong style="display: block; font-size: 0.82rem; color: var(--text-primary); line-height: 1.2;">${p.nombre}</strong>
                    <span style="display: block; font-size: 0.68rem; color: var(--text-muted); margin-top: 1px;">${p.cargo}</span>
                </div>
            `;
        });

        html += `
            <div style="${bgCard} border: 1px solid; border-radius: 8px; padding: 10px; display: flex; align-items: flex-start; gap: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="${bgIcon} width: 42px; height: 42px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;">
                    <span style="font-size: 1.1rem; font-weight: 800; line-height: 1.1;">${diaStr}</span>
                </div>
                <div style="flex: 1; overflow: hidden;">
                    ${personasHtml}
                </div>
                ${esHoy ? '<div style="font-size: 1.1rem; flex-shrink: 0;" title="¡Feliz Cumpleaños Hoy!">🎉</div>' : ''}
            </div>`;
    });

    html += `</div>`;
    targetContainer.innerHTML = html;
}

// ==========================================
// UTILIDADES: CLIMA, REDES Y NORMATIVA
// ==========================================

function abrirModalNormativa(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function cerrarModalesNormativa() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.add('hidden');
    });
}

async function obtenerClimaLanco() {
    const lat = -39.45;
    const lon = -72.43;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos && datos.current) {
            const tempActual = Math.round(datos.current.temperature_2m);
            const wmoCode = datos.current.weather_code;
            const tempMax = Math.round(datos.daily.temperature_2m_max[0]);
            const tempMin = Math.round(datos.daily.temperature_2m_min[0]);

            const infoClima = interpretarCodigoClima(wmoCode);

            const elemTemp = document.getElementById('climaTemp');
            const elemEstado = document.getElementById('climaEstado');
            const elemMaxMin = document.getElementById('climaMaxMin');
            const elemIcono = document.getElementById('climaIcono');

            if (elemTemp) elemTemp.innerText = `${tempActual}°C`;
            if (elemEstado) elemEstado.innerText = `Lanco • ${infoClima.texto}`;
            if (elemMaxMin) elemMaxMin.innerText = `Máx: ${tempMax}° / Mín: ${tempMin}°`;
            if (elemIcono) {
                elemIcono.className = `fas ${infoClima.icono}`;
                elemIcono.style.color = infoClima.color;
            }
        }
    } catch (error) {
        console.error("Error al obtener el clima:", error);
        const elemEstado = document.getElementById('climaEstado');
        if (elemEstado) elemEstado.innerText = "Lanco • Clima no disponible";
    }
}

function interpretarCodigoClima(code) {
    if (code === 0) return { texto: "Despejado", icono: "fa-sun", color: "#f59e0b" };
    if ([1, 2].includes(code)) return { texto: "Parcialmente Nublado", icono: "fa-cloud-sun", color: "#38bdf8" };
    if (code === 3) return { texto: "Nublado", icono: "fa-cloud", color: "#94a3b8" };
    if ([51, 53, 55, 56, 57].includes(code)) return { texto: "Llovizna", icono: "fa-cloud-rain", color: "#38bdf8" };
    if ([61, 63, 65, 66, 67].includes(code)) return { texto: "Lluvia", icono: "fa-cloud-showers-heavy", color: "#38bdf8" };
    if ([71, 73, 75, 77].includes(code)) return { texto: "Nieve", icono: "fa-snowflake", color: "#ffffff" };
    if ([95, 96, 99].includes(code)) return { texto: "Tormenta", icono: "fa-bolt", color: "#facc15" };
    
    return { texto: "Variable", icono: "fa-cloud-sun", color: "#38bdf8" };
}

document.addEventListener('DOMContentLoaded', () => {
    obtenerClimaLanco();
    setInterval(obtenerClimaLanco, 30 * 60 * 1000); 
});

async function verificarConectividadRedMinsal() {
    const iconElem = document.getElementById('redIcono');
    const textElem = document.getElementById('redEstadoTexto');

    let redLocalOk = false;
    let internetOk = false;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const resLocal = await fetch('/assets/img/logo_hfcl.png?t=' + Date.now(), { 
            method: 'HEAD', 
            cache: 'no-store',
            signal: controller.signal 
        });
        clearTimeout(timeoutId);

        if (resLocal.ok || resLocal.status === 0) redLocalOk = true;
    } catch (e) {
        if (navigator.onLine) redLocalOk = true;
    }

    if (redLocalOk) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            await fetch('https://www.google.com/favicon.ico?t=' + Date.now(), { 
                mode: 'no-cors', 
                cache: 'no-store',
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            internetOk = true;
        } catch (e) {
            internetOk = false;
        }
    }

    if (iconElem && textElem) {
        if (redLocalOk && internetOk) {
            iconElem.className = "fas fa-network-wired";
            iconElem.style.color = "#4ade80";
            textElem.innerHTML = `<span style="display:inline-block; width:6px; height:6px; background:#4ade80; border-radius:50%; margin-right:4px;"></span> Red y DNS Operativos`;
            textElem.style.color = "#4ade80";
        } else if (redLocalOk && !internetOk) {
            iconElem.className = "fas fa-wifi";
            iconElem.style.color = "#f59e0b";
            textElem.innerHTML = `<span style="display:inline-block; width:6px; height:6px; background:#f59e0b; border-radius:50%; margin-right:4px;"></span> Intranet OK / Sin Salida Externa`;
            textElem.style.color = "#fde68a";
        } else {
            iconElem.className = "fas fa-exclamation-triangle";
            iconElem.style.color = "#ef4444";
            textElem.innerHTML = `<span style="display:inline-block; width:6px; height:6px; background:#ef4444; border-radius:50%; margin-right:4px;"></span> Sin Conexión / Corte de Enlace`;
            textElem.style.color = "#fca5a5";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    verificarConectividadRedMinsal();
    setInterval(verificarConectividadRedMinsal, 20000);
});


// ==========================================
// MÓDULO ORGANIGRAMA Y EQUIPO INSTITUCIONAL (DINÁMICO E INTERACTIVO)
// ==========================================

function openEquipoModal() {
    const modal = document.getElementById('equipoModal');
    if (modal) {
        modal.classList.remove('hidden');
        renderizarOrganigramaDinamico();
    }
}

function poblarModalEquipo() {
    renderizarOrganigramaDinamico();
}

function renderizarOrganigramaDinamico() {
    const container = document.getElementById('arbolEquipoContainer');
    if (!container) return;

    const estructuraHospital = {
        "Procesos Asistenciales": {
            icon: "fa-stethoscope",
            color: "#0284c7",
            unidades: [
                { nombre: "Atención Primaria", icono: "fa-user-nurse" },
                { nombre: "Urgencia Indiferenciada", icono: "fa-ambulance" },
                { nombre: "Hospitalización Indiferenciada", icono: "fa-procedures" },
                { nombre: "Odontológica", icono: "fa-tooth" }
            ]
        },
        "Gestión de la Demanda": {
            icon: "fa-calendar-check",
            color: "#16a34a",
            unidades: [
                { nombre: "SOME", icono: "fa-id-card" },
                { nombre: "Servicio Social", icono: "fa-hands-helping" },
                { nombre: "GES y Gestión Lista de Espera", icono: "fa-clipboard-list" }
            ]
        },
        "Apoyo Clínico y Terapéutico": {
            icon: "fa-flask",
            color: "#a21caf",
            unidades: [
                { nombre: "Laboratorio Clínico", icono: "fa-microscope" },
                { nombre: "Imagenología", icono: "fa-x-ray" },
                { nombre: "Farmacia", icono: "fa-pills" },
                { nombre: "Esterilización", icono: "fa-pump-medical" },
                { nombre: "Nutrición Clínica", icono: "fa-utensils" },
                { nombre: "Kinesiología y Rehabilitación", icono: "fa-running" },
                { nombre: "Vacunatorio", icono: "fa-syringe" }
            ]
        },
        "Apoyo Logístico Administrativo": {
            icon: "fa-boxes",
            color: "#c2410c",
            unidades: [
                { nombre: "Gestión Financiera", icono: "fa-wallet" },
                { nombre: "Gestión de las Personas", icono: "fa-users" },
                { nombre: "Abastecimiento", icono: "fa-shopping-cart" }
            ]
        },
        "Recursos Físicos y Operaciones": {
            icon: "fa-server",
            color: "#334155",
            unidades: [
                { nombre: "TIC y Mantención", icono: "fa-laptop-code" },
                { nombre: "Movilización", icono: "fa-car" },
                { nombre: "Lavandería", icono: "fa-tshirt" },
                { nombre: "Aseo y Servicios Generales", icono: "fa-broom" },
                { nombre: "Prevención de Riesgo y Gestión Ambiental", icono: "fa-hard-hat" }
            ]
        }
    };

    const datosGlobales = {
        "Dirección del Hospital": { titularDepto: [], subroDepto: [] }
    };

    Object.keys(estructuraHospital).forEach(dep => {
        datosGlobales[dep] = { titularDepto: [], subroDepto: [], unidadesMap: {} };
        estructuraHospital[dep].unidades.forEach(uni => {
            datosGlobales[dep].unidadesMap[uni.nombre] = { titulares: [], subrogantes: [] };
        });
    });

    if (Array.isArray(listaFuncionarios) && listaFuncionarios.length > 0) {
        listaFuncionarios.forEach(f => {
            const nombreCompleto = `${f.nombre || ''} ${f.apellido_paterno || ''} ${f.apellido_materno || ''}`.trim();
            if (!nombreCompleto) return;

            const esDepto = f.jefe_depto === "Sí" || f.jefe_depto === true;
            const esUnidad = f.jefe_unidad === "Sí" || f.jefe_unidad === true;
            const esSubro = f.subrogante === "Sí" || f.subrogante === true;

            const itemsAsignados = (f.jefatura_cargo || "").split(';').map(s => s.trim()).filter(Boolean);

            itemsAsignados.forEach(item => {
                if (datosGlobales[item]) {
                    if (esSubro) {
                        datosGlobales[item].subroDepto.push(nombreCompleto);
                    } else if (esDepto || item === "Dirección del Hospital") {
                        datosGlobales[item].titularDepto.push(nombreCompleto);
                    }
                }

                Object.keys(estructuraHospital).forEach(depKey => {
                    const uniEncontrada = estructuraHospital[depKey].unidades.find(u => u.nombre === item);
                    if (uniEncontrada) {
                        if (esSubro) {
                            datosGlobales[depKey].unidadesMap[item].subrogantes.push(nombreCompleto);
                        } else if (esUnidad) {
                            datosGlobales[depKey].unidadesMap[item].titulares.push(nombreCompleto);
                        }
                    }
                });
            });
        });
    }

    const titularesDir = datosGlobales["Dirección del Hospital"].titularDepto.join(', ') || 'Sin titular asignado';
    const subrosDir = datosGlobales["Dirección del Hospital"].subroDepto.join(', ');

    let html = `
        <!-- NIVEL 1: DIRECCIÓN -->
        <div class="org-node-root">
            <div class="org-box root-box" onclick="mostrarInfoUnidad('Dirección del Hospital')" style="cursor: pointer;" title="Haz clic para ver descripción">
                <div style="font-size: 1rem; margin-bottom: 4px;"><i class="fas fa-building"></i> DIRECCIÓN DEL ESTABLECIMIENTO <i class="fas fa-info-circle" style="font-size: 0.8rem; opacity: 0.7; margin-left: 5px;"></i></div>
                <div class="org-jefe-tag"><i class="fas fa-user-tie"></i> <strong>Titular:</strong> ${titularesDir}</div>
                ${subrosDir ? `<div class="org-jefe-tag" style="background: rgba(255,255,255,0.18); margin-top: 4px;"><i class="fas fa-user-clock"></i> <strong>Subrogante:</strong> ${subrosDir}</div>` : ''}
            </div>
        </div>

        <div class="org-connector"></div>

        <!-- NIVEL 2: RAMAS ASESORAS Y CALIDAD -->
        <div class="org-level-2-branches">
            <div class="org-branch-column">
                <div class="org-box branch-box" onclick="mostrarInfoUnidad('Dirección Técnica & Secretaría')" style="cursor: pointer;" title="Haz clic para ver descripción">
                    <i class="fas fa-file-alt" style="color: #0284c7;"></i> Dirección Técnica & Secretaría <i class="fas fa-info-circle" style="color: #94a3b8; font-size: 0.8rem;"></i>
                </div>
                <div class="org-connector-sm"></div>
                <div class="org-box branch-box highlight-box" onclick="mostrarInfoUnidad('Consejo Técnico Asesor / Equipo Gestor')" style="cursor: pointer;" title="Haz clic para ver descripción">
                    <i class="fas fa-users-cog" style="color: #0369a1;"></i> Consejo Técnico Asesor / Equipo Gestor <i class="fas fa-info-circle" style="color: #7dd3fc; font-size: 0.8rem;"></i>
                </div>
            </div>
            <div class="org-branch-column">
                <div class="org-box branch-box" onclick="mostrarInfoUnidad('Unidad de Calidad y Seguridad del Paciente')" style="cursor: pointer;" title="Haz clic para ver descripción">
                    <i class="fas fa-award" style="color: #16a34a;"></i> Unidad de Calidad y Seguridad del Paciente <i class="fas fa-info-circle" style="color: #94a3b8; font-size: 0.8rem;"></i>
                </div>
                <div class="org-connector-sm"></div>
                <div class="org-box branch-box" onclick="mostrarInfoUnidad('OIRS, Comités y CODELO')" style="cursor: pointer;" title="Haz clic para ver descripción">
                    <i class="fas fa-comments" style="color: #a21caf;"></i> OIRS, Comités y CODELO <i class="fas fa-info-circle" style="color: #94a3b8; font-size: 0.8rem;"></i>
                </div>
            </div>
        </div>

        <div class="org-connector"></div>

        <!-- NIVEL 3: 5 DEPARTAMENTOS Y UNIDADES -->
        <div class="org-departments-grid">
    `;

    Object.keys(estructuraHospital).forEach(depKey => {
        const dept = estructuraHospital[depKey];
        const info = datosGlobales[depKey];
        const titularDepto = info.titularDepto.join(', ') || '<span style="color: #94a3b8; font-style: italic;">Sin titular</span>';
        const subroDepto = info.subroDepto.join(', ');

        html += `
            <div class="org-dept-col">
                <div class="org-box dept-box" onclick="mostrarInfoUnidad('${depKey}')" style="background: ${dept.color}; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" title="Haz clic para ver descripción">
                    <div style="display: flex; align-items: center; gap: 6px;"><i class="fas ${dept.icon}"></i> ${depKey}</div>
                    <i class="fas fa-info-circle" style="opacity: 0.6; font-size: 0.8rem;"></i>
                </div>
                <div class="org-dept-jefe" style="display: flex; flex-direction: column; gap: 4px;">
                    <div>
                        <i class="fas fa-user-shield" style="color: #0284c7;"></i> <strong>Jefatura:</strong> ${titularDepto}
                    </div>
                    ${subroDepto ? `
                        <div style="border-top: 1px dotted #cbd5e1; padding-top: 3px; color: #b45309;">
                            <i class="fas fa-user-clock"></i> <strong>Subro:</strong> ${subroDepto}
                        </div>
                    ` : ''}
                </div>
                <div class="org-sub-units">
        `;

        dept.unidades.forEach(uni => {
            const unidadInfo = info.unidadesMap[uni.nombre] || { titulares: [], subrogantes: [] };
            const titularesUni = unidadInfo.titulares;
            const subrogantesUni = unidadInfo.subrogantes;
            const tieneTitular = titularesUni.length > 0;
            const tieneSubro = subrogantesUni.length > 0;

            if (tieneTitular || tieneSubro) {
                html += `
                    <div class="org-box sub-box leader-unit" onclick="mostrarInfoUnidad('${uni.nombre}')" style="cursor: pointer;" title="Haz clic para ver descripción">
                        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                            <div style="display: flex; align-items: center; gap: 6px; font-weight: 600; color: #1e293b;">
                                <i class="fas ${uni.icono}" style="color: #0284c7;"></i> ${uni.nombre}
                            </div>
                            <i class="fas fa-info-circle" style="color: #0284c7; font-size: 0.75rem; opacity: 0.8;"></i>
                        </div>
                        ${tieneTitular ? `
                            <div class="leader-badge">
                                <i class="fas fa-user-check"></i> Encargado(a): <strong>${titularesUni.join(', ')}</strong>
                            </div>
                        ` : ''}
                        ${tieneSubro ? `
                            <div class="leader-badge" style="background: #fef3c7; color: #92400e; margin-top: 3px;">
                                <i class="fas fa-user-clock"></i> Subro: <strong>${subrogantesUni.join(', ')}</strong>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else {
                html += `
                    <div class="org-box sub-box" onclick="mostrarInfoUnidad('${uni.nombre}')" style="cursor: pointer;" title="Haz clic para ver descripción">
                        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                            <div style="display: flex; align-items: center; gap: 6px; color: #64748b;">
                                <i class="fas ${uni.icono}" style="color: #64748b;"></i> ${uni.nombre}
                            </div>
                            <i class="fas fa-info-circle" style="color: #94a3b8; font-size: 0.75rem;"></i>
                        </div>
                    </div>
                `;
            }
        });

        html += `
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// ==========================================
// DICCIONARIO DE DESCRIPCIONES E ICONOS INSTITUCIONALES MINIMALISTAS
// ==========================================
const descripcionesOrganigrama = {
    "Dirección del Hospital": {
        texto: "Máxima autoridad del establecimiento, encargada de la gestión estratégica, representación legal y cumplimiento de las políticas de salud ministeriales.",
        icono: "fa-building"
    },
    "Dirección Técnica & Secretaría": {
        texto: "Asesora en materias clínicas y administrativas, gestionando la correspondencia oficial y coordinación directiva.",
        icono: "fa-file-alt"
    },
    "Consejo Técnico Asesor / Equipo Gestor": {
        texto: "Órgano consultivo que asesora a la Dirección en la planificación, evaluación y toma de decisiones técnico-administrativas.",
        icono: "fa-users-cog"
    },
    "Unidad de Calidad y Seguridad del Paciente": {
        texto: "Vela por el cumplimiento de estándares de acreditación, protocolos de seguridad y prevención de eventos adversos.",
        icono: "fa-award"
    },
    "OIRS, Comités y CODELO": {
        texto: "Gestiona reclamos, sugerencias y fomenta la participación ciudadana mediante el Consejo de Desarrollo Local.",
        icono: "fa-comments"
    },
    "Procesos Asistenciales": {
        texto: "Departamento enfocado en la entrega directa de prestaciones clínicas y de salud a la comunidad usuaria.",
        icono: "fa-stethoscope"
    },
    "Atención Primaria": {
        texto: "Gestiona consultas de morbilidad, controles de salud preventivos y programas de salud familiar.",
        icono: "fa-user-nurse"
    },
    "Urgencia Indiferenciada": {
        texto: "Atención continuada 24/7 para resolver situaciones de emergencia o urgencia médica.",
        icono: "fa-ambulance"
    },
    "Hospitalización Indiferenciada": {
        texto: "Atención clínica cerrada para pacientes que requieren cuidados médicos y de enfermería continuos.",
        icono: "fa-procedures"
    },
    "Odontológica": {
        texto: "Brinda atención dental preventiva, restauradora y de urgencia a los usuarios.",
        icono: "fa-tooth"
    },
    "Gestión de la Demanda": {
        texto: "Departamento responsable de articular el acceso de los pacientes a las distintas prestaciones y flujos asistenciales.",
        icono: "fa-calendar-check"
    },
    "SOME": {
        texto: "Servicio de Orientación Médico Estadística: administra agendas, fichas clínicas y estadísticas hospitalarias.",
        icono: "fa-id-card"
    },
    "Servicio Social": {
        texto: "Entrega apoyo e intervención social a pacientes y familias en situación de vulnerabilidad.",
        icono: "fa-hands-helping"
    },
    "GES y Gestión Lista de Espera": {
        texto: "Controla el cumplimiento de las Garantías Explícitas en Salud y gestiona los tiempos de espera quirúrgicos.",
        icono: "fa-clipboard-list"
    },
    "Apoyo Clínico y Terapéutico": {
        texto: "Conjunto de unidades que respaldan el diagnóstico médico y la recuperación de los pacientes.",
        icono: "fa-flask"
    },
    "Laboratorio Clínico": {
        texto: "Realiza exámenes de sangre y fluidos para el diagnóstico clínico.",
        icono: "fa-microscope"
    },
    "Imagenología": {
        texto: "Efectúa exámenes radiológicos y de diagnóstico por imagen.",
        icono: "fa-x-ray"
    },
    "Farmacia": {
        texto: "Administra, custodia y entrega medicamentos a pacientes ambulatorios y hospitalizados.",
        icono: "fa-pills"
    },
    "Esterilización": {
        texto: "Proceso crítico de sanitización y esterilización de instrumental quirúrgico y clínico.",
        icono: "fa-pump-medical"
    },
    "Nutrición Clínica": {
        texto: "Supervisa la alimentación de pacientes hospitalizados y asesora en dietoterapia.",
        icono: "fa-utensils"
    },
    "Kinesiología y Rehabilitación": {
        texto: "Ejecuta tratamientos de recuperación motora y respiratoria.",
        icono: "fa-running"
    },
    "Vacunatorio": {
        texto: "Administra vacunas según el Programa Nacional de Inmunizaciones (PNI).",
        icono: "fa-syringe"
    },
    "Apoyo Logístico Administrativo": {
        texto: "Unidades de soporte administrativo, financiero y de gestión de recursos humanos.",
        icono: "fa-boxes"
    },
    "Gestión Financiera": {
        texto: "Administra el presupuesto, contabilidad y ejecución financiera del hospital.",
        icono: "fa-wallet"
    },
    "Gestión de las Personas": {
        texto: "Administra el recurso humano, contratos, feriados, permisos y clima laboral.",
        icono: "fa-users"
    },
    "Abastecimiento": {
        texto: "Gestiona compras públicas, adquisiciones, licitaciones y bodegas.",
        icono: "fa-shopping-cart"
    },
    "Recursos Físicos y Operaciones": {
        texto: "Encargado de la infraestructura, equipos, transporte y servicios generales.",
        icono: "fa-server"
    },
    "TIC y Mantención": {
        texto: "Soporte de tecnologías de información, redes, equipos informáticos y mantenimiento edilicio.",
        icono: "fa-laptop-code"
    },
    "Movilización": {
        texto: "Administra el parque automotriz y traslado en ambulancias y vehículos oficiales.",
        icono: "fa-car"
    },
    "Lavandería": {
        texto: "Procesa el lavado y distribución de ropa hospitalaria y de cama.",
        icono: "fa-tshirt"
    },
    "Aseo y Servicios Generales": {
        texto: "Mantiene la limpieza, sanitización y cuidado de las instalaciones.",
        icono: "fa-broom"
    },
    "Prevención de Riesgo y Gestión Ambiental": {
        texto: "Vela por la seguridad laboral, control de riesgos y manejo de residuos (REAS).",
        icono: "fa-hard-hat"
    }
};

function mostrarInfoUnidad(titulo) {
    const info = descripcionesOrganigrama[titulo] || {
        texto: "Información general de la unidad o departamento adscrito a la red del Hospital de Lanco.",
        icono: "fa-hospital"
    };
    
    let modalDetalle = document.getElementById('modalDetalleUnidad');
    
    if (!modalDetalle) {
        modalDetalle = document.createElement('div');
        modalDetalle.id = 'modalDetalleUnidad';
        modalDetalle.className = 'modal-overlay';
        modalDetalle.style.zIndex = "1100"; 
        modalDetalle.innerHTML = `
            <div class="modal-content" style="max-width: 460px; width: 95%; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25);">
                
                <!-- Cabecera Compacta con Icono Integrado -->
                <div class="modal-header" style="background: #0f172a; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                        <div style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                            <i id="detalleIconoModal" class="fas fa-hospital"></i>
                        </div>
                        <h3 id="detalleTituloModal" style="font-size: 0.98rem; color: #fff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></h3>
                    </div>
                    <button onclick="document.getElementById('modalDetalleUnidad').classList.add('hidden')" style="background:none; border:none; color:#cbd5e1; font-size:1.4rem; cursor:pointer; padding: 0 4px; transition: color 0.2s;">&times;</button>
                </div>

                <!-- Cuerpo Compacto y Limpio -->
                <div class="modal-body" style="padding: 20px; background: #ffffff; display: flex; flex-direction: column; gap: 10px;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 5px;">
                        <i class="fas fa-bookmark"></i> Perfil Institucional
                    </span>
                    <p id="detalleTextoModal" style="margin: 0; font-size: 0.88rem; color: #334155; line-height: 1.55;"></p>
                </div>

            </div>
        `;
        document.body.appendChild(modalDetalle);
    }

    document.getElementById('detalleTituloModal').innerText = titulo;
    document.getElementById('detalleTextoModal').innerText = info.texto;
    document.getElementById('detalleIconoModal').className = `fas ${info.icono}`;
    
    modalDetalle.classList.remove('hidden');
}

// Función para abrir cualquier PDF local en el visor integrado
function abrirVisorPDF(urlPdf, tituloDoc = "Documento Institucional") {
    const modal = document.getElementById('pdfViewerModal');
    const iframe = document.getElementById('pdfFrame');
    const titleContainer = document.getElementById('pdfViewerTitle');
    const downloadLink = document.getElementById('pdfDownloadLink');

    titleContainer.innerHTML = `<i class="fas fa-file-pdf" style="color: #ef4444;"></i> ${tituloDoc}`;
    downloadLink.setAttribute('href', urlPdf);
    iframe.src = urlPdf;

    // 📌 Ocultar o resetear cualquier submenú que haya quedado abierto
    document.querySelectorAll('.dropdown-subcontent').forEach(sub => {
        sub.style.display = ''; // Vuelve al estado definido por el CSS
    });

    // Mostrar el modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

// Ejemplo de base de datos o consulta de contactos relacionados por RUT/ID
const listaRelaciones = {
  "19739292-4": [ // RUT de Maria Luz Carrasco
    { nombre: "Carlos Fuentealba", relacion: "Mismo departamento", rut: "15123456-7" },
    { nombre: "Patricia Morales", relacion: "Jefatura Directa", rut: "12987654-3" }
  ],
  "12345678-9": [ // Otro funcionario
    { nombre: "Juan Mora", relacion: "Mismo departamento", rut: "11222333-4" },
    { nombre: "María Pérez", relacion: "Subordinado", rut: "14555666-7" }
  ]
};

function actualizarContactosRelacionados(rutFuncionario) {
  const container = document.getElementById('contactos-relacionados-container');
  const relacionados = listaRelaciones[rutFuncionario] || [];

  // Si no hay contactos relacionados
  if (relacionados.length === 0) {
    container.innerHTML = `<small class="text-muted p-2">Sin contactos relacionados</small>`;
    return;
  }

  // Generar HTML dinámico
  container.innerHTML = relacionados.map(contacto => `
    <a href="#" class="list-group-item list-group-item-action border-0 px-2 py-1" onclick="cargarFuncionario('${contacto.rut}')">
      <div class="fw-semibold text-primary mb-0" style="font-size: 0.9rem;">${contacto.nombre}</div>
      <small class="text-muted" style="font-size: 0.75rem;">${contacto.relacion}</small>
    </a>
  `).join('');
}