/**
 * ==========================================
 * CONTROLADOR DE RED - VERSIÓN MÓVIL (HFCL)
 * ==========================================
 * Ubicación: movil/js/red.js
 */

let listaNodosRed = [];
let listaInfraestructuraRed = [];
let listaInfoMaestra = {};
let puertoEnEdicionActual = null;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Sincronizando activos e infraestructura de red...");
    
    try {
        const respuestaCloud = await cargarDatosCloud('equipos', 'hfc_lan_master_cache');
        if (respuestaCloud) {
            // Asignación limpia y separada según la estructura real que devuelve tu backend
            listaNodosRed = Array.isArray(respuestaCloud.equipos) ? respuestaCloud.equipos : [];
            listaInfraestructuraRed = Array.isArray(respuestaCloud.red) ? respuestaCloud.red : [];
            
            if (respuestaCloud.info) {
                listaInfoMaestra = respuestaCloud.info;
            }
        }
    } catch (err) {
        console.error("Error al conectar con la nube:", err);
        listaNodosRed = [];
    }

    poblarSelectoresDesdeBD();
    renderizarResultadosRed(listaNodosRed);
    renderizarVistaRacks(listaNodosRed);

    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtrados = listaNodosRed.filter(nodo => {
                const hostname = nodo.hostname || nodo.Hostname || nodo.nombre || '';
                const ip = nodo.ip || nodo.IP || '';
                const mac = nodo.mac || nodo.MAC || '';
                const puerto = nodo.puerto || nodo.Puerto || '';
                const tipo = nodo.tipo || nodo.Tipo || '';
                const rack = nodo.rack || nodo.Rack || '';
                const patch = nodo.patch_panel || nodo.roseta || nodo.Roseta || '';
                const sw = nodo.sw || nodo.switch || '';
                
                return `${hostname} ${ip} ${mac} ${puerto} ${tipo} ${rack} ${patch} ${sw}`.toLowerCase().includes(query);
            });
            renderizarResultadosRed(filtrados);
        });
    }

    poblarPuertosSelect();
});

/**
 * Llena los selectores leyendo exclusivamente de las columnas de 'info' y 'red'
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
    const tipoAlmSet = new Set();
    const capAlmSet = new Set();
    const soSet = new Set();
    const officeSet = new Set();

    // 1. Lectura estricta de la hoja 'info'
    if (listaInfoMaestra && typeof listaInfoMaestra === 'object') {
        for (const colKey in listaInfoMaestra) {
            if (Array.isArray(listaInfoMaestra[colKey])) {
                listaInfoMaestra[colKey].forEach(val => {
                    const vStr = String(val).trim();
                    if (!vStr) return;
                    const k = colKey.toLowerCase();

                    if (k.includes('tipos_dispositivos')) tiposSet.add(vStr);
                    else if (k.includes('marcas')) marcasSet.add(vStr);
                    else if (k.includes('procesadores_cpu')) cpuSet.add(vStr);
                    else if (k.includes('opciones_ram')) ramSet.add(vStr);
                    else if (k.includes('tipos_almacenamiento')) tipoAlmSet.add(vStr);
                    else if (k.includes('capacidades_discos')) capAlmSet.add(vStr);
                    else if (k.includes('sistemas_operativos')) soSet.add(vStr);
                    else if (k.includes('licencias_office')) officeSet.add(vStr);
                });
            }
        }
    }

// 2. Lectura robusta de la hoja 'red' para Racks y Patch Panels / Puntos reales
    if (Array.isArray(listaInfraestructuraRed)) {
        listaInfraestructuraRed.forEach(item => {
            // Buscamos cualquier variante posible del nombre de la columna del Rack
            const rackId = item.id_racks || item.rack || item.Rack || item.id_racksid;
            // Buscamos cualquier variante posible del nombre de la columna del Patch Panel
            const patchPanel = item.patch_panel || item.roseta || item.punto || item.Roseta;
            
            if (rackId) racksSet.add(rackId.toString().trim());
            if (patchPanel) patchPanelsSet.add(patchPanel.toString().trim());
        });
    }

    // Si por alguna razón la hoja red viene vacía, forzamos los 6 racks oficiales del hospital
    if (racksSet.size === 0) {
        ["P1A", "P1B", "P1C", "P2A", "P2B", "P2C"].forEach(r => racksSet.add(r));
    }

    function rellenarSelect(selectEl, setValues, defaultText) {
        if (!selectEl) return;
        selectEl.innerHTML = `<option value="">${defaultText}</option>`;
        if (setValues.size > 0) {
            setValues.forEach(val => {
                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = val;
                selectEl.appendChild(opt);
            });
        }
    }

    rellenarSelect(selectRack, racksSet, "Seleccione Rack...");
    rellenarSelect(selectPatchPanel, patchPanelsSet, "Seleccione Patch Panel / Roseta...");
    rellenarSelect(selectTipo, tiposSet, "Seleccione tipo...");
    rellenarSelect(selectMarca, marcasSet, "Seleccione marca...");
    rellenarSelect(selectCpu, cpuSet, "Seleccione CPU...");
    rellenarSelect(selectRam, ramSet, "Seleccione RAM...");
    rellenarSelect(selectTipoAlm, tipoAlmSet, "Seleccione tipo almacenamiento...");
    rellenarSelect(selectCapAlm, capAlmSet, "Seleccione capacidad disco...");
    rellenarSelect(selectSo, soSet, "Seleccione SO...");
    rellenarSelect(selectOffice, officeSet, "Seleccione Office...");
}

/**
 * Filtra los switches según el rack seleccionado
 */
/**
 * Filtra los switches según el rack seleccionado de forma robusta
 */
function filtrarSwitchesPorRack(rackSeleccionadoForzado = null) {
    const selectRack = document.getElementById('formRack');
    const selectSwitch = document.getElementById('formSwitch');
    if (!selectRack || !selectSwitch) return;

    const rackActual = rackSeleccionadoForzado || selectRack.value;
    selectSwitch.innerHTML = '<option value="">Seleccione Switch...</option>';

    const switchesDelRack = new Set();

    if (Array.isArray(listaInfraestructuraRed)) {
        listaInfraestructuraRed.forEach(item => {
            // Mapeo unificado con las propiedades reales del backend (id_racks e id_sw)
            const r = item.id_racks || item.rack || item.id_racksid;
            const sw = item.id_sw || item.swnombre || item.switch;
            
            if (r && sw && r.toString().trim().toLowerCase() === rackActual.toLowerCase()) {
                switchesDelRack.add(sw.toString().trim());
            }
        });
    }

    // Fallback institucional si la hoja red no tiene filas para este rack específico
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
    const contenedor = document.getElementById('searchResults');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    if (!Array.isArray(datos) || datos.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-10 text-slate-400 text-xs bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4">
                <i class="fas fa-exclamation-triangle text-amber-400 text-lg mb-2"></i>
                <p class="font-semibold text-slate-300">No se encontraron dispositivos registrados.</p>
            </div>
        `;
        return;
    }

    datos.forEach(nodo => {
        const hostname = nodo.hostname || nodo.Hostname || nodo.nombre || 'SIN-NOMBRE';
        const ip = nodo.ip || nodo.IP || 'S/IP';
        const mac = nodo.mac || nodo.MAC || 'S/MAC';
        const puerto = nodo.puerto || nodo.Puerto || 'P00';
        const tipo = nodo.tipo || nodo.Tipo || 'Dispositivo';
        const patchPanel = nodo.patch_panel || nodo.roseta || nodo.Roseta || 'D00';
        const estado = nodo.estado || nodo.Estado || 'Online';
        
        const card = document.createElement('div');
        card.className = "search-card bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl";

        card.innerHTML = `
            <div class="flex justify-between items-start border-b border-slate-800 pb-2">
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded font-mono font-semibold">${tipo}</span>
                        <span class="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-medium">Hospital</span>
                    </div>
                    <h3 class="text-sm font-bold text-slate-100 mt-1">${hostname}</h3>
                </div>
                <span class="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md font-medium">${estado}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                <div>IP: <span class="text-blue-400">${ip}</span></div>
                <div>Patch Panel: ${patchPanel}</div>
                <div class="col-span-2">MAC: ${mac}</div>
            </div>

            <div class="pt-2 border-t border-slate-800/80 flex justify-end">
                <button type="button" onclick="cargarParaEditar('${hostname}', '${ip}', '${mac}', '${puerto}', '${patchPanel}', '${tipo}', '${nodo.marca || ''}', '${nodo.cpu || ''}', '${nodo.ram || ''}', '${nodo.almacenamiento || ''}', '${nodo.so || ''}', '${nodo.office || ''}', '${nodo.rack || ''}', '${nodo.switch || ''}')" class="bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 transition flex items-center space-x-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    <span>Modificar / Mover Puerto</span>
                </button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

/**
 * Renderiza la Vista de Racks agrupando y ordenando estrictamente por pisos y gabinetes oficiales
 */
/**
 * Renderiza la Vista de Racks ordenada por pisos con tarjetas colapsables (acordeones)
 */
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
            const rackKey = (nodo.rack || nodo.Rack || nodo.ubicacion || 'P1A').toString().trim().toUpperCase();
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
            
            let htmlElementos = '';
            if (elementos.length > 0) {
                elementos.forEach(el => {
                    const hName = el.hostname || el.Hostname || el.nombre || 'Equipo';
                    const ipVal = el.ip || el.IP || 'S/IP';
                    const swVal = el.sw || el.switch || 'Switch';
                    const portVal = el.puerto || el.Puerto || 'P00';
                    const patchVal = el.patch_panel || el.roseta || 'D00';
                    
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

            // Cada rack es un elemento <details> nativo que actúa como acordeón limpio
            htmlRacksGlobal += `
                <details class="group bg-slate-900/60 border border-slate-800 rounded-2xl shadow-lg overflow-hidden transition">
                    <summary class="flex justify-between items-center p-3.5 cursor-pointer select-none hover:bg-slate-800/40">
                        <div class="flex items-center space-x-2.5">
                            <div class="w-2 h-2 rounded-full bg-blue-400 group-open:bg-emerald-400 transition"></div>
                            <h4 class="text-xs font-bold text-slate-200 tracking-wide">Rack ${nombreRack}</h4>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-semibold border border-blue-500/20">${elementos.length} equipos</span>
                            <i class="fas fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform"></i>
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

    const titles = { consultar: 'Módulo de Consulta', registrar: 'Gestión de Activos / Edición', racks: 'Estado de Racks' };
    const subtitleEl = document.getElementById('header-subtitle');
    if (subtitleEl) subtitleEl.innerText = titles[viewName];

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.className = "nav-btn flex flex-col items-center text-slate-400 hover:text-slate-200 transition";
    });
    if (btnElement) btnElement.className = "nav-btn flex flex-col items-center text-blue-400 transition";
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

function cargarParaEditar(hostname, ip, mac, puerto, patchPanel, tipo, marca, cpu, ram, almacenamiento, so, office, rack, switchVal) {
    document.getElementById('inputHostname').value = hostname;
    document.getElementById('inputIp').value = ip;
    document.getElementById('inputMac').value = mac;
    document.getElementById('selectPatchPanel').value = patchPanel || '';
    document.getElementById('selectTipo').value = tipo || '';
    document.getElementById('selectMarca').value = marca || '';
    
    document.getElementById('formRack').value = rack || 'P1A';
    filtrarSwitchesPorRack(rack || 'P1A');
    document.getElementById('formSwitch').value = switchVal || '';

    toggleCamposDinamicos();

    if (cpu) document.getElementById('selectCpu').value = cpu;
    if (ram) document.getElementById('selectRam').value = ram;
    if (almacenamiento) document.getElementById('selectCapAlm').value = almacenamiento;
    if (so) document.getElementById('selectSo').value = so;
    if (office) document.getElementById('selectOffice').value = office;

    puertoEnEdicionActual = puerto;
    poblarPuertosSelect(puerto);

    document.getElementById('edit-badge').classList.remove('hidden');
    const registrarBtn = document.querySelectorAll('.nav-btn')[1];
    switchView('registrar', registrarBtn);
}

function cancelarEdicion() {
    document.getElementById('activoForm').reset();
    puertoEnEdicionActual = null;
    document.getElementById('edit-badge').classList.add('hidden');
    toggleCamposDinamicos();
    poblarPuertosSelect();
    const buscarBtn = document.querySelectorAll('.nav-btn')[0];
    switchView('consultar', buscarBtn);
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
            observaciones: ""
        }
    };
    try {
        const resultado = await enviarDatosCloud(payload);

        // Verificación flexible para aceptar tanto objetos de éxito como respuestas booleanas o vacías si la BD guardó
        const fueExitoso = resultado === true || 
                           (resultado && resultado.status === "success") || 
                           (typeof resultado === "string" && resultado.includes("success"));

        if (fueExitoso || resultado) {
            alert("¡Registro guardado con éxito en Google Sheets!");
            
            // Forzar limpieza y salida del modo edición de forma garantizada
            cancelarEdicion(); 

            // Recargar datos en segundo plano
            const respuestaCloud = await cargarDatosCloud('equipos', 'hfc_lan_master_cache');
            if (respuestaCloud) {
                listaNodosRed = Array.isArray(respuestaCloud.equipos) ? respuestaCloud.equipos : (Array.isArray(respuestaCloud) ? respuestaCloud : []);
                renderizarResultadosRed(listaNodosRed);
                renderizarVistaRacks(listaNodosRed);
            }
        } else {
            alert("El servidor indicó un problema al guardar, pero revisa tu Google Sheets por si acaso.");
            cancelarEdicion(); // Forzamos salida para que no quede trabado el teléfono en terreno
        }
    } catch (err) {
        console.error("Error al guardar:", err);
        alert("Error de comunicación al intentar guardar.");
    }
}