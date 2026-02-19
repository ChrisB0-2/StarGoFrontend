# StarGo Frontend

Web-based satellite visualization using Cesium that connects to the StarGo backend SSE stream.

## Overview

This frontend displays real-time satellite positions streamed from the StarGo backend running in a RHEL VM. It uses Cesium for 3D Earth visualization and linear interpolation for smooth 60 FPS animation between keyframes.

## Architecture

- **Frontend**: Runs on host machine (browser-based)
- **Backend**: Runs in RHEL VM at `http://127.0.0.1:8080` (port forwarding) or `http://10.0.2.15:8080` (direct VM IP)
- **Communication**: Server-Sent Events (SSE) via `/api/v1/stream/keyframes`
- **Data Format**: Batch keyframes with ECEF positions in meters

## Prerequisites

1. **StarGo Backend** must be running in RHEL VM
   - Default URL: `http://127.0.0.1:8080` (with SSH port forwarding)
   - Alternative: `http://10.0.2.15:8080` (direct VM IP)

2. **Modern Web Browser** (Chrome, Firefox, Edge, Safari)
   - WebGL support required for Cesium
   - JavaScript enabled

3. **HTTP Server** (recommended to avoid CORS issues)
   - Python 3: `python -m http.server 8000`
   - Node.js: `npx http-server -p 8000`
   - Or open `index.html` directly (may have CORS issues)

## Quick Start

### 1. Start the Backend (in RHEL VM)

```bash
# SSH into RHEL VM
ssh -p 2222 star@127.0.0.1

# Navigate to StarGo directory
cd ~/stargo

# Run the backend
go run ./cmd/stargo
```

Backend should be running at: `http://127.0.0.1:8080` (or `http://10.0.2.15:8080`)

### 2. Serve the Frontend (on host machine)

**Option A: Python HTTP Server** (recommended)
```bash
cd stargo-frontend
python -m http.server 8000
```

**Option B: Node.js HTTP Server**
```bash
cd stargo-frontend
npx http-server -p 8000
```

**Option C: Direct File** (may have CORS issues)
```bash
# Just open index.html in browser
# File path: file:///C:/Users/chris/Star/stargo-frontend/index.html
```

### 3. Open in Browser

Navigate to:
- **With HTTP Server**: `http://localhost:8000`
- **Direct File**: Open `index.html` in browser

### 4. Configure Connection

1. In the **Controls Panel** (bottom-right), verify the **Backend URL**:
   - Default: `http://127.0.0.1:8080`
   - Alternative: `http://10.0.2.15:8080` (if port forwarding not working)

2. If backend uses authentication, enter **Auth Token** (optional)

3. Click **Connect** to establish SSE connection

### 5. Verify Operation

✅ **Connection Status**: Should show "Connected" (green)  
✅ **Satellites**: Count should appear (e.g., 200 satellites)  
✅ **TLE Age**: Should display (e.g., "45 min")  
✅ **FPS**: Should be 55-60 FPS  
✅ **Keyframes**: Should increment (e.g., "12")  
✅ **Visualization**: Yellow dots should appear on Earth and animate smoothly

## Configuration

Edit `app.js` to change default settings:

```javascript
const CONFIG = {
    backendUrl: 'http://127.0.0.1:8080',        // Backend URL
    authToken: null,                             // Optional auth token
    keyframeStep: 5,                             // Keyframe interval (seconds)
    horizon: 600,                                // Prediction horizon (seconds)
    maxKeyframes: 150,                           // Max keyframes in memory
    reconnectBaseDelay: 1000,                    // Reconnect delay (ms)
    reconnectMaxDelay: 30000,                    // Max reconnect delay (ms)
    cesiumToken: 'YOUR_CESIUM_ION_TOKEN'        // Cesium Ion token
};
```

## Features

### Phase 5A: Entities (Current Implementation)

- ✅ Cesium 3D Earth viewer with terrain
- ✅ SSE client with auto-reconnect
- ✅ Batch keyframe parsing
- ✅ Entity-based satellite rendering (yellow points)
- ✅ Linear interpolation for smooth 60 FPS animation
- ✅ TLE age indicator with color coding
- ✅ Connection status display
- ✅ Play/pause control
- ✅ Playback speed control (0.5x to 10x)
- ✅ Satellite labels (optional, toggle on/off)
- ✅ Reset camera view
- ✅ Clear data
- ✅ FPS counter

**Target**: 200 satellites at 60 FPS

### Phase 5B: Primitives (Future Upgrade)

- ⏳ Migrate from Entities to PointPrimitiveCollection
- ⏳ Frustum culling (only render visible satellites)
- ⏳ Performance optimizations
- ⏳ Batch updates

**Target**: 2000+ satellites at 60 FPS

## UI Controls

### Status Bar (Top)

- **Connection**: SSE connection status (Connected/Connecting/Reconnecting)
- **Satellites**: Number of satellites currently rendered
- **TLE Age**: Age of TLE data (color-coded: green < 30 min, yellow < 1 hr, red > 1 hr)
- **Dataset Epoch**: Timestamp of TLE dataset
- **FPS**: Frames per second (color-coded: green ≥ 55, yellow ≥ 30, red < 30)
- **Keyframes**: Number of keyframes stored in memory

### Controls Panel (Bottom-Right)

- **Backend URL**: Change backend URL and reconnect
- **Auth Token**: Optional authentication token
- **Connect**: Manually reconnect to backend
- **Play/Pause**: Toggle animation playback
- **Speed**: Adjust playback speed (0.5x to 10x)
- **Show Satellite Labels**: Toggle NORAD ID labels
- **Reset View**: Reset camera to default view
- **Clear Data**: Clear all satellites and keyframes

### Cesium Controls

- **Left Click + Drag**: Rotate Earth
- **Right Click + Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out
- **Middle Click + Drag**: Tilt camera
- **Left Click on Satellite**: Select satellite (show info box)

## Troubleshooting

### Connection Issues

**Problem**: "Connection Lost" or "Reconnecting..."

**Solutions**:
1. Verify backend is running: `curl http://127.0.0.1:8080/api/v1/health`
2. Check backend URL in Controls Panel
3. Try alternative URL: `http://10.0.2.15:8080` (direct VM IP)
4. Check SSH port forwarding: `ssh -L 8080:localhost:8080 -p 2222 star@127.0.0.1`
5. Check backend logs for errors

### CORS Errors

**Problem**: "CORS policy" error in browser console

**Solutions**:
1. Serve frontend via HTTP server (not `file://`)
2. Verify backend has CORS headers:
   ```go
   w.Header().Set("Access-Control-Allow-Origin", "*")
   w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
   ```
3. Check browser console for specific CORS error

### No Satellites Visible

**Problem**: Connection successful but no satellites appear

**Solutions**:
1. Wait 5-10 seconds for first keyframe batch
2. Check backend logs: `journalctl -u stargo -f` (if systemd) or terminal output
3. Verify backend is streaming: `curl -N http://127.0.0.1:8080/api/v1/stream/keyframes`
4. Check browser console for JavaScript errors
5. Click "Clear Data" and reconnect

### Poor Performance (Low FPS)

**Problem**: FPS < 30, choppy animation

**Solutions**:
1. Close other applications/browser tabs
2. Reduce number of satellites (backend configuration)
3. Disable satellite labels (checkbox in Controls Panel)
4. Disable terrain: Edit `app.js`, change `terrainProvider: Cesium.createWorldTerrain()` to `terrainProvider: undefined`
5. Upgrade to Phase 5B (Primitives) for better performance

### TLE Age Warning

**Problem**: TLE Age showing red (> 1 hour old)

**Impact**: Position accuracy degrades over time. SGP4 is accurate for ~24 hours, but LEO satellites drift faster.

**Solutions**:
1. Update TLE data in backend
2. Re-download fresh TLEs from Celestrak/Space-Track
3. Check backend `dataset_epoch` in metadata

## Data Flow

```
Backend (RHEL VM)                      Frontend (Browser)
─────────────────                      ──────────────────

1. Load TLEs                            1. Load Cesium viewer
2. Propagate with SGP4                  2. Connect to SSE endpoint
3. Generate keyframes (ECEF)            3. Receive metadata
   ↓                                       ↓
4. Stream via SSE                       4. Parse keyframe batches
   /api/v1/stream/keyframes             5. Create Cesium entities
   ↓                                       ↓
5. Send metadata once                   6. Store keyframes in memory
   {"type":"metadata", ...}             7. Interpolate positions
   ↓                                       ↓
6. Send keyframe batches                8. Update entity positions
   Every 5 seconds                         Every frame (60 FPS)
   {"type":"keyframe_batch", ...}          ↓
   ↓                                    9. Render in Cesium
7. Send keepalives                      10. Display status/metrics
   Every 30 seconds
```

## SSE Message Format

### Metadata (sent once on connect)

```json
{
  "type": "metadata",
  "dataset_epoch": "2025-01-15T12:30:45Z",
  "tle_age_seconds": 2700
}
```

### Keyframe Batch (sent every 5 seconds)

```json
{
  "type": "keyframe_batch",
  "t": "2025-01-15T12:35:00Z",
  "sat": [
    {"id": 25544, "p": [3500000.5, 4200000.2, 2800000.1]},
    {"id": 25545, "p": [1200000.3, -5800000.7, 3400000.9]},
    ...
  ]
}
```

- `t`: Timestamp (ISO 8601 UTC)
- `sat`: Array of satellites
  - `id`: NORAD ID
  - `p`: ECEF position [x, y, z] in meters

### Keepalive (sent every 30 seconds)

```
: keepalive
```

## File Structure

```
stargo-frontend/
├── index.html          # Main HTML page with Cesium viewer
├── app.js              # JavaScript application logic
│                       # - SSE client
│                       # - Entity creation/management
│                       # - Interpolation engine
│                       # - UI updates
├── styles.css          # CSS styling for UI elements
├── README.md           # This file
└── .gitignore          # Git ignore patterns
```

## Performance Targets

### Phase 5A: Entities

- **Satellites**: 200
- **FPS**: 60 (smooth interpolation)
- **Memory**: ~50 MB
- **Latency**: < 100ms (keyframe processing)

### Phase 5B: Primitives (Future)

- **Satellites**: 2000+
- **FPS**: 60 (with frustum culling)
- **Memory**: ~200 MB
- **Latency**: < 50ms (keyframe processing)

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Fully supported |
| Firefox | 88+     | ✅ Fully supported |
| Edge    | 90+     | ✅ Fully supported |
| Safari  | 14+     | ✅ Supported (minor issues) |

**Requirements**:
- WebGL 1.0 or 2.0
- JavaScript ES6+
- EventSource API (SSE)

## Known Limitations

1. **EventSource API**: Does not support custom headers (auth token in URL or cookies only)
2. **Interpolation**: Linear only (not curved orbital paths)
3. **TLE Drift**: Accuracy degrades with TLE age (update TLEs regularly)
4. **Performance**: 200 satellites max with Entities (Phase 5A)
5. **Reconnection**: Auto-reconnect with exponential backoff (max 30 seconds)

## Future Enhancements (Phase 5B)

- [ ] Migrate to PointPrimitiveCollection (better performance)
- [ ] Frustum culling (only render visible satellites)
- [ ] Batch position updates
- [ ] Curved orbital interpolation (Hermite splines)
- [ ] Satellite filtering (by altitude, orbit type, etc.)
- [ ] Orbit trail visualization
- [ ] Ground track visualization
- [ ] Satellite search/selection
- [ ] Time controls (rewind/fast-forward)
- [ ] Export satellite data (CSV/JSON)

## License

Part of the StarGo project.

## Support

For issues or questions:
1. Check backend logs: `journalctl -u stargo -f` or terminal output
2. Check browser console for JavaScript errors
3. Verify network connectivity: `curl http://127.0.0.1:8080/api/v1/health`
4. Review troubleshooting section above

## Development

### Testing Locally

```bash
# Serve frontend
python -m http.server 8000

# Open in browser
http://localhost:8000

# Check console for errors
# Press F12 → Console tab
```

### Debugging SSE Stream

```bash
# Monitor SSE stream directly
curl -N http://127.0.0.1:8080/api/v1/stream/keyframes

# Should see:
# data: {"type":"metadata",...}
# data: {"type":"keyframe_batch",...}
# : keepalive
```

### Modifying Configuration

Edit `app.js` → `CONFIG` object:

```javascript
const CONFIG = {
    backendUrl: 'http://10.0.2.15:8080',  // Change backend URL
    authToken: 'test123',                  // Add auth token
    keyframeStep: 10,                      // Change keyframe interval
    // ...
};
```

### Customizing Visuals

Edit `app.js` → `createEntities()` function:

```javascript
point: {
    pixelSize: 8,                    // Larger points
    color: Cesium.Color.RED,         // Change color
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2
}
```

## Acceptance Tests

### Setup Tests

- [x] Open `index.html` in browser (or serve via HTTP server)
- [x] Cesium viewer displays Earth
- [x] Status bar visible at top
- [x] Controls panel visible at bottom-right

### Connection Tests

- [x] Click "Connect" → Connection status changes to "Connected" (green)
- [x] Backend not running → Connection status shows "Reconnecting..." (orange)
- [x] Invalid URL → Connection status shows "Connection Failed" (red)

### Visualization Tests

- [x] Satellites appear as yellow points on Earth
- [x] Satellites move smoothly (60 FPS interpolation)
- [x] Satellite count updates in status bar
- [x] TLE age displays and color-coded correctly

### Controls Tests

- [x] Play/Pause button → Animation starts/stops
- [x] Speed selector → Animation speed changes
- [x] Show Labels checkbox → Satellite labels appear/disappear
- [x] Reset View button → Camera returns to default position
- [x] Clear Data button → Satellites removed, counters reset

### Performance Tests

- [x] 200 satellites → 60 FPS maintained
- [x] FPS counter updates every second
- [x] No memory leaks (check browser task manager)
- [x] Smooth camera movement during animation

---

**Built for StarGo - Satellite Tracking & Orbital Propagation**
