document.addEventListener("DOMContentLoaded", function() {
    // Detecta automáticamente si estamos en una subcarpeta y ajusta la ruta base
    const estaEnSubcarpeta = window.location.pathname.includes('/pages/');
    const rutaBase = estaEnSubcarpeta ? "../" : "";

    const footerHTML = `
    <style>
        .web-footer { 
            background-color: #0f172a; 
            color: #94a3b8; 
            padding: 25px 24px; 
            border-top: 1px solid #334155; 
            margin-top: auto; 
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        .footer-container { 
            max-width: 1700px; 
            margin: 0 auto; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            flex-wrap: wrap; 
            gap: 20px; 
        }
        .brand-footer { 
            display: flex; 
            align-items: center; 
            gap: 16px; 
        }
        .brand-footer h4 {
            margin: 0 0 2px 0;
            font-size: 0.95rem;
            color: #f8fafc;
            font-weight: 700;
        }
        .brand-footer p {
            margin: 0;
            font-size: 0.8rem;
            color: #cbd5e1;
        }
        .footer-accred-img { 
            max-height: 50px; 
            width: auto; 
            filter: brightness(1.1); 
        }
        .footer-accred-text { 
            font-size: 0.72rem; 
            color: #4ade80; 
            font-weight: 600; 
            display: block; 
            margin-top: 3px; 
        }
        .footer-social {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        .footer-social a {
            color: #cbd5e1;
            font-size: 1.1rem;
            transition: color 0.2s;
            text-decoration: none;
        }
        .footer-social a:hover {
            color: #38bdf8;
        }
        .text-right { 
            text-align: right; 
        }
        .text-right p {
            margin: 0;
            font-size: 0.82rem;
            color: #cbd5e1;
        }
        .text-right strong {
            color: #f8fafc;
        }
        .sub-footer { 
            font-size: 0.7rem; 
            color: #64748b; 
            margin-top: 2px; 
        }

        @media (max-width: 900px) {
            .footer-container {
                flex-direction: column;
                text-align: center;
                gap: 15px;
            }
            .brand-footer {
                flex-direction: column;
                text-align: center;
            }
            .text-right {
                text-align: center;
            }
        }
    </style>
    <footer class="web-footer">
        <div class="footer-container">
            <div class="brand-footer">
                <img src="${rutaBase}assets/img/logo_sslr.jpeg" alt="SSLR" style="max-height: 45px; width: auto; border-radius: 4px;">
                <img src="${rutaBase}assets/img/logo_hfcl.png" alt="HFCL" style="max-height: 45px; width: auto;">
                <img src="${rutaBase}assets/img/logo_acreditacion.png" alt="Sello Acreditacion" class="footer-accred-img">
                <div>
                    <h4>Hospital Familiar y Comunitario de Lanco</h4>
                    <p>Servicio de Salud Los Ríos • Ministerio de Salud</p>
                    <span class="footer-accred-text"><i class="fas fa-shield-alt"></i> Establecimiento Acreditado en Calidad</span>
                </div>
            </div>

            <!-- Redes Oficiales en el Footer -->
            <div class="footer-social">
                <span style="font-size: 0.85rem; color: #94a3b8; margin-right: 5px;"><i class="fas fa-globe"></i> Síguenos:</span>
                <a href="https://www.facebook.com/hfc.lanco" target="_blank" title="Facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="https://linkedin.com" target="_blank" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                <a href="https://whatsapp.com/channel/0029Va6exvMHrDZbkysZms3t" target="_blank" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                <a href="https://www.instagram.com/hfc.lanco" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>
            </div>

            <div class="text-right">
                <p>Sistema autogestionado por:<br>
                <strong>José Paineñanco Durán</strong>, Informático</p>
                <p class="sub-footer">Unidad TIC • Todos los derechos reservados © 2026</p>
            </div>
        </div>
    </footer>
    `;

    let footerContainer = document.getElementById('app-footer');
    if (!footerContainer) {
        footerContainer = document.createElement('div');
        footerContainer.id = 'app-footer';
        document.body.appendChild(footerContainer);
    }
    footerContainer.innerHTML = footerHTML;
});