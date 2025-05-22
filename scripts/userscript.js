document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('project-card');
    const sidebar = document.getElementById('sidebar');
    const sidebarTrigger = document.getElementById('sidebar-trigger');

    let startY = 0;
    let offsetY = 0;
    let isDragging = false;
    let isHoveringSidebar = false;

    // Handlers for touch devices
    card.addEventListener('touchstart', handleStart, { passive: false });
    card.addEventListener('touchmove', handleMove, { passive: false });
    card.addEventListener('touchend', handleEnd);

    // Handlers for mouse devices
    card.addEventListener('mousedown', handleStart);
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
        isDragging = true;

        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }

        if (e.type === 'mousedown') {
            e.preventDefault();
        }

        if (e.type === 'touchstart') {
            startY = e.touches[0].clientY;
        } else {
            startY = e.clientY;
        }

        offsetY = 0;
        card.style.transition = 'none';
    }

    function handleMove(e) {
        if (!isDragging) return;

        let currentY;
        if (e.type === 'touchmove') {
            e.preventDefault();
            currentY = e.touches[0].clientY;
        } else {
            currentY = e.clientY;
        }

        offsetY = currentY - startY;

        // Solo permitir movimiento hacia arriba
        if (offsetY > 0) offsetY = 0;

        card.style.transform = `translateY(${offsetY}px)`;
    }

    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;

        // Si se arrastró hacia arriba lo suficiente, ocultar la tarjeta
        if (offsetY < -100) {
            card.style.transform = `translateY(-${window.innerHeight}px)`;
            setTimeout(resetCard, 500);
        } else {
            // Volver a posición original
            card.style.transform = 'translateY(0)';
        }
    }

    function resetCard() {
        card.style.transition = 'none';
        card.style.opacity = '0';
        card.style.transform = 'translateY(0)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '1';
        }, 100);
    }
});
