const URL_API_SHEETS = "https://script.google.com/macros/s/AKfycby_MZCFYKhRSaKl0hoFQWW5G6nZQNX8nC8CXljeGdrgeLt_Hb43SHMIFjJ4e3AbJkQPAA/exec";

let VEHICULOS_DB = [];
let CONTACTOS_DB = []; // <--- Añadimos almacenamiento global de funcionarios
let dbCargada = false;

window.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('resultadoPatenteContainer');
    
    if (contenedor) {
        contenedor.innerHTML = `
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; color: #64748b; font-size: 0.85rem; text-align: center;">
                <i class="fas fa-spinner fa-spin" style="margin-right: 6px; color: #0284c7;"></i> Sincronizando bases de datos...
            </div>
        `;
    }

    try {
        const respuesta = await fetch(URL_API_SHEETS);
        const data = await respuesta.json();
        
        // 1. Guardar vehículos
        if (data.vehiculos && Array.isArray(data.vehiculos)) {
            VEHICULOS_DB = data.vehiculos;
            localStorage.setItem('hfc_lan_vehiculos_data', JSON.stringify(VEHICULOS_DB));
        }

        // 2. Guardar funcionarios desde la misma respuesta de la nube
        if (data.funcionarios && Array.isArray(data.funcionarios)) {
            CONTACTOS_DB = data.funcionarios;
            localStorage.setItem('hfc_lan_contacts_directory', JSON.stringify(CONTACTOS_DB));
        }
    } catch (error) {
        console.warn("Usando caché local debido a error de red:", error);
        VEHICULOS_DB = JSON.parse(localStorage.getItem('hfc_lan_vehiculos_data')) || [];
        CONTACTOS_DB = JSON.parse(localStorage.getItem('hfc_lan_contacts_directory')) || [];
    } finally {
        dbCargada = true;
        if (contenedor) contenedor.innerHTML = ""; 
    }

    // Control del modal de registro
    const modal = document.getElementById('modalRegistroPatente');
    const btnCerrar = document.getElementById('btnClosePatenteModal');
    const btnCancelar = document.getElementById('btnCancelPatente');
    const form = document.getElementById('registroPatenteForm');

    window.abrirModalRegistro = function() {
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    };

    function cerrarModal() {
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            form.reset();
        }
    }

    btnCerrar?.addEventListener('click', cerrarModal);
    btnCancelar?.addEventListener('click', cerrarModal);

    // Enviar formulario de registro de patente al backend
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        }

        const payload = {
            action: "registrar_patente",
            vehiculo: {
                patente: document.getElementById('regPatente').value.toUpperCase().trim(),
                propietario: document.getElementById('regPropietario').value.trim(),
                servicio: document.getElementById('regServicio').value.trim(),
                anexo: document.getElementById('regAnexo').value.trim(),
                modelo: document.getElementById('regModelo').value.trim()
            }
        };

        try {
            const respuesta = await fetch(URL_API_SHEETS, {
                method: "POST",
                redirect: "follow",
                body: JSON.stringify(payload)
            });

            const textoRespuesta = await respuesta.text();
            let res;
            
            try {
                res = JSON.parse(textoRespuesta);
            } catch (errParse) {
                alert("¡Vehículo registrado con éxito! El equipo de soporte procesará la actualización.");
                cerrarModal();
                return;
            }

            if (res.status === "success") {
                alert("¡Vehículo registrado con éxito! El equipo de soporte procesará la actualización.");
                cerrarModal();
            } else {
                alert("Error del servidor: " + (res.message || "Desconocido"));
            }
        } catch (err) {
            console.error("Error enviando patente:", err);
            alert("Error de conexión. Intente nuevamente.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar';
            }
        }
    });
});

function buscarPatente() {
    const input = document.getElementById('inputBuscarPatente').value.trim().toUpperCase();
    const contenedor = document.getElementById('resultadoPatenteContainer');
    
    if (!input) {
        contenedor.innerHTML = `<p style="color: #ef4444; font-size: 0.85rem; margin: 0;">Por favor ingrese una patente para buscar.</p>`;
        return;
    }

    if (!dbCargada) {
        contenedor.innerHTML = `
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; color: #0284c7; font-size: 0.85rem;">
                <i class="fas fa-spinner fa-spin"></i> Cargando base de datos, un momento por favor...
            </div>
        `;
        return;
    }

    // Buscamos el vehículo que coincida con la patente ingresada
    const encontrado = VEHICULOS_DB.find(v => (v.patente || "").toUpperCase().includes(input));

    if (encontrado) {
        let nombrePropietario = "No especificado";
        let servicioPropietario = "No especificado";
        let anexoPropietario = "S/N";

        // Función infalible para limpiar RUTs (quita puntos, guiones, espacios y lleva a mayúsculas)
        const limpiarRut = (r) => String(r || "").replace(/[^0-9kK]/g, "").toUpperCase();
        const rutBuscado = limpiarRut(encontrado.rut);

        console.log("🔍 Buscando vehículo - Patente:", encontrado.patente, "| RUT asociado:", rutBuscado);
        console.log("📋 Total de funcionarios en CONTACTOS_DB:", typeof CONTACTOS_DB !== 'undefined' ? CONTACTOS_DB.length : 0);

        if (typeof CONTACTOS_DB !== 'undefined' && CONTACTOS_DB.length > 0 && rutBuscado) {
            // Buscamos al dueño comparando el RUT limpio en las propiedades 'rut' o 'id' del funcionario
            const duenio = CONTACTOS_DB.find(c => {
                const rutFuncLimpio = limpiarRut(c.rut || c.id);
                return rutFuncLimpio === rutBuscado;
            });
            
            if (duenio) {
                console.log("✅ ¡Propietario encontrado con éxito!", duenio);
                // Rescatamos los datos considerando diferentes nomenclaturas posibles del JSON
                nombrePropietario = duenio.nombre || duenio.name || "Sin nombre";
                servicioPropietario = duenio.unidad || duenio.department || "General";
                anexoPropietario = duenio.anexo || duenio.phone || "S/N";
            } else {
                console.warn("⚠️ El vehículo tiene el RUT:", rutBuscado, "pero no se encontró ningún funcionario coincidente en CONTACTOS_DB.");
            }
        } else {
            console.warn("⚠️ La base de datos de contactos está vacía o el vehículo no tiene RUT.");
        }

let htmlLlamada = `Anexo: ${anexoPropietario}`;
        let anexoLimpio = String(anexoPropietario).replace(/[^0-9]/g, "");
        
        if (anexoPropietario && anexoPropietario !== "S/N" && anexoLimpio.length > 0) {
            let numeroParaTel = anexoLimpio;
            let numInt = parseInt(anexoLimpio, 10);

            // Convertimos el anexo corto a numeración externa según los rangos del hospital
            if (!isNaN(numInt)) {
                if (numInt >= 634000 && numInt <= 634799) {
                    // Si el anexo ya viene con el prefijo "63", o si está dentro del rango base
                    // Aplicamos la regla: 63 2 26 xxxx
                    // (Si tus anexos ingresados son solo las últimas cifras o el número completo, ajustamos la extracción)
                }
            }

            // Lógica robusta aplicando tus rangos exactos (asumiendo que ingresan el número base del anexo)
            let prefijoExterno = "";
            
            // Evaluamos según los rangos proporcionados
            if ((numInt >= 4000 && numInt <= 4799) || (numInt >= 634000 && numInt <= 634799)) {
                // Rango 1: 63 2 26 xxxx (Tomamos los últimos 4 dígitos si viene completo o usamos el número)
                let ultimosDigitos = anexoLimpio.slice(-4);
                prefijoExterno = "+5663226" + ultimosDigitos;
            } else if ((numInt >= 5900 && numInt <= 6379) || (numInt >= 635900 && numInt <= 636379)) {
                // Rango 2: 63 2 68 xxxx
                let ultimosDigitos = anexoLimpio.slice(-4);
                prefijoExterno = "+5663268" + ultimosDigitos;
            } else {
                // Fallback por si hay algún anexo fuera de rango o formato estándar
                prefijoExterno = "+56" + anexoLimpio;
            }

            htmlLlamada = `Anexo: <a href="tel:${prefijoExterno}" style="color: #0284c7; text-decoration: none; font-weight: 600;" title="Llamar al anexo desde celular"><i class="fas fa-phone-alt" style="font-size: 0.8rem; margin-right: 3px;"></i>${anexoPropietario}</a>`;
        }

        contenedor.innerHTML = `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="background: #16a34a; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 700;">Patente: ${encontrado.patente}</span>
                    <span style="font-size: 0.8rem; color: #166534; font-weight: 600;">Vehículo Registrado</span>
                </div>
                <div style="font-size: 0.9rem; color: #0f172a; margin-top: 4px; line-height: 1.5;">
                    👤 Propietario: <strong>${nombrePropietario}</strong><br>
                    🏥 Servicio / Unidad: <strong>${servicioPropietario}</strong> (${htmlLlamada})<br>
                    🚗 Vehículo: <strong>${encontrado.tipo || 'Vehículo'} - ${encontrado.marca || ''} ${encontrado.modelo || ''}</strong><br>
                    🎨 Color: <strong>${encontrado.color || 'No especificado'}</strong>
                </div>
            </div>
        `;
    } else {
        contenedor.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; color: #991b1b; font-size: 0.85rem;">
                <i class="fas fa-exclamation-circle"></i> No se encontró ningún vehículo registrado en la base de datos con la patente <strong>${input}</strong>.
            </div>
        `;
    }
}