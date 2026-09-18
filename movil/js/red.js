/**
 * ==========================================
 * CONTROLADOR DE RED - VERSIÓN MÓVIL (HFCL)
 * ==========================================
 * Ubicación: movil/js/red.js
 * Fuente de verdad estricta: Google Sheets (code.gs)
 */

let listaNodosRed = [];
let listaInfraestructuraRed = [];
let listaInfoMaestra = {};
let puertoEnEdicionActual = null;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("[NOC] Inicializando entorno móvil Hospital de Lanco...");

    // 1. CARGA INSTANTÁNEA DESDE CACHÉ LOCAL
    const cacheEmergencia = localStorage.getItem('hfc_lan_master_cache');
    if (cacheEmergencia) {
        try {
            const datosCache = JSON.parse(cacheEmergencia);
            console.log("[NOC] Pintando interfaz preliminar con caché local...");
            finalizarCargaSegura(datosCache.equipos || [], datosCache.red || [], datosCache.info || null, false);
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

        if (respuestaCloud) {
            nodos = Array.isArray(respuestaCloud.equipos) ? respuestaCloud.equipos : (Array.isArray(respuestaCloud) ? respuestaCloud : []);
            infra = Array.isArray(respuestaCloud.red) ? respuestaCloud.red : [];
            if (respuestaCloud.info) info = respuestaCloud.info;
        }

        console.log(`[NOC] Sincronización exitosa. Total nodos: ${nodos.length}, Infra: ${infra.length}`);
        
        // 3. RENDERIZADO DEFINITIVO Y CIERRE DE LOADER
        finalizarCargaSegura(nodos, infra, info, true);

    } catch (err) {
        console.error("[NOC] Error de comunicación cloud:", err);
        destruirLoaderDefinitivo();
    }
});

function finalizarCargaSegura(nodos, infra = [], info = null, apagarLoader = true) {
    window.listaNodosRed = nodos;
    window.listaInfraestructuraRed = infra;
    if (info) window.listaInfoMaestra = info;

    ejecutarSeguro(() => poblarSelectoresDesdeBD(), "poblarSelectoresDesdeBD");
    ejecutarSeguro(() => renderizarResultadosRed(window.listaNodosRed), "renderizarResultadosRed");
    ejecutarSeguro(() => renderizarVistaRacks(window.listaNodosRed), "renderizarVistaRacks");
    
    ejecutarSeguro(() => {
        const kpiTotal = document.getElementById('kpi-total-equipos');
        if (kpiTotal) kpiTotal.textContent = window.listaNodosRed.length;
    }, "KPI Total");

    configurarBuscadorGlobalOnce();

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

/**
 * Poblado estricto de selectores filtrando guiones (-) y vacíos desde la hoja 'info'
 */
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

    // 1. Extracción estricta y limpia basada en las claves exactas de la hoja 'info' (code.gs)
    const infoData = window.listaInfoMaestra || listaInfoMaestra;
    if (infoData && typeof infoData === 'object') {
        const volcarColumnaExacta = (keyProp, targetSet) => {
            // Buscamos coincidencia exacta o normalizada de la cabecera
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

    // 2. Respaldo complementario desde los nodos ya registrados en la hoja 'equipos'
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

    // 3. Infraestructura física de la hoja 'red'
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

    let html = '';
    datos.forEach(nodo => {
        const item = {
            hostname: nodo.hostname || 'SIN-NOMBRE',
            ip: nodo.ip || 'S/IP',
            mac: nodo.mac || 'S/MAC',
            tipo: nodo.tipo || 'PC / Notebook',
            marca: nodo.marca || '',
            rack: nodo.rack || 'P1A',
            sw: nodo.sw || '',
            puerto: nodo.puerto || '',
            observaciones: nodo.observaciones || ''
        };

        let iconoHtml = '<i class="fas fa-desktop text-blue-400"></i>';
        let bordeColor = 'border-l-blue-500';
        
        const tipoLower = item.tipo.toLowerCase();
        if (tipoLower.includes('impresora') || tipoLower.includes('printer')) {
            iconoHtml = '<i class="fas fa-print text-amber-400"></i>';
            bordeColor = 'border-l-amber-500';
        } else if (tipoLower.includes('switch') || tipoLower.includes('router') || tipoLower.includes('ap')) {
            iconoHtml = '<i class="fas fa-network-wired text-emerald-400"></i>';
            bordeColor = 'border-l-emerald-500';
        } else if (tipoLower.includes('servidor') || tipoLower.includes('server')) {
            iconoHtml = '<i class="fas fa-server text-purple-400"></i>';
            bordeColor = 'border-l-purple-500';
        } else if (tipoLower.includes('notebook') || tipoLower.includes('laptop')) {
            iconoHtml = '<i class="fas fa-laptop text-sky-400"></i>';
            bordeColor = 'border-l-sky-500';
        }

        html += `
            <div class="bg-slate-900/90 border border-slate-800 border-l-4 ${bordeColor} p-3.5 rounded-xl shadow-lg space-y-2.5 transition hover:border-slate-700">
                <div class="flex justify-between items-start">
                    <div class="flex items-center space-x-2.5">
                        <div class="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
                            ${iconoHtml}
                        </div>
                        <div>
                            <h3 class="text-xs font-bold text-slate-100 tracking-wide">${item.hostname}</h3>
                            <span class="text-[10px] text-blue-400 font-mono font-semibold">${item.ip}</span>
                        </div>
                    </div>
                    <span class="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-800">${item.tipo}</span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 font-mono">
                    <div>Rack: <span class="text-slate-300 font-bold">${item.rack}</span></div>
                    <div>Puerto: <span class="text-slate-300 font-bold">${item.puerto || 'S/P'}</span></div>
                    <div class="col-span-2 text-[10px] text-slate-400 truncate">Switch: <span class="text-slate-300">${item.sw || 'No asignado'}</span></div>
                </div>

                <div class="flex justify-end space-x-2 pt-1">
                    <button type="button" onclick='verDetallesObjeto(${JSON.stringify(nodo).replace(/'/g, "&#39;")})' class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center space-x-1.5">
                        <i class="fas fa-eye text-blue-400"></i>
                        <span>Ver Detalles</span>
                    </button>
                    <button type="button" onclick='cargarParaEditarObjeto(${JSON.stringify(nodo).replace(/'/g, "&#39;")})' class="bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center space-x-1.5">
                        <i class="fas fa-edit"></i>
                        <span>Editar</span>
                    </button>
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
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
            <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex justify-between items-center shadow-md">
                <div>
                    <h2 class="text-xs font-bold uppercase tracking-wider text-blue-400">Estado de Racks / Gabinetes</h2>
                    <p class="text-[11px] text-slate-400">Infraestructura LAN - Hospital de Lanco</p>
                </div>
                <span class="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">${Array.isArray(datos) ? datos.length : 0} Activos</span>
            </div>
    `;

    estructuraOficialRacks.forEach(nivel => {
        htmlRacksGlobal += `
            <div class="space-y-2.5 pt-2">
                <h3 class="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1 border-l-2 border-blue-500 pl-2">${nivel.piso}</h3>
        `;

        nivel.racks.forEach(nombreRack => {
            const elementos = racksAgrupados[nombreRack] || [];
            
            const elemsSwitchA = elementos.filter(el => {
                const sw = (el.sw || '').toLowerCase();
                return !sw.includes('b') && !sw.includes('2');
            });
            
            const elemsSwitchB = elementos.filter(el => {
                const sw = (el.sw || '').toLowerCase();
                return sw.includes('b') || sw.includes('2');
            });

            const capSwitch = 24;
            const porcA = Math.min(Math.round((elemsSwitchA.length / capSwitch) * 100), 100);
            const porcB = Math.min(Math.round((elemsSwitchB.length / capSwitch) * 100), 100);
            const ocupacionTotalPorcentaje = Math.min(Math.round((elementos.length / 48) * 100), 100);

            let colorBadge = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            if (ocupacionTotalPorcentaje > 75) {
                colorBadge = "text-red-400 bg-red-500/10 border-red-500/20";
            } else if (ocupacionTotalPorcentaje > 40) {
                colorBadge = "text-amber-400 bg-amber-500/10 border-amber-500/20";
            }

            let htmlElementos = '';
            if (elementos.length > 0) {
                elementos.forEach(el => {
                    const hName = el.hostname || 'Equipo';
                    const ipVal = el.ip || 'S/IP';
                    const swVal = el.sw || 'Switch';
                    const portVal = el.puerto || 'P00';
                    const patchVal = el.patch_panel || 'D00';
                    
                    htmlElementos += `
                        <div class="flex justify-between items-center text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60">
                            <div>
                                <span class="font-bold text-slate-200">${hName}</span>
                                <span class="text-[10px] text-blue-400 font-mono ml-2">[${ipVal}]</span>
                                <div class="text-[10px] text-slate-400 mt-0.5">Switch: <span class="text-slate-300">${swVal}</span> (${portVal})</div>
                            </div>
                            <span class="text-[10px] bg-slate-900 text-slate-300 px-2 py-1 rounded font-mono border border-slate-700">${patchVal}</span>
                        </div>
                    `;
                });
            } else {
                htmlElementos = `
                    <p class="text-[11px] text-slate-500 italic text-center py-3 bg-slate-950/30 rounded-xl border border-slate-900">
                        Sin dispositivos registrados en este rack.
                    </p>
                `;
            }

            htmlRacksGlobal += `
                <details class="group bg-slate-900/60 border border-slate-800 rounded-2xl shadow-lg overflow-hidden transition">
                    <summary class="flex flex-col p-3.5 cursor-pointer select-none hover:bg-slate-800/40 space-y-2.5">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center space-x-2.5">
                                <div class="w-2 h-2 rounded-full bg-blue-400 group-open:bg-emerald-400 transition"></div>
                                <h4 class="text-xs font-bold text-slate-200 tracking-wide">Rack ${nombreRack}</h4>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="text-[10px] px-2 py-0.5 rounded font-semibold border ${colorBadge}">${elementos.length}/48 puertos (${ocupacionTotalPorcentaje}%)</span>
                                <i class="fas fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform"></i>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 pt-1">
                            <div class="space-y-1">
                                <div class="flex justify-between text-[9px] text-slate-400 font-mono">
                                    <span>Switch A (24p)</span>
                                    <span>${elemsSwitchA.length}/24</span>
                                </div>
                                <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                    <div class="bg-blue-500 h-full rounded-full" style="width: ${porcA}%"></div>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <div class="flex justify-between text-[9px] text-slate-400 font-mono">
                                    <span>Switch B (24p)</span>
                                    <span>${elemsSwitchB.length}/24</span>
                                </div>
                                <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                    <div class="bg-indigo-500 h-full rounded-full" style="width: ${porcB}%"></div>
                                </div>
                            </div>
                        </div>
                    </summary>
                    <div class="p-3.5 pt-0 space-y-2 border-t border-slate-800/60 bg-slate-950/30">
                        ${htmlElementos}
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

    const titles = { dashboard: 'Panel de Control', consultar: 'Módulo de Consulta', registrar: 'Gestión de Activos / Edición', racks: 'Estado de Racks' };
    const subtitleEl = document.getElementById('header-subtitle');
    if (subtitleEl) subtitleEl.innerText = titles[viewName];

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
        if (selectSwitchEl) {
            selectSwitchEl.value = nodo.sw || '';
        }
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

    const puertoVal = nodo.puerto || '';
    puertoEnEdicionActual = puertoVal;
    poblarPuertosSelect(puertoVal);

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
            hostname: hostname,
            ip: ip,
            mac: mac,
            tipo: tipo,
            marca: marca,
            modelo: "",
            propiedad: "Hospital",
            rack: rack,
            sw: switchVal,
            puerto: puerto,
            patch_panel: patchPanel,
            cpu: cpu,
            ram: ram,
            almacenamiento: almacenamientoFinal,
            so: so,
            office: office,
            observaciones: observaciones
        }
    };

    try {
        const resultado = await enviarDatosCloud(payload);
        const fueExitoso = resultado === true || 
                           (resultado && resultado.status === "success") || 
                           (typeof resultado === "string" && resultado.includes("success"));

        if (fueExitoso || resultado) {
            alert("¡Registro guardado con éxito en Google Sheets!");
            cancelarEdicion(); 

            const respuestaCloud = await cargarDatosCloud('equipos', 'hfc_lan_master_cache');
            if (respuestaCloud) {
                listaNodosRed = Array.isArray(respuestaCloud.equipos) ? respuestaCloud.equipos : (Array.isArray(respuestaCloud) ? respuestaCloud : []);
                renderizarResultadosRed(listaNodosRed);
                renderizarVistaRacks(listaNodosRed);
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

    document.getElementById('det-hostname').textContent = nodo.hostname || 'SIN-NOMBRE';
    document.getElementById('det-tipo-badge').textContent = nodo.tipo || 'Dispositivo';
    document.getElementById('det-rack').textContent = nodo.rack || '-';
    document.getElementById('det-sw').textContent = nodo.sw || '-';
    document.getElementById('det-puerto').textContent = nodo.puerto || '-';
    document.getElementById('det-patch').textContent = nodo.patch_panel || '-';
    document.getElementById('det-ip').textContent = nodo.ip || '-';
    document.getElementById('det-mac').textContent = nodo.mac || '-';
    document.getElementById('det-marca').textContent = nodo.marca || '-';
    document.getElementById('det-cpu').textContent = nodo.cpu || '-';
    document.getElementById('det-ram').textContent = nodo.ram || '-';
    document.getElementById('det-alm').textContent = nodo.almacenamiento || '-';
    document.getElementById('det-so').textContent = nodo.so || '-';
    document.getElementById('det-office').textContent = nodo.office || '-';
    document.getElementById('det-obs').textContent = nodo.observaciones || 'Sin observaciones registradas.';

    const btnEditar = document.getElementById('btn-pasar-editar');
    if (btnEditar) {
        btnEditar.onclick = function() {
            cargarParaEditarObjeto(nodo);
        };
    }

    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    const targetView = document.getElementById('view-detalles');
    if (targetView) targetView.classList.remove('hidden');

    const subtitleEl = document.getElementById('header-subtitle');
    if (subtitleEl) subtitleEl.innerText = 'Detalles del Activo';
}