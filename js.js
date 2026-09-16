import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Dummy config preserved
const firebaseConfig = {
    apiKey: "AIzaSyAsOosEU05SX5MU-mxEQ5FvhFeJvTjQaQ8",
    authDomain: "group-chat-e19f8.firebaseapp.com",
    projectId: "group-chat-e19f8",
    storageBucket: "group-chat-e19f8.firebasestorage.app",
    messagingSenderId: "1085864086659",
    appId: "1:1085864086659:web:de378f1efe80bc9a0b1fb6",
    measurementId: "G-93G3VWHRY4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    'Observer': { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.4)', avatar: '👁️' },
    'Max': { color: '#ff003c', glow: 'rgba(255, 0, 60, 0.4)', avatar: '🃏' },  
    'Jeanette': { color: '#ff1493', glow: 'rgba(255, 20, 147, 0.4)', avatar: '🐆' }, 
    'Magnus': { color: '#ffee00', glow: 'rgba(255, 238, 0, 0.4)', avatar: '☠️' },  
    'Asya': { color: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)', avatar: '🦊' },  
    'Queen': { color: '#9d00ff', glow: 'rgba(157, 0, 255, 0.4)', avatar: '👑' },  
    'Fitz': { color: '#00ff66', glow: 'rgba(0, 255, 102, 0.4)', avatar: '🎧' }   
};

const IMPACT_WORDS = ['NAT20', 'I cast shatter', 'six seven', '67', 'Cata-COOMs!', 'I got this-FAHHH', 'FIREBALL!', 'Denpa-denpa'];
let currentUser = DOM.select.value;
let lastSender = 'Observer'; // Track who spoke last
const pendingQueue = new Set();

function setTheme(userName) {
    const theme = THEMES[userName] || THEMES['Joker'];
    const root = document.documentElement;
    root.style.setProperty('--current-user-color', theme.color);
    root.style.setProperty('--current-user-glow', theme.glow);
    document.querySelector('.avatar-icon').textContent = theme.avatar;
}

// Optimized Hardware Tilt
let isTicking = false;
let targetTilt = { x: 0, y: 0 };
let currentTilt = { x: 0, y: 0 };

function animateTilt() {
    currentTilt.x += (targetTilt.x - currentTilt.x) * 0.15;
    currentTilt.y += (targetTilt.y - currentTilt.y) * 0.15;
    
    DOM.container.style.transform = `
        rotateY(${currentTilt.x}deg) 
        rotateX(${currentTilt.y}deg)
        translateZ(10px)
    `;
    requestAnimationFrame(animateTilt);
}
requestAnimationFrame(animateTilt);

document.addEventListener('mousemove', (e) => {
    if (!isTicking) {
        requestAnimationFrame(() => {
            const { innerWidth, innerHeight } = window;
            targetTilt.x = ((e.clientX / innerWidth) - 0.5) * 12;
            targetTilt.y = ((e.clientY / innerHeight) - 0.5) * -12;
            isTicking = false;
        });
        isTicking = true;
    }
});

function triggerFX(sourceX, sourceY) {
    DOM.container.classList.remove('screen-rumble');
    void DOM.container.offsetWidth; 
    DOM.container.classList.add('screen-rumble');

    DOM.speedLines.classList.add('active');
    setTimeout(() => DOM.speedLines.classList.remove('active'), 200);

    for (let i = 0; i < 5; i++) {
        const shard = document.createElement('div');
        shard.className = 'comic-shard';
        shard.textContent = IMPACT_WORDS[Math.floor(Math.random() * IMPACT_WORDS.length)];
        
        shard.style.left = `${sourceX}px`;
        shard.style.top = `${sourceY}px`;
        shard.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
        shard.style.setProperty('--ty', `${(Math.random() - 0.5) * 200 - 50}px`);
        shard.style.setProperty('--rot', `${(Math.random() - 0.5) * 90}deg`);
        
        DOM.particleStage.appendChild(shard);
        setTimeout(() => shard.remove(), 6000);
    }
}

function appendMessage(msg, isNew = false) {
    const isMe = msg.sender === currentUser;
    const msgDiv = document.createElement('div');
    
    msgDiv.dataset.sender = msg.sender;
    msgDiv.className = `message ${isMe ? 'message-out' : 'message-in'} ${isNew ? 'anim-slam' : ''}`;
    
    const theme = THEMES[msg.sender] || { color: '#94a3b8' };
    msgDiv.style.setProperty('--char-color', theme.color);

    if (!isMe) {
        const label = document.createElement('div');
        label.className = 'sender-name';
        label.textContent = msg.sender; // Safe DOM text
        msgDiv.appendChild(label);
    }
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = msg.text; // Fixed XSS vulnerability[cite: 3]
    msgDiv.appendChild(bubble);
    
    DOM.messages.appendChild(msgDiv);
    
    if (isNew && isMe) {
        const rect = DOM.form.querySelector('.send-btn').getBoundingClientRect();
        triggerFX(rect.left, rect.top);
}   
    
    DOM.messages.scrollTop = DOM.messages.scrollHeight;
}

DOM.select.addEventListener('change', (e) => {
    currentUser = e.target.value;
    
    // If they switch to Observer, adopt the last sender's theme. Otherwise, use their selected theme.
    if (currentUser === 'Observer') {
        setTheme(lastSender);
    } else {
        setTheme(currentUser);
    }
    
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
    DOM.messages.scrollTop = DOM.messages.scrollHeight;
});

const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const data = change.doc.data();
            
            // Update the last sender tracking
            lastSender = data.sender;
            
            // Dynamically shift colors if the user is in Observer mode
            if (currentUser === 'Observer') {
                setTheme(lastSender);
            }

            if (data.localId && pendingQueue.has(data.localId)) {
                pendingQueue.delete(data.localId);
                return;
            }
            appendMessage(data, true);
        }
    });
});

DOM.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = DOM.input.value.trim();
    if (!text) return;

    const localId = Date.now().toString();
    pendingQueue.add(localId);
    
    appendMessage({ text, sender: currentUser, localId }, true);
    DOM.input.value = '';
    
    try {
        await addDoc(collection(db, "messages"), {
            text, sender: currentUser, localId, createdAt: serverTimestamp()
        });
    } catch (err) {
        console.error("Transmission Failed", err);
    }
});

setTheme(currentUser);
