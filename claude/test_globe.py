"""
STANDALONE GOD'S EYE RECONNAISSANCE ENGINE (SIH26009)
-----------------------------------------------------
Generates 'gods_eye_recon.html' — a standalone dual-stage orbital-to-tactical
reconnaissance viewport with smooth 3D globe to 2D 10m satellite descent.
"""

import os
import json
import pandas as pd

# Load sample drill points if available
grid_path = os.path.join(os.path.dirname(__file__), "grid_predictions.csv")
drill_targets = []

if os.path.exists(grid_path):
    grid_df = pd.read_csv(grid_path)
    balaghat_lat, balaghat_lon = 21.8700, 80.1800
    scale = 0.003
    high_yield_pts = grid_df[grid_df["ore_probability"] > 0.65].sample(
        min(50, len(grid_df[grid_df["ore_probability"] > 0.65])), random_state=42
    )
    for _, pt in high_yield_pts.iterrows():
        drill_targets.append({
            "id": f"{int(pt['x'])}-{int(pt['y'])}",
            "lat": round(balaghat_lat + (pt["y"] - 15) * scale, 4),
            "lng": round(balaghat_lon + (pt["x"] - 15) * scale, 4),
            "prob": round(float(pt["ore_probability"]), 3),
            "ndvi": round(float(pt["ndvi"]), 3),
            "temp": round(float(pt["land_temp"]), 1),
            "moisture": round(float(pt["soil_moisture"]), 3)
        })

drill_pts_json = json.dumps(drill_targets)

html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MOIL God's Eye Reconnaissance // SIH26009</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/globe.gl"></script>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html, body {{
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #020617;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      user-select: none;
    }}
    #viewportWrapper {{
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }}
    #stage3D {{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s ease;
      z-index: 1;
    }}
    #stage3D.fade-out {{
      opacity: 0;
      pointer-events: none;
      transform: scale(1.18);
    }}
    #stage2D {{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      transform: scale(0.92);
      z-index: 2;
    }}
    #stage2D.active {{
      opacity: 1;
      pointer-events: auto;
      transform: scale(1);
    }}

    /* Atmospheric Descent Scanner FX */
    #scannerFx {{
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 20;
      opacity: 0;
      background: radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, rgba(2, 6, 23, 0.7) 80%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 0.3s ease;
    }}
    #scannerFx.scanning {{ opacity: 1; }}
    .scanner-text {{
      color: #00d4ff;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 12px #00d4ff;
      margin-bottom: 8px;
    }}
    .scanner-bar {{
      width: 280px;
      height: 3px;
      background: rgba(56, 189, 248, 0.2);
      position: relative;
      overflow: hidden;
      border-radius: 2px;
    }}
    .scanner-bar::after {{
      content: '';
      position: absolute;
      top: 0; left: 0; bottom: 0;
      width: 40%;
      background: #00d4ff;
      box-shadow: 0 0 10px #00d4ff;
      animation: scanBar 0.7s infinite linear;
    }}
    @keyframes scanBar {{
      0% {{ left: -40%; }}
      100% {{ left: 100%; }}
    }}

    /* Intel HUD Overlay */
    .hud-overlay {{
      position: absolute;
      top: 14px;
      left: 16px;
      z-index: 30;
      color: #38bdf8;
      background: rgba(11, 19, 41, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 8px;
      padding: 10px 14px;
      pointer-events: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(56, 189, 248, 0.2);
    }}
    .hud-title {{
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .hud-live-dot {{
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 8px #22c55e;
      animation: blink 1.5s infinite ease-in-out;
    }}
    @keyframes blink {{
      0%, 100% {{ opacity: 1; transform: scale(1); }}
      50% {{ opacity: 0.3; transform: scale(0.8); }}
    }}
    .hud-coords {{
      font-size: 10px;
      margin-top: 3px;
      color: #94a3b8;
      font-family: 'Courier New', Courier, monospace;
      letter-spacing: 0.5px;
    }}
    .hud-target {{ color: #38bdf8; font-weight: bold; }}

    /* Vision Modes Dock */
    .hud-vision-dock {{
      position: absolute;
      top: 14px;
      right: 16px;
      z-index: 30;
      display: flex;
      gap: 5px;
      background: rgba(11, 19, 41, 0.9);
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid rgba(56, 189, 248, 0.35);
      backdrop-filter: blur(12px);
    }}
    .vision-btn {{
      background: rgba(30, 41, 59, 0.9);
      color: #94a3b8;
      border: 1px solid rgba(56, 189, 248, 0.25);
      padding: 5px 9px;
      font-size: 10px;
      font-weight: 700;
      border-radius: 4px;
      cursor: pointer;
      font-family: monospace;
      letter-spacing: 0.5px;
      transition: all 0.2s ease;
    }}
    .vision-btn:hover {{ color: #fff; border-color: #38bdf8; }}
    .vision-btn.active {{
      background: #0284c7;
      color: #fff;
      border-color: #38bdf8;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }}

    /* Dimension Switcher (3D vs 2D) & Zoom Controls */
    .hud-dim-dock {{
      position: absolute;
      top: 58px;
      right: 16px;
      z-index: 30;
      display: flex;
      gap: 5px;
      align-items: center;
      background: rgba(11, 19, 41, 0.9);
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid rgba(56, 189, 248, 0.35);
      backdrop-filter: blur(12px);
    }}
    .dim-btn {{
      background: rgba(30, 41, 59, 0.9);
      color: #94a3b8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 5px 10px;
      font-size: 10.5px;
      font-weight: 700;
      border-radius: 4px;
      cursor: pointer;
      font-family: monospace;
      letter-spacing: 0.5px;
      transition: all 0.2s ease;
    }}
    .dim-btn.active {{
      background: #0284c7;
      color: #ffffff;
      border-color: #38bdf8;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
    }}
    .zoom-btn {{
      background: rgba(15, 23, 42, 0.85);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.35);
      width: 26px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }}
    .zoom-btn:hover {{
      background: rgba(56, 189, 248, 0.25);
      color: #fff;
    }}

    .hud-stats-overlay {{
      position: absolute;
      top: 104px;
      right: 16px;
      z-index: 30;
      color: #e2e8f0;
      background: rgba(11, 19, 41, 0.88);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 9.5px;
      font-family: 'Courier New', Courier, monospace;
      pointer-events: none;
      text-align: right;
      line-height: 1.5;
    }}

    .hud-controls {{
      position: absolute;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 30;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      max-width: 95%;
      background: rgba(11, 19, 41, 0.85);
      padding: 6px 14px;
      border-radius: 24px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(56, 189, 248, 0.25);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }}
    .hud-btn {{
      background: rgba(30, 41, 59, 0.9);
      color: #e2e8f0;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }}
    .hud-btn:hover {{
      background: rgba(56, 189, 248, 0.25);
      border-color: #38bdf8;
      color: #ffffff;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
      transform: translateY(-1px);
    }}
    .hud-btn.active {{
      background: #0284c7;
      border-color: #38bdf8;
      color: #ffffff;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
    }}

    /* Tactical Center Reticle */
    .hud-crosshair {{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 52px;
      height: 52px;
      border: 1px dashed rgba(56, 189, 248, 0.35);
      border-radius: 50%;
      pointer-events: none;
      z-index: 25;
    }}
    .hud-crosshair::before, .hud-crosshair::after {{
      content: '';
      position: absolute;
      background: rgba(56, 189, 248, 0.5);
    }}
    .hud-crosshair::before {{ top: 50%; left: -10px; right: -10px; height: 1px; }}
    .hud-crosshair::after {{ left: 50%; top: -10px; bottom: -10px; width: 1px; }}
  </style>
</head>
<body>
  <div id="viewportWrapper">
    <div id="stage3D"></div>
    <div id="stage2D"></div>

    <div id="scannerFx">
      <div class="scanner-text" id="scannerMsg">DESCENT THROUGH ATMOSPHERE // SATELLITE LOCK</div>
      <div class="scanner-bar"></div>
    </div>

    <div class="hud-overlay">
      <div class="hud-title"><span class="hud-live-dot"></span> RESTRICTED // GOD'S EYE ORBITAL RECONNAISSANCE</div>
      <div class="hud-coords">ACTIVE TARGET: <span class="hud-target" id="hudTargetName">MOIL BALAGHAT FLAGSHIP MINE</span> | MGRS: <span class="hud-target">44Q KE 1827 1934</span></div>
      <div class="hud-coords">COORDINATES: <span id="hudTargetCoords">21.8700°N, 80.1800°E</span> | ALT: <span id="hudTargetAlt">TACTICAL LOCK (500 KM)</span> | ELEV: <span>305m MSL</span></div>
      <div class="hud-coords">SENSOR: <span id="hudSensorMode" style="color:#38bdf8;">SENTINEL-2 MSI (NATURAL RECON)</span></div>
    </div>

    <div class="hud-vision-dock">
      <button class="vision-btn active" id="vis-natural" onclick="setVisionMode('natural')">Natural RGB</button>
      <button class="vision-btn" id="vis-thermal" onclick="setVisionMode('thermal')">Thermal FLIR</button>
      <button class="vision-btn" id="vis-nvg" onclick="setVisionMode('nvg')">Phosphor NVG</button>
      <button class="vision-btn" id="vis-amber" onclick="setVisionMode('amber')">Amber Radar</button>
    </div>

    <div class="hud-dim-dock">
      <button class="dim-btn active" id="btn-mode-3d" onclick="transitionTo3D()">3D Orbit</button>
      <button class="dim-btn" id="btn-mode-2d" onclick="transitionTo2D()">2D Surface (10m)</button>
      <span style="color:rgba(56,189,248,0.3); margin:0 4px;">|</span>
      <button class="zoom-btn" title="Zoom In (Space to Ground)" onclick="handleZoomIn()">+</button>
      <button class="zoom-btn" title="Zoom Out (Ground to Space)" onclick="handleZoomOut()">−</button>
    </div>

    <div class="hud-stats-overlay">
      <div style="color: #38bdf8; font-weight: bold; margin-bottom: 2px;">ORBITAL TELEMETRY</div>
      <div>GSD: 10.0m RESOLUTION</div>
      <div>NIIRS: RATING 6.2 (RECON)</div>
      <div>SUN ELEVATION: 54.2° | PASS: DESCENDING</div>
      <div>DATUM: WGS84 / EGM96 GEOID</div>
      <div style="color: #22c55e; margin-top: 2px;">● NASA POWER CLIMATE SYNC</div>
    </div>

    <div class="hud-crosshair"></div>

    <div class="hud-controls">
      <button class="hud-btn active" id="btn-balaghat" onclick="focusTarget(0)">Balaghat Mine Complex</button>
      <button class="hud-btn" id="btn-ukwa" onclick="focusTarget(1)">Ukwa Deposit</button>
      <button class="hud-btn" id="btn-dongri" onclick="focusTarget(2)">Dongri Buzurg</button>
      <button class="hud-btn" id="btn-gumgaon" onclick="focusTarget(3)">Gumgaon</button>
      <button class="hud-btn" id="btn-kandri" onclick="focusTarget(4)">Kandri</button>
      <button class="hud-btn" id="btn-regional" onclick="focusRegional()"> Central India Belt</button>
      <button class="hud-btn" id="btn-orbit" onclick="orbitSpace()">Global Orbit</button>
    </div>
  </div>

  <script>
    let currentMode = '3D';
    const drillPoints = {drill_pts_json};

    const moilMines = [
      {{ id: 0, name: "Balaghat Flagship Mine", lat: 21.8700, lng: 80.1800, size: 1.2, color: "#ef4444", status: "Primary Underground Mine (Deep Orebody)", grade: "42.5% Mn", depth: "385m shaft" }},
      {{ id: 1, name: "Ukwa Manganese Deposit", lat: 21.9700, lng: 80.4700, size: 0.8, color: "#f59e0b", status: "Active Opencast & Underground", grade: "38.2% Mn", depth: "Dip 25° NW" }},
      {{ id: 2, name: "Dongri Buzurg Mine", lat: 21.5500, lng: 79.7200, size: 0.9, color: "#10b981", status: "High-Grade Dioxide Ore", grade: "48.0% Mn Dioxide", depth: "Opencast Pit" }},
      {{ id: 3, name: "Gumgaon Deposit", lat: 21.4000, lng: 79.0000, size: 0.7, color: "#38bdf8", status: "Western Belt Extraction", grade: "39.5% Mn", depth: "Underground" }},
      {{ id: 4, name: "Kandri Mine Complex", lat: 21.4300, lng: 79.2700, size: 0.75, color: "#a855f7", status: "High Mn Recovery Circuit", grade: "41.0% Mn", depth: "Opencast to Shaft" }}
    ];

    const ringsData = moilMines.map(m => ({{
      lat: m.lat,
      lng: m.lng,
      maxR: 3.8,
      propagationSpeed: 2.2,
      repeatPeriod: 1100,
      color: () => m.color
    }}));

    const container3D = document.getElementById('stage3D');
    const world = Globe()
      (container3D)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.24)
      .pointsData(moilMines)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor('color')
      .pointAltitude(0.05)
      .pointRadius(0.85)
      .pointLabel(d => `
        <div style="background: rgba(11,19,41,0.95); border: 1px solid ${{d.color}}; padding: 8px 12px; border-radius: 6px; color: #fff; font-family: sans-serif; font-size: 11px; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
          <div style="font-weight: bold; font-size: 13px; color: ${{d.color}}; margin-bottom: 2px;">${{d.name}}</div>
          <div>Coords: <b>${{d.lat.toFixed(4)}}°N, ${{d.lng.toFixed(4)}}°E</b></div>
          <div>Grade: <b>${{d.grade}}</b> | Depth: <b>${{d.depth}}</b></div>
          <div style="color: #94a3b8; margin-top: 2px;">${{d.status}}</div>
        </div>
      `)
      .ringsData(ringsData)
      .ringColor('color')
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod')
      .labelsData(moilMines)
      .labelLat('lat')
      .labelLng('lng')
      .labelText('name')
      .labelSize(1.1)
      .labelDotRadius(0.35)
      .labelColor(() => '#f8fafc')
      .labelResolution(3)
      .onPointClick(d => focusTarget(d.id));

    world.width(container3D.clientWidth || window.innerWidth);
    world.height(container3D.clientHeight || window.innerHeight);
    world.pointOfView({{ lat: 21.8700, lng: 80.1800, altitude: 0.95 }}, 2200);
    world.controls().autoRotate = false;
    world.controls().autoRotateSpeed = 0.5;
    world.controls().enableZoom = true;

    const container2D = document.getElementById('stage2D');
    const map2D = L.map('stage2D', {{
      center: [21.8700, 80.1800],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    }});

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{{z}}/{{y}}/{{x}}', {{
      maxZoom: 18
    }}).addTo(map2D);

    drillPoints.forEach(pt => {{
      const color = pt.prob > 0.80 ? '#ef4444' : '#f59e0b';
      const circle = L.circleMarker([pt.lat, pt.lng], {{
        radius: 6 + pt.prob * 6,
        color: color,
        fillColor: color,
        fillOpacity: 0.85,
        weight: 1.5
      }}).addTo(map2D);

      circle.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11.5px; width: 190px; color: #0f172a;">
          <b style="color: #0f172a; font-size: 12.5px;">Drill Target #${{pt.id}}</b><br>
          <hr style="margin: 4px 0; border: 0; border-top: 1px solid #cbd5e1;">
          Ore Probability: <b style="color: ${{color}};">${{(pt.prob * 100).toFixed(1)}}%</b><br>
          NDVI Vegetation Stress: <b>${{pt.ndvi}}</b><br>
          Surface Land Temp: <b>${{pt.temp}}°C</b><br>
          Soil Moisture Proxy: <b>${{pt.moisture}}</b><br>
          <div style="margin-top: 4px; font-size: 10px; color: #64748b;">Telemetry: Sentinel-2 + Landsat-9</div>
        </div>
      `);
    }});

    const mineIcon = L.divIcon({{
      className: 'moil-marker',
      html: '<div style="background:#1e40af; border:2px solid #38bdf8; color:#fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:14px; box-shadow:0 0 12px #38bdf8;"></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    }});
    L.marker([21.8700, 80.1800], {{ icon: mineIcon }}).addTo(map2D)
      .bindPopup("<b>MOIL Balaghat Mine Site</b><br>Primary Underground & Opencast Operations");

    window.addEventListener('resize', () => {{
      world.width(container3D.clientWidth || window.innerWidth);
      world.height(container3D.clientHeight || window.innerHeight);
      map2D.invalidateSize();
    }});

    function triggerScannerFx(msg, callback) {{
      const fx = document.getElementById('scannerFx');
      document.getElementById('scannerMsg').innerText = msg;
      fx.classList.add('scanning');
      setTimeout(() => {{
        if (callback) callback();
      }}, 350);
      setTimeout(() => {{
        fx.classList.remove('scanning');
      }}, 800);
    }}

    function transitionTo2D(targetLat, targetLng) {{
      if (currentMode === '2D') return;
      const lat = targetLat || 21.8700;
      const lng = targetLng || 80.1800;

      world.pointOfView({{ lat: lat, lng: lng, altitude: 0.22 }}, 800);

      triggerScannerFx(" ATMOSPHERIC DESCENT // ACQUIRING 10m SATELLITE LOCK", () => {{
        currentMode = '2D';
        document.getElementById('stage3D').classList.add('fade-out');
        document.getElementById('stage2D').classList.add('active');
        document.getElementById('btn-mode-3d').classList.remove('active');
        document.getElementById('btn-mode-2d').classList.add('active');

        document.getElementById('hudTargetAlt').innerText = "SURFACE (305m MSL)";
        document.getElementById('hudSensorMode').innerText = "ESRI HIGH-RES SATELLITE (10m RESOLUTION)";

        map2D.invalidateSize();
        map2D.setView([lat, lng], 14, {{ animate: true }});
      }});
    }}

    function transitionTo3D() {{
      if (currentMode === '3D') return;

      triggerScannerFx(" ASCENDING TO ORBIT // RE-ENGAGING 3D SPHERE", () => {{
        currentMode = '3D';
        document.getElementById('stage2D').classList.remove('active');
        document.getElementById('stage3D').classList.remove('fade-out');
        document.getElementById('btn-mode-2d').classList.remove('active');
        document.getElementById('btn-mode-3d').classList.add('active');

        document.getElementById('hudTargetAlt').innerText = "TACTICAL LOCK (500 KM)";
        document.getElementById('hudSensorMode').innerText = "SENTINEL-2 MSI (NATURAL RECON)";

        world.pointOfView({{ lat: 21.8700, lng: 80.1800, altitude: 0.85 }}, 1200);
      }});
    }}

    container3D.addEventListener('wheel', (e) => {{
      setTimeout(() => {{
        if (currentMode === '3D') {{
          const pov = world.pointOfView();
          if (pov.altitude <= 0.35) {{
            transitionTo2D(pov.lat, pov.lng);
          }}
        }}
      }}, 150);
    }}, {{ passive: true }});

    map2D.on('zoomend', () => {{
      if (currentMode === '2D' && map2D.getZoom() <= 10) {{
        transitionTo3D();
      }}
    }});

    function handleZoomIn() {{
      if (currentMode === '3D') {{
        const pov = world.pointOfView();
        if (pov.altitude <= 0.45) {{
          transitionTo2D(pov.lat, pov.lng);
        }} else {{
          world.pointOfView({{ altitude: Math.max(0.2, pov.altitude * 0.65) }}, 600);
        }}
      }} else {{
        map2D.zoomIn();
      }}
    }}

    function handleZoomOut() {{
      if (currentMode === '2D') {{
        if (map2D.getZoom() <= 12) {{
          transitionTo3D();
        }} else {{
          map2D.zoomOut();
        }}
      }} else {{
        const pov = world.pointOfView();
        world.pointOfView({{ altitude: Math.min(3.5, pov.altitude * 1.5) }}, 600);
      }}
    }}

    function clearActiveButtons() {{
      document.querySelectorAll('.hud-btn').forEach(b => b.classList.remove('active'));
    }}

    function focusTarget(idx) {{
      clearActiveButtons();
      const m = moilMines[idx];
      const btnMap = ['btn-balaghat', 'btn-ukwa', 'btn-dongri', 'btn-gumgaon', 'btn-kandri'];
      const btn = document.getElementById(btnMap[idx]);
      if (btn) btn.classList.add('active');

      document.getElementById('hudTargetName').innerText = m.name.toUpperCase();
      document.getElementById('hudTargetCoords').innerText = `${{m.lat.toFixed(4)}}°N, ${{m.lng.toFixed(4)}}°E`;

      if (idx === 0) {{
        transitionTo2D(m.lat, m.lng);
      }} else {{
        if (currentMode === '2D') transitionTo3D();
        document.getElementById('hudTargetAlt').innerText = "TACTICAL LOCK (500 KM)";
        world.controls().autoRotate = false;
        world.pointOfView({{ lat: m.lat, lng: m.lng, altitude: 0.7 }}, 1800);
      }}
    }}

    function focusRegional() {{
      if (currentMode === '2D') transitionTo3D();
      clearActiveButtons();
      document.getElementById('btn-regional').classList.add('active');
      document.getElementById('hudTargetName').innerText = "CENTRAL INDIA MANGANESE BELT (MOIL HUB)";
      document.getElementById('hudTargetCoords').innerText = "21.6500°N, 79.8000°E";
      document.getElementById('hudTargetAlt').innerText = "REGIONAL SURVEY (1,600 KM)";

      world.controls().autoRotate = false;
      world.pointOfView({{ lat: 21.6500, lng: 79.8000, altitude: 1.6 }}, 2000);
    }}

    function orbitSpace() {{
      if (currentMode === '2D') transitionTo3D();
      clearActiveButtons();
      document.getElementById('btn-orbit').classList.add('active');
      document.getElementById('hudTargetName').innerText = "GLOBAL ORBITAL PERSPECTIVE";
      document.getElementById('hudTargetCoords').innerText = "DEEP SPACE SURVEILLANCE";
      document.getElementById('hudTargetAlt').innerText = "GEOSTATIONARY (36,000 KM)";

      world.pointOfView({{ lat: 20.0, lng: 78.0, altitude: 3.2 }}, 2200);
      setTimeout(() => {{
        world.controls().autoRotate = true;
      }}, 2200);
    }}

    function setVisionMode(mode) {{
      document.querySelectorAll('.vision-btn').forEach(b => b.classList.remove('active'));
      const btn = document.getElementById('vis-' + mode);
      if (btn) btn.classList.add('active');

      const canvas3D = document.querySelector('#stage3D canvas');
      const leafletStage = document.getElementById('stage2D');

      const filterMap = {{
        natural: 'none',
        thermal: 'contrast(175%) saturate(250%) hue-rotate(170deg) invert(10%)',
        nvg: 'brightness(130%) contrast(160%) hue-rotate(85deg) saturate(320%)',
        amber: 'brightness(115%) contrast(165%) sepia(100%) hue-rotate(5deg) saturate(280%)'
      }};

      const atmosphereMap = {{
        natural: '#38bdf8',
        thermal: '#f97316',
        nvg: '#22c55e',
        amber: '#f59e0b'
      }};

      const sensorLabelMap = {{
        natural: 'SENTINEL-2 MSI (NATURAL RECON)',
        thermal: 'LANDSAT-9 TIRS (BAND 10 THERMAL FLUX)',
        nvg: 'PVS-14 PHOSPHOR (NIGHT VISION RECON)',
        amber: 'AN/UYS-1 TACTICAL CRT AMBER DISPLAY'
      }};

      if (canvas3D) canvas3D.style.filter = filterMap[mode] || 'none';
      if (leafletStage) leafletStage.style.filter = filterMap[mode] || 'none';
      world.atmosphereColor(atmosphereMap[mode] || '#38bdf8');
      document.getElementById('hudSensorMode').innerText = sensorLabelMap[mode] || 'SENTINEL-2 MSI';
    }}
  </script>
</body>
</html>"""

out_file = os.path.join(os.path.dirname(__file__), "gods_eye_recon.html")
with open(out_file, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated standalone reconnaissance HTML: {out_file} (Length: {len(html_content)} bytes)")
