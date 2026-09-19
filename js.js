import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
    'Observer': { color: '#ffffff', shadow: 'rgba(255, 255, 255, 0.3)', avatar: '👁️' },
    'Max': { color: '#ff003c', shadow: 'rgba(255, 0, 60, 0.3)', avatar: '📇' },  
    'Jeanette': { color: '#ff1493', shadow: 'rgba(255, 20, 147, 0.3)', avatar: '📸' }, 
    'Magnus': { color: '#ffee00', shadow: 'rgba(255, 238, 0, 0.3)', avatar: '💀' },  
    'Asya': { color: '#00e5ff', shadow: 'rgba(0, 229, 255, 0.3)', avatar: '📻' },  
    'Alexandria': { color: '#9d00ff', shadow: 'rgba(157, 0, 255, 0.3)', avatar: '👑' },  
    'Fitz': { color: '#00ff66', shadow: 'rgba(0, 255, 102, 0.3)', avatar: '⚗️' }   
};

const IMPACT_WORDS = ['NAT20', 'I cast shatter', 'six seven', '67', 'Cata-COOMs!', 'I got this-FAHHH', 'FIREBALL!', 'Denpa-denpa'];
let currentUser = DOM.select.value;
let lastSender = 'Observer'; 
const pendingQueue = new Set();

function setTheme(userName) {
    const theme = THEMES[userName] || THEMES['Observer'];
    const root = document.documentElement;
    root.style.setProperty('--current-user-color', theme.color);
    root.style.setProperty('--current-user-shadow', theme.shadow);
    document.querySelector('.avatar-icon').textContent = theme.avatar;
}

let isTicking = false;
let targetTilt = { x: 0, y: 0 };
let currentTilt = { x: 0, y: 0 };

function animateTilt() {
    currentTilt.x += (targetTilt.x - currentTilt.x) * 0.15;
    currentTilt.y += (targetTilt.y - currentTilt.y) * 0.15;
    
    // Harder, sharper 3D skew to fit the new UI block
    DOM.container.style.transform = `
        rotateY(${currentTilt.x}deg) 
        rotateX(${currentTilt.y}deg)
        translateZ(20px)
    `;
    requestAnimationFrame(animateTilt);
}
requestAnimationFrame(animateTilt);

document.addEventListener('mousemove', (e) => {
    if (!isTicking) {
        requestAnimationFrame(() => {
            const { innerWidth, innerHeight } = window;
            targetTilt.x = ((e.clientX / innerWidth) - 0.5) * 8; 
            targetTilt.y = ((e.clientY / innerHeight) - 0.5) * -8;
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
    setTimeout(() => DOM.speedLines.classList.remove('active'), 300);

    // Fragments snapping sharply instead of floating comics
    for (let i = 0; i < 4; i++) {
        const shard = document.createElement('div');
        shard.className = 'comic-shard';
        shard.textContent = IMPACT_WORDS[Math.floor(Math.random() * IMPACT_WORDS.length)];
        
        shard.style.left = `${sourceX}px`;
        shard.style.top = `${sourceY}px`;
        shard.style.setProperty('--tx', `${(Math.random() - 0.5) * 300}px`);
        shard.style.setProperty('--ty', `${(Math.random() - 0.5) * 300 - 100}px`);
        
        // Hard angles only
        const angles = [-15, -10, 10, 15, 20, -20];
        shard.style.setProperty('--rot', `${angles[Math.floor(Math.random() * angles.length)]}deg`);
        
        DOM.particleStage.appendChild(shard);
        setTimeout(() => shard.remove(), 500);
    }
}

function appendMessage(msg, isNew = false) {
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
    
    DOM.messages.appendChild(msgDiv);
    
    if (isNew && isMe) {
        const rect = DOM.form.querySelector('.send-btn').getBoundingClientRect();
        triggerFX(rect.left, rect.top);
    }   
    
    DOM.messages.scrollTo({
        top: DOM.messages.scrollHeight,
        behavior: 'smooth'
    });
}

DOM.select.addEventListener('change', (e) => {
    currentUser = e.target.value;
    
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
    DOM.messages.scrollTo({
        top: DOM.messages.scrollHeight,
        behavior: 'smooth'
    });
});

const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const data = change.doc.data();
            lastSender = data.sender;
            
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
