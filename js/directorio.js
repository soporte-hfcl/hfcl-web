// ==========================================================================
// HOSPITAL LANCO - AGENDA TELEFÓNICA (VERSIÓN CON ANEXOS COMPARTIDOS / TURNOS)
// ==========================================================================
const URL_API_SHEETS = "https://script.google.com/macros/s/AKfycby_MZCFYKhRSaKl0hoFQWW5G6nZQNX8nC8CXljeGdrgeLt_Hb43SHMIFjJ4e3AbJkQPAA/exec";

let contacts = [];
let directorioCargado = false; // Bandera de control de sincronización con la nube

window.openReportModal = function(id) {
    const reportModal = document.getElementById('modalReporteError');
    const contact = window.getContactById ? window.getContactById(id) : null;
    
    if (reportModal && contact) {
        document.getElementById('reporteContactId').value = contact.id;
        document.getElementById('reporteContactName').value = contact.name || 'Sin nombre';
        document.getElementById('reporteContactPhone').value = contact.phone || 'S/N';
        document.getElementById('reporteContactUnit').value = contact.department || contact.location || 'General';
        
        const infoEl = document.getElementById('reporteTargetInfo');
        if (infoEl) infoEl.innerText = `${contact.name} (Anexo: ${contact.phone})`;
        
        reportModal.classList.remove('hidden');
        reportModal.style.display = 'flex';
    }
};

window.addEventListener('load', () => {
    const preloader = document.getElementById('pagePreloader');
    if (preloader) {
        setTimeout(() => preloader.classList.add('fade-out'), 300); 
    }
});

function renderSkeletonCards() {
    const cardsContainerInternos = document.getElementById('cardsContainerInternos');
    if (!cardsContainerInternos) return;

    cardsContainerInternos.style.display = 'grid';
    cardsContainerInternos.innerHTML = "";

    for (let i = 0; i < 8; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'hfcl-skeleton-card';
        skeleton.innerHTML = `
            <div class="hfcl-color-bar">
                <div class="hfcl-bar-blue"></div>
                <div class="hfcl-bar-red"></div>
            </div>
            <div>
                <div class="skeleton-shimmer skeleton-avatar"></div>
                <div class="skeleton-shimmer skeleton-text-name"></div>
                <div class="skeleton-shimmer skeleton-text-role"></div>
                <div class="skeleton-shimmer skeleton-text-unit"></div>
            </div>
            <div class="skeleton-shimmer skeleton-footer"></div>
            <div class="hfcl-color-bar">
                <div class="hfcl-bar-blue"></div>
                <div class="hfcl-bar-red"></div>
            </div>
        `;
        cardsContainerInternos.appendChild(skeleton);
    }
}

// --- PROCESAMIENTO Y AGRUPAMIENTO AUTOMÁTICO DE ANEXOS COMPARTIDOS ---
function procesarListaFuncionarios(rawList) {
    const processed = rawList.map((func, index) => {
        const nombreCompleto = `${func.nombre || ''} ${func.apellido_paterno || ''}`.trim();
        const anexoVal = String(func.anexo || func.phone || '').trim();
        
        const generoVal = String(func.genero || func.sexo || '').trim().toUpperCase();
        const esFemenino = (generoVal === 'F' || generoVal === 'FEMENINO' || generoVal === 'MUJER');

        let cargoBase = func.cargo || func.position || '-';
        if (func.cargo_femenino && func.cargo_masculino) {
            cargoBase = esFemenino ? func.cargo_femenino : func.cargo_masculino;
        }

        let insigniaTipo = null;
        let insigniaTexto = '';
        let insigniaIcon = '';

        const esDirector = String(func.director || '').trim().toUpperCase() === 'SÍ' || String(func.director || '').trim().toUpperCase() === 'SI';
        const esDirectorSub = String(func.director_s || '').trim().toUpperCase() === 'SÍ' || String(func.director_s || '').trim().toUpperCase() === 'SI';
        const tieneCoordinacion = String(func.coordinacion || '').trim() !== '';
        const esJefeDepto = String(func.jefe_depto || '').trim().toUpperCase() === 'SÍ' || String(func.jefe_depto || '').trim().toUpperCase() === 'SI';
        const esJefeUnidad = String(func.jefe_unidad || '').trim().toUpperCase() === 'SÍ' || String(func.jefe_unidad || '').trim().toUpperCase() === 'SI';
        const esSubrogante = String(func.subrogante || '').trim().toUpperCase() === 'SÍ' || String(func.subrogante || '').trim().toUpperCase() === 'SI';

        if (esDirector) {
            insigniaTipo = 'dir-titular'; insigniaTexto = 'Dirección'; insigniaIcon = 'fa-crown';
        } else if (esDirectorSub) {
            insigniaTipo = 'dir-sub'; insigniaTexto = 'Subdirección'; insigniaIcon = 'fa-chess-king';
        } else if (esJefeDepto) {
            insigniaTipo = 'jefe-depto'; insigniaTexto = 'Jefatura Depto.'; insigniaIcon = 'fa-award';
        } else if (esJefeUnidad) {
            insigniaTipo = 'jefe-unidad'; insigniaTexto = 'Jefatura Unidad'; insigniaIcon = 'fa-star';
        } else if (tieneCoordinacion) {
            insigniaTipo = 'coordinacion'; insigniaTexto = 'Coordinación'; insigniaIcon = 'fa-user-nurse';
        } else if (esSubrogante) {
            insigniaTipo = 'subrogancia'; insigniaTexto = 'Subrogancia (S)'; insigniaIcon = 'fa-shield-alt';
        }

        return {
            id: String(func.rut || func.id || `i_${index}`),
            name: nombreCompleto || func.name || 'Sin Nombre',
            position: cargoBase,
            department: func.unidad || func.department || 'General',
            location: func.ubicacion || func.location || func.unidad || '-',
            phone: anexoVal,
            email: func.correo || func.email || '',
            schedule: "08:00 - 17:00",
            is247: false,
            insignia: insigniaTipo ? { tipo: insigniaTipo, texto: insigniaTexto, icon: insigniaIcon } : null
        };
    }).filter(c => {
        const tel = c.phone ? String(c.phone).trim().toUpperCase() : "";
        return tel !== "" && tel !== "S/N" && tel !== "-" && tel !== "UNDEFINED" && tel !== "NULL";
    });

    const phoneCounts = {};
    processed.forEach(c => {
        if (c.phone) phoneCounts[c.phone] = (phoneCounts[c.phone] || 0) + 1;
    });

    const groupedPhonesProcessed = new Set();
    const finalContacts = [];

    processed.forEach(contact => {
        const phone = contact.phone;
        if (phone && phoneCounts[phone] > 1) {
            if (!groupedPhonesProcessed.has(phone)) {
                groupedPhonesProcessed.add(phone);
                const miembros = processed.filter(c => c.phone === phone);
                finalContacts.push({
                    id: `group_${phone}`,
                    name: contact.location || contact.department || 'Turno / Sala Compartida',
                    position: 'Atención por Turnos 24/7',
                    department: contact.department,
                    location: contact.location || 'Hospital Lanco',
                    phone: phone,
                    email: '',
                    schedule: 'Sistema de Turnos Rotativos',
                    isSharedGroup: true,
                    miembros: miembros
                });
            }
        } else {
            finalContacts.push(contact);
        }
    });

    return finalContacts;
}

document.addEventListener('DOMContentLoaded', async () => {
    const initialContactosExternos = [
        { id: "e1", name: "CESFAM Malalhue", location: "Malalhue", phone: "632 316 231" },
        { id: "e2", name: "Urgencia Panguipulli", location: "Panguipulli", phone: "632 635 206" },
        { id: "e3", name: "OIRS San José", location: "San José de la Mariquina", phone: "63 4289" },
        { id: "e4", name: "Hospital San José", location: "San José de la Mariquina", phone: "63 4295" }
    ];
    let contactosExternos = JSON.parse(localStorage.getItem('hfc_lan_externos_data')) || initialContactosExternos;

    let isAdmin = false;
    let favorites = JSON.parse(localStorage.getItem('hfc_lan_favorites')) || [];
    let currentView = 'cards';
    let currentSection = 'internos';

    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const departmentFilter = document.getElementById('departmentFilter');
    const sortOrder = document.getElementById('sortOrder');
    const contactList = document.getElementById('contactList');
    const tableContainerInternos = document.getElementById('tableContainerInternos');
    const cardsContainerInternos = document.getElementById('cardsContainerInternos');
    
    const searchInputExternos = document.getElementById('searchInputExternos');
    const clearSearchExternos = document.getElementById('clearSearchExternos');
    const sortOrderExternos = document.getElementById('sortOrderExternos');
    const contactListExternos = document.getElementById('contactListExternos');
    const tableContainerExternos = document.getElementById('tableContainerExternos');
    const cardsContainerExternos = document.getElementById('cardsContainerExternos');
    
    const favoritesContainer = document.getElementById('favoritesContainer');
    const favoritesContainerExternos = document.getElementById('favoritesContainerExternos');
    const favoritesSidebarBox = document.getElementById('favoritesSidebarBox');
    const favoritesSidebarBoxExternos = document.getElementById('favoritesSidebarBoxExternos');

    const btnViewTable = document.getElementById('btnViewTable');
    const btnViewCards = document.getElementById('btnViewCards');
    const btnEmergencias = document.getElementById('btnEmergencias');
    const modalEmergencias = document.getElementById('modalEmergencias');
    const closeModalBtn = document.getElementById('btnCloseModal');

    // Mostrar aviso visual de carga inicial
    if (cardsContainerInternos) {
        cardsContainerInternos.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 35px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; color: #64748b;">
                <i class="fas fa-spinner fa-spin" style="font-size: 1.6rem; color: #0284c7; margin-bottom: 10px; display: block;"></i>
                <strong>Sincronizando directorio telefónico desde la nube...</strong><br>
                <span style="font-size: 0.85rem;">Un momento por favor.</span>
            </div>
        `;
    }

    function updateDepartmentOptions(data) {
        if (!departmentFilter) return;
        const currentSelected = departmentFilter.value;
        const units = [...new Set(data.map(c => c.department?.trim()).filter(Boolean))].sort((a, b) => 
            a.localeCompare(b, 'es', { sensitivity: 'base' })
        );

        departmentFilter.innerHTML = '<option value="">Todos los departamentos / Unidades</option>';
        units.forEach(unit => {
            const opt = document.createElement('option');
            opt.value = unit;
            opt.textContent = unit;
            departmentFilter.appendChild(opt);
        });

        if (units.includes(currentSelected)) {
            departmentFilter.value = currentSelected;
        }
    }

    try {
        const respuesta = await fetch(URL_API_SHEETS);
        const datosNube = await respuesta.json();
        
        let listaRaw = [];
        if (datosNube.funcionarios && Array.isArray(datosNube.funcionarios)) {
            listaRaw = datosNube.funcionarios;
        } else if (Array.isArray(datosNube)) {
            listaRaw = datosNube;
        }

        if (listaRaw.length > 0) {
            contacts = procesarListaFuncionarios(listaRaw);
            localStorage.setItem('hfc_lan_contacts_directory', JSON.stringify(contacts));
        }
    } catch (error) {
        console.error("Modo Offline: usando respaldo local.", error);
        const cacheLocal = JSON.parse(localStorage.getItem('hfc_lan_contacts_directory') || localStorage.getItem('hfc_lan_contacts_data')) || [];
        contacts = procesarListaFuncionarios(cacheLocal);
    } finally {
        directorioCargado = true;
    }

    function getContactById(id) {
        const strId = String(id);
        return contacts.find(c => String(c.id) === strId) || contactosExternos.find(c => String(c.id) === strId);
    }
    window.getContactById = getContactById;

    function saveFavorites() {
        localStorage.setItem('hfc_lan_favorites', JSON.stringify(favorites));
        renderFavorites();
        renderContacts();
        renderContactosExternos();
    }

    function toggleFavorite(id) {
        const strId = String(id);
        if (favorites.includes(strId)) {
            favorites = favorites.filter(favId => favId !== strId);
        } else {
            favorites.push(strId);
        }
        saveFavorites();
    }

    function renderFavorites() {
        if (!favoritesContainer && !favoritesContainerExternos) return;
        
        if (favoritesContainer) favoritesContainer.innerHTML = "";
        if (favoritesContainerExternos) favoritesContainerExternos.innerHTML = "";

        if (favorites.length === 0) {
            favoritesSidebarBox?.classList.add('hidden');
            favoritesSidebarBoxExternos?.classList.add('hidden');
            return;
        }

        favoritesSidebarBox?.classList.remove('hidden');
        favoritesSidebarBoxExternos?.classList.remove('hidden');

        favorites.forEach(id => {
            const contact = getContactById(id);
            if (!contact) return;
            const name = contact.name?.trim() || contact.location?.trim() || 'Contacto';
            
            const htmlItem = `
                <div class="fav-sidebar-item">
                    <div class="fav-sidebar-info">
                        <span class="fav-sidebar-name">${name}</span>
                        <span class="fav-sidebar-phone"><i class="fas fa-phone"></i> ${contact.phone}</span>
                    </div>
                    <button class="fav-sidebar-remove" title="Quitar de favoritos" data-fav-id="${contact.id}">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
            `;
            if (favoritesContainer) favoritesContainer.insertAdjacentHTML('beforeend', htmlItem);
            if (favoritesContainerExternos) favoritesContainerExternos.insertAdjacentHTML('beforeend', htmlItem);
        });
    }

    function sortContactsList(list, orderType) {
        return [...list].sort((a, b) => {
            const nameA = (a.name || a.location || '').trim();
            const nameB = (b.name || b.location || '').trim();
            if (orderType === 'az') return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
            if (orderType === 'za') return nameB.localeCompare(nameA, 'es', { sensitivity: 'base' });
            if (orderType === 'dept') {
                const deptDiff = (a.department || '').localeCompare(b.department || '', 'es', { sensitivity: 'base' });
                return deptDiff !== 0 ? deptDiff : nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
            }
            if (orderType === 'phone') return (a.phone || '').localeCompare(b.phone || '', 'es', { numeric: true });
            if (orderType === 'location') return (a.location || '').localeCompare(b.location || '', 'es', { sensitivity: 'base' });
            return 0;
        });
    }

    function getUnitColorClass(department) {
        if (!department) return 'unit-bg-default';
        const dept = department.toLowerCase().trim();
        if (dept.includes('urgencia')) return 'unit-bg-urgencias';
        if (dept.includes('hospitalizado')) return 'unit-bg-hospitalizados';
        if (dept.includes('odontolog')) return 'unit-bg-odontologia';
        if (dept.includes('administra') || dept.includes('rrhh')) return 'unit-bg-administracion';
        if (dept.includes('laboratorio')) return 'unit-bg-laboratorio';
        if (dept.includes('some')) return 'unit-bg-some';
        if (dept.includes('bodega')) return 'unit-bg-bodega';
        if (dept.includes('rehabilitac')) return 'unit-bg-rehabilitacion';
        if (dept.includes('ambulatorio')) return 'unit-bg-ambulatorio';
        if (dept.includes('aps')) return 'unit-bg-aps';
        if (dept.includes('tic')) return 'unit-bg-tic';
        if (dept.includes('farmacia')) return 'unit-bg-farmacia';
        return 'unit-bg-default';
    }

    function renderContacts() {
        if (!searchInput) return;
        if (!directorioCargado) return;

        const searchQuery = searchInput.value.toLowerCase().trim();
        const deptFilter = departmentFilter ? departmentFilter.value : "";
        const currentSort = sortOrder ? sortOrder.value : "az";
        
        let filtered = contacts.filter(contact => {
            if (contact.isSharedGroup) {
                const matchesGroup = (contact.name || '').toLowerCase().includes(searchQuery) ||
                                     (contact.phone || '').toLowerCase().includes(searchQuery) ||
                                     contact.miembros.some(m => (m.name || '').toLowerCase().includes(searchQuery));
                const matchesDeptFilter = deptFilter === "" || contact.department === deptFilter;
                return matchesGroup && matchesDeptFilter;
            }

            const matchesName = (contact.name || '').toLowerCase().includes(searchQuery);
            const matchesPhone = (contact.phone || '').toLowerCase().includes(searchQuery);
            const matchesPosition = (contact.position || '').toLowerCase().includes(searchQuery);
            const matchesDept = (contact.department || '').toLowerCase().includes(searchQuery);
            const matchesLocation = (contact.location || '').toLowerCase().includes(searchQuery);
            const matchesEmail = (contact.email || '').toLowerCase().includes(searchQuery);
            const matchesDeptFilter = deptFilter === "" || contact.department === deptFilter;
            
            return (matchesName || matchesPhone || matchesDept || matchesPosition || matchesLocation || matchesEmail) && matchesDeptFilter;
        });

        filtered = sortContactsList(filtered, currentSort);

        if (currentView === 'table') {
            if (tableContainerInternos) {
                tableContainerInternos.classList.remove('hidden');
                tableContainerInternos.style.display = 'block';
            }
            if (cardsContainerInternos) {
                cardsContainerInternos.classList.add('hidden');
                cardsContainerInternos.style.display = 'none';
            }
            if (contactList) contactList.innerHTML = "";

            if (filtered.length === 0) {
                if (contactList) contactList.innerHTML = `<tr><td colspan="${isAdmin ? 7 : 6}" class="table-empty-message">No se encontraron funcionarios o turnos que coincidan con la búsqueda.</td></tr>`;
                return;
            }

            filtered.forEach(contact => {
                const isFav = favorites.includes(String(contact.id));
                const row = document.createElement('tr');
                
                if (contact.isSharedGroup) {
                    const nombresTurno = contact.miembros.map(m => m.name).join(', ');
                    row.innerHTML = `
                        <td class="col-star">
                            <button class="star-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${contact.id}">
                                <i class="fas fa-star"></i>
                            </button>
                        </td>
                        <td>
                            <i class="fa-solid fa-users icon" style="color: #0284c7;"></i><strong>${contact.name}</strong> (Turnantes: ${nombresTurno})
                        </td>
                        <td><i class="fa-solid fa-briefcase icon"></i>Equipo de Turno</td>
                        <td><i class="fa-solid fa-building icon"></i>${contact.department}</td>
                        <td><i class="fa-solid fa-map-marker-alt icon"></i>${contact.location}</td>
                        <td class="text-highlight"><i class="fa-solid fa-phone icon"></i>${contact.phone}</td>
                        ${isAdmin ? '<td></td>' : ''}
                    `;
                } else {
                    row.innerHTML = `
                        <td class="col-star">
                            <button class="star-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${contact.id}">
                                <i class="fas fa-star"></i>
                            </button>
                        </td>
                        <td>
                            <i class="fa-solid fa-user icon"></i>${contact.name?.trim() || '<em>Sin Nombre</em>'}
                            ${contact.email ? `<br><a href="mailto:${contact.email}" class="table-email-link"><i class="far fa-envelope"></i> ${contact.email}</a>` : ''}
                        </td>
                        <td><i class="fa-solid fa-briefcase icon"></i>${contact.position?.trim() || '-'}</td>
                        <td><i class="fa-solid fa-building icon"></i>${contact.department?.trim() || '-'}</td>
                        <td><i class="fa-solid fa-map-marker-alt icon"></i>${contact.location?.trim() || '-'}</td>
                        <td class="text-highlight"><i class="fa-solid fa-phone icon"></i>${contact.phone}</td>
                        ${isAdmin ? `
                            <td>
                                <button class="action-btn-edit" data-edit-id="${contact.id}" title="Editar"><i class="fas fa-edit"></i></button>
                                <button class="action-btn-delete" data-delete-id="${contact.id}" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                            </td>
                        ` : ''}
                    `;
                }
                if (contactList) contactList.appendChild(row);
            });

        } else {
            if (tableContainerInternos) {
                tableContainerInternos.classList.add('hidden');
                tableContainerInternos.style.display = 'none';
            }
            if (cardsContainerInternos) {
                cardsContainerInternos.classList.remove('hidden');
                cardsContainerInternos.style.display = 'grid';
                cardsContainerInternos.innerHTML = "";
            }

            if (filtered.length === 0) {
                if (cardsContainerInternos) {
                    cardsContainerInternos.innerHTML = `
                        <div class="no-results-box">
                            <i class="fas fa-search-minus"></i>
                            <h3>Sin resultados</h3>
                            <p>No se encontraron registros que coincidan con la búsqueda.</p>
                        </div>`;
                }
                return;
            }

            filtered.forEach(contact => {
                const isFav = favorites.includes(String(contact.id));
                const bgUnitClass = getUnitColorClass(contact.department);

                const cardContainer = document.createElement('div');
                cardContainer.className = 'hfcl-card-container';

                if (contact.isSharedGroup) {
                    const miembrosListHtml = contact.miembros.map(m => `
                        <li style="margin-bottom: 6px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
                            <strong style="color: #1e293b; display: block;">${m.name}</strong>
                            <span style="color: #64748b; font-size: 0.52rem;">${m.position}</span>
                        </li>
                    `).join('');

                    cardContainer.innerHTML = `
                        <div class="hfcl-card-inner">
                            <div class="hfcl-card-front">
                                <div>
                                    <div class="hfcl-color-bar">
                                        <div class="hfcl-bar-blue"></div>
                                        <div class="hfcl-bar-red"></div>
                                    </div>
                                    <div class="hfcl-card-header">
                                        <span></span>
                                        <span class="hfcl-badge-ribbon coordinacion" title="Turno Rotativo"><i class="fas fa-users"></i> <span>Turnantes</span></span>
                                        <button class="hfcl-star-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${contact.id}" title="Favorito">
                                            <i class="fas fa-star"></i>
                                        </button>
                                    </div>
                                    <div class="hfcl-modern-avatar-container">
                                        <div class="hfcl-modern-avatar ${bgUnitClass}">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="hfcl-info-front">
                                        <h3 class="hfcl-func-name">${contact.name}</h3>
                                        <span class="hfcl-func-role">Rotación de Turnos</span>
                                        <br>
                                        <span class="hfcl-func-unit">${contact.department}</span>
                                    </div>
                                </div>
                                <div class="hfcl-flip-hint">
                                    <span>+ Ver Turnantes</span>
                                </div>
                                <div class="hfcl-contact-footer">
                                    <span class="hfcl-anexo-badge"><i class="fa-solid fa-phone"></i> Anexo ${contact.phone}</span>
                                </div>
                            </div>

                            <div class="hfcl-card-back">
                                <div class="hfcl-color-bar">
                                    <div class="hfcl-bar-blue"></div>
                                    <div class="hfcl-bar-red"></div>
                                </div>

                                <div class="hfcl-back-body" style="overflow-y: auto; max-height: 220px;">
                                    <div>
                                        <h4 class="hfcl-back-heading"><i class="fas fa-user-clock"></i> Funcionarios en Turno</h4>
                                        <ul class="hfcl-details-list" style="max-height: 140px; overflow-y: auto;">
                                            ${miembrosListHtml}
                                        </ul>
                                    </div>

                                    <div class="hfcl-back-actions">
                                        <button type="button" class="btn-flip-back" title="Volver al frente">
                                            <i class="fas fa-undo"></i> Volver
                                        </button>
                                        <button type="button" class="btn-report-error" data-report-id="${contact.id}" title="Reportar dato incorrecto">
                                            <i class="fas fa-exclamation-triangle"></i> Reportar
                                        </button>
                                    </div>
                                </div>

                                <div class="hfcl-color-bar">
                                    <div class="hfcl-bar-blue"></div>
                                    <div class="hfcl-bar-red"></div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    const insigniaHtml = contact.insignia ? `
                        <div class="hfcl-badge-ribbon ${contact.insignia.tipo}" title="${contact.insignia.texto}">
                            <i class="fas ${contact.insignia.icon}"></i> <span>${contact.insignia.texto}</span>
                        </div>
                    ` : '';

                    cardContainer.innerHTML = `
                        <div class="hfcl-card-inner">
                            <div class="hfcl-card-front">
                                <div>
                                    <div class="hfcl-color-bar">
                                        <div class="hfcl-bar-blue"></div>
                                        <div class="hfcl-bar-red"></div>
                                    </div>
                                    <div class="hfcl-card-header">
                                        <span></span>
                                        ${insigniaHtml}
                                        <button class="hfcl-star-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${contact.id}" title="Favorito">
                                            <i class="fas fa-star"></i>
                                        </button>
                                    </div>
                                    <div class="hfcl-modern-avatar-container">
                                        <div class="hfcl-modern-avatar ${bgUnitClass}">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="hfcl-info-front">
                                        <h3 class="hfcl-func-name">${contact.name || 'Sin Nombre'}</h3>
                                        <span class="hfcl-func-role">${contact.position || 'Funcionario'}</span>
                                        <br>
                                        <span class="hfcl-func-unit">${contact.department || contact.location || 'Sin Unidad'}</span>
                                    </div>
                                </div>
                                <div class="hfcl-flip-hint">
                                    <span>+ Más información</span>
                                </div>
                                <div class="hfcl-contact-footer">
                                    <span class="hfcl-anexo-badge"><i class="fa-solid fa-phone"></i> Anexo ${contact.phone}</span>
                                </div>
                            </div>

                            <div class="hfcl-card-back">
                                <div class="hfcl-color-bar">
                                    <div class="hfcl-bar-blue"></div>
                                    <div class="hfcl-bar-red"></div>
                                </div>

                                <div class="hfcl-back-body">
                                    <div>
                                        <h4 class="hfcl-back-heading"><i class="fas fa-id-card"></i> Detalles</h4>
                                        <div class="hfcl-details-block">
                                            <ul class="hfcl-details-list">
                                                <div class="hfcl-data-group">
                                                    <span class="hfcl-data-label">UBICACIÓN</span>
                                                    <span class="hfcl-data-value">${contact.location || 'No especificada'}</span>
                                                </div>

                                                <div class="hfcl-data-group">
                                                    <span class="hfcl-data-label">ANEXO</span>
                                                    <span class="hfcl-data-value">${contact.phone}</span>
                                                </div>

                                                <div class="hfcl-data-group">
                                                    <span class="hfcl-data-label">HORARIO</span>
                                                    <span class="hfcl-data-value">${contact.schedule || '08:00 - 17:00'}</span>
                                                </div>

                                                ${contact.email ? `
                                                <div class="hfcl-data-group">
                                                    <span class="hfcl-data-label">CORREO</span>
                                                    <span class="hfcl-data-value">${contact.email}</span>
                                                </div>` : ''}
                                            </ul>
                                        </div>
                                    </div>

                                    <div class="hfcl-back-actions">
                                        <button type="button" class="btn-flip-back" title="Volver al frente">
                                            <i class="fas fa-undo"></i> Volver
                                        </button>
                                        <button type="button" class="btn-report-error" data-report-id="${contact.id}" title="Reportar dato incorrecto">
                                            <i class="fas fa-exclamation-triangle"></i> Reportar
                                        </button>
                                    </div>

                                    <div class="hfcl-legal-wrapper">
                                        <div class="hfcl-legal-info">
                                            Hospital Familiar y Comunitario de Lanco<br>
                                            Santiago 595, Lanco
                                        </div>
                                    </div>
                                </div>

                                <div class="hfcl-color-bar">
                                    <div class="hfcl-bar-blue"></div>
                                    <div class="hfcl-bar-red"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                cardContainer.addEventListener('click', (e) => {
                    const flipBtn = e.target.closest('.hfcl-flip-hint');
                    const flipBackBtn = e.target.closest('.btn-flip-back');
                    const starBtn = e.target.closest('.hfcl-star-btn');
                    const reportBtn = e.target.closest('.btn-report-error');

                    if (reportBtn) {
                        e.stopPropagation();
                        window.openReportModal(reportBtn.getAttribute('data-report-id'));
                        return;
                    }

                    if (starBtn) {
                        e.stopPropagation();
                        toggleFavorite(starBtn.getAttribute('data-fav-id'));
                        return;
                    }

                    if (flipBtn || flipBackBtn) {
                        e.stopPropagation();
                        cardContainer.classList.toggle('flipped');
                    }
                });

                if (cardsContainerInternos) cardsContainerInternos.appendChild(cardContainer);
            });
        }
    }

    function renderContactosExternos() {
        if (!searchInputExternos) return;
        const searchQuery = searchInputExternos.value.toLowerCase().trim();
        const currentSort = sortOrderExternos ? sortOrderExternos.value : "az";
        let filtered = contactosExternos.filter(contact => {
            return (
                (contact.name || '').toLowerCase().includes(searchQuery) ||
                (contact.location || '').toLowerCase().includes(searchQuery) ||
                (contact.phone || '').toLowerCase().includes(searchQuery)
            );
        });
        filtered = sortContactsList(filtered, currentSort);

        if (currentView === 'table') {
            if (tableContainerExternos) {
                tableContainerExternos.classList.remove('hidden');
                tableContainerExternos.style.display = 'block';
            }
            if (cardsContainerExternos) {
                cardsContainerExternos.classList.add('hidden');
                cardsContainerExternos.style.display = 'none';
            }
            if (contactListExternos) contactListExternos.innerHTML = "";

            filtered.forEach(contact => {
                const isFav = favorites.includes(String(contact.id));
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="col-star">
                        <button class="star-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${contact.id}">
                            <i class="fas fa-star"></i>
                        </button>
                    </td>
                    <td><i class="fa-solid fa-user icon"></i>${contact.name}</td>
                    <td><i class="fa-solid fa-map-marker-alt icon"></i>${contact.location}</td>
                    <td class="text-highlight-ext"><i class="fa-solid fa-phone icon"></i>${contact.phone}</td>
                    ${isAdmin ? `
                        <td>
                            <button class="action-btn-edit" data-edit-id="${contact.id}"><i class="fas fa-edit"></i></button>
                            <button class="action-btn-delete" data-delete-id="${contact.id}"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    ` : ''}
                `;
                if (contactListExternos) contactListExternos.appendChild(row);
            });
        } else {
            if (tableContainerExternos) {
                tableContainerExternos.classList.add('hidden');
                tableContainerExternos.style.display = 'none';
            }
            if (cardsContainerExternos) {
                cardsContainerExternos.classList.remove('hidden');
                cardsContainerExternos.style.display = 'grid';
                cardsContainerExternos.innerHTML = "";
            }

            filtered.forEach(contact => {
                const isFav = favorites.includes(String(contact.id));
                const flipWrapper = document.createElement('div');
                flipWrapper.className = 'card-flip-container';
                flipWrapper.innerHTML = `
                    <div class="contact-card-inner">
                        <div class="card-front">
                            <div class="card-header-block">
                                <div class="card-top">
                                    <span class="card-title">${contact.name}</span>
                                    <button class="star-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${contact.id}"><i class="fas fa-star"></i></button>
                                </div>
                                <span class="flip-hint"><i class="fa-solid fa-sync"></i> Ver detalles</span>
                            </div>
                            <div class="card-footer">
                                <div class="card-phone-wrapper"><i class="fa-solid fa-phone"></i><span>${contact.phone}</span></div>
                            </div>
                        </div>
                        <div class="card-back">
                            <div class="card-back-header">
                                <span class="card-back-title">Información Externa</span>
                                <button class="btn-flip-back"><i class="fa-solid fa-undo"></i> Volver</button>
                            </div>
                            <div class="card-back-body">
                                <div class="card-info-item"><i class="fa-solid fa-map-marker-alt icon"></i><span><strong>Ubicación:</strong> ${contact.location}</span></div>
                            </div>
                            <div class="card-footer">
                                <div class="card-phone-wrapper"><i class="fa-solid fa-phone"></i><span>${contact.phone}</span></div>
                            </div>
                        </div>
                    </div>
                `;

                flipWrapper.addEventListener('click', (e) => {
                    const btnVerDetalles = e.target.closest('.flip-hint');
                    const btnVolver = e.target.closest('.btn-flip-back');
                    const starBtn = e.target.closest('.star-btn');

                    if (starBtn) {
                        e.stopPropagation();
                        toggleFavorite(starBtn.getAttribute('data-fav-id'));
                        return;
                    }

                    if (btnVerDetalles || btnVolver) {
                        e.stopPropagation();
                        flipWrapper.classList.toggle('flipped');
                    }
                });

                if (cardsContainerExternos) cardsContainerExternos.appendChild(flipWrapper);
            });
        }
    }

    document.addEventListener('click', (e) => {
        const reportBtn = e.target.closest('.btn-report-error');
        if (reportBtn) {
            e.stopPropagation();
            window.openReportModal(reportBtn.getAttribute('data-report-id'));
            return;
        }

        const favBtn = e.target.closest('[data-fav-id]');
        if (favBtn) {
            e.stopPropagation();
            toggleFavorite(favBtn.getAttribute('data-fav-id'));
            return;
        }

        const favRemoveBtn = e.target.closest('.fav-sidebar-remove');
        if (favRemoveBtn) {
            e.stopPropagation();
            toggleFavorite(favRemoveBtn.getAttribute('data-fav-id'));
            return;
        }
    });

    if (searchInput) searchInput.addEventListener('input', renderContacts);
    if (departmentFilter) departmentFilter.addEventListener('change', renderContacts);
    if (sortOrder) sortOrder.addEventListener('change', renderContacts);

    if (searchInputExternos) searchInputExternos.addEventListener('input', renderContactosExternos);
    if (sortOrderExternos) sortOrderExternos.addEventListener('change', renderContactosExternos);

    if (clearSearch) clearSearch.addEventListener('click', () => { searchInput.value = ''; renderContacts(); });
    if (clearSearchExternos) clearSearchExternos.addEventListener('click', () => { searchInputExternos.value = ''; renderContactosExternos(); });

    if (btnViewTable) {
        btnViewTable.addEventListener('click', () => {
            currentView = 'table';
            btnViewTable.classList.add('active');
            btnViewCards?.classList.remove('active');
            renderContacts();
            renderContactosExternos();
        });
    }

    if (btnViewCards) {
        btnViewCards.addEventListener('click', () => {
            currentView = 'cards';
            btnViewCards.classList.add('active');
            btnViewTable?.classList.remove('active');
            renderContacts();
            renderContactosExternos();
        });
    }

    if (btnEmergencias && modalEmergencias) {
        btnEmergencias.addEventListener('click', () => modalEmergencias.classList.remove('hidden'));
    }
    if (closeModalBtn && modalEmergencias) {
        closeModalBtn.addEventListener('click', () => modalEmergencias.classList.add('hidden'));
    }

    // --- FUNCIÓN DE CIERRE Y RESETEO DE MODAL DE REPORTE ---
    function cerrarModalReporte() {
        const modal = document.getElementById('modalReporteError');
        const form = document.getElementById('reporteErrorForm');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        if (form) {
            form.reset();
        }
    }

    document.getElementById('btnCloseReporteModal')?.addEventListener('click', cerrarModalReporte);
    document.getElementById('btnCancelReporte')?.addEventListener('click', cerrarModalReporte);

    document.getElementById('reporteErrorForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        }

        const payload = {
            action: "reportar_error",
            reporte: {
                contactoId: document.getElementById('reporteContactId').value,
                nombreFuncionario: document.getElementById('reporteContactName').value,
                anexoActual: document.getElementById('reporteContactPhone').value,
                unidad: document.getElementById('reporteContactUnit').value,
                tipoError: document.getElementById('reporteTipoError').value,
                comentario: document.getElementById('reporteComentario').value.trim(),
                nombreReportante: document.getElementById('reporteNombreReportante').value.trim()
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
                alert("¡Reporte enviado con éxito! El equipo de soporte lo revisará.");
                cerrarModalReporte();
                return;
            }

            if (res.status === "success") {
                alert("¡Reporte enviado con éxito! El equipo de soporte lo revisará.");
                cerrarModalReporte();
            } else {
                alert("Error del servidor: " + (res.message || "Desconocido"));
            }

        } catch (err) {
            console.error("Error de red:", err);
            alert("Error de conexión. Intente nuevamente.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar Reporte';
            }
        }
    });

    window.mostrarSeccion = function(seccion) {
        currentSection = seccion;
        const internosSection = document.getElementById('internosSection');
        const externosSection = document.getElementById('externosSection');
        if (seccion === 'internos') {
            internosSection?.classList.remove('hidden');
            externosSection?.classList.add('hidden');
            renderContacts();
        } else {
            internosSection?.classList.add('hidden');
            externosSection?.classList.remove('hidden');
            renderContactosExternos();
        }
    };

    updateDepartmentOptions(contacts);
    renderFavorites();
    renderContacts();
    renderContactosExternos();
});