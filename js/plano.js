const SERVICIOS_MAPA = [
    {
        id: "urgencia",
        nombre: "Servicio de Urgencia",
        ubicacion: "Sector Poniente (Acceso Principal)",
        anexo: "110",
        responsable: "Matrón(a) / Turno en Curso",
        icono: "fa-ambulance",
        bg: "#fef2f2",
        color: "#ef4444",
        gridArea: "1 / 1 / 2 / 2" // Posición en el plano
    },
    {
        id: "tic",
        nombre: "Unidad TIC (Informática)",
        ubicacion: "Ala Administrativa - Pasillo Principal",
        anexo: "105",
        responsable: "José Paineñanco Durán",
        icono: "fa-laptop-code",
        bg: "#f0f9ff",
        color: "#0284c7",
        gridArea: "1 / 2 / 2 / 3"
    },
    {
        id: "direccion",
        nombre: "Dirección y Administración",
        ubicacion: "Segundo Piso - Ala Administrativa",
        anexo: "101",
        responsable: "Dirección del Establecimiento",
        icono: "fa-building",
        bg: "#f8fafc",
        color: "#64748b",
        gridArea: "1 / 3 / 2 / 4"
    },
    {
        id: "farmacia",
        nombre: "Farmacia",
        ubicacion: "Sector Clínico - Zona Policlínico",
        anexo: "118",
        responsable: "Químico Farmacéutico",
        icono: "fa-pills",
        bg: "#f0fdf4",
        color: "#10b981",
        gridArea: "2 / 1 / 3 / 2"
    },
    {
        id: "laboratorio",
        nombre: "Laboratorio Clínico",
        ubicacion: "Pasillo Central - Toma de Muestras",
        anexo: "125",
        responsable: "Tecnólogo Médico en Turno",
        icono: "fa-flask",
        bg: "#faf5ff",
        color: "#8b5cf6",
        gridArea: "2 / 2 / 3 / 3"
    },
    {
        id: "hospitalizacion",
        nombre: "Hospitalización",
        ubicacion: "Ala Norte - Segundo Nivel",
        anexo: "130",
        responsable: "Enfermera(o) Residente",
        icono: "fa-bed",
        bg: "#ecfeff",
        color: "#06b6d4",
        gridArea: "2 / 3 / 3 / 4"
    },
    {
        id: "samu",
        nombre: "Base SAMU",
        ubicacion: "Acceso Posterior / Sector Ambulancias",
        anexo: "112",
        responsable: "Conductor / TENS en Turno",
        icono: "fa-phone-alt",
        bg: "#fffbeb",
        color: "#f59e0b",
        gridArea: "3 / 1 / 4 / 2"
    },
    {
        id: "salacuna",
        nombre: "Sala Cuna",
        ubicacion: "Sector Periférico Recinto Hospitalario",
        anexo: "140",
        responsable: "Educadora a Cargo",
        icono: "fa-child",
        bg: "#fdf2f8",
        color: "#ec4899",
        gridArea: "3 / 2 / 4 / 3"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    renderizarPlanoMapa();
    // Seleccionar por defecto Urgencia al abrir
    seleccionarZona('urgencia');
});

function renderizarPlanoMapa() {
    const contenedor = document.getElementById('hospitalMapContainer');
    if (!contenedor) return;

    contenedor.innerHTML = SERVICIOS_MAPA.map(s => `
        <div class="map-zone" id="zone-${s.id}" onclick="seleccionarZona('${s.id}')" style="background-color: ${s.bg}; border-left: 4px solid ${s.color};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span style="font-size: 0.75rem; font-weight: 700; color: ${s.color}; text-transform: uppercase;">ZONA ${s.id}</span>
                <i class="fas ${s.icono}" style="font-size: 1.1rem; color: ${s.color};"></i>
            </div>
            <div>
                <h4 style="margin: 0 0 2px 0; font-size: 0.9rem; color: #0f172a;">${s.nombre}</h4>
                <span style="font-size: 0.72rem; color: #64748b;"><i class="fas fa-map-marker-alt"></i> ${s.ubicacion}</span>
            </div>
        </div>
    `).join('');
}

function seleccionarZona(idZona) {
    // Quitar clase active a todas las zonas
    document.querySelectorAll('.map-zone').forEach(el => el.classList.remove('active'));
    
    // Activar la seleccionada
    const targetCard = document.getElementById(`zone-${idZona}`);
    if (targetCard) targetCard.classList.add('active');

    const servicio = SERVICIOS_MAPA.find(s => s.id === idZona);
    const detalleContainer = document.getElementById('detalleZonaContainer');
    
    if (!servicio || !detalleContainer) return;

    detalleContainer.style.display = 'block';
    detalleContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 50px; height: 50px; background: ${servicio.color}20; color: ${servicio.color}; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
                <i class="fas ${servicio.icono}"></i>
            </div>
            <div style="flex: 1;">
                <h3 style="margin: 0 0 4px 0; font-size: 1.1rem; color: #0f172a;">${servicio.nombre}</h3>
                <p style="margin: 0 0 8px 0; font-size: 0.82rem; color: #475569;"><i class="fas fa-map-marker-alt" style="color: #ef4444;"></i> Ubicación: <strong>${servicio.ubicacion}</strong></p>
                <div style="display: flex; gap: 20px; font-size: 0.8rem; flex-wrap: wrap;">
                    <span>👤 <strong>Responsable:</strong> ${servicio.responsable}</span>
                    <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600;"><i class="fas fa-phone-alt"></i> Anexo: ${servicio.anexo}</span>
                </div>
            </div>
        </div>
    `;
}