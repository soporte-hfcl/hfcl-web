// ==========================================
// MÓDULO DE AUTENTICACIÓN Y PERMISOS - HFCL
// ==========================================

const PERFILES_BASE = {
    admin: [
        "publicar_noticias", 
        "modificar_noticia", 
        "eliminar_noticia", 
        "publicar_avisos",
        "bitacora.write", 
        "bitacora.read",
        "bitacora.export_pdf",
        "editar_directorio"
    ],
    editor: [
        "publicar_noticias",
        "modificar_noticia",
        "eliminar_noticia",
        "publicar_avisos"
    ],
    turnante: [
        "bitacora.write"
    ],
    consultor_datos: [
        "bitacora.read", 
        "bitacora.export_pdf"
    ]
};

const USUARIOS_AUTORIZADOS = {
    "j.painenanco": {
        nombre: "José Paineñanco",
        cargo: "Ingeniero Informático",
        clave: "admin2026",
        rol: "admin",
        permisos: []
    },
    "s.cuvertino": {
        nombre: "Sandro Cuvertino",
        cargo: "Operador de Turno",
        clave: "0000",
        rol: "turnante",
        permisos: ["bitacora.read"]
    },
    "juan": {
        nombre: "Juan Mora",
        cargo: "Operador de Turno",
        clave: "1234",
        rol: "turnante",
        permisos: []
    },
    "sergio": {
        nombre: "Sergio Sayago",
        cargo: "Operador de Turno",
        clave: "1234",
        rol: "turnante",
        permisos: []
    },
    "willy": {
        nombre: "Willy Ramírez",
        cargo: "Operador de Turno",
        clave: "1234",
        rol: "turnante",
        permisos: []
    },
    "hector": {
        nombre: "Héctor Vera",
        cargo: "Jefe de Unidad",
        clave: "1234",
        rol: "consultor_datos",
        permisos: []
    }
};

// Controladores de Modales
function openAccesoFuncionarioModal() {
    const modal = document.getElementById('accesoFuncionarioModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function closeAccesoFuncionarioModal() {
    const modal = document.getElementById('accesoFuncionarioModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        
        const form = document.getElementById('formAccesoFuncionario');
        if (form) form.reset();
        
        const errorDiv = document.getElementById('errorAccesoFuncionario');
        if (errorDiv) errorDiv.classList.add('hidden');
    }
}

function usuarioTienePermiso(usuario, permisoBuscado) {
    if (!usuario) return false;
    if (usuario.rol === 'admin') return true;

    const permisosDelRol = PERFILES_BASE[usuario.rol] || [];
    const permisosExtras = usuario.permisos || [];

    return permisosDelRol.includes(permisoBuscado) || permisosExtras.includes(permisoBuscado);
}

function handleAccesoFuncionario(event) {
    event.preventDefault();
    
    const usuarioInput = document.getElementById('usuarioFuncionario').value.trim().toLowerCase();
    const inputClave = document.getElementById('claveFuncionario') || document.getElementById('loginPass');
    const claveInput = inputClave ? inputClave.value : '';
    
    const errorDiv = document.getElementById('errorAccesoFuncionario') || document.getElementById('loginError');

    const usuarioEncontrado = USUARIOS_AUTORIZADOS[usuarioInput];

    if (usuarioEncontrado && usuarioEncontrado.clave === claveInput) {
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioEncontrado));
        
        alert(`¡Bienvenido(a), ${usuarioEncontrado.nombre}! Sesión iniciada correctamente.`);
        closeAccesoFuncionarioModal();
        aplicarSesionActiva(usuarioEncontrado);
    } else {
        if (errorDiv) errorDiv.classList.remove('hidden');
    }
}

// Aplicar interfaz y permisos cuando hay sesión activa
function aplicarSesionActiva(usuario) {
    const container = document.getElementById('authDropdownContainer');
    const btnAdminNoticia = document.getElementById('btnAdminNoticia');
    const seccionCrearAviso = document.getElementById('formCrearAvisoContainer');

    const tienePermisoNoticia = usuarioTienePermiso(usuario, 'publicar_noticias');
    const tienePermisoAviso = usuarioTienePermiso(usuario, 'publicar_avisos');
    const esAdminOEditor = usuario.rol === 'admin' || usuario.rol === 'editor';

if (container) {
        const estaEnSubcarpeta = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin-funcionarios/');
        const rutaBaseLinks = estaEnSubcarpeta ? "../" : "";

        container.innerHTML = `
            <div class="dropdown" style="position: relative; display: inline-block;">
                <button class="nav-auth-btn drop-btn" onclick="toggleUserDropdown(event)" style="background: #1e3a8a; color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-user-check" style="color: #4ade80;"></i> <span>Hola, ${usuario.nombre.split(' ')[0]}</span> <i class="fas fa-chevron-down" style="font-size: 0.65rem;"></i>
                </button>
                <div id="userDropdownMenu" class="dropdown-content" style="right: 0; left: auto; min-width: 210px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: none; position: absolute; top: 100%; margin-top: 5px; z-index: 100; padding: 4px 0;">
                    
                    ${esAdminOEditor ? `
                        <div style="padding: 4px 12px; font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Panel Administrador</div>
                        <a href="${rutaBaseLinks}pages/admin-func.html" style="padding: 8px 15px; display: flex; align-items: center; gap: 8px; color: #1e293b; font-size: 0.8rem; text-decoration: none;"><i class="fas fa-user-shield" style="width: 18px; color: #0284c7;"></i> Administrar Personal</a>
                        <a href="javascript:void(0);" onclick="openNoticiaModal()" style="padding: 8px 15px; display: flex; align-items: center; gap: 8px; color: #1e293b; font-size: 0.8rem; text-decoration: none;"><i class="fas fa-newspaper" style="width: 18px; color: #10b981;"></i> Publicar Noticia</a>
                        <a href="javascript:void(0);" onclick="toggleMuralAvisos()" style="padding: 8px 15px; display: flex; align-items: center; gap: 8px; color: #1e293b; font-size: 0.8rem; text-decoration: none;"><i class="fas fa-bullhorn" style="width: 18px; color: #f59e0b;"></i> Publicar Aviso</a>
                        <a href="${rutaBaseLinks}pages/red.html" style="padding: 8px 15px; display: flex; align-items: center; gap: 8px; color: #1e293b; font-size: 0.8rem; text-decoration: none;"><i class="fas fa-network-wired" style="width: 18px; color: #8b5cf6;"></i> Mapa de Red y Equipos</a>
                        
                        <div style="height: 1px; background: #e2e8f0; margin: 6px 0;"></div>
                    ` : ''}

                    <a href="javascript:void(0);" onclick="cerrarSesion()" style="padding: 8px 15px; display: flex; align-items: center; gap: 8px; color: #dc2626; font-size: 0.8rem; font-weight: 600; text-decoration: none;">
                        <i class="fas fa-sign-out-alt" style="width: 18px;"></i> Cerrar Sesión
                    </a>
                </div>
            </div>
        `;
    }

    if (btnAdminNoticia) {
        if (tienePermisoNoticia) btnAdminNoticia.classList.remove('hidden');
        else btnAdminNoticia.classList.add('hidden');
    }

    if (seccionCrearAviso) {
        if (tienePermisoAviso) seccionCrearAviso.classList.remove('hidden');
        else seccionCrearAviso.classList.add('hidden');
    }
}

// Controladores globales para el menú desplegable del usuario
function toggleUserDropdown(event) {
    event.stopPropagation();
    const menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
}

window.addEventListener('click', () => {
    const menu = document.getElementById('userDropdownMenu');
    if (menu) menu.style.display = 'none';
});

function cerrarSesion() {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        localStorage.removeItem('usuarioActivo');
        // Limpiamos el contenedor inmediatamente de forma visual
        const container = document.getElementById('authDropdownContainer');
        if (container) {
            container.innerHTML = `
                <button class="nav-auth-btn" onclick="openAccesoFuncionarioModal()" style="background: #1e3a8a; color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s;">
                    <i class="fas fa-lock" style="color: #cbd5e1;"></i> <span>Acceso Funcionario</span>
                </button>
            `;
        }
        // Recarga forzada desde el servidor o caché limpia
        window.location.reload(true);
    }
}

function publicarNuevoAviso(event) {
    event.preventDefault();

    const tituloInput = document.getElementById('nuevoAvisoTitulo').value.trim();
    const tipoSelect = document.getElementById('nuevoAvisoTipo').value;
    const textoInput = document.getElementById('nuevoAvisoTexto').value.trim();
    const gridAvisos = document.getElementById('muralAvisosGrid');

    if (!tituloInput || !textoInput || !gridAvisos) return;

    let configEstilos = {
        reunion: { bg: "#fffbeb", border: "#fde68a", left: "#f59e0b", colorTag: "#d97706", titleColor: "#78350f", textCol: "#92400e", icon: "fa-users", label: "Reunión" },
        tic: { bg: "#e0f2fe", border: "#bae6fd", left: "#0284c7", colorTag: "#0284c7", titleColor: "#0369a1", textCol: "#075985", icon: "fa-laptop-code", label: "Informativo TIC" },
        general: { bg: "#f0fdf4", border: "#bbf7d0", left: "#16a34a", colorTag: "#16a34a", titleColor: "#14532d", textCol: "#166534", icon: "fa-bullhorn", label: "General" }
    };

    let est = configEstilos[tipoSelect] || configEstilos.general;

    const tarjetaAviso = document.createElement('div');
    tarjetaAviso.style.cssText = `background: ${est.bg}; border: 1px solid ${est.border}; border-left: 4px solid ${est.left}; padding: 15px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); position: relative;`;
    
    tarjetaAviso.innerHTML = `
        <span style="font-size: 0.68rem; font-weight: 700; color: ${est.colorTag}; text-transform: uppercase;"><i class="fas ${est.icon}"></i> ${est.label}</span>
        <h4 style="margin: 6px 0 6px 0; font-size: 0.95rem; color: ${est.titleColor};">${tituloInput}</h4>
        <p style="margin: 0; font-size: 0.8rem; color: ${est.textCol};">${textoInput}</p>
    `;

    gridAvisos.prepend(tarjetaAviso);
    document.getElementById('formCrearAviso').reset();
    alert("¡Aviso publicado exitosamente en el mural!");
}

// ==========================================
// CONTROL DE ESTADO DE SESIÓN (LOGIN / LOGOUT)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoSesion();
});

document.addEventListener('navbarLoaded', () => {
    verificarEstadoSesion();
});

function verificarEstadoSesion() {
    const sesionGuardada = localStorage.getItem('usuarioActivo');
    
    if (sesionGuardada) {
        try {
            const usuario = JSON.parse(sesionGuardada);
            aplicarSesionActiva(usuario);
        } catch (e) {
            localStorage.removeItem('usuarioActivo');
            mostrarBotonIngreso();
        }
    } else {
        mostrarBotonIngreso();
    }
}

function mostrarBotonIngreso() {
    const container = document.getElementById('authDropdownContainer');
    const btnAdminNoticia = document.getElementById('btnAdminNoticia');
    const seccionCrearAviso = document.getElementById('formCrearAvisoContainer');

    if (container) {
        container.innerHTML = `
            <button class="nav-auth-btn" onclick="openAccesoFuncionarioModal()" style="background: #1e3a8a; color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s;">
                <i class="fas fa-lock" style="color: #cbd5e1;"></i> <span>Acceso Funcionario</span>
            </button>
        `;
    }

    if (btnAdminNoticia) btnAdminNoticia.classList.add('hidden');
    if (seccionCrearAviso) seccionCrearAviso.classList.add('hidden');
}