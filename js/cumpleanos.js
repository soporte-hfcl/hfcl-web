/**
 * Módulo de Cumpleaños Integrado con la Base de Datos de Google Sheets
 */

const MONTH_NAMES_CUMPLE = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

document.addEventListener('DOMContentLoaded', () => {
    // Se ejecuta al cargar; se reintentará cuando la nube cargue datos
    setTimeout(initCumpleanosWidget, 1000);
});

function obtenerCumpleanosDelMesActual(mesNum) {
    const lista = [];
    if (!Array.isArray(listaFuncionarios)) return lista;

    listaFuncionarios.forEach(datos => {
        const campoFecha = datos.fecha_nacimiento || datos.cumpleanos || datos["fecha_nacimiento"];
        if (!campoFecha) return;

        let diaNac = null;
        let mesNac = null;
        const fechaStr = String(campoFecha).trim();

        // Soporte para formato DD-MM-YYYY o DD/MM/YYYY
        if (fechaStr.includes('-') || fechaStr.includes('/')) {
            const separador = fechaStr.includes('-') ? '-' : '/';
            const partes = fechaStr.split(separador);
            if (partes.length >= 3) {
                // Si el año viene primero (YYYY-MM-DD)
                if (partes[0].length === 4) {
                    mesNac = parseInt(partes[1], 10);
                    diaNac = parseInt(partes[2], 10);
                } else {
                    // Formato chileno (DD-MM-YYYY)
                    diaNac = parseInt(partes[0], 10);
                    mesNac = parseInt(partes[1], 10);
                }
            }
        }

        if (mesNac === Number(mesNum) && !isNaN(diaNac)) {
            const nombreCompleto = `${datos.nombre || ''} ${datos.apellido_paterno || ''} ${datos.apellido_materno || ''}`.trim();
            lista.push({
                nombre: nombreCompleto || 'Funcionario',
                cargo: datos.cargo || 'Funcionario Hospital',
                dia: diaNac
            });
        }
    });

    lista.sort((a, b) => a.dia - b.dia);
    return lista;
}

function initCumpleanosWidget() {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1; 
    const diaActual = hoy.getDate();

    const cumpleCardText = document.getElementById('cumpleResumenTexto');
    if (!cumpleCardText) return;
    
    const mesNombre = MONTH_NAMES_CUMPLE[mesActual - 1];
    const cumpleDelMes = obtenerCumpleanosDelMesActual(mesActual);

    if (cumpleDelMes.length > 0) {
        const cumpleHoy = cumpleDelMes.filter(p => p.dia === diaActual);

        if (cumpleHoy.length > 0) {
            const infoHoy = cumpleHoy.map(p => `<strong>${p.nombre}</strong> (${p.cargo})`).join(', ');
            cumpleCardText.innerHTML = `🎉 ¡Hoy está de cumpleaños: ${infoHoy}! Muchas felicidades.`;
        } else {
            cumpleCardText.innerHTML = `¡Saludamos con mucho cariño a los cumpleañeros de <strong>${mesNombre}</strong>! Revisa la lista detallada y sus cargos.`;
        }
    } else {
        cumpleCardText.innerHTML = `No hay registros de cumpleaños para este mes (${mesNombre}).`;
    }
}

function openCumpleModal() {
    const modal = document.getElementById('cumpleModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        renderListaCumpleanosModal();
    }
}

function closeCumpleModal() {
    const modal = document.getElementById('cumpleModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}