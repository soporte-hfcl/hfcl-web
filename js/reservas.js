/**
 * Módulo de Reserva de Espacios - Hospital de Lanco
 */

document.addEventListener('DOMContentLoaded', () => {
    cargarReservas();

    const form = document.getElementById('formReserva');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nuevaReserva = {
            id: Date.now(),
            espacio: document.getElementById('reservaEspacio').value,
            motivo: document.getElementById('reservaMotivo').value,
            solicitante: document.getElementById('reservaSolicitante').value,
            fecha: document.getElementById('reservaFecha').value,
            bloque: document.getElementById('reservaBloque').value
        };

        guardarReserva(nuevaReserva);
        form.reset();
        cargarReservas();
        alert('¡Espacio reservado con éxito!');
    });
});

function obtenerReservasStorage() {
    let reservas = localStorage.getItem('hospital_reservas_espacios');
    return reservas ? JSON.parse(reservas) : [];
}

function guardarReserva(reserva) {
    let reservas = obtenerReservasStorage();
    reservas.push(reserva);
    localStorage.setItem('hospital_reservas_espacios', JSON.stringify(reservas));
}

function eliminarReserva(id) {
    if (confirm('¿Estás seguro de liberar y eliminar esta reserva?')) {
        let reservas = obtenerReservasStorage();
        reservas = reservas.filter(r => r.id !== id);
        localStorage.setItem('hospital_reservas_espacios', JSON.stringify(reservas));
        cargarReservas();
    }
}

function cargarReservas() {
    const contenedor = document.getElementById('listaReservasContainer');
    const contador = document.getElementById('contadorReservas');
    const reservas = obtenerReservasStorage();

    contador.innerText = `${reservas.length} registrada${reservas.length === 1 ? '' : 's'}`;

    if (reservas.length === 0) {
        contenedor.innerHTML = `<p style="text-align: center; color: #94a3b8; padding: 40px; margin: 0;">No hay espacios reservados actualmente. ¡Crea la primera solicitud a la izquierda!</p>`;
        return;
    }

    // Ordenar por fecha más cercana
    reservas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    contenedor.innerHTML = reservas.map(r => `
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; border-left: 4px solid #0284c7; display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.95rem; font-weight: 700; color: #0f172a;"><i class="fas fa-building"></i> ${r.espacio}</span>
                    <span style="font-size: 0.7rem; background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${r.bloque}</span>
                </div>
                <p style="margin: 2px 0; font-size: 0.88rem; color: #334155;"><strong>Motivo:</strong> ${r.motivo}</p>
                <div style="font-size: 0.8rem; color: #64748b; display: flex; gap: 15px; margin-top: 4px;">
                    <span><i class="fas fa-user"></i> ${r.solicitante}</span>
                    <span><i class="fas fa-calendar-day"></i> ${r.fecha}</span>
                </div>
            </div>
            <button onclick="eliminarReserva(${r.id})" title="Liberar espacio" style="background: #fee2e2; color: #dc2626; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');
}