// assets/js/eventos-scn.js
class EventosSCN {
    constructor() {
        this.baseUrl = 'https://www.nefro.cl/web/';
    }

    async cargarEventos() {
        const contenedor = document.querySelector('.events-list');
        if (!contenedor) return;

        const mesActual = new Date().getMonth() + new Date().getFullYear() * 12;

        // Primero verificar el cache global del repositorio
        try {
            const cacheResponse = await fetch('./assets/data/eventos-cache.json');
            if (cacheResponse.ok) {
                const cache = await cacheResponse.json();
                if (cache.mes === mesActual && cache.eventos.length > 0) {
                    this.renderizarEventos(cache.eventos, contenedor);
                    return;
                }
            }
        } catch (error) {
            console.log('Cache global no disponible, continuando con scraping');
        }

        // Mostrar loading
        contenedor.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Cargando eventos...</div>';

        try {
            const response = await fetch('https://www.nefro.cl/web/eventos_webinar.php', {
                mode: 'cors'
            });
            
            if (response.ok) {
                const html = await response.text();
                const eventos = this.extraerEventos(html);
                
                // Intentar actualizar el cache global (solo funcionará en desarrollo)
                this.actualizarCacheGlobal(mesActual, eventos);
                
                this.renderizarEventos(eventos, contenedor);
            } else {
                this.mostrarError(contenedor);
            }
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            this.mostrarError(contenedor);
        }
    }

    async actualizarCacheGlobal(mes, eventos) {
        // Esta función solo funcionará en un entorno donde se pueda escribir archivos
        // En GitHub Pages será de solo lectura, pero el concepto queda para desarrollo
        console.log('Cache actualizado para el mes:', mes, 'con', eventos.length, 'eventos');
        
        // En un entorno de desarrollo, aquí se podría usar una API para actualizar el archivo
        // Por ahora solo registramos en consola para debugging
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
            
            if (!titulo || titulo.length < 5) return;
            
            // Obtener información del contenedor padre
            const contenedorTexto = enlace.parentElement ? enlace.parentElement.textContent : '';
            
            // Extraer cualquier texto que parezca una fecha
            const fechaMatch = contenedorTexto.match(/\d{1,2}\s+de\s+\w+\s+de\s+\d{4}|\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}/i);
            const fechaTexto = fechaMatch ? fechaMatch[0] : 'Fecha por confirmar';
            
            eventos.push({
                titulo: titulo,
                fecha: fechaTexto,
                url: href.startsWith('http') ? href : this.baseUrl + href,
                descripcion: 'Evento de la Sociedad Chilena de Nefrología'
            });
        });

        return eventos.slice(0, 10); // Máximo 10 eventos
    }


    renderizarEventos(eventos, contenedor) {
        if (eventos.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>No hay eventos disponibles de la Sociedad Chilena de Nefrología.</p>
                    <p><a href="https://www.nefro.cl/web/eventos_webinar.php" target="_blank" class="btn">Ver todos los eventos en SCN <i class="fas fa-external-link-alt"></i></a></p>
                </div>
            `;
            return;
        }

        let html = '';
        eventos.forEach(evento => {
            html += `
                <div class="event-item">
                    <div class="event-details">
                        <h3>${evento.titulo}</h3>
                        <p>${evento.descripcion}</p>
                        <p class="event-meta">
                            <i class="fas fa-calendar"></i> ${evento.fecha}
                            <br>
                            <i class="fas fa-external-link-alt"></i> 
                            <a href="${evento.url}" target="_blank" rel="noopener">Ver detalles en SCN</a>
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