// FEED
document.addEventListener('DOMContentLoaded', () => {
    const expandedCard = document.getElementById('expanded-card');
    const closeExpanded = document.getElementById('close-expanded');
    let expandedView = false;

    const card = document.getElementById('project-card');
    const statusIndicators = document.getElementById('status-indicators');
    const likeIndicator = statusIndicators.querySelector('.like-indicator');
    const dislikeIndicator = statusIndicators.querySelector('.dislike-indicator');
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

    toggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', toggle.checked);
    });

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

    // Handle mouse leaving sidebar area
    sidebar.addEventListener('mouseleave', () => {
        isHoveringSidebar = false;
        sidebar.classList.remove('active');
    });

    // Prevent sidebar from showing if dragging
    document.addEventListener('mousemove', (e) => {
        // Check if cursor is near the right edge of the screen
        const edgeDistance = window.innerWidth - e.clientX;
        
        // If cursor is close to the edge and not dragging, prepare to show sidebar
        if (edgeDistance < 15 && !isDragging && !isHoveringSidebar) {
            isHoveringSidebar = true;
            sidebar.classList.add('active');
        } 
        // If cursor moves away from sidebar area and we're not hovering over the sidebar itself
        else if (edgeDistance > 80 && !isDragging && isHoveringSidebar && e.target.id !== 'sidebar' && !sidebar.contains(e.target)) {
            isHoveringSidebar = false;
            sidebar.classList.remove('active');
        }
    });

    function handleStart(e) {
        isDragging = true;
        
        // Hide sidebar if it's open while starting to drag
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
        
        // Prevent default only for mouse to avoid text selection
        if (e.type === 'mousedown') {
            e.preventDefault();
        }
        
        // Get starting position
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        
        // Reset transforms
        offsetX = 0;
        offsetY = 0;
        card.style.transition = 'none';
    }

    function handleMove(e) {
        if (expandedView) return;
        if (!isDragging) return;
        
        // Get current position
        let currentX, currentY;
        if (e.type === 'touchmove') {
            e.preventDefault(); // Prevent scrolling when dragging
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }
        
        // Calculate offset
        offsetX = currentX - startX;
        offsetY = currentY - startY;
        
        // Apply transformation
        const rotate = offsetX * 0.1; // Add slight rotation based on drag distance
        card.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`;
        
        // Show indicators based on direction
        statusIndicators.style.opacity = '1';
        if (offsetX > 50) {
            likeIndicator.style.opacity = '1';
            dislikeIndicator.style.opacity = '0';
        } else if (offsetX < -50) {
            likeIndicator.style.opacity = '0';
            dislikeIndicator.style.opacity = '1';
        } else {
            likeIndicator.style.opacity = '0';
            dislikeIndicator.style.opacity = '0';
        }
    }

    function handleEnd() {
        if (expandedView) return;
        if (!isDragging) return;
        isDragging = false;
        
        card.style.transition = 'transform 0.5s ease';
        statusIndicators.style.opacity = '0';
        
        // If dragged far enough, swipe away
        if (offsetX > 100) {
            card.style.transform = `translate(${window.innerWidth}px, ${offsetY}px) rotate(30deg)`;
            setTimeout(resetCard, 500);
        } else if (offsetX < -100) {
            card.style.transform = `translate(-${window.innerWidth}px, ${offsetY}px) rotate(-30deg)`;
            setTimeout(resetCard, 500);
        
        }else if (offsetY < -100) {
            card.style.transition = 'transform 0.5s ease';
            card.style.transform = `translate(0px, -${window.innerHeight}px) rotate(0deg)`;


            setTimeout(() => {
                expandedCard.classList.remove('hidden');
                requestAnimationFrame(() => {
                    expandedCard.classList.add('visible');
                });
                expandedView = true;
                card.style.transition = 'none';
                card.style.opacity = '0';
                card.style.transform = 'translate(0, 0) rotate(0deg)';
                card.style.transform = 'translate(0, 0)';
                card.style.transition = 'opacity 0.3s ease';
                card.style.opacity = '1';
            }, 500);
        } else {
            // Reset position if not dragged far enough
            card.style.transform = 'translate(0, 0) rotate(0deg)';
        }
    }

    function resetCard() {
        // Hide the card, reset position, and show it again
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


// -------------------