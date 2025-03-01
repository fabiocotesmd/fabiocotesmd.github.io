// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Función para manejar el ícono del chatbot (para implementación futura)
    const chatbotIcon = document.querySelector('.chatbot-icon');
    
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', function() {
            // Por ahora solo muestra un mensaje, esto se expandirá en el futuro
            alert('Función de chat disponible próximamente');
            
            // Aquí se implementará la apertura del chatbot en una fase posterior
        });
    }
    
    // Detectar la página actual para la navegación activa
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        
        if (currentPage === linkPage || 
            (currentPage === '' && linkPage === 'index.html') || 
            (currentPage === '/' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Animación suave al hacer scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Función para animar elementos al hacer scroll
    function revealOnScroll() {
        const elements = document.querySelectorAll('.card, .about-content');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
    }
    
    // Ejecutar la función al cargar la página y al hacer scroll
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
    
    // Añadir clase 'visible' a los elementos que deben animarse
    document.querySelectorAll('.card, .about-content').forEach(el => {
        el.classList.add('fade-in');
    });
});

// Añadir esta clase en el CSS para la animación
document.head.insertAdjacentHTML('beforeend', `
<style>
.fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}
</style>
`);
