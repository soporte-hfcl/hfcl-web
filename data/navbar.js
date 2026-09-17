document.addEventListener("DOMContentLoaded", function() {
    // Detecta automáticamente si estamos en una subcarpeta y ajusta la ruta base
    const estaEnSubcarpeta = window.location.pathname.includes('/pages/');
    const rutaBase = estaEnSubcarpeta ? "../" : "";

    const navbarHTML = `
    <style>
        .web-navbar {
            background-color: #0f172a;
            color: white;
            position: sticky;
            top: 0;
            z-index: 999;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        .nav-container {
            max-width: 1700px;
            margin: 0 auto;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 30px;
        }
        .nav-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 700;
            font-size: 1rem;
            text-decoration: none;
            color: white;
            text-align: left;
        }
        .nav-logo { width: 34px; height: auto; }
        .nav-context-menu { display: flex; gap: 10px; align-items: center; }
        .dropdown {
            position: relative;
            display: inline-block;
        }
        .drop-btn {
            background: transparent; border: none;
            color: #cbd5e1; font-size: 0.82rem;
            font-weight: 600; cursor: pointer;
            display: flex; align-items: center;
            justify-content: flex-start !important;
            text-align: left !important;
            gap: 6px; padding: 6px 12px; border-radius: 6px; transition: 0.2s;
        }
        .drop-btn:hover { background: rgba(255, 255, 255, 0.08); color: white; }
        .dropdown-content {
            display: none; position: absolute;
            background-color: #ffffff;
            min-width: 260px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            border: 1px solid #cbd5e1;
            border-radius: 8px; z-index: 1000; top: 100%; left: 0; padding: 6px 0;
        }
        .dropdown-content a {
            color: #0f172a; padding: 10px 16px;
            text-decoration: none; display: flex;
            align-items: center; justify-content: flex-start !important;
            text-align: left !important;
            gap: 10px; font-size: 0.82rem;
            font-weight: 600; transition: background 0.2s, color 0.2s;
            width: 100%;
        }
        .dropdown-content a i { color: #0284c7; }
        .dropdown-content a:hover { background-color: #f1f5f9; color: #1e3a8a; }
        .dropdown:hover .dropdown-content { display: block; }
        .dropdown-submenu { position: relative !important; width: 100%; }
        .submenu-trigger {
            display: flex !important; justify-content: flex-start !important;
            align-items: center !important; text-align: left !important;
            width: 100%;
        }
        .submenu-trigger i.fa-chevron-right {
            font-size: 0.7rem;
            color: #64748b;
            margin-left: auto;
        }
        .dropdown-subcontent {
            display: none !important; position: absolute !important;
            top: 0 !important; left: 100% !important;
            background-color: #ffffff;
            min-width: 250px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            border: 1px solid #cbd5e1;
            border-radius: 8px; z-index: 9999 !important;
            padding: 6px 0;
        }
        .dropdown-subcontent a {
            text-align: left !important;
            justify-content: flex-start !important;
        }
        .dropdown-submenu:hover > .dropdown-subcontent,
        .dropdown-submenu:hover .dropdown-subcontent {
            display: block !important;
        }
        .nav-meta { display: flex; align-items: center; gap: 16px; margin-left: auto; }
        .nav-auth-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white; padding: 6px 14px;
            border-radius: 6px; font-size: 0.78rem;
            font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 6px;
        }
        @media (max-width: 1024px) {
            .nav-container { padding: 10px 15px; gap: 15px; justify-content: space-between; }
            .nav-context-menu { gap: 6px; }
            .drop-btn { font-size: 0.76rem; padding: 5px 8px; }
        }
        @media (max-width: 900px) {
            .web-navbar .nav-container { flex-wrap: wrap; gap: 10px; padding: 10px 15px; }
            .nav-context-menu {
                display: flex !important; flex-wrap: wrap; gap: 5px; width: 100%;
                justify-content: flex-start; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 8px;
            }
        }
    </style>
    <nav class="web-navbar">
        <div class="nav-container">
            <a href="${rutaBase}index.html" class="nav-brand">
                <img src="${rutaBase}assets/img/logo_hfcl.png" alt="Logo HFCL Lanco" class="nav-logo">
                <span>Intranet Local</span>
            </a>
            
            <div class="nav-context-menu">
                <!-- Nuestra Institución -->
                <div class="dropdown">
                    <button class="drop-btn"><i class="fas fa-landmark"></i> Nuestra Institución <i class="fas fa-chevron-down"></i></button>
                    <div class="dropdown-content">
                        <a href="javascript:void(0);" onclick="openPoblacionModal()"><i class="fas fa-users"></i> Población Asignada</a>
                        <a href="javascript:void(0);" onclick="openMisionModal()"><i class="fas fa-bullseye"></i> Misión y Visión</a>
                        <a href="javascript:void(0);" onclick="openEquipoModal()"><i class="fas fa-sitemap"></i> Organigrama y Equipo Institucional</a>
                        <a href="javascript:void(0);" onclick="openAcreditacionModal()"><i class="fas fa-award"></i> Acreditación en Calidad</a>
                        <a href="javascript:void(0);" onclick="openDependenciasModal()"><i class="fas fa-hospital-user"></i> Dependencias Anexas</a>
                        <a href="javascript:void(0);" onclick="openGremiosModal()"><i class="fas fa-hands-helping"></i> Asociaciones Gremiales</a>
                    </div>
                </div>

                <!-- Documentos y Formularios -->
                <div class="dropdown">
                    <button class="drop-btn"><i class="fas fa-file-alt"></i> Documentos y Formularios <i class="fas fa-chevron-down"></i></button>
                    <div class="dropdown-content sub-dropdown-wrapper">
                        <div class="dropdown-submenu">
                            <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-users-cog doc-color"></i> Recursos Humanos (RRHH) <i class="fas fa-chevron-right"></i></a>
                            <div class="dropdown-subcontent">
                                <a href="${rutaBase}manuales/docs/permiso-administrativo.docx" target="_blank"><i class="fas fa-file-word doc-color"></i> Permisos Administrativos</a>
                                <a href="#" target="_blank"><i class="fas fa-file-pdf pdf-color"></i> Feriados Legales</a>
                                <a href="#" target="_blank"><i class="fas fa-file-alt doc-color"></i> Reemplazo de Turnos</a>
                            </div>
                        </div>

                        <div class="dropdown-submenu">
                            <a href="javascript:void(0);" class="submenu-trigger">
                                <i class="fas fa-book-medical doc-color"></i> Protocolos e Instructivos 
                                <i class="fas fa-chevron-right" style="float: right; margin-top: 4px;"></i>
                            </a>
                            <div class="dropdown-subcontent">
                                <div class="dropdown-submenu">
                                    <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-folder pdf-color"></i> Acceso y Oportunidad (AOC) <i class="fas fa-chevron-right"></i></a>
                                    <div class="dropdown-subcontent">
                                        <a href="javascript:void(0);" onclick="abrirVisorPDF('${rutaBase}manuales/protocolos/Acceso y Oportunidad (AOC)/Protocolo-AOC-1.pdf', 'Protocolo AOC 1')"><i class="fas fa-file-pdf pdf-color"></i> Protocolo de Atención</a>
                                        <a href="javascript:void(0);" onclick="abrirVisorPDF('${rutaBase}manuales/protocolos/Acceso y Oportunidad (AOC)/Protocolo-AOC-2.pdf', 'Protocolo AOC 2')"><i class="fas fa-file-pdf pdf-color"></i> Guía de Oportunidad</a>
                                    </div>
                                </div>
                                <div class="dropdown-submenu">
                                    <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-folder pdf-color"></i> Dignidad del Paciente (DP) <i class="fas fa-chevron-right"></i></a>
                                    <div class="dropdown-subcontent">
                                        <a href="javascript:void(0);" onclick="abrirVisorPDF('${rutaBase}manuales/protocolos/Dignidad del Paciente (DP)/Protocolo-DP-1.pdf', 'Protocolo DP 1')"><i class="fas fa-file-pdf pdf-color"></i> Derechos del Paciente</a>
                                    </div>
                                </div>
                                <div class="dropdown-submenu">
                                    <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-folder pdf-color"></i> Gestión Clínica (GCL) <i class="fas fa-chevron-right"></i></a>
                                    <div class="dropdown-subcontent">
                                        <a href="javascript:void(0);" onclick="abrirVisorPDF('${rutaBase}manuales/protocolos/Gestión Clínica (GCL)/Protocolo-GCL-1.pdf', 'Protocolo GCL 1')"><i class="fas fa-file-pdf pdf-color"></i> Manejo de Pacientes</a>
                                    </div>
                                </div>
                                <div class="dropdown-submenu">
                                    <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-folder pdf-color"></i> Gestión de la Calidad (CAL) <i class="fas fa-chevron-right"></i></a>
                                    <div class="dropdown-subcontent">
                                        <a href="javascript:void(0);" onclick="abrirVisorPDF('${rutaBase}manuales/protocolos/Gestión de la Calidad (CAL)/Protocolo-CAL-1.pdf', 'Protocolo CAL 1')"><i class="fas fa-file-pdf pdf-color"></i> Calidad y Seguridad</a>
                                    </div>
                                </div>
                                <div class="dropdown-submenu">
                                    <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-folder pdf-color"></i> Recurso Humano (RH) <i class="fas fa-chevron-right"></i></a>
                                    <div class="dropdown-subcontent">
                                        <a href="javascript:void(0);" onclick="abrirVisorPDF('${rutaBase}manuales/protocolos/Recurso Humano (RH)/Protocolo-RH-1.pdf', 'Protocolo RH 1')"><i class="fas fa-file-pdf pdf-color"></i> Competencias del Personal</a>
                                    </div>
                                </div>
                                <div class="dropdown-submenu">
                                    <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-folder pdf-color"></i> Registros (REG) <i class="fas fa-chevron-right"></i></a>
                                    <div class="dropdown-subcontent">
                                        <a href="javascript:void(0);" onclick="abrirVisorPDF('${rutaBase}manuales/protocolos/Registros (REG)/Protocolo-REG-1.pdf', 'Protocolo REG 1')"><i class="fas fa-file-pdf pdf-color"></i> Ficha Clínica</a>
                                    </div>
                                </div>
                                <div class="dropdown-submenu">
                                    <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-folder pdf-color"></i> Seguridad de las Instalaciones (INS) <i class="fas fa-chevron-right"></i></a>
                                    <div class="dropdown-subcontent">
                                        <a href="javascript:void(0);" onclick="abrirVisorPDF('${rutaBase}manuales/protocolos/Seguridad de las Instalaciones (INS)/Protocolo-INS-1.pdf', 'Protocolo INS 1')"><i class="fas fa-file-pdf pdf-color"></i> Evacuación y Emergencia</a>
                                    </div>
                                </div>
                                <div class="dropdown-submenu">
                                    <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-folder pdf-color"></i> Seguridad del Equipamiento (EQ) <i class="fas fa-chevron-right"></i></a>
                                    <div class="dropdown-subcontent">
                                        <a href="javascript:void(0);" onclick="abrirVisorPDF('${rutaBase}manuales/protocolos/Seguridad del Equipamiento (EQ)/Protocolo-EQ-1.pdf', 'Protocolo EQ 1')"><i class="fas fa-file-pdf pdf-color"></i> Mantenimiento de Equipos</a>
                                    </div>
                                </div>
                                <div class="dropdown-submenu">
                                    <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-folder pdf-color"></i> Servicios de apoyo diagnóstico o terapéutico (AP) <i class="fas fa-chevron-right"></i></a>
                                    <div class="dropdown-subcontent">
                                        <a href="javascript:void(0);" onclick="abrirVisorPDF('${rutaBase}manuales/protocolos/Servicios de apoyo diagnóstico o terapéutico (AP)/Protocolo-AP-1.pdf', 'Protocolo AP 1')"><i class="fas fa-file-pdf pdf-color"></i> Laboratorio e Imagenología</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="dropdown-submenu">
                            <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-boxes doc-color"></i> Abastecimiento y Compras <i class="fas fa-chevron-right"></i></a>
                            <div class="dropdown-subcontent">
                                <a href="#" target="_blank"><i class="fas fa-shopping-cart doc-color"></i> Órdenes de Compra</a>
                                <a href="#" target="_blank"><i class="fas fa-clipboard-check doc-color"></i> Recepción Conforme</a>
                                <a href="#" target="_blank"><i class="fas fa-file-invoice doc-color"></i> Compra GIAL</a>
                            </div>
                        </div>
                        <a href="#" target="_blank"><i class="fas fa-folder-open doc-color"></i> Otros Documentos / Adjuntos</a>
                    </div>
                </div>

                <!-- Bienestar -->
                <div class="dropdown">
                    <button class="drop-btn"><i class="fas fa-smile-beam"></i> Bienestar <i class="fas fa-chevron-down"></i></button>
                    <div class="dropdown-content sub-dropdown-wrapper">
                        <div class="dropdown-submenu">
                            <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-theater-masks doc-color"></i> Agrupación Recreativa-Cultural <i class="fas fa-chevron-right"></i></a>
                            <div class="dropdown-subcontent">
                                <a href="#" target="_blank"><i class="fas fa-volleyball-ball doc-color"></i> Voleibol</a>
                                <a href="#" target="_blank"><i class="fas fa-music doc-color"></i> Folclore</a>
                            </div>
                        </div>
                        <div class="dropdown-submenu">
                            <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-project-diagram doc-color"></i> Proyectos <i class="fas fa-chevron-right"></i></a>
                            <div class="dropdown-subcontent">
                                <a href="#" target="_blank"><i class="fas fa-water doc-color"></i> Paseos a Termas</a>
                                <a href="#" target="_blank"><i class="fas fa-hiking doc-color"></i> Trekking</a>
                            </div>
                        </div>
                        <div class="dropdown-submenu">
                            <a href="javascript:void(0);" class="submenu-trigger"><i class="fas fa-calendar-check doc-color"></i> Actividades <i class="fas fa-chevron-right"></i></a>
                            <div class="dropdown-subcontent">
                                <a href="#" target="_blank"><i class="fas fa-child doc-color"></i> Día del Niño</a>
                                <a href="#" target="_blank"><i class="fas fa-gift doc-color"></i> Navidad</a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Derechos y Deberes -->
                <div class="dropdown">
                    <button class="drop-btn"><i class="fas fa-balance-scale"></i> Derechos y Deberes <i class="fas fa-chevron-down"></i></button>
                    <div class="dropdown-content sub-dropdown-wrapper">
                        <a href="javascript:void(0);" onclick="abrirModalNormativa('modalDerechos')"><i class="fas fa-gavel doc-color"></i> Ley N° 18.834 (Estatuto Administrativo)</a>
                        <a href="javascript:void(0);" onclick="abrirModalNormativa('modalProfesionales')"><i class="fas fa-user-shield doc-color"></i> Ley N° 19.664 (Profesionales Funcionarios)</a>
                        <a href="javascript:void(0);" onclick="abrirModalNormativa('modalAcoso')"><i class="fas fa-shield-alt doc-color"></i> Protección frente al Acoso y Violencia</a>
                    </div>
                </div>
            </div>
            
            <div class="nav-meta">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button onclick="toggleMuralAvisos()" title="Ver Mural de Avisos y Anuncios" style="background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 5px; transition: background 0.15s;">
                        <i class="fas fa-thumbtack"></i> <span>Avisos</span>
                    </button>
                </div>

                <div class="dropdown" id="authDropdownContainer">
                    <button class="nav-auth-btn" onclick="openAccesoFuncionarioModal()" style="background: #1e3a8a; color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s;">
                        <i class="fas fa-lock" style="color: #cbd5e1;"></i> <span>Acceso Funcionario</span>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- MODALES ASOCIADOS AL NAVBAR -->

    <!-- Modal de Autenticación de Funcionario -->
    <div id="accesoFuncionarioModal" class="modal-overlay hidden">
        <div class="modal-content modal-card-auth" style="background: #ffffff; width: 100%; max-width: 400px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; display: flex; flex-direction: column;">
            <div class="modal-auth-header" style="padding: 16px 20px; background: #0f172a; color: #fff; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-size: 1.1rem; margin: 0; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-lock"></i> Autenticación de Funcionario
                </h3>
                <button class="close-btn" onclick="closeAccesoFuncionarioModal()" style="background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #94a3b8;">&times;</button>
            </div>
            <div class="modal-auth-body" style="padding: 20px; display: flex; flex-direction: column; gap: 14px;">
                <p class="modal-subtitle" style="font-size: 0.78rem; color: #64748b; margin: 0;">
                    Ingrese sus credenciales institucionales del portal.
                </p>
                <form id="formAccesoFuncionario" onsubmit="handleAccesoFuncionario(event)">
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px;">
                        <label for="usuarioFuncionario" style="font-size: 0.75rem; font-weight: 600; color: #0f172a;">Usuario o RUN:</label>
                        <input type="text" id="usuarioFuncionario" class="auth-input" placeholder="Ej. usuario.institucional" required style="padding: 9px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.85rem; outline: none; width: 100%;">
                    </div>
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px;">
                        <label for="claveFuncionario" style="font-size: 0.75rem; font-weight: 600; color: #0f172a;">Contraseña:</label>
                        <input type="password" id="claveFuncionario" class="auth-input" placeholder="••••••••" required style="padding: 9px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.85rem; outline: none; width: 100%;">
                    </div>
                    <div id="errorAccesoFuncionario" class="auth-error hidden" style="font-size: 0.75rem; color: #ef4444; font-weight: 600; margin-bottom: 8px;">
                        Credenciales inválidas. Intente nuevamente.
                    </div>
                    <button type="submit" class="auth-submit-btn" style="background: #1e3a8a; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.85rem; width: 100%;">
                        Ingresar al Sistema
                    </button>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal de Publicación de Noticia -->
    <div id="noticiaModal" class="modal-overlay hidden">
        <div class="modal-card-auth" style="max-width: 650px; width: 95%;">
            <div class="modal-auth-header">
                <h3><i class="fas fa-pen-nib"></i> Panel de Publicación de Noticias</h3>
                <button onclick="closeModal('noticiaModal')" class="close-modal">&times;</button>
            </div>
            <div class="modal-auth-body" style="max-height: 80vh; overflow-y: auto;">
                <input type="hidden" id="noticiaEditId">
                <div class="form-group">
                    <label for="noticiaTitulo">Título de la Noticia</label>
                    <input type="text" id="noticiaTitulo" placeholder="Ej: Inauguración de nueva sala..." class="auth-input">
                </div>
                <div class="form-group">
                    <label for="noticiaFecha">Fecha de la Noticia</label>
                    <input type="date" id="noticiaFecha" class="auth-input">
                </div>
                <div class="form-group">
                    <label for="noticiaImagenFile">Imagen Destacada (Adjuntar Archivo)</label>
                    <input type="file" id="noticiaImagenFile" accept="image/*" class="auth-input" onchange="previewImage(event)">
                    <div id="imagePreviewContainer" style="margin-top: 8px; text-align: center;"></div>
                </div>
                <div class="form-group">
                    <label for="noticiaContenido">Contenido de la Noticia</label>
                    <div class="rich-toolbar">
                        <button type="button" onclick="formatearTexto('bold')" title="Negrita"><i class="fas fa-bold"></i></button>
                        <button type="button" onclick="formatearTexto('italic')" title="Cursiva"><i class="fas fa-italic"></i></button>
                        <button type="button" onclick="formatearTexto('underline')" title="Subrayado"><i class="fas fa-underline"></i></button>
                        <button type="button" onclick="formatearTexto('increase')" title="Agrandar Texto"><i class="fas fa-search-plus"></i></button>
                    </div>
                    <textarea id="noticiaContenido" rows="5" placeholder="Escriba el detalle de la noticia..." class="auth-input" style="resize: vertical; border-top-left-radius: 0; border-top-right-radius: 0;"></textarea>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button onclick="guardarNoticia()" class="auth-submit-btn" style="flex: 1;"><i class="fas fa-save"></i> Publicar en el Portal</button>
                    <button onclick="limpiarFormNoticia()" class="auth-submit-btn" style="flex: 0.4; background: #64748b;">Limpiar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Misión y Visión -->
    <div id="misionModal" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 650px;">
            <div class="modal-header">
                <h2><i class="fas fa-bullseye"></i> Misión y Visión Institucional</h2>
                <button class="close-modal-btn" onclick="closeModal('misionModal')">&times;</button>
            </div>
            <div class="modal-body" style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; gap: 15px; align-items: flex-start; background: #f8fafc; padding: 18px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <div style="font-size: 2.2rem; color: #f59e0b; min-width: 45px; text-align: center; padding-top: 2px;">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 1.05rem;">Misión</h3>
                        <p style="margin: 0; color: #475569; font-size: 0.92rem; line-height: 1.5;">Somos un Hospital público que contribuye a la salud de nuestra comunidad, desde un enfoque familiar, en forma humana, oportuna y segura, integrando lo mejor de la práctica clínica con la sabiduría ancestral, basada en principios de equidad e igualdad y respetando la diversidad de género y cultura.</p>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; align-items: flex-start; background: #f8fafc; padding: 18px; border-radius: 8px; border-left: 4px solid #0284c7;">
                    <div style="font-size: 2.2rem; color: #0284c7; min-width: 45px; text-align: center; padding-top: 2px;">
                        <i class="fas fa-eye"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 1.05rem;">Visión</h3>
                        <p style="margin: 0; color: #475569; font-size: 0.92rem; line-height: 1.5;">Ser un Hospital público moderno, de excelencia técnica y humana, inclusiva e integrada a la comunidad y a la red del Servicio de Salud.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Población Asignada -->
    <div id="poblacionModal" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 650px;">
            <div class="modal-header">
                <h2><i class="fas fa-users"></i> Población Asignada y Territorio</h2>
                <button class="close-modal-btn" onclick="closeModal('poblacionModal')">&times;</button>
            </div>
            <div class="modal-body" style="display: flex; flex-direction: column; gap: 15px; color: #475569; font-size: 0.92rem; line-height: 1.5;">
                <div style="display: flex; gap: 15px; align-items: center; background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
                    <div style="font-size: 2.5rem; color: #16a34a; min-width: 50px; text-align: center;">
                        <i class="fas fa-map-marked-alt"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0 0 4px 0; color: #1e293b; font-size: 1rem;">Comuna de Lanco</h3>
                        <p style="margin: 0;">Superficie de <strong>532,4 km²</strong> en la Región de Los Ríos. La comuna presenta una importante presencia de población perteneciente a pueblos originarios y características de diversidad cultural.</p>
                    </div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 0.95rem;"><i class="fas fa-chart-bar" style="color: #0284c7; margin-right: 6px;"></i> Datos Demográficos (Censo 2024)</h4>
                    <ul style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px;">
                        <li><strong>16.876 habitantes</strong> según el Censo 2024.</li>
                        <li>La población representa aproximadamente el <strong>4,2%</strong> de la población de la Región de Los Ríos.</li>
                        <li>Entre 2017 y 2024, la población aumentó aproximadamente un <strong>0,7%</strong>.</li>
                    </ul>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 0.95rem;"><i class="fas fa-network-wired" style="color: #8b5cf6; margin-right: 6px;"></i> Red de Atención Rural</h4>
                    <p style="margin: 0 0 8px 0;">La localidad de <strong>Malalhue</strong> cuenta con el <strong>CESFAM Malalhue</strong>, establecimiento de atención primaria de salud.</p>
                    <p style="margin: 0; font-size: 0.88rem; color: #64748b;"><strong>Estaciones Médico Rurales:</strong> Antilhue, Chosdoy, Lumaco, Puquiñe I y II, Panguinilahue, Huenuye, Hueima y Aylin, con atención en sectores rurales y/o sedes comunitarias.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Organigrama y Equipo Institucional Dinámico -->
    <div id="equipoModal" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 1480px; width: 98%; max-height: 92vh;">
            <div class="modal-header" style="background: #0f172a; padding: 18px 24px;">
                <h2 style="font-size: 1.2rem; color: #ffffff;"><i class="fas fa-sitemap" style="color: #38bdf8;"></i> Organigrama y Equipo Institucional</h2>
                <button class="close-modal-btn" onclick="closeModal('equipoModal')" style="font-size: 1.5rem; color: #ffffff; background: none; border: none; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body" style="max-height: calc(92vh - 75px); overflow-y: auto; padding: 30px; background: #f1f5f9;">
                <p style="margin-bottom: 25px; color: #475569; font-size: 0.95rem; text-align: center; max-width: 900px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                    Estructura jerárquica oficial, mandos directivos, unidades operativas, titulares y subrogantes del Hospital Familiar y Comunitario de Lanco.
                </p>
                <div id="arbolEquipoContainer" class="org-tree-container"></div>
            </div>
        </div>
    </div>

    <!-- Acreditación en Calidad -->
    <div id="acreditacionModal" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 650px;">
            <div class="modal-header">
                <h2><i class="fas fa-award" style="color: #16a34a;"></i> Historial de Acreditación en Calidad</h2>
                <button class="close-modal-btn" onclick="closeModal('acreditacionModal')">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: #64748b; font-size: 0.92rem; margin-bottom: 20px;">
                    Comprometidos con la excelencia y la seguridad de nuestros pacientes en el Hospital Familiar y Comunitario de Lanco.
                </p>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <a href="https://www.superdesalud.gob.cl/normativa/resolucion-exenta-ip-n564/" target="_blank" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; text-decoration: none; color: inherit; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-certificate" style="font-size: 1.8rem; color: #0284c7;"></i>
                        <div>
                            <h4 style="margin: 0 0 4px 0; color: #1e293b; font-size: 1rem;">1ª Acreditación</h4>
                            <p style="margin: 0; font-size: 0.8rem; color: #0284c7; text-decoration: underline;">Ver Resolución Exenta IP Nº 564</p>
                        </div>
                    </a>
                    <a href="https://www.superdesalud.gob.cl/normativa/resolucion-exenta-ip-n-3538-2/" target="_blank" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; text-decoration: none; color: inherit; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-certificate" style="font-size: 1.8rem; color: #16a34a;"></i>
                        <div>
                            <h4 style="margin: 0 0 4px 0; color: #1e293b; font-size: 1rem;">2ª Acreditación</h4>
                            <p style="margin: 0; font-size: 0.8rem; color: #16a34a; text-decoration: underline;">Ver Resolución Exenta IP Nº 3538</p>
                        </div>
                    </a>
                    <div style="background: #f0fdf4; border: 1px dashed #16a34a; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-hourglass-half" style="font-size: 1.8rem; color: #ca8a04;"></i>
                        <div>
                            <h4 style="margin: 0 0 4px 0; color: #16a34a; font-size: 1rem;">3ª Acreditación</h4>
                            <p style="margin: 0; font-size: 0.8rem; color: #ca8a04; font-weight: 600;">Proceso de Tercera Acreditación Próximamente</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Dependencias Anexas -->
    <div id="dependenciasModal" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 750px; width: 95%;">
            <div class="modal-header">
                <h2><i class="fas fa-hospital-user" style="color: #38bdf8;"></i> Dependencias Anexas al Hospital</h2>
                <button class="close-modal-btn" onclick="closeModal('dependenciasModal')">&times;</button>
            </div>
            <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 25px; display: flex; flex-direction: column; gap: 20px;">
                <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 5px; text-align: center;">
                    Conozca los dispositivos institucionales que funcionan fuera del edificio central, brindando apoyo a la comunidad y a nuestros funcionarios.
                </p>
                <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                    <div style="background: #059669; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-leaf" style="font-size: 1.5rem;"></i>
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Küme Mongen Ruka</h3>
                    </div>
                    <div style="padding: 20px;">
                        <p style="margin: 0 0 15px 0; color: #475569; font-size: 0.9rem; line-height: 1.5;">
                            <strong>Casa de la Buena Salud.</strong> Espacio dedicado a la salud intercultural y medicina ancestral Mapuche, promoviendo un modelo de atención con pertinencia cultural, articulación con machis y facilitadores interculturales.
                        </p>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #bbf7d0;">
                            <div>
                                <strong style="font-size: 0.8rem; color: #166534; display: block;"><i class="fas fa-map-marker-alt"></i> Ubicación:</strong>
                                <span style="font-size: 0.85rem; color: #1e293b;">[Ingresar Dirección exacta en Lanco]</span>
                            </div>
                            <div>
                                <strong style="font-size: 0.8rem; color: #166534; display: block;"><i class="fas fa-clock"></i> Horario de Atención:</strong>
                                <span style="font-size: 0.85rem; color: #1e293b;">Lunes a Viernes: 08:00 a 17:00 hrs.</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                    <div style="background: #e11d48; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-baby" style="font-size: 1.5rem;"></i>
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Sala Cuna Institucional</h3>
                    </div>
                    <div style="padding: 20px;">
                        <p style="margin: 0 0 15px 0; color: #475569; font-size: 0.9rem; line-height: 1.5;">
                            Dispositivo de bienestar orientado al cuidado, estimulación y educación inicial de los hijos e hijas de nuestras funcionarias y funcionarios, permitiendo la conciliación de la vida laboral y familiar.
                        </p>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: #fff1f2; padding: 12px; border-radius: 8px; border: 1px solid #fecdd3;">
                            <div>
                                <strong style="font-size: 0.8rem; color: #9f1239; display: block;"><i class="fas fa-map-marker-alt"></i> Ubicación:</strong>
                                <span style="font-size: 0.85rem; color: #1e293b;">[Ingresar Dirección de la Sala Cuna]</span>
                            </div>
                            <div>
                                <strong style="font-size: 0.8rem; color: #9f1239; display: block;"><i class="fas fa-clock"></i> Horario de Funcionamiento:</strong>
                                <span style="font-size: 0.85rem; color: #1e293b;">Sujeto a turnos (Ej: 07:30 a 17:30 hrs)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Asociaciones Gremiales -->
    <div id="gremiosModal" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 900px; width: 95%;">
            <div class="modal-header">
                <h2><i class="fas fa-users-cog" style="color: #38bdf8;"></i> Asociaciones Gremiales</h2>
                <button class="close-modal-btn" onclick="closeModal('gremiosModal')">&times;</button>
            </div>
            <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 25px;">
                <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 25px; text-align: center;">
                    Organizaciones sindicales presentes en nuestro Hospital, encargadas de representar y promover los derechos y el bienestar de los funcionarios y funcionarias.
                </p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; border-top: 4px solid #0284c7; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="padding: 20px 15px 15px 15px; text-align: center; border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                            <div style="width: 70px; height: 70px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 12px auto;">
                                <i class="fas fa-user-md"></i>
                            </div>
                            <h4 style="margin: 0; color: #1e293b; font-size: 1.1rem; font-weight: 700;">FENPRUSS</h4>
                            <span style="font-size: 0.75rem; color: #64748b;">Profesionales Universitarios</span>
                        </div>
                        <div style="padding: 15px; flex: 1; display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <strong style="font-size: 0.8rem; color: #475569;"><i class="fas fa-calendar-alt"></i> Fundación / Creación:</strong>
                                <div style="color: #1e293b; font-size: 0.85rem; margin-top: 2px;">[Año FENPRUSS]</div>
                            </div>
                            <div>
                                <strong style="font-size: 0.8rem; color: #475569;"><i class="fas fa-sitemap"></i> Directiva Actual:</strong>
                                <ul style="margin: 6px 0 0 0; padding-left: 15px; font-size: 0.85rem; color: #1e293b; display: flex; flex-direction: column; gap: 6px;">
                                    <li><strong>Presidente(a):</strong> [Nombre]</li>
                                    <li><strong>Secretario(a):</strong> [Nombre]</li>
                                    <li><strong>Tesorero(a):</strong> [Nombre]</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; border-top: 4px solid #dc2626; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="padding: 20px 15px 15px 15px; text-align: center; border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                            <div style="width: 70px; height: 70px; background: #fee2e2; color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 12px auto;">
                                <i class="fas fa-hospital-user"></i>
                            </div>
                            <h4 style="margin: 0; color: #1e293b; font-size: 1.1rem; font-weight: 700;">FENATS Histórica</h4>
                            <span style="font-size: 0.75rem; color: #64748b;">Trabajadores de la Salud</span>
                        </div>
                        <div style="padding: 15px; flex: 1; display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <strong style="font-size: 0.8rem; color: #475569;"><i class="fas fa-calendar-alt"></i> Fundación / Creación:</strong>
                                <div style="color: #1e293b; font-size: 0.85rem; margin-top: 2px;">[Año FENATS Histórica]</div>
                            </div>
                            <div>
                                <strong style="font-size: 0.8rem; color: #475569;"><i class="fas fa-sitemap"></i> Directiva Actual:</strong>
                                <ul style="margin: 6px 0 0 0; padding-left: 15px; font-size: 0.85rem; color: #1e293b; display: flex; flex-direction: column; gap: 6px;">
                                    <li><strong>Presidente(a):</strong> [Nombre]</li>
                                    <li><strong>Secretario(a):</strong> [Nombre]</li>
                                    <li><strong>Tesorero(a):</strong> [Nombre]</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; border-top: 4px solid #ea580c; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="padding: 20px 15px 15px 15px; text-align: center; border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                            <div style="width: 70px; height: 70px; background: #ffedd5; color: #ea580c; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 12px auto;">
                                <i class="fas fa-users"></i>
                            </div>
                            <h4 style="margin: 0; color: #1e293b; font-size: 1.1rem; font-weight: 700;">FENATS Unitaria</h4>
                            <span style="font-size: 0.75rem; color: #64748b;">Trabajadores de la Salud</span>
                        </div>
                        <div style="padding: 15px; flex: 1; display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <strong style="font-size: 0.8rem; color: #475569;"><i class="fas fa-calendar-alt"></i> Fundación / Creación:</strong>
                                <div style="color: #1e293b; font-size: 0.85rem; margin-top: 2px;">[Año FENATS Unitaria]</div>
                            </div>
                            <div>
                                <strong style="font-size: 0.8rem; color: #475569;"><i class="fas fa-sitemap"></i> Directiva Actual:</strong>
                                <ul style="margin: 6px 0 0 0; padding-left: 15px; font-size: 0.85rem; color: #1e293b; display: flex; flex-direction: column; gap: 6px;">
                                    <li><strong>Presidente(a):</strong> [Nombre]</li>
                                    <li><strong>Secretario(a):</strong> [Nombre]</li>
                                    <li><strong>Tesorero(a):</strong> [Nombre]</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Mural de Avisos y Anuncios Rápidos -->
    <div id="muralAvisosModal" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 750px; width: 95%;">
            <div id="muralAvisosGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 20px;"></div>
            <div class="modal-header" style="background: #0f172a; color: white;">
                <h2><i class="fas fa-thumbtack" style="color: #38bdf8;"></i> Mural de Avisos y Anuncios Rápidos</h2>
                <button class="close-modal-btn" onclick="toggleMuralAvisos()" style="color: white;">&times;</button>
            </div>
            <div id="formCrearAvisoContainer" class="hidden" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <h4 style="margin: 0 0 10px 0; font-size: 0.95rem; color: #0f172a;"><i class="fas fa-plus-circle" style="color: #0284c7;"></i> Publicar Nuevo Aviso Rápido</h4>
                <form id="formCrearAviso" onsubmit="publicarNuevoAviso(event)" style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="nuevoAvisoTitulo" placeholder="Título del aviso..." required style="flex: 1; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.8rem;">
                        <select id="nuevoAvisoTipo" style="padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.8rem;">
                            <option value="general">General</option>
                            <option value="reunion">Reunión</option>
                            <option value="tic">Informativo TIC</option>
                        </select>
                    </div>
                    <textarea id="nuevoAvisoTexto" rows="2" placeholder="Escriba el detalle del anuncio..." required style="padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.8rem; resize: vertical;"></textarea>
                    <button type="submit" style="background: #0284c7; color: white; border: none; padding: 7px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.8rem; align-self: flex-end;">
                        <i class="fas fa-paper-plane"></i> Publicar en el Mural
                    </button>
                </form>
            </div>
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding: 20px; background: #f8fafc;">
                <p style="color: #64748b; font-size: 0.88rem; margin-bottom: 20px; text-align: center;">
                    Espacio comunitario para recordatorios breves, reuniones de servicio y avisos generales del hospital.
                </p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
                    <div style="background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                        <span style="font-size: 0.68rem; font-weight: 700; color: #d97706; text-transform: uppercase;"><i class="fas fa-users"></i> Reunión</span>
                        <h4 style="margin: 6px 0 6px 0; font-size: 0.95rem; color: #78350f;">Comité de Calidad</h4>
                        <p style="margin: 0; font-size: 0.8rem; color: #92400e;">Jueves a las 10:00 AM en la Sala de Reuniones principal.</p>
                    </div>
                    <div style="background: #e0f2fe; border: 1px solid #bae6fd; border-left: 4px solid #0284c7; padding: 15px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                        <span style="font-size: 0.68rem; font-weight: 700; color: #0284c7; text-transform: uppercase;"><i class="fas fa-laptop-code"></i> Informativo TIC</span>
                        <h4 style="margin: 6px 0 6px 0; font-size: 0.95rem; color: #0369a1;">Actualización de Redes</h4>
                        <p style="margin: 0; font-size: 0.8rem; color: #075985;">Mantención programada este viernes de 14:00 a 16:00 hrs.</p>
                    </div>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; padding: 15px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                        <span style="font-size: 0.68rem; font-weight: 700; color: #16a34a; text-transform: uppercase;"><i class="fas fa-bullhorn"></i> General</span>
                        <h4 style="margin: 6px 0 6px 0; font-size: 0.95rem; color: #14532d;">Campaña de Vacunación</h4>
                        <p style="margin: 0; font-size: 0.8rem; color: #166534;">Funcionarios pasar por policlínico en horario continuado.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Ley N° 18.834 (Estatuto Administrativo) -->
    <div id="modalDerechos" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 650px;">
            <div class="modal-header">
                <h2><i class="fas fa-gavel"></i> Ley N° 18.834 (Estatuto Administrativo)</h2>
                <button class="close-modal-btn" onclick="cerrarModalesNormativa()">&times;</button>
            </div>
            <div class="modal-body" style="display: flex; flex-direction: column; gap: 15px; color: #475569; font-size: 0.92rem; line-height: 1.5;">
                <div style="position: relative; height: 140px; border-radius: 8px; overflow: hidden; display: flex; align-items: flex-end; padding: 15px; background: linear-gradient(rgba(15,23,42,0.2), rgba(15,23,42,0.8)), url('https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80') center/cover;">
                    <div style="color: white; z-index: 2;">
                        <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background: #0284c7; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-bottom: 6px;">Marco Legal</span>
                        <h3 style="margin: 0; font-size: 1.1rem; color: #ffffff;">Estatuto Administrativo</h3>
                    </div>
                </div>
                <p style="margin: 0; color: #475569;">
                    Regula los deberes, derechos, responsabilidades y prohibiciones de los funcionarios de la administración del Estado, asegurando la carrera funcionaria basada en el mérito.
                </p>
                <div style="display: flex; gap: 15px; align-items: flex-start; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7;">
                    <div style="font-size: 1.8rem; color: #0284c7; min-width: 40px; text-align: center; padding-top: 2px;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 1rem;">Principales Derechos</h3>
                        <ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px;">
                            <li>Estabilidad en el empleo y carrera funcionaria basada en el mérito.</li>
                            <li>Derecho a percibir remuneraciones y asignaciones establecidas por ley.</li>
                            <li>Permisos administrativos, feriados legales y licencias médicas justificadas.</li>
                            <li>Derecho a defensa jurídica ante actos que afecten el ejercicio de sus funciones.</li>
                        </ul>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; align-items: flex-start; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b;">
                    <div style="font-size: 1.8rem; color: #f59e0b; min-width: 40px; text-align: center; padding-top: 2px;">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 1rem;">Principales Deberes</h3>
                        <ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px;">
                            <li>Desempeñar su cargo con eficiencia, probidad y lealtad institucional.</li>
                            <li>Cumplir la jornada de trabajo y ejecutar las tareas encomendadas.</li>
                            <li>Guardar secreto respecto de los asuntos reservados de la institución.</li>
                            <li>Observar una conducta decorosa tanto dentro como fuera de la institución.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Ley N° 19.664 (Profesionales Funcionarios) -->
    <div id="modalProfesionales" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 650px;">
            <div class="modal-header">
                <h2><i class="fas fa-user-shield"></i> Ley N° 19.664 (Profesionales Funcionarios)</h2>
                <button class="close-modal-btn" onclick="cerrarModalesNormativa()">&times;</button>
            </div>
            <div class="modal-body" style="display: flex; flex-direction: column; gap: 15px; color: #475569; font-size: 0.92rem; line-height: 1.5;">
                <div style="display: flex; gap: 15px; align-items: center; background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
                    <div style="font-size: 2.2rem; color: #16a34a; min-width: 45px; text-align: center;">
                        <i class="fas fa-user-md"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0 0 4px 0; color: #1e293b; font-size: 1rem;">Ámbito de Aplicación</h3>
                        <p style="margin: 0;">Regula la carrera funcionaria, asignaciones especiales, sistemas de destinación y formación, y las normas de ingreso para los profesionales funcionarios que se desempeñan en los Servicios de Salud.</p>
                    </div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 0.95rem;"><i class="fas fa-star" style="color: #16a34a; margin-right: 6px;"></i> Aspectos Clave</h4>
                    <ul style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px;">
                        <li>Establece la asignación de estímulo y especialización médica/odontológica.</li>
                        <li>Regula los tiempos de desempeño y la compatibilidad de bloques horarios.</li>
                        <li>Define los mecanismos de evaluación de desempeño profesional periódico.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Protección frente al Acoso y Violencia -->
    <div id="modalAcoso" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 650px;">
            <div class="modal-header">
                <h2><i class="fas fa-shield-alt"></i> Protección frente al Acoso y Violencia</h2>
                <button class="close-modal-btn" onclick="cerrarModalesNormativa()">&times;</button>
            </div>
            <div class="modal-body" style="display: flex; flex-direction: column; gap: 15px; color: #475569; font-size: 0.92rem; line-height: 1.5;">
                <p style="margin: 0;">
                    El Hospital Familiar y Comunitario de Lanco cuenta con un entorno laboral protegido que rechaza toda forma de acoso laboral (mobbing), acoso sexual o violencia en el trabajo.
                </p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #ef4444;">
                    <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 0.95rem;"><i class="fas fa-hands-helping" style="color: #ef4444; margin-right: 6px;"></i> Canales de Resguardo y Denuncia</h4>
                    <ul style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px;">
                        <li><strong>Departamento de Recursos Humanos / Personal:</strong> Orientación inicial y activación de protocolos internos.</li>
                        <li><strong>Comité de Buen Trato Laboral:</strong> Instancia de mediación, apoyo psicológico y revisión de clima organizacional.</li>
                        <li><strong>Prevención de Riesgos:</strong> Evaluaciones de condiciones de seguridad y violencia externa/interna.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Visor de Documentos PDF -->
    <div id="pdfViewerModal" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 90%; width: 1000px; height: 88vh; display: flex; flex-direction: column;">
            <div class="modal-header" style="background: #0f172a; color: #ffffff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;">
                <h3 id="pdfViewerTitle" style="margin: 0; font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-file-pdf" style="color: #ef4444;"></i> Visor de Documentos
                </h3>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <a id="pdfDownloadLink" href="#" download target="_blank" style="color: #38bdf8; text-decoration: none; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 5px;">
                        <i class="fas fa-download"></i> Descargar
                    </a>
                    <button class="close-modal-btn" onclick="cerrarVisorPDF()" style="background: none; border: none; color: #ffffff; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
            </div>
            <div class="modal-body" style="flex: 1; padding: 0; background: #525659; overflow: hidden;">
                <iframe id="pdfFrame" src="" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>
        </div>
    </div>
    `;

    let navContainer = document.getElementById('app-navbar');
    if (!navContainer) {
        navContainer = document.createElement('div');
        navContainer.id = 'app-navbar';
        document.body.insertBefore(navContainer, document.body.firstChild);
    }
    navContainer.innerHTML = navbarHTML;

    // Disparador seguro para notificar a auth.js que el Navbar ya está listo en el DOM
    document.dispatchEvent(new CustomEvent('navbarLoaded'));
});