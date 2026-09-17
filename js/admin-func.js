// ==========================================================================
// INTRANET HOSPITAL LANCO - ADMINISTRACIÓN DE PERSONAL (FRONTEND LOGIC)
// ==========================================================================

const URL_API_SHEETS = "https://script.google.com/macros/s/AKfycby_MZCFYKhRSaKl0hoFQWW5G6nZQNX8nC8CXljeGdrgeLt_Hb43SHMIFjJ4e3AbJkQPAA/exec";

let listaFuncionarios = [];
let catalogosBD = {
    cargos: [],
    unidades: [],
    departamentos: []
};

let rutFuncionarioSeleccionado = null; 
let mapaAnalitico = null; 
let capaPines = null;

let chartEstamentoInstance = null;
let chartEdadesInstance = null;
let chartUnidadesInstance = null;
let chartCiudadesInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    const cacheFunc = localStorage.getItem('hfc_lan_contacts_data');
    if (cacheFunc) {
        try { listaFuncionarios = JSON.parse(cacheFunc); } catch (e) { console.error("Error cargando caché personal:", e); }
    }

    const cacheCat = localStorage.getItem('hfc_lan_catalogos_data');
    if (cacheCat) {
        try { catalogosBD = JSON.parse(cacheCat); } catch (e) { console.error("Error cargando caché catálogos:", e); }
    }

    cargarFuncionariosCloud();

    const selectGenero = document.getElementById('funcGenero');
    const selectEstamento = document.getElementById('funcEstamento');
    const selectCargo = document.getElementById('funcCargo');
    
    if (selectGenero) {
        selectGenero.addEventListener('change', () => {
            const cargoPrevio = selectCargo ? selectCargo.value : '';
            actualizarCargosPorEstamento();
            if (cargoPrevio && selectCargo) {
                selectCargo.value = cargoPrevio;
            }
        });
    }

    if (selectEstamento) {
        selectEstamento.addEventListener('change', () => {
            actualizarCargosPorEstamento();
            actualizarAvatarSegunCargo(selectCargo ? selectCargo.value : "", selectEstamento.value);
            evaluarVisibilidadCoordinacionEnfermeria(selectCargo ? selectCargo.value : "", selectEstamento.value);
        });
    }
    
    if (selectCargo) {
        selectCargo.addEventListener('change', () => {
            actualizarUnidadesPorCargo();
            actualizarAvatarSegunCargo(selectCargo.value, selectEstamento ? selectEstamento.value : "");
            evaluarVisibilidadCoordinacionEnfermeria(selectCargo.value, selectEstamento ? selectEstamento.value : "");
        });
    }

    bloquearFormulario(true);
});

// ==========================================================================
// 1. CARGA DE DATOS Y SINCRONIZACIÓN CLOUD
// ==========================================================================
async function cargarFuncionariosCloud() {
    try {
        const response = await fetch(URL_API_SHEETS);
        const data = await response.json();
        
        if (data.funcionarios && data.catalogos) {
            listaFuncionarios = data.funcionarios;
            catalogosBD = data.catalogos;
            
            window._cargosMaestros = catalogosBD.cargos;
            window._unidadesHospital = catalogosBD.unidades;
            window._departamentosHospital = catalogosBD.departamentos;
            
            localStorage.setItem('hfc_lan_contacts_data', JSON.stringify(listaFuncionarios));
            localStorage.setItem('hfc_lan_catalogos_data', JSON.stringify(catalogosBD));
        } else if (Array.isArray(data)) {
            listaFuncionarios = data;
            localStorage.setItem('hfc_lan_contacts_data', JSON.stringify(listaFuncionarios));
        }

        poblarDesplegablesMaestros();
        renderizarTablaCargos();
        renderizarTablaUnidades();
        renderUnidadesCheckboxesCargo([]);

        if (rutFuncionarioSeleccionado) {
            editarFuncionario(rutFuncionarioSeleccionado);
        }
    } catch (error) { 
        console.error("Error sincronizando con la nube:", error); 
    }
}

function poblarDesplegablesMaestros() {
    const selectEstamento = document.getElementById('funcEstamento');
    if (selectEstamento && Array.isArray(catalogosBD.cargos)) {
        const estamentosUnicos = [...new Set(catalogosBD.cargos.map(c => c.estamento).filter(Boolean))];
        selectEstamento.innerHTML = '<option value="">Seleccione estamento...</option>';
        estamentosUnicos.forEach(est => {
            const opt = document.createElement('option');
            opt.value = est;
            opt.textContent = est;
            selectEstamento.appendChild(opt);
        });
    }

    const selectDeptosCat = document.getElementById('catUnidadDepartamento');
    if (selectDeptosCat && Array.isArray(catalogosBD.departamentos)) {
        selectDeptosCat.innerHTML = '<option value="">Seleccione Departamento...</option>';
        catalogosBD.departamentos.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id_departamento;
            opt.textContent = d.nombre_departamento;
            selectDeptosCat.appendChild(opt);
        });
    }
}

// ==========================================================================
// 2. CONTROL Y ESTADO DEL FORMULARIO FUNCIONARIO
// ==========================================================================
function bloquearFormulario(bloquear = true) {
    const inputs = document.querySelectorAll('#panelEdicionForm input, #panelEdicionForm select');
    inputs.forEach(el => {
        if (el.id !== 'funcRut') {
            el.disabled = bloquear;
        }
    });

    const btnGuardar = document.getElementById('btnGuardarFuncionario');
    const btnCancelar = document.getElementById('btnCancelarFuncionario');
    const btnEliminar = document.getElementById('btnEliminarFuncionario');
    const btnEditar = document.getElementById('btnVistaEdicion');

    if (bloquear) {
        if (btnGuardar) btnGuardar.style.display = 'none';
        if (btnCancelar) btnCancelar.style.display = 'none';
        if (btnEliminar) btnEliminar.style.display = rutFuncionarioSeleccionado ? 'inline-flex' : 'none';
        if (btnEditar) {
            btnEditar.style.display = 'inline-flex';
            btnEditar.style.background = 'var(--slate-100)';
            btnEditar.style.color = 'var(--slate-600)';
            btnEditar.innerHTML = '<i class="fas fa-edit"></i> Edición';
        }
    } else {
        if (btnGuardar) btnGuardar.style.display = 'inline-flex';
        if (btnCancelar) btnCancelar.style.display = 'inline-flex';
        if (btnEliminar) btnEliminar.style.display = rutFuncionarioSeleccionado ? 'inline-flex' : 'none';
        if (btnEditar) {
            btnEditar.style.display = 'inline-flex';
            btnEditar.style.background = 'var(--primary)';
            btnEditar.style.color = 'white';
        }
    }
}

function habilitarModoEdicion() {
    bloquearFormulario(false);
    const inputRut = document.getElementById('funcRut');
    if (inputRut) inputRut.disabled = true;
}

function prepararNuevoFuncionario() {
    rutFuncionarioSeleccionado = null;
    
    const campos = [
        'funcRut', 'funcNombre', 'funcApellidoPaterno', 'funcApellidoMaterno', 'funcGenero', 
        'funcCargo', 'funcEstamento', 'funcUnidad', 'funcAnexo', 'funcUbicacion', 
        'funcFechaNacimiento', 'funcFechaIngreso', 'funcCorreo', 'funcRol', 'funcCiudad', 
        'funcDireccion', 'funcDetalleJefeDepto', 'funcDetalleSubrogante', 
        'funcVehiculoTipo', 'funcVehiculoPatente', 'funcVehiculoMarca', 'funcVehiculoModelo', 'funcVehiculoColor'
    ];
    campos.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });

    const checks = [
        'funcEsDirector', 'funcEsDirectorSubrogante', 'funcEsJefeDepto', 'funcEsJefeUnidad', 'funcEsSubrogante', 
        'funcSistemaSema', 'funcSistemaLme', 'funcSistemaRas', 'funcSistemaRasUrgencia', 
        'funcSistemaBioslis', 'funcSistemaCore', 'funcSistemaRni'
    ];
    checks.forEach(id => { const el = document.getElementById(id); if (el) el.checked = false; });

    document.querySelectorAll('.chk-enf-coord').forEach(chk => chk.checked = false);
    evaluarVisibilidadCoordinacionEnfermeria("", "");

    ['Depto', 'Unidad', 'Subrogante'].forEach(tipo => toggleCampoJerarquia(tipo, ''));

    const titulo = document.getElementById('tituloFormFuncionario');
    if (titulo) titulo.innerText = "Registrar Nuevo Funcionario";

    const inputRut = document.getElementById('funcRut');
    if (inputRut) inputRut.disabled = false;

    bloquearFormulario(false);
    actualizarAvatarSegunCargo("", "");
    actualizarContactosRelacionados(null);
}

function cancelarEdicionFormulario() {
    if (rutFuncionarioSeleccionado) {
        editarFuncionario(rutFuncionarioSeleccionado);
    } else {
        prepararNuevoFuncionario();
        bloquearFormulario(true);
    }
}

// ==========================================================================
// 3. OPERACIONES CRUD FUNCIONARIOS
// ==========================================================================
function guardarFuncionarioDB() {
    const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value.trim() : "";
    const getCheck = (id) => document.getElementById(id) ? document.getElementById(id).checked : false;

    const rutIngresado = getVal('funcRut');
    const nombreIngresado = getVal('funcNombre');
    const apellidoIngresado = getVal('funcApellidoPaterno');

    if (!rutIngresado || !nombreIngresado || !apellidoIngresado) {
        alert("Por favor, complete al menos el RUT, Nombre y Apellido Paterno.");
        return;
    }

    // Regla de Exclusividad Global para el Director y Director(S)
    const esNuevoDirector = getCheck('funcEsDirector');
    const esNuevoDirectorSub = getCheck('funcEsDirectorSubrogante');

    if (esNuevoDirector) {
        listaFuncionarios.forEach(f => {
            if (f.rut !== rutIngresado) f.director = "No";
        });
    }

    if (esNuevoDirectorSub) {
        listaFuncionarios.forEach(f => {
            if (f.rut !== rutIngresado) f.director_s = "No";
        });
    }

    // Recolectar áreas de Coordinación de Enfermería marcadas
    const enfCoordinacionesArr = [];
    document.querySelectorAll('.chk-enf-coord:checked').forEach(chk => {
        enfCoordinacionesArr.push(chk.value);
    });

    // Recolectar Unidades múltiples seleccionadas para Jefatura de Unidad
    const unidadesJefaturaArr = [];
    document.querySelectorAll('.chk-jefe-unidad-multi:checked').forEach(cb => {
        unidadesJefaturaArr.push(cb.value);
    });

    let jefaturasArr = [];
    if (getCheck('funcEsJefeDepto') && getVal('funcDetalleJefeDepto')) jefaturasArr.push(getVal('funcDetalleJefeDepto'));
    if (getCheck('funcEsJefeUnidad') && unidadesJefaturaArr.length > 0) {
        jefaturasArr.push(...unidadesJefaturaArr);
    }
    if (getCheck('funcEsSubrogante') && getVal('funcDetalleSubrogante')) jefaturasArr.push(getVal('funcDetalleSubrogante'));

    const nuevoFuncionario = {
        rut: rutIngresado,
        nombre: nombreIngresado,
        apellido_paterno: apellidoIngresado,
        apellido_materno: getVal('funcApellidoMaterno'),
        genero: getVal('funcGenero'),
        cargo: getVal('funcCargo'),
        estamento: getVal('funcEstamento'),
        unidad: getVal('funcUnidad'),
        director: esNuevoDirector ? "Sí" : "No",
        director_s: esNuevoDirectorSub ? "Sí" : "No",
        coordinacion: enfCoordinacionesArr.join('; '),
        jefe_depto: getCheck('funcEsJefeDepto') ? "Sí" : "No",
        jefe_unidad: getCheck('funcEsJefeUnidad') ? "Sí" : "No",
        subrogante: getCheck('funcEsSubrogante') ? "Sí" : "No",
        jefatura_cargo: jefaturasArr.join('; '),
        anexo: getVal('funcAnexo'),
        ubicacion: getVal('funcUbicacion'),
        correo: getVal('funcCorreo'),
        ciudad: getVal('funcCiudad'),
        direccion: getVal('funcDireccion'),
        fecha_nacimiento: getVal('funcFechaNacimiento'),
        fecha_ingreso: getVal('funcFechaIngreso'),
        rol: getVal('funcRol'),
        sema_activo: getCheck('funcSistemaSema') ? "Sí" : "No",
        lme_activo: getCheck('funcSistemaLme') ? "Sí" : "No",
        ras_activo: getCheck('funcSistemaRas') ? "Sí" : "No",
        ras_urgencia_activo: getCheck('funcSistemaRasUrgencia') ? "Sí" : "No",
        bioslis_activo: getCheck('funcSistemaBioslis') ? "Sí" : "No",
        core_activo: getCheck('funcSistemaCore') ? "Sí" : "No",
        rni_activo: getCheck('funcSistemaRni') ? "Sí" : "No",
        vehiculo_tipo: getVal('funcVehiculoTipo'),
        vehiculo_patente: getVal('funcVehiculoPatente'),
        vehiculo_marca: getVal('funcVehiculoMarca'),
        vehiculo_modelo: getVal('funcVehiculoModelo'),
        vehiculo_color: getVal('funcVehiculoColor')
    };

    const payload = {
        action: rutFuncionarioSeleccionado ? 'editar' : 'guardar',
        funcionario: nuevoFuncionario
    };

    const idx = listaFuncionarios.findIndex(f => f.rut && f.rut.toString().trim().toUpperCase() === rutIngresado.toUpperCase());
    if (idx !== -1) {
        listaFuncionarios[idx] = nuevoFuncionario;
    } else {
        listaFuncionarios.push(nuevoFuncionario);
    }

    localStorage.setItem('hfc_lan_contacts_data', JSON.stringify(listaFuncionarios));
    actualizarContactosRelacionados(nuevoFuncionario);

    fetch(URL_API_SHEETS, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(() => {
        alert("Registro guardado exitosamente.");
        prepararNuevoFuncionario();
        cargarFuncionariosCloud();
    }).catch(err => {
        console.error("Error al sincronizar datos:", err);
        alert("Guardado localmente. Ocurrió un error de conexión al sincronizar.");
    });
}

function editarFuncionario(rut) {
    const func = listaFuncionarios.find(f => f.rut && f.rut.toString().trim().toUpperCase() === rut.toString().trim().toUpperCase());
    if (!func) return;

    rutFuncionarioSeleccionado = func.rut;

    const inputRut = document.getElementById('funcRut');
    if (inputRut) {
        inputRut.value = func.rut || '';
        inputRut.disabled = true; 
    }

    document.getElementById('funcNombre').value = func.nombre || '';
    document.getElementById('funcApellidoPaterno').value = func.apellido_paterno || '';
    document.getElementById('funcApellidoMaterno').value = func.apellido_materno || '';

    const selectGenero = document.getElementById('funcGenero');
    if (selectGenero) selectGenero.value = func.genero || '';

    const selectEstamento = document.getElementById('funcEstamento');
    const selectCargo = document.getElementById('funcCargo');

    let estamentoFinal = func.estamento || '';
    if (!estamentoFinal && func.cargo && Array.isArray(catalogosBD.cargos)) {
        const matchCargo = catalogosBD.cargos.find(c => c.cargo_masculino === func.cargo || c.cargo_femenino === func.cargo);
        if (matchCargo) estamentoFinal = matchCargo.estamento; 
    }

    if (selectEstamento) {
        selectEstamento.value = estamentoFinal;
        actualizarCargosPorEstamento(); 
    }

    if (selectCargo) {
        selectCargo.value = func.cargo || ''; 
    }

    actualizarUnidadesPorCargo();

    const selectUnidad = document.getElementById('funcUnidad');
    if (selectUnidad && func.unidad) {
        selectUnidad.value = func.unidad; 
    }

    // Cargar banderas de Dirección y Enfermería Coordinadora con los nombres cortos
    const chkDir = document.getElementById('funcEsDirector');
    if (chkDir) chkDir.checked = (func.director === "Sí");

    const chkDirSub = document.getElementById('funcEsDirectorSubrogante');
    if (chkDirSub) chkDirSub.checked = (func.director_s === "Sí");

    const coordsGuardadas = (func.coordinacion || "").split(';').map(s => s.trim());
    document.querySelectorAll('.chk-enf-coord').forEach(chk => {
        chk.checked = coordsGuardadas.includes(chk.value);
    });

    evaluarVisibilidadCoordinacionEnfermeria(func.cargo, estamentoFinal);

    document.getElementById('funcEsJefeDepto').checked = (func.jefe_depto === "Sí");
    document.getElementById('funcEsJefeUnidad').checked = (func.jefe_unidad === "Sí");
    document.getElementById('funcEsSubrogante').checked = (func.subrogante === "Sí");

    const itemsJefatura = (func.jefatura_cargo || "").split(';').map(s => s.trim()).filter(Boolean);

    let deptoVal = "";
    let unidadesGuardadasArr = [];
    let subroVal = "";

    itemsJefatura.forEach(val => {
        const esDepto = Array.isArray(catalogosBD.departamentos) && 
                        catalogosBD.departamentos.some(d => d.nombre_departamento === val);
                        
        const esUnidad = Array.isArray(catalogosBD.unidades) && 
                         catalogosBD.unidades.some(u => u.unidad_nombre === val);

        if (esDepto) {
            deptoVal = val;
        } else if (esUnidad) {
            unidadesGuardadasArr.push(val);
        } else {
            if (func.subrogante === "Sí" && !subroVal) subroVal = val;
        }
    });

    toggleCampoJerarquia('Depto', deptoVal);
    toggleCampoJerarquia('Unidad', unidadesGuardadasArr);
    toggleCampoJerarquia('Subrogante', subroVal);

    document.getElementById('funcAnexo').value = func.anexo || '';
    document.getElementById('funcUbicacion').value = func.ubicacion || '';
    document.getElementById('funcCorreo').value = func.correo || '';
    document.getElementById('funcCiudad').value = func.ciudad || 'Lanco';
    document.getElementById('funcDireccion').value = func.direccion || '';

    document.getElementById('funcRol').value = func.rol || '';
    const sistemas = ['Sema', 'Lme', 'Ras', 'RasUrgencia', 'Bioslis', 'Core', 'Rni'];
    sistemas.forEach(sis => {
        const key = `${sis.toLowerCase()}_activo`;
        const campoActivo = func[key] === "Sí";
        const chk = document.getElementById(`funcSistema${sis}`);
        if (chk) chk.checked = campoActivo;
    });

    function convertirAInputDate(fechaStr) {
        if (!fechaStr) return '';
        if (fechaStr.includes('-')) {
            const partes = fechaStr.split('-');
            if (partes[0].length === 2 && partes[2].length === 4) {
                return `${partes[2]}-${partes[1]}-${partes[0]}`;
            }
        }
        return fechaStr.split('T')[0];
    }

    document.getElementById('funcFechaNacimiento').value = convertirAInputDate(func.fecha_nacimiento);
    document.getElementById('funcFechaIngreso').value = convertirAInputDate(func.fecha_ingreso);

    document.getElementById('funcVehiculoTipo').value = func.vehiculo_tipo || '';
    document.getElementById('funcVehiculoPatente').value = func.vehiculo_patente || '';
    document.getElementById('funcVehiculoMarca').value = func.vehiculo_marca || '';
    document.getElementById('funcVehiculoModelo').value = func.vehiculo_modelo || '';
    document.getElementById('funcVehiculoColor').value = func.vehiculo_color || '';

    const titulo = document.getElementById('tituloFormFuncionario');
    if (titulo) titulo.innerText = `${func.nombre || ''} ${func.apellido_paterno || ''}`.trim();

    actualizarContactosRelacionados(func);
    actualizarAvatarSegunCargo(func.cargo, estamentoFinal);
    bloquearFormulario(true);
}

function eliminarFuncionarioActual() {
    if (!rutFuncionarioSeleccionado) return;
    if (!confirm("¿Está seguro de eliminar permanentemente este funcionario de la base de datos?")) return;

    fetch(URL_API_SHEETS, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'eliminar', rut: rutFuncionarioSeleccionado })
    }).then(() => {
        alert("Registro eliminado exitosamente.");
        prepararNuevoFuncionario();
        cargarFuncionariosCloud();
    });
}

// ==========================================================================
// 4. MANTENEDOR DE CATÁLOGOS (CARGOS Y UNIDADES CON ESTADO Y CHECKBOXES)
// ==========================================================================
function cambiarSolapaCatalogo(solapa) {
    document.querySelectorAll('.tab-catalogos-content').forEach(el => el.classList.remove('active'));
    document.getElementById('tabBtnCatCargos')?.classList.remove('active');
    document.getElementById('tabBtnCatUnidades')?.classList.remove('active');

    if (solapa === 'cargos') {
        document.getElementById('tabCatContentCargos')?.classList.add('active');
        document.getElementById('tabBtnCatCargos')?.classList.add('active');
    } else if (solapa === 'unidades') {
        document.getElementById('tabCatContentUnidades')?.classList.add('active');
        document.getElementById('tabBtnCatUnidades')?.classList.add('active');
    }
}

// --- RENDERIZAR CHECKBOXES UNIDADES EN CARGOS ---
function renderUnidadesCheckboxesCargo(unidadesAsociadas = []) {
    const container = document.getElementById('containerUnidadesCheckboxes');
    if (!container) return;

    container.innerHTML = "";
    const unidadesCatalog = catalogosBD.unidades || [];

    if (unidadesCatalog.length === 0) {
        container.innerHTML = `<span style="font-size:0.75rem; color: var(--slate-500);">No hay unidades registradas en el catálogo.</span>`;
        return;
    }

    const listaNormalizada = Array.isArray(unidadesAsociadas) 
        ? unidadesAsociadas.map(u => String(u).trim()) 
        : String(unidadesAsociadas || '').split(',').map(u => u.trim());

    unidadesCatalog.forEach(unid => {
        const idU = String(unid.id_unidad || '').trim();
        const nomU = String(unid.unidad_nombre || idU).trim();

        const isChecked = listaNormalizada.some(ref => ref === idU || ref === nomU);

        const label = document.createElement('label');
        label.style.cssText = "display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--slate-800); cursor: pointer; user-select: none;";
        label.innerHTML = `
            <input type="checkbox" class="chk-unidad-cargo" value="${idU}" ${isChecked ? 'checked' : ''} style="cursor: pointer; accent-color: var(--primary);">
            <span>${nomU}</span>
        `;
        container.appendChild(label);
    });
}

function obtenerUnidadesSeleccionadasCheckboxes() {
    const checkboxes = document.querySelectorAll('#containerUnidadesCheckboxes .chk-unidad-cargo:checked');
    return Array.from(checkboxes).map(cb => cb.value.trim());
}

// --- GESTIÓN DE CARGOS ---
function renderizarTablaCargos() {
    const tbody = document.getElementById('tablaCargosBody');
    if (!tbody || !Array.isArray(catalogosBD.cargos)) return;

    let html = "";
    catalogosBD.cargos.forEach(c => {
        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 6px 10px; font-weight: 700; color: #64748b;">${c.id_cargo}</td>
                <td style="padding: 6px 10px;">${c.estamento}</td>
                <td style="padding: 6px 10px;">
                    <strong>${c.cargo_masculino}</strong> / <span style="color: #64748b;">${c.cargo_femenino}</span>
                </td>
                <td style="padding: 6px 10px; text-align: center;">
                    <button type="button" onclick="cargarCargoEnFormulario('${c.id_cargo}')" class="btn btn-light" style="padding: 3px 8px; font-size: 0.7rem;" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" onclick="eliminarCargoDB('${c.id_cargo}')" class="btn" style="padding: 3px 8px; font-size: 0.7rem; background: var(--rose); color: white;" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="4" style="text-align:center; padding:10px;">No hay cargos registrados.</td></tr>';
}

function cargarCargoEnFormulario(idCargo) {
    const cargo = catalogosBD.cargos.find(c => c.id_cargo === idCargo);
    if (!cargo) return;

    document.getElementById('cargoEditId').value = cargo.id_cargo;
    document.getElementById('catCargoEstamento').value = cargo.estamento || '';
    document.getElementById('catCargoMasculino').value = cargo.cargo_masculino || '';
    document.getElementById('catCargoFemenino').value = cargo.cargo_femenino || '';
    
    document.getElementById('tituloFormCargo').innerText = `Editar Cargo (${cargo.id_cargo})`;

    const btnGuardar = document.getElementById('btnGuardarCargo');
    if (btnGuardar) btnGuardar.innerHTML = `<i class="fas fa-save"></i> Actualizar Cargo`;

    const btnCancelar = document.getElementById('btnCancelarCargo');
    if (btnCancelar) btnCancelar.style.display = 'inline-flex';

    renderUnidadesCheckboxesCargo(cargo.id_unidad || []);
}

function limpiarFormularioCargo() {
    document.getElementById('cargoEditId').value = "";
    document.getElementById('catCargoEstamento').value = "";
    document.getElementById('catCargoMasculino').value = "";
    document.getElementById('catCargoFemenino').value = "";
    document.getElementById('tituloFormCargo').innerText = "Agregar Nuevo Cargo";

    const btnGuardar = document.getElementById('btnGuardarCargo');
    if (btnGuardar) btnGuardar.innerHTML = `<i class="fas fa-save"></i> Guardar Cargo`;

    const btnCancelar = document.getElementById('btnCancelarCargo');
    if (btnCancelar) btnCancelar.style.display = 'none';

    renderUnidadesCheckboxesCargo([]);
}

function guardarCargoDB() {
    const idCargo = document.getElementById('cargoEditId').value.trim();
    const estamento = document.getElementById('catCargoEstamento').value.trim();
    const cargoM = document.getElementById('catCargoMasculino').value.trim();
    const cargoF = document.getElementById('catCargoFemenino').value.trim();
    const unidadesSel = obtenerUnidadesSeleccionadasCheckboxes();

    if (!estamento || !cargoM) {
        alert("Por favor complete al menos el Estamento y el Nombre Masculino del cargo.");
        return;
    }

    const payload = {
        action: 'guardar_cargo',
        cargo: {
            id_cargo: idCargo,
            estamento: estamento,
            cargo_masculino: cargoM,
            cargo_femenino: cargoF || cargoM,
            id_unidad: unidadesSel
        }
    };

    fetch(URL_API_SHEETS, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(() => {
        alert("Cargo guardado exitosamente.");
        limpiarFormularioCargo();
        cargarFuncionariosCloud();
    });
}

function eliminarCargoDB(idCargo) {
    if (!confirm(`¿Está seguro de eliminar el cargo ${idCargo}?`)) return;

    fetch(URL_API_SHEETS, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'eliminar_cargo', id_cargo: idCargo })
    }).then(() => {
        alert("Cargo eliminado exitosamente.");
        cargarFuncionariosCloud();
    });
}

// --- GESTIÓN DE UNIDADES ---
function renderizarTablaUnidades() {
    const tbody = document.getElementById('tablaUnidadesBody');
    if (!tbody || !Array.isArray(catalogosBD.unidades)) return;

    let html = "";
    catalogosBD.unidades.forEach(u => {
        const deptoObj = Array.isArray(catalogosBD.departamentos) ? catalogosBD.departamentos.find(d => d.id_departamento === u.id_departamento) : null;
        const nombreDepto = deptoObj ? deptoObj.nombre_departamento : u.id_departamento;

        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 6px 10px; font-weight: 700; color: #64748b;">${u.id_unidad}</td>
                <td style="padding: 6px 10px;"><strong>${u.unidad_nombre}</strong></td>
                <td style="padding: 6px 10px; color: #64748b;">${nombreDepto}</td>
                <td style="padding: 6px 10px; text-align: center;">
                    <button type="button" onclick="cargarUnidadEnFormulario('${u.id_unidad}')" class="btn btn-light" style="padding: 3px 8px; font-size: 0.7rem;" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" onclick="eliminarUnidadDB('${u.id_unidad}')" class="btn" style="padding: 3px 8px; font-size: 0.7rem; background: var(--rose); color: white;" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="4" style="text-align:center; padding:10px;">No hay unidades registradas.</td></tr>';
}

function cargarUnidadEnFormulario(idUnidad) {
    const unidad = catalogosBD.unidades.find(u => u.id_unidad === idUnidad);
    if (!unidad) return;

    document.getElementById('unidadEditId').value = unidad.id_unidad;
    document.getElementById('catUnidadNombre').value = unidad.unidad_nombre || '';
    document.getElementById('catUnidadDepartamento').value = unidad.id_departamento || '';
    
    document.getElementById('tituloFormUnidad').innerText = `Editar Unidad (${unidad.id_unidad})`;

    const btnGuardar = document.getElementById('btnGuardarUnidad');
    if (btnGuardar) btnGuardar.innerHTML = `<i class="fas fa-save"></i> Actualizar Unidad`;

    const btnCancelar = document.getElementById('btnCancelarUnidad');
    if (btnCancelar) btnCancelar.style.display = 'inline-flex';
}

function limpiarFormularioUnidad() {
    document.getElementById('unidadEditId').value = "";
    document.getElementById('catUnidadNombre').value = "";
    document.getElementById('catUnidadDepartamento').value = "";
    document.getElementById('tituloFormUnidad').innerText = "Agregar Nueva Unidad";

    const btnGuardar = document.getElementById('btnGuardarUnidad');
    if (btnGuardar) btnGuardar.innerHTML = `<i class="fas fa-save"></i> Guardar Unidad`;

    const btnCancelar = document.getElementById('btnCancelarUnidad');
    if (btnCancelar) btnCancelar.style.display = 'none';
}

function guardarUnidadDB() {
    const idUnidad = document.getElementById('unidadEditId').value.trim();
    const nombreUnidad = document.getElementById('catUnidadNombre').value.trim();
    const idDepto = document.getElementById('catUnidadDepartamento').value.trim();

    if (!nombreUnidad) {
        alert("Por favor ingrese el nombre de la Unidad / Servicio.");
        return;
    }

    const payload = {
        action: 'guardar_unidad',
        unidad: {
            id_unidad: idUnidad,
            unidad_nombre: nombreUnidad,
            id_departamento: idDepto || 'DEP-001'
        }
    };

    fetch(URL_API_SHEETS, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(() => {
        alert("Unidad guardada exitosamente.");
        limpiarFormularioUnidad();
        cargarFuncionariosCloud();
    });
}

function eliminarUnidadDB(idUnidad) {
    if (!confirm(`¿Está seguro de eliminar la unidad ${idUnidad}?`)) return;

    fetch(URL_API_SHEETS, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'eliminar_unidad', id_unidad: idUnidad })
    }).then(() => {
        alert("Unidad eliminada exitosamente.");
        cargarFuncionariosCloud();
    });
}

// ==========================================================================
// 5. BÚSQUEDA, CASCA DE COMBOS, AVATAR Y VISIBILIDAD CONDICIONAL
// ==========================================================================
function evaluarVisibilidadCoordinacionEnfermeria(cargoTexto, estamentoTexto) {
    const seccionEnfermeria = document.getElementById('seccionCoordinacionEnfermeria');
    if (!seccionEnfermeria) return;

    const textoCompleto = ((cargoTexto || "") + " " + (estamentoTexto || "")).toLowerCase();
    const esEnfermeriaOrMatron = textoCompleto.includes('enfermer') || textoCompleto.includes('matr');

    if (esEnfermeriaOrMatron) {
        seccionEnfermeria.style.display = 'block';
    } else {
        seccionEnfermeria.style.display = 'none';
        document.querySelectorAll('.chk-enf-coord').forEach(chk => chk.checked = false);
    }
}

function manejarBusquedaSugerencias(textoBusqueda) {
    const filtro = textoBusqueda.toLowerCase().trim();
    const contenedor = document.getElementById('sugerenciasContainer');

    if (!contenedor) return;

    if (filtro.length === 0 || !Array.isArray(listaFuncionarios)) {
        contenedor.style.display = 'none';
        contenedor.innerHTML = '';
        return;
    }

    const coincidencias = listaFuncionarios.filter(f => {
        const rut = (f.rut || '').toLowerCase();
        const nombre = (f.nombre || '').toLowerCase();
        const apellidoPat = (f.apellido_paterno || '').toLowerCase();
        const apellidoMat = (f.apellido_materno || '').toLowerCase();
        return `${rut} ${nombre} ${apellidoPat} ${apellidoMat}`.includes(filtro);
    });

    if (coincidencias.length === 0) {
        contenedor.style.display = 'none';
        contenedor.innerHTML = '';
        return;
    }

    let html = '';
    coincidencias.forEach((f) => {
        const nombreCompleto = `${f.nombre || ''} ${f.apellido_paterno || ''} ${f.apellido_materno || ''}`.trim() || 'Sin Nombre';
        const rutText = f.rut ? `(${f.rut})` : '';
        const cargoText = obtenerNombreCargoSegunGenero(f.cargo, f.genero) || 'Sin cargo especificado';

        html += `
            <div onclick="seleccionarFuncionarioPorRut('${f.rut}')" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#ffffff'">
                <strong style="display: block; color: #1e293b;">${nombreCompleto} <span style="font-weight: 400; color: #64748b;">${rutText}</span></strong>
                <span style="color: #64748b; font-size: 0.72rem;">${cargoText}</span>
            </div>
        `;
    });

    contenedor.innerHTML = html;
    contenedor.style.display = 'block';
}

function seleccionarFuncionarioPorRut(rut) {
    if (!rut) return;

    const func = listaFuncionarios.find(f => f.rut && f.rut.toString().trim().toUpperCase() === rut.toString().trim().toUpperCase());
    if (!func) {
        alert("No se encontró el registro seleccionado.");
        return;
    }

    const contenedor = document.getElementById('sugerenciasContainer');
    if (contenedor) {
        contenedor.style.display = 'none';
        contenedor.innerHTML = '';
    }

    const inputBusqueda = document.getElementById('inputBuscarFuncionario');
    if (inputBusqueda) {
        inputBusqueda.value = `${func.nombre || ''} ${func.apellido_paterno || ''}`.trim();
    }

    editarFuncionario(func.rut);
}

function cambiarSolapaFicha(nombreSolapa) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tabs-container .tab-btn').forEach(el => el.classList.remove('active'));

    const contenido = document.getElementById(`tabContent${nombreSolapa.charAt(0).toUpperCase() + nombreSolapa.slice(1)}`);
    const boton = document.getElementById(`tabBtn${nombreSolapa.charAt(0).toUpperCase() + nombreSolapa.slice(1)}`);

    if (contenido) contenido.classList.add('active');
    if (boton) boton.classList.add('active');
}

function cambiarVistaModulo(vista) {
    document.querySelectorAll('.vista-modulo').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav .nav-menu-item').forEach(el => el.classList.remove('active'));

    const barraAcciones = document.getElementById('barraAccionesFuncionario');

    if (vista === 'funcionario') {
        document.getElementById('vistaModuloFuncionario')?.classList.add('active');
        document.getElementById('navBtnFuncionario')?.classList.add('active');
        if (barraAcciones) barraAcciones.style.display = 'flex';

    } else if (vista === 'estadisticas') {
        document.getElementById('vistaModuloEstadisticas')?.classList.add('active');
        document.getElementById('navBtnEstadisticas')?.classList.add('active');
        if (barraAcciones) barraAcciones.style.display = 'none';
        renderizarDashboard();

    } else if (vista === 'mapa') {
        document.getElementById('vistaModuloMapa')?.classList.add('active');
        document.getElementById('navBtnMapa')?.classList.add('active');
        if (barraAcciones) barraAcciones.style.display = 'none';
        setTimeout(inicializarMapaFuncionarios, 100);

    } else if (vista === 'otros') {
        document.getElementById('vistaModuloOtros')?.classList.add('active');
        document.getElementById('navBtnOtros')?.classList.add('active');
        if (barraAcciones) barraAcciones.style.display = 'none';
        renderizarTablaCargos();
        renderizarTablaUnidades();
    }
}

function actualizarCargosPorEstamento() {
    const selectEstamento = document.getElementById('funcEstamento');
    const selectCargo = document.getElementById('funcCargo');
    const selectUnidad = document.getElementById('funcUnidad');
    const generoVal = document.getElementById('funcGenero') ? document.getElementById('funcGenero').value : '';

    if (!selectEstamento || !selectCargo) return;

    const estamentoSeleccionado = selectEstamento.value.trim();

    selectCargo.innerHTML = '<option value="">Seleccione cargo...</option>';
    selectCargo.disabled = !estamentoSeleccionado;
    if (selectUnidad) selectUnidad.innerHTML = '<option value="">Primero seleccione un cargo...</option>';

    if (!estamentoSeleccionado || !Array.isArray(catalogosBD.cargos)) return;

    const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const estamentoBusqueda = normalizar(estamentoSeleccionado);

    const cargosFiltrados = catalogosBD.cargos.filter(item =>
        normalizar(item.estamento) === estamentoBusqueda
    );

    cargosFiltrados.forEach(item => {
        const option = document.createElement('option');
        const nombreCargo = generoVal === 'F' ? (item.cargo_femenino || item.cargo_masculino) : item.cargo_masculino;
        option.value = nombreCargo;
        option.textContent = nombreCargo;
        selectCargo.appendChild(option);
    });
}

function actualizarUnidadesPorCargo() {
    const selectCargo = document.getElementById('funcCargo');
    const selectUnidad = document.getElementById('funcUnidad');

    if (!selectCargo || !selectUnidad) return;

    const cargoSeleccionado = selectCargo.value.trim();
    selectUnidad.innerHTML = '<option value="">Seleccione unidad...</option>';

    if (!cargoSeleccionado) return;

    let unidadesDisponibles = Array.isArray(catalogosBD.unidades) ? catalogosBD.unidades : [];
    const nombresUnidades = unidadesDisponibles.map(u => typeof u === 'string' ? u : (u.unidad_nombre || u.nombre || '')).filter(Boolean);
    const unidadesUnicas = [...new Set(nombresUnidades)];

    unidadesUnicas.forEach(nombreUnidad => {
        const option = document.createElement('option');
        option.value = nombreUnidad;
        option.textContent = nombreUnidad;
        selectUnidad.appendChild(option);
    });

    if (unidadesUnicas.length === 1) {
        selectUnidad.value = unidadesUnicas[0];
    }
}

function toggleCampoJerarquia(tipo, valorGuardado = '') {
    let idCheck = tipo === 'Subrogante' ? 'funcEsSubrogante' : `funcEsJefe${tipo}`;
    let idSelect = tipo === 'Subrogante' ? 'funcDetalleSubrogante' : `funcDetalleJefe${tipo}`;

    const checkbox = document.getElementById(idCheck);
    const inputDetalle = document.getElementById(idSelect);

    if (tipo === 'Unidad') {
        const containerChecks = document.getElementById('containerJefeUnidadesCheckboxes');
        const chkUnidad = document.getElementById('funcEsJefeUnidad');
        if (containerChecks && chkUnidad) {
            if (chkUnidad.checked) {
                containerChecks.style.opacity = '1';
                containerChecks.style.pointerEvents = 'auto';
                containerChecks.style.background = 'white';
                renderUnidadesCheckboxesJefatura(valorGuardado);
            } else {
                containerChecks.style.opacity = '0.6';
                containerChecks.style.pointerEvents = 'none';
                containerChecks.style.background = 'var(--slate-50)';
                containerChecks.innerHTML = '<span style="font-size: 0.73rem; color: var(--slate-500);">Habilite la casilla superior para marcar una o más unidades.</span>';
            }
        }
        return;
    }

    if (!checkbox || !inputDetalle) return;

    if (checkbox.checked) {
        inputDetalle.disabled = false;
        inputDetalle.style.background = 'white';

        if (inputDetalle.tagName === 'SELECT') {
            inputDetalle.innerHTML = '<option value="">Seleccione opción...</option>';

            let opciones = [];
            if (tipo === 'Depto' && Array.isArray(catalogosBD.departamentos)) {
                opciones = catalogosBD.departamentos.map(d => d.nombre_departamento);
            } else if (tipo === 'Subrogante' && Array.isArray(catalogosBD.unidades)) {
                opciones = catalogosBD.unidades.map(u => u.unidad_nombre);
            }

            opciones.forEach(op => {
                const opt = document.createElement('option');
                opt.value = op;
                opt.textContent = op;
                inputDetalle.appendChild(opt);
            });

            if (valorGuardado) {
                inputDetalle.value = valorGuardado;
            }
        }
    } else {
        inputDetalle.disabled = true;
        if (inputDetalle.tagName === 'SELECT') {
            inputDetalle.innerHTML = '<option value="">Seleccione opción...</option>';
        } else {
            inputDetalle.value = '';
        }
        inputDetalle.style.background = 'var(--slate-50)';
    }
}

function renderUnidadesCheckboxesJefatura(unidadesAsociadas = []) {
    const container = document.getElementById('containerJefeUnidadesCheckboxes');
    if (!container) return;

    container.innerHTML = "";
    const unidadesCatalog = catalogosBD.unidades || [];

    if (unidadesCatalog.length === 0) {
        container.innerHTML = `<span style="font-size:0.75rem; color: var(--slate-500);">No hay unidades registradas en el catálogo.</span>`;
        return;
    }

    const listaNormalizada = Array.isArray(unidadesAsociadas) 
        ? unidadesAsociadas.map(u => String(u).trim()) 
        : String(unidadesAsociadas || '').split(';').map(u => u.trim());

    unidadesCatalog.forEach(unid => {
        const idU = String(unid.id_unidad || '').trim();
        const nomU = String(unid.unidad_nombre || idU).trim();

        const isChecked = listaNormalizada.some(ref => ref === idU || ref === nomU);

        const label = document.createElement('label');
        label.style.cssText = "display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--slate-800); cursor: pointer; user-select: none;";
        label.innerHTML = `
            <input type="checkbox" class="chk-jefe-unidad-multi" value="${nomU}" ${isChecked ? 'checked' : ''} style="cursor: pointer; accent-color: var(--primary);">
            <span>${nomU}</span>
        `;
        container.appendChild(label);
    });
}

function actualizarAvatarSegunCargo(cargoTexto, estamentoTexto) {
    const avatarMain = document.getElementById('avatarFuncionarioPreview');
    const avatarHeader = document.getElementById('avatarHeaderPreview');
    if (!avatarMain) return;

    const texto = ((cargoTexto || "") + " " + (estamentoTexto || "")).toLowerCase();
    let iconoHTML = '<i class="fas fa-user"></i>';
    let colorFondo = 'var(--primary)';

    if (texto.includes('médico') || texto.includes('medica') || texto.includes('cirujano')) {
        iconoHTML = '<i class="fas fa-user-md"></i>';
        colorFondo = '#0284c7';
    } else if (texto.includes('enfermer') || texto.includes('matrón') || texto.includes('matrona')) {
        iconoHTML = '<i class="fas fa-user-nurse"></i>';
        colorFondo = '#0d9488';
    } else if (texto.includes('tens') || texto.includes('paramédico') || texto.includes('farmacia')) {
        iconoHTML = '<i class="fas fa-syringe"></i>';
        colorFondo = '#10b981';
    } else if (texto.includes('kinesiólogo') || texto.includes('psicólogo') || texto.includes('nutricionista')) {
        iconoHTML = '<i class="fas fa-user-shield"></i>';
        colorFondo = '#6366f1';
    } else if (texto.includes('administrativo') || texto.includes('secretaria') || texto.includes('ingeniero')) {
        iconoHTML = '<i class="fas fa-user-tie"></i>';
        colorFondo = '#d97706';
    } else if (texto.includes('conductor') || texto.includes('auxiliar')) {
        iconoHTML = '<i class="fas fa-ambulance"></i>';
        colorFondo = '#475569';
    }

    avatarMain.innerHTML = iconoHTML;
    avatarMain.style.background = colorFondo;

    if (avatarHeader) {
        avatarHeader.innerHTML = iconoHTML;
        avatarHeader.style.background = colorFondo;
    }
}

function obtenerNombreCargoSegunGenero(cargo, genero) {
    if (!cargo) return "";
    if (typeof cargo === 'object') {
        return genero === 'F' ? (cargo.cargo_femenino || cargo.cargo_masculino) : cargo.cargo_masculino;
    }
    return cargo;
}

// ==========================================================================
// 6. DASHBOARD & MAPA LEAFLET
// ==========================================================================
function obtenerEstamentoDeFuncionario(f) {
    if (f.estamento && f.estamento.trim() && f.estamento !== "Sin Estamento") {
        return f.estamento.trim();
    }
    
    if (Array.isArray(catalogosBD.cargos)) {
        const cargoTexto = (f.cargo || f.id_cargo || "").toLowerCase().trim();
        const encontrado = catalogosBD.cargos.find(c => 
            c.id_cargo === f.id_cargo ||
            (c.cargo_masculino && c.cargo_masculino.toLowerCase().trim() === cargoTexto) ||
            (c.cargo_femenino && c.cargo_femenino.toLowerCase().trim() === cargoTexto)
        );
        if (encontrado && encontrado.estamento) {
            return encontrado.estamento.trim();
        }
    }
    return 'Sin Estamento';
}

function calcularEdadDeFuncionario(fechaStr) {
    if (!fechaStr) return null;
    let anio = NaN;
    
    const str = String(fechaStr).trim();
    if (str.includes('-')) {
        const partes = str.split('-');
        if (partes[0].length === 4) {
            anio = parseInt(partes[0]);
        } else if (partes[2] && partes[2].length === 4) {
            anio = parseInt(partes[2]);
        }
    } else if (str.includes('/')) {
        const partes = str.split('/');
        if (partes[2] && partes[2].length === 4) {
            anio = parseInt(partes[2]);
        }
    }

    if (isNaN(anio) || anio < 1920 || anio > 2026) return null;
    
    const hoy = new Date();
    return hoy.getFullYear() - anio;
}

function renderizarDashboard() {
    const total = listaFuncionarios.length;
    
    const fem = listaFuncionarios.filter(f => f.genero && f.genero.trim().toUpperCase() === 'F').length;
    const masc = listaFuncionarios.filter(f => f.genero && f.genero.trim().toUpperCase() === 'M').length;
    const porcFem = total > 0 ? ((fem / total) * 100).toFixed(1) : "0.0";
    const porcMasc = total > 0 ? ((masc / total) * 100).toFixed(1) : "0.0";

    document.getElementById('dashTotalPersonal').innerText = `${total} funcionario${total !== 1 ? 's' : ''}`;
    document.getElementById('dashPorcentajeFemenino').innerText = `${porcFem}%`;
    document.getElementById('dashCantFemenino').innerText = fem;
    document.getElementById('dashPorcentajeMasculino').innerText = `${porcMasc}%`;
    document.getElementById('dashCantMasculino').innerText = masc;
    
    const barFem = document.getElementById('barSegmentoFem');
    const barMasc = document.getElementById('barSegmentoMasc');
    if (barFem) barFem.style.width = `${porcFem}%`;
    if (barMasc) barMasc.style.width = `${porcMasc}%`;

    const totalVehiculos = listaFuncionarios.filter(f => f.vehiculo_tipo && f.vehiculo_tipo.trim() !== "" && f.vehiculo_tipo !== "Sin vehículo").length;
    const elemVehiculos = document.getElementById('dashTotalVehiculos');
    if (elemVehiculos) elemVehiculos.innerText = totalVehiculos;

    let jubilarActual = 0;
    let jubilar1Anio = 0;
    let jubilar2Anios = 0;

    listaFuncionarios.forEach(f => {
        const edad = calcularEdadDeFuncionario(f.fecha_nacimiento);
        if (edad === null) return;
        const esFem = f.genero && f.genero.trim().toUpperCase() === 'F';
        const edadJubilacion = esFem ? 60 : 65;
        const anosRestantes = edadJubilacion - edad;

        if (anosRestantes === 0) jubilarActual++;
        else if (anosRestantes === 1) jubilar1Anio++;
        else if (anosRestantes === 2) jubilar2Anios++;
    });

    document.getElementById('dashJubilarActual').innerText = jubilarActual;
    document.getElementById('dashJubilar1Anio').innerText = jubilar1Anio;
    document.getElementById('dashJubilar2Anios').innerText = jubilar2Anios;

    inicializarGraficos();
    renderizarResumenAntiguedad();
    renderizarRecordsPersonal();
}

function renderizarResumenAntiguedad() {
    const colDemografia = document.getElementById('resumenDemografiaTexto');
    const colTrayectoria = document.getElementById('resumenTrayectoriaTexto');
    if (!colDemografia || !colTrayectoria) return;

    const total = listaFuncionarios.length;
    if (total === 0) {
        colDemografia.innerHTML = "Sin registros válidos.";
        colTrayectoria.innerHTML = "Sin registros válidos.";
        return;
    }

    const anioActual = new Date().getFullYear();
    let edades = [];
    let anosServicio = [];
    let conCorreo = 0;
    let conVehiculo = 0;
    let conAnexo = 0;

    listaFuncionarios.forEach(f => {
        const edad = calcularEdadDeFuncionario(f.fecha_nacimiento);
        if (edad !== null && !isNaN(edad)) edades.push(edad);

        if (f.correo && f.correo.trim() !== '') conCorreo++;
        if (f.vehiculo_tipo && f.vehiculo_tipo.trim() !== '' && f.vehiculo_tipo !== 'Sin vehículo') conVehiculo++;
        if (f.anexo && f.anexo.trim() !== '') conAnexo++;

        const campoFecha = f.fecha_ingreso || f.fechaIngreso || f.ingreso;
        if (campoFecha) {
            let anioIng = null;
            const fechaStr = String(campoFecha).trim();
            if (fechaStr.includes('-') || fechaStr.includes('/')) {
                const sep = fechaStr.includes('-') ? '-' : '/';
                const partes = fechaStr.split(sep);
                if (partes.length >= 3) {
                    anioIng = partes[0].length === 4 ? parseInt(partes[0], 10) : parseInt(partes[2], 10);
                }
            }
            if (!isNaN(anioIng) && anioIng > 1950 && anioIng <= anioActual) {
                anosServicio.push(anioActual - anioIng);
            }
        }
    });

    const promedio = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;
    const mediana = arr => {
        if (!arr.length) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1);
    };

    const edadMin = edades.length ? Math.min(...edades) : 0;
    const edadMax = edades.length ? Math.max(...edades) : 0;
    const minServ = anosServicio.length ? Math.min(...anosServicio) : 0;
    const maxServ = anosServicio.length ? Math.max(...anosServicio) : 0;

    // Columna Izquierda: Datos Demográficos
    colDemografia.innerHTML = `
        • Total de registros analizados: <strong>${total} funcionarios</strong><br>
        • Edad Promedio: <strong>${promedio(edades)} años</strong> (Mediana: ${mediana(edades)} años)<br>
        • Rango Etario: Desde los <strong>${edadMin}</strong> hasta los <strong>${edadMax} años</strong><br>
        • Personal con Correo Institucional: <strong>${conCorreo}</strong> (${((conCorreo/total)*100).toFixed(1)}%)
    `;

    // Columna Derecha: Trayectoria e Indicadores de Conectividad/Recursos
    colTrayectoria.innerHTML = `
        • Años de Servicio Promedio: <strong>${promedio(anosServicio)} años</strong> (Mediana: ${mediana(anosServicio)} años)<br>
        • Antigüedad del Personal: Desde <strong>${minServ}</strong> hasta <strong>${maxServ} años</strong> de servicio<br>
        • Funcionarios con Anexo Telefónico: <strong>${conAnexo}</strong><br>
        • Vehículos Registrados en Red: <strong>${conVehiculo} automóviles</strong>
    `;
}

function renderizarRecordsPersonal() {
    const contenedor = document.getElementById('gridRecordsContainer');
    if (!contenedor || !listaFuncionarios.length) return;

    const anioActual = new Date().getFullYear();

    // Auxiliares de extracción de años
    const getAnioIngreso = f => {
        const campo = f.fecha_ingreso || f.fechaIngreso || f.ingreso;
        if (!campo) return null;
        const str = String(campo).trim();
        const partes = str.includes('-') ? str.split('-') : str.split('/');
        if (partes.length >= 3) {
            const anio = partes[0].length === 4 ? parseInt(partes[0], 10) : parseInt(partes[2], 10);
            return isNaN(anio) ? null : anio;
        }
        return null;
    };

    const getEdad = f => calcularEdadDeFuncionario(f.fecha_nacimiento);

    // Mapear datos enriquecidos para cálculos limpios
    const procesados = listaFuncionarios.map(f => {
        const anioIng = getAnioIngreso(f);
        const anosServicio = anioIng ? anioActual - anioIng : null;
        const edad = getEdad(f);
        const estamento = obtenerEstamentoDeFuncionario(f).toLowerCase();
        const cargo = (f.cargo || '').toLowerCase();
        const nombreCompleto = `${f.nombre || ''} ${f.apellido_paterno || ''} ${f.apellido_materno || ''}`.trim();
        const genero = (f.genero || '').trim().toUpperCase();

        return { ...f, nombreCompleto, anosServicio, edad, estamento, cargo, genero };
    });

    // Filtros por categorías clave
    const conServicio = procesados.filter(f => f.anosServicio !== null && f.anosServicio >= 0);
    const conEdad = procesados.filter(f => f.edad !== null && f.edad > 18 && f.edad < 100);

    // Encontrar récords
    const mayorTrayectoria = conServicio.reduce((max, f) => f.anosServicio > (max?.anosServicio || -1) ? f : max, null);
    const menorTrayectoria = conServicio.reduce((min, f) => f.anosServicio < (min?.anosServicio || 999) ? f : min, null);
    const masLongevo = conEdad.reduce((max, f) => f.edad > (max?.edad || 0) ? f : max, null);
    const masJoven = conEdad.reduce((min, f) => f.edad < (min?.edad || 999) ? f : min, null);

    // Filtros específicos (Género y Estamentos)
    const hombresTrayectoria = conServicio.filter(f => f.genero === 'M').reduce((max, f) => f.anosServicio > (max?.anosServicio || -1) ? f : max, null);
    const mujeresTrayectoria = conServicio.filter(f => f.genero === 'F').reduce((max, f) => f.anosServicio > (max?.anosServicio || -1) ? f : max, null);
    
    const medicoMasAntiguo = conServicio.filter(f => f.cargo.includes('médico') || f.cargo.includes('medica')).reduce((max, f) => f.anosServicio > (max?.anosServicio || -1) ? f : max, null);
    const tensMasAntiguo = conServicio.filter(f => f.cargo.includes('tens') || f.cargo.includes('paramédico')).reduce((max, f) => f.anosServicio > (max?.anosServicio || -1) ? f : max, null);

    // Renderizar tarjetas de récords
    const tarjetaHtml = (icono, titulo, persona, detalle, color) => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; align-items: flex-start; gap: 10px;">
            <div style="background: ${color}20; color: ${color}; width: 36px; height: 36px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
                <i class="fas ${icono}" aria-hidden="true"></i>
            </div>
            <div style="overflow: hidden;">
                <span style="font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">${titulo}</span>
                <strong style="font-size: 0.85rem; color: #1e293b; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${persona?.nombreCompleto || 'N/D'}">
                    ${persona?.nombreCompleto || 'No disponible'}
                </strong>
                <span style="font-size: 0.72rem; color: #0284c7; font-weight: 600; display: block; margin-top: 2px;">${detalle}</span>
            </div>
        </div>
    `;

    contenedor.innerHTML = `
        ${tarjetaHtml('fa-medal', 'Mayor Trayectoria Institucional', mayorTrayectoria, `${mayorTrayectoria?.anosServicio || 0} años de servicio`, '#d97706')}
        ${tarjetaHtml('fa-user-clock', 'Ingreso Más Reciente', menorTrayectoria, `${menorTrayectoria?.unidad || 'Sin unidad'} (${menorTrayectoria?.anosServicio || 0} años)`, '#059669')}
        ${tarjetaHtml('fa-user-tie', 'Médico con Más Antigüedad', medicoMasAntiguo, `${medicoMasAntiguo?.anosServicio || 0} años en el hospital`, '#2563eb')}
        ${tarjetaHtml('fa-user-nurse', 'TENS con Más Antigüedad', tensMasAntiguo, `${tensMasAntiguo?.anosServicio || 0} años en el hospital`, '#0d9488')}
        ${tarjetaHtml('fa-venus', 'Mujer con Más Trayectoria', mujeresTrayectoria, `${mujeresTrayectoria?.anosServicio || 0} años (${mujeresTrayectoria?.cargo || ''})`, '#ec4899')}
        ${tarjetaHtml('fa-mars', 'Hombre con Más Trayectoria', hombresTrayectoria, `${hombresTrayectoria?.anosServicio || 0} años (${hombresTrayectoria?.cargo || ''})`, '#3b82f6')}
        ${tarjetaHtml('fa-user-shield', 'Funcionario Más Longevo', masLongevo, `${masLongevo?.edad || 0} años de edad`, '#7c3aed')}
        ${tarjetaHtml('fa-seedling', 'Funcionario Más Joven', masJoven, `${masJoven?.edad || 0} años de edad`, '#10b981')}
    `;
}

function inicializarGraficos() {
    const coloresBase = ['#2563eb', '#059669', '#d97706', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f43f5e'];

    let conteoEstamentos = {};
    listaFuncionarios.forEach(f => {
        const est = obtenerEstamentoDeFuncionario(f);
        conteoEstamentos[est] = (conteoEstamentos[est] || 0) + 1;
    });
    const ctxEstamento = document.getElementById('chartEstamento')?.getContext('2d');
    if (ctxEstamento) {
        if (chartEstamentoInstance) chartEstamentoInstance.destroy();
        chartEstamentoInstance = new Chart(ctxEstamento, {
            type: 'doughnut',
            data: {
                labels: Object.keys(conteoEstamentos).length ? Object.keys(conteoEstamentos) : ['Sin datos'],
                datasets: [{ data: Object.values(conteoEstamentos).length ? Object.values(conteoEstamentos) : [1], backgroundColor: coloresBase, borderWidth: 2, borderColor: '#ffffff' }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } }, cutout: '60%' }
        });
    }

    let conteoEdades = { 'Menores de 30': 0, '30 a 45 años': 0, '46 a 60 años': 0, 'Mayores de 60': 0 };
    listaFuncionarios.forEach(f => {
        const edad = calcularEdadDeFuncionario(f.fecha_nacimiento);
        if (edad === null) return;
        if (edad < 30) conteoEdades['Menores de 30']++;
        else if (edad <= 45) conteoEdades['30 a 45 años']++;
        else if (edad <= 60) conteoEdades['46 a 60 años']++;
        else conteoEdades['Mayores de 60']++;
    });
    const ctxEdades = document.getElementById('chartEdades')?.getContext('2d');
    if (ctxEdades) {
        if (chartEdadesInstance) chartEdadesInstance.destroy();
        chartEdadesInstance = new Chart(ctxEdades, {
            type: 'doughnut',
            data: {
                labels: Object.keys(conteoEdades),
                datasets: [{ data: Object.values(conteoEdades), backgroundColor: ['#38bdf8', '#0284c7', '#1e40af', '#1e1b4b'], borderWidth: 2, borderColor: '#ffffff' }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } }, cutout: '60%' }
        });
    }

    let conteoUnidades = {};
    listaFuncionarios.forEach(f => {
        const u = f.unidad ? f.unidad.trim() : 'Sin Unidad';
        conteoUnidades[u] = (conteoUnidades[u] || 0) + 1;
    });
    const ctxUnidades = document.getElementById('chartUnidades')?.getContext('2d');
    if (ctxUnidades) {
        if (chartUnidadesInstance) chartUnidadesInstance.destroy();
        chartUnidadesInstance = new Chart(ctxUnidades, {
            type: 'doughnut',
            data: {
                labels: Object.keys(conteoUnidades),
                datasets: [{ data: Object.values(conteoUnidades), backgroundColor: coloresBase, borderWidth: 2, borderColor: '#ffffff' }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } }, cutout: '60%' }
        });
    }

    let conteoCiudades = {};
    listaFuncionarios.forEach(f => {
        const ciudad = f.ciudad ? f.ciudad.trim() : 'No especificada';
        conteoCiudades[ciudad] = (conteoCiudades[ciudad] || 0) + 1;
    });
    const ctxCiudades = document.getElementById('chartCiudades')?.getContext('2d');
    if (ctxCiudades) {
        if (chartCiudadesInstance) chartCiudadesInstance.destroy();
        chartCiudadesInstance = new Chart(ctxCiudades, {
            type: 'doughnut',
            data: {
                labels: Object.keys(conteoCiudades),
                datasets: [{ data: Object.values(conteoCiudades), backgroundColor: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'], borderWidth: 2, borderColor: '#ffffff' }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } }, cutout: '60%' }
        });
    }
}

function inicializarMapaFuncionarios() {
    const contenedorMapa = document.getElementById('mapaFuncionarios');
    if (!contenedorMapa) return;

    if (mapaAnalitico) {
        mapaAnalitico.invalidateSize();
        return;
    }

    const latLanco = -39.4534;
    const lonLanco = -72.4357;

    mapaAnalitico = L.map('mapaFuncionarios').setView([latLanco, lonLanco], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapaAnalitico);

    capaPines = L.layerGroup().addTo(mapaAnalitico);

    listaFuncionarios.forEach(func => {
        if (!func.direccion) return;

        let latVar = latLanco + (Math.random() - 0.5) * 0.04;
        let lonVar = lonLanco + (Math.random() - 0.5) * 0.04;

        const nombreCompleto = `${func.nombre || ''} ${func.apellido_paterno || ''}`.trim() || 'Funcionario';
        const estamentoText = func.estamento || 'Sin estamento';
        const direccionText = func.direccion || 'Sin dirección';

        const contenidoPopup = `
            <div style="font-family: 'Segoe UI', sans-serif; font-size: 0.8rem; line-height: 1.3;">
                <strong style="color: var(--slate-900); font-size: 0.85rem; display: block; margin-bottom: 2px;">${nombreCompleto}</strong>
                <span style="color: var(--primary); font-weight: 600; display: block;">${estamentoText}</span>
                <span style="color: var(--slate-600); display: block; margin-top: 4px;"><i class="fas fa-home"></i> ${direccionText}, ${func.ciudad || 'Lanco'}</span>
            </div>
        `;

        const marker = L.marker([latVar, lonVar]).bindPopup(contenidoPopup);
        capaPines.addLayer(marker);
    });

    setTimeout(() => { if (mapaAnalitico) mapaAnalitico.invalidateSize(); }, 100);
}

// ==========================================================================
// 7. CONTACTOS RELACIONADOS Y EXPORTACIÓN
// ==========================================================================
function actualizarContactosRelacionados(funcActivo) {
    const contenedor = document.getElementById('contactosRelacionadosContainer');
    if (!contenedor) return;

    if (!funcActivo || !listaFuncionarios || listaFuncionarios.length === 0) {
        contenedor.innerHTML = '<div class="text-muted p-2" style="font-size: 0.75rem;">Sin selección activa.</div>';
        return;
    }

    const unidadActiva = (funcActivo.unidad || '').trim().toLowerCase();
    const estamentoActivo = (funcActivo.estamento || '').trim().toLowerCase();

    const relacionados = listaFuncionarios.filter(f => {
        if (f.rut === funcActivo.rut) return false;
        const uComp = (f.unidad || '').trim().toLowerCase();
        const eComp = (f.estamento || '').trim().toLowerCase();
        return (unidadActiva && uComp === unidadActiva) || (estamentoActivo && eComp === estamentoActivo);
    }).slice(0, 5);

    if (relacionados.length === 0) {
        contenedor.innerHTML = '<div class="text-muted p-2" style="font-size: 0.75rem;">No se encontraron contactos relacionados.</div>';
        return;
    }

    let html = '';
    relacionados.forEach(c => {
        const nombre = `${c.nombre || ''} ${c.apellido_paterno || ''}`.trim();
        const cargo = obtenerNombreCargoSegunGenero(c.cargo, c.genero) || 'Sin cargo';
        const coincideUnidad = unidadActiva && (c.unidad || '').trim().toLowerCase() === unidadActiva;
        const motivo = coincideUnidad ? `Unidad: ${c.unidad}` : `Estamento: ${c.estamento}`;

        html += `
            <a href="#" onclick="editarFuncionario('${c.rut}'); return false;" class="list-group-item list-group-item-action border-0 px-2 py-1 my-1 rounded" style="text-decoration: none; display: block; background: var(--slate-50); border-radius: 6px; margin-bottom: 4px; padding: 6px 8px;">
                <div class="fw-semibold" style="font-size: 0.8rem; color: var(--primary); font-weight: 700;">${nombre}</div>
                <div style="font-size: 0.73rem; color: var(--slate-800);">${cargo}</div>
                <small style="font-size: 0.68rem; color: var(--slate-600);">${motivo}</small>
            </a>
        `;
    });

    contenedor.innerHTML = html;
}

function exportarDirectorioCSV() {
    let csv = "RUT,Nombre,Apellido Paterno,Apellido Materno,Estamento,Cargo,Correo\n";
    listaFuncionarios.forEach(f => {
        const cargoText = obtenerNombreCargoSegunGenero(f.cargo, f.genero);
        csv += `"${f.rut}","${f.nombre}","${f.apellido_paterno}","${f.apellido_materno}","${f.estamento}","${cargoText}","${f.correo}"\r\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "directorio_personal.csv";
    link.click();
}