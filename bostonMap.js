/**
 * Boston Tactical Map Module
 * Initializes only while the Terminal tab is active. Leaflet has no animation
 * loop while idle; switching to Combat explicitly stops movement and pending
 * UI timers so the hidden map does no recurring work.
 */

const BOSTON_COORDS = [42.3601, -71.0589];
const LANDMARKS = [
    { name: "Boston Common / Hub", coords: [42.3550, -71.0656], desc: "Historical center & rally point" },
    { name: "Fenway Park", coords: [42.3467, -71.0972], desc: "West Sector outpost" },
    { name: "TD Garden", coords: [42.3662, -71.0621], desc: "North Station transit node" },
    { name: "Faneuil Hall / Quincy Mkt", coords: [42.3600, -71.0560], desc: "Downtown commercial district" },
    { name: "Boston Harbor / Seaport", coords: [42.3519, -71.0469], desc: "Docks & Tech district" },
    { name: "Harvard Square / River", coords: [42.3736, -71.1190], desc: "University research corridor" }
];

let map = null;
let telemetryTimer = 0;
let invalidateTimer = 0;
const terminalActive = () => !document.body.classList.contains('combat-screen-active');

export function initBostonMap() {
    if (map || !terminalActive()) return;
    const mapEl = document.getElementById('bostonMap');
    if (!mapEl || typeof L === 'undefined') return;

    map = L.map('bostonMap', {
        center: BOSTON_COORDS,
        zoom: 13,
        zoomControl: false,
        zoomAnimation: true,
        fadeAnimation: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd', maxZoom: 19, updateWhenIdle: true, keepBuffer: 1
    }).addTo(map);

    const landmarkIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div class="pin-marker"><span>📍</span></div>`,
        iconSize: [30, 30], iconAnchor: [15, 15]
    });

    LANDMARKS.forEach(item => {
        L.marker(item.coords, { icon: landmarkIcon }).addTo(map).bindPopup(`
            <div class="map-popup">
                <strong>${item.name}</strong>
                <p>${item.desc}</p>
                <small>COORDS: ${item.coords[0].toFixed(4)}, ${item.coords[1].toFixed(4)}</small>
            </div>
        `);
    });

    telemetryTimer = setTimeout(() => {
        if (!terminalActive()) return;
        const telemetryEl = document.getElementById('mapTelemetry');
        if (telemetryEl) {
            telemetryEl.textContent = 'MAPS APP // LOCATION BOTON';
            telemetryEl.style.color = 'var(--current-user-color)';
        }
    }, 1200);
    invalidateTimer = setTimeout(() => { if (terminalActive()) map?.invalidateSize(); }, 250);
}

function suspendMap() {
    clearTimeout(telemetryTimer); clearTimeout(invalidateTimer);
    telemetryTimer = invalidateTimer = 0;
    try { map?.stop(); map?.closePopup(); } catch { /* Leaflet may be mid-init */ }
}
function resumeMap() {
    if (!map) initBostonMap();
    requestAnimationFrame(() => { if (terminalActive()) map?.invalidateSize(); });
}

window.addEventListener('soulseekers:viewchange', event => {
    if (event.detail?.view === 'combat') suspendMap();
    else resumeMap();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { if (terminalActive()) initBostonMap(); }, { once: true });
} else if (terminalActive()) initBostonMap();
