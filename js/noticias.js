// ==========================================
// BANCO DE NOTICIAS PÚBLICAS Y GESTIÓN - HFCL LANCO
// ==========================================

const noticiasHospital = [
    {
        id: "noticia-1",
        titulo: "Hospital de Lanco destacó avances en resolutividad y nuevas prestaciones",
        fecha: "2026-07-28",
        etiqueta: "Gestión y Resolutividad",
        imagen: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
        desc: "El establecimiento ha reportado importantes avances en la optimización de su resolutividad local, ampliando nuevas prestaciones en beneficio directo de la comunidad usuaria.",
        contenido: "El Hospital Familiar y Comunitario de Lanco ha reportado importantes avances en la optimización de su resolutividad local, ampliando nuevas prestaciones en beneficio directo de la comunidad usuaria. Gracias al trabajo coordinado de los equipos clínicos, de gestión de la demanda y apoyo técnico, se han reducido los tiempos de espera y mejorado la oportunidad en la entrega de atenciones ambulatorias y de urgencia.<br><br>Asimismo, las jefaturas destacaron que este esfuerzo responde a los lineamientos de mejora continua institucionales y al compromiso de los funcionarios por brindar una atención cercana, segura y con pertinencia territorial para toda la comuna y sectores rurales asociados."
    },
    {
        id: "noticia-2",
        titulo: "Servicio de Salud Los Ríos formaliza renovación de ambulancias avanzadas",
        fecha: "2026-05-19",
        etiqueta: "Flota y Urgencia",
        imagen: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
        desc: "Entrega presencial de dos móviles de emergencia de última generación financiadas a través del FNDR para sustituir equipamiento crítico.",
        contenido: "Con la presencia de autoridades regionales y directivos del Servicio de Salud Los Ríos, se realizó la entrega formal de dos nuevos móviles de emergencia avanzada destinados al soporte vital prehospitalario. Estas unidades, financiadas a través del Fondo Nacional de Desarrollo Regional (FNDR), permiten renovar la flota crítica y asegurar traslados seguros y oportunos hacia los centros de mayor complejidad de la red."
    },
    {
        id: "noticia-3",
        titulo: "Comunidad de Lanco y su vinculación activa con la red de salud local",
        fecha: "2024-05-15",
        etiqueta: "Participación",
        imagen: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
        desc: "Revisión de las iniciativas de participación ciudadana y trabajo colaborativo junto a los vecinos y organizaciones territoriales de la comuna.",
        contenido: "El Consejo de Desarrollo Local (CODELO) y los equipos de participación ciudadana del hospital sostuvieron una nueva mesa de trabajo territorial. En la instancia se evaluaron las principales demandas de la comunidad, reforzando los canales de comunicación directa y el rol activo de las organizaciones sociales en la mejora continua de la salud pública comunitaria."
    },
    {
        id: "noticia-4",
        titulo: "Hospital de Lanco logró segunda acreditación en calidad y seguridad",
        fecha: "2023-08-01",
        etiqueta: "Calidad",
        imagen: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
        desc: "Reconocimiento oficial que ratifica el cumplimiento de los más altos estándares de calidad y seguridad exigidos para la atención cerrada de baja complejidad.",
        contenido: "Tras un riguroso proceso de evaluación por parte de entidades acreditadoras externas, el Hospital de Lanco ratificó formalmente su segunda acreditación en calidad y seguridad del paciente. Este hito consagra el estricto cumplimiento de los protocolos asistenciales, gestión de riesgos y seguridad en los procesos clínicos, otorgando absoluta garantía a los usuarios."
    },
    {
        id: "noticia-5",
        titulo: "Hospital de Lanco incorpora cirujanos y conforma equipo quirúrgico para listas de espera",
        fecha: "2023-08-07",
        etiqueta: "Quirófano",
        imagen: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
        desc: "Con el objetivo de agilizar la atención quirúrgica, el recinto consolidó su propio equipo médico y quirúrgico para apoyar activamente en la reducción de listas de espera regionales.",
        contenido: "Consolidando su capacidad operativa de baja complejidad, el establecimiento incorporó de forma permanente a profesionales cirujanos y personal de apoyo anestésico. Esto ha permitido dar marcha blanca y funcionamiento continuo al pabellón quirúrgico local, desconcentrando la demanda regional y resolviendo intervenciones de mediana y baja complejidad en la propia comuna."
    },   
    {
        id: "noticia-7",
        titulo: "Establecimiento obtiene su primera acreditación de calidad sanitaria",
        fecha: "2019-02-20",
        etiqueta: "Hito Histórico",
        imagen: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80",
        desc: "Certificación inicial otorgada por la Superintendencia de Salud que avala el cumplimiento de los procesos clínicos seguros.",
        contenido: "Mediante la Resolución Exenta IP correspondiente, la Superintendencia de Salud certificó por primera vez al Hospital de Lanco como establecimiento acreditado en calidad, validando que sus protocolos de atención cumplen con los estándares nacionales de seguridad para los pacientes y funcionarios."
    },
    {
        id: "noticia-8",
        titulo: "Ministerio de Salud destaca operación de unidades móviles odontológicas en Lanco",
        fecha: "2018-04-16",
        etiqueta: "Odontología",
        imagen: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80",
        desc: "Potenciando el acceso preventivo y restaurativo mediante los programas Más Sonrisas y Sembrando Sonrisas.",
        contenido: "El despliegue territorial de las clínicas dentales móviles permitió acercar la atención odontológica integral a sectores rurales apartados de Lanco y Malalhue, beneficiando a niños, jóvenes y mujeres trabajadoras con prestaciones preventivas y de recuperación de salud bucal."
    },
    {
        id: "noticia-9",
        titulo: "Pabellón quirúrgico del Hospital de Lanco fue inaugurado con exitosa operación",
        fecha: "2018-03-11",
        etiqueta: "Infraestructura",
        imagen: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80",
        desc: "Un avance histórico para la comuna que permitió comenzar con intervenciones quirúrgicas locales, beneficiando también a pacientes de comunas vecinas.",
        contenido: "Con una intervención menor realizada con éxito absoluto en el nuevo bloque quirúrgico, se dio inicio formal a las cirugías electivas en el hospital. Este hecho marcó un antes y un después en la historia sanitaria de la comuna, evitando traslados innecesarios a hospitales base."
    },
    {
        id: "noticia-10",
        titulo: "Inauguración oficial del nuevo edificio asistencial e incorporación de especialidades",
        fecha: "2017-09-08",
        etiqueta: "Desarrollo",
        imagen: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
        desc: "Las autoridades nacionales de salud incorporaron de manera inédita pediatría y medicina familiar a la cartera de prestaciones.",
        contenido: "La puesta en marcha del moderno edificio asistencial permitió ampliar significativamente la cartera de servicios ambulatorios, integrando especialidades médicas esenciales para el modelo de salud familiar y comunitario que sustenta el establecimiento."
    },
    {
        id: "noticia-11",
        titulo: "Subsecretaría de Redes Asistenciales encabeza puesta en marcha técnica de la nueva planta física",
        fecha: "2017-08-29",
        etiqueta: "Gestión TIC",
        imagen: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80",
        desc: "Concretando la migración digital y operativa hacia un edificio moderno de dos pisos con climatización central y laboratorio automatizado.",
        contenido: "Autoridades ministeriales supervisaron la integración de sistemas informáticos, redes clínicas y automatización de laboratorios en el nuevo complejo hospitalario, asegurando altos estándares tecnológicos para la gestión asistencial y administrativa."
    },
    {
        id: "noticia-12",
        titulo: "Presidenta Bachelet al inaugurar Hospital de Lanco: 'Cambiará la vida de los más de 17 mil habitantes'",
        fecha: "2015-03-01",
        etiqueta: "Hito Presidencial",
        imagen: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80",
        desc: "Hito histórico de inauguración enfocado en entregar una atención de salud más digna, moderna y cercana para toda la comuna de Lanco.",
        contenido: "En una emotiva ceremonia ciudadana, se inauguró oficialmente el esperado recinto hospitalario. La Mandataria destacó que la obra representa un salto cualitativo histórico para los más de 17 mil habitantes de la comuna, garantizando dignidad, equidad y pertinencia territorial en cada atención."
    },
    {
        id: "noticia-6",
        titulo: "Matrona exalumna de la UACh asume como nueva directora del Hospital de Lanco",
        fecha: "2012-06-10",
        etiqueta: "Dirección",
        imagen: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
        desc: "Asunción de liderazgo directivo con un fuerte sello clínico, comunitario y de gestión orientada al desarrollo territorial de la salud familiar.",
        contenido: "Asumiendo la dirección del establecimiento, la nueva autoridad directiva relevó la importancia de consolidar un modelo de gestión participativo, con énfasis en la cercanía con las comunidades rurales y el fortalecimiento continuo del equipo humano del hospital."
    },
];

// 1. Construir la tarjeta adaptada a la Bento Grid y validar permisos
function crearTarjetaNoticia(noticia) {
    const [anio, mes, dia] = noticia.fecha.split('-');
    const mesesNombres = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const fechaFormateada = `${dia} de ${mesesNombres[parseInt(mes)]}, ${anio}`;

    const sesion = localStorage.getItem('usuarioActivo');
    const usuarioActivo = sesion ? JSON.parse(sesion) : null;

    const puedeModificar = typeof usuarioTienePermiso === 'function' ? usuarioTienePermiso(usuarioActivo, 'modificar_noticia') : false;
    const puedeEliminar = typeof usuarioTienePermiso === 'function' ? usuarioTienePermiso(usuarioActivo, 'eliminar_noticia') : false;

    let botonesAccionHtml = '';
    if (puedeModificar || puedeEliminar) {
        botonesAccionHtml = `
            <div class="acciones-noticia" style="display: flex; gap: 8px; margin-top: 12px; border-top: 1px solid #f1f5f9; padding-top: 10px;" onclick="event.stopPropagation();">
                ${puedeModificar ? `<button onclick="editarNoticia('${noticia.id}')" style="background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;"><i class="fas fa-edit"></i> Editar</button>` : ''}
                ${puedeEliminar ? `<button onclick="eliminarNoticia('${noticia.id}')" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;"><i class="fas fa-trash"></i> Eliminar</button>` : ''}
            </div>
        `;
    }

    const tarjeta = document.createElement('div');
    tarjeta.className = 'news-card';
    
    // Al hacer clic en la tarjeta (excepto en los botones de editar/eliminar), se abre la noticia completa
    tarjeta.onclick = () => abrirNoticiaCompleta(noticia.id);
    tarjeta.style.cursor = 'pointer';

    tarjeta.innerHTML = `
        <div style="overflow: hidden; background: #f1f5f9; position: relative;">
            <img src="${noticia.imagen}" alt="${noticia.titulo}" style="width: 100%; height: 100%; object-fit: cover;">
            ${noticia.etiqueta ? `<span style="position: absolute; top: 10px; right: 10px; background: rgba(15, 23, 42, 0.85); color: #38bdf8; font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; backdrop-filter: blur(4px);">${noticia.etiqueta}</span>` : ''}
        </div>
        <div style="padding: 16px; display: flex; flex-direction: column; flex-grow: 1;">
            <span style="font-size: 0.78rem; color: #0284c7; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
                <i class="fas fa-calendar-alt"></i> ${fechaFormateada}
            </span>
            <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 1rem; line-height: 1.35;">${noticia.titulo}</h3>
            <p style="margin: 0; color: #64748b; font-size: 0.85rem; line-height: 1.45; flex-grow: 1;">${noticia.desc}</p>
            <span style="color: #0284c7; font-size: 0.78rem; font-weight: 600; margin-top: 10px; display: inline-flex; align-items: center; gap: 4px;">
                Leer noticia completa &rarr;
            </span>
            ${botonesAccionHtml}
        </div>
    `;

    return tarjeta;
}

// 2. Cargar el contenedor iterando sobre las noticias
function cargarNoticiasPublicas() {
    const contenedor = document.getElementById('newsGridContainer');
    if (!contenedor) return;

    contenedor.innerHTML = "";
    noticiasHospital.forEach(noticia => {
        const tarjetaEl = crearTarjetaNoticia(noticia);
        contenedor.appendChild(tarjetaEl);
    });
}

// 3. Abrir modal con la noticia completa
function abrirNoticiaCompleta(idNoticia) {
    const noticia = noticiasHospital.find(n => n.id === idNoticia);
    if (!noticia) return;

    // Asegurarnos de crear o reutilizar el modal de lectura completa
    let modalCompleto = document.getElementById('modalNoticiaCompleta');
    if (!modalCompleto) {
        const modalHTML = `
            <div id="modalNoticiaCompleta" class="modal-overlay hidden">
                <div class="modal-content" style="max-width: 750px; width: 95%; max-height: 90vh; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                    <div class="modal-header" style="background: #0f172a; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                        <h3 id="modalNoticiaTitulo" style="margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-newspaper" style="color: #38bdf8;"></i> Detalle de la Noticia
                        </h3>
                        <button class="close-modal-btn" onclick="cerrarModalNoticiaCompleta()" style="color: #94a3b8; background: none; border: none; font-size: 1.4rem; cursor: pointer;">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 25px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; background: #f8fafc;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <span id="modalNoticiaFecha" style="font-size: 0.82rem; color: #0284c7; font-weight: 600; display: flex; align-items: center; gap: 6px;"></span>
                            <span id="modalNoticiaEtiqueta" style="background: #e0f2fe; color: #0284c7; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 4px;"></span>
                        </div>
                        
                        <div style="width: 100%; max-height: 320px; overflow: hidden; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff;">
                            <img id="modalNoticiaImagen" src="" alt="Imagen Noticia" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>

                        <div id="modalNoticiaTextoCompleto" style="font-size: 0.95rem; color: #334155; line-height: 1.7; display: flex; flex-direction: column; gap: 12px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalCompleto = document.getElementById('modalNoticiaCompleta');
    }

    document.getElementById('modalNoticiaTitulo').innerHTML = `<i class="fas fa-newspaper" style="color: #38bdf8;"></i> ${noticia.titulo}`;
    document.getElementById('modalNoticiaFecha').innerHTML = `<i class="fas fa-calendar-alt"></i> ${noticia.fecha}`;
    document.getElementById('modalNoticiaEtiqueta').innerText = noticia.etiqueta || 'Comunicado';
    document.getElementById('modalNoticiaImagen').src = noticia.imagen;
    
    // Si la noticia tiene contenido detallado lo usamos, si no, usamos la descripción corta ampliada
    document.getElementById('modalNoticiaTextoCompleto').innerHTML = noticia.contenido || noticia.desc;

    modalCompleto.classList.remove('hidden');
}

function cerrarModalNoticiaCompleta() {
    const modal = document.getElementById('modalNoticiaCompleta');
    if (modal) modal.classList.add('hidden');
}

// 4. Guardar, crear o actualizar noticia desde el modal administrador
function guardarNoticia() {
    const editId = document.getElementById('noticiaEditId')?.value;
    const titulo = document.getElementById('noticiaTitulo')?.value.trim();
    const fecha = document.getElementById('noticiaFecha')?.value || new Date().toISOString().split('T')[0];
    const desc = document.getElementById('noticiaContenido')?.value.trim();

    if (!titulo || !desc) {
        alert("Por favor, completa al menos el título y el contenido de la noticia.");
        return;
    }

    if (editId) {
        // Modo Edición
        const noticia = noticiasHospital.find(n => n.id === editId);
        if (noticia) {
            noticia.titulo = titulo;
            noticia.fecha = fecha;
            noticia.desc = desc;
            noticia.contenido = desc; // Sincronizar contenido completo
        }
        alert("¡Noticia actualizada exitosamente!");
    } else {
        // Modo Creación
        const nuevaNoticia = {
            id: "noticia-" + Date.now(),
            titulo: titulo,
            fecha: fecha,
            etiqueta: "General",
            imagen: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
            desc: desc,
            contenido: desc
        };
        noticiasHospital.unshift(nuevaNoticia);
        alert("¡Noticia publicada exitosamente en el portal!");
    }

    cargarNoticiasPublicas();
    limpiarFormNoticia();
    closeModal('noticiaModal');
}

// 5. Limpiar los campos del formulario modal
function limpiarFormNoticia() {
    const editIdInput = document.getElementById('noticiaEditId');
    const tituloInput = document.getElementById('noticiaTitulo');
    const fechaInput = document.getElementById('noticiaFecha');
    const contenidoInput = document.getElementById('noticiaContenido');
    const previewContainer = document.getElementById('imagePreviewContainer');

    if (editIdInput) editIdInput.value = '';
    if (tituloInput) tituloInput.value = '';
    if (fechaInput) fechaInput.value = '';
    if (contenidoInput) contenidoInput.value = '';
    if (previewContainer) previewContainer.innerHTML = '';
}

// 6. Cargar datos en el modal al hacer clic en Editar
function editarNoticia(id) {
    const noticia = noticiasHospital.find(n => n.id === id);
    if (!noticia) return;

    document.getElementById('noticiaEditId').value = noticia.id;
    document.getElementById('noticiaTitulo').value = noticia.titulo;
    document.getElementById('noticiaFecha').value = noticia.fecha;
    document.getElementById('noticiaContenido').value = noticia.contenido || noticia.desc;
    
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (previewContainer && noticia.imagen) {
        previewContainer.innerHTML = `<img src="${noticia.imagen}" style="max-height: 80px; border-radius: 4px;">`;
    }

    const modal = document.getElementById('noticiaModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

// 7. Eliminar una noticia
function eliminarNoticia(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta noticia?")) {
        const index = noticiasHospital.findIndex(n => n.id === id);
        if (index !== -1) {
            noticiasHospital.splice(index, 1);
            cargarNoticiasPublicas();
        }
    }
}

// Inicialización automática al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    cargarNoticiasPublicas();
});