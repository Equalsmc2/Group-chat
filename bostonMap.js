/**
 * Boston Tactical Map Module
 * Displays Boston landmarks + Geolocation GPS Tracker
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

export function initBostonMap() {
    const mapEl = document.getElementById('bostonMap');
    if (!mapEl) return;

    // Initialize Leaflet Map (Starts zoomed out, then flies in)
    const map = L.map('bostonMap', {
        center: BOSTON_COORDS,
        zoom: 9, // Start further out
        zoomControl: false
    });

    // Animate zoom to tactical level
    setTimeout(() => {
        map.flyTo(BOSTON_COORDS, 13, { duration: 1.5, easeLinearity: 0.2 });
    }, 500);

    // Dark cyberpunk/tactical map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Custom tactical marker icon for landmarks
    const landmarkIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div class="pin-marker"><span>📍</span></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    // Populate Boston Landmarks
    LANDMARKS.forEach(item => {
        L.marker(item.coords, { icon: landmarkIcon })
            .addTo(map)
            .bindPopup(`
                <div class="map-popup">
                    <strong>${item.name}</strong>
                    <p>${item.desc}</p>
                    <small>COORDS: ${item.coords[0].toFixed(4)}, ${item.coords[1].toFixed(4)}</small>
                </div>
            `);
    });

// Simulated Telemetry Update (Replaces IRL Geolocation)
    setTimeout(() => {
        const telemetryEl = document.getElementById('mapTelemetry');
        if (telemetryEl) {
            telemetryEl.textContent = `MAPS APP // LOCATION BOTON`;
            telemetryEl.style.color = 'var(--current-user-color)';
        }
    }, 2000); // Updates the text 2 seconds after the map fly-in

    // Refresh size after rendering into glass flexbox
    setTimeout(() => map.invalidateSize(), 300);
}

// Auto-boot if imported directly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBostonMap);
} else {
    initBostonMap();
}