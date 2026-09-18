/**
 * ==========================================
 * NÚCLEO DE CONEXIÓN A LA NUBE (Google Sheets / Apps Script)
 * ==========================================
 * Centraliza todas las peticiones fetch para la intranet.
 */

// Asegúrate de colocar aquí tu URL real de la Web App de Google Apps Script
const URL_API_SHEETS = "https://script.google.com/macros/s/AKfycby_MZCFYKhRSaKl0hoFQWW5G6nZQNX8nC8CXljeGdrgeLt_Hb43SHMIFjJ4e3AbJkQPAA/exec";

/**
 * Carga datos de un recurso específico desde la nube con respaldo en localStorage.
 * @param {string} recurso - Nombre del recurso a solicitar (ej: 'funcionarios', 'red', 'agenda')
 * @param {string} [claveCache] - Clave opcional para guardar una copia local en localStorage
 * @returns {Promise<Array|Object>} - Retorna los datos parseados o un array vacío en caso de error
 */
async function cargarDatosCloud(recurso = '', claveCache = null) {
    try {
        // Hacemos el GET directo a la URL de Apps Script sin parámetros innecesarios
        const respuesta = await fetch(URL_API_SHEETS);
        const datos = await respuesta.json();
        
        if (datos && (typeof datos === 'object')) {
            if (claveCache) {
                localStorage.setItem(claveCache, JSON.stringify(datos));
            }
            return datos;
        }
        return {};
    } catch (error) {
        console.warn(`Sin conexión a la nube, intentando respaldo local...`, error);
        
        if (claveCache) {
            const cacheLocal = localStorage.getItem(claveCache);
            if (cacheLocal) {
                try {
                    return JSON.parse(cacheLocal);
                } catch (e) {
                    console.error("Error al leer la caché local:", e);
                }
            }
        }
        return {};
    }
}

/**
 * Envía datos (Guardar, Editar o Eliminar) hacia la nube mediante POST.
 * @param {Object} payload - Objeto con la acción y los datos correspondientes
 * @returns {Promise<Object>} - Resultado de la operación devuelto por el servidor
 */
async function enviarDatosCloud(payload) {
    try {
        const respuesta = await fetch(URL_API_SHEETS, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8" // Vital para que Google Apps Script procese el JSON sin bloqueos CORS
            },
            body: JSON.stringify(payload),
            redirect: "follow" // Necesario para seguir la redirección interna de Google
        });
        
        const textoRespuesta = await respuesta.text();
        
        try {
            return JSON.parse(textoRespuesta);
        } catch (e) {
            console.error("El servidor no devolvió un JSON válido:", textoRespuesta);
            return { status: "error", message: "Respuesta inválida del servidor" };
        }
    } catch (error) {
        console.error("Error en la operación de escritura en la nube:", error);
        return { status: "error", message: error.message };
    }
}

// ==========================================
// MÉTODOS ESPECÍFICOS DE COMPATIBILIDAD (Funcionarios)
// ==========================================

async function cargarFuncionariosCloud() {
    const datos = await cargarDatosCloud('funcionarios', 'hfc_lan_contacts_data');
    if (Array.isArray(datos) && datos.length > 0) {
        listaFuncionarios = datos;
        if (typeof renderizarTablaFuncionarios === 'function') renderizarTablaFuncionarios();
        if (typeof initCumpleanosWidget === 'function') initCumpleanosWidget();
        if (typeof renderSidebarAniversariosTop === 'function') renderSidebarAniversariosTop();
    }
}

async function cargarFuncionariosCloudSilencioso() {
    const datos = await cargarDatosCloud('funcionarios', 'hfc_lan_contacts_data');
    if (Array.isArray(datos) && datos.length > 0) {
        listaFuncionarios = datos;
        if (typeof renderizarTablaFuncionarios === 'function') renderizarTablaFuncionarios();
        if (typeof initCumpleanosWidget === 'function') initCumpleanosWidget();
        if (typeof renderSidebarAniversariosTop === 'function') renderSidebarAniversariosTop();
    }
}

async function guardarFuncionarioCloud(funcionario) {
    const payload = {
        action: funcionario.id ? "editar" : "guardar",
        funcionario: funcionario
    };
    
    const resultado = await enviarDatosCloud(payload);
    
    if (resultado && resultado.status === "success") {
        alert("¡Cambios guardados en Google Sheets con éxito!");
        await cargarFuncionariosCloud();
        if (typeof renderizarTablaFuncionarios === 'function') renderizarTablaFuncionarios();
        if (typeof renderSidebarAniversariosTop === 'function') renderSidebarAniversariosTop();
        if (typeof initCumpleanosWidget === 'function') initCumpleanosWidget();
    } else {
        alert("Hubo un error al guardar en la nube.");
    }
}

async function eliminarFuncionarioCloud(id) {
    if (confirm("¿Estás seguro de eliminar a este funcionario de la planilla de Google Sheets?")) {
        const payload = {
            action: "eliminar",
            id: id
        };
        
        const resultado = await enviarDatosCloud(payload);
        
        if (resultado && resultado.status === "success") {
            await cargarFuncionariosCloud();
        } else {
            alert("No se pudo eliminar el registro.");
        }
    }
}