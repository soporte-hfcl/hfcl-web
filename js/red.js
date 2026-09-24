/* ==========================================
 * CONTROLADOR DE RED - VERSIÓN ESCRITORIO (HFCL)
 * ==========================================
 * Ubicación: web/js/red.js
 * Fuente de verdad estricta: Google Sheets (code.gs)
 */

let listaNodosRed = [];
let listaInfraestructuraRed = [];
let listaInfoMaestra = {};
let listaSsidRed = [];
let listaAccesosRed = [];
let puertoEnEdicionActual = null;

// Variables de estado para el chasis realista Cisco Catalyst
let activeNodeId = 'sw-core';
let activePortNum = null;
let isAssetEditable = false;
let tempUploadedImage = '';

document.addEventListener("DOMContentLoaded", async () => {
    console.log("[NOC-PC] Inicializando entorno de escritorio Hospital de Lanco...");

    // 1. CARGA INSTANTÁNEA DESDE CACHÉ LOCAL
    const cacheEmergencia = localStorage.getItem('hfc_lan_master_cache');
    if (cacheEmergencia) {
        try {
            const datosCache = JSON.parse(cacheEmergencia);
            console.log("[NOC-PC] Pintando interfaz preliminar con caché local...");
            finalizarCargaSegura(datosCache.equipos || [], datosCache.red || [], datosCache.info || null, datosCache.ssid || [], datosCache.accesos || [], false);
        } catch (e) {
            console.warn("[NOC-PC] Error al parsear caché local:", e);
        }
    }

    // 2. PETICIÓN ASÍNCRONA A LA NUBE (Google Apps Script)
    try {
        console.log("[NOC-PC] Consultando endpoint de Google Apps Script...");
        const respuestaCloud = await cargarDatosCloud('equipos', 'hfc_lan_master_cache');

        let nodos = [];
        let infra = [];
        let info = null;
        let ssid = [];
        let accesos = [];

        if (respuestaCloud) {
            nodos = Array.isArray(respuestaCloud.equipos) ? respuestaCloud.equipos : (Array.isArray(respuestaCloud) ? respuestaCloud : []);
            infra = Array.isArray(respuestaCloud.red) ? respuestaCloud.red : [];
            if (respuestaCloud.info) info = respuestaCloud.info;
            ssid = Array.isArray(respuestaCloud.ssid) ? respuestaCloud.ssid : [];
            accesos = Array.isArray(respuestaCloud.accesos) ? respuestaCloud.accesos : [];
        }

        console.log(`[NOC-PC] Sincronización exitosa. Total nodos: ${nodos.length}, Infra: ${infra.length}, SSID: ${ssid.length}, Accesos: ${accesos.length}`);
        
        // 3. RENDERIZADO DEFINITIVO Y CIERRE DE LOADER
        finalizarCargaSegura(nodos, infra, info, ssid, accesos, true);

    } catch (err) {
        console.error("[NOC-PC] Error de comunicación cloud:", err);
        destruirLoaderDefinitivo();
    }
});

function finalizarCargaSegura(nodos, infra = [], info = null, ssid = [], accesos = [], apagarLoader = true) {
    window.listaNodosRed = nodos;
    window.listaInfraestructuraRed = infra;
    if (info) window.listaInfoMaestra = info;
    window.listaSsidRed = ssid;
    window.listaAccesosRed = accesos;

    ejecutarSeguro(() => poblarSelectoresDesdeBD(), "poblarSelectoresDesdeBD");
    ejecutarSeguro(() => renderizarTablaResultadosRedPC(window.listaNodosRed), "renderizarTablaResultadosRedPC");
    ejecutarSeguro(() => renderizarVistaRacksEscritorio(window.listaNodosRed), "renderizarVistaRacksEscritorio");
    
    // Renderizado ampliado de Redes Wi-Fi y Carpetas de Red en formato Grid de PC
    ejecutarSeguro(() => renderizarVistaRedesYAccesosPC(window.listaSsidRed, window.listaAccesosRed, window.listaNodosRed), "renderizarVistaRedesYAccesosPC");
    
    ejecutarSeguro(() => {
        const kpiTotal = document.getElementById('kpi-total-equipos');
        if (kpiTotal) kpiTotal.textContent = window.listaNodosRed.length;
    }, "KPI Total");

    configurarBuscadorGlobalPC();
    configurarBuscadorRedesPC();

    if (apagarLoader) {
        destruirLoaderDefinitivo();
    }
}

function ejecutarSeguro(fn, nombreAccion) {
    try {
        fn();
    } catch (e) {
        console.error(`[NOC-PC Error] Falló la ejecución de '${nombreAccion}':`, e);
    }
}

function destruirLoaderDefinitivo() {
    const loaderById = document.getElementById('loading-screen') || document.getElementById('pantalla-carga') || document.getElementById('app-loader');
    if (loaderById) loaderById.remove();

    document.querySelectorAll('div, section').forEach(el => {
        if (el && el.innerText && el.innerText.includes('Sincronizando')) {
            el.remove();
        }
    });

    console.log("[NOC-PC] Loader destruido.");
}

function configurarBuscadorGlobalPC() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput && !searchInput.dataset.listenerConfigured) {
        searchInput.dataset.listenerConfigured = "true";
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtrados = window.listaNodosRed.filter(nodo => {
                const text = `${nodo.hostname || ''} ${nodo.ip || ''} ${nodo.mac || ''} ${nodo.rack || ''} ${nodo.tipo || ''} ${nodo.puerto || ''} ${nodo.marca || ''}`.toLowerCase();
                return text.includes(query);
            });
            renderizarTablaResultadosRedPC(filtrados);
        });
    }
}

function configurarBuscadorRedesPC() {
    const searchInput = document.getElementById('input-buscar-redes');
    if (searchInput && !searchInput.dataset.listenerConfigured) {
        searchInput.dataset.listenerConfigured = "true";
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            const ssidsFiltrados = window.listaSsidRed.filter(item => {
                return `${item.sector || ''} ${item.ssid || ''} ${item.hostname || ''} ${item.ip || ''} ${item.observaciones || ''}`.toLowerCase().includes(query);
            });

            const accesosFiltrados = window.listaAccesosRed.filter(item => {
                return `${item.rut || ''} ${item.user || ''} ${item.carpeta_red || ''} ${item.observaciones || ''}`.toLowerCase().includes(query);
            });

            renderizarVistaRedesYAccesosPC(ssidsFiltrados, accesosFiltrados, window.listaNodosRed);
        });
    }
}

// ==========================================================================
// RENDERIZADO EN TABLA PROFESIONAL (IDEAL PARA ESCRITORIO / PC)
// ==========================================================================
function renderizarTablaResultadosRedPC(datos) {
    const contenedor = document.getElementById('resultadosRedContainer');
    if (!contenedor) return;

    if (!Array.isArray(datos) || datos.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                <i class="fas fa-network-wired text-slate-600 text-3xl"></i>
                <p class="text-sm text-slate-400">No se encontraron dispositivos en la red.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800 text-[11px]">
                            <th class="p-3">Dispositivo / Hostname</th>
                            <th class="p-3">Tipo</th>
                            <th class="p-3">IP / MAC</th>
                            <th class="p-3">Ubicación (Rack)</th>
                            <th class="p-3">Switch / Puerto</th>
                            <th class="p-3">Patch Panel</th>
                            <th class="p-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60 text-slate-300">
    `;

    datos.forEach(nodo => {
        const estilo = obtenerEstiloTipoDispositivo(nodo.tipo);
        html += `
            <tr class="hover:bg-slate-800/40 transition group">
                <td class="p-3">
                    <div class="font-bold text-slate-100 flex items-center space-x-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span class="select-all">${nodo.hostname || 'SIN-NOMBRE'}</span>
                    </div>
                    <div class="text-[10px] text-slate-400 truncate max-w-[200px]">${nodo.marca || ''} ${nodo.modelo || ''}</div>
                </td>
                <td class="p-3">
                    <span class="inline-flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-medium text-slate-200">
                        ${estilo.icono}
                        <span>${nodo.tipo || 'General'}</span>
                    </span>
                </td>
                <td class="p-3 font-mono">
                    <div class="text-cyan-400 font-semibold select-all">${nodo.ip || 'S/IP'}</div>
                    <div class="text-[10px] text-slate-500 select-all">${nodo.mac || 'S/MAC'}</div>
                </td>
                <td class="p-3">
                    <span class="bg-blue-950/40 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-500/30 text-[11px]">
                        Rack ${nodo.rack || 'P1A'}
                    </span>
                </td>
                <td class="p-3 font-mono text-slate-300">
                    <div>${nodo.sw || 'N/A'}</div>
                    <div class="text-[10px] text-slate-400">${nodo.puerto || 'S/P'}</div>
                </td>
                <td class="p-3 font-mono text-slate-400">
                    ${nodo.patch_panel || '-'}
                </td>
                <td class="p-3 text-right space-x-1">
                    <button type="button" onclick='verDetallesObjeto(${JSON.stringify(nodo).replace(/'/g, "&#39;")})' title="Ver Ficha" class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition">
                        <i class="fas fa-eye text-blue-400"></i>
                    </button>
                    <button type="button" onclick='cargarParaEditarObjeto(${JSON.stringify(nodo).replace(/'/g, "&#39;")})' title="Editar Activo" class="bg-slate-800 hover:bg-slate-700 text-blue-400 px-2.5 py-1.5 rounded-lg border border-slate-700 transition">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
            <div class="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center font-mono">
                <span>Mostrando ${datos.length} registro(s) filtrados</span>
                <span class="text-emerald-400">● Conexión Activa con Base Maestra</span>
            </div>
        </div>
    `;

    contenedor.innerHTML = html;
}

// ==========================================================================
// RENDERIZADO DE RACKS Y SWITCHES (DISEÑO REALISTA CISCO CATALYST & PATCH PANELS)
// ==========================================================================
function renderizarVistaRacksEscritorio(datos) {
    renderTopologyBar();
    renderChassis();
    renderCharts();
}

function seleccionarRack(rackId) {
    document.querySelectorAll('.rack-tab-btn').forEach(btn => {
        if (btn.textContent.trim() === rackId) {
            btn.className = "rack-tab-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 transition";
        } else {
            btn.className = "rack-tab-btn px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 transition";
        }
    });

    console.log(`[NOC-PC] Cambiando a topología del rack: ${rackId}`);
    renderizarVistaRacksEscritorio(window.listaNodosRed);
}

function renderTopologyBar() {
    const bar = document.getElementById('topologyBarContainer') || document.getElementById('topology-bar');
    if (!bar) return;
    
    bar.innerHTML = '';
    bar.style.display = 'flex';
    bar.style.alignItems = 'center';
    bar.style.gap = '10px';
    bar.style.overflowX = 'auto';

    const nodos = window.listaNodosRed || [];
    
    nodos.forEach(sw => {
        const pin = document.createElement('div');
        pin.className = `map-node ${sw.id === activeNodeId ? 'active-pin' : ''}`;
        pin.style.cssText = "cursor: pointer; padding: 4px 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 6px; font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 6px;";
        pin.innerHTML = `<i class="fas fa-server text-cyan-400"></i><span>${sw.name || sw.rack || 'Switch'}</span>`;
        pin.onclick = () => {
            activeNodeId = sw.id || 'sw-core';
            activePortNum = null;
            renderizarVistaRacksEscritorio(nodos);
        };
        bar.appendChild(pin);
    });
}

function renderChassis() {
    const mainContainer = document.getElementById('chassisPortsContainer') || document.getElementById('switch-ports-grid');
    if (!mainContainer) return;

    const nodos = window.listaNodosRed || [];
    const sw = nodos.find(s => s.id === activeNodeId) || nodos[0] || { 
        modelo: 'Catalyst 2960 Plus', 
        rack: 'Rack Principal', 
        name: 'SW-CORE', 
        ip: '10.66.50.1', 
        status: 'online',
        ports: {} 
    };

    let block1Columns = '';
    let block2Columns = '';

    // Puertos 1 al 12 (Divididos en 6 columnas dobles superior/inferior)
    for (let col = 0; col < 6; col++) {
        const topPortNum = (col * 2) + 1;
        const btmPortNum = (col * 2) + 2;
        const devTop = (sw.ports && sw.ports[topPortNum]) ? sw.ports[topPortNum] : null;
        const devBtm = (sw.ports && sw.ports[btmPortNum]) ? sw.ports[btmPortNum] : null;
        const activeTop = devTop && (devTop.enabled !== false);
        const activeBtm = devBtm && (devBtm.enabled !== false);

        block1Columns += `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                <div style="background-color: #d97706; color: #111; font-size: 7.5px; font-weight: bold; text-align: center; padding: 1px 0; border-radius: 1px; width: 100%; display: flex; justify-content: space-around;">
                    <span>${topPortNum}</span><span>${btmPortNum}</span>
                </div>
                <div style="display: flex; justify-content: space-around; width: 100%;">
                    <div style="width: 4px; height: 4px; background: ${activeTop ? '#10b981' : '#334155'}; border-radius: 50%;"></div>
                    <div style="width: 4px; height: 4px; background: ${activeBtm ? '#10b981' : '#334155'}; border-radius: 50%;"></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 2px; width: 100%;">
                    <div onclick="selectPort(${topPortNum})" style="background: #1e293b; border: 1px solid #334155; height: 12px; border-radius: 1px; cursor: pointer;" title="Puerto #${topPortNum}"></div>
                    <div onclick="selectPort(${btmPortNum})" style="background: #1e293b; border: 1px solid #334155; height: 12px; border-radius: 1px; cursor: pointer;" title="Puerto #${btmPortNum}"></div>
                </div>
            </div>
        `;
    }

    // Puertos 13 al 24
    for (let col = 0; col < 6; col++) {
        const topPortNum = (col * 2) + 13;
        const btmPortNum = (col * 2) + 14;
        const devTop = (sw.ports && sw.ports[topPortNum]) ? sw.ports[topPortNum] : null;
        const devBtm = (sw.ports && sw.ports[btmPortNum]) ? sw.ports[btmPortNum] : null;
        const activeTop = devTop && (devTop.enabled !== false);
        const activeBtm = devBtm && (devBtm.enabled !== false);

        block2Columns += `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                <div style="background-color: #d97706; color: #111; font-size: 7.5px; font-weight: bold; text-align: center; padding: 1px 0; border-radius: 1px; width: 100%; display: flex; justify-content: space-around;">
                    <span>${topPortNum}</span><span>${btmPortNum}</span>
                </div>
                <div style="display: flex; justify-content: space-around; width: 100%;">
                    <div style="width: 4px; height: 4px; background: ${activeTop ? '#10b981' : '#334155'}; border-radius: 50%;"></div>
                    <div style="width: 4px; height: 4px; background: ${activeBtm ? '#10b981' : '#334155'}; border-radius: 50%;"></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 2px; width: 100%;">
                    <div onclick="selectPort(${topPortNum})" style="background: #1e293b; border: 1px solid #334155; height: 12px; border-radius: 1px; cursor: pointer;" title="Puerto #${topPortNum}"></div>
                    <div onclick="selectPort(${btmPortNum})" style="background: #1e293b; border: 1px solid #334155; height: 12px; border-radius: 1px; cursor: pointer;" title="Puerto #${btmPortNum}"></div>
                </div>
            </div>
        `;
    }

    // Estructura limpia apilada horizontalmente ocupando todo el ancho del rack
    mainContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 1100px; margin: 0 auto; padding: 10px; font-family: monospace;">
            
            <!-- 1. PATCH PANEL SUPERIOR (DATOS - 60 puertos distribuidos en 2 filas de 30) -->
            <div style="background: #090d16; border: 1px solid #1e293b; border-radius: 6px; padding: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">
                <div style="font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
                    <span><b>PATCH PANEL SUPERIOR</b> • DATOS (HCL)</span>
                    <span style="color: #38bdf8;">60 Puertos</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px; background: #020617; padding: 10px; border-radius: 4px; border: 1px solid #0f172a;">
                    ${renderDataRow(1, 30)}
                    ${renderDataRow(31, 60)}
                </div>
            </div>

            <!-- 2. SWITCH CISCO CATALYST CENTRAL -->
            <div style="background: #0f172a; border: 2px solid #334155; border-radius: 6px; padding: 14px; box-shadow: 0 8px 16px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 12px; color: #cbd5e1;">
                    <span><b>${sw.name || 'SW-CORE'}</b> (${sw.rack || 'Rack'}) — IP: <span style="color: #22d3ee;">${sw.ip || '10.66.50.1'}</span></span>
                    <span style="background: #1e293b; color: #34d399; padding: 2px 8px; border-radius: 4px; font-size: 10px; border: 1px solid #334155;">${sw.modelo || 'Catalyst 2960'}</span>
                </div>
                <div style="display: flex; gap: 16px; align-items: center; background: #020617; padding: 12px; border-radius: 4px; border: 1px solid #1e293b;">
                    <!-- Panel de LEDs Cisco -->
                    <div style="display: flex; flex-direction: column; gap: 6px; padding-right: 12px; border-right: 1px solid #1e293b; min-width: 45px;">
                        <div style="font-size: 9px; color: #38bdf8; font-weight: bold; letter-spacing: 1px;">CISCO</div>
                        <div style="display: flex; align-items: center; gap: 6px;"><div style="width:6px; height:6px; border-radius:50%; background:#10b981;"></div><span style="font-size:8px; color:#94a3b8;">SYS</span></div>
                        <div style="display: flex; align-items: center; gap: 6px;"><div style="width:6px; height:6px; border-radius:50%; background:#10b981;"></div><span style="font-size:8px; color:#94a3b8;">PWR</span></div>
                    </div>
                    <!-- Bloques de puertos del switch -->
                    <div style="flex: 1; display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px;">${block1Columns}</div>
                    <div style="flex: 1; display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px;">${block2Columns}</div>
                </div>
            </div>

            <!-- 3. PATCH PANEL INFERIOR (VOZ - 48 puertos distribuidos en 2 filas de 24) -->
            <div style="background: #090d16; border: 1px solid #1e293b; border-radius: 6px; padding: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">
                <div style="font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
                    <span><b>PATCH PANEL INFERIOR</b> • VOZ (HCL)</span>
                    <span style="color: #fbbf24;">48 Puertos</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px; background: #020617; padding: 10px; border-radius: 4px; border: 1px solid #0f172a;">
                    ${renderVoiceRow(1, 24, 'V', 1)}
                    ${renderVoiceRow(25, 48, 'V', 25)}
                </div>
            </div>

        </div>
    `;
}

// Asegurar que las filas de los patch panels usen una grilla horizontal limpia de 15 y 12 columnas exactas
function renderDataRow(start, end, typePrefix = 'D') {
    let html = '<div style="display: grid; grid-template-columns: repeat(15, 1fr); gap: 3px; width: 100%;">';
    for (let i = start; i <= end; i++) {
        let portId = `${typePrefix}${String(i).padStart(2, '0')}`;
        html += `
            <div onclick="abrirModalEnlacePatch('${portId}', 'data')"
                 oncontextmenu="handlePatchRightClick(event, '${portId}')"
                 style="background: #1e293b; border: 1px solid #334155; height: 26px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #cbd5e1; cursor: pointer; transition: all 0.2s;"
                 onmouseover="this.style.background='#2563eb';this.style.color='#fff';"
                 onmouseout="this.style.background='#1e293b';this.style.color='#cbd5e1';"
                 title="Patch Panel ${portId} (Click izq: Enlazar | Click der: Limpiar)">
                 ${portId}
            </div>
        `;
    }
    html += '</div>';
    return html;
}

function renderVoiceRow(start, end, typePrefix = 'V', startNum = 1) {
    let html = '<div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; width: 100%;">';
    for (let i = 0; i < (end - start + 1); i++) {
        let voiceIndex = startNum + i;
        let portId = `${typePrefix}${String(voiceIndex).padStart(2, '0')}`;
        html += `
            <div onclick="abrirModalEnlacePatch('${portId}', 'voice')"
                 oncontextmenu="handlePatchRightClick(event, '${portId}')"
                 style="background: #1e293b; border: 1px solid #334155; height: 26px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #cbd5e1; cursor: pointer; transition: all 0.2s;"
                 onmouseover="this.style.background='#d97706';this.style.color='#fff';"
                 onmouseout="this.style.background='#1e293b';this.style.color='#cbd5e1';"
                 title="Patch Voz ${portId} (Click izq: Enlazar | Click der: Limpiar)">
                 ${portId}
            </div>
        `;
    }
    html += '</div>';
    return html;
}

function handlePatchRightClick(event, portId) {
    event.preventDefault();
    if (confirm(`¿Deseas desvincular y limpiar por completo el registro del puerto ${portId}?`)) {
        console.log(`Puerto ${portId} liberado correctamente.`);
    }
}

function selectPort(num) {
    activePortNum = num;
    console.log(`Puerto de switch seleccionado: #${num}`);
}

function renderCharts() {}

function renderizarSwitchCatalyst() { renderChassis(); }
function renderizarPatchPanels() { renderChassis(); }

// ==========================================================================
// RENDERIZADO DE REDES Y ACCESOS EN FORMATO GRID AMPLIO PARA PC
// ==========================================================================
function renderizarVistaRedesYAccesosPC(ssids, accesos, nodosEquipos) {
    const contenedorSsid = document.getElementById('lista-redes-ssid');
    const contenedorAccesos = document.getElementById('lista-accesos-red');

    if (!contenedorSsid || !contenedorAccesos) return;

    if (!Array.isArray(ssids) || ssids.length === 0) {
        contenedorSsid.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-4 bg-slate-900/40 rounded-xl border border-slate-800">No hay redes Wi-Fi registradas.</p>`;
    } else {
        let htmlSsid = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
        ssids.forEach(item => {
            const apInfo = nodosEquipos.find(n => String(n.hostname).trim().toLowerCase() === String(item.hostname).trim().toLowerCase()) || {};
            htmlSsid += `
                <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3 border-l-4 border-l-cyan-500">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-bold text-slate-100 flex items-center space-x-2">
                            <i class="fas fa-wifi text-cyan-400 text-base"></i>
                            <span>${item.ssid}</span>
                        </span>
                        <span class="text-xs bg-cyan-950/60 text-cyan-300 px-2.5 py-1 rounded-lg font-mono border border-cyan-500/30">${item.sector || 'General'}</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-2.5 rounded-xl font-mono border border-slate-800">
                        <div>AP Host: <span class="text-cyan-400 font-bold">${item.hostname}</span></div>
                        <div>IP: <span class="text-emerald-400 font-bold">${item.ip || 'S/IP'}</span></div>
                        <div class="col-span-2 text-[11px] text-slate-400">Rack: <span class="text-slate-300">Rack ${apInfo.rack || 'S/R'} | ${apInfo.sw || 'SW'} (${apInfo.puerto || 'S/P'})</span></div>
                    </div>

                    <div class="flex justify-between items-center pt-1">
                        <div class="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-200">
                            🔑 <span class="select-all font-bold">${item.pass || 'Sin Clave'}</span>
                        </div>
                        <button onclick="copiarAlPortapapeles('${item.pass || ''}')" class="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1.5 rounded-xl border border-slate-700 transition font-medium">
                            Copiar Clave 📋
                        </button>
                    </div>
                    ${item.observaciones ? `<p class="text-xs text-slate-400 italic pt-1 border-t border-slate-800">Nota: ${item.observaciones}</p>` : ''}
                </div>
            `;
        });
        htmlSsid += '</div>';
        contenedorSsid.innerHTML = htmlSsid;
    }

    if (!Array.isArray(accesos) || accesos.length === 0) {
        contenedorAccesos.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-4 bg-slate-900/40 rounded-xl border border-slate-800">No hay accesos de red registrados.</p>`;
    } else {
        let htmlAccesos = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
        accesos.forEach(item => {
            htmlAccesos += `
                <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3 border-l-4 border-l-blue-500">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-bold text-slate-100 flex items-center space-x-2">
                            <i class="fas fa-user-shield text-blue-400 text-base"></i>
                            <span>Usuario: <strong class="text-blue-300 font-mono">${item.user}</strong></span>
                        </span>
                        <span class="text-xs bg-slate-950 text-slate-300 px-2.5 py-1 rounded-lg font-mono border border-slate-800">RUT: ${item.rut}</span>
                    </div>

                    <div class="space-y-1">
                        <div class="text-xs text-slate-400">Carpetas Compartidas (SMB):</div>
                        <div class="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 select-all flex justify-between items-center">
                            <span class="truncate pr-2">${item.carpeta_red || 'Sin carpetas asignadas'}</span>
                            <button onclick="copiarAlPortapapeles('${item.carpeta_red || ''}')" class="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-2.5 py-1 rounded-lg border border-slate-700 font-mono transition shrink-0">
                                Copiar Ruta 📋
                            </button>
                        </div>
                    </div>

                    <div class="flex justify-between items-center text-xs pt-1 border-t border-slate-800 font-mono text-slate-400">
                        <div>Clave Red: <span class="text-amber-400 font-bold select-all">${item.pass || 'S/N'}</span></div>
                        ${item.observaciones ? `<div class="text-xs italic text-slate-500">${item.observaciones}</div>` : ''}
                    </div>
                </div>
            `;
        });
        htmlAccesos += '</div>';
        contenedorAccesos.innerHTML = htmlAccesos;
    }
}

function copiarAlPortapapeles(texto) {
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
        console.log("Copiado al portapapeles con éxito.");
    }).catch(err => {
        console.error("Error al copiar: ", err);
    });
}

// ==========================================================================
// CONTROLADOR GLOBAL DE VISTAS Y GESTIÓN DE FORMULARIO
// ==========================================================================
function switchView(viewName, btnElement) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    const targetView = document.getElementById('view-' + viewName);
    if (targetView) targetView.classList.remove('hidden');

    const titles = { 
        consultar: 'Módulo de Consulta y Tabla General', 
        registrar: 'Gestión de Activos / Edición', 
        racks: 'Estado Estructural de Racks', 
        redes: 'Wi-Fi & Accesos de Red' 
    };

    const subtitleEl = document.getElementById('header-subtitle');
    if (subtitleEl) subtitleEl.innerText = titles[viewName] || 'Panel de Control';

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.className = "nav-btn w-full px-4 py-3 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition flex items-center space-x-3 text-left";
    });
    
    if (btnElement) {
        btnElement.className = "nav-btn w-full px-4 py-3 rounded-xl text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 transition flex items-center space-x-3 text-left";
    }

    if (viewName !== 'registrar') {
        const formEl = document.getElementById('activoForm');
        if (formEl) formEl.reset();
        puertoEnEdicionActual = null;
        const badge = document.getElementById('edit-badge');
        if (badge) badge.classList.add('hidden');
        if (typeof toggleCamposDinamicos === 'function') toggleCamposDinamicos();
    }
}

function obtenerEstiloTipoDispositivo(tipoStr) {
    const t = (tipoStr || '').toLowerCase().trim();
    if (t.includes('notebook') || t.includes('laptop')) return { icono: '<i class="fas fa-laptop text-sky-400"></i>' };
    if (t.includes('pc') || t.includes('computador')) return { icono: '<i class="fas fa-desktop text-blue-400"></i>' };
    if (t.includes('impresora')) return { icono: '<i class="fas fa-print text-amber-400"></i>' };
    if (t.includes('teléfono') || t.includes('ip phone')) return { icono: '<i class="fas fa-phone-alt text-teal-400"></i>' };
    if (t.includes('access point') || t.includes('ap') || t.includes('wifi')) return { icono: '<i class="fas fa-wifi text-cyan-400"></i>' };
    if (t.includes('switch')) return { icono: '<i class="fas fa-network-wired text-emerald-400"></i>' };
    if (t.includes('servidor') || t.includes('server')) return { icono: '<i class="fas fa-server text-purple-400"></i>' };
    return { icono: '<i class="fas fa-cube text-slate-400"></i>' };
}

function cargarParaEditarObjeto(nodo) {
    if (!nodo) return;
    const botonRegistrar = document.querySelectorAll('.nav-btn')[1];
    switchView('registrar', botonRegistrar);

    document.getElementById('inputHostname').value = nodo.hostname || '';
    document.getElementById('inputIp').value = nodo.ip || '';
    document.getElementById('inputMac').value = nodo.mac || '';
    document.getElementById('inputObservaciones').value = nodo.observaciones || '';

    const selectRack = document.getElementById('formRack');
    if (selectRack) selectRack.value = nodo.rack || '';

    setTimeout(() => {
        const selectSwitch = document.getElementById('formSwitch');
        if (selectSwitch) selectSwitch.value = nodo.sw || '';

        const selectPuerto = document.getElementById('selectPuerto');
        if (selectPuerto) selectPuerto.value = nodo.puerto || '';

        const selectPatch = document.getElementById('selectPatchPanel');
        if (selectPatch) selectPatch.value = nodo.patch_panel || '';

        const selectTipo = document.getElementById('selectTipo');
        if (selectTipo) {
            selectTipo.value = nodo.tipo || '';
            toggleCamposDinamicos();
        }

        const selectMarca = document.getElementById('selectMarca');
        if (selectMarca) selectMarca.value = nodo.marca || '';

        const selectCpu = document.getElementById('selectCpu');
        if (selectCpu) selectCpu.value = nodo.cpu || '';

        const selectRam = document.getElementById('selectRam');
        if (selectRam) selectRam.value = nodo.ram || '';

        const selectSo = document.getElementById('selectSo');
        if (selectSo) selectSo.value = nodo.so || '';

        const selectOffice = document.getElementById('selectOffice');
        if (selectOffice) selectOffice.value = nodo.office || '';
    }, 150);

    puertoEnEdicionActual = nodo.puerto || null;
}

function verDetallesObjeto(nodo) {
    if (!nodo) return;
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    const vistaDetalles = document.getElementById('view-detalles');
    if (vistaDetalles) vistaDetalles.classList.remove('hidden');

    const subtitleEl = document.getElementById('header-subtitle');
    if (subtitleEl) subtitleEl.innerText = 'Ficha Técnica del Dispositivo';

    document.getElementById('det-hostname').textContent = nodo.hostname || 'SIN-NOMBRE';
    document.getElementById('det-tipo-badge').textContent = nodo.tipo || 'Dispositivo';
    document.getElementById('det-rack').textContent = nodo.rack || 'P1A';
    document.getElementById('det-sw').textContent = nodo.sw || 'N/A';
    document.getElementById('det-puerto').textContent = nodo.puerto || 'S/P';
    document.getElementById('det-patch').textContent = nodo.patch_panel || '-';
    document.getElementById('det-ip').textContent = nodo.ip || 'S/IP';
    document.getElementById('det-mac').textContent = nodo.mac || 'S/MAC';
    
    document.getElementById('det-marca').textContent = nodo.marca || '-';
    document.getElementById('det-cpu').textContent = nodo.cpu || '-';
    document.getElementById('det-ram').textContent = nodo.ram || '-';
    document.getElementById('det-alm').textContent = (nodo.tipo_alm ? nodo.tipo_alm + ' ' : '') + (nodo.cap_alm || '-');
    document.getElementById('det-so').textContent = nodo.so || '-';
    document.getElementById('det-office').textContent = nodo.office || '-';
    
    const obsEl = document.getElementById('det-obs');
    if (obsEl) obsEl.textContent = nodo.observaciones || 'Sin observaciones registradas.';

    const btnEditarPasada = document.getElementById('btn-pasar-editar');
    if (btnEditarPasada) {
        btnEditarPasada.onclick = () => cargarParaEditarObjeto(nodo);
    }
}

function cancelarEdicion() {
    const formEl = document.getElementById('activoForm');
    if (formEl) formEl.reset();
    puertoEnEdicionActual = null;
    const botonConsultar = document.querySelectorAll('.nav-btn')[0];
    switchView('consultar', botonConsultar);
}

function poblarSelectoresDesdeBD() {
    const infoData = window.listaInfoMaestra || {};
    const selectRack = document.getElementById('formRack');

    const tiposSet = new Set();
    const marcasSet = new Set();
    const cpuSet = new Set();
    const ramSet = new Set();
    const almacenamientoSet = new Set();
    const capacidadSet = new Set();
    const soSet = new Set();
    const officeSet = new Set();
    const racksSet = new Set();

    if (infoData && typeof infoData === 'object') {
        const volcar = (keyProp, targetSet) => {
            for (const k in infoData) {
                if (k.toLowerCase().trim() === keyProp.toLowerCase() && Array.isArray(infoData[k])) {
                    infoData[k].forEach(val => {
                        const vStr = String(val).trim();
                        if (vStr && vStr !== '-' && vStr !== '""' && vStr !== "''") {
                            targetSet.add(vStr);
                        }
                    });
                }
            }
        };

        volcar('tipo', tiposSet);
        volcar('marca', marcasSet);
        volcar('cpu', cpuSet);
        volcar('ram', ramSet);
        volcar('almacenamiento', almacenamientoSet);
        volcar('capacidad', capacidadSet);
        volcar('so', soSet);
        volcar('office', officeSet);
    }

    if (window.listaNodosRed && Array.isArray(window.listaNodosRed)) {
        window.listaNodosRed.forEach(n => {
            if (n.tipo) tiposSet.add(String(n.tipo).trim());
            if (n.marca) marcasSet.add(String(n.marca).trim());
            if (n.cpu) cpuSet.add(String(n.cpu).trim());
            if (n.ram) ramSet.add(String(n.ram).trim());
            if (n.almacenamiento) almacenamientoSet.add(String(n.almacenamiento).trim());
            if (n.so) soSet.add(String(n.so).trim());
            if (n.office) officeSet.add(String(n.office).trim());
            if (n.rack) racksSet.add(String(n.rack).trim());
        });
    }

    if (racksSet.size === 0) {
        ["P1A", "P1B", "P1C", "P2A", "P2B", "P2C"].forEach(r => racksSet.add(r));
    }

    function rellenarSelect(selectEl, setValues, defaultText) {
        if (!selectEl) return;
        selectEl.innerHTML = `<option value="">${defaultText}</option>`;
        Array.from(setValues).sort().forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            selectEl.appendChild(opt);
        });
    }

    rellenarSelect(selectRack, racksSet, "Seleccione Rack...");
    rellenarSelect(document.getElementById('selectTipo'), tiposSet, "Seleccione tipo...");
    rellenarSelect(document.getElementById('selectMarca'), marcasSet, "Seleccione marca...");
    rellenarSelect(document.getElementById('selectCpu'), cpuSet, "Seleccione CPU...");
    rellenarSelect(document.getElementById('selectRam'), ramSet, "Seleccione RAM...");
    rellenarSelect(document.getElementById('selectTipoAlm'), almacenamientoSet, "Seleccione tipo almacenamiento...");
    rellenarSelect(document.getElementById('selectCapAlm'), capacidadSet, "Seleccione capacidad disco...");
    rellenarSelect(document.getElementById('selectSo'), soSet, "Seleccione SO...");
    rellenarSelect(document.getElementById('selectOffice'), officeSet, "Seleccione Office...");
}

function toggleCamposDinamicos() {
    const selectTipo = document.getElementById('selectTipo');
    const camposComputador = document.getElementById('camposComputador');

    if (!selectTipo || !camposComputador) return;

    const valorTipo = selectTipo.value.toLowerCase().trim();
    const esComputador = valorTipo.includes('computador') || 
                         valorTipo.includes('notebook') || 
                         valorTipo.includes('pc') || 
                         valorTipo.includes('servidor');

    if (esComputador) {
        camposComputador.classList.remove('hidden');
    } else {
        camposComputador.classList.add('hidden');
        const camposALimpiar = ['selectCpu', 'selectRam', 'selectTipoAlm', 'selectCapAlm', 'selectSo', 'selectOffice'];
        camposALimpiar.replaceidList?.forEach ? null : camposALimpiar.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    }
}

async function guardarActivoPC() {
    const hostname = document.getElementById('inputHostname')?.value.trim() || '';
    const ip = document.getElementById('inputIp')?.value.trim() || '';
    const mac = document.getElementById('inputMac')?.value.trim() || '';
    const puerto = document.getElementById('selectPuerto')?.value || '';
    const patchPanel = document.getElementById('selectPatchPanel')?.value || '';
    const rack = document.getElementById('formRack')?.value || '';
    const switchVal = document.getElementById('formSwitch')?.value || '';
    const tipo = document.getElementById('selectTipo')?.value || '';
    const marca = document.getElementById('selectMarca')?.value || '';
    const cpu = document.getElementById('selectCpu')?.value || '';
    const ram = document.getElementById('selectRam')?.value || '';
    const tipoAlm = document.getElementById('selectTipoAlm')?.value || '';
    const capAlm = document.getElementById('selectCapAlm')?.value || '';
    const almacenamientoFinal = tipoAlm && capAlm ? `${tipoAlm} ${capAlm}` : (capAlm || tipoAlm);
    const so = document.getElementById('selectSo')?.value || '';
    const office = document.getElementById('selectOffice')?.value || '';
    const observaciones = document.getElementById('inputObservaciones')?.value.trim() || '';

    if (!hostname || !ip) {
        alert("Por favor completa al menos el Hostname y la IP.");
        return;
    }

    const payload = {
        action: 'guardar_equipo',
        equipo: {
            hostname, ip, mac, tipo, marca, modelo: "", propiedad: "Hospital",
            rack, sw: switchVal, puerto, patch_panel: patchPanel, cpu, ram,
            almacenamiento: almacenamientoFinal, so, office, observaciones
        }
    };

    try {
        const resultado = typeof enviarDatosCloud === 'function' ? await enviarDatosCloud(payload) : null;
        const fueExitoso = resultado === true || (resultado && resultado.status === "success");

        if (fueExitoso || resultado) {
            alert("¡Registro guardado con éxito en Google Sheets desde la estación de escritorio!");
            cancelarEdicion();

            if (typeof cargarDatosCloud === 'function') {
                const respuestaCloud = await cargarDatosCloud('equipos', 'hfc_lan_master_cache');
                if (respuestaCloud) {
                    window.listaNodosRed = Array.isArray(respuestaCloud.equipos) ? respuestaCloud.equipos : [];
                    renderizarTablaResultadosRedPC(window.listaNodosRed);
                    renderizarVistaRacksEscritorio(window.listaNodosRed);
                }
            }
        } else {
            alert("El servidor indicó un problema al guardar. Revisa tu Google Sheets.");
        }
    } catch (err) {
        console.error("[NOC-PC Error] Falló el guardado:", err);
        alert("Error de comunicación al intentar guardar en la nube.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const inputMac = document.getElementById('inputMac');
    if (inputMac) {
        inputMac.addEventListener('input', function (e) {
            let val = e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
            let formatted = '';
            for (let i = 0; i < val.length && i < 12; i++) {
                if (i > 0 && i % 2 === 0) formatted += ':';
                formatted += val[i];
            }
            e.target.value = formatted;
        });
    }

    const inputIp = document.getElementById('inputIp');
    if (inputIp) {
        inputIp.addEventListener('input', function (e) {
            e.target.value = e.target.value.replace(/[^0-9.]/g, '');
        });
    }
});

function abrirModalEnlacePatch(portId, tipo) {
    console.log(`Abriendo modal de enlace para ${tipo.toUpperCase()} - Puerto: ${portId}`);
}