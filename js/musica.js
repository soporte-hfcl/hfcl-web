document.addEventListener("DOMContentLoaded", () => {
    const playlistHospital = [
        { id: 1, titulo: "Melodía de Oficina Suave", subtitulo: "Acústico Local", categoria: "Administrativos", archivo: "audio/oficina_suave.mp3", icono: "fa-headphones" },
        { id: 2, titulo: "Ritmo de Trabajo Administrativo", subtitulo: "Lofi Beats HFC", categoria: "Administrativos", archivo: "audio/lofi_admin.mp3", icono: "fa-laptop" },
        { id: 3, titulo: "Concentración Hospitalaria", subtitulo: "Ambient Chill", categoria: "Administrativos", archivo: "audio/ambient_chill.mp3", icono: "fa-brain" },
        { id: 4, titulo: "Turno Nocturno en Urgencias", subtitulo: "Ambient Nocturno", categoria: "Urgencias", archivo: "audio/turno_urgencias.mp3", icono: "fa-moon" },
        { id: 5, titulo: "Pausa Activa Kinesiología", subtitulo: "Dinámico y Suave", categoria: "Kinesiologia", archivo: "audio/pausa_activa.mp3", icono: "fa-heart-pulse" },
        { id: 6, titulo: "Recuperación y Sala Cuna", subtitulo: "Melodías Pediátricas", categoria: "Pediatria", archivo: "audio/sala_cuna.mp3", icono: "fa-child" },
        { id: 7, titulo: "Gestión de Stock y Bodega", subtitulo: "Ritmo Constante TIC", categoria: "Farmacia", archivo: "audio/bodega_tic.mp3", icono: "fa-boxes-stacked" },
        { id: 8, titulo: "Enfoque de Pabellón", subtitulo: "Instrumental Quirúrgico", categoria: "Quirofano", archivo: "audio/pabellon.mp3", icono: "fa-hospital" }
    ];

    let audioElement = new Audio();
    let pistaActualIndex = -1;

    // Crear la barra inferior estática integrada antes del footer
    const playerBar = document.createElement("div");
    playerBar.style.cssText = "width: 100%; background: var(--primary-dark); color: white; padding: 12px 25px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); box-shadow: 0 -4px 10px rgba(0,0,0,0.2); margin-top: 20px;";
    playerBar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fa-solid fa-compact-disc" id="playerIcon" style="font-size: 1.5rem; color: var(--accent-color);"></i>
            <div>
                <h4 id="nowPlayingTitle" style="font-size: 0.85rem; margin: 0;">Selecciona una pista</h4>
                <p id="nowPlayingSub" style="font-size: 0.72rem; color: #94a3b8; margin: 0;">Red Interna TIC - Hospital de Lanco</p>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
            <button id="btnPlayPause" style="background: var(--accent-color); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-play"></i></button>
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-volume-high" style="font-size: 0.8rem; color: #94a3b8;"></i>
                <input type="range" id="volRange" min="0" max="1" step="0.05" value="0.8" style="width: 80px; accent-color: var(--accent-color); cursor: pointer;">
                <button id="btnMute" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; cursor: pointer;" title="Modo Discreto">Modo Discreto</button>
            </div>
        </div>
    `;
    
    const footer = document.querySelector(".web-footer");
    if (footer) {
        footer.parentNode.insertBefore(playerBar, footer);
    } else {
        document.body.appendChild(playerBar);
    }

    const gridContainer = document.querySelector(".news-grid-featured");
    const titleElem = document.getElementById("nowPlayingTitle");
    const subElem = document.getElementById("nowPlayingSub");
    const playPauseBtn = document.getElementById("btnPlayPause");
    const playerIcon = document.getElementById("playerIcon");
    const volRange = document.getElementById("volRange");
    const btnMute = document.getElementById("btnMute");

    function renderizarBiblioteca(filtro = "Todas") {
        if (!gridContainer) return;
        gridContainer.innerHTML = "";

        const tracksFiltrados = filtro === "Todas" 
            ? playlistHospital 
            : playlistHospital.filter(t => t.categoria === filtro);

        tracksFiltrados.forEach((track) => {
            // Buscamos su índice real en el arreglo principal
            const indexReal = playlistHospital.findIndex(item => item.id === track.id);
            const esActiva = indexReal === pistaActualIndex;

            const card = document.createElement("div");
            card.className = "news-card";
            
            // Indicador visual de tarjeta activa (borde acentuado y fondo sutil)
            if (esActiva) {
                card.style.borderColor = "var(--accent-color)";
                card.style.boxShadow = "0 0 0 2px var(--accent-color)";
            }

            card.innerHTML = `
                <div style="height: 100px; background: linear-gradient(135deg, var(--primary-dark), var(--primary-hospital)); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; position: relative;">
                    <i class="fa-solid ${track.icono} ${esActiva ? 'fa-beat' : ''}"></i>
                    ${esActiva ? '<span style="position: absolute; top: 8px; right: 8px; background: var(--accent-color); font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 700;">EN REPRODUCCIÓN</span>' : ''}
                </div>
                <div style="padding: 14px;">
                    <h3>${track.titulo}</h3>
                    <p>${track.subtitulo}</p>
                </div>
            `;

            card.addEventListener("click", () => cargarYReproducir(indexReal, filtro));
            gridContainer.appendChild(card);
        });
    }

    function cargarYReproducir(index, filtroActual = "Todas") {
        pistaActualIndex = index;
        const track = playlistHospital[index];
        
        audioElement.src = track.archivo;
        audioElement.play().then(() => {
            titleElem.textContent = track.titulo;
            subElem.textContent = track.subtitulo;
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            playerIcon.classList.add("fa-spin");
        }).catch(() => {
            // Modo simulación si el archivo físico local aún no está colocado en la carpeta
            titleElem.textContent = track.titulo;
            subElem.textContent = "Simulación (Falta archivo físico local)";
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            playerIcon.classList.add("fa-spin");
        });

        // Volver a renderizar para actualizar el indicador visual en la tarjeta correcta
        renderizarBiblioteca(filtroActual);
    }

    playPauseBtn.addEventListener("click", () => {
        if (pistaActualIndex === -1 && playlistHospital.length > 0) {
            cargarYReproducir(0);
            return;
        }
        if (audioElement.paused) {
            audioElement.play();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            playerIcon.classList.add("fa-spin");
        } else {
            audioElement.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playerIcon.classList.remove("fa-spin");
        }
    });

    volRange.addEventListener("input", (e) => {
        audioElement.volume = e.target.value;
    });

    let volumenAnterior = 0.8;
    btnMute.addEventListener("click", () => {
        if (audioElement.volume > 0.1) {
            volumenAnterior = audioElement.volume;
            audioElement.volume = 0.1;
            volRange.value = 0.1;
            btnMute.style.background = "var(--accent-color)";
            btnMute.textContent = "Restaurar";
        } else {
            audioElement.volume = volumenAnterior;
            volRange.value = volumenAnterior;
            btnMute.style.background = "rgba(255,255,255,0.1)";
            btnMute.textContent = "Modo Discreto";
        }
    });

    // Permitir filtrado desde los enlaces laterales si se desea
    window.filtrarPlaylist = function(categoria) {
        renderizarBiblioteca(categoria);
    };

    // Inicializar vista general
    renderizarBiblioteca("Todas");
});