/**
 * ==========================================
 * NÚCLEO DE CONEXIÓN A LA NUBE (Google Sheets / Apps Script)
 * ==========================================
 * Centraliza todas las peticiones fetch para la intranet.
 */

// URL única y real de la Web App de Google Apps Script
const URL_API_SHEETS = "https://script.google.com/macros/s/AKfycby_MZCFYKhRSaKl0hoFQWW5G6nZQNX8nC8CXljeGdrgeLt_Hb43SHMIFjJ4e3AbJkQPAA/exec";

/**
 * Carga datos de un recurso específico desde la nube con respaldo en localStorage.
 * @param {string} recurso - Nombre del recurso a solicitar (ej: 'funcionarios', 'red', 'agenda')
 * @param {string} [claveCache] - Clave opcional para guardar una copia local en localStorage
 * @returns {Promise<Array|Object>} - Retorna los datos parseados o un array vacío en caso de error
 */
async function cargarDatosCloud(recurso = '', claveCache = null) {
    try {
        const respuesta = await fetch(URL_API_SHEETS, {
            method: "GET",
            redirect: "follow"
        });
        
        const textoRespuesta = await respuesta.text();
        
        if (!textoRespuesta || textoRespuesta.includes("No se pudo abrir") || textoRespuesta.includes("<!DOCTYPE html>")) {
            throw new Error("Google devolvió una página de error o bloqueo de sesión.");
        }

        const datos = JSON.parse(textoRespuesta);
        
        if (datos && (typeof datos === 'object')) {
            if (claveCache) {
                localStorage.setItem(claveCache, JSON.stringify(datos));
            }
            return datos;
        }
        return {};
    } catch (error) {
        console.warn(`Aviso de red, recurriendo a caché local de respaldo...`, error);
        
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
        const response = await fetch(URL_API_SHEETS, {
            method: 'POST',
            redirect: 'follow', // Forzar el seguimiento correcto de la redirección de Google
            headers: {
                'Content-Type': 'text/plain;charset=utf-8' // Evita que Google dispare preflight CORS complejos
            },
            body: JSON.stringify(payload)
        });
        
        const text = await response.text();
        
        // Validar si Google devolvió la página HTML de error 404 en vez del JSON
        if (!text || text.includes("<!DOCTYPE html>") || text.includes("No se pudo abrir")) {
            console.error("Google Apps Script bloqueó el POST o devolvió HTML de error:", text);
            return false;
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("El servidor no devolvió un JSON válido:", text);
            return false;
        }
    } catch (error) {
        console.error("Error de red en enviarDatosCloud:", error);
        return false;
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