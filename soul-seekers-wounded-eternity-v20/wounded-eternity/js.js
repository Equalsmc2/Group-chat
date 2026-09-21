import { db } from "./firebase.js";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const DOM = {
    form: document.getElementById('messageForm'),
    input: document.getElementById('messageInput'),
    messages: document.getElementById('chatMessages'),
    select: document.getElementById('currentUserSelect'),
    container: document.getElementById('chatContainer'),
    speedLines: document.getElementById('speedLines'),
    particleStage: document.getElementById('particleStage')
};

const THEMES = {
    'Observer': { color: '#c4aa79', shadow: 'rgba(196, 170, 121, 0.22)', avatar: '👁️' },
    'Max': { color: '#b45b5b', shadow: 'rgba(180, 91, 91, 0.22)', avatar: '📇' },
    'Jeanette': { color: '#c78caa', shadow: 'rgba(199, 140, 170, 0.22)', avatar: '📸' },
    'Magnus': { color: '#dbb86c', shadow: 'rgba(219, 184, 108, 0.22)', avatar: '💀' },
    'Asya': { color: '#76b5c0', shadow: 'rgba(118, 181, 192, 0.22)', avatar: '📻' },
    'Alexandria': { color: '#ae94cb', shadow: 'rgba(174, 148, 203, 0.22)', avatar: '👑' },
    'Fitz': { color: '#92b7a0', shadow: 'rgba(146, 183, 160, 0.22)', avatar: '⚗️' }
};

let currentUser = DOM.select.value;
let lastSender = 'Observer'; 
const pendingQueue = new Set();
let initialHistoryLoaded = false;
let scrollFrame = 0;
let appliedTheme = null;
function updateConnection(connected) {
    const indicator = document.querySelector('.rail-online');
    const label = document.querySelector('.rail-connection-text');
    indicator?.classList.toggle('connected', connected);
    if (label) label.textContent = connected ? 'LIVE CONNECTION' : 'LINK / OFFLINE';
}

function setTheme(userName) {
    const theme = THEMES[userName] || THEMES['Observer'];
    const root = document.documentElement;
    root.style.setProperty('--current-user-color', theme.color);
    root.style.setProperty('--current-user-shadow', theme.shadow);
    document.querySelector('.avatar-icon').textContent = theme.avatar;
}

function setThreadAccent(userName) {
    const theme = THEMES[userName] || THEMES['Observer'];
    const root = document.documentElement;
    root.style.setProperty('--thread-accent', theme.color);
    root.style.setProperty('--thread-shadow', theme.shadow);
}

let activeColorTransition = null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function refreshThemeState() {
    // Observer follows newest speaker; everyone else keeps their own color.
    const themeName = currentUser === 'Observer' ? lastSender : currentUser;
    if (themeName === appliedTheme) return;
    const firstTheme = appliedTheme === null;
    appliedTheme = themeName;
    const paintTheme = () => {
        setTheme(themeName);
        setThreadAccent(themeName);
    };
    if (firstTheme || prefersReducedMotion.matches || typeof document.startViewTransition !== 'function') {
        paintTheme();
        return;
    }
    // Interpolate two *single* screen captures: gradients do not repaint on
    // every animation frame, and the old color eases into the new one.
    if (activeColorTransition) activeColorTransition.skipTransition();
    document.documentElement.dataset.themeTransition = 'color';
    const transition = document.startViewTransition(paintTheme);
    activeColorTransition = transition;
    transition.finished.finally(() => {
        if (activeColorTransition === transition) {
            activeColorTransition = null;
            delete document.documentElement.dataset.themeTransition;
        }
    }).catch(() => {});
}

// The former full-screen 3D tilt made chat hard to read and distorted map controls.
// The atmospheric banner now provides a restrained pointer parallax instead.

function triggerFX(sourceX, sourceY) {
    // A small compositor-friendly pulse instead of forcing chat layout/reflow.
    DOM.speedLines.animate([{opacity: .19}, {opacity: 0}], {
        duration: 250, easing: 'ease-out'
    });

    // Paper fragments replace Persona-like comic words. No message text is altered.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < 3; i++) {
        const shard = document.createElement('div');
        shard.className = 'comic-shard';
        shard.style.left = `${sourceX}px`;
        shard.style.top = `${sourceY}px`;
        shard.style.setProperty('--tx', `${(Math.random() - 0.5) * 230}px`);
        shard.style.setProperty('--ty', `${(Math.random() - 0.5) * 210 - 85}px`);
        shard.style.setProperty('--rot', `${(Math.random() - 0.5) * 150}deg`);
        shard.style.setProperty('--shard-w', `${18 + Math.random() * 33}px`);
        shard.style.setProperty('--shard-h', `${14 + Math.random() * 30}px`);
        DOM.particleStage.appendChild(shard);
        setTimeout(() => shard.remove(), 510);
    }
}

function appendMessage(msg, isNew = false, target = DOM.messages) {
    const isMe = msg.sender === currentUser;
    const msgDiv = document.createElement('div');
    
    msgDiv.dataset.sender = msg.sender;
    msgDiv.className = `message ${isMe ? 'message-out' : 'message-in'} ${isNew ? 'anim-slam' : ''}`;
    
    const theme = THEMES[msg.sender] || { color: '#fff' };
    msgDiv.style.setProperty('--char-color', theme.color);

    if (!isMe) {
        const label = document.createElement('div');
        label.className = 'sender-name';
        label.textContent = msg.sender; 
        msgDiv.appendChild(label);
    }
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = msg.text; 
    msgDiv.appendChild(bubble);
    
    target.appendChild(msgDiv);
    
    if (isNew && isMe) {
        const rect = DOM.form.querySelector('.send-btn').getBoundingClientRect();
        triggerFX(rect.left, rect.top);
    }   
    
    return msgDiv;
}

function scrollToLatest(smooth = false) {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
        if (smooth) {
            DOM.messages.scrollTo({top: DOM.messages.scrollHeight, behavior: 'smooth'});
        } else {
            DOM.messages.scrollTop = DOM.messages.scrollHeight;
        }
    });
}

function isNearLatest() {
    return DOM.messages.scrollHeight - DOM.messages.clientHeight - DOM.messages.scrollTop < 130;
}

DOM.select.addEventListener('change', (e) => {
    currentUser = e.target.value;
    refreshThemeState();
    
    Array.from(DOM.messages.children).forEach(msgDiv => {
        const sender = msgDiv.dataset.sender;
        const isMe = sender === currentUser;
        msgDiv.className = `message ${isMe ? 'message-out' : 'message-in'}`;
        
        let label = msgDiv.querySelector('.sender-name');
        if (isMe && label) label.remove();
        if (!isMe && !label) {
            label = document.createElement('div');
            label.className = 'sender-name';
            label.textContent = sender;
            msgDiv.insertBefore(label, msgDiv.firstChild);
        }
    });
    scrollToLatest();
});

const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

onSnapshot(q, (snapshot) => {
    updateConnection(true);
    const wasAtLatest = isNearLatest();
    const isInitialBatch = !initialHistoryLoaded;
    const fragment = document.createDocumentFragment();
    let addedAny = false;
    let lastAddedSender = null;
    snapshot.docChanges().forEach((change) => {
        if (change.type !== 'added') return;
        const data = change.doc.data();
        lastAddedSender = data.sender;
        if (data.localId && pendingQueue.has(data.localId)) {
            pendingQueue.delete(data.localId);
            return;
        }
        appendMessage(data, !isInitialBatch, fragment);
        addedAny = true;
    });
    if (lastAddedSender !== null) {
        lastSender = lastAddedSender;
        refreshThemeState();
    }
    if (addedAny) DOM.messages.appendChild(fragment);
    if (isInitialBatch || (addedAny && wasAtLatest)) scrollToLatest(!isInitialBatch);
    initialHistoryLoaded = true;
}, (error) => {
    console.error('Chat connection failed', error);
    updateConnection(false);
});

DOM.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = DOM.input.value.trim();
    if (!text) return;

    const localId = Date.now().toString();
    pendingQueue.add(localId);
    lastSender = currentUser;
    refreshThemeState();
    
    const pendingMessage = appendMessage({ text, sender: currentUser, localId }, true);
    scrollToLatest(true);
    DOM.input.value = '';
    
    try {
        await addDoc(collection(db, "messages"), {
            text, sender: currentUser, localId, createdAt: serverTimestamp()
        });
    } catch (err) {
        console.error("Transmission Failed", err);
        pendingQueue.delete(localId);
        pendingMessage.classList.add('message-failed');
    }
});

refreshThemeState();