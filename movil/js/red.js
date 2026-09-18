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
            listaNodosRed = Array.isArray(respuestaCloud.equipos) ? respuestaCloud.equipos : (Array.isArray(respuestaCloud) ? respuestaCloud : []);
            listaInfraestructuraRed = Array.isArray(respuestaCloud.red) ? respuestaCloud.red : [];
            
            if (respuestaCloud.info) {
                listaInfoMaestra = respuestaCloud.info;
            }
        }
    } catch (err) {
        console.error("Error al conectar con la nube:", err);
        listaNodosRed = [];
    } finally {

        poblarSelectoresDesdeBD();
        renderizarResultadosRed(listaNodosRed);
        renderizarVistaRacks(listaNodosRed);

        const kpiTotal = document.getElementById('kpi-total-equipos');
        if (kpiTotal) kpiTotal.textContent = listaNodosRed.length;

        ocultarPantallaCarga();
    }

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

    if (Array.isArray(listaInfraestructuraRed)) {
        listaInfraestructuraRed.forEach(item => {
            const rackId = item.id_racks || item.rack || item.Rack || item.id_racksid;
            const patchPanel = item.patch_panel || item.roseta || item.punto || item.Roseta;
            
            if (rackId) racksSet.add(rackId.toString().trim());
            if (patchPanel) patchPanelsSet.add(patchPanel.toString().trim());
        });
    }

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

function filtrarSwitchesPorRack(rackSeleccionadoForzado = null) {
    const selectRack = document.getElementById('formRack');
    const selectSwitch = document.getElementById('formSwitch');
    if (!selectRack || !selectSwitch) return;

    const rackActual = rackSeleccionadoForzado || selectRack.value;
    selectSwitch.innerHTML = '<option value="">Seleccione Switch...</option>';

    const switchesDelRack = new Set();

    if (Array.isArray(listaInfraestructuraRed)) {
        listaInfraestructuraRed.forEach(item => {
            const r = item.id_racks || item.rack || item.id_racksid;
            const sw = item.id_sw || item.swnombre || item.switch;
            
            if (r && sw && r.toString().trim().toLowerCase() === rackActual.toLowerCase()) {
                switchesDelRack.add(sw.toString().trim());
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
        // Normalizamos el objeto para asegurar lectura limpia
        const item = {
            hostname: nodo.hostname || nodo.Hostname || nodo.nombre || 'SIN-NOMBRE',
            ip: nodo.ip || nodo.IP || 'S/IP',
            mac: nodo.mac || nodo.MAC || 'S/MAC',
            tipo: nodo.tipo || nodo.Tipo || 'PC / Notebook',
            marca: nodo.marca || nodo.Marca || '',
            rack: nodo.rack || nodo.Rack || 'P1A',
            sw: nodo.sw || nodo.switch || '',
            puerto: nodo.puerto || '',
            observaciones: nodo.observaciones || ''
        };

        // 2. Iconografía dinámica según el tipo de hardware
        let iconoHtml = '<i class="fas fa-desktop text-blue-400"></i>';
        let bordeColor = 'border-l-blue-500'; // Estilo SysAdmin por defecto (Estaciones de trabajo)
        
        const tipoLower = item.tipo.toLowerCase();
        if (tipoLower.includes('impresora') || tipoLower.includes('printer')) {
            iconoHtml = '<i class="fas fa-print text-amber-400"></i>';
            bordeColor = 'border-l-amber-500';
        } else if (tipoLower.includes('switch') || tipoLower.includes('router') || tipoLower.includes('ap') || tipoLower.includes('red')) {
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
            // Normalizamos la lectura del rack para agruparlos bien
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
            const totalPuertosEstimados = 24; // Capacidad estándar por switch principal
            const ocupacionPorcentaje = Math.min(Math.round((elementos.length / totalPuertosEstimados) * 100), 100);

            // Definir color de la barra según la saturación
            let colorBarra = "bg-emerald-500";
            let colorBadge = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            if (ocupacionPorcentaje > 75) {
                colorBarra = "bg-red-500";
                colorBadge = "text-red-400 bg-red-500/10 border-red-500/20";
            } else if (ocupacionPorcentaje > 40) {
                colorBarra = "bg-amber-500";
                colorBadge = "text-amber-400 bg-amber-500/10 border-amber-500/20";
            }
            
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

            // Renderizado del Rack con la nueva barra de ocupación integrada
            htmlRacksGlobal += `
                <details class="group bg-slate-900/60 border border-slate-800 rounded-2xl shadow-lg overflow-hidden transition">
                    <summary class="flex flex-col p-3.5 cursor-pointer select-none hover:bg-slate-800/40 space-y-2">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center space-x-2.5">
                                <div class="w-2 h-2 rounded-full bg-blue-400 group-open:bg-emerald-400 transition"></div>
                                <h4 class="text-xs font-bold text-slate-200 tracking-wide">Rack ${nombreRack}</h4>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="text-[10px] px-2 py-0.5 rounded font-semibold border ${colorBadge}">${elementos.length} equipos (${ocupacionPorcentaje}%)</span>
                                <i class="fas fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform"></i>
                            </div>
                        </div>
                        <!-- Barra de Ocupación Visual -->
                        <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
                            <div class="${colorBarra} h-full rounded-full transition-all duration-500" style="width: ${ocupacionPorcentaje}%"></div>
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

function cargarParaEditarObjeto(nodo) {
    if (!nodo) return;

    console.log("DATOS RECIBIDOS DEL NODO:", nodo);

    // Traductor y normalizador inteligente para corregir el desfase de la BD
    let item = {
        hostname: nodo.hostname || nodo.Hostname || nodo.nombre || '',
        ip: nodo.ip || nodo.IP || '',
        mac: nodo.mac || nodo.MAC || '',
        tipo: nodo.tipo || nodo.Tipo || '',
        marca: nodo.marca || nodo.Marca || '',
        
        // Corregimos los campos que venían intercambiados en la nube:
        rack: nodo.puerto && nodo.puerto.startsWith('P1') || nodo.puerto && nodo.puerto.startsWith('P2') ? nodo.puerto : (nodo.rack || 'P1A'),
        sw: nodo.cpu && nodo.cpu.includes('SW-') ? nodo.cpu : (nodo.sw || nodo.switch || ''),
        puerto: nodo.ram && nodo.ram.startsWith('P') ? nodo.ram : (nodo.puerto || ''),
        patch_panel: nodo.patch_panel || nodo.roseta || '',
        
        cpu: nodo.so && nodo.so.includes('Intel') || nodo.so && nodo.so.includes('AMD') ? nodo.so : (nodo.cpu || ''),
        ram: nodo.office && nodo.office.includes('GB') ? nodo.office : (nodo.ram || ''),
        almacenamiento: nodo.observaciones && (nodo.observaciones.includes('NVMe') || nodo.observaciones.includes('SSD') || nodo.observaciones.includes('TB')) ? nodo.observaciones : (nodo.almacenamiento || ''),
        
        so: nodo.almacenamiento && nodo.almacenamiento.includes('Mint') || nodo.almacenamiento && nodo.almacenamiento.includes('Windows') ? nodo.almacenamiento : (nodo.so || ''),
        office: nodo.modelo || nodo.office || '',
        observaciones: nodo.observaciones && !nodo.observaciones.includes('NVMe') ? nodo.observaciones : ''
    };

    console.log("ITEM NORMALIZADO Y CORREGIDO:", item);

    document.getElementById('inputHostname').value = item.hostname;
    document.getElementById('inputIp').value = item.ip;
    document.getElementById('inputMac').value = item.mac;
    document.getElementById('inputObservaciones').value = item.observaciones;
    
    // 1. Asignar Rack y filtrar switches correspondientes
    const rackVal = (item.rack || 'P1A').toString().trim();
    const selectRackEl = document.getElementById('formRack');
    if (selectRackEl) {
        selectRackEl.value = rackVal;
        filtrarSwitchesPorRack(rackVal);
    }
    
    // 2. Asignar Switch y demás campos con retardo para asegurar renderizado del DOM
    setTimeout(() => {
        const selectSwitchEl = document.getElementById('formSwitch');
        if (selectSwitchEl) {
            selectSwitchEl.value = item.sw || '';
        }
    }, 120);
    
    document.getElementById('selectPatchPanel').value = item.patch_panel;
    document.getElementById('selectTipo').value = item.tipo;
    document.getElementById('selectMarca').value = item.marca;

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

    seleccionarOInyectar('selectCpu', item.cpu);
    seleccionarOInyectar('selectRam', item.ram);
    seleccionarOInyectar('selectCapAlm', item.almacenamiento);
    seleccionarOInyectar('selectSo', item.so);
    seleccionarOInyectar('selectOffice', item.office);

    const puertoVal = item.puerto || '';
    puertoEnEdicionActual = puertoVal;
    poblarPuertosSelect(puertoVal);

    document.getElementById('edit-badge').classList.remove('hidden');
    const registrarBtn = document.querySelectorAll('.nav-btn')[1];
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
    document.getElementById('activoForm').reset();
    puertoEnEdicionActual = null;
    document.getElementById('edit-badge').classList.add('hidden');
    toggleCamposDinamicos();
    poblarPuertosSelect();
    const buscarBtn = document.querySelectorAll('.nav-btn')[0];
    switchView('consultar', buscarBtn);
}

function verDetallesObjeto(nodo) {
    if (!nodo) return;

    let item = {};
    if (Array.isArray(nodo)) {
        item = {
            hostname: nodo[0] || '', ip: nodo[1] || '', mac: nodo[2] || '',
            tipo: nodo[3] || '', marca: nodo[4] || '', modelo: nodo[5] || '',
            propiedad: nodo[6] || '', rack: nodo[7] || '', sw: nodo[8] || '',
            puerto: nodo[9] || '', patch_panel: nodo[10] || '', cpu: nodo[11] || '',
            ram: nodo[12] || '', almacenamiento: nodo[13] || '', so: nodo[14] || '',
            office: nodo[15] || '', observaciones: nodo[16] || ''
        };
    } else {
        // Si viene como Objeto pero con las llaves cruzadas de la BD:
        item = {
            hostname: nodo.hostname || nodo.Hostname || nodo.nombre || '',
            ip: nodo.ip || nodo.IP || '',
            mac: nodo.mac || nodo.MAC || '',
            tipo: nodo.tipo || nodo.Tipo || '',
            marca: nodo.marca || nodo.Marca || '',
            
            // Rescatamos los valores reales de donde se hayan guardado por el desfase:
            rack: nodo.rack || (nodo.puerto && nodo.puerto.startsWith('P') && nodo.puerto.length === 3 ? nodo.puerto : 'P1A'),
            sw: nodo.sw || (nodo.cpu && nodo.cpu.includes('SW-') ? nodo.cpu : ''),
            puerto: nodo.puerto && !nodo.puerto.startsWith('P1') ? nodo.puerto : (nodo.ram || ''),
            patch_panel: nodo.patch_panel || nodo.roseta || '',
            cpu: nodo.so && nodo.so.includes('Intel') ? nodo.so : (nodo.cpu || ''),
            ram: nodo.office && nodo.office.includes('GB') ? nodo.office : (nodo.ram || ''),
            almacenamiento: nodo.observaciones || nodo.almacenamiento || '',
            so: nodo.almacenamiento && nodo.almacenamiento.includes('Mint') ? nodo.almacenamiento : '',
            office: '',
            observaciones: nodo.observaciones || ''
        };
    }

    // Inyectar en el HTML de detalles...
    document.getElementById('det-hostname').textContent = item.hostname || 'SIN-NOMBRE';
    document.getElementById('det-tipo-badge').textContent = item.tipo || 'Dispositivo';
    document.getElementById('det-rack').textContent = item.rack || '-';
    document.getElementById('det-sw').textContent = item.sw || '-';
    document.getElementById('det-puerto').textContent = item.puerto || '-';
    document.getElementById('det-patch').textContent = item.patch_panel || '-';
    document.getElementById('det-ip').textContent = item.ip || '-';
    document.getElementById('det-mac').textContent = item.mac || '-';
    document.getElementById('det-marca').textContent = item.marca || '-';
    document.getElementById('det-cpu').textContent = item.cpu || '-';
    document.getElementById('det-ram').textContent = item.ram || '-';
    document.getElementById('det-alm').textContent = item.almacenamiento || '-';
    document.getElementById('det-so').textContent = item.so || '-';
    document.getElementById('det-office').textContent = item.office || '-';
    document.getElementById('det-obs').textContent = item.observaciones || 'Sin observaciones registradas.';

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

function ocultarPantallaCarga() {
    const loader = document.getElementById('loading-screen');
    if (loader) {
        loader.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => loader.remove(), 500);
    }
}