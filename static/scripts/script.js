// FEED - Versión mejorada con mejor gestión de eventos
document.addEventListener('DOMContentLoaded', () => {
    const expandedCard = document.getElementById('expanded-card');
    const closeExpanded = document.getElementById('close-expanded');
    let expandedView = false;

    let card = document.getElementById('project-card');
    const statusIndicators = document.getElementById('status-indicators');
    const likeIndicator = statusIndicators.querySelector('.like-indicator');
    const dislikeIndicator = statusIndicators.querySelector('.dislike-indicator');
    const ampliarIndicator = statusIndicators.querySelector('.ampliar-indicator');
    const sidebar = document.getElementById('sidebar');
    const sidebarTrigger = document.getElementById('sidebar-trigger');
    
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let isHoveringSidebar = false;

    // modo oscuro o claro
    const toggle = document.getElementById('theme-toggle');
    const togglemo = document.getElementById('theme-togglemo');

    // Función para sincronizar ambos toggles
    function syncThemeToggles(sourceToggle, targetToggle) {
        targetToggle.checked = sourceToggle.checked;
        document.body.classList.toggle('dark-mode', sourceToggle.checked);
    }

    // Event listener para el primer toggle
    toggle?.addEventListener('change', () => {
        syncThemeToggles(toggle, togglemo);
    });

    // Event listener para el segundo toggle (móvil)
    togglemo?.addEventListener('change', () => {
        syncThemeToggles(togglemo, toggle);
    });

    // Función para configurar handlers de swipe en cualquier tarjeta
    function setupSwipeHandlers(cardElement) {
        if (!cardElement) {
            console.warn('No se puede configurar swipe handlers: elemento no encontrado');
            return;
        }

        console.log('Configurando swipe handlers para:', cardElement.id);

        // Remover listeners existentes para evitar duplicados
        cardElement.removeEventListener('touchstart', handleStart);
        cardElement.removeEventListener('touchmove', handleMove);
        cardElement.removeEventListener('touchend', handleEnd);
        cardElement.removeEventListener('mousedown', handleStart);

        // Agregar nuevos listeners
        cardElement.addEventListener('touchstart', handleStart, { passive: false });
        cardElement.addEventListener('touchmove', handleMove, { passive: false });
        cardElement.addEventListener('touchend', handleEnd);
        cardElement.addEventListener('mousedown', handleStart);

        // Actualizar referencia global
        card = cardElement;
    }

    // Configurar handlers iniciales
    if (card) {
        setupSwipeHandlers(card);
    }

    // Agregar listeners globales para mouse (estos no se duplican)
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // Sidebar trigger hover handler
    sidebarTrigger.addEventListener('mouseenter', () => {
        if (!isDragging) {
            isHoveringSidebar = true;
            sidebar.classList.add('active');
        }
    });

    sidebar.addEventListener('mouseleave', () => {
        isHoveringSidebar = false;
        sidebar.classList.remove('active');
    });

    document.addEventListener('mousemove', (e) => {
        const edgeDistance = window.innerWidth - e.clientX;
        if (edgeDistance < 15 && !isDragging && !isHoveringSidebar) {
            isHoveringSidebar = true;
            sidebar.classList.add('active');
        } else if (edgeDistance > 80 && !isDragging && isHoveringSidebar && e.target.id !== 'sidebar' && !sidebar.contains(e.target)) {
            isHoveringSidebar = false;
            sidebar.classList.remove('active');
        }
    });

    function handleStart(e) {
        // Asegurar que estamos trabajando con la tarjeta correcta
        card = document.getElementById('project-card');
        if (!card) {
            console.warn('No se encontró la tarjeta para iniciar el drag');
            return;
        }

        isDragging = true;
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
        if (e.type === 'mousedown') {
            e.preventDefault();
        }
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        offsetX = 0;
        offsetY = 0;
        card.style.transition = 'none';
        
        console.log('Drag iniciado en:', startX, startY);
    }

    function handleMove(e) {
        if (expandedView) return;
        if (!isDragging) return;
        let currentX, currentY;
        if (e.type === 'touchmove') {
            e.preventDefault();
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }

        offsetX = currentX - startX;
        offsetY = currentY - startY;

        const rotate = offsetX * 0.1;
        card.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`;

        statusIndicators.style.opacity = '1';
        if (offsetX > 50) {
            likeIndicator.style.opacity = '1';
            dislikeIndicator.style.opacity = '0';
            ampliarIndicator.style.opacity = '0'; 
        } else if (offsetX < -50) {
            likeIndicator.style.opacity = '0';
            dislikeIndicator.style.opacity = '1';
            ampliarIndicator.style.opacity = '0'; 
        } else if (offsetY < -30) {
            likeIndicator.style.opacity = '0';
            dislikeIndicator.style.opacity = '0';
            ampliarIndicator.style.opacity = '1';  
        } else {
            likeIndicator.style.opacity = '0';
            dislikeIndicator.style.opacity = '0';
            ampliarIndicator.style.opacity = '0'; 
        }
    }

    function handleEnd() {
        if (expandedView) return;
        if (!isDragging) return;
        
        // Actualizar referencia a la tarjeta actual
        card = document.getElementById('project-card');
        if (!card) return;
        
        isDragging = false;

        card.style.transition = 'transform 0.5s ease';
        statusIndicators.style.opacity = '0';
        if (offsetX > 100) {
            card.style.transform = `translate(${window.innerWidth}px, ${offsetY}px) rotate(30deg)`;
            setTimeout(() => {
                resetCard();
                handleSwipe('right');
            }, 500);
        } else if (offsetX < -100) {
            card.style.transform = `translate(-${window.innerWidth}px, ${offsetY}px) rotate(-30deg)`;
            setTimeout(resetCard, 500);
        } else if (offsetY < -100) {
            card.style.transition = 'transform 0.5s ease';
            card.style.transform = `translate(0px, -${window.innerHeight}px) rotate(0deg)`;

            setTimeout(() => {
                expandedCard.classList.remove('hidden');
                expandedCard.classList.add('visible');
                expandedView = true;
                card.style.transition = 'none';
                card.style.opacity = '0';
                card.style.transform = 'translate(0, 0) rotate(0deg)';
                card.style.transition = 'opacity 0.3s ease';
                card.style.opacity = '1';
            }, 500);
        } else {
            card.style.transform = 'translate(0, 0) rotate(0deg)';
        }
    }

    function resetCard() {
        card.style.transition = 'none';
        card.style.opacity = '0';
        card.style.transform = 'translate(0, 0) rotate(0deg)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '1';
        }, 50);
    }

    closeExpanded.addEventListener('click', () => {
        expandedCard.classList.remove('visible');
        setTimeout(() => {
            expandedCard.classList.add('hidden');
            expandedView = false;
        }, 400);
    });
});
