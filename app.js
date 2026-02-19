// ============================================================================
// StarGo Frontend - Cesium Satellite Visualization
// ============================================================================

// Configuration
const CONFIG = {
    backendUrl: 'http://127.0.0.1:8080',        // Default backend URL
    authToken: null,                             // Optional auth token
    keyframeStep: 5,                             // seconds (matches backend)
    horizon: 600,                                // seconds (matches backend)
    maxKeyframes: 150,                           // Keep last N keyframes in memory
    reconnectBaseDelay: 1000,                    // ms, exponential backoff
    reconnectMaxDelay: 30000,                    // ms, max retry delay
    cesiumToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNjBlM2ViMC0zOTZlLTRhNDQtOTU3Yy02MmJmM2RmMjA5NTQiLCJpZCI6Mzg3Njc1LCJpYXQiOjE3NzA2OTEzMTJ9.r13dyNCaPXG-HdMPYAhRNfZ0vbkt-TA4wwBLO47Z-rI',

    // Full orbit settings
    orbitHorizon: 5400,                          // 90 minutes (full LEO orbit)
    orbitStep: 5,                                // seconds between orbit positions
    orbitCacheTTL: 300000,                       // 5 minutes cache TTL (ms)

    // Performance optimizations
    enableFrustumCulling: true,                  // Only update visible satellites
    updateBatchSize: 500,                        // Update N satellites per frame (rotating batches)
    orbitCallbackThrottle: 10,                   // Update orbit lines every N frames (increased to reduce flicker)

    // Pass prediction defaults
    passPrediction: {
        defaultLat: null,                        // Will use geolocation
        defaultLng: null,
        defaultAltitude: 0,                      // meters above sea level
        defaultMinElevation: 10,                 // degrees
        defaultHorizonHours: 24,                 // prediction window
        defaultMaxPasses: 50                     // max passes to return
    },

    // Visual styling (Phase 1 + Phase 2)
    visual: {
        orbit: {
            // Phase 2: K-segment gradient (replaces Phase 1 near/far split)
            gradientSegments: 12,                // Gradient chunks for selected orbit
            headWidth: 4.0,                      // Width at satellite head (px)
            tailWidth: 0.8,                      // Width at orbit tail (px)
            headGlow: 0.5,                       // Glow power at satellite head
            tailGlow: 0.06,                      // Glow power at orbit tail
            headAlpha: 0.9,                      // Alpha at satellite head
            tailAlpha: 0.12,                     // Alpha at orbit tail
            headOutline: true,                   // Use outline material on head segment
            headOutlineWidth: 1.5,               // Outline width (px)
            headOutlineColor: [1, 1, 1, 0.35],   // Outline RGBA
            // Phase 2: depth-based scaling (selected-only)
            depthScaling: true,                  // Enable camera-distance width scaling
            depthNearDist: 500000,               // meters — full size below this
            depthFarDist: 15000000,              // meters — minimum size above this
            depthMinScale: 0.4,                  // Width multiplier at far distance
            depthUpdateInterval: 15              // Recompute every N frames
        },
        groundTrack: {
            width: 4,                            // Ground track line width (px)
            glowPower: 0.25,                     // Ground track glow power
            alpha: 0.8,                          // Ground track alpha
            maxSegments: 8                       // Max color-gradient segments
        },
        pulse: {
            enabled: true,                       // Enable silhouette pulse on selected
            minSize: 1.5,                        // Silhouette min (px)
            maxSize: 3.5,                        // Silhouette max (px)
            speed: 1.8,                          // Oscillation speed (Hz)
            // Phase 2: head glow dot
            glowDot: true,                       // Soft glow dot around satellite head
            glowDotSize: 24,                     // Base pixel size
            glowDotPulseAmp: 8,                  // Size oscillation amplitude (px)
            glowDotBaseAlpha: 0.15,              // Base alpha
            glowDotPulseAlpha: 0.10              // Alpha oscillation amplitude
        },
        // Phase 3: Level of Detail
        lod: {
            enabled: true,                       // Enable distance-based LOD for orbit segments
            nearDist: 1000000,                   // meters — high detail below this
            midDist: 5000000,                    // meters — medium detail below this
            segmentsNear: 18,                    // Segment count at near distance
            segmentsMid: 12,                     // Segment count at mid distance
            segmentsFar: 6                       // Segment count at far distance
        },
        // Phase 3: Visibility gating
        visibility: {
            orbitCutoffDist: 20000000            // meters — hide orbit beyond this
        },
        // Phase 3: Trail length
        trail: {
            defaultSeconds: 5400,                // Seconds of orbit to display (90 min)
            minSeconds: 300,                     // Minimum 5 minutes
            maxSeconds: 10800                    // Maximum 3 hours
        },
        // Phase 3: Hover highlighting
        hover: {
            enabled: true,                       // Enable hover highlighting
            pickThrottle: 6,                     // Only pick every N mouse moves
            brightening: 1.6,                    // Point size multiplier on hover
            cursorPointer: true                  // Change cursor to pointer on hover
        },
        // Phase 4: Curved interpolation (selected-only, near-camera)
        curves: {
            enabled: true,
            enableDist: 2000000,                 // meters — only curve when camera closer than this
            maxResampledPoints: 384,             // max output points from Catmull-Rom
            updateEveryNFrames: 60,              // rebuild curves every N frames (~1/sec at 60fps)
            tension: 0.5                         // Catmull-Rom tension (0=Catmull-Rom, 1=tight)
        },
        // Phase 4: Time-history trail
        historyTrail: {
            enabled: true,
            defaultMinutes: 10,                  // default trail length in minutes
            options: [5, 10, 30],                // dropdown options (minutes)
            maxPoints: 600,                      // ring buffer capacity
            width: 2.0,                          // trail polyline width (px)
            alpha: 0.6,                          // trail head alpha
            fadeToAlpha: 0.05                     // trail tail alpha
        },
        // Phase 4: Uncertainty visualization
        uncertainty: {
            enabled: true,
            mode: 'simple',                      // 'simple' (dashed) or 'corridor' (offset band)
            dashLength: 16,                      // dash length for simple mode
            futureStartAlpha: 0.5,               // alpha at start of future orbit
            futureEndAlpha: 0.05,                // alpha at end of future orbit
            corridorWidthBase: 500,              // meters — corridor base half-width
            corridorGrowthRate: 0.001,           // width growth per meter along orbit
            tleEpochAgeMultiplier: 1.5,          // scale uncertainty by TLE age
            maxCorridorWidth: 50000,             // meters — cap corridor half-width
            segmentCount: 4                      // number of dashed segments in simple mode
        },
        // Phase 4: TLE staleness indicator
        staleness: {
            warnHours: 24,                       // hours — TLE becomes "warn"
            degradedHours: 72,                   // hours — TLE becomes "degraded"
            warnAlpha: 0.6,                      // orbit alpha multiplier for warn
            degradedAlpha: 0.3,                  // orbit alpha multiplier for degraded
            warnDashLength: 24,                  // dash length for warn orbits
            degradedDashLength: 12,              // dash length for degraded orbits
            showBadge: true,                     // show per-satellite staleness badge
            showGlobalIndicator: true            // show worst-case in status bar
        }
    }
};

// Global State
let viewer = null;                               // Cesium Viewer instance
let entities = new Map();                        // NORAD ID -> Cesium Entity
let keyframes = [];                              // Array of {timestamp, satellites}
let metadata = null;                             // Dataset metadata from backend
let isPlaying = true;                            // Animation state
let playbackSpeed = 1.0;                         // Playback speed multiplier
let showLabels = false;                          // Show satellite labels
let reconnectAttempts = 0;                       // Reconnection counter
let reconnectTimeout = null;                     // Reconnection timer
let eventSource = null;                          // SSE connection
let lastFrameTime = performance.now();           // For FPS calculation
let frameCount = 0;                              // For FPS calculation

// Selection & Full Orbit State
let selectedSatellites = new Set();              // Set of selected NORAD IDs
let orbitCache = new Map();                      // NORAD ID -> { positions, fetchedAt }
let fullOrbitsEnabled = true;                    // Toggle for full orbit display
let orbitEntities = new Map();                   // NORAD ID -> { segments, lodArrays, color, lodTier, fullOrbitPoints }
let orbitRefreshTimers = new Map();              // NORAD ID -> refresh interval ID

// Backend Time Sync
let backendTimeOffset = 0;                       // ms: backend_time - host_time
let backendTimeSynced = false;                   // true once we've computed offset

// Pass Prediction State
let observerLocation = null;                     // {lat, lng, altitude}
let passPredictions = [];                        // Array of pass data from backend
let selectedPass = null;                         // Currently visualized pass
let passVisualizationEntities = [];              // Cesium entities for pass visualization
let passCountdownInterval = null;                // Timer for next-pass countdown

// Performance State
let updateBatchIndex = 0;                        // For batched position updates
let frameCounter = 0;                            // For throttling (separate from FPS frameCount)
let cachedKeyframeLookup = null;                 // Cache: { prev, next, prevTime, nextTime }
let cullingVolume = null;                        // Cache: frustum culling volume (per frame)
let orbitPositionsCache = new Map();             // noradId -> { positions, lastFrame }
let scratchCartesian = new Cesium.Cartesian3();  // Reusable scratch object
let scratchBoundingSphere = new Cesium.BoundingSphere(); // Reusable scratch for frustum culling

// Phase 2 State
let headGlowEntities = new Map();               // NORAD ID -> glow dot Cesium Entity
let depthScaleCache = new Map();                 // NORAD ID -> depth scale factor (0..1)

// Phase 3 State
let hoveredSatellite = null;                     // NORAD ID of hovered satellite (or null)
let hoverPickCounter = 0;                        // Throttle counter for hover picks
let cachedEntityArray = null;                    // Cached Array.from(entities.entries())
let cachedEntityArrayDirty = true;               // True when entities Map has changed
let clickHandler = null;                         // ScreenSpaceEventHandler for clicks
let hoverHandler = null;                         // ScreenSpaceEventHandler for hover

// Orbit segment generation counter (for flicker-free rebuilds)
let orbitSegmentGeneration = 0;

// Phase 4 State
let historyTrails = new Map();                   // NORAD → { buffer[], head, count, entity }
let curvedOrbitCache = new Map();                // NORAD → { points[], frameBuilt }
let uncertaintyEntities = new Map();             // NORAD → { segments[], mode }
let satelliteTleEpochs = new Map();              // NORAD → { epochDate, ageSeconds }
let historyTrailMinutes = 10;                    // current user setting

// WASD Camera Movement + Arrow Key Rotation State
const keysPressed = {
    w: false, a: false, s: false, d: false, q: false, e: false,
    arrowleft: false, arrowright: false, arrowup: false, arrowdown: false
};
const CAMERA_MOVE_SPEED = 50000;                 // meters per frame
const CAMERA_ROTATION_SPEED = 0.02;              // radians per frame

// Helper: read an entity's current position regardless of whether
// Cesium wrapped it in a Property or it's a raw Cartesian3
function getEntityPosition(entity) {
    if (!entity || !entity.position) return null;
    if (entity.position instanceof Cesium.Cartesian3) {
        return entity.position.clone();
    }
    if (typeof entity.position.getValue === 'function') {
        const val = entity.position.getValue(Cesium.JulianDate.now());
        return val ? val.clone() : null;
    }
    return null;
}

// ============================================================================
// Initialization
// ============================================================================

function init() {
    console.log('[StarGo] Initializing...');
    
    // Set Cesium Ion token
    Cesium.Ion.defaultAccessToken = CONFIG.cesiumToken;
    
    // Create Cesium Viewer with default imagery
    viewer = new Cesium.Viewer('cesiumContainer', {
        animation: false,
        timeline: false,
        vrButton: false,
        homeButton: true,
        sceneModePicker: true,
        navigationHelpButton: false,
        baseLayerPicker: true,
        fullscreenButton: true,
        geocoder: false,
        selectionIndicator: true,    // Show selection indicator on click
        infoBox: true                // Show info box for selected entity
    });
    
    // Configure scene
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.show = true;
    viewer.scene.skyBox.show = true;
    viewer.scene.sun.show = true;
    viewer.scene.moon.show = true;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1;
    
    // Performance optimizations
    viewer.scene.fog.enabled = false;                       // Disable fog
    viewer.scene.globe.showGroundAtmosphere = false;        // Disable ground atmosphere
    viewer.scene.highDynamicRange = false;                  // Disable HDR
    viewer.scene.postProcessStages.fxaa.enabled = false;    // Disable FXAA antialiasing
    viewer.scene.globe.tileCacheSize = 100;                 // Reduce tile cache
    
    // Set initial camera position
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(0.0, 0.0, 20000000),
        orientation: {
            heading: 0.0,
            pitch: -Cesium.Math.PI_OVER_TWO,
            roll: 0.0
        }
    });
    
    // Setup UI event handlers
    setupEventHandlers();

    // Setup mini Earth navigation
    setupMiniEarthNavigation();

    // Setup satellite click handler
    setupClickHandler();
    
    // Phase 3: Setup hover handler
    setupHoverHandler();
    
    // Setup pass prediction event handlers
    setupPassEventHandlers();
    
    // Load backend URL from input field
    const backendUrlInput = document.getElementById('backendUrl');
    backendUrlInput.value = CONFIG.backendUrl;
    
    // Start animation loop
    requestAnimationFrame(animate);
    
    // Start FPS counter
    setInterval(updateFPS, 1000);
    
    // Auto-connect to backend
    connectToBackend();
    
    console.log('[StarGo] Initialization complete');
}

// ============================================================================
// Satellite Click Handler (Selection System)
// ============================================================================

function setupClickHandler() {
    if (clickHandler) clickHandler.destroy();
    clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    const handler = clickHandler;
    
    handler.setInputAction((click) => {
        const pickedObject = viewer.scene.pick(click.position);
        
        // Phase 3: Click empty space → clear camera follow (keep selection)
        if (!Cesium.defined(pickedObject) || !Cesium.defined(pickedObject.id)) {
            if (viewer.trackedEntity) {
                viewer.trackedEntity = undefined;
            }
            return;
        }
        
        const entityId = typeof pickedObject.id === 'string'
            ? pickedObject.id
            : pickedObject.id.id;
        
        // Click on satellite dot/model → toggle selection
        if (entityId && entityId.startsWith('sat-')) {
            const noradId = parseInt(entityId.replace('sat-', ''), 10);
            if (!isNaN(noradId)) {
                clearHover();
                toggleSatelliteSelection(noradId);
            }
        }
        // Phase 3: Click on orbit line → follow that satellite
        else if (entityId && entityId.startsWith('orbit-seg-')) {
            const match = entityId.match(/^orbit-seg-(\d+)-/);
            if (match) {
                const noradId = parseInt(match[1], 10);
                const satEntity = entities.get(noradId);
                if (satEntity) {
                    viewer.trackedEntity = satEntity;
                }
            }
        }
        // Phase 3: Click on glow dot → toggle selection
        else if (entityId && entityId.startsWith('head-glow-')) {
            const noradId = parseInt(entityId.replace('head-glow-', ''), 10);
            if (!isNaN(noradId)) {
                clearHover();
                toggleSatelliteSelection(noradId);
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

// ============================================================================
// Phase 3: Hover Highlighting
// ============================================================================

function setupHoverHandler() {
    if (!CONFIG.visual.hover.enabled) return;
    if (hoverHandler) hoverHandler.destroy();
    hoverHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    const handler = hoverHandler;
    
    handler.setInputAction((movement) => {
        hoverPickCounter++;
        if (hoverPickCounter % CONFIG.visual.hover.pickThrottle !== 0) return;
        
        const picked = viewer.scene.pick(movement.endPosition);
        let noradId = null;
        
        if (Cesium.defined(picked) && Cesium.defined(picked.id)) {
            const eid = typeof picked.id === 'string' ? picked.id : picked.id.id;
            if (eid && eid.startsWith('sat-')) {
                noradId = parseInt(eid.replace('sat-', ''), 10);
            } else if (eid && eid.startsWith('orbit-seg-')) {
                const m = eid.match(/^orbit-seg-(\d+)-/);
                if (m) noradId = parseInt(m[1], 10);
            } else if (eid && eid.startsWith('head-glow-')) {
                noradId = parseInt(eid.replace('head-glow-', ''), 10);
            }
        }
        
        // Don't hover already-selected satellites
        if (noradId !== null && selectedSatellites.has(noradId)) noradId = null;
        if (noradId === hoveredSatellite) return;
        
        clearHover();
        if (noradId !== null) applyHover(noradId);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

function applyHover(noradId) {
    hoveredSatellite = noradId;
    const entity = entities.get(noradId);
    if (!entity || !entity.point) return;
    
    const hCfg = CONFIG.visual.hover;
    const isISS = parseInt(noradId) === 25544;
    const baseSize = isISS ? 14 : 5;
    entity.point.pixelSize = Math.round(baseSize * hCfg.brightening);
    entity.point.outlineWidth = (isISS ? 3 : 1) + 1;
    
    if (hCfg.cursorPointer) {
        viewer.scene.canvas.style.cursor = 'pointer';
    }
}

function clearHover() {
    if (hoveredSatellite === null) return;
    
    // Only restore if satellite was NOT selected while hovered
    if (!selectedSatellites.has(hoveredSatellite)) {
        const entity = entities.get(hoveredSatellite);
        if (entity && entity.point) {
            const isISS = parseInt(hoveredSatellite) === 25544;
            entity.point.pixelSize = isISS ? 14 : 5;
            entity.point.outlineWidth = isISS ? 3 : 1;
        }
    }
    
    hoveredSatellite = null;
    viewer.scene.canvas.style.cursor = 'default';
}

// ============================================================================
// Selection Management
// ============================================================================

function toggleSatelliteSelection(noradId) {
    if (selectedSatellites.has(noradId)) {
        deselectSatellite(noradId);
    } else {
        selectSatellite(noradId);
    }
    updateSelectionUI();
}

function selectSatellite(noradId) {
    selectedSatellites.add(noradId);
    
    // Swap point → 3D model for selected satellite (with optional pulse)
    const entity = entities.get(noradId);
    if (entity) {
        // Hide the point dot
        if (entity.point) entity.point.show = false;
        
        // Pulse silhouette size via lightweight CallbackProperty
        const ps = CONFIG.visual.pulse;
        const silhouetteProp = ps.enabled
            ? new Cesium.CallbackProperty(() => {
                const t = performance.now() / 1000;
                const mid = (ps.minSize + ps.maxSize) / 2;
                const amp = (ps.maxSize - ps.minSize) / 2;
                return mid + amp * Math.sin(t * ps.speed * Math.PI * 2);
            }, false)
            : 2.0;
        
        // Add 3D model — ISS gets ISS model, others get Starlink model
        const isISS = parseInt(noradId) === 25544 || noradId === 25544;
        entity.model = {
            uri: isISS
                ? './models/international_space_station_iss.glb'
                : './models/starlink_spacex_satellite.glb',
            minimumPixelSize: isISS ? 64 : 48,
            maximumScale: 200000,
            scale: 1,
            show: true,
            color: isISS ? Cesium.Color.WHITE : Cesium.Color.CYAN,
            colorBlendMode: Cesium.ColorBlendMode.HIGHLIGHT,
            colorBlendAmount: isISS ? 0.2 : 0.3,
            silhouetteColor: isISS ? Cesium.Color.CYAN : Cesium.Color.WHITE,
            silhouetteSize: silhouetteProp
        };
    }
    
    // Phase 2: Head glow dot — soft pulsing halo around the satellite
    const pg = CONFIG.visual.pulse;
    if (pg.glowDot && entity) {
        const glowColor = Cesium.Color.CYAN.clone();
        glowColor.alpha = pg.glowDotBaseAlpha;
        
        const glowEntity = viewer.entities.add({
            id: `head-glow-${noradId}`,
            position: new Cesium.ReferenceProperty(
                viewer.entities, `sat-${noradId}`, ['position']
            ),
            point: {
                pixelSize: new Cesium.CallbackProperty(() => {
                    const t = performance.now() / 1000;
                    return pg.glowDotSize + pg.glowDotPulseAmp *
                        Math.sin(t * pg.speed * Math.PI * 2);
                }, false),
                color: new Cesium.CallbackProperty(() => {
                    const t = performance.now() / 1000;
                    glowColor.alpha = pg.glowDotBaseAlpha + pg.glowDotPulseAlpha *
                        Math.sin(t * pg.speed * Math.PI * 2 + Math.PI * 0.5);
                    return glowColor;
                }, false),
                outlineWidth: 0,
                heightReference: Cesium.HeightReference.NONE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
        headGlowEntities.set(noradId, glowEntity);
    }
    
    console.log(`[Selection] Selected NORAD ${noradId}`);
    
    // Track the satellite with camera
    viewer.trackedEntity = entity;
    
    // Fetch full orbit if enabled
    if (fullOrbitsEnabled) {
        fetchFullOrbit(noradId);
    }

    // Phase 4: Initialize history trail
    initHistoryTrail(noradId);

    // Phase 4: Show/hide Phase 4 controls
    updatePhase4ControlsVisibility();
}

// Search for satellite by NORAD ID
function searchAndSelectSatellite(noradId) {
    const searchStatus = document.getElementById('searchStatus');
    
    // Validate input
    if (!noradId || isNaN(noradId)) {
        if (searchStatus) {
            searchStatus.textContent = 'Please enter a valid NORAD ID';
            searchStatus.style.color = '#ff6b6b';
        }
        return false;
    }
    
    const noradNum = parseInt(noradId, 10);
    
    // Check if satellite exists in current dataset
    if (!entities.has(noradNum)) {
        if (searchStatus) {
            searchStatus.textContent = `NORAD ${noradNum} not found in current dataset`;
            searchStatus.style.color = '#ff6b6b';
        }
        return false;
    }
    
    // Select the satellite if not already selected
    if (!selectedSatellites.has(noradNum)) {
        selectSatellite(noradNum);
        updateSelectionUI();
    }
    
    // Fly to the satellite
    const entity = entities.get(noradNum);
    if (entity && viewer) {
        viewer.flyTo(entity, {
            duration: 2.0,
            offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-45), 1000000)
        });
    }
    
    if (searchStatus) {
        searchStatus.textContent = `Found and selected NORAD ${noradNum}`;
        searchStatus.style.color = '#51cf66';
        
        // Clear status after 3 seconds
        setTimeout(() => {
            searchStatus.textContent = '';
        }, 3000);
    }
    
    console.log(`[Search] Found and selected NORAD ${noradNum}`);
    return true;
}

function deselectSatellite(noradId) {
    selectedSatellites.delete(noradId);
    
    // Swap 3D model → point for deselected satellite
    const entity = entities.get(noradId);
    if (entity) {
        // Remove 3D model
        if (entity.model) entity.model.show = false;
        entity.model = undefined;
        // Restore the point dot (with special styling for ISS)
        if (entity.point) {
            const isISS = parseInt(noradId) === 25544 || noradId === 25544;
            entity.point.show = true;
            entity.point.pixelSize = isISS ? 14 : 5;
            entity.point.color = isISS ? Cesium.Color.RED : Cesium.Color.YELLOW;
            entity.point.outlineColor = isISS ? Cesium.Color.WHITE : Cesium.Color.BLACK;
            entity.point.outlineWidth = isISS ? 3 : 1;
        }
    }
    
    // Phase 2: Remove head glow dot
    const glowEntity = headGlowEntities.get(noradId);
    if (glowEntity) {
        viewer.entities.remove(glowEntity);
        headGlowEntities.delete(noradId);
    }
    
    // Stop tracking if this was the tracked satellite
    if (viewer.trackedEntity === entity) {
        viewer.trackedEntity = undefined;
    }
    
    // Remove full orbit polyline
    removeFullOrbit(noradId);

    // Phase 4: Remove history trail and uncertainty
    removeHistoryTrail(noradId);
    removeUncertaintyViz(noradId);

    // Phase 4: Show/hide Phase 4 controls
    updatePhase4ControlsVisibility();

    console.log(`[Selection] Deselected NORAD ${noradId}`);
}

function clearAllSelections() {
    viewer.trackedEntity = undefined;
    const selected = Array.from(selectedSatellites);
    for (const noradId of selected) {
        deselectSatellite(noradId);
    }
    updateSelectionUI();
}

// ============================================================================
// Full Orbit Fetching & Display
// ============================================================================

function fetchFullOrbit(noradId) {
    // Check cache first
    const cached = orbitCache.get(noradId);
    const now = Date.now();
    
    if (cached && (now - cached.fetchedAt < CONFIG.orbitCacheTTL)) {
        console.log(`[Orbit] Using cached orbit for NORAD ${noradId}`);
        displayFullOrbit(noradId, cached.positions);
        return;
    }
    
    // Show loading state in selection list
    updateOrbitStatus(noradId, 'loading');
    
    const url = `${CONFIG.backendUrl}/api/v1/propagate/${noradId}?horizon=${CONFIG.orbitHorizon}&step=${CONFIG.orbitStep}`;
    
    console.log(`[Orbit] Fetching full orbit for NORAD ${noradId}...`);
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                return response.text().then(body => {
                    // Try to parse as JSON for structured errors
                    try {
                        const err = JSON.parse(body);
                        throw new Error(err.error || `HTTP ${response.status}`);
                    } catch (parseErr) {
                        // Not JSON — use status code
                        if (response.status === 404) {
                            throw new Error('Endpoint not found (backend needs /api/v1/propagate)');
                        }
                        throw new Error(`HTTP ${response.status}: ${body.substring(0, 100)}`);
                    }
                });
            }
            return response.json();
        })
        .then(data => {
            console.log(`[Orbit] Received ${data.count} positions for NORAD ${noradId}`);
            
            // Cache the orbit data
            orbitCache.set(noradId, {
                positions: data.positions,
                fetchedAt: now
            });
            
            // Display the orbit (only if satellite is still selected)
            if (selectedSatellites.has(noradId)) {
                displayFullOrbit(noradId, data.positions);
                updateOrbitStatus(noradId, 'loaded');
            }
        })
        .catch(error => {
            console.error(`[Orbit] Failed to fetch orbit for NORAD ${noradId}:`, error);
            updateOrbitStatus(noradId, 'error', error.message);
        });
}

function displayFullOrbit(noradId, positions) {
    // Clear caches and timers but keep old segments visible until rebuild swaps them out.
    // rebuildOrbitSegments will handle the flicker-free swap of old → new segments.
    orbitPositionsCache.delete(noradId);
    depthScaleCache.delete(noradId);
    curvedOrbitCache.delete(noradId);
    removeUncertaintyViz(noradId);
    const existingTimer = orbitRefreshTimers.get(noradId);
    if (existingTimer) {
        clearInterval(existingTimer);
        orbitRefreshTimers.delete(noradId);
    }
    
    if (!positions || positions.length < 2) {
        console.warn(`[Orbit] Not enough positions for NORAD ${noradId}`);
        removeFullOrbit(noradId);
        return;
    }

    if (!positions[0].p || !Array.isArray(positions[0].p) || positions[0].p.length !== 3) {
        console.error(`[Orbit] Invalid position format. Expected {p: [x,y,z]}, got:`, positions[0]);
        removeFullOrbit(noradId);
        return;
    }
    
    const entity = entities.get(noradId);
    if (!entity) {
        console.warn(`[Orbit] Entity not found for NORAD ${noradId}`);
        removeFullOrbit(noradId);
        return;
    }

    // Get satellite's current position from keyframe interpolation
    const satPos = getEntityPosition(entity);
    if (!satPos) {
        console.error(`[Orbit] Cannot get current position for NORAD ${noradId}`);
        removeFullOrbit(noradId);
        return;
    }
    
    // --- Diagnostic: check raw orbit data ---
    const firstRaw = positions[0].p;
    const rawMagnitude = Math.sqrt(firstRaw[0]**2 + firstRaw[1]**2 + firstRaw[2]**2);
    const satMagnitude = Cesium.Cartesian3.magnitude(satPos);
    console.log(`[Orbit DIAG] Satellite ECEF magnitude: ${(satMagnitude/1000).toFixed(1)} km`);
    console.log(`[Orbit DIAG] First orbit point raw magnitude: ${(rawMagnitude/1000).toFixed(1)} km`);
    console.log(`[Orbit DIAG] Raw values: [${firstRaw[0].toFixed(1)}, ${firstRaw[1].toFixed(1)}, ${firstRaw[2].toFixed(1)}]`);
    console.log(`[Orbit DIAG] Sat values: [${satPos.x.toFixed(1)}, ${satPos.y.toFixed(1)}, ${satPos.z.toFixed(1)}]`);
    if (positions[0].t) {
        console.log(`[Orbit DIAG] First position timestamp: ${positions[0].t}`);
    }
    
    // Check if raw magnitude looks like km instead of meters (SGP4 outputs km)
    const likelyKm = rawMagnitude < 100000; // < 100 km → it's actually in km not meters
    if (likelyKm) {
        console.warn(`[Orbit DIAG] ⚠️ Raw magnitude ${rawMagnitude.toFixed(1)} looks like KILOMETERS, not meters. Backend may be returning km.`);
    }
    
    // --- Auto-detect TEME vs ECEF ---
    // Compare raw orbit positions to satellite's current ECEF position.
    // If they're far apart, try TEME→ECEF conversion to see if it closes the gap.
    let needsTemeConversion = false;
    let needsKmToMeters = likelyKm;
    
    if (satPos) {
        // If units are in km, scale up for comparison
        const scale = likelyKm ? 1000 : 1;
        const firstOrbitPos = new Cesium.Cartesian3(
            positions[0].p[0] * scale, positions[0].p[1] * scale, positions[0].p[2] * scale
        );
        const rawDistance = Cesium.Cartesian3.distance(satPos, firstOrbitPos);
        console.log(`[Orbit DIAG] Distance sat→orbit[0] (${likelyKm ? 'after km→m' : 'raw'}): ${(rawDistance/1000).toFixed(1)} km`);
        
        if (rawDistance > 100000) { // > 100 km apart → likely wrong frame
            const backendNowMs = Date.now() + backendTimeOffset;
            const testTime = positions[0].t
                ? Cesium.JulianDate.fromIso8601(positions[0].t)
                : Cesium.JulianDate.fromDate(new Date(backendNowMs));
            const temeToFixed = Cesium.Transforms.computeTemeToPseudoFixedMatrix(testTime);
            
            if (temeToFixed) {
                const converted = Cesium.Matrix3.multiplyByVector(
                    temeToFixed, firstOrbitPos, new Cesium.Cartesian3()
                );
                const convertedDist = Cesium.Cartesian3.distance(satPos, converted);
                console.log(`[Orbit DIAG] Distance sat→orbit[0] after TEME→ECEF: ${(convertedDist/1000).toFixed(1)} km`);
                
                if (convertedDist < rawDistance) {
                    needsTemeConversion = true;
                    console.log(`[Orbit] TEME→ECEF conversion enabled for NORAD ${noradId}`);
                }
            }
        } else {
            console.log(`[Orbit DIAG] Positions already close — no TEME conversion needed`);
        }
    }
    
    // --- Convert all orbit positions to ECEF Cartesian3 array ---
    const backendNowMs = Date.now() + backendTimeOffset;
    const orbitPoints = [];
    const scale = needsKmToMeters ? 1000 : 1;
    
    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        if (!pos.p || !Array.isArray(pos.p) || pos.p.length !== 3) continue;
        
        const px = pos.p[0] * scale;
        const py = pos.p[1] * scale;
        const pz = pos.p[2] * scale;
        
        // Skip NaN, Infinity, or zero-magnitude positions
        if (!isFinite(px) || !isFinite(py) || !isFinite(pz)) continue;
        if (px === 0 && py === 0 && pz === 0) continue;
        
        let cartesian = new Cesium.Cartesian3(px, py, pz);
        
        if (needsTemeConversion) {
            const posTime = pos.t
                ? Cesium.JulianDate.fromIso8601(pos.t)
                : Cesium.JulianDate.fromDate(new Date(backendNowMs + i * CONFIG.orbitStep * 1000));
            
            const temeToFixed = Cesium.Transforms.computeTemeToPseudoFixedMatrix(posTime);
            if (temeToFixed) {
                cartesian = Cesium.Matrix3.multiplyByVector(
                    temeToFixed, cartesian, new Cesium.Cartesian3()
                );
            }
        }
        
        // Final NaN check after conversion
        if (!isFinite(cartesian.x) || !isFinite(cartesian.y) || !isFinite(cartesian.z)) continue;
        
        orbitPoints.push(cartesian);
    }
    
    if (orbitPoints.length < 2) {
        console.error(`[Orbit] Not enough valid positions after conversion`);
        removeFullOrbit(noradId);
        return;
    }
    
    // --- Phase 3: LOD-aware gradient orbit with trail length ---
    const color = Cesium.Color.GREEN; // Always use solid green for orbit lines
    
    // Apply trail length limit
    const trailCfg = CONFIG.visual.trail;
    const maxTrailPts = Math.ceil(trailCfg.defaultSeconds / CONFIG.orbitStep);
    const trailPoints = orbitPoints.length <= maxTrailPts
        ? orbitPoints
        : orbitPoints.slice(0, maxTrailPts);
    
    // Precompute segment arrays for all LOD tiers (one-time per orbit load)
    const vs = CONFIG.visual.orbit;
    const lodCfg = CONFIG.visual.lod;
    let lodArrays;
    if (lodCfg.enabled) {
        lodArrays = {
            near: precomputeSegmentArrays(trailPoints, lodCfg.segmentsNear),
            mid:  precomputeSegmentArrays(trailPoints, lodCfg.segmentsMid),
            far:  precomputeSegmentArrays(trailPoints, lodCfg.segmentsFar)
        };
    } else {
        const defaultArrays = precomputeSegmentArrays(trailPoints, vs.gradientSegments);
        lodArrays = { near: defaultArrays, mid: defaultArrays, far: defaultArrays };
    }
    
    // Determine initial LOD tier from current camera distance
    const lodSatPos = getEntityPosition(entity);
    let tier = 'mid';
    if (lodCfg.enabled && lodSatPos) {
        const dist = Cesium.Cartesian3.distance(viewer.camera.positionWC, lodSatPos);
        if (dist < lodCfg.nearDist) tier = 'near';
        else if (dist >= lodCfg.midDist) tier = 'far';
    }
    
    // Build segment entities for the current tier
    rebuildOrbitSegments(noradId, lodArrays, color, tier, orbitPoints);

    // Phase 4: Apply staleness styling if TLE is old
    applyStalenessToOrbit(noradId);

    // Phase 4: Build uncertainty visualization on future portion of orbit
    const uncCfg = CONFIG.visual.uncertainty;
    const uncCheckbox = document.getElementById('uncertaintyCheckbox');
    if (uncCfg.enabled && uncCheckbox && uncCheckbox.checked) {
        // Use second half of orbit points as "future"
        const futureStart = Math.floor(orbitPoints.length / 2);
        const futurePoints = orbitPoints.slice(futureStart);
        const tleAge = metadata ? metadata.tleAgeSeconds : 0;
        buildUncertaintyViz(noradId, futurePoints, color, tleAge);
    }

    // --- Auto-refresh orbit data every 60s ---
    const refreshTimer = setInterval(() => {
        if (!selectedSatellites.has(noradId) || !fullOrbitsEnabled) {
            clearInterval(refreshTimer);
            orbitRefreshTimers.delete(noradId);
            return;
        }
        orbitCache.delete(noradId);
        fetchFullOrbit(noradId);
    }, 60000);
    orbitRefreshTimers.set(noradId, refreshTimer);
    
    console.log(`[Orbit] Displayed ${orbitPoints.length} orbit positions for NORAD ${noradId}` +
        (needsKmToMeters ? ' (km→m)' : '') +
        (needsTemeConversion ? ' (TEME→ECEF)' : ''));
}

function removeFullOrbit(noradId) {
    // Remove all gradient segment entities
    const orbitData = orbitEntities.get(noradId);
    if (orbitData && orbitData.segments) {
        orbitData.segments.forEach(seg => viewer.entities.remove(seg));
        orbitEntities.delete(noradId);
    }
    
    // Clear caches
    orbitPositionsCache.delete(noradId);
    depthScaleCache.delete(noradId);
    curvedOrbitCache.delete(noradId);

    // Phase 4: Remove uncertainty visualization
    removeUncertaintyViz(noradId);

    // Clear refresh timer
    const timer = orbitRefreshTimers.get(noradId);
    if (timer) {
        clearInterval(timer);
        orbitRefreshTimers.delete(noradId);
    }
}

// ============================================================================
// Phase 3: LOD Segment Helpers
// ============================================================================

// Precompute segment point arrays for a given K (segment count).
// Returns an array of Cartesian3[] arrays — one per segment.
// Each segment overlaps its neighbor by one boundary point.
function precomputeSegmentArrays(points, K) {
    const actualK = Math.min(K, Math.max(2, Math.floor(points.length / 3)));
    const segSize = Math.ceil(points.length / actualK);
    const result = [];
    for (let s = 0; s < actualK; s++) {
        const startIdx = s * segSize;
        const endIdx = Math.min((s + 1) * segSize, points.length - 1);
        if (startIdx >= points.length - 1) break;
        const arr = points.slice(startIdx, endIdx + 1);
        if (arr.length >= 2) result.push(arr);
    }
    return result;
}

// Build (or rebuild) orbit segment entities for the given LOD tier.
// Removes existing segments, creates new entities, updates orbitEntities map.
function rebuildOrbitSegments(noradId, lodArrays, color, tier, fullOrbitPoints) {
    // Capture old segments for deferred removal (build new first to avoid flicker)
    const existing = orbitEntities.get(noradId);
    const oldSegments = (existing && existing.segments) ? existing.segments : [];

    const arrays = lodArrays[tier];
    if (!arrays || arrays.length === 0) {
        // No new segments — just remove old
        oldSegments.forEach(seg => viewer.entities.remove(seg));
        return;
    }

    // Increment generation so new segment IDs don't collide with old ones
    orbitSegmentGeneration++;
    const gen = orbitSegmentGeneration;

    const K = arrays.length;
    const vs = CONFIG.visual.orbit;
    const segments = [];

    for (let s = 0; s < K; s++) {
        const t = K > 1 ? s / (K - 1) : 0; // 0 = head, 1 = tail
        
        const segAlpha = vs.headAlpha - t * (vs.headAlpha - vs.tailAlpha);
        const segWidth = vs.headWidth  - t * (vs.headWidth  - vs.tailWidth);
        const segGlow  = vs.headGlow   - t * (vs.headGlow   - vs.tailGlow);
        
        const segPoints = arrays[s];
        
        // --- Material: Use solid color material for stable, non-flickering lines ---
        let material;
        material = new Cesium.ColorMaterialProperty(
            color.withAlpha(segAlpha)
        );
        
        // --- Positions: head segment is dynamic (tracks satellite), rest static ---
        // Phase 4: Optionally apply Catmull-Rom curve resampling to head segment
        let positions;
        if (s === 0) {
            // Pre-compute curved points if applicable
            const curveCfg = CONFIG.visual.curves;
            const isSelected = selectedSatellites.has(noradId);
            let curvedPts = null;
            if (curveCfg.enabled && isSelected && segPoints.length >= 4) {
                const entity = entities.get(noradId);
                const satPos = entity ? getEntityPosition(entity) : null;
                if (satPos) {
                    const dist = Cesium.Cartesian3.distance(viewer.camera.positionWC, satPos);
                    if (dist < curveCfg.enableDist) {
                        curvedPts = resampleWithCatmullRom(segPoints, curveCfg.maxResampledPoints, curveCfg.tension);
                        curvedOrbitCache.set(noradId, { points: curvedPts, frameBuilt: frameCounter });
                    }
                }
            }

            const sourcePts = curvedPts || segPoints;
            // Create a mutable copy so we never mutate the original segment/curve arrays
            const displayPts = sourcePts.map(p => p.clone());
            positions = new Cesium.CallbackProperty(() => {
                if (frameCounter % CONFIG.orbitCallbackThrottle !== 0) {
                    const cached = orbitPositionsCache.get(noradId);
                    if (cached) return cached;
                }
                const pos = getEntityPosition(entities.get(noradId));
                if (pos) {
                    Cesium.Cartesian3.clone(pos, displayPts[0]);
                    orbitPositionsCache.set(noradId, displayPts);
                }
                return displayPts;
            }, false);
        } else {
            positions = segPoints;
        }
        
        // --- Width: head segment scales with camera distance, rest static ---
        let width;
        if (s === 0 && vs.depthScaling) {
            width = new Cesium.CallbackProperty(() => {
                const scale = depthScaleCache.get(noradId) || 1.0;
                return segWidth * scale;
            }, false);
        } else {
            width = segWidth;
        }
        
        const segEntity = viewer.entities.add({
            id: `orbit-seg-${noradId}-${gen}-${s}`,
            polyline: {
                positions: positions,
                width: width,
                material: material,
                clampToGround: false
            }
        });
        segments.push(segEntity);
    }

    // Remove old segments now that new ones are visible (flicker-free swap)
    oldSegments.forEach(seg => viewer.entities.remove(seg));

    // Store full orbit data for LOD tier changes and trail length rebuilds
    const storedFull = fullOrbitPoints || (existing ? existing.fullOrbitPoints : null);
    orbitEntities.set(noradId, {
        segments: segments,
        lodArrays: lodArrays,
        color: color,
        lodTier: tier,
        fullOrbitPoints: storedFull
    });
}

// ============================================================================
// Phase 4: TLE Staleness Indicator
// ============================================================================

function getStalenessState(noradId) {
    const cfg = CONFIG.visual.staleness;
    const tleAge = getTleAgeHours(noradId);
    if (tleAge >= cfg.degradedHours) return 'degraded';
    if (tleAge >= cfg.warnHours) return 'warn';
    return 'fresh';
}

function getTleAgeHours(noradId) {
    // Per-satellite TLE epoch if available
    const perSat = satelliteTleEpochs.get(noradId);
    if (perSat && perSat.ageSeconds != null) {
        return perSat.ageSeconds / 3600;
    }
    // Fallback to global metadata
    if (metadata && metadata.tleAgeSeconds != null) {
        return metadata.tleAgeSeconds / 3600;
    }
    return 0;
}

function getStalenessAlphaMultiplier(noradId) {
    const cfg = CONFIG.visual.staleness;
    const state = getStalenessState(noradId);
    if (state === 'degraded') return cfg.degradedAlpha;
    if (state === 'warn') return cfg.warnAlpha;
    return 1.0;
}

function applyStalenessToOrbit(noradId) {
    const cfg = CONFIG.visual.staleness;
    const state = getStalenessState(noradId);
    if (state === 'fresh') return;

    const orbitData = orbitEntities.get(noradId);
    if (!orbitData || !orbitData.segments) return;

    const dashLen = state === 'degraded' ? cfg.degradedDashLength : cfg.warnDashLength;
    const alphaMul = state === 'degraded' ? cfg.degradedAlpha : cfg.warnAlpha;

    orbitData.segments.forEach(seg => {
        if (!seg.polyline) return;
        // Use solid material with reduced alpha instead of dashed to prevent flickering
        const baseColor = orbitData.color || Cesium.Color.GREEN;
        seg.polyline.material = new Cesium.ColorMaterialProperty(
            baseColor.withAlpha(alphaMul)
        );
    });
}

function updateStalenessBadge(noradId) {
    const cfg = CONFIG.visual.staleness;
    if (!cfg.showBadge) return;

    const badge = document.querySelector(`.selection-item[data-norad="${noradId}"] .staleness-badge`);
    if (!badge) return;

    const state = getStalenessState(noradId);
    const ageHrs = getTleAgeHours(noradId);

    if (state === 'degraded') {
        badge.textContent = 'TLE DEGRADED';
        badge.className = 'staleness-badge tle-health-degraded';
        badge.title = `TLE age: ${ageHrs.toFixed(1)} hours`;
    } else if (state === 'warn') {
        badge.textContent = 'TLE STALE';
        badge.className = 'staleness-badge tle-health-warn';
        badge.title = `TLE age: ${ageHrs.toFixed(1)} hours`;
    } else {
        badge.textContent = '';
        badge.className = 'staleness-badge';
        badge.title = '';
    }
}

function updateGlobalStalenessIndicator() {
    const cfg = CONFIG.visual.staleness;
    if (!cfg.showGlobalIndicator) return;

    const indicator = document.getElementById('tleHealthIndicator');
    if (!indicator) return;

    // Find worst staleness among selected satellites (or global if none selected)
    let worstState = 'fresh';
    if (selectedSatellites.size > 0) {
        selectedSatellites.forEach(nid => {
            const s = getStalenessState(nid);
            if (s === 'degraded') worstState = 'degraded';
            else if (s === 'warn' && worstState !== 'degraded') worstState = 'warn';
        });
    } else {
        worstState = getStalenessState(0); // global
    }

    if (worstState === 'degraded') {
        indicator.textContent = 'DEGRADED';
        indicator.className = 'status-value tle-health-degraded';
    } else if (worstState === 'warn') {
        indicator.textContent = 'STALE';
        indicator.className = 'status-value tle-health-warn';
    } else {
        indicator.textContent = 'OK';
        indicator.className = 'status-value status-good';
    }
}

// ============================================================================
// Phase 4: Time-History Trail (Ring Buffer)
// ============================================================================

function initHistoryTrail(noradId) {
    const cfg = CONFIG.visual.historyTrail;
    if (!cfg.enabled) return;

    // Remove existing trail if any
    removeHistoryTrail(noradId);

    const capacity = cfg.maxPoints;
    const trail = {
        buffer: new Array(capacity).fill(null),
        head: 0,
        count: 0,
        entity: null
    };

    // Pre-fill from existing keyframes
    prefillHistoryTrail(noradId, trail);

    // Create Cesium polyline with CallbackProperty
    const trailEntity = viewer.entities.add({
        id: `history-trail-${noradId}`,
        polyline: {
            positions: new Cesium.CallbackProperty(() => {
                return getHistoryTrailPositions(noradId);
            }, false),
            width: cfg.width,
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.15,
                color: Cesium.Color.CYAN.withAlpha(cfg.alpha)
            }),
            clampToGround: false
        }
    });
    trail.entity = trailEntity;

    historyTrails.set(noradId, trail);
}

function prefillHistoryTrail(noradId, trail) {
    const cfg = CONFIG.visual.historyTrail;
    const windowMs = historyTrailMinutes * 60 * 1000;
    const now = Date.now() + backendTimeOffset;

    // Walk keyframes backwards, collecting positions within the time window
    const points = [];
    for (let i = keyframes.length - 1; i >= 0; i--) {
        const kf = keyframes[i];
        const kfMs = kf.timestamp.getTime();
        if (now - kfMs > windowMs) break;

        const sat = kf.satellites.get(noradId);
        if (sat && sat.p) {
            points.unshift(Cesium.Cartesian3.fromArray(sat.p));
        }
    }

    // Write points into ring buffer
    for (const pt of points) {
        trail.buffer[trail.head] = pt;
        trail.head = (trail.head + 1) % trail.buffer.length;
        trail.count = Math.min(trail.count + 1, trail.buffer.length);
    }
}

function appendHistoryTrailPoint(noradId, position) {
    const trail = historyTrails.get(noradId);
    if (!trail) return;

    trail.buffer[trail.head] = position.clone();
    trail.head = (trail.head + 1) % trail.buffer.length;
    trail.count = Math.min(trail.count + 1, trail.buffer.length);
}

function getHistoryTrailPositions(noradId) {
    const trail = historyTrails.get(noradId);
    if (!trail || trail.count === 0) return [];

    const result = [];
    const capacity = trail.buffer.length;
    const start = (trail.head - trail.count + capacity) % capacity;

    for (let i = 0; i < trail.count; i++) {
        const idx = (start + i) % capacity;
        if (trail.buffer[idx]) {
            result.push(trail.buffer[idx]);
        }
    }
    return result;
}

function evictOldTrailPoints(noradId) {
    const trail = historyTrails.get(noradId);
    if (!trail) return;

    const cfg = CONFIG.visual.historyTrail;
    // Cap count based on time window: approximate max points from keyframe interval
    const maxPts = Math.ceil((historyTrailMinutes * 60) / CONFIG.keyframeStep);
    if (trail.count > maxPts) {
        // Advance the logical start by discarding oldest
        const excess = trail.count - maxPts;
        trail.count -= excess;
    }
}

function removeHistoryTrail(noradId) {
    const trail = historyTrails.get(noradId);
    if (!trail) return;

    if (trail.entity) {
        viewer.entities.remove(trail.entity);
    }
    historyTrails.delete(noradId);
}

function rebuildAllHistoryTrails() {
    const activeIds = Array.from(historyTrails.keys());
    activeIds.forEach(noradId => {
        removeHistoryTrail(noradId);
        initHistoryTrail(noradId);
    });
}

// ============================================================================
// Phase 4: Uncertainty Visualization
// ============================================================================

function buildUncertaintyViz(noradId, futurePoints, baseColor, tleAgeSeconds) {
    const cfg = CONFIG.visual.uncertainty;
    if (!cfg.enabled) return;

    // Remove existing uncertainty
    removeUncertaintyViz(noradId);

    if (!futurePoints || futurePoints.length < 4) return;

    const ageScale = tleAgeSeconds
        ? Math.max(1.0, (tleAgeSeconds / 3600 / 24) * cfg.tleEpochAgeMultiplier)
        : 1.0;

    if (cfg.mode === 'corridor') {
        buildCorridorUncertainty(noradId, futurePoints, baseColor, ageScale);
    } else {
        buildSimpleUncertainty(noradId, futurePoints, baseColor, ageScale);
    }
}

function buildSimpleUncertainty(noradId, futurePoints, baseColor, ageScale) {
    const cfg = CONFIG.visual.uncertainty;
    const segCount = cfg.segmentCount;
    const segSize = Math.ceil(futurePoints.length / segCount);
    const segments = [];

    for (let s = 0; s < segCount; s++) {
        const startIdx = s * segSize;
        const endIdx = Math.min((s + 1) * segSize, futurePoints.length - 1);
        if (startIdx >= futurePoints.length - 1) break;

        const segPts = futurePoints.slice(startIdx, endIdx + 1);
        if (segPts.length < 2) continue;

        // Alpha fades from futureStartAlpha to futureEndAlpha across segments
        const t = segCount > 1 ? s / (segCount - 1) : 0;
        const alpha = cfg.futureStartAlpha - t * (cfg.futureStartAlpha - cfg.futureEndAlpha);

        const entity = viewer.entities.add({
            id: `uncertainty-${noradId}-${s}`,
            polyline: {
                positions: segPts,
                width: 1.5 * ageScale,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: baseColor.withAlpha(alpha),
                    dashLength: cfg.dashLength
                }),
                clampToGround: false
            }
        });
        segments.push(entity);
    }

    uncertaintyEntities.set(noradId, { segments, mode: 'simple' });
}

function buildCorridorUncertainty(noradId, futurePoints, baseColor, ageScale) {
    const cfg = CONFIG.visual.uncertainty;
    const leftPositions = [];
    const rightPositions = [];

    for (let i = 0; i < futurePoints.length; i++) {
        const curr = futurePoints[i];
        const next = futurePoints[Math.min(i + 1, futurePoints.length - 1)];

        // Direction along orbit
        const dir = Cesium.Cartesian3.subtract(next, curr, new Cesium.Cartesian3());
        if (Cesium.Cartesian3.magnitudeSquared(dir) < 1) {
            // Skip duplicate points
            continue;
        }
        Cesium.Cartesian3.normalize(dir, dir);

        // Radial (up) direction from Earth center
        const up = Cesium.Cartesian3.normalize(curr, new Cesium.Cartesian3());

        // Perpendicular = cross(dir, up)
        const perp = Cesium.Cartesian3.cross(dir, up, new Cesium.Cartesian3());
        Cesium.Cartesian3.normalize(perp, perp);

        // Width grows with distance along orbit and TLE age
        const distAlongOrbit = i * CONFIG.orbitStep; // approximate meters per step
        let halfWidth = cfg.corridorWidthBase + distAlongOrbit * cfg.corridorGrowthRate;
        halfWidth *= ageScale;
        halfWidth = Math.min(halfWidth, cfg.maxCorridorWidth);

        const offset = Cesium.Cartesian3.multiplyByScalar(perp, halfWidth, new Cesium.Cartesian3());
        leftPositions.push(Cesium.Cartesian3.add(curr, offset, new Cesium.Cartesian3()));
        rightPositions.push(Cesium.Cartesian3.subtract(curr, offset, new Cesium.Cartesian3()));
    }

    const segments = [];

    if (leftPositions.length >= 2) {
        const leftEntity = viewer.entities.add({
            id: `uncertainty-corridor-L-${noradId}`,
            polyline: {
                positions: leftPositions,
                width: 1.0,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: baseColor.withAlpha(cfg.futureStartAlpha * 0.5),
                    dashLength: cfg.dashLength
                }),
                clampToGround: false
            }
        });
        segments.push(leftEntity);
    }

    if (rightPositions.length >= 2) {
        const rightEntity = viewer.entities.add({
            id: `uncertainty-corridor-R-${noradId}`,
            polyline: {
                positions: rightPositions,
                width: 1.0,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: baseColor.withAlpha(cfg.futureStartAlpha * 0.5),
                    dashLength: cfg.dashLength
                }),
                clampToGround: false
            }
        });
        segments.push(rightEntity);
    }

    uncertaintyEntities.set(noradId, { segments, mode: 'corridor' });
}

function removeUncertaintyViz(noradId) {
    const data = uncertaintyEntities.get(noradId);
    if (!data) return;
    data.segments.forEach(seg => viewer.entities.remove(seg));
    uncertaintyEntities.delete(noradId);
}

// ============================================================================
// Phase 4: Catmull-Rom Curved Interpolation
// ============================================================================

function catmullRomPoint(p0, p1, p2, p3, t, tension) {
    // Hermite basis with Catmull-Rom tangents scaled by tension
    const t2 = t * t;
    const t3 = t2 * t;
    const s = (1 - tension) / 2;

    const h1 = 2 * t3 - 3 * t2 + 1;
    const h2 = t3 - 2 * t2 + t;
    const h3 = -2 * t3 + 3 * t2;
    const h4 = t3 - t2;

    // Tangent at p1: s * (p2 - p0), tangent at p2: s * (p3 - p1)
    return new Cesium.Cartesian3(
        h1 * p1.x + h2 * s * (p2.x - p0.x) + h3 * p2.x + h4 * s * (p3.x - p1.x),
        h1 * p1.y + h2 * s * (p2.y - p0.y) + h3 * p2.y + h4 * s * (p3.y - p1.y),
        h1 * p1.z + h2 * s * (p2.z - p0.z) + h3 * p2.z + h4 * s * (p3.z - p1.z)
    );
}

function resampleWithCatmullRom(controlPoints, maxOutput, tension) {
    if (controlPoints.length <= 2) return controlPoints;

    const n = controlPoints.length;
    // Determine how many output points per segment
    const numSegments = n - 1;
    const ptsPerSegment = Math.max(2, Math.floor(maxOutput / numSegments));
    const result = [];

    for (let i = 0; i < numSegments; i++) {
        // Clamp control points at boundaries (repeat endpoints)
        const p0 = controlPoints[Math.max(0, i - 1)];
        const p1 = controlPoints[i];
        const p2 = controlPoints[i + 1];
        const p3 = controlPoints[Math.min(n - 1, i + 2)];

        const steps = (i === numSegments - 1) ? ptsPerSegment : ptsPerSegment - 1;
        for (let j = 0; j <= steps; j++) {
            if (i > 0 && j === 0) continue; // avoid duplicate at segment boundary
            const t = j / ptsPerSegment;
            result.push(catmullRomPoint(p0, p1, p2, p3, t, tension));
            if (result.length >= maxOutput) return result;
        }
    }

    return result;
}

// ============================================================================
// Altitude Color Helpers
// ============================================================================

function getAltitudeFromECEF(posArray) {
    const cartesian = new Cesium.Cartesian3(posArray[0], posArray[1], posArray[2]);
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    return cartographic.height / 1000; // meters to km
}

function getColorByAltitude(altitudeKm) {
    if (altitudeKm < 600) {
        return Cesium.Color.LIME;           // Very low LEO (green)
    } else if (altitudeKm < 1200) {
        return Cesium.Color.YELLOW;         // Mid LEO (yellow) - most Starlink
    } else if (altitudeKm < 2000) {
        return Cesium.Color.ORANGE;         // High LEO (orange)
    } else if (altitudeKm < 35786) {
        return Cesium.Color.RED;            // MEO (red)
    } else {
        return Cesium.Color.MAGENTA;        // GEO+ (magenta)
    }
}

// ============================================================================
// UI Event Handlers
// ============================================================================

function setupEventHandlers() {
    // Connect button
    document.getElementById('connectBtn').addEventListener('click', () => {
        const url = document.getElementById('backendUrl').value.trim();
        const token = document.getElementById('authToken').value.trim();
        
        if (url) {
            CONFIG.backendUrl = url;
            CONFIG.authToken = token || null;
            
            if (eventSource) {
                eventSource.close();
                eventSource = null;
            }
            
            reconnectAttempts = 0;
            connectToBackend();
        }
    });
    
    // Play/Pause button
    document.getElementById('playPauseBtn').addEventListener('click', () => {
        isPlaying = !isPlaying;
        document.getElementById('playPauseBtn').textContent = isPlaying ? 'Pause' : 'Play';
    });
    
    // Speed selector
    document.getElementById('speedSelect').addEventListener('change', (e) => {
        playbackSpeed = parseFloat(e.target.value);
    });
    
    // Show labels checkbox
    document.getElementById('showLabelsCheckbox').addEventListener('change', (e) => {
        showLabels = e.target.checked;
        updateEntityLabels();
    });
    
    // Full orbits checkbox
    const fullOrbitsCheckbox = document.getElementById('fullOrbitsCheckbox');
    if (fullOrbitsCheckbox) {
        fullOrbitsCheckbox.addEventListener('change', (e) => {
            fullOrbitsEnabled = e.target.checked;
            
            if (fullOrbitsEnabled) {
                // Re-fetch orbits for selected satellites
                selectedSatellites.forEach(noradId => {
                    fetchFullOrbit(noradId);
                });
            } else {
                // Remove all orbit paths from selected satellites
                selectedSatellites.forEach(noradId => {
                    removeFullOrbit(noradId);
                });
            }
        });
    }
    
    // Satellite search functionality
    const searchInput = document.getElementById('satelliteSearch');
    const searchBtn = document.getElementById('searchSatelliteBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const noradId = searchInput.value.trim();
            if (noradId) {
                searchAndSelectSatellite(noradId);
            }
        });
    }
    
    // Allow Enter key to trigger search
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const noradId = searchInput.value.trim();
                if (noradId) {
                    searchAndSelectSatellite(noradId);
                }
            }
        });
    }
    
    // Clear selection button
    const clearSelectionBtn = document.getElementById('clearSelectionBtn');
    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener('click', () => {
            clearAllSelections();
        });
    }
    
    // Reset view button
    document.getElementById('resetViewBtn').addEventListener('click', () => {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(0.0, 0.0, 20000000),
            orientation: {
                heading: 0.0,
                pitch: -Cesium.Math.PI_OVER_TWO,
                roll: 0.0
            },
            duration: 2.0
        });
    });
    
    // Clear data button
    document.getElementById('clearDataBtn').addEventListener('click', () => {
        clearData();
    });
    
    // Refresh TLE data button
    document.getElementById('refreshTLEBtn').addEventListener('click', async () => {
        await refreshTLEData();
    });
    
    // Toggle controls panel
    document.getElementById('toggleControls').addEventListener('click', () => {
        const content = document.getElementById('controlsContent');
        const toggleBtn = document.getElementById('toggleControls');

        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggleBtn.textContent = '\u2212';
        } else {
            content.style.display = 'none';
            toggleBtn.textContent = '+';
        }
    });

    // Phase 4: History trail length selector
    const historyTrailSelect = document.getElementById('historyTrailSelect');
    if (historyTrailSelect) {
        historyTrailSelect.addEventListener('change', (e) => {
            historyTrailMinutes = parseInt(e.target.value, 10);
            // Evict old points from all active trails
            historyTrails.forEach((trail, noradId) => {
                evictOldTrailPoints(noradId);
            });
        });
    }

    // Phase 4: Uncertainty checkbox
    const uncertaintyCheckbox = document.getElementById('uncertaintyCheckbox');
    if (uncertaintyCheckbox) {
        uncertaintyCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Build uncertainty for all selected satellites
                selectedSatellites.forEach(noradId => {
                    const orbitData = orbitEntities.get(noradId);
                    if (orbitData && orbitData.fullOrbitPoints) {
                        const pts = orbitData.fullOrbitPoints;
                        const futureStart = Math.floor(pts.length / 2);
                        const futurePoints = pts.slice(futureStart);
                        const tleAge = metadata ? metadata.tleAgeSeconds : 0;
                        buildUncertaintyViz(noradId, futurePoints, orbitData.color, tleAge);
                    }
                });
            } else {
                selectedSatellites.forEach(noradId => {
                    removeUncertaintyViz(noradId);
                });
            }
        });
    }

    // Phase 4: Uncertainty mode selector
    const uncertaintyModeSelect = document.getElementById('uncertaintyModeSelect');
    if (uncertaintyModeSelect) {
        uncertaintyModeSelect.addEventListener('change', (e) => {
            CONFIG.visual.uncertainty.mode = e.target.value;
            // Rebuild uncertainty for all selected if enabled
            if (uncertaintyCheckbox && uncertaintyCheckbox.checked) {
                selectedSatellites.forEach(noradId => {
                    const orbitData = orbitEntities.get(noradId);
                    if (orbitData && orbitData.fullOrbitPoints) {
                        const pts = orbitData.fullOrbitPoints;
                        const futureStart = Math.floor(pts.length / 2);
                        const futurePoints = pts.slice(futureStart);
                        const tleAge = metadata ? metadata.tleAgeSeconds : 0;
                        buildUncertaintyViz(noradId, futurePoints, orbitData.color, tleAge);
                    }
                });
            }
        });
    }

    // WASD Camera Movement + Arrow Key Rotation
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key in keysPressed) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                keysPressed[key] = true;
                e.preventDefault();
            }
        }
    });
    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key in keysPressed) {
            keysPressed[key] = false;
        }
    });
}

// ============================================================================
// Mini Earth Navigation Sphere (Canvas 3D) — Optimized
// ============================================================================

function setupMiniEarthNavigation() {
    const canvas = document.getElementById('miniEarthCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // High-DPI support
    const dpr = window.devicePixelRatio || 1;
    const cssSize = 140;
    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;
    ctx.scale(dpr, dpr);

    // Constants
    const RADIUS = 55;
    const CX = cssSize / 2;
    const CY = cssSize / 2;
    const PERSP = 400;
    const DETAIL = 16;
    const HALF_PI = Math.PI / 2;
    const TWO_PI = Math.PI * 2;

    // Precomputed light direction (normalized)
    const lx = -0.4, ly = -0.6, lz = 0.7;
    const ll = Math.sqrt(lx * lx + ly * ly + lz * lz);
    const LDX = lx / ll, LDY = ly / ll, LDZ = lz / ll;

    // Visual rotation state
    let rotationX = 0;
    let rotationY = 0;

    // Cesium orbit state
    let orbitLon = 0;
    let orbitLat = -0.5;

    // Redraw flag
    let needsRedraw = true;

    // ---- Precompute geometry once ----
    const vertCount = (DETAIL + 1) * (DETAIL + 1);
    // Source vertices: flat arrays [x, y, z] and metadata [latNorm, lonNorm]
    const srcX = new Float32Array(vertCount);
    const srcY = new Float32Array(vertCount);
    const srcZ = new Float32Array(vertCount);
    const vLatNorm = new Float32Array(vertCount);
    const vLonNorm = new Float32Array(vertCount);

    let vi = 0;
    for (let lat = 0; lat <= DETAIL; lat++) {
        const theta = (lat / DETAIL) * Math.PI;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);
        const latN = lat / DETAIL;
        for (let lon = 0; lon <= DETAIL; lon++) {
            const phi = (lon / DETAIL) * TWO_PI;
            srcX[vi] = RADIUS * sinT * Math.cos(phi);
            srcY[vi] = RADIUS * cosT;
            srcZ[vi] = RADIUS * sinT * Math.sin(phi);
            vLatNorm[vi] = latN;
            vLonNorm[vi] = lon / DETAIL;
            vi++;
        }
    }

    // Face indices (flat: every 3 entries = one triangle)
    const faceCount = DETAIL * DETAIL * 2;
    const faceIdx = new Uint16Array(faceCount * 3);
    let fi = 0;
    for (let lat = 0; lat < DETAIL; lat++) {
        for (let lon = 0; lon < DETAIL; lon++) {
            const i0 = lat * (DETAIL + 1) + lon;
            const i1 = i0 + 1;
            const i2 = i0 + (DETAIL + 1);
            const i3 = i2 + 1;
            faceIdx[fi++] = i0; faceIdx[fi++] = i2; faceIdx[fi++] = i1;
            faceIdx[fi++] = i1; faceIdx[fi++] = i2; faceIdx[fi++] = i3;
        }
    }

    // Precompute face colors (land/ocean) — static, never changes
    const faceColorR = new Uint8Array(faceCount);
    const faceColorG = new Uint8Array(faceCount);
    const faceColorB = new Uint8Array(faceCount);
    for (let f = 0; f < faceCount; f++) {
        const base = f * 3;
        const a0 = faceIdx[base], a1 = faceIdx[base + 1], a2 = faceIdx[base + 2];
        const avgLat = (vLatNorm[a0] + vLatNorm[a1] + vLatNorm[a2]) / 3;
        const avgLon = (vLonNorm[a0] + vLonNorm[a1] + vLonNorm[a2]) / 3;
        const latGeo = 90 - avgLat * 180;
        const lonGeo = avgLon * 360;
        const isLand =
            (latGeo > 25 && latGeo < 70 && lonGeo > 210 && lonGeo < 310) ||
            (latGeo > -55 && latGeo < 15 && lonGeo > 270 && lonGeo < 330) ||
            (latGeo > 35 && latGeo < 70 && (lonGeo > 340 || lonGeo < 40)) ||
            (latGeo > -35 && latGeo < 35 && (lonGeo > 345 || (lonGeo > 0 && lonGeo < 50))) ||
            (latGeo > 10 && latGeo < 70 && lonGeo > 40 && lonGeo < 150) ||
            (latGeo > -40 && latGeo < -10 && lonGeo > 110 && lonGeo < 155) ||
            (latGeo < -65);
        faceColorR[f] = isLand ? 45 : 30;
        faceColorG[f] = isLand ? 120 : 70;
        faceColorB[f] = isLand ? 45 : 140;
    }

    // Reusable transformed vertex buffers (avoid per-frame allocation)
    const txX = new Float32Array(vertCount);
    const txY = new Float32Array(vertCount);
    const txZ = new Float32Array(vertCount);
    // Projected coordinates
    const pjX = new Float32Array(vertCount);
    const pjY = new Float32Array(vertCount);
    // Sortable face buffer: [faceIndex, avgZ] interleaved — reuse array
    const sortBuf = new Float64Array(faceCount * 2);
    // Temp sort index array
    const sortIndices = new Uint16Array(faceCount);

    // ---- Render ----
    function render() {
        ctx.clearRect(0, 0, cssSize, cssSize);

        // Cache trig for this frame
        const cosRX = Math.cos(rotationX), sinRX = Math.sin(rotationX);
        const cosRY = Math.cos(rotationY), sinRY = Math.sin(rotationY);

        // Transform + project all vertices
        for (let i = 0; i < vertCount; i++) {
            const px = srcX[i], py = srcY[i], pz = srcZ[i];
            // Rotate X
            const y1 = py * cosRX - pz * sinRX;
            const z1 = py * sinRX + pz * cosRX;
            // Rotate Y
            const x2 = px * cosRY + z1 * sinRY;
            const z2 = -px * sinRY + z1 * cosRY;
            txX[i] = x2; txY[i] = y1; txZ[i] = z2;
            // Project
            const scale = PERSP / (PERSP + z2);
            pjX[i] = CX + x2 * scale;
            pjY[i] = CY + y1 * scale;
        }

        // Build sortable face list with backface culling
        let visCount = 0;
        for (let f = 0; f < faceCount; f++) {
            const base = f * 3;
            const i0 = faceIdx[base], i1 = faceIdx[base + 1], i2 = faceIdx[base + 2];
            const v0x = txX[i0], v0y = txY[i0], v0z = txZ[i0];
            const v1x = txX[i1], v1y = txY[i1], v1z = txZ[i1];
            const v2x = txX[i2], v2y = txY[i2], v2z = txZ[i2];

            // Cross product for normal (only need z component for backface cull)
            const ax = v1x - v0x, ay = v1y - v0y, az = v1z - v0z;
            const bx = v2x - v0x, by = v2y - v0y, bz = v2z - v0z;
            const nz = ax * by - ay * bx;
            if (nz <= 0) continue; // backface

            // Full normal for lighting
            const nx = ay * bz - az * by;
            const ny = az * bx - ax * bz;
            const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

            // Lighting
            const dot = (nx / nLen) * LDX + (ny / nLen) * LDY + (nz / nLen) * LDZ;
            const brightness = dot * 0.7 + 0.5;
            const bright = brightness < 0.15 ? 0.15 : brightness > 1.0 ? 1.0 : brightness;

            // Store: index and avgZ for sorting, brightness packed into sortBuf
            const slot = visCount * 2;
            // Pack face index and brightness into one slot pair
            // We'll use sortIndices for the face index and sortBuf for avgZ + brightness
            sortIndices[visCount] = f;
            sortBuf[slot] = (v0z + v1z + v2z) / 3; // avgZ
            sortBuf[slot + 1] = bright;
            visCount++;
        }

        // Depth sort (farthest first) — simple insertion sort for small N
        for (let i = 1; i < visCount; i++) {
            const keyZ = sortBuf[i * 2];
            const keyB = sortBuf[i * 2 + 1];
            const keyI = sortIndices[i];
            let j = i - 1;
            while (j >= 0 && sortBuf[j * 2] < keyZ) {
                sortBuf[(j + 1) * 2] = sortBuf[j * 2];
                sortBuf[(j + 1) * 2 + 1] = sortBuf[j * 2 + 1];
                sortIndices[j + 1] = sortIndices[j];
                j--;
            }
            sortBuf[(j + 1) * 2] = keyZ;
            sortBuf[(j + 1) * 2 + 1] = keyB;
            sortIndices[j + 1] = keyI;
        }

        // Draw faces
        for (let s = 0; s < visCount; s++) {
            const f = sortIndices[s];
            const bright = sortBuf[s * 2 + 1];
            const base = f * 3;
            const i0 = faceIdx[base], i1 = faceIdx[base + 1], i2 = faceIdx[base + 2];

            const r = (faceColorR[f] * bright + 0.5) | 0;
            const g = (faceColorG[f] * bright + 0.5) | 0;
            const b = (faceColorB[f] * bright + 0.5) | 0;

            ctx.beginPath();
            ctx.moveTo(pjX[i0], pjY[i0]);
            ctx.lineTo(pjX[i1], pjY[i1]);
            ctx.lineTo(pjX[i2], pjY[i2]);
            ctx.closePath();
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fill();
        }

        // Atmosphere glow
        const grad = ctx.createRadialGradient(CX - 15, CY - 15, RADIUS * 0.2, CX, CY, RADIUS + 8);
        grad.addColorStop(0, 'rgba(150,200,255,0.08)');
        grad.addColorStop(0.7, 'rgba(74,158,255,0.05)');
        grad.addColorStop(1, 'rgba(74,158,255,0.15)');
        ctx.beginPath();
        ctx.arc(CX, CY, RADIUS + 8, 0, TWO_PI);
        ctx.fillStyle = grad;
        ctx.fill();

        // Specular highlight
        const sg = ctx.createRadialGradient(CX - 20, CY - 25, 2, CX - 15, CY - 20, RADIUS * 0.6);
        sg.addColorStop(0, 'rgba(255,255,255,0.25)');
        sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(CX, CY, RADIUS, 0, TWO_PI);
        ctx.fillStyle = sg;
        ctx.fill();
    }

    // ---- rAF loop: only draw when needed ----
    function animationLoop() {
        requestAnimationFrame(animationLoop);
        if (!needsRedraw) return;
        needsRedraw = false;
        render();
    }
    requestAnimationFrame(animationLoop);

    // ---- Cesium orbit ----
    // Scratch Cartesian3s to avoid per-call allocation
    const _dir = new Cesium.Cartesian3();
    const _right = new Cesium.Cartesian3();
    const _up = new Cesium.Cartesian3();
    const _worldUp = new Cesium.Cartesian3(0, 1, 0);
    const _dest = new Cesium.Cartesian3();

    function orbitAroundEarth(deltaX, deltaY) {
        const sensitivity = 0.005;
        orbitLon += deltaX * sensitivity;
        orbitLat -= deltaY * sensitivity;

        const minLat = -HALF_PI + 0.05;
        const maxLat = HALF_PI - 0.05;
        if (orbitLat < minLat) orbitLat = minLat;
        if (orbitLat > maxLat) orbitLat = maxLat;

        const dist = Cesium.Cartesian3.magnitude(viewer.camera.position);
        const cosLat = Math.cos(orbitLat);
        const newX = dist * cosLat * Math.sin(orbitLon);
        const newY = dist * Math.sin(orbitLat);
        const newZ = dist * cosLat * Math.cos(orbitLon);

        _dest.x = newX; _dest.y = newY; _dest.z = newZ;
        _dir.x = -newX; _dir.y = -newY; _dir.z = -newZ;
        Cesium.Cartesian3.normalize(_dir, _dir);

        Cesium.Cartesian3.cross(_dir, _worldUp, _right);
        Cesium.Cartesian3.normalize(_right, _right);
        Cesium.Cartesian3.cross(_right, _dir, _up);
        Cesium.Cartesian3.normalize(_up, _up);

        viewer.camera.setView({
            destination: _dest,
            orientation: { direction: _dir, up: _up }
        });
    }

    // ---- Camera sync (snap-back resistant) ----
    let userControlledRotation = false;

    function syncFromCamera() {
        if (userControlledRotation) return;

        const camPos = viewer.camera.position;
        const dist = Cesium.Cartesian3.magnitude(camPos);
        if (dist < 1) return;

        orbitLon = Math.atan2(camPos.x, camPos.z);
        orbitLat = Math.asin(Math.max(-1, Math.min(1, camPos.y / dist)));

        const targetRotY = -orbitLon;
        const targetRotX = Math.max(-HALF_PI, Math.min(HALF_PI, orbitLat));

        // Large threshold prevents any snap-back (0.2 rad ≈ 11 degrees)
        if (Math.abs(targetRotY - rotationY) > 0.2) rotationY = targetRotY;
        if (Math.abs(targetRotX - rotationX) > 0.2) rotationX = targetRotX;
    }

    // ---- Drag handling ----
    let isDragging = false;
    let dragEndTime = 0;
    const SYNC_COOLDOWN = 1000;
    let lastMouseX = 0;
    let lastMouseY = 0;

    function handleDrag(deltaX, deltaY) {
        userControlledRotation = true;
        rotationY -= deltaX * 0.015;
        rotationX += deltaY * 0.015;
        if (rotationX < -HALF_PI) rotationX = -HALF_PI;
        if (rotationX > HALF_PI) rotationX = HALF_PI;
        orbitAroundEarth(deltaX, deltaY);
        render();
        needsRedraw = false;
    }

    canvas.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        userControlledRotation = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        canvas.classList.add('dragging');
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        handleDrag(e.clientX - lastMouseX, e.clientY - lastMouseY);
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        e.preventDefault();
    });

    document.addEventListener('mouseup', (e) => {
        if (e.button !== 0) return;
        if (isDragging) {
            isDragging = false;
            dragEndTime = Date.now();
            canvas.classList.remove('dragging');
            setTimeout(() => { userControlledRotation = false; }, SYNC_COOLDOWN);
        }
    });

    // Touch support
    let lastTouchX = 0;
    let lastTouchY = 0;

    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        isDragging = true;
        userControlledRotation = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        canvas.classList.add('dragging');
        e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const t = e.touches[0];
        handleDrag(t.clientX - lastTouchX, t.clientY - lastTouchY);
        lastTouchX = t.clientX;
        lastTouchY = t.clientY;
        e.preventDefault();
    });

    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            dragEndTime = Date.now();
            canvas.classList.remove('dragging');
            setTimeout(() => { userControlledRotation = false; }, SYNC_COOLDOWN);
        }
    });

    // ---- Idle sync (lightweight, only when camera moved externally) ----
    let lastSyncLon = 0;
    let lastSyncLat = 0;
    setInterval(() => {
        if (isDragging) return;
        if (userControlledRotation) return;
        if ((Date.now() - dragEndTime) < SYNC_COOLDOWN) return;
        const camPos = viewer.camera.position;
        const dist = Cesium.Cartesian3.magnitude(camPos);
        if (dist < 1) return;
        const newLon = Math.atan2(camPos.x, camPos.z);
        const newLat = Math.asin(Math.max(-1, Math.min(1, camPos.y / dist)));
        if (Math.abs(newLon - lastSyncLon) > 0.01 || Math.abs(newLat - lastSyncLat) > 0.01) {
            lastSyncLon = newLon;
            lastSyncLat = newLat;
            syncFromCamera();
            needsRedraw = true;
        }
    }, 500);

    // Initial sync and render
    syncFromCamera();
    needsRedraw = true;
}

// ============================================================================
// SSE Connection Management
// ============================================================================

function connectToBackend() {
    // Clean up any existing connection before opening a new one
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }

    let streamUrl = `${CONFIG.backendUrl}/api/v1/stream/keyframes`;
    if (CONFIG.authToken) {
        streamUrl += `?token=${encodeURIComponent(CONFIG.authToken)}`;
    }

    console.log(`[SSE] Connecting to ${streamUrl.split('?')[0]}...`);
    updateConnectionStatus('Connecting...', 'connecting');

    try {
        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
            console.log('[SSE] Connected');
            updateConnectionStatus('Connected', 'connected');
            reconnectAttempts = 0;
            // Reset time sync on new connection to recompute offset
            backendTimeSynced = false;
        };

        eventSource.onmessage = (event) => {
            handleSSEMessage(event.data);
        };

        // Close immediately on error to prevent EventSource's built-in
        // auto-reconnect from competing with our manual backoff logic.
        eventSource.onerror = (error) => {
            console.error('[SSE] Connection error:', error);
            updateConnectionStatus('Connection Lost', 'error');

            eventSource.close();
            eventSource = null;
            scheduleReconnect();
        };

    } catch (error) {
        console.error('[SSE] Failed to connect:', error);
        updateConnectionStatus('Connection Failed', 'error');
        scheduleReconnect();
    }
}

function scheduleReconnect() {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }

    const delay = Math.min(
        CONFIG.reconnectBaseDelay * Math.pow(2, reconnectAttempts),
        CONFIG.reconnectMaxDelay
    );

    console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1})...`);
    updateConnectionStatus(`Reconnecting in ${Math.round(delay / 1000)}s...`, 'reconnecting');

    reconnectTimeout = setTimeout(() => {
        reconnectAttempts++;
        connectToBackend();
    }, delay);
}

// ============================================================================
// SSE Message Handling
// ============================================================================

function handleSSEMessage(data) {
    try {
        const message = JSON.parse(data);
        
        if (message.type === 'metadata') {
            handleMetadata(message);
        } else if (message.type === 'keyframe_batch') {
            handleKeyframeBatch(message);
        } else if (message.type === 'keepalive') {
            // Ignore keepalive messages
        } else {
            console.warn('[SSE] Unknown message type:', message.type);
        }
        
    } catch (error) {
        console.error('[SSE] Failed to parse message:', error);
    }
}

function handleMetadata(message) {
    console.log('[SSE] Received metadata:', message);
    
    metadata = {
        datasetEpoch: new Date(message.dataset_epoch),
        tleAgeSeconds: message.tle_age_seconds
    };
    
    updateMetadataUI();
}

function handleKeyframeBatch(message) {
    try {
        const timestamp = new Date(message.t);
        const localNow = Date.now();
        
        // Compute backend-to-host clock offset on first keyframe,
        // then update periodically (every 30s) to handle drift
        if (!backendTimeSynced) {
            backendTimeOffset = timestamp.getTime() - localNow;
            backendTimeSynced = true;
            console.log(`[TimeSync] Backend clock offset: ${(backendTimeOffset / 1000).toFixed(1)}s ` +
                `(backend is ${backendTimeOffset > 0 ? 'ahead' : 'behind'} host by ` +
                `${Math.abs(backendTimeOffset / 60000).toFixed(1)} minutes)`);
        } else {
            // Smooth update: nudge offset toward latest measurement
            const measured = timestamp.getTime() - localNow;
            backendTimeOffset = backendTimeOffset * 0.95 + measured * 0.05;
        }
        
        const satellites = new Map();
        message.sat.forEach(sat => {
            satellites.set(sat.id, {
                id: sat.id,
                p: sat.p
            });
        });
        
        keyframes.push({
            timestamp: timestamp,
            satellites: satellites
        });
        
        if (keyframes.length > CONFIG.maxKeyframes) {
            keyframes.shift();
        }
        
        // Invalidate cached keyframe lookup so it re-searches
        cachedKeyframeLookup = null;

        // Phase 4: Append trail points for selected satellites
        selectedSatellites.forEach(noradId => {
            const sat = satellites.get(noradId);
            if (sat && sat.p && historyTrails.has(noradId)) {
                appendHistoryTrailPoint(noradId, Cesium.Cartesian3.fromArray(sat.p));
            }
        });

        // Create entities on first keyframe
        if (entities.size === 0) {
            createEntities(satellites);
        }

        updateKeyframeUI();
        
    } catch (error) {
        console.error('[SSE] Failed to process keyframe batch:', error);
    }
}

// ============================================================================
// Entity Management
// ============================================================================

function createEntities(satellites) {
    console.log(`[Entities] Creating ${satellites.size} satellite entities...`);
    
    satellites.forEach((sat) => {
        try {
            const isISS = parseInt(sat.id) === 25544 || sat.id === 25544;
            
            const entityConfig = {
                id: `sat-${sat.id}`,
                name: isISS ? 'ISS (International Space Station)' : `NORAD ${sat.id}`,
                position: Cesium.Cartesian3.fromArray(sat.p),
                point: {
                    pixelSize: isISS ? 14 : 5,
                    color: isISS ? Cesium.Color.RED : Cesium.Color.YELLOW,
                    outlineColor: isISS ? Cesium.Color.WHITE : Cesium.Color.BLACK,
                    outlineWidth: isISS ? 3 : 1,
                    heightReference: Cesium.HeightReference.NONE
                }
            };
            
            // Always show label for ISS, or if showLabels is enabled
            if (isISS || showLabels) {
                entityConfig.label = {
                    text: isISS ? 'ISS' : sat.id.toString(),
                    font: isISS ? 'bold 14px sans-serif' : '10px sans-serif',
                    fillColor: isISS ? Cesium.Color.RED : Cesium.Color.WHITE,
                    outlineColor: isISS ? Cesium.Color.WHITE : Cesium.Color.BLACK,
                    outlineWidth: isISS ? 3 : 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, isISS ? -14 : -10),
                    show: true
                };
            }
            
            const entity = viewer.entities.add(entityConfig);
            entities.set(sat.id, entity);
            cachedEntityArrayDirty = true;
            
            if (isISS) {
                console.log(`[Entities] ISS (NORAD 25544) created with special styling`);
            }
            
        } catch (error) {
            console.error(`[Entities] Failed to create entity for satellite ${sat.id}:`, error);
        }
    });
    
    console.log(`[Entities] Created ${entities.size} entities`);
}

function updateEntityLabels() {
    entities.forEach((entity, noradId) => {
        const isISS = parseInt(noradId) === 25544 || noradId === 25544;
        
        if (isISS || showLabels) {
            if (!entity.label) {
                entity.label = {};
            }
            entity.label.show = true;
            entity.label.text = isISS ? 'ISS' : noradId.toString();
            entity.label.font = isISS ? 'bold 14px sans-serif' : '10px sans-serif';
            entity.label.fillColor = isISS ? Cesium.Color.RED : Cesium.Color.WHITE;
            entity.label.outlineColor = isISS ? Cesium.Color.WHITE : Cesium.Color.BLACK;
            entity.label.outlineWidth = isISS ? 3 : 2;
            entity.label.style = Cesium.LabelStyle.FILL_AND_OUTLINE;
            entity.label.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
            entity.label.pixelOffset = new Cesium.Cartesian2(0, isISS ? -14 : -10);
        } else {
            if (entity.label) {
                entity.label.show = false;
            }
        }
    });
}

function clearData() {
    console.log('[Clear] Clearing all data...');
    
    // Clear selections first
    clearAllSelections();
    
    // Remove all satellite entities
    entities.forEach((entity) => {
        viewer.entities.remove(entity);
    });
    entities.clear();
    cachedEntityArrayDirty = true;

    // Clear orbit state (remove all gradient segment entities)
    orbitCache.clear();
    orbitEntities.forEach(data => {
        if (data && data.segments) {
            data.segments.forEach(seg => viewer.entities.remove(seg));
        }
    });
    orbitEntities.clear();
    orbitRefreshTimers.forEach(timer => clearInterval(timer));
    orbitRefreshTimers.clear();
    
    // Clear Phase 2 state
    headGlowEntities.forEach(e => viewer.entities.remove(e));
    headGlowEntities.clear();
    depthScaleCache.clear();
    
    // Clear Phase 3 state
    clearHover();
    cachedEntityArray = null;
    cachedEntityArrayDirty = true;

    // Clear Phase 4 state
    historyTrails.forEach((trail, nid) => {
        if (trail.entity) viewer.entities.remove(trail.entity);
    });
    historyTrails.clear();
    curvedOrbitCache.clear();
    uncertaintyEntities.forEach((data, nid) => {
        data.segments.forEach(seg => viewer.entities.remove(seg));
    });
    uncertaintyEntities.clear();
    satelliteTleEpochs.clear();

    // Clear keyframes
    keyframes = [];
    
    // Clear metadata
    metadata = null;
    
    // Reset performance caches
    cachedKeyframeLookup = null;
    updateBatchIndex = 0;
    orbitPositionsCache.clear();
    
    // Update UI
    updateSatelliteCountUI();
    updateKeyframeUI();
    updateMetadataUI();
    updateSelectionUI();
    
    console.log('[Clear] Data cleared');
}

// Periodic sweep: remove stale entries from caches for satellites that
// are no longer in the active entity set or no longer selected.
// Called every ~3600 frames (~60s at 60 FPS) from the animate loop.
function sweepStaleCaches() {
    // Caches keyed by NORAD ID that should only exist for active entities
    for (const noradId of orbitCache.keys()) {
        if (!entities.has(noradId)) {
            orbitCache.delete(noradId);
        }
    }
    for (const noradId of orbitPositionsCache.keys()) {
        if (!entities.has(noradId) || !selectedSatellites.has(noradId)) {
            orbitPositionsCache.delete(noradId);
        }
    }
    for (const noradId of depthScaleCache.keys()) {
        if (!entities.has(noradId) || !selectedSatellites.has(noradId)) {
            depthScaleCache.delete(noradId);
        }
    }
    for (const noradId of curvedOrbitCache.keys()) {
        if (!entities.has(noradId) || !selectedSatellites.has(noradId)) {
            curvedOrbitCache.delete(noradId);
        }
    }
    for (const noradId of satelliteTleEpochs.keys()) {
        if (!entities.has(noradId)) {
            satelliteTleEpochs.delete(noradId);
        }
    }

    // Evict expired orbit cache entries (beyond TTL)
    const now = Date.now();
    for (const [noradId, entry] of orbitCache) {
        if (now - entry.fetchedAt > CONFIG.orbitCacheTTL) {
            orbitCache.delete(noradId);
        }
    }
}

// ============================================================================
// TLE Refresh
// ============================================================================

async function refreshTLEData() {
    const btn = document.getElementById('refreshTLEBtn');
    const originalText = btn.textContent;
    
    try {
        // Disable button and show loading state
        btn.disabled = true;
        btn.textContent = '⏳ Refreshing...';
        updateConnectionStatus('Refreshing TLE data...', 'connecting');
        
        console.log('[Refresh] Requesting TLE refresh from backend...');
        
        // Build headers
        const headers = {
            'Content-Type': 'application/json'
        };
        if (CONFIG.authToken) {
            headers['Authorization'] = `Bearer ${CONFIG.authToken}`;
        }
        
        // Call backend endpoint to refresh TLEs
        const response = await fetch(`${CONFIG.backendUrl}/api/v1/refresh-tles`, {
            method: 'POST',
            headers: headers
        });
        
        if (!response.ok) {
            let errorText = 'Unknown error';
            try {
                errorText = await response.text();
            } catch (e) {
                // Ignore parse errors
            }
            throw new Error(`Backend returned ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('[Refresh] TLE refresh response:', data);
        
        // Clear current data
        clearData();
        
        // Close existing connection
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }
        
        // Wait a moment for backend to finish processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Reconnect to get fresh data
        reconnectAttempts = 0;
        connectToBackend();
        
        // Show success message
        updateConnectionStatus('TLE data refreshed! Reconnecting...', 'connecting');
        btn.textContent = '✅ Refreshed!';
        
        // Reset button text after 3 seconds
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 3000);
        
    } catch (error) {
        console.error('[Refresh] Failed to refresh TLE data:', error);
        updateConnectionStatus('Refresh failed', 'error');
        btn.textContent = '❌ Failed';
        btn.disabled = false;
        
        // Reset button text after 3 seconds
        setTimeout(() => {
            btn.textContent = originalText;
        }, 3000);
    }
}

// ============================================================================
// Animation & Interpolation
// ============================================================================

function animate() {
    requestAnimationFrame(animate);

    frameCount++;
    frameCounter++;

    // WASD Camera Movement
    if (keysPressed.w || keysPressed.a || keysPressed.s || keysPressed.d || keysPressed.q || keysPressed.e) {
        const camera = viewer.camera;
        if (keysPressed.w) camera.moveForward(CAMERA_MOVE_SPEED);
        if (keysPressed.s) camera.moveBackward(CAMERA_MOVE_SPEED);
        if (keysPressed.a) camera.moveLeft(CAMERA_MOVE_SPEED);
        if (keysPressed.d) camera.moveRight(CAMERA_MOVE_SPEED);
        if (keysPressed.q) camera.moveUp(CAMERA_MOVE_SPEED);
        if (keysPressed.e) camera.moveDown(CAMERA_MOVE_SPEED);
    }

    // Arrow Key Camera Rotation
    if (keysPressed.arrowleft || keysPressed.arrowright || keysPressed.arrowup || keysPressed.arrowdown) {
        const camera = viewer.camera;
        if (keysPressed.arrowleft) camera.lookLeft(CAMERA_ROTATION_SPEED);
        if (keysPressed.arrowright) camera.lookRight(CAMERA_ROTATION_SPEED);
        if (keysPressed.arrowup) camera.lookUp(CAMERA_ROTATION_SPEED);
        if (keysPressed.arrowdown) camera.lookDown(CAMERA_ROTATION_SPEED);
    }

    // Phase 3: combined orbit visibility, depth scaling, and LOD (low frequency)
    const dv = CONFIG.visual.orbit;
    if (selectedSatellites.size > 0 &&
        frameCounter % dv.depthUpdateInterval === 0) {
        updateOrbitVisibility();
    }

    // Phase 4: Update global staleness indicator every 60 frames
    if (frameCounter % 60 === 0) {
        updateGlobalStalenessIndicator();
    }

    // Sweep stale cache entries every ~60 seconds (3600 frames at 60 FPS)
    if (frameCounter % 3600 === 0) {
        sweepStaleCaches();
    }

    if (!isPlaying) {
        return;
    }
    
    if (keyframes.length < 2) {
        return;
    }
    
    // Use backend-synced time: host clock + measured offset = backend clock
    const backendNow = Date.now() + backendTimeOffset;
    const currentTime = new Date(backendNow);
    
    updatePositions(currentTime);
}

// Phase 3: combined orbit visibility gating, depth scaling, and LOD tier management.
// Called every depthUpdateInterval frames (typically 15) for selected satellites only.
// - Updates depthScaleCache for head segment width scaling (Phase 2)
// - Hides orbit segments when satellite is beyond orbitCutoffDist (Phase 3 gating)
// - Triggers LOD tier rebuild when camera distance crosses thresholds (Phase 3 LOD)
function updateOrbitVisibility() {
    const cameraPos = viewer.camera.positionWC;
    const cfg = CONFIG.visual.orbit;
    const lodCfg = CONFIG.visual.lod;
    const visCfg = CONFIG.visual.visibility;
    const depthRange = cfg.depthFarDist - cfg.depthNearDist;
    
    selectedSatellites.forEach(noradId => {
        const entity = entities.get(noradId);
        if (!entity) return;
        const satPos = getEntityPosition(entity);
        if (!satPos) return;
        
        const dist = Cesium.Cartesian3.distance(cameraPos, satPos);
        
        // --- Depth scale (Phase 2) ---
        if (cfg.depthScaling) {
            let scale;
            if (dist <= cfg.depthNearDist) scale = 1.0;
            else if (dist >= cfg.depthFarDist) scale = cfg.depthMinScale;
            else scale = 1.0 - ((dist - cfg.depthNearDist) / depthRange) * (1.0 - cfg.depthMinScale);
            depthScaleCache.set(noradId, scale);
        }
        
        const orbitData = orbitEntities.get(noradId);
        if (!orbitData) return;
        
        // --- Visibility gating (Phase 3) ---
        // Always show orbit for the tracked (followed) entity
        const isTracked = viewer.trackedEntity === entity;
        const visible = isTracked || dist < visCfg.orbitCutoffDist;
        if (orbitData.segments) {
            orbitData.segments.forEach(seg => {
                if (seg.polyline) seg.polyline.show = visible;
            });
        }
        
        // --- LOD tier change (Phase 3) with hysteresis to prevent flickering ---
        let lodChanged = false;
        if (lodCfg.enabled && visible && orbitData.lodArrays) {
            let newTier;
            const currentTier = orbitData.lodTier || 'mid';

            // Hysteresis: use different thresholds depending on current tier
            if (currentTier === 'near') {
                newTier = dist >= lodCfg.midDist * 1.2 ? 'mid' : 'near';
            } else if (currentTier === 'mid') {
                if (dist < lodCfg.nearDist * 0.9) newTier = 'near';
                else if (dist >= lodCfg.midDist * 1.1) newTier = 'far';
                else newTier = 'mid';
            } else { // far
                newTier = dist < lodCfg.midDist * 0.9 ? 'mid' : 'far';
            }

            if (newTier !== currentTier) {
                console.log(`[LOD] NORAD ${noradId}: ${currentTier} → ${newTier} (dist ${(dist/1000).toFixed(0)} km)`);
                rebuildOrbitSegments(noradId, orbitData.lodArrays, orbitData.color, newTier, orbitData.fullOrbitPoints);
                lodChanged = true;
            }
        }

        // --- Phase 4: Curve rebuild trigger (with hysteresis) ---
        const curveCfg = CONFIG.visual.curves;
        if (curveCfg.enabled && visible && !lodChanged && orbitData.lodArrays) {
            const cached = curvedOrbitCache.get(noradId);
            const wasCurved = !!cached;

            // Hysteresis on enableDist boundary to prevent flickering
            const distThreshold = wasCurved
                ? curveCfg.enableDist * 1.1
                : curveCfg.enableDist * 0.9;
            const shouldCurve = dist < distThreshold;

            const needsRebuild = cached
                ? (frameCounter - cached.frameBuilt > curveCfg.updateEveryNFrames)
                : shouldCurve;

            if (needsRebuild && shouldCurve) {
                rebuildOrbitSegments(noradId, orbitData.lodArrays, orbitData.color, orbitData.lodTier, orbitData.fullOrbitPoints);
            } else if (wasCurved && !shouldCurve) {
                curvedOrbitCache.delete(noradId);
                rebuildOrbitSegments(noradId, orbitData.lodArrays, orbitData.color, orbitData.lodTier, orbitData.fullOrbitPoints);
            }
        }
    });
}

function updatePositions(currentTime) {
    if (keyframes.length < 2) return;
    
    const currentMs = currentTime.getTime();
    
    // --- Optimization 1: Cache keyframe lookup ---
    // Only re-search the keyframes array when currentTime falls outside cached range
    if (!cachedKeyframeLookup ||
        currentMs < cachedKeyframeLookup.prevTime ||
        currentMs > cachedKeyframeLookup.nextTime) {
        
        let prevKeyframe = null;
        let nextKeyframe = null;
        
        for (let i = 0; i < keyframes.length - 1; i++) {
            if (keyframes[i].timestamp <= currentTime && currentTime <= keyframes[i + 1].timestamp) {
                prevKeyframe = keyframes[i];
                nextKeyframe = keyframes[i + 1];
                break;
            }
        }
        
        if (!prevKeyframe && keyframes.length >= 2) {
            prevKeyframe = keyframes[keyframes.length - 2];
            nextKeyframe = keyframes[keyframes.length - 1];
        }
        
        if (!prevKeyframe || !nextKeyframe) return;
        
        cachedKeyframeLookup = {
            prev: prevKeyframe,
            next: nextKeyframe,
            prevTime: prevKeyframe.timestamp.getTime(),
            nextTime: nextKeyframe.timestamp.getTime()
        };
    }
    
    const prevKeyframe = cachedKeyframeLookup.prev;
    const nextKeyframe = cachedKeyframeLookup.next;
    const timeDiff = cachedKeyframeLookup.nextTime - cachedKeyframeLookup.prevTime;
    const timeElapsed = currentMs - cachedKeyframeLookup.prevTime;
    const ratio = timeDiff > 0 ? Math.max(0, Math.min(1, timeElapsed / timeDiff)) : 0;
    
    // --- Optimization 2: Frustum culling setup (once per frame) ---
    if (CONFIG.enableFrustumCulling) {
        const camera = viewer.camera;
        cullingVolume = camera.frustum.computeCullingVolume(
            camera.positionWC, camera.directionWC, camera.upWC
        );
    }
    
    // --- Optimization 3: Batched updates (Phase 3: cached entity array) ---
    // Update a rotating batch of satellites per frame to spread the work
    const batchSize = CONFIG.updateBatchSize;
    if (cachedEntityArray === null || cachedEntityArrayDirty) {
        cachedEntityArray = Array.from(entities.entries());
        cachedEntityArrayDirty = false;
    }
    const entityArray = cachedEntityArray;
    const totalEntities = entityArray.length;
    
    if (totalEntities === 0) return;
    
    const startIdx = updateBatchIndex;
    const endIdx = Math.min(startIdx + batchSize, totalEntities);
    
    for (let i = startIdx; i < endIdx; i++) {
        const [noradId, entity] = entityArray[i];
        
        const prevSat = prevKeyframe.satellites.get(noradId);
        const nextSat = nextKeyframe.satellites.get(noradId);
        
        if (!prevSat || !nextSat) continue;
        
        const prevPos = prevSat.p;
        const nextPos = nextSat.p;
        
        // Fast linear interpolation into scratch Cartesian3 (avoid array allocation)
        scratchCartesian.x = prevPos[0] + (nextPos[0] - prevPos[0]) * ratio;
        scratchCartesian.y = prevPos[1] + (nextPos[1] - prevPos[1]) * ratio;
        scratchCartesian.z = prevPos[2] + (nextPos[2] - prevPos[2]) * ratio;
        
        // --- Optimization 4: Frustum culling ---
        // Skip position update for satellites outside the camera view
        if (CONFIG.enableFrustumCulling && cullingVolume) {
            scratchBoundingSphere.center = scratchCartesian;
            scratchBoundingSphere.radius = 0;
            const visibility = cullingVolume.computeVisibility(scratchBoundingSphere);
            if (visibility === Cesium.Intersect.OUTSIDE) {
                // Still set position (so it's correct when it comes into view)
                // but only on every 10th frame for off-screen satellites
                if (frameCounter % 10 !== 0) continue;
            }
        }

        // Set position — update in-place when possible to avoid allocation
        if (entity.position instanceof Cesium.Cartesian3) {
            Cesium.Cartesian3.clone(scratchCartesian, entity.position);
        } else {
            entity.position = Cesium.Cartesian3.clone(scratchCartesian);
        }
    }
    
    // Advance batch index for next frame, wrap around
    updateBatchIndex = endIdx >= totalEntities ? 0 : endIdx;
}

// ============================================================================
// Selection UI Updates
// ============================================================================

function updateSelectionUI() {
    // Update selection count in button
    const selectionCountEl = document.getElementById('selectionCount');
    if (selectionCountEl) {
        selectionCountEl.textContent = selectedSatellites.size;
    }
    
    // Show/hide selection panel
    const selectionPanel = document.getElementById('selectionPanel');
    if (selectionPanel) {
        selectionPanel.style.display = selectedSatellites.size > 0 ? 'block' : 'none';
    }
    
    // Build selection list
    const selectionList = document.getElementById('selectionList');
    if (selectionList) {
        selectionList.innerHTML = '';
        
        selectedSatellites.forEach(noradId => {
            const item = document.createElement('div');
            item.className = 'selection-item';
            item.setAttribute('data-norad', noradId);
            
            const label = document.createElement('span');
            label.className = 'selection-label';
            label.textContent = `NORAD ${noradId}`;
            
            const statusSpan = document.createElement('span');
            statusSpan.className = 'selection-status';
            statusSpan.id = `orbit-status-${noradId}`;
            statusSpan.textContent = '';
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '\u00d7';
            removeBtn.title = `Deselect NORAD ${noradId}`;
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deselectSatellite(noradId);
                updateSelectionUI();
            });
            
            // Phase 4: Staleness badge
            const stalenessBadge = document.createElement('span');
            stalenessBadge.className = 'staleness-badge';
            updateStalenessBadge(noradId); // will update after DOM append

            item.appendChild(label);
            item.appendChild(stalenessBadge);
            item.appendChild(statusSpan);
            item.appendChild(removeBtn);
            selectionList.appendChild(item);

            // Update badge now that it's in DOM
            updateStalenessBadge(noradId);
        });
    }

    // Phase 4: Show/hide Phase 4 controls
    updatePhase4ControlsVisibility();
}

function updatePhase4ControlsVisibility() {
    const hasSelected = selectedSatellites.size > 0;
    const p4Group = document.getElementById('phase4ControlGroup');
    if (p4Group) {
        p4Group.style.display = hasSelected ? 'flex' : 'none';
    }
}

function updateOrbitStatus(noradId, status, errorMsg) {
    const statusEl = document.getElementById(`orbit-status-${noradId}`);
    if (!statusEl) return;
    
    switch (status) {
        case 'loading':
            statusEl.textContent = 'Loading...';
            statusEl.className = 'selection-status status-loading';
            break;
        case 'loaded':
            statusEl.textContent = 'Orbit loaded';
            statusEl.className = 'selection-status status-loaded';
            break;
        case 'error':
            statusEl.textContent = errorMsg || 'Error';
            statusEl.className = 'selection-status status-orbit-error';
            statusEl.title = errorMsg || 'Failed to load orbit';
            break;
        default:
            statusEl.textContent = '';
            statusEl.className = 'selection-status';
    }
}

// ============================================================================
// General UI Updates
// ============================================================================

function updateConnectionStatus(status, state) {
    const statusElement = document.getElementById('connectionStatusValue');
    statusElement.textContent = status;
    statusElement.className = `status-value status-${state}`;
}

function updateSatelliteCountUI() {
    document.getElementById('satelliteCountValue').textContent = entities.size;
}

function updateKeyframeUI() {
    document.getElementById('keyframeCountValue').textContent = keyframes.length;
    updateSatelliteCountUI();
}

function updateMetadataUI() {
    if (!metadata) {
        document.getElementById('tleAgeValue').textContent = '--';
        document.getElementById('datasetEpochValue').textContent = '--';
        return;
    }
    
    const tleAgeHours = metadata.tleAgeSeconds / 3600;
    const tleAgeElement = document.getElementById('tleAgeValue');
    
    if (tleAgeHours < 1) {
        tleAgeElement.textContent = `${Math.round(metadata.tleAgeSeconds / 60)} min`;
        tleAgeElement.className = 'status-value status-good';
    } else if (tleAgeHours < 24) {
        tleAgeElement.textContent = `${tleAgeHours.toFixed(1)} hrs`;
        tleAgeElement.className = 'status-value status-warning';
    } else {
        const tleAgeDays = tleAgeHours / 24;
        tleAgeElement.textContent = `${tleAgeDays.toFixed(1)} days`;
        tleAgeElement.className = 'status-value status-error';
    }
    
    const epochStr = metadata.datasetEpoch.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    document.getElementById('datasetEpochValue').textContent = epochStr;
}

function updateFPS() {
    const fps = frameCount;
    frameCount = 0;
    
    const fpsElement = document.getElementById('fpsValue');
    fpsElement.textContent = fps;
    
    if (fps >= 55) {
        fpsElement.className = 'status-value status-good';
    } else if (fps >= 30) {
        fpsElement.className = 'status-value status-warning';
    } else {
        fpsElement.className = 'status-value status-error';
    }
}

// ============================================================================
// Pass Prediction: Geolocation
// ============================================================================

function getCurrentLocation() {
    const geoStatus = document.getElementById('geoStatus');
    const btn = document.getElementById('useMyLocationBtn');
    
    if (!navigator.geolocation) {
        showGeoStatus('Geolocation not supported by browser', 'error');
        return;
    }
    
    btn.disabled = true;
    showGeoStatus('Getting location...', 'loading');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const alt = position.coords.altitude || 0;
            
            document.getElementById('passLat').value = lat.toFixed(4);
            document.getElementById('passLng').value = lng.toFixed(4);
            document.getElementById('passAlt').value = Math.round(alt);
            
            observerLocation = { lat, lng, altitude: alt };
            
            // Place observer marker on globe
            placeObserverMarker(lat, lng, alt);
            
            showGeoStatus(`${lat.toFixed(2)}, ${lng.toFixed(2)}`, 'success');
            btn.disabled = false;
            
            console.log(`[Passes] Observer location: ${lat.toFixed(4)}, ${lng.toFixed(4)}, alt ${Math.round(alt)}m`);
        },
        (error) => {
            let msg = 'Location error';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    msg = 'Location permission denied. Enter manually.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    msg = 'Location unavailable. Enter manually.';
                    break;
                case error.TIMEOUT:
                    msg = 'Location request timed out. Try again.';
                    break;
            }
            showGeoStatus(msg, 'error');
            btn.disabled = false;
            console.warn('[Passes] Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
}

function showGeoStatus(msg, state) {
    const el = document.getElementById('geoStatus');
    el.textContent = msg;
    el.className = `geo-status geo-${state}`;
}

function placeObserverMarker(lat, lng, alt) {
    // Remove existing marker
    const existing = viewer.entities.getById('observer-marker');
    if (existing) viewer.entities.remove(existing);
    
    viewer.entities.add({
        id: 'observer-marker',
        position: Cesium.Cartesian3.fromDegrees(lng, lat, alt),
        point: {
            pixelSize: 12,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 3,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
            text: 'Observer',
            font: '12px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.RED,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -18),
            show: true
        }
    });
}

// ============================================================================
// Pass Prediction: API Call
// ============================================================================

async function predictPasses() {
    // Read location from input fields
    const lat = parseFloat(document.getElementById('passLat').value);
    const lng = parseFloat(document.getElementById('passLng').value);
    const alt = parseFloat(document.getElementById('passAlt').value) || 0;
    const minElev = parseFloat(document.getElementById('passMinElev').value) || 10;
    const horizonHours = parseInt(document.getElementById('passHorizon').value) || 24;
    
    // Validate inputs
    if (isNaN(lat) || lat < -90 || lat > 90) {
        showPassError('Invalid latitude. Must be between -90 and 90.');
        return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
        showPassError('Invalid longitude. Must be between -180 and 180.');
        return;
    }
    
    observerLocation = { lat, lng, altitude: alt };
    placeObserverMarker(lat, lng, alt);
    
    // Determine which satellites to predict for
    const noradIds = selectedSatellites.size > 0
        ? Array.from(selectedSatellites)
        : null; // null = all satellites (backend decides)
    
    // Build request body
    const body = {
        latitude: lat,
        longitude: lng,
        altitude: alt,
        min_elevation: minElev,
        horizon_hours: horizonHours,
        max_passes: CONFIG.passPrediction.defaultMaxPasses
    };
    
    if (noradIds) {
        body.norad_ids = noradIds;
    }
    
    // Show loading state
    showPassLoading(true);
    hidePassError();
    
    const btn = document.getElementById('predictPassesBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Computing...';
    
    console.log(`[Passes] Predicting passes for ${lat.toFixed(4)}, ${lng.toFixed(4)}, ` +
        `alt ${alt}m, minElev ${minElev}°, horizon ${horizonHours}h` +
        (noradIds ? `, satellites: [${noradIds.join(',')}]` : ', all satellites'));
    
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (CONFIG.authToken) {
            headers['Authorization'] = `Bearer ${CONFIG.authToken}`;
        }
        
        const response = await fetch(`${CONFIG.backendUrl}/api/v1/passes`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            let errorText = `HTTP ${response.status}`;
            try {
                const errBody = await response.json();
                errorText = errBody.error || errorText;
            } catch (_) {
                errorText = await response.text() || errorText;
            }
            throw new Error(errorText);
        }
        
        const data = await response.json();
        console.log(`[Passes] Full response:`, data);

        // Backend returns {satellites: [{norad_id, passes: [...]}, ...]}
        // Flatten all passes from all satellites into a single array
        if (data.satellites && Array.isArray(data.satellites)) {
            passPredictions = [];
            data.satellites.forEach(sat => {
                if (sat.passes && Array.isArray(sat.passes)) {
                    // Add norad_id to each pass for identification
                    sat.passes.forEach(pass => {
                        passPredictions.push({
                            ...pass,
                            norad_id: parseInt(sat.norad_id || pass.norad_id)
                        });
                    });
                }
            });
            console.log(`[Passes] Flattened ${passPredictions.length} passes from ${data.satellites.length} satellites`);
        } else if (data.passes && Array.isArray(data.passes)) {
            // Fallback: if backend changes to return passes directly
            passPredictions = data.passes;
            console.log(`[Passes] Received ${passPredictions.length} passes (direct format)`);
        } else {
            passPredictions = [];
            console.warn(`[Passes] Unexpected response format:`, data);
        }
        
        if (passPredictions.length === 0) {
            showPassError('No passes found. Try lowering minimum elevation or increasing horizon.');
        } else {
            hidePassError();
            renderPassTable(passPredictions);
            startPassCountdown();
        }
        
    } catch (error) {
        console.error('[Passes] Prediction failed:', error);
        showPassError(`Prediction failed: ${error.message}`);
    } finally {
        showPassLoading(false);
        btn.disabled = false;
        btn.textContent = '🔮 Predict Passes';
    }
}

function showPassLoading(show) {
    document.getElementById('passLoading').style.display = show ? 'flex' : 'none';
}

function showPassError(msg) {
    const el = document.getElementById('passError');
    el.textContent = msg;
    el.style.display = 'block';
}

function hidePassError() {
    document.getElementById('passError').style.display = 'none';
}

// ============================================================================
// Pass Prediction: Table Rendering
// ============================================================================

function renderPassTable(passes) {
    const section = document.getElementById('passResultsSection');
    const tbody = document.getElementById('passTableBody');
    const countEl = document.getElementById('passResultCount');
    
    section.style.display = 'block';
    countEl.textContent = passes.length;
    tbody.innerHTML = '';
    
    // Sort by start time (ascending)
    const sorted = [...passes].sort((a, b) => {
        return new Date(a.start_time || a.aos).getTime() - new Date(b.start_time || b.aos).getTime();
    });
    
    const now = new Date();
    
    sorted.forEach((pass, idx) => {
        const startTime = new Date(pass.start_time || pass.aos);
        const endTime = new Date(pass.end_time || pass.los);
        const durationSec = (endTime - startTime) / 1000;
        const durationMin = Math.floor(durationSec / 60);
        const durationSecRemainder = Math.round(durationSec % 60);
        const maxElev = Number(pass.max_elevation || pass.max_elev) || 0;
        const azimuth = Number(pass.azimuth_at_max || pass.az_max) || 0;
        const noradId = parseInt(pass.norad_id || pass.satellite_id, 10) || '--';

        // Time until pass
        const timeDiffMs = startTime - now;
        const isUpcoming = timeDiffMs > 0 && timeDiffMs < 3600000; // within 1 hour
        const isPast = timeDiffMs < 0;

        // Elevation color class
        let elevClass = 'elev-low';
        if (maxElev >= 60) elevClass = 'elev-high';
        else if (maxElev >= 30) elevClass = 'elev-mid';

        const tr = document.createElement('tr');
        tr.className = `pass-row ${isUpcoming ? 'pass-upcoming' : ''} ${isPast ? 'pass-past' : ''}`;
        tr.dataset.passIndex = idx;

        // Build cells safely via textContent (no innerHTML injection)
        const tdSat = document.createElement('td');
        tdSat.className = 'pass-sat';
        tdSat.textContent = String(noradId);

        const tdTime = document.createElement('td');
        tdTime.className = 'pass-time';
        tdTime.textContent = formatPassTime(startTime);

        const tdDur = document.createElement('td');
        tdDur.className = 'pass-duration';
        tdDur.textContent = `${durationMin}:${durationSecRemainder.toString().padStart(2, '0')}`;

        const tdElev = document.createElement('td');
        tdElev.className = `pass-elev ${elevClass}`;
        tdElev.textContent = `${maxElev.toFixed(1)}\u00B0`;

        const tdAz = document.createElement('td');
        tdAz.className = 'pass-az';
        tdAz.textContent = `${azimuthToCompass(azimuth)} (${azimuth.toFixed(0)}\u00B0)`;

        const tdAction = document.createElement('td');
        const vizBtn = document.createElement('button');
        vizBtn.className = 'pass-viz-btn';
        vizBtn.title = 'Visualize on globe';
        vizBtn.textContent = '\uD83D\uDC41';
        vizBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            visualizePass(sorted[idx]);
        });
        tdAction.appendChild(vizBtn);

        tr.appendChild(tdSat);
        tr.appendChild(tdTime);
        tr.appendChild(tdDur);
        tr.appendChild(tdElev);
        tr.appendChild(tdAz);
        tr.appendChild(tdAction);

        // Row click → select satellite
        tr.addEventListener('click', () => {
            const nid = parseInt(pass.norad_id || pass.satellite_id, 10);
            if (!isNaN(nid)) {
                selectSatellite(nid);
                updateSelectionUI();
            }
        });

        tbody.appendChild(tr);
    });
    
    // Add sort handlers on column headers
    document.querySelectorAll('#passTable th[data-sort]').forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            sortPassTable(th.dataset.sort);
        });
    });
}

function formatPassTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    const secs = date.getSeconds().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${mins}:${secs}`;
}

function azimuthToCompass(az) {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(((az % 360) / 22.5)) % 16;
    return dirs[idx];
}

let currentSortField = 'start';
let currentSortAsc = true;

function sortPassTable(field) {
    if (currentSortField === field) {
        currentSortAsc = !currentSortAsc;
    } else {
        currentSortField = field;
        currentSortAsc = true;
    }
    
    const sorted = [...passPredictions].sort((a, b) => {
        let valA, valB;
        switch (field) {
            case 'satellite':
                valA = a.norad_id || a.satellite_id || 0;
                valB = b.norad_id || b.satellite_id || 0;
                break;
            case 'start':
                valA = new Date(a.start_time || a.aos).getTime();
                valB = new Date(b.start_time || b.aos).getTime();
                break;
            case 'duration':
                valA = new Date(a.end_time || a.los) - new Date(a.start_time || a.aos);
                valB = new Date(b.end_time || b.los) - new Date(b.start_time || b.aos);
                break;
            case 'maxElev':
                valA = a.max_elevation || a.max_elev || 0;
                valB = b.max_elevation || b.max_elev || 0;
                break;
            case 'azimuth':
                valA = a.azimuth_at_max || a.az_max || 0;
                valB = b.azimuth_at_max || b.az_max || 0;
                break;
            default:
                return 0;
        }
        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        return currentSortAsc ? cmp : -cmp;
    });
    
    renderPassTable(sorted);
}

// ============================================================================
// Pass Prediction: Countdown Timer
// ============================================================================

function startPassCountdown() {
    if (passCountdownInterval) clearInterval(passCountdownInterval);
    
    const countdownDiv = document.getElementById('passCountdown');
    
    function update() {
        const now = new Date();
        
        // Find next upcoming pass
        let nextPass = null;
        let minDiff = Infinity;
        
        for (const pass of passPredictions) {
            const startTime = new Date(pass.start_time || pass.aos);
            const diff = startTime - now;
            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                nextPass = pass;
            }
        }
        
        if (!nextPass) {
            countdownDiv.style.display = 'none';
            return;
        }
        
        countdownDiv.style.display = 'flex';
        
        const totalSec = Math.floor(minDiff / 1000);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        
        document.getElementById('countdownTimer').textContent =
            `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        const noradId = nextPass.norad_id || nextPass.satellite_id || '--';
        document.getElementById('countdownSat').textContent = `(NORAD ${noradId})`;
    }
    
    update();
    passCountdownInterval = setInterval(update, 1000);
}

// ============================================================================
// Pass Prediction: Helpers
// ============================================================================

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ============================================================================
// Pass Prediction: Visualization on Globe
// ============================================================================

function visualizePass(pass) {
    // Clear previous visualization
    clearPassVisualization();
    
    selectedPass = pass;
    const noradId = pass.norad_id || pass.satellite_id;
    const startTime = new Date(pass.start_time || pass.aos);
    const endTime = new Date(pass.end_time || pass.los);
    
    console.log(`[Passes] Visualizing pass for NORAD ${noradId}: ${startTime.toISOString()} → ${endTime.toISOString()}`);
    
    // VALIDATION: Check ground track distance from observer
    if (pass.ground_track && pass.ground_track.length > 0 && observerLocation) {
        const firstPoint = pass.ground_track[0];
        const lastPoint = pass.ground_track[pass.ground_track.length - 1];
        
        const distToStart = calculateDistance(
            observerLocation.lat, observerLocation.lng,
            firstPoint.latitude, firstPoint.longitude
        );
        const distToEnd = calculateDistance(
            observerLocation.lat, observerLocation.lng,
            lastPoint.latitude, lastPoint.longitude
        );
        
        // Find closest ground track point to observer
        let minDist = Infinity;
        pass.ground_track.forEach(pt => {
            const d = calculateDistance(observerLocation.lat, observerLocation.lng, pt.latitude, pt.longitude);
            if (d < minDist) minDist = d;
        });
        
        console.log(`[Pass Validation] Ground track distances from observer (${observerLocation.lat.toFixed(4)}, ${observerLocation.lng.toFixed(4)}):`);
        console.log(`  AOS ground point: ${distToStart.toFixed(1)} km away`);
        console.log(`  LOS ground point: ${distToEnd.toFixed(1)} km away`);
        console.log(`  Closest ground track point: ${minDist.toFixed(1)} km away`);
        console.log(`  Max elevation angle: ${pass.max_elevation || pass.max_elev}°`);
        console.log(`  Note: At 550 km altitude, a satellite at 10° elevation is ~1800 km away on the ground`);
        
        if (minDist > 2500) {
            console.warn(`[Pass Validation] ⚠ Closest ground track point is ${minDist.toFixed(0)} km away — this pass may be a backend prediction error`);
        }
    }
    
    // If pass has ground track positions, draw them
    if (pass.ground_track && pass.ground_track.length >= 2) {
        drawGroundTrack(pass);
    }
    
    // Place start/end markers
    if (pass.start_az !== undefined && observerLocation) {
        placePassMarkers(pass);
    }
    
    // Draw elevation indicator line at max elevation
    if (pass.max_elevation_position || (pass.max_az !== undefined && observerLocation)) {
        drawMaxElevationIndicator(pass);
    }
    
    // Center camera on observer location
    if (observerLocation) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                observerLocation.lng,
                observerLocation.lat,
                2000000 // 2000 km altitude for pass overview
            ),
            orientation: {
                heading: 0.0,
                pitch: -Cesium.Math.PI_OVER_TWO,
                roll: 0.0
            },
            duration: 1.5
        });
    }
    
    // Select the satellite
    if (noradId && !isNaN(parseInt(noradId))) {
        const nid = parseInt(noradId);
        if (!selectedSatellites.has(nid)) {
            selectSatellite(nid);
            updateSelectionUI();
        }
    }
}

function drawGroundTrack(pass) {
    // Filter valid points once
    const validPoints = pass.ground_track.filter(pt =>
        pt.latitude != null && pt.longitude != null && !isNaN(pt.latitude) && !isNaN(pt.longitude)
    );
    
    if (validPoints.length < 2) return;
    
    const gt = CONFIG.visual.groundTrack;
    
    // Split ground track into color-gradient segments based on elevation.
    // Each segment gets the average elevation color of its constituent points.
    // This produces ≤ maxSegments entities (typically 5-8) — created once, not per frame.
    const segmentCount = Math.min(gt.maxSegments, Math.max(2, Math.floor(validPoints.length / 4)));
    const segmentSize = Math.ceil(validPoints.length / segmentCount);
    
    for (let s = 0; s < segmentCount; s++) {
        const startIdx = s * segmentSize;
        // Include overlap with previous segment's last point for visual continuity
        const segStart = s === 0 ? startIdx : startIdx;
        const segEnd = Math.min(startIdx + segmentSize, validPoints.length - 1);
        
        if (segStart >= validPoints.length - 1) break;
        
        const segPositions = [];
        let totalElev = 0;
        let count = 0;
        
        // Include previous segment's last point as this segment's first for continuity
        const overlapIdx = s > 0 ? segStart - 1 : segStart;
        for (let i = overlapIdx; i <= segEnd && i < validPoints.length; i++) {
            const pt = validPoints[i];
            segPositions.push(Cesium.Cartesian3.fromDegrees(pt.longitude, pt.latitude, 0));
            totalElev += (pt.elevation || 0);
            count++;
        }
        
        if (segPositions.length < 2) continue;
        
        // Elevation → color: RED (low) → YELLOW (mid) → GREEN (high)
        const avgElev = totalElev / count;
        const scratchColor = new Cesium.Color();
        let segColor;
        if (avgElev < 20) {
            const t = avgElev / 20;
            segColor = Cesium.Color.lerp(Cesium.Color.RED, Cesium.Color.YELLOW, t, scratchColor);
        } else {
            const t = Math.min((avgElev - 20) / 50, 1);
            segColor = Cesium.Color.lerp(Cesium.Color.YELLOW, Cesium.Color.LIME, t, scratchColor);
        }
        
        const entity = viewer.entities.add({
            id: `pass-ground-track-${s}`,
            polyline: {
                positions: segPositions,
                width: gt.width,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: gt.glowPower,
                    color: segColor.withAlpha(gt.alpha)
                }),
                clampToGround: true
            }
        });
        passVisualizationEntities.push(entity);
    }
}

function placePassMarkers(pass) {
    if (!observerLocation) return;
    
    const obsLat = observerLocation.lat;
    const obsLng = observerLocation.lng;
    
    // Start marker (AOS - Acquisition of Signal)
    if (pass.start_az !== undefined) {
        const startAz = pass.start_az;
        // Place a marker ~200km from observer in the start azimuth direction
        const dist = 200; // km
        const startLat = obsLat + (dist / 111) * Math.cos(startAz * Math.PI / 180);
        const startLng = obsLng + (dist / (111 * Math.cos(obsLat * Math.PI / 180))) * Math.sin(startAz * Math.PI / 180);
        
        const entity = viewer.entities.add({
            id: 'pass-start-marker',
            position: Cesium.Cartesian3.fromDegrees(startLng, startLat, 0),
            point: {
                pixelSize: 10,
                color: Cesium.Color.GREEN,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            label: {
                text: 'AOS',
                font: '11px sans-serif',
                fillColor: Cesium.Color.GREEN,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -14),
                show: true
            }
        });
        passVisualizationEntities.push(entity);
    }
    
    // End marker (LOS - Loss of Signal)
    if (pass.end_az !== undefined) {
        const endAz = pass.end_az;
        const dist = 200;
        const endLat = obsLat + (dist / 111) * Math.cos(endAz * Math.PI / 180);
        const endLng = obsLng + (dist / (111 * Math.cos(obsLat * Math.PI / 180))) * Math.sin(endAz * Math.PI / 180);
        
        const entity = viewer.entities.add({
            id: 'pass-end-marker',
            position: Cesium.Cartesian3.fromDegrees(endLng, endLat, 0),
            point: {
                pixelSize: 10,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            label: {
                text: 'LOS',
                font: '11px sans-serif',
                fillColor: Cesium.Color.RED,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -14),
                show: true
            }
        });
        passVisualizationEntities.push(entity);
    }
}

function drawMaxElevationIndicator(pass) {
    if (!observerLocation) return;
    
    const maxElev = pass.max_elevation || pass.max_elev || 0;
    const maxAz = pass.azimuth_at_max || pass.az_max || 0;
    
    // Guard: tan(0) = 0 → division by zero → Infinity → Cesium crash
    if (maxElev < 1) {
        console.warn(`[Pass] Skipping max elevation indicator — elevation too low (${maxElev}°)`);
        return;
    }
    
    // Draw a line from observer toward the max elevation point
    const obsLat = observerLocation.lat;
    const obsLng = observerLocation.lng;
    const obsAlt = observerLocation.altitude || 0;
    
    // Approximate satellite position at max elevation
    // Using simple geometry: at elevation E, approximate slant range
    const satAltKm = 550; // typical LEO altitude
    const dist = satAltKm / Math.tan(maxElev * Math.PI / 180);
    const satLat = obsLat + (dist / 111) * Math.cos(maxAz * Math.PI / 180);
    const satLng = obsLng + (dist / (111 * Math.cos(obsLat * Math.PI / 180))) * Math.sin(maxAz * Math.PI / 180);
    
    const entity = viewer.entities.add({
        id: 'pass-max-elev-line',
        polyline: {
            positions: [
                Cesium.Cartesian3.fromDegrees(obsLng, obsLat, obsAlt + 100),
                Cesium.Cartesian3.fromDegrees(satLng, satLat, satAltKm * 1000)
            ],
            width: 2,
            material: new Cesium.PolylineDashMaterialProperty({
                color: Cesium.Color.YELLOW.withAlpha(0.6),
                dashLength: 16
            })
        }
    });
    passVisualizationEntities.push(entity);
    
    // Max elevation label
    const labelEntity = viewer.entities.add({
        id: 'pass-max-elev-label',
        position: Cesium.Cartesian3.fromDegrees(satLng, satLat, satAltKm * 500),
        label: {
            text: `Max: ${maxElev.toFixed(1)}°`,
            font: '13px sans-serif',
            fillColor: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            show: true
        }
    });
    passVisualizationEntities.push(labelEntity);
}

function clearPassVisualization() {
    passVisualizationEntities.forEach(entity => {
        viewer.entities.remove(entity);
    });
    passVisualizationEntities = [];
    selectedPass = null;
}

// ============================================================================
// Pass Prediction: CSV Export
// ============================================================================

function exportPassesCSV() {
    if (passPredictions.length === 0) {
        showPassError('No passes to export.');
        return;
    }
    
    // CSV header
    const rows = ['Satellite,Start Time (UTC),End Time (UTC),Duration (s),Max Elevation (deg),Azimuth at Max (deg),Azimuth Compass'];
    
    passPredictions.forEach(pass => {
        const noradId = pass.norad_id || pass.satellite_id || '';
        const startTime = new Date(pass.start_time || pass.aos).toISOString();
        const endTime = new Date(pass.end_time || pass.los).toISOString();
        const durationSec = Math.round((new Date(pass.end_time || pass.los) - new Date(pass.start_time || pass.aos)) / 1000);
        const maxElev = (pass.max_elevation || pass.max_elev || 0).toFixed(1);
        const azimuth = (pass.azimuth_at_max || pass.az_max || 0).toFixed(1);
        const compass = azimuthToCompass(parseFloat(azimuth));
        
        rows.push(`${noradId},${startTime},${endTime},${durationSec},${maxElev},${azimuth},${compass}`);
    });
    
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `stargo-passes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log(`[Passes] Exported ${passPredictions.length} passes to CSV`);
}

// ============================================================================
// Pass Prediction: Event Handlers Setup
// ============================================================================

function setupPassEventHandlers() {
    // Use My Location button
    document.getElementById('useMyLocationBtn').addEventListener('click', getCurrentLocation);
    
    // Predict Passes button
    document.getElementById('predictPassesBtn').addEventListener('click', predictPasses);
    
    // Min elevation slider
    const minElevSlider = document.getElementById('passMinElev');
    minElevSlider.addEventListener('input', (e) => {
        document.getElementById('passMinElevValue').textContent = `${e.target.value}°`;
    });
    
    // Export CSV button
    document.getElementById('exportCSVBtn').addEventListener('click', exportPassesCSV);
    
    // Clear passes button
    document.getElementById('clearPassesBtn').addEventListener('click', () => {
        passPredictions = [];
        clearPassVisualization();
        document.getElementById('passResultsSection').style.display = 'none';
        document.getElementById('passCountdown').style.display = 'none';
        if (passCountdownInterval) {
            clearInterval(passCountdownInterval);
            passCountdownInterval = null;
        }
        // Remove observer marker
        const marker = viewer.entities.getById('observer-marker');
        if (marker) viewer.entities.remove(marker);
    });
    
    // Toggle pass panel
    document.getElementById('togglePassPanel').addEventListener('click', () => {
        const content = document.getElementById('passPanelContent');
        const btn = document.getElementById('togglePassPanel');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            btn.textContent = '\u2212';
        } else {
            content.style.display = 'none';
            btn.textContent = '+';
        }
    });
}

// ============================================================================
// Debug/Test Functions (available in console)
// ============================================================================

// Test the propagate endpoint directly
window.testPropagateEndpoint = function(noradId = 56337, horizon = 60, step = 5) {
    const url = `${CONFIG.backendUrl}/api/v1/propagate/${noradId}?horizon=${horizon}&step=${step}`;
    console.log(`[TEST] Fetching: ${url}`);
    
    return fetch(url)
        .then(response => {
            console.log(`[TEST] Response status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('[TEST] Response structure:', data);
            console.log('[TEST] First position:', data.positions[0]);
            console.log('[TEST] Position format check:', {
                hasP: !!data.positions[0].p,
                isArray: Array.isArray(data.positions[0].p),
                length: data.positions[0].p?.length,
                values: data.positions[0].p
            });
            
            // Compare with current satellite position
            const entity = entities.get(parseInt(noradId));
            if (entity) {
                const currentPos = entity.position.getValue(Cesium.JulianDate.now());
                const firstOrbitPos = new Cesium.Cartesian3(
                    data.positions[0].p[0],
                    data.positions[0].p[1],
                    data.positions[0].p[2]
                );
                const distance = Cesium.Cartesian3.distance(currentPos, firstOrbitPos);
                console.log('[TEST] Distance from current satellite to first orbit point:', {
                    distanceKm: (distance / 1000).toFixed(2),
                    currentPos: currentPos,
                    orbitPos: firstOrbitPos
                });
            }
            
            return data;
        })
        .catch(error => {
            console.error('[TEST] Error:', error);
            throw error;
        });
};

// ============================================================================
// Entry Point
// ============================================================================

window.addEventListener('DOMContentLoaded', init);
