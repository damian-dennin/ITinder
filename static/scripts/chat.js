document.addEventListener('DOMContentLoaded', () => {
    let currentMatchId = null;
    let currentUserId = null;
    let pollingInterval = null;

    // Cargar perfil y matches en paralelo para reducir el tiempo de carga
    async function init() {
        try {
            const [profileRes, matchesRes] = await Promise.all([
                fetch('/api/user/profile'),
                fetch('/api/matches')
            ]);
            const profile = await profileRes.json();
            const matches = await matchesRes.json();
            currentUserId = profile.id;
            renderMatches(matches);
        } catch (e) {
            console.error('Error iniciando chat:', e);
            document.getElementById('matches-container').innerHTML =
                '<div class="no-matches">Error cargando matches.</div>';
        }
    }

    async function loadMatches() {
        const r = await fetch('/api/matches');
        const matches = await r.json();
        renderMatches(matches);
    }

    function renderMatches(matches) {
        const container = document.getElementById('matches-container');

        if (!Array.isArray(matches) || matches.length === 0) {
            container.innerHTML = '<div class="no-matches">Todavía no tenés matches.<br>¡Seguí swipeando!</div>';
            return;
        }

        container.innerHTML = '';
        matches.forEach((match, index) => {
            const item = document.createElement('div');
            item.className = 'match-item';
            item.dataset.matchId = match.match_id;

            const initials = `${match.other_user.firstName[0]}${match.other_user.lastName[0]}`.toUpperCase();
            item.innerHTML = `
                <div class="match-avatar">${initials}</div>
                <div class="match-info">
                    <div class="match-name">${match.other_user.firstName} ${match.other_user.lastName}</div>
                    <div class="match-project">${match.project.title}</div>
                </div>
            `;

            item.addEventListener('click', () => {
                document.querySelectorAll('.match-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                openChat(match);
            });

            container.appendChild(item);

            // Auto-abrir el primer match
            if (index === 0) {
                item.classList.add('active');
                openChat(match);
            }
        });
    }

    function openChat(match) {
        if (pollingInterval) clearInterval(pollingInterval);
        currentMatchId = match.match_id;

        const chatArea = document.getElementById('chat-area');
        chatArea.innerHTML = `
            <div class="chat-header">
                <h3>${match.other_user.firstName} ${match.other_user.lastName}</h3>
                <p>${match.project.title}</p>
            </div>
            <div class="messages-container" id="messages-container"></div>
            <div class="chat-input-area">
                <input type="text" class="chat-input" id="chat-input" placeholder="Escribí un mensaje..." maxlength="500">
                <button class="send-btn" id="send-btn">Enviar</button>
            </div>
        `;

        document.getElementById('send-btn').addEventListener('click', sendMessage);
        document.getElementById('chat-input').addEventListener('keydown', e => {
            if (e.key === 'Enter') sendMessage();
        });

        fetchMessages();
        // Polling cada 4 segundos para recibir mensajes nuevos
        pollingInterval = setInterval(fetchMessages, 4000);
    }

    async function fetchMessages() {
        if (!currentMatchId) return;
        const r = await fetch(`/api/chat/${currentMatchId}`);
        const messages = await r.json();
        if (!Array.isArray(messages)) return;

        const container = document.getElementById('messages-container');
        if (!container) return;

        const wasAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;

        container.innerHTML = '';
        messages.forEach(msg => {
            const isSent = msg.sender_id === currentUserId;
            const div = document.createElement('div');
            div.className = `message ${isSent ? 'sent' : 'received'}`;

            const time = msg.created_at
                ? new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                : '';

            div.innerHTML = `
                ${!isSent ? `<div class="msg-sender">${msg.sender_name || 'Usuario'}</div>` : ''}
                <div>${escapeHtml(msg.content)}</div>
                <div class="msg-time">${time}</div>
            `;
            container.appendChild(div);
        });

        if (wasAtBottom) container.scrollTop = container.scrollHeight;
    }

    async function sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;
        const content = input.value.trim();
        if (!content || !currentMatchId) return;

        input.value = '';
        input.disabled = true;

        await fetch(`/api/chat/${currentMatchId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });

        input.disabled = false;
        input.focus();
        fetchMessages();
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    init();
});
