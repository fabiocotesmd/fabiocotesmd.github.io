// Script específico para la funcionalidad de FAQ
document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidad para las preguntas frecuentes
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');
        
        // Ocultar todas las respuestas al inicio
        answer.style.display = 'none';
        
        question.addEventListener('click', () => {
            // Mostrar u ocultar la respuesta
            if (answer.style.display === 'none') {
                answer.style.display = 'block';
                toggle.innerHTML = '<i class="fas fa-minus"></i>';
            } else {
                answer.style.display = 'none';
                toggle.innerHTML = '<i class="fas fa-plus"></i>';
            }
        });
    });
});
