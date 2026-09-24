// ==========================================
// CALENDARIO DE EFEMÉRIDES DE SALUD Y ESTAMENTOS - HFCL
// ==========================================

const todasLasEfemerides = [
    // Enero
    { mes: 1, dia: 13, titulo: "Día Mundial de la Lucha contra la Depresión", desc: "Concientización y apoyo a la salud mental comunitaria.", colorBg: "#fee2e2", colorTxt: "#ef4444" },
    { mes: 1, dia: 26, titulo: "Día Mundial de la Lepra", desc: "Visibilización y prevención en salud global.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },

    // Febrero
    { mes: 2, dia: 4, titulo: "Día Mundial contra el Cáncer", desc: "Promoción de la prevención y detección temprana.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 2, dia: 15, titulo: "Día Internacional del Cáncer Infantil", desc: "Apoyo continuo a pacientes pediátricos y sus familias.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 2, dia: 28, titulo: "Día Mundial de las Enfermedades Raras", desc: "Visibilización de patologías poco frecuentes.", colorBg: "#fee2e2", colorTxt: "#ef4444" },

    // Marzo
    { mes: 3, dia: 7, titulo: "Día del Prevencionista de Riesgos", desc: "Reconocimiento a la seguridad laboral y salud ocupacional.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 3, dia: 8, titulo: "Día Internacional de la Mujer", desc: "Rol de concientización en salud preventiva de la mujer.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 3, dia: 19, titulo: "Día Nacional del Auxiliar de Servicio", desc: "Reconocimiento a los equipos de aseo y apoyo logístico.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 3, dia: 21, titulo: "Día Mundial del Síndrome de Down", desc: "Inclusión y respeto por la diversidad.", colorBg: "#fee2e2", colorTxt: "#ef4444" },
    { mes: 3, dia: 24, titulo: "Día Mundial de la Tuberculosis", desc: "Prevención y control junto a los equipos clínicos y de laboratorio.", colorBg: "#fee2e2", colorTxt: "#ef4444" },

    // Abril
    { mes: 4, dia: 3, titulo: "Día del TENS", desc: "Homenaje a Técnicos en Enfermería de Nivel Superior.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 4, dia: 5, titulo: "Día Nacional del Terapeuta Ocupacional", desc: "Reconocimiento a la labor de rehabilitación integral.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 4, dia: 7, titulo: "Día Mundial de la Salud", desc: "Reconocimiento a la labor integral de toda la comunidad hospitalaria.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 4, dia: 11, titulo: "Día Mundial del Párkinson", desc: "Sensibilización y apoyo clínico a pacientes.", colorBg: "#fee2e2", colorTxt: "#ef4444" },
    { mes: 4, dia: 17, titulo: "Día Mundial de la Hemofilia", desc: "Apoyo a pacientes y difusión de tratamientos.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 4, dia: 25, titulo: "Día Mundial del Paludismo", desc: "Prevención y control de enfermedades parasitarias.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 4, dia: 29, titulo: "Día Nacional del Personal de Salud", desc: "Homenaje oficial a todo el personal de salud en Chile (Ley 21.164).", colorBg: "#f3e8ff", colorTxt: "#9333ea" },

    // Mayo
    { mes: 5, dia: 6, titulo: "Día del Nutricionista y Kinesiólogo", desc: "Destacando el rol clave en la recuperación de pacientes.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 5, dia: 10, titulo: "Día Mundial del Lupus", desc: "Sensibilización sobre enfermedades autoinmunes.", colorBg: "#fee2e2", colorTxt: "#ef4444" },
    { mes: 5, dia: 12, titulo: "Día Internacional de la Enfermería", desc: "Homenaje a enfermeras y enfermeros por su entrega y cuidado.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 5, dia: 17, titulo: "Día Mundial de la Hipertensión Arterial", desc: "Prevención y control de factores de riesgo cardiovascular.", colorBg: "#fee2e2", colorTxt: "#ef4444" },
    { mes: 5, dia: 18, titulo: "Día de Donación y Trasplante de Órganos", desc: "Concientización sobre la donación en Chile.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 5, dia: 31, titulo: "Día Mundial Sin Tabaco", desc: "Promoción de estilos de vida saludables impulsada por APS y policlínicos.", colorBg: "#fee2e2", colorTxt: "#ef4444" },

    // Junio
    { mes: 6, dia: 2, titulo: "Día de la Acción por los TCA", desc: "Trastornos de la conducta alimentaria y apoyo clínico.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 6, dia: 14, titulo: "Día Mundial del Donante de Sangre", desc: "Agradecimiento a donantes y equipos de laboratorio y policlínico.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 6, dia: 21, titulo: "Día Mundial de la ELA", desc: "Esclerosis Lateral Amiotrófica y apoyo a pacientes.", colorBg: "#fee2e2", colorTxt: "#ef4444" },

    // Julio
    { mes: 7, dia: 22, titulo: "Día Mundial del Cerebro", desc: "Salud neurológica y prevención de patologías.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 7, dia: 24, titulo: "Día Internacional del Autocuidado", desc: "Promoción de la salud física y mental en la comunidad.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 7, dia: 28, titulo: "Día Mundial contra la Hepatitis", desc: "Sensibilización y prevención coordinada por nuestros equipos clínicos.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },

    // Agosto
    { mes: 8, dia: 1, titulo: "Semana Mundial de la Lactancia Materna", desc: "Fomento y apoyo a la alimentación y apego saludable.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 8, dia: 26, titulo: "Día del Conductor de Ambulancias", desc: "Reconocimiento a la labor de traslado asistencial de urgencia.", colorBg: "#fee2e2", colorTxt: "#ef4444" },
    { mes: 8, dia: 28, titulo: "Día Nacional del Oficial Administrativo", desc: "Valorando la gestión administrativa en salud.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 8, dia: 31, titulo: "Día Internacional de la Matrona", desc: "Reconocimiento a matronas, matrones y la salud materno-infantil.", colorBg: "#fee2e2", colorTxt: "#ef4444" },

    // Septiembre
    { mes: 9, dia: 6, titulo: "Día de la Atención Primaria de Salud", desc: "Conmemoración clave para consultorios, CESFAM y postas rurales.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 9, dia: 8, titulo: "Día Nacional del SAMU", desc: "Reconocimiento a los equipos de urgencia prehospitalaria.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 9, dia: 10, titulo: "Día Mundial para la Prevención del Suicidio", desc: "Estrategias de apoyo y salud mental comunitaria.", colorBg: "#fee2e2", colorTxt: "#ef4444" },
    { mes: 9, dia: 17, titulo: "Día Mundial de la Seguridad del Paciente", desc: "Estándares de calidad y atención clínica segura.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 9, dia: 21, titulo: "Día Mundial del Alzheimer", desc: "Sensibilización sobre demencias y apoyo a cuidadores.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 9, dia: 25, titulo: "Día Mundial del Farmacéutico", desc: "Reconocimiento al rol de los profesionales de farmacia en la salud y el cuidado de las personas.", colorBg: "#dcfce7", colorTxt: "#16a34a" },
    { mes: 9, dia: 27, titulo: "Día Nacional de la Odontología", desc: "Homenaje a los cirujanos dentistas de la red.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 9, dia: 29, titulo: "Día Mundial del Corazón", desc: "Concientización sobre enfermedades cardiovasculares, prevención y cuidado de la salud cardíaca.", colorBg: "#fee2e2", colorTxt: "#dc2626" },

    // Octubre
    { mes: 10, dia: 2, titulo: "Día Nacional del Tecnólogo Médico", desc: "Destacando el rol clave en laboratorios, imagenología y diagnóstico.", colorBg: "#e0f2fe", colorTxt: "#9333ea" },
    { mes: 10, dia: 3, titulo: "Día Nacional del Hospital", desc: "¡Feliz aniversario a toda nuestra comunidad hospitalaria de Lanco!", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 10, dia: 10, titulo: "Día Mundial de la Salud Mental", desc: "Promoción del bienestar psicológico y psiquiátrico.", colorBg: "#fee2e2", colorTxt: "#ef4444" },
    { mes: 10, dia: 12, titulo: "Día Mundial de los Cuidados Paliativos", desc: "Acompañamiento y dignidad en la atención clínica.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 10, dia: 16, titulo: "Día Mundial de la Alimentación", desc: "Promoción de hábitos nutricionales saludables.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 10, dia: 19, titulo: "Día contra el Cáncer de Mama", desc: "Sensibilización impulsada por equipos de salud preventiva.", colorBg: "#fee2e2", colorTxt: "#ef4444" },
    { mes: 10, dia: 20, titulo: "Día del Pediatra y de la Osteoporosis", desc: "Salud infantil y prevención ósea en la comunidad.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 10, dia: 27, titulo: "Día Mundial de la Terapia Ocupacional", desc: "Rehabilitación y autonomía de los pacientes.", colorBg: "#e0f2fe", colorTxt: "#ef4444" },
    { mes: 10, dia: 29, titulo: "Día Mundial del ACV", desc: "Prevención y alerta temprana del accidente cerebrovascular.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },

    // Noviembre
    { mes: 11, dia: 5, titulo: "Día Internacional de las Personas Cuidadoras", desc: "Reconocimiento a la labor de apoyo y cuidado familiar y clínico.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 11, dia: 9, titulo: "Día del Psicólogo", desc: "Reconocimiento a la labor de salud mental en la red.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 11, dia: 14, titulo: "Día Mundial de la Diabetes", desc: "Prevención, educación y control metabólico.", colorBg: "#fee2e2", colorTxt: "#ef4444" },
    { mes: 11, dia: 15, titulo: "Día Mundial Sin Alcohol", desc: "Concientización sobre el consumo y vida saludable.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 11, dia: 17, titulo: "Día Mundial del Niño Prematuro", desc: "Cuidado especializado neonatal y apoyo familiar.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 11, dia: 22, titulo: "Día de la Fonoaudiología", desc: "Labor en comunicación, deglución y lenguaje.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 11, dia: 25, titulo: "Día contra la Violencia hacia la Mujer", desc: "Abordaje preventivo y de redes de salud.", colorBg: "#fee2e2", colorTxt: "#ef4444" },

    // Diciembre
    { mes: 12, dia: 1, titulo: "Día Mundial del SIDA (VIH/SIDA)", desc: "Prevención y apoyo continuo de nuestros equipos multidisciplinarios.", colorBg: "#fee2e2", colorTxt: "#ef4444" },
    { mes: 12, dia: 3, titulo: "Día del Médico y Secretaría", desc: "Reconocimiento a la labor médica y administrativa en salud.", colorBg: "#f3e8ff", colorTxt: "#9333ea" },
    { mes: 12, dia: 9, titulo: "Día del Psicólogo en Chile", desc: "Destacando el compromiso con el bienestar emocional.", colorBg: "#e0f2fe", colorTxt: "#0284c7" },
    { mes: 12, dia: 12, titulo: "Día de la Salud Universal", desc: "Compromiso con el acceso equitativo a la salud pública.", colorBg: "#e0f2fe", colorTxt: "#0284c7" }
];

const nombresMeses = ["", "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

function cargarProximasEfemerides() {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const diaActual = hoy.getDate();

    let futuras = todasLasEfemerides.filter(item => {
        if (item.mes > mesActual) return true;
        if (item.mes === mesActual && item.dia >= diaActual) return true;
        return false;
    });

    if (futuras.length < 5) {
        let pasadasOAnioSiguiente = todasLasEfemerides.filter(item => {
            if (item.mes < mesActual) return true;
            if (item.mes === mesActual && item.dia < diaActual) return true;
            return false;
        });
        futuras = futuras.concat(pasadasOAnioSiguiente);
    }

    const proximasTres = futuras.slice(0, 3);
    const contenedor = document.getElementById('efemeridesContainer');
    if (!contenedor) return;

    contenedor.innerHTML = "";

    proximasTres.forEach((efem, index) => {
        const esUltima = index === proximasTres.length - 1;
        const estiloBorde = esUltima ? "" : "padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;";

        const htmlItem = `
            <div style="display: flex; gap: 15px; ${estiloBorde}">
                <div style="background: ${efem.colorBg}; color: ${efem.colorTxt}; min-width: 55px; height: 55px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; line-height: 1.1;">
                    <span style="font-size: 1rem;">${String(efem.dia).padStart(2, '0')}</span>
                    <span style="font-size: 0.75rem;">${nombresMeses[efem.mes]}</span>
                </div>
                <div>
                    <h4 style="margin: 0 0 4px 0; color: #1e293b; font-size: 0.9rem;">${efem.titulo}</h4>
                    <p style="margin: 0; font-size: 0.8rem; color: #64748b;">${efem.desc}</p>
                </div>
            </div>
        `;
        contenedor.innerHTML += htmlItem;
    });
}

window.addEventListener('load', cargarProximasEfemerides);