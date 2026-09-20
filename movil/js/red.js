/* ==========================================
 * CONTROLADOR DE RED - VERSIÓN MÓVIL (HFCL)
 * ==========================================
 * Ubicación: movil/js/red.js
 * Fuente de verdad estricta: Google Sheets (code.gs)
 */

let listaNodosRed = [];
let listaInfraestructuraRed = [];
let listaInfoMaestra = {};
let listaSsidRed = [];      // <-- NUEVO: Almacena las redes Wi-Fi por sector/AP
let listaAccesosRed = [];   // <-- NUEVO: Almacena los accesos y carpetas de red por funcionario
let puertoEnEdicionActual = null;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("[NOC] Inicializando entorno móvil Hospital de Lanco...");

    // 1. CARGA INSTANTÁNEA DESDE CACHÉ LOCAL
    const cacheEmergencia = localStorage.getItem('hfc_lan_master_cache');
    if (cacheEmergencia) {
        try {
            const datosCache = JSON.parse(cacheEmergencia);
            console.log("[NOC] Pintando interfaz preliminar con caché local...");
            finalizarCargaSegura(datosCache.equipos || [], datosCache.red || [], datosCache.info || null, datosCache.ssid || [], datosCache.accesos || [], false);
        } catch (e) {
            console.warn("[NOC] Error al parsear caché local:", e);
        }
    }

    // 2. PETICIÓN ASÍNCRONA A LA NUBE (Google Apps Script)
    try {
        console.log("[NOC] Consultando endpoint de Google Apps Script...");
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

        console.log(`[NOC] Sincronización exitosa. Total nodos: ${nodos.length}, Infra: ${infra.length}, SSID: ${ssid.length}, Accesos: ${accesos.length}`);
        
        // 3. RENDERIZADO DEFINITIVO Y CIERRE DE LOADER
        finalizarCargaSegura(nodos, infra, info, ssid, accesos, true);

    } catch (err) {
        console.error("[NOC] Error de comunicación cloud:", err);
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
    ejecutarSeguro(() => renderizarResultadosRed(window.listaNodosRed), "renderizarResultadosRed");
    ejecutarSeguro(() => renderizarVistaRacks(window.listaNodosRed), "renderizarVistaRacks");
    
    // Renderizar las nuevas vistas de Redes Wi-Fi y Carpetas de Red
    ejecutarSeguro(() => renderizarVistaRedesYAccesos(window.listaSsidRed, window.listaAccesosRed, window.listaNodosRed), "renderizarVistaRedesYAccesos");
    
    // Panel de Estadísticas Rápidas al Cargar
    ejecutarSeguro(() => renderizarPanelEstadisticas(window.listaNodosRed), "renderizarPanelEstadisticas");
    
    ejecutarSeguro(() => {
        const kpiTotal = document.getElementById('kpi-total-equipos');
        if (kpiTotal) kpiTotal.textContent = window.listaNodosRed.length;
    }, "KPI Total");

    configurarBuscadorGlobalOnce();
    configurarBuscadorRedesOnce(); // <-- NUEVO: Configura filtro de la pestaña redes

    if (apagarLoader) {
        destruirLoaderDefinitivo();
    }
}

function ejecutarSeguro(fn, nombreAccion) {
    try {
        fn();
    } catch (e) {
        console.error(`[NOC Error] Falló la ejecución de '${nombreAccion}':`, e);
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

    console.log("[NOC] Loader destruido y pantalla liberada con éxito.");
}

function configurarBuscadorGlobalOnce() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput && !searchInput.dataset.listenerConfigured) {
        searchInput.dataset.listenerConfigured = "true";
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtrados = window.listaNodosRed.filter(nodo => {
                const text = `${nodo.hostname || ''} ${nodo.ip || ''} ${nodo.mac || ''} ${nodo.rack || ''} ${nodo.tipo || ''} ${nodo.puerto || ''}`.toLowerCase();
                return text.includes(query);
            });
            renderizarResultadosRed(filtrados);
        });
    }
}

// ==========================================================================
// NUEVO: FILTRO PARA LA PESTAÑA REDES & ACCESOS
// ==========================================================================
function configurarBuscadorRedesOnce() {
    const searchInput = document.getElementById('input-buscar-redes');
    if (searchInput && !searchInput.dataset.listenerConfigured) {
        searchInput.dataset.listenerConfigured = "true";
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            // Filtrar redes SSID
            const ssidsFiltrados = window.listaSsidRed.filter(item => {
                return `${item.sector || ''} ${item.ssid || ''} ${item.hostname || ''} ${item.ip || ''} ${item.observaciones || ''}`.toLowerCase().includes(query);
            });

            // Filtrar accesos de red
            const accesosFiltrados = window.listaAccesosRed.filter(item => {
                // Cruzar con funcionarios si es necesario o buscar por sus campos directos
                return `${item.rut || ''} ${item.user || ''} ${item.carpeta_red || ''} ${item.observaciones || ''}`.toLowerCase().includes(query);
            });

            renderizarVistaRedesYAccesos(ssidsFiltrados, accesosFiltrados, window.listaNodosRed);
        });
    }
}

// ==========================================================================
// RENDERIZADO DE LA NUEVA VISTA DE REDES WI-FI Y ACCESOS SMB
// ==========================================================================
function renderizarVistaRedesYAccesos(ssids, accesos, nodosEquipos) {
    const contenedorSsid = document.getElementById('lista-redes-ssid');
    const contenedorAccesos = document.getElementById('lista-accesos-red');

    if (!contenedorSsid || !contenedorAccesos) return;

    // 1. Renderizar Redes Wi-Fi (Hoja ssid)
    if (!Array.isArray(ssids) || ssids.length === 0) {
        contenedorSsid.innerHTML = `<p class="text-[11px] text-slate-500 italic text-center py-2 bg-slate-900/40 rounded-xl border border-slate-800">No hay redes Wi-Fi registradas.</p>`;
    } else {
        let htmlSsid = '';
        ssids.forEach(item => {
            // Buscar datos físicos del AP en la lista de equipos usando el hostname como FK
            const apInfo = nodosEquipos.find(n => String(n.hostname).trim().toLowerCase() === String(item.hostname).trim().toLowerCase()) || {};
            const rackAp = apInfo.rack || 'S/Rack';
            const swAp = apInfo.sw || 'S/Switch';
            const puertoAp = apInfo.puerto || 'S/P';

            htmlSsid += `
                <div class="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-md space-y-2 border-l-4 border-l-cyan-500">
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-bold text-slate-200 flex items-center space-x-2">
                            <i class="fas fa-wifi text-cyan-400"></i>
                            <span>${item.ssid}</span>
                        </span>
                        <span class="text-[10px] bg-cyan-950/50 text-cyan-300 px-2 py-0.5 rounded font-mono border border-cyan-500/30">${item.sector || 'General'}</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2 rounded-lg font-mono border border-slate-800/60">
                        <div>AP (Host): <span class="text-cyan-400 font-bold">${item.hostname}</span></div>
                        <div>IP Gestión: <span class="text-emerald-400 font-bold">${item.ip || 'S/IP'}</span></div>
                        <div class="col-span-2 text-[10px] text-slate-400">Ubicación Física: <span class="text-slate-300">Rack ${rackAp} | ${swAp} (${puertoAp})</span></div>
                    </div>

                    <div class="flex justify-between items-center pt-1">
                        <div class="text-[11px] font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300">
                            🔑 <span class="select-all">${item.pass || 'Sin Clave'}</span>
                        </div>
                        <button onclick="copiarAlPortapapeles('${item.pass || ''}')" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2.5 py-1 rounded-lg border border-slate-700 transition">
                            Copiar Clave 📋
                        </button>
                    </div>
                    ${item.observaciones ? `<p class="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/60">Note: ${item.observaciones}</p>` : ''}
                </div>
            `;
        });
        contenedorSsid.innerHTML = htmlSsid;
    }

    // 2. Renderizar Accesos de Red / Carpetas Compartidas (Hoja accesos)
    if (!Array.isArray(accesos) || accesos.length === 0) {
        contenedorAccesos.innerHTML = `<p class="text-[11px] text-slate-500 italic text-center py-2 bg-slate-900/40 rounded-xl border border-slate-800">No hay accesos de red registrados.</p>`;
    } else {
        let htmlAccesos = '';
        accesos.forEach(item => {
            htmlAccesos += `
                <div class="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-md space-y-2 border-l-4 border-l-blue-500">
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-bold text-slate-200 flex items-center space-x-2">
                            <i class="fas fa-user-shield text-blue-400"></i>
                            <span>Usuario: <strong class="text-blue-300 font-mono">${item.user}</strong></span>
                        </span>
                        <span class="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-800">RUT: ${item.rut}</span>
                    </div>

                    <div class="space-y-1">
                        <div class="text-[10px] text-slate-400">Carpetas Compartidas (SMB):</div>
                        <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-300 select-all flex justify-between items-center">
                            <span class="truncate pr-2">${item.carpeta_red || 'Sin carpetas asignadas'}</span>
                            <button onclick="copiarAlPortapapeles('${item.carpeta_red || ''}')" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded border border-slate-700 font-mono transition shrink-0">
                                Copiar Ruta 📋
                            </button>
                        </div>
                    </div>

                    <div class="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800/60 font-mono text-slate-400">
                        <div>Clave Red: <span class="text-amber-400 select-all">${item.pass || 'S/N'}</span></div>
                        ${item.observaciones ? `<div class="text-[10px] italic text-slate-500 truncate max-w-[150px]">${item.observaciones}</div>` : ''}
                    </div>
                </div>
            `;
        });
        contenedorAccesos.innerHTML = htmlAccesos;
    }
}

// Función auxiliar global para copiar al portapapeles desde terreno
function copiarAlPortapapeles(texto) {
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
        alert("¡Copiado al portapapeles con éxito!");
    }).catch(err => {
        console.error("Error al copiar: ", err);
    });
}

function poblarSelectoresDesdeBD() {
    const selectRack = document.getElementById('formRack');
    const selectPatchPanel = document.getElementById('selectPatchPanel');
    const selectTipo = document.getElementById('selectTipo');
    const selectMarca = document.getElementById('selectMarca');
    const selectCpu = document.getElementById('selectCpu');
    const selectRam = document.getElementById('selectRam');
    const selectTipoAlm = document.getElementById('selectTipoAlm');
    const selectCapAlm = document.getElementById('selectCapAlm');
    const selectSo = document.getElementById('selectSo');
    const selectOffice = document.getElementById('selectOffice');

    if (!selectTipo) return;

    const racksSet = new Set();
    const patchPanelsSet = new Set();
    const tiposSet = new Set();
    const marcasSet = new Set();
    const cpuSet = new Set();
    const ramSet = new Set();
    const almacenamientoSet = new Set();
    const capacidadSet = new Set();
    const soSet = new Set();
    const officeSet = new Set();

    const infoData = window.listaInfoMaestra || listaInfoMaestra;
    if (infoData && typeof infoData === 'object') {
        const volcarColumnaExacta = (keyProp, targetSet) => {
            for (const k in infoData) {
                const kClean = k.toLowerCase().trim();
                if (kClean === keyProp.toLowerCase() && Array.isArray(infoData[k])) {
                    infoData[k].forEach(val => {
                        const vStr = String(val).trim();
                        if (vStr && vStr !== '-' && vStr !== '""' && vStr !== "''") {
                            targetSet.add(vStr);
                        }
                    });
                }
            }
        };

        volcarColumnaExacta('tipo', tiposSet);
        volcarColumnaExacta('marca', marcasSet);
        volcarColumnaExacta('cpu', cpuSet);
        volcarColumnaExacta('ram', ramSet);
        volcarColumnaExacta('almacenamiento', almacenamientoSet);
        volcarColumnaExacta('capacidad', capacidadSet);
        volcarColumnaExacta('so', soSet);
        volcarColumnaExacta('office', officeSet);
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

    if (Array.isArray(window.listaInfraestructuraRed)) {
        window.listaInfraestructuraRed.forEach(item => {
            if (item.id_racks) {
                const rVal = String(item.id_racks).trim();
                if (rVal && rVal !== '-') racksSet.add(rVal);
            }
            if (item.patch_panel) {
                const pVal = String(item.patch_panel).trim();
                if (pVal && pVal !== '-') patchPanelsSet.add(pVal);
            }
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
    rellenarSelect(selectPatchPanel, patchPanelsSet, "Seleccione Patch Panel / Roseta...");
    rellenarSelect(selectTipo, tiposSet, "Seleccione tipo...");
    rellenarSelect(selectMarca, marcasSet, "Seleccione marca...");
    rellenarSelect(selectCpu, cpuSet, "Seleccione CPU...");
    rellenarSelect(selectRam, ramSet, "Seleccione RAM...");
    rellenarSelect(selectTipoAlm, almacenamientoSet, "Seleccione tipo almacenamiento...");
    rellenarSelect(selectCapAlm, capacidadSet, "Seleccione capacidad disco...");
    rellenarSelect(selectSo, soSet, "Seleccione SO...");
    rellenarSelect(selectOffice, officeSet, "Seleccione Office...");
}

function poblarPuertosSelect(puertoActualForzado = null) {
    const selectP = document.getElementById('selectPuerto');
    if (!selectP) return;

    selectP.innerHTML = '<option value="">Seleccione puerto...</option>';
    for (let i = 1; i <= 24; i++) {
        const pStr = "P" + (i < 10 ? "0" + i : i);
        const opt = document.createElement('option');
        opt.value = pStr;
        opt.textContent = `Puerto ${i < 10 ? '0' + i : i}`;
        selectP.appendChild(opt);
    }
    if (puertoActualForzado) selectP.value = puertoActualForzado;
}

function filtrarSwitchesPorRack(rackSeleccionadoForzado = null) {
    const selectRack = document.getElementById('formRack');
    const selectSwitch = document.getElementById('formSwitch');
    if (!selectRack || !selectSwitch) return;

    const rackActual = rackSeleccionadoForzado || selectRack.value;
    selectSwitch.innerHTML = '<option value="">Seleccione Switch...</option>';

    const switchesDelRack = new Set();

    if (Array.isArray(listaInfraestructuraRed)) {
        listaInfraestructuraRed.forEach(item => {
            if (item.id_racks && item.id_sw && String(item.id_racks).trim().toLowerCase() === rackActual.toLowerCase()) {
                const swVal = String(item.id_sw).trim();
                if (swVal && swVal !== '-') switchesDelRack.add(swVal);
            }
        });
    }

    if (switchesDelRack.size === 0 && rackActual) {
        switchesDelRack.add(`SW-${rackActual}-Principal`);
        switchesDelRack.add(`SW-${rackActual}-Secundario`);
    }

    switchesDelRack.forEach(swName => {
        const opt = document.createElement('option');
        opt.value = swName;
        opt.textContent = swName;
        selectSwitch.appendChild(opt);
    });

    if (typeof rackSeleccionadoForzado === 'string' && rackSeleccionadoForzado) {
        selectSwitch.value = rackSeleccionadoForzado;
    }
}

function toggleCamposDinamicos() {
    const tipoSelect = document.getElementById('selectTipo');
    const contenedorPC = document.getElementById('camposComputador');
    if (!tipoSelect || !contenedorPC) return;

    const valor = tipoSelect.value.toLowerCase();
    if (valor.includes('pc') || valor.includes('notebook') || valor.includes('computador')) {
        contenedorPC.classList.remove('hidden');
    } else {
        contenedorPC.classList.add('hidden');
        document.getElementById('selectCpu').value = '';
        document.getElementById('selectRam').value = '';
        document.getElementById('selectTipoAlm').value = '';
        document.getElementById('selectCapAlm').value = '';
        document.getElementById('selectSo').value = '';
        document.getElementById('selectOffice').value = '';
    }
}

function obtenerEstiloTipoDispositivo(tipoStr) {
    const t = (tipoStr || '').toLowerCase().trim();
    
    if (t.includes('notebook') || t.includes('laptop')) return { icono: '<i class="fas fa-laptop text-sky-400"></i>', borde: 'border-l-sky-500' };
    if (t.includes('pc') || t.includes('computador')) return { icono: '<i class="fas fa-desktop text-blue-400"></i>', borde: 'border-l-blue-500' };
    if (t.includes('impresora') || t.includes('printer')) return { icono: '<i class="fas fa-print text-amber-400"></i>', borde: 'border-l-amber-500' };
    if (t.includes('teléfono') || t.includes('telefono') || t.includes('ip phone')) return { icono: '<i class="fas fa-phone-alt text-teal-400"></i>', borde: 'border-l-teal-500' };
    if (t.includes('access point') || t.includes('ap') || t.includes('wifi')) return { icono: '<i class="fas fa-wifi text-cyan-400"></i>', borde: 'border-l-cyan-500' };
    if (t.includes('eq. médico') || t.includes('medico') || t.includes('clinico') || t.includes('médico')) return { icono: '<i class="fas fa-heartbeat text-rose-400"></i>', borde: 'border-l-rose-500' };
    if (t.includes('dispositivo red')) return { icono: '<i class="fas fa-ethernet text-indigo-400"></i>', borde: 'border-l-indigo-500' };
    if (t.includes('switch')) return { icono: '<i class="fas fa-network-wired text-emerald-400"></i>', borde: 'border-l-emerald-500' };
    if (t.includes('gateway') || t.includes('router')) return { icono: '<i class="fas fa-route text-orange-400"></i>', borde: 'border-l-orange-500' };
    if (t.includes('servidor') || t.includes('server')) return { icono: '<i class="fas fa-server text-purple-400"></i>', borde: 'border-l-purple-500' };
    if (t.includes('biometrico') || t.includes('biométrico') || t.includes('asistencia')) return { icono: '<i class="fas fa-fingerprint text-yellow-400"></i>', borde: 'border-l-yellow-500' };
    if (t.includes('pantalla') || t.includes('signage') || t.includes('carteleria') || t.includes('espera') || t.includes('tv')) return { icono: '<i class="fas fa-tv text-emerald-400"></i>', borde: 'border-l-emerald-500' };

    return { icono: '<i class="fas fa-cube text-slate-400"></i>', borde: 'border-l-slate-500' };
}

// ==========================================================================
// RENDERIZADO OPTIMIZADO Y AGRUPADO PARA CONSULTA DE EQUIPOS
// ==========================================================================
function renderizarResultadosRed(datos) {
    const contenedor = document.getElementById('resultadosRedContainer');
    if (!contenedor) return;

    if (!Array.isArray(datos) || datos.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800/80 space-y-2">
                <i class="fas fa-network-wired text-slate-600 text-2xl"></i>
                <p class="text-xs text-slate-400">No se encontraron dispositivos registrados.</p>
            </div>
        `;
        return;
    }

    // 1. Agrupar los equipos automáticamente por su tipo
    const gruposPorTipo = {};
    datos.forEach(nodo => {
        const tipoKey = (nodo.tipo || 'Otros Dispositivos').trim();
        if (!gruposPorTipo[tipoKey]) gruposPorTipo[tipoKey] = [];
        gruposPorTipo[tipoKey].push(nodo);
    });

    // Ordenar los grupos alfabéticamente
    const tiposOrdenados = Object.keys(gruposPorTipo).sort();

    let htmlGlobal = `
        <!-- Chips de Filtro Rápido por Categoría -->
        <div class="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
            <button type="button" onclick="filtrarPorChipRapido('todos')" class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg border border-slate-700 whitespace-nowrap transition font-medium">
                🌐 Todos (${datos.length})
            </button>
    `;

    tiposOrdenados.forEach(tipo => {
        htmlGlobal += `
            <button type="button" onclick="filtrarPorChipRapido('${tipo}')" class="bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-800 whitespace-nowrap transition">
                ${tipo} (${gruposPorTipo[tipo].length})
            </button>
        `;
    });
    htmlGlobal += `</div><div class="space-y-2.5 pt-1">`;

    // 2. Renderizar en formato de Acordeones desplegables por cada Tipo
    tiposOrdenados.forEach((tipo, index) => {
        const listaNodosTipo = gruposPorTipo[tipo];
        const estiloGrupo = obtenerEstiloTipoDispositivo(tipo);
        // Dejar abierto por defecto el primer grupo si son pocos resultados, cerrados los demás para ahorrar espacio
        const isOpen = datos.length <= 15 || index === 0 ? 'open' : '';

        htmlGlobal += `
            <details ${isOpen} class="group bg-slate-900/80 border border-slate-800 rounded-2xl shadow-md overflow-hidden transition">
                <summary class="flex justify-between items-center p-3 cursor-pointer select-none hover:bg-slate-800/40">
                    <div class="flex items-center space-x-2.5">
                        <div class="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
                            ${estiloGrupo.icono}
                        </div>
                        <div>
                            <h3 class="text-xs font-bold text-slate-200 tracking-wide">${tipo}</h3>
                            <p class="text-[10px] text-slate-400 font-mono">${listaNodosTipo.length} equipo(s) registrado(s)</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-[10px] bg-slate-950 text-cyan-400 px-2 py-0.5 rounded font-mono border border-slate-800">${listaNodosTipo.length}</span>
                        <i class="fas fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform"></i>
                    </div>
                </summary>
                
                <div class="p-3 pt-1 space-y-2 border-t border-slate-800/80 bg-slate-950/40">
        `;

        listaNodosTipo.forEach(nodo => {
            const item = {
                hostname: nodo.hostname || 'SIN-NOMBRE',
                ip: nodo.ip || 'S/IP',
                mac: nodo.mac || 'S/MAC',
                tipo: nodo.tipo || tipo,
                rack: nodo.rack || 'P1A',
                sw: nodo.sw || '',
                puerto: nodo.puerto || '',
                observaciones: nodo.observaciones || ''
            };

            htmlGlobal += `
                <div class="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-sm space-y-2 transition hover:border-slate-700">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="text-xs font-bold text-slate-100">${item.hostname}</h4>
                            <span class="text-[10px] text-blue-400 font-mono font-semibold">${item.ip}</span>
                        </div>
                        <span class="text-[9px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-800">Rack ${item.rack}</span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/60 p-2 rounded-lg font-mono border border-slate-800/60">
                        <div>Puerto: <span class="text-slate-300 font-bold">${item.puerto || 'S/P'}</span></div>
                        <div class="truncate">Switch: <span class="text-slate-300">${item.sw || 'N/A'}</span></div>
                    </div>

                    <div class="flex justify-end space-x-2 pt-0.5">
                        <button type="button" onclick='verDetallesObjeto(${JSON.stringify(nodo).replace(/'/g, "&#39;")})' class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium px-2.5 py-1 rounded-lg border border-slate-700 transition flex items-center space-x-1">
                            <i class="fas fa-eye text-blue-400"></i>
                            <span>Ver</span>
                        </button>
                        <button type="button" onclick='cargarParaEditarObjeto(${JSON.stringify(nodo).replace(/'/g, "&#39;")})' class="bg-slate-800 hover:bg-slate-700 text-blue-400 text-[10px] font-medium px-2.5 py-1 rounded-lg border border-slate-700 transition flex items-center space-x-1">
                            <i class="fas fa-edit"></i>
                            <span>Editar</span>
                        </button>
                    </div>
                </div>
            `;
        });

        htmlGlobal += `</div></details>`;
    });

    htmlGlobal += `</div>`;
    contenedor.innerHTML = htmlGlobal;
}

// Función auxiliar para los botones de chips rápidos superior
function filtrarPorChipRapido(categoria) {
    const inputBusqueda = document.getElementById('globalSearch');
    if (!inputBusqueda) return;

    if (categoria === 'todos') {
        inputBusqueda.value = '';
        renderizarResultadosRed(window.listaNodosRed);
    } else {
        inputBusqueda.value = categoria;
        const filtrados = window.listaNodosRed.filter(n => (n.tipo || '').trim().toLowerCase() === categoria.toLowerCase());
        renderizarResultadosRed(filtrados);
    }
}

function renderizarVistaRacks(datos) {
    const contenedorRacks = document.getElementById('view-racks');
    if (!contenedorRacks) return;

    const estructuraOficialRacks = [
        { piso: "Primer Piso", racks: ["P1A", "P1B", "P1C"] },
        { piso: "Segundo Piso", racks: ["P2A", "P2B", "P2C"] }
    ];

    const racksAgrupados = {};
    if (Array.isArray(datos)) {
        datos.forEach(nodo => {
            const rackKey = (nodo.rack || 'P1A').toString().trim().toUpperCase();
            if (!racksAgrupados[rackKey]) racksAgrupados[rackKey] = [];
            racksAgrupados[rackKey].push(nodo);
        });
    }

    let htmlRacksGlobal = `
        <div class="space-y-4">
            <div class="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex justify-between items-center shadow-lg">
                <div>
                    <h2 class="text-xs font-bold uppercase tracking-wider text-blue-400">Estado de Gabinetes</h2>
                    <p class="text-[10px] text-slate-400">Infraestructura LAN - Lanco</p>
                </div>
                <span class="text-xs font-mono bg-slate-950 text-slate-200 px-2.5 py-1 rounded-xl border border-slate-800">${Array.isArray(datos) ? datos.length : 0} Activos</span>
            </div>
    `;

    estructuraOficialRacks.forEach(nivel => {
        htmlRacksGlobal += `
            <div class="space-y-2.5 pt-1">
                <h3 class="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1 border-l-2 border-blue-500 pl-2">${nivel.piso}</h3>
        `;

        nivel.racks.forEach(nombreRack => {
            const rackUpper = nombreRack.toUpperCase();
            const elementosRack = racksAgrupados[rackUpper] || [];
            
            const infraestructura = [];
            const usuariosFisicos = [];
            const inalambricos = [];

            elementosRack.forEach(el => {
                const tipoStr = (el.tipo || '').toLowerCase();
                const puertoVal = (el.puerto || '').toLowerCase();
                
                const esInfraRed = tipoStr.includes('switch') || tipoStr.includes('router') || tipoStr.includes('gateway') || tipoStr.includes('fibra') || tipoStr.includes('access point') || tipoStr.includes('ap');
                const esInalambricoWifi = puertoVal.includes('wifi') || puertoVal.includes('s/p') || puertoVal === '' || tipoStr.includes('biometrico') || tipoStr.includes('biométrico');

                if (esInfraRed) {
                    infraestructura.push(el);
                } else if (esInalambricoWifi) {
                    inalambricos.push(el);
                } else {
                    usuariosFisicos.push(el);
                }
            });

            const elemsSwitchA = usuariosFisicos.filter(el => !((el.sw || '').toLowerCase().includes('b') || (el.sw || '').toLowerCase().includes('2')));
            const elemsSwitchB = usuariosFisicos.filter(el => (el.sw || '').toLowerCase().includes('b') || (el.sw || '').toLowerCase().includes('2'));

            const porcA = Math.min(Math.round((elemsSwitchA.length / 24) * 100), 100);
            const porcB = Math.min(Math.round((elemsSwitchB.length / 24) * 100), 100);
            const ocupacionTotalPorcentaje = Math.min(Math.round((usuariosFisicos.length / 48) * 100), 100);

            let colorBadge = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            if (ocupacionTotalPorcentaje > 75) colorBadge = "text-red-400 bg-red-500/10 border-red-500/20";
            else if (ocupacionTotalPorcentaje > 40) colorBadge = "text-amber-400 bg-amber-500/10 border-amber-500/20";

            let htmlInfraestructura = '';
            if (infraestructura.length > 0) {
                htmlInfraestructura += `<div class="mb-2.5 pb-2 border-b border-slate-800 space-y-1.5"><div class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">⚡ Electrónica y Red</div>`;
                infraestructura.forEach(inf => {
                    const estiloInfra = obtenerEstiloTipoDispositivo(inf.tipo);
                    htmlInfraestructura += `
                        <div class="flex justify-between items-center text-xs bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20 shadow-inner">
                            <div>
                                <span class="font-bold text-emerald-300">${estiloInfra.icono} <span class="ml-1">${inf.hostname}</span></span>
                                <span class="text-[10px] text-slate-400 font-mono ml-2">[${inf.ip || 'S/IP'}]</span>
                            </div>
                            <span class="text-[10px] bg-slate-900 text-emerald-400 px-2 py-0.5 rounded-lg font-mono border border-emerald-500/30">${inf.tipo}</span>
                        </div>
                    `;
                });
                htmlInfraestructura += `</div>`;
            }

            let htmlUsuariosFisicos = '';
            if (usuariosFisicos.length > 0) {
                htmlUsuariosFisicos += `<div class="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">💻 Dispositivos Cableados</div>`;
                usuariosFisicos.forEach(el => {
                    const estiloUsr = obtenerEstiloTipoDispositivo(el.tipo);
                    htmlUsuariosFisicos += `
                        <div class="flex justify-between items-center text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60 shadow-sm mb-1.5">
                            <div>
                                <span class="font-bold text-slate-200">${estiloUsr.icono} <span class="ml-1">${el.hostname || 'Equipo'}</span></span>
                                <span class="text-[10px] text-blue-400 font-mono ml-2">[${el.ip || 'S/IP'}]</span>
                                <div class="text-[10px] text-slate-400 mt-0.5">Switch: <span class="text-slate-300">${el.sw || 'Switch'}</span> (${el.puerto || 'P00'})</div>
                            </div>
                            <span class="text-[10px] bg-slate-900 text-slate-300 px-2 py-1 rounded-lg font-mono border border-slate-700">${el.patch_panel || 'D00'}</span>
                        </div>
                    `;
                });
            }

            let htmlInalambricos = '';
            if (inalambricos.length > 0) {
                htmlInalambricos += `<div class="text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-3 mb-2">📶 Inalámbricos / Biométricos</div>`;
                inalambricos.forEach(el => {
                    const estiloInal = obtenerEstiloTipoDispositivo(el.tipo);
                    htmlInalambricos += `
                        <div class="flex justify-between items-center text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60 shadow-sm mb-1.5">
                            <div>
                                <span class="font-bold text-slate-200">${estiloInal.icono} <span class="ml-1">${el.hostname || 'Equipo'}</span></span>
                                <span class="text-[10px] text-amber-400 font-mono ml-2">[${el.ip || 'S/IP'}]</span>
                                <div class="text-[10px] text-slate-400 mt-0.5">Tipo: <span class="text-slate-300">${el.tipo}</span></div>
                            </div>
                            <span class="text-[10px] bg-slate-900 text-amber-300 px-2 py-1 rounded-lg font-mono border border-amber-500/30">Wi-Fi</span>
                        </div>
                    `;
                });
            }

            if (usuariosFisicos.length === 0 && inalambricos.length === 0 && infraestructura.length === 0) {
                htmlUsuariosFisicos = `<p class="text-[11px] text-slate-500 italic text-center py-3 bg-slate-950/30 rounded-xl border border-slate-900">Sin dispositivos registrados en este rack.</p>`;
            }

            htmlRacksGlobal += `
                <details class="group bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition">
                    <summary class="flex flex-col p-3.5 cursor-pointer select-none hover:bg-slate-800/50 space-y-2.5">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center space-x-2.5">
                                <div class="w-2.5 h-2.5 rounded-full bg-blue-500 group-open:bg-emerald-400 transition shadow-sm"></div>
                                <h4 class="text-xs font-bold text-slate-100 tracking-wide">Rack ${nombreRack}</h4>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="text-[10px] px-2 py-0.5 rounded-lg font-semibold border ${colorBadge}">${usuariosFisicos.length}/48 puertos (${ocupacionTotalPorcentaje}%)</span>
                                <i class="fas fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform"></i>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 pt-1">
                            <div class="space-y-1 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60">
                                <div class="flex justify-between text-[9px] text-slate-400 font-mono">
                                    <span>Switch A</span>
                                    <span class="text-blue-400 font-bold">${elemsSwitchA.length}/24</span>
                                </div>
                                <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                    <div class="bg-blue-500 h-full rounded-full transition-all" style="width: ${porcA}%"></div>
                                </div>
                            </div>
                            <div class="space-y-1 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60">
                                <div class="flex justify-between text-[9px] text-slate-400 font-mono">
                                    <span>Switch B</span>
                                    <span class="text-indigo-400 font-bold">${elemsSwitchB.length}/24</span>
                                </div>
                                <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                    <div class="bg-indigo-500 h-full rounded-full transition-all" style="width: ${porcB}%"></div>
                                </div>
                            </div>
                        </div>
                    </summary>
                    <div class="p-3 pt-1 space-y-2.5 border-t border-slate-800/80 bg-slate-950/40">
                        ${htmlInfraestructura}
                        ${htmlUsuariosFisicos}
                        ${htmlInalambricos}
                    </div>
                </details>
            `;
        });

        htmlRacksGlobal += `</div>`;
    });

    htmlRacksGlobal += `</div>`;
    contenedorRacks.innerHTML = htmlRacksGlobal;
}

function switchView(viewName, btnElement) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    const targetView = document.getElementById('view-' + viewName);
    if (targetView) targetView.classList.remove('hidden');

    const titles = { dashboard: 'Panel de Control', consultar: 'Módulo de Consulta', registrar: 'Gestión de Activos / Edición', racks: 'Estado de Racks', redes: 'Wi-Fi & Accesos de Red' };
    const subtitleEl = document.getElementById('header-subtitle');
    if (subtitleEl) subtitleEl.innerText = titles[viewName] || 'Panel de Control';

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.className = "nav-btn flex flex-col items-center text-slate-400 hover:text-slate-200 transition";
    });
    if (btnElement) btnElement.className = "nav-btn flex flex-col items-center text-blue-400 transition";

    if (viewName !== 'registrar') {
        const formEl = document.getElementById('activoForm');
        if (formEl) formEl.reset();
        puertoEnEdicionActual = null;
        const badge = document.getElementById('edit-badge');
        if (badge) badge.classList.add('hidden');
        if (typeof toggleCamposDinamicos === 'function') toggleCamposDinamicos();
    }
}

function cargarParaEditarObjeto(nodo) {
    if (!nodo) return;

    document.getElementById('inputHostname').value = nodo.hostname || '';
    document.getElementById('inputIp').value = nodo.ip || '';
    document.getElementById('inputMac').value = nodo.mac || '';
    document.getElementById('inputObservaciones').value = nodo.observaciones || '';
    
    const rackVal = (nodo.rack || 'P1A').toString().trim();
    const selectRackEl = document.getElementById('formRack');
    if (selectRackEl) {
        selectRackEl.value = rackVal;
        filtrarSwitchesPorRack(rackVal);
    }
    
    setTimeout(() => {
        const selectSwitchEl = document.getElementById('formSwitch');
        if (selectSwitchEl) selectSwitchEl.value = nodo.sw || '';
    }, 120);
    
    document.getElementById('selectPatchPanel').value = nodo.patch_panel || '';
    document.getElementById('selectTipo').value = nodo.tipo || '';
    document.getElementById('selectMarca').value = nodo.marca || '';

    toggleCamposDinamicos();

    function seleccionarOInyectar(elementId, valorBuscado) {
        const el = document.getElementById(elementId);
        if (!el || !valorBuscado) return;
        
        let encontrada = false;
        const valStr = String(valorBuscado).trim().toLowerCase();
        for (let i = 0; i < el.options.length; i++) {
            if (el.options[i].value.trim().toLowerCase() === valStr) {
                el.value = el.options[i].value;
                encontrada = true;
                break;
            }
        }
        if (!encontrada) {
            const opt = document.createElement('option');
            opt.value = valorBuscado;
            opt.textContent = valorBuscado;
            el.appendChild(opt);
            el.value = valorBuscado;
        }
    }

    seleccionarOInyectar('selectCpu', nodo.cpu);
    seleccionarOInyectar('selectRam', nodo.ram);
    seleccionarOInyectar('selectCapAlm', nodo.almacenamiento);
    seleccionarOInyectar('selectSo', nodo.so);
    seleccionarOInyectar('selectOffice', nodo.office);

    puertoEnEdicionActual = nodo.puerto || '';
    poblarPuertosSelect(puertoEnEdicionActual);

    document.getElementById('edit-badge').classList.remove('hidden');
    
    const registrarBtn = document.querySelectorAll('.nav-btn')[2];
    switchView('registrar', registrarBtn);
}

async function guardarActivoMovil() {
    const hostname = document.getElementById('inputHostname').value.trim();
    const ip = document.getElementById('inputIp').value.trim();
    const mac = document.getElementById('inputMac').value.trim();
    const puerto = document.getElementById('selectPuerto').value;
    const patchPanel = document.getElementById('selectPatchPanel').value;
    const rack = document.getElementById('formRack').value;
    const switchVal = document.getElementById('formSwitch').value;
    const tipo = document.getElementById('selectTipo').value;
    const marca = document.getElementById('selectMarca').value;
    const cpu = document.getElementById('selectCpu').value;
    const ram = document.getElementById('selectRam').value;
    const tipoAlm = document.getElementById('selectTipoAlm').value;
    const capAlm = document.getElementById('selectCapAlm').value;
    const almacenamientoFinal = tipoAlm && capAlm ? `${tipoAlm} ${capAlm}` : (capAlm || tipoAlm);
    const so = document.getElementById('selectSo').value;
    const office = document.getElementById('selectOffice').value;
    const observaciones = document.getElementById('inputObservaciones').value.trim();

    if (!hostname || !ip) {
        alert("Por favor completa al menos el Hostname y la IP.");
        return;
    }

    const payload = {
        action: 'guardar_equipo',
        equipo: {
            hostname, ip, mac, tipo, marca, modelo: "", propiedad: "Hospital",
            rack, sw: switchVal, puerto, patch_panel: patchPanel,
            cpu, ram, almacenamiento: almacenamientoFinal, so, office, observaciones
        }
    };

    try {
        const resultado = await enviarDatosCloud(payload);
        const fueExitoso = resultado === true || (resultado && resultado.status === "success");

        if (fueExitoso || resultado) {
            alert("¡Registro guardado con éxito en Google Sheets!");
            cancelarEdicion(); 

            const respuestaCloud = await cargarDatosCloud('equipos', 'hfc_lan_master_cache');
            if (respuestaCloud) {
                listaNodosRed = Array.isArray(respuestaCloud.equipos) ? respuestaCloud.equipos : [];
                listaSsidRed = Array.isArray(respuestaCloud.ssid) ? respuestaCloud.ssid : [];
                listaAccesosRed = Array.isArray(respuestaCloud.accesos) ? respuestaCloud.accesos : [];

                renderizarResultadosRed(listaNodosRed);
                renderizarVistaRacks(listaNodosRed);
                renderizarVistaRedesYAccesos(listaSsidRed, listaAccesosRed, listaNodosRed);
                renderizarPanelEstadisticas(listaNodosRed);
            }
        } else {
            alert("El servidor indicó un problema al guardar, pero revisa tu Google Sheets por si acaso.");
            cancelarEdicion();
        }
    } catch (err) {
        console.error("Error al guardar:", err);
        alert("Error de comunicación al intentar guardar.");
    }
}

function cancelarEdicion() {
    const formEl = document.getElementById('activoForm');
    if (formEl) formEl.reset();
    
    puertoEnEdicionActual = null;
    
    const badge = document.getElementById('edit-badge');
    if (badge) badge.classList.add('hidden');
    
    if (typeof toggleCamposDinamicos === 'function') toggleCamposDinamicos();
    if (typeof poblarPuertosSelect === 'function') poblarPuertosSelect();
    
    const selectSwitch = document.getElementById('formSwitch');
    if (selectSwitch) selectSwitch.innerHTML = '<option value="">Seleccione Switch...</option>';

    const buscarBtn = document.querySelectorAll('.nav-btn')[1];
    switchView('consultar', buscarBtn);
}

function verDetallesObjeto(nodo) {
    if (!nodo) return;

    const tipoStr = (nodo.tipo || 'Dispositivo').trim();
    const esComputador = tipoStr.toLowerCase().includes('pc') || tipoStr.toLowerCase().includes('notebook') || tipoStr.toLowerCase().includes('computador');

    document.getElementById('det-hostname').textContent = nodo.hostname || 'SIN-NOMBRE';
    document.getElementById('det-tipo-badge').textContent = tipoStr;
    document.getElementById('det-rack').textContent = nodo.rack || '-';
    document.getElementById('det-sw').textContent = nodo.sw || '-';
    document.getElementById('det-puerto').textContent = nodo.puerto || '-';
    document.getElementById('det-patch').textContent = nodo.patch_panel || '-';
    document.getElementById('det-ip').textContent = nodo.ip || '-';
    document.getElementById('det-mac').textContent = nodo.mac || '-';
    document.getElementById('det-marca').textContent = nodo.marca || '-';
    document.getElementById('det-obs').textContent = nodo.observaciones || 'Sin observaciones registradas.';

    document.getElementById('det-cpu').textContent = nodo.cpu || '-';
    document.getElementById('det-ram').textContent = nodo.ram || '-';
    document.getElementById('det-alm').textContent = nodo.almacenamiento || '-';
    document.getElementById('det-so').textContent = nodo.so || '-';
    document.getElementById('det-office').textContent = nodo.office || '-';

    const seccionHardware = document.getElementById('det-seccion-hardware') || document.getElementById('det-cpu').closest('.space-y-2');
    if (seccionHardware) seccionHardware.style.display = esComputador ? 'block' : 'none';

    const btnEditar = document.getElementById('btn-pasar-editar');
    if (btnEditar) btnEditar.onclick = () => cargarParaEditarObjeto(nodo);

    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    const targetView = document.getElementById('view-detalles');
    if (targetView) targetView.classList.remove('hidden');

    const subtitleEl = document.getElementById('header-subtitle');
    if (subtitleEl) subtitleEl.innerText = 'Detalles del Activo';
}

function renderizarPanelEstadisticas(nodos) {
    const contenedor = document.getElementById('panelEstadisticasRed');
    if (!contenedor) return;

    if (!Array.isArray(nodos) || nodos.length === 0) {
        contenedor.innerHTML = '<p class="text-xs text-slate-500 text-center py-2">No hay equipos registrados.</p>';
        return;
    }

    const tiposCount = {};
    nodos.forEach(n => {
        const tipo = (n.tipo || 'Sin Tipo').trim();
        tiposCount[tipo] = (tiposCount[tipo] || 0) + 1;
    });

    const tiposOrdenados = Object.keys(tiposCount).sort((a, b) => tiposCount[b] - tiposCount[a]);

    let html = `
        <div class="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-blue-400">📊 Parque Informático</h3>
            <span class="text-[10px] font-mono bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">${nodos.length} Totales</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
    `;

    tiposOrdenados.forEach(tipo => {
        const total = tiposCount[tipo];
        const estilo = obtenerEstiloTipoDispositivo(tipo);

        html += `
            <button type="button" onclick="filtrarPorTipoEstadistica('${tipo}')" class="bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-left transition flex items-center justify-between group shadow-sm">
                <div class="flex items-center space-x-2 truncate">
                    <div class="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0">
                        ${estilo.icono}
                    </div>
                    <div class="truncate">
                        <div class="text-[11px] font-medium text-slate-200 group-hover:text-blue-400 truncate transition">${tipo}</div>
                        <div class="text-[9px] text-slate-400 font-mono">Activos</div>
                    </div>
                </div>
                <span class="text-xs font-bold text-slate-100 font-mono bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 shrink-0 ml-1">${total}</span>
            </button>
        `;
    });

    html += `</div>`;
    contenedor.innerHTML = html;
}

function filtrarPorTipoEstadistica(tipoBuscado) {
    const consultarBtn = document.querySelectorAll('.nav-btn')[1];
    switchView('consultar', consultarBtn);

    const inputBusqueda = document.getElementById('globalSearch');
    if (inputBusqueda) {
        inputBusqueda.value = tipoBuscado;
        inputBusqueda.dispatchEvent(new Event('input'));
    }
}

function cambiarSubTabRedes(tipo) {
    const btnSsid = document.getElementById('subtab-btn-ssid');
    const btnAccesos = document.getElementById('subtab-btn-accesos');
    const viewSsid = document.getElementById('subview-ssid');
    const viewAccesos = document.getElementById('subview-accesos');

    if (tipo === 'ssid') {
        btnSsid.className = "py-2 text-xs font-bold rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 transition flex items-center justify-center space-x-1.5";
        btnAccesos.className = "py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 transition flex items-center justify-center space-x-1.5";
        viewSsid.classList.remove('hidden');
        viewAccesos.classList.add('hidden');
    } else {
        btnAccesos.className = "py-2 text-xs font-bold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 transition flex items-center justify-center space-x-1.5";
        btnSsid.className = "py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 transition flex items-center justify-center space-x-1.5";
        viewAccesos.classList.remove('hidden');
        viewSsid.classList.add('hidden');
    }
}