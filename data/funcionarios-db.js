/**
 * Base de Datos Centralizada de Funcionarios - Hospital de Lanco
 */

// Cargar funcionarios desde Google Sheets en tiempo real (con caché local)
async function cargarFuncionariosCloud() {
    try {
        const respuesta = await fetch(URL_API_SHEETS);
        const datos = await respuesta.json();
        if (Array.isArray(datos)) {
            listaFuncionarios = datos;
            localStorage.setItem('hfc_lan_contacts_data', JSON.stringify(datos));
            if (typeof renderizarTablaFuncionarios === 'function') renderizarTablaFuncionarios();
            if (typeof initCumpleanosWidget === 'function') initCumpleanosWidget();
            if (typeof renderSidebarAniversariosTop === 'function') renderSidebarAniversariosTop();
        }
    } catch (error) {
        console.error("Error al conectar con la base de datos en la nube:", error);
    }
}

async function cargarFuncionariosCloudSilencioso() {
    try {
        const respuesta = await fetch(URL_API_SHEETS);
        const datos = await respuesta.json();
        if (Array.isArray(datos) && datos.length > 0) {
            listaFuncionarios = datos;
            localStorage.setItem('hfc_lan_contacts_data', JSON.stringify(datos));
            if (typeof renderizarTablaFuncionarios === 'function') renderizarTablaFuncionarios();
            if (typeof initCumpleanosWidget === 'function') initCumpleanosWidget();
            if (typeof renderSidebarAniversariosTop === 'function') renderSidebarAniversariosTop();
        }
    } catch (error) {
        console.warn("Sin conexión a la nube, usando datos locales almacenados.", error);
    }
}

// Guardar o Editar Funcionario en la nube
async function guardarFuncionarioCloud(funcionario) {
    try {
        const respuesta = await fetch(URL_API_SHEETS, {
            method: "POST",
            body: JSON.stringify({
                action: funcionario.id ? "editar" : "guardar",
                funcionario: funcionario
            })
        });
        const resultado = await respuesta.json();
        if (resultado.status === "success") {
            alert("¡Cambios guardados en Google Sheets con éxito!");
            await cargarFuncionariosCloud();
            renderizarTablaFuncionarios();
            renderSidebarAniversariosTop();
            initCumpleanosWidget();
        } else {
            alert("Hubo un error al guardar en la nube.");
        }
    } catch (error) {
        console.error("Error en la operación de guardado:", error);
    }
}

// Eliminar Funcionario de la nube
async function eliminarFuncionarioCloud(id) {
    if (confirm("¿Estás seguro de eliminar a este funcionario de la planilla de Google Sheets?")) {
        try {
            const respuesta = await fetch(URL_API_SHEETS, {
                method: "POST",
                body: JSON.stringify({
                    action: "eliminar",
                    id: id
                })
            });
            const resultado = await respuesta.json();
            if (resultado.status === "success") {
                await cargarFuncionariosCloud();
            } else {
                alert("No se pudo eliminar el registro.");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}