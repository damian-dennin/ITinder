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
    

    const createProjectBtn = document.getElementById('create-project-btn');
    const createProjectCard = document.getElementById('create-project-card');
    const closeCreate = document.getElementById('close-create');
    const cancelCreate = document.getElementById('cancel-create');
    const createForm = document.getElementById('create-form');


    const projectImageInput = document.getElementById('project-image');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const removeImageBtn = document.getElementById('remove-image');
    const imagePlaceholder = imagePreview.querySelector('.image-placeholder');
    
    let selectedImageFile = null;

    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let isHoveringSidebar = false;


    projectImageInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            selectedImageFile = file;
            const reader = new FileReader();
            
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
                removeImageBtn.style.display = 'block';
                imagePlaceholder.style.display = 'none';
            };
            
            reader.readAsDataURL(file);
        }
    });

    removeImageBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        selectedImageFile = null;
        projectImageInput.value = '';
        previewImg.src = '';
        previewImg.style.display = 'none';
        removeImageBtn.style.display = 'none';
        imagePlaceholder.style.display = 'flex';
    });

    function closeCreateModal() {
        createProjectCard.classList.remove('visible');
        setTimeout(() => {
            createProjectCard.classList.add('hidden');
            createForm.reset();
            if (selectedImageFile) {
                selectedImageFile = null;
                previewImg.src = '';
                previewImg.style.display = 'none';
                removeImageBtn.style.display = 'none';
                imagePlaceholder.style.display = 'flex';
            }
        }, 400);
    }

    // Event listeners para crear proyecto
    closeCreate?.addEventListener('click', closeCreateModal);
    cancelCreate?.addEventListener('click', closeCreateModal);

    createProjectBtn?.addEventListener('click', () => {
        createProjectCard.classList.remove('hidden');
        setTimeout(() => {
            createProjectCard.classList.add('visible');
        }, 10);
    });

    createProjectCard?.addEventListener('click', (e) => {
        if (e.target === createProjectCard) {
            closeCreateModal();
        }
    });

    createForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Parsear tamaño de equipo (formato "5/10" o solo "10")
        const teamSizeRaw = document.getElementById('team-size').value;
        const teamParts = teamSizeRaw.split('/').map(s => parseInt(s.trim()) || 0);
        const teamCurrent = teamParts.length > 1 ? teamParts[0] : 1;
        const teamMax = teamParts.length > 1 ? teamParts[1] : teamParts[0];

        // Parsear tecnologías: "Python, React" → [{name:"Python",icon:"Pyth"}, ...]
        const technologiesRaw = document.getElementById('technologies').value;
        const technologies = technologiesRaw
            .split(',')
            .map(t => t.trim())
            .filter(t => t)
            .map(t => ({ name: t, icon: t.substring(0, 4) }));

        // Parsear habilidades buscadas
        const skillsRaw = document.getElementById('skills').value;
        const skills_needed = skillsRaw
            .split(',')
            .map(s => s.trim())
            .filter(s => s);

        const projectData = {
            title: document.getElementById('project-name').value,
            status: document.getElementById('project-status').value,
            description: document.getElementById('description').value,
            image_url: '',
            stats: {
                team_current: teamCurrent,
                team_max: teamMax,
                duration: document.getElementById('duration').value || 'Indefinido',
                language: document.getElementById('language').value,
                type: document.getElementById('project-type').value
            },
            technologies: technologies,
            skills_needed: skills_needed,
            objectives: [],
            progress: 0
        };

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                const newProject = await response.json();
                // Agregar el proyecto al manager sin recargar la página
                if (window.projectsManager) {
                    window.projectsManager.projects.push(newProject);
                }
                closeCreateModal();
                alert('¡Proyecto creado exitosamente!');
            } else {
                const err = await response.json();
                alert('Error al crear el proyecto: ' + (err.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error al crear proyecto:', error);
            alert('Error de conexión al crear el proyecto');
        }
    });
    
    // Theme toggles
    const toggle = document.getElementById('theme-toggle');
    const togglemo = document.getElementById('theme-togglemo');

    function syncThemeToggles(sourceToggle, targetToggle) {
        targetToggle.checked = sourceToggle.checked;
        document.body.classList.toggle('dark-mode', sourceToggle.checked);
    }

    toggle?.addEventListener('change', () => {
        syncThemeToggles(toggle, togglemo);
    });

    togglemo?.addEventListener('change', () => {
        syncThemeToggles(togglemo, toggle);
    });

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
    sidebarTrigger?.addEventListener('mouseenter', () => {
        if (!isDragging) {
            isHoveringSidebar = true;
            sidebar.classList.add('active');
        }
    });

    sidebar?.addEventListener('mouseleave', () => {
        isHoveringSidebar = false;
        sidebar.classList.remove('active');
    });

    document.addEventListener('mousemove', (e) => {
        const edgeDistance = window.innerWidth - e.clientX;
        
        if (edgeDistance < 15 && !isDragging && !isHoveringSidebar) {
            isHoveringSidebar = true;
            sidebar.classList.add('active');
        } 
        else if (edgeDistance > 80 && !isDragging && isHoveringSidebar && e.target.id !== 'sidebar' && !sidebar.contains(e.target)) {
            isHoveringSidebar = false;
            sidebar.classList.remove('active');
        }
    });

    function handleStart(e) {
        card = document.getElementById('project-card');
        if (!card) return;

        // Detener cualquier animación CSS activa para que el drag tome control
        card.classList.remove('card-entering');
        card.style.animation = 'none';

        isDragging = true;

        createProjectBtn.style.transition = 'opacity 0.3s ease';
        createProjectBtn.style.opacity = '0';
        
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
        
        // Actualizar referencia a la tarjeta actual
        card = document.getElementById('project-card');
        if (!card) return;
        
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
        
        // Mostrar indicadores
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

        createProjectBtn.style.transition = 'opacity 0.3s ease';
        createProjectBtn.style.opacity = '1';
        
        card.style.transition = 'transform 0.5s ease';
        statusIndicators.style.opacity = '0';
        
        console.log('Drag terminado con offset:', offsetX, offsetY);
        
        if (offsetX > 100) {
            card.style.transform = `translate(${window.innerWidth}px, ${offsetY}px) rotate(30deg)`;
            setTimeout(() => {
                resetCard();
                handleSwipe('right');
            }, 500);
        } else if (offsetX < -100) {
            card.style.transform = `translate(-${window.innerWidth}px, ${offsetY}px) rotate(-30deg)`;
            setTimeout(() => {
                resetCard();
                handleSwipe('left');
            }, 500);
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
                card.style.transform = 'translate(0, 0)';
                card.style.transition = 'opacity 0.3s ease';
                card.style.opacity = '1';
            }, 500);
        } else {
            card.style.transform = 'translate(0, 0) rotate(0deg)';
        }
    }

    function resetCard() {
        card = document.getElementById('project-card');
        if (!card) return;
        
        card.style.transition = 'none';
        card.style.opacity = '0';
        card.style.transform = 'translate(0, 0) rotate(0deg)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '1';
        }, 50);
    }

    closeExpanded?.addEventListener('click', () => {
        expandedCard.classList.remove('visible');
        setTimeout(() => {
            expandedCard.classList.add('hidden');
            expandedView = false;
        }, 400);
    });

    function handleSwipe(direction) {
        if (window.projectsManager) {
            // Guardar el proyecto actual ANTES de que cambie
            const currentProject = window.projectsManager.projects[window.projectsManager.currentProjectIndex];

            window.projectsManager.handleCardSwipe(direction);

            if (direction === 'right' && currentProject) {
                fetch('/api/interests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ project_id: currentProject.id })
                })
                .then(r => r.json())
                .then(() => showMatchToast('¡Mostraste interés en este proyecto! 🚀'))
                .catch(err => console.error('Error guardando interés:', err));
            }
        }
    }

    function showMatchToast(msg) {
        const toast = document.createElement('div');
        toast.textContent = msg;
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: #667eea; color: white; padding: 12px 24px;
            border-radius: 24px; font-size: 0.95rem; z-index: 9999;
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            animation: fadeInUp 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    // Mostrar "Ver candidatos" solo si el usuario tiene proyectos creados
    fetch('/api/user/projects')
        .then(r => r.json())
        .then(projects => {
            if (Array.isArray(projects) && projects.length > 0) {
                const btn = document.getElementById('candidates-btn');
                if (btn) btn.style.display = 'flex';
            }
        })
        .catch(() => {});

    // Hacer funciones disponibles globalmente
    window.handleSwipe = handleSwipe;
    window.setupSwipeHandlers = setupSwipeHandlers;

    // Panel de configuración (botón gear)
    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'settings-panel';
    settingsPanel.style.cssText = `
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--card-bg, #1e1e2e);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 16px;
        padding: 28px 32px;
        z-index: 9999;
        min-width: 260px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        text-align: center;
    `;
    settingsPanel.innerHTML = `
        <h3 style="margin-bottom:20px;font-size:1.1rem;">Configuración</h3>
        <button id="settings-logout-btn" style="
            width:100%; padding:10px; margin-bottom:10px;
            background: #e74c3c; color:white; border:none;
            border-radius:8px; cursor:pointer; font-size:0.95rem;">
            Cerrar sesión
        </button>
        <p style="font-size:0.8rem;opacity:0.5;margin-top:12px;">Más opciones — próximamente</p>
        <button id="settings-close-btn" style="
            margin-top:8px; background:transparent; border:none;
            color:inherit; opacity:0.6; cursor:pointer; font-size:0.85rem;">
            Cancelar
        </button>
    `;
    document.body.appendChild(settingsPanel);

    document.querySelectorAll('.menu-icon.gear').forEach(btn => {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
            settingsPanel.style.display = 'block';
        });
    });

    document.getElementById('settings-close-btn').addEventListener('click', () => {
        settingsPanel.style.display = 'none';
    });

    document.getElementById('settings-logout-btn').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    });
});