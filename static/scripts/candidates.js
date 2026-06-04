document.addEventListener('DOMContentLoaded', () => {
    let candidates = [];
    let currentIndex = 0;
    let isDragging = false;
    let startX = 0, startY = 0, offsetX = 0, offsetY = 0;
    let expandedView = false;

    const card = document.getElementById('candidate-card');
    const expandedCard = document.getElementById('expanded-card');
    const closeExpanded = document.getElementById('close-expanded');
    const statusIndicators = document.getElementById('status-indicators');
    const likeIndicator = statusIndicators.querySelector('.like-indicator');
    const dislikeIndicator = statusIndicators.querySelector('.dislike-indicator');
    const ampliarIndicator = statusIndicators.querySelector('.ampliar-indicator');
    const sidebar = document.getElementById('sidebar');
    const sidebarTrigger = document.getElementById('sidebar-trigger');

    // Theme toggles
    const toggle = document.getElementById('theme-toggle');
    const togglemo = document.getElementById('theme-togglemo');
    toggle?.addEventListener('change', () => { togglemo.checked = toggle.checked; document.body.classList.toggle('dark-mode', toggle.checked); });
    togglemo?.addEventListener('change', () => { toggle.checked = togglemo.checked; document.body.classList.toggle('dark-mode', togglemo.checked); });

    // Sidebar
    sidebarTrigger?.addEventListener('mouseenter', () => sidebar.classList.add('active'));
    sidebar?.addEventListener('mouseleave', () => sidebar.classList.remove('active'));

    async function loadCandidates() {
        const r = await fetch('/api/interests/candidates');
        candidates = await r.json();
        if (!Array.isArray(candidates) || candidates.length === 0) {
            showEmpty();
        } else {
            renderCandidate(currentIndex);
        }
    }

    function showEmpty() {
        document.querySelector('.card-container').innerHTML = `
            <div class="no-projects-message">
                <div class="no-projects-icon">👥</div>
                <h2>Sin candidatos por ahora</h2>
                <p>Cuando alguien muestre interés en tus proyectos, aparecerá aquí.</p>
            </div>`;
        statusIndicators.style.display = 'none';
    }

    function renderCandidate(index) {
        if (index >= candidates.length) {
            showEmpty();
            return;
        }
        const { user, project } = candidates[index];

        document.querySelector('.card-title').textContent = `${user.firstName} ${user.lastName}`;

        // Avatar con iniciales
        const initials = ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase();
        document.querySelectorAll('.user-card-image').forEach(av => {
            av.innerHTML = '';
            const span = document.createElement('span');
            span.className = 'avatar-initials';
            span.textContent = initials;
            av.appendChild(span);
        });

        const stats = document.querySelectorAll('.stats-text');
        if (stats.length >= 4) {
            stats[0].textContent = user.age || '—';
            stats[1].textContent = user.status || 'Disponible';
            stats[2].textContent = user.languages || '—';
            stats[3].textContent = user.specialization || '—';
        }

        document.querySelector('.card-description').textContent = user.bio || '';

        const techContainer = document.querySelector('.card-tech');
        techContainer.innerHTML = '';
        (user.skills || []).slice(0, 4).forEach(skill => {
            const d = document.createElement('div');
            d.className = 'tech-icon';
            d.textContent = skill.substring(0, 4);
            techContainer.appendChild(d);
        });

        document.querySelector('.candidate-project-tag').textContent = `Interesado en: ${project.title}`;

        // Vista expandida
        document.querySelector('.expanded-title').textContent = `${user.firstName} ${user.lastName}`;
        document.querySelector('.status-badge').textContent = user.status || 'Disponible';

        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = user.age || '—';
            statValues[1].textContent = user.languages || '—';
            statValues[2].textContent = user.specialization || '—';
        }

        document.getElementById('bio-content').textContent = user.bio || '';
        document.getElementById('project-interest').textContent = project.title;

        const skillsGrid = document.getElementById('skills-grid');
        skillsGrid.innerHTML = '';
        (user.skills || []).forEach(skill => {
            const item = document.createElement('div');
            item.className = 'tech-item';
            item.innerHTML = `<span class="tech-icon-expanded">${skill.substring(0,4)}</span><span class="tech-name">${skill}</span>`;
            skillsGrid.appendChild(item);
        });

        const contactList = document.getElementById('contact-list');
        contactList.innerHTML = '';
        const contacts = [];
        if (user.email) contacts.push(`Email: ${user.email}`);
        if (user.linkedin) contacts.push(`LinkedIn: ${user.linkedin}`);
        if (user.github) contacts.push(`GitHub: ${user.github}`);
        contacts.forEach(c => {
            const item = document.createElement('div');
            item.className = 'objective-item';
            item.innerHTML = `<span>${c}</span>`;
            contactList.appendChild(item);
        });
    }

    async function acceptCandidate() {
        const candidate = candidates[currentIndex];
        const r = await fetch('/api/matches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interest_id: candidate.interest_id })
        });

        if (r.ok) {
            showToast(`¡Match con ${candidate.user.firstName}! 🎉 Abriendo chat...`);
            setTimeout(() => { window.location.href = '/chat'; }, 1500);
        } else {
            showToast('Error al generar el match');
            nextCandidate();
        }
    }

    async function rejectCandidate() {
        const candidate = candidates[currentIndex];
        await fetch(`/api/interests/${candidate.interest_id}/reject`, { method: 'POST' });
        nextCandidate();
    }

    function nextCandidate() {
        currentIndex++;
        card.style.transition = 'none';
        card.style.opacity = '0';
        card.style.transform = 'translate(0,0) rotate(0deg)';
        setTimeout(() => {
            renderCandidate(currentIndex);
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '1';
        }, 50);
    }

    function showToast(msg) {
        const t = document.createElement('div');
        t.textContent = msg;
        t.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
            background:#667eea;color:white;padding:12px 24px;border-radius:24px;
            font-size:0.95rem;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.3);`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2500);
    }

    // Botones en vista expandida
    document.getElementById('match-btn').addEventListener('click', () => { closeExpanded.click(); acceptCandidate(); });
    document.getElementById('reject-btn').addEventListener('click', () => { closeExpanded.click(); rejectCandidate(); });

    // Cerrar expandida
    closeExpanded.addEventListener('click', () => {
        expandedCard.classList.remove('visible');
        setTimeout(() => { expandedCard.classList.add('hidden'); expandedView = false; }, 400);
    });

    // Swipe handlers
    card.addEventListener('mousedown', handleStart);
    card.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    card.addEventListener('touchmove', handleMove, { passive: false });
    card.addEventListener('touchend', handleEnd);

    function handleStart(e) {
        if (candidates.length === 0) return;
        isDragging = true;
        card.style.transition = 'none';
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        offsetX = 0; offsetY = 0;
        if (e.type === 'mousedown') e.preventDefault();
    }

    function handleMove(e) {
        if (!isDragging || expandedView) return;
        const cx = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const cy = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        if (e.type === 'touchmove') e.preventDefault();
        offsetX = cx - startX;
        offsetY = cy - startY;
        card.style.transform = `translate(${offsetX}px,${offsetY}px) rotate(${offsetX * 0.1}deg)`;
        statusIndicators.style.opacity = '1';
        likeIndicator.style.opacity = offsetX > 50 ? '1' : '0';
        dislikeIndicator.style.opacity = offsetX < -50 ? '1' : '0';
        ampliarIndicator.style.opacity = offsetY < -30 ? '1' : '0';
    }

    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;
        card.style.transition = 'transform 0.5s ease';
        statusIndicators.style.opacity = '0';

        if (offsetX > 100) {
            card.style.transform = `translate(${window.innerWidth}px,${offsetY}px) rotate(30deg)`;
            setTimeout(() => acceptCandidate(), 500);
        } else if (offsetX < -100) {
            card.style.transform = `translate(-${window.innerWidth}px,${offsetY}px) rotate(-30deg)`;
            setTimeout(() => rejectCandidate(), 500);
        } else if (offsetY < -100) {
            card.style.transform = `translateY(-${window.innerHeight}px)`;
            setTimeout(() => {
                expandedCard.classList.remove('hidden');
                requestAnimationFrame(() => expandedCard.classList.add('visible'));
                expandedView = true;
                card.style.transition = 'opacity 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'translate(0,0)';
                setTimeout(() => { card.style.opacity = '1'; }, 300);
            }, 500);
        } else {
            card.style.transform = 'translate(0,0) rotate(0deg)';
        }
    }

    loadCandidates();
});
