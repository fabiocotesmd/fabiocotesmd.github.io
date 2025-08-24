// assets/js/eventos-scn.js
class EventosSCN {
    constructor() {
        this.baseUrl = 'https://www.nefro.cl/web/';
    }

    async cargarEventos() {
        const contenedor = document.querySelector('.events-list');
        if (!contenedor) return;

        // Mostrar loading
        contenedor.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Cargando eventos...</div>';

        try {
            // Usar proxy CORS gratuito
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const targetUrl = encodeURIComponent('https://www.nefro.cl/web/eventos_webinar.php');
            
            const response = await fetch(proxyUrl + targetUrl);
            const data = await response.json();
            
            if (data.contents) {
                const eventos = this.extraerEventos(data.contents);
                this.renderizarEventos(eventos, contenedor);
            } else {
                this.mostrarError(contenedor);
            }
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            this.mostrarError(contenedor);
        }
    }

    extraerEventos(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const eventos = [];

        // Buscar todos los enlaces a eventos
        const enlaces = doc.querySelectorAll('a[href*="evento.php"]');
        
        enlaces.forEach(enlace => {
            const href = enlace.getAttribute('href');
            const titulo = enlace.textContent.trim();
            
            if (!titulo || titulo.length < 5) return; // Filtrar enlaces vacíos
            
            // Obtener el texto del contenedor padre para extraer fechas
            let contenedorTexto = enlace.parentElement.textContent;
            
            // Buscar diferentes patrones de fecha
            const patronesFecha = [
                /Del (\d+) de (\w+) al \d+ de (\w+) de (\d+)/i,
                /(\d+) de (\w+) de (\d+)/i
            ];

            let fechaInfo = null;
            for (const patron of patronesFecha) {
                const match = contenedorTexto.match(patron);
                if (match) {
                    if (match[1] && match[2] && match[4]) {
                        // Patrón "Del X de Mes al Y de Mes de Año"
                        fechaInfo = {
                            dia: match[1],
                            mes: match[2],
                            año: match[4]
                        };
                    } else if (match[1] && match[2] && match[3]) {
                        // Patrón "X de Mes de Año"
                        fechaInfo = {
                            dia: match[1],
                            mes: match[2],
                            año: match[3]
                        };
                    }
                    break;
                }
            }

            if (fechaInfo && this.esFechaValida(fechaInfo)) {
                eventos.push({
                    titulo: titulo,
                    dia: fechaInfo.dia,
                    mes: this.convertirMes(fechaInfo.mes),
                    año: fechaInfo.año,
                    url: this.baseUrl + href,
                    fechaCompleta: new Date(parseInt(fechaInfo.año), this.mesANumero(fechaInfo.mes), parseInt(fechaInfo.dia))
                });
            }
        });

        // Ordenar por fecha y filtrar solo eventos futuros o recientes
        const hoy = new Date();
        const hace30Dias = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        return eventos
            .filter(evento => evento.fechaCompleta >= hace30Dias)
            .sort((a, b) => a.fechaCompleta - b.fechaCompleta)
            .slice(0, 5); // Máximo 5 eventos
    }

    esFechaValida(fechaInfo) {
        const año = parseInt(fechaInfo.año);
        const añoActual = new Date().getFullYear();
        
        // Validar que el año sea razonable (actual o próximo)
        return año >= añoActual && año <= añoActual + 2;
    }

    convertirMes(mesEspanol) {
        const meses = {
            'enero': 'Ene', 'febrero': 'Feb', 'marzo': 'Mar',
            'abril': 'Abr', 'mayo': 'May', 'junio': 'Jun',
            'julio': 'Jul', 'agosto': 'Ago', 'septiembre': 'Sep',
            'octubre': 'Oct', 'noviembre': 'Nov', 'diciembre': 'Dic'
        };
        return meses[mesEspanol.toLowerCase()] || mesEspanol.substr(0, 3);
    }

    mesANumero(mes) {
        const meses = {
            'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
            'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
        };
        return meses[mes.toLowerCase()] || 0;
    }

    renderizarEventos(eventos, contenedor) {
        if (eventos.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>No hay eventos próximos disponibles de la Sociedad Chilena de Nefrología.</p>
                    <p><a href="https://www.nefro.cl/web/eventos_webinar.php" target="_blank" class="btn">Ver todos los eventos en SCN <i class="fas fa-external-link-alt"></i></a></p>
                </div>
            `;
            return;
        }

        let html = '';
        eventos.forEach(evento => {
            html += `
                <div class="event-item">
                    <div class="event-date">
                        <span class="month">${evento.mes}</span>
                        <span class="day">${evento.dia}</span>
                    </div>
                    <div class="event-details">
                        <h3>${evento.titulo}</h3>
                        <p>Evento organizado por la Sociedad Chilena de Nefrología</p>
                        <p class="event-meta">
                            <i class="fas fa-external-link-alt"></i> 
                            <a href="${evento.url}" target="_blank" rel="noopener">Ver detalles en SCN</a>
                            <span style="margin-left: 1rem; color: #666; font-size: 0.9em;">
                                <i class="fas fa-calendar"></i> ${evento.dia} de ${evento.mes} ${evento.año}
                            </span>
                        </p>
                    </div>
                </div>
            `;
        });

        // Agregar enlace para ver más eventos
        html += `
            <div style="text-align: center; margin-top: 2rem;">
                <a href="https://www.nefro.cl/web/eventos_webinar.php" target="_blank" class="btn">
                    <i class="fas fa-calendar-plus"></i> Ver todos los eventos en SCN
                </a>
            </div>
        `;

        contenedor.innerHTML = html;
    }

    mostrarError(contenedor) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="color: #f39c12; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No se pudieron cargar los eventos de la Sociedad Chilena de Nefrología en este momento.</p>
                <p>Puedes visitarlos directamente:</p>
                <a href="https://www.nefro.cl/web/eventos_webinar.php" target="_blank" class="btn">
                    <i class="fas fa-external-link-alt"></i> Ver eventos en SCN
                </a>
            </div>
        `;
    }
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
    // Solo ejecutar en la página de colegas
    if (window.location.pathname.includes('colegas')) {
        const eventosSCN = new EventosSCN();
        eventosSCN.cargarEventos();
    }
});