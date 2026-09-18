/**
 * YouTube Music & Visualizer Engine
 */

let player = null;
let isPlaying = false;
let animFrameId = null;

// Preset playlist (supports pasting any YouTube Video ID or URL)
const PLAYLIST = [
    { title: "- - - - - -", artist: "N/A", id: "tk2eUGISZpk" },
];
let currentTrackIdx = 0;

export function initMusicPlayer() {
    loadYouTubeAPI();
    initVisualizerCanvas();
    setupControls();
    loadTrack(PLAYLIST[currentTrackIdx]);
}

function loadYouTubeAPI() {
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
        player = new YT.Player('ytPlayerFrame', {
            height: '0',
            width: '0',
            videoId: PLAYLIST[currentTrackIdx].id,
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'disablekb': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    };
}

function onPlayerReady(event) {
    stopVisualizerLoop();
}

function onPlayerStateChange(event) {
    const coverContainer = document.querySelector('.cover-art-container');
    
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        document.getElementById('playPauseBtn').textContent = '❚❚ PAUSE';
        coverContainer?.classList.add('active-play'); // Starts the pulse
        startVisualizerLoop();
    } else {
        isPlaying = false;
        document.getElementById('playPauseBtn').textContent = '▶ PLAY';
        coverContainer?.classList.remove('active-play'); // Stops the pulse
        stopVisualizerLoop();
    }
}

function loadTrack(track) {
    const titleEl = document.getElementById('musicTitle');
    const artistEl = document.getElementById('musicArtist');
    const coverEl = document.getElementById('musicCover');

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    
    // YouTube Cover Art (hqdefault thumbnail)
    if (coverEl) {
        coverEl.src = `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;
    }

    if (player && player.loadVideoById) {
        player.loadVideoById(track.id);
        player.playVideo();
    }
}

function setupControls() {
    const playBtn = document.getElementById('playPauseBtn');
    const nextBtn = document.getElementById('nextTrackBtn');
    const urlInput = document.getElementById('ytUrlInput');
    const loadUrlBtn = document.getElementById('loadUrlBtn');

    playBtn?.addEventListener('click', () => {
        if (!player) return;
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });

    nextBtn?.addEventListener('click', () => {
        currentTrackIdx = (currentTrackIdx + 1) % PLAYLIST.length;
        loadTrack(PLAYLIST[currentTrackIdx]);
    });

    loadUrlBtn?.addEventListener('click', () => {
        const val = urlInput.value.trim();
        const videoId = extractYouTubeId(val);
        if (videoId) {
            loadTrack({ title: "Custom YouTube Audio", artist: "Direct Stream", id: videoId });
            urlInput.value = '';
        } else {
            alert('Invalid YouTube URL or Video ID');
        }
    });
}

function extractYouTubeId(url) {
    if (url.length === 11) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// -------------------------------------------------------------
// Canvas Audio Frequency Spectrum Visualizer ("The Moving Thing")
// -------------------------------------------------------------
let canvas, ctx;
const BAR_COUNT = 32;
const bars = Array.from({ length: BAR_COUNT }, () => ({
    height: 4,
    target: 4,
    speed: 0.1
}));

function initVisualizerCanvas() {
    canvas = document.getElementById('visualizerCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio || 300;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio || 80;
}

function startVisualizerLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    function render() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--current-user-color').trim() || '#ff003c';
        const barWidth = (canvas.width / BAR_COUNT) - 3;

        for (let i = 0; i < BAR_COUNT; i++) {
            const bar = bars[i];
            
            if (isPlaying) {
                // Generate frequency peaks based on beats and audio harmonics
                if (Math.random() > 0.6) {
                    const waveBoost = Math.sin(Date.now() * 0.005 + i * 0.3) * 0.4 + 0.6;
                    bar.target = (Math.random() * (canvas.height * 0.75) + (canvas.height * 0.15)) * waveBoost;
                }
            } else {
                bar.target = 4; // Idle rest state
            }

            // Smooth interpolation (lerp)
            bar.height += (bar.target - bar.height) * 0.25;

            const x = i * (barWidth + 3);
            const y = canvas.height - bar.height;

            // Bar Gradient
            const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
            grad.addColorStop(0, accentColor);
            grad.addColorStop(1, '#ffffff');

            ctx.fillStyle = grad;
            ctx.shadowColor = accentColor;
            ctx.shadowBlur = isPlaying ? 10 : 2;
            ctx.fillRect(x, y, barWidth, bar.height);

            // Cap head
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, y - 3, barWidth, 2);
        }

        animFrameId = requestAnimationFrame(render);
    }
    render();
}

function stopVisualizerLoop() {
    // Let bars animate down to resting state
    setTimeout(() => {
        if (!isPlaying && animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
            // Draw clean resting line
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, 600);
}

// Auto boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicPlayer);
} else {
    initMusicPlayer();
}