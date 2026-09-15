import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon URLs for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function SatelliteStage({
  isActive,
  targetLocation,
  activeMine,
  gridData,
  activeLayer,
  opticsMode,
  onAscendTo3D
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [layerMeta, setLayerMeta] = useState({ title: '', count: 0, range: '' });

  // 1. Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const initialLat = activeMine?.lat || 21.8700;
      const initialLon = activeMine?.lon || 80.1800;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        doubleClickZoom: false
      });

      // Esri World Imagery (10m high-resolution satellite basemap)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      ).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Double-click smooth zoom in 2D
      map.on('dblclick', (e) => {
        map.setView(e.latlng, Math.min(18, map.getZoom() + 2), { animate: true });
      });

      // Ascend to 3D when zoomed out past threshold
      map.on('zoomend', () => {
        if (map.getZoom() <= 10 && onAscendTo3D) {
          onAscendTo3D();
        }
      });
    } catch (err) {
      console.error('Leaflet initialization error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Invalidate map size when stage becomes active or container resizes
  useEffect(() => {
    if (!isActive || !mapInstanceRef.current) return;

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const timer1 = setTimeout(handleResize, 50);
    const timer2 = setTimeout(handleResize, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isActive]);

  // 3. Update map center when activeMine or targetLocation changes
  useEffect(() => {
    if (mapInstanceRef.current && activeMine) {
      const lat = targetLocation?.lat || activeMine.lat;
      const lon = targetLocation?.lon || activeMine.lon;
      mapInstanceRef.current.setView([lat, lon], 14, { animate: true });
      if (isActive) {
        mapInstanceRef.current.invalidateSize();
      }
    }
  }, [activeMine, targetLocation, isActive]);

  // 4. Render markers ONLY when map is active and ready
  useEffect(() => {
    if (!isActive || !mapInstanceRef.current || !markersLayerRef.current || !gridData || !activeMine) return;

    // Filter locations matching active sensor layer
    let selectedCells = [];
    let metaTitle;
    let metaRange;

    if (activeLayer === 'ore') {
      selectedCells = [...gridData]
        .sort((a, b) => b.ore_probability - a.ore_probability)
        .slice(0, 48);
      metaTitle = 'Ore Probability Hotspots';
      const minP = selectedCells[selectedCells.length - 1]?.ore_probability || 0;
      const maxP = selectedCells[0]?.ore_probability || 1;
      metaRange = `${(minP * 100).toFixed(0)}% - ${(maxP * 100).toFixed(0)}%`;
    } else if (activeLayer === 'alpha') {
      selectedCells = [...gridData]
        .sort((a, b) => b.alphaearth_similarity - a.alphaearth_similarity)
        .slice(0, 48);
      metaTitle = 'AlphaEarth 64-D Foundation Matches';
      const minSim = selectedCells[selectedCells.length - 1]?.alphaearth_similarity || 0;
      const maxSim = selectedCells[0]?.alphaearth_similarity || 1;
      metaRange = `${minSim.toFixed(3)} - ${maxSim.toFixed(3)}`;
    } else if (activeLayer === 'pit') {
      selectedCells = [...gridData]
        .sort((a, b) => b.delta_e - a.delta_e)
        .slice(0, 48);
      metaTitle = 'Pit Footprint Divergence (2017-2024)';
      const minDe = selectedCells[selectedCells.length - 1]?.delta_e || 0;
      const maxDe = selectedCells[0]?.delta_e || 0.1;
      metaRange = `${minDe.toFixed(3)} - ${maxDe.toFixed(3)}`;
    } else if (activeLayer === 'water') {
      selectedCells = [...gridData]
        .sort((a, b) => b.waterlogging_risk - a.waterlogging_risk)
        .slice(0, 48);
      metaTitle = 'SAR Radar Inundation Hazard';
      const minW = selectedCells[selectedCells.length - 1]?.waterlogging_risk || 0;
      const maxW = selectedCells[0]?.waterlogging_risk || 1;
      metaRange = `${(minW * 100).toFixed(0)}% - ${(maxW * 100).toFixed(0)}% Hazard`;
    } else if (activeLayer === 'thermal') {
      selectedCells = [...gridData]
        .sort((a, b) => b.land_temp - a.land_temp)
        .slice(0, 48);
      metaTitle = 'Landsat-9 Thermal Flux Anomalies';
      const minT = selectedCells[selectedCells.length - 1]?.land_temp || 0;
      const maxT = selectedCells[0]?.land_temp || 45;
      metaRange = `${minT.toFixed(1)}°C - ${maxT.toFixed(1)}°C`;
    } else {
      selectedCells = [...gridData]
        .sort((a, b) => a.ndvi - b.ndvi)
        .slice(0, 48);
      metaTitle = 'Geobotanical Chlorophyll Drop (NDVI)';
      const minN = selectedCells[0]?.ndvi || 0;
      const maxN = selectedCells[selectedCells.length - 1]?.ndvi || 1;
      metaRange = `NDVI ${minN.toFixed(2)} - ${maxN.toFixed(2)}`;
    }

    setLayerMeta({ title: metaTitle, count: selectedCells.length, range: metaRange });

    const centerLat = activeMine.lat;
    const centerLon = activeMine.lon;
    const scale = 0.0028; // ~300 meters per grid unit

    // Delay marker rendering to ensure Leaflet's renderer bounds are ready
    const animFrame = requestAnimationFrame(() => {
      try {
        if (!markersLayerRef.current || !mapInstanceRef.current) return;
        markersLayerRef.current.clearLayers();

        selectedCells.forEach((pt, rank) => {
          const targetLat = Number((centerLat + (pt.y - 15) * scale).toFixed(5));
          const targetLon = Number((centerLon + (pt.x - 15) * scale).toFixed(5));

          let color;
          let radius;
          let valLabel;
          let rankBadge = `#${rank + 1}`;

          if (activeLayer === 'ore') {
            color = pt.ore_probability > 0.80 ? '#ef4444' : '#f59e0b';
            radius = 6 + pt.ore_probability * 6;
            valLabel = `Ore Probability: <b style="color:${color}">${(pt.ore_probability * 100).toFixed(1)}%</b>`;
          } else if (activeLayer === 'alpha') {
            color = pt.alphaearth_similarity > 0.35 ? '#a855f7' : '#00d4ff';
            radius = 5 + pt.alphaearth_similarity * 8;
            valLabel = `AlphaEarth Sim: <b style="color:${color}">${pt.alphaearth_similarity.toFixed(3)}</b>`;
          } else if (activeLayer === 'pit') {
            color = pt.delta_e >= 0.05 ? '#ef4444' : pt.delta_e >= 0.02 ? '#f59e0b' : '#10b981';
            radius = 6 + pt.delta_e * 90;
            valLabel = `Pit Divergence: <b style="color:${color}">${pt.delta_e.toFixed(3)}</b>`;
          } else if (activeLayer === 'water') {
            color = pt.waterlogging_risk > 0.45 ? '#0284c7' : '#38bdf8';
            radius = 6 + pt.waterlogging_risk * 8;
            valLabel = `Waterlogging Hazard: <b style="color:${color}">${(pt.waterlogging_risk * 100).toFixed(1)}%</b>`;
          } else if (activeLayer === 'thermal') {
            color = pt.land_temp > 35 ? '#ef4444' : '#f59e0b';
            radius = 6 + (pt.land_temp - 25) * 0.4;
            valLabel = `Surface Thermal Flux: <b style="color:${color}">${pt.land_temp}°C</b>`;
          } else {
            color = pt.ndvi < 0.35 ? '#ef4444' : '#10b981';
            radius = 6 + (1 - pt.ndvi) * 6;
            valLabel = `Chlorophyll Stress (NDVI): <b style="color:${color}">${pt.ndvi}</b>`;
          }

          const marker = L.circleMarker([targetLat, targetLon], {
            radius,
            color,
            fillColor: color,
            fillOpacity: 0.85,
            weight: 1.5
          }).addTo(markersLayerRef.current);

          marker.bindPopup(`
            <div style="font-family: monospace; font-size: 11px; color: #09090b; width: 220px;">
              <div style="font-weight: bold; font-size: 12px; color: #0284c7; margin-bottom: 2px;">
                ${activeMine.name} // Target ${rankBadge}
              </div>
              <div style="font-size: 10px; color: #64748b;">GPS: ${targetLat.toFixed(4)}°N, ${targetLon.toFixed(4)}°E</div>
              <hr style="margin: 4px 0; border: 0; border-top: 1px solid #cbd5e1;">
              ${valLabel}<br>
              <div style="margin-top: 4px; font-size: 10px; line-height: 1.5; color: #334155;">
                • AlphaEarth Sim: <b>${pt.alphaearth_similarity?.toFixed(2) || '0.35'}</b><br>
                • Pit Divergence: <b>${pt.delta_e?.toFixed(3) || '0.02'}</b><br>
                • SAR Water Hazard: <b>${(pt.waterlogging_risk * 100).toFixed(0)}%</b><br>
                • Surface Temp: <b>${pt.land_temp}°C</b> | NDVI: <b>${pt.ndvi}</b>
              </div>
            </div>
          `);
        });

        // Add Central Mine Headquarters Landmark
        const minePin = L.divIcon({
          className: 'mine-pin',
          html: `<div style="background:#0284c7; border:2.5px solid #00d4ff; color:#fff; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; font-family:monospace; box-shadow:0 0 16px #00d4ff;">HQ</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        L.marker([centerLat, centerLon], { icon: minePin })
          .addTo(markersLayerRef.current)
          .bindPopup(`
            <div style="font-family: monospace; font-size: 11.5px; color: #09090b; width: 200px;">
              <b style="color: #0284c7; font-size: 13px;">${activeMine.name}</b><br>
              <hr style="margin: 3px 0; border: 0; border-top: 1px solid #cbd5e1;">
              Belt: <b>${activeMine.belt}</b> (${activeMine.state})<br>
              Grade: <b style="color:#d97706;">${activeMine.grade}</b><br>
              Depth: <b>${activeMine.depth}</b><br>
              Elevation: <b>${activeMine.elev}m MSL</b><br>
              Annual Output: <b>${activeMine.annual_output}</b>
            </div>
          `);
      } catch (err) {
        console.warn('Leaflet marker render error guarded:', err);
      }
    });

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isActive, activeLayer, gridData, activeMine]);

  const filterMap = {
    natural: 'none',
    flir: 'contrast(180%) saturate(0%) invert(90%) hue-rotate(180deg) brightness(110%)',
    nvg: 'brightness(135%) contrast(165%) hue-rotate(85deg) saturate(340%)',
    amber: 'brightness(115%) contrast(170%) sepia(100%) hue-rotate(5deg) saturate(280%)'
  };

  return (
    <div
      ref={mapContainerRef}
      className={`absolute inset-0 rounded-full overflow-hidden transition-all duration-500 ${
        isActive ? 'opacity-100 pointer-events-auto scale-100 z-20' : 'opacity-0 pointer-events-none scale-95 z-0'
      }`}
      style={{ filter: filterMap[opticsMode] || 'none' }}
    >
      {/* Floating HUD Telemetry Badge inside circular visor */}
      {isActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-950/85 border border-sky-400/30 rounded-full px-3.5 py-1 text-[9.5px] font-mono font-bold text-sky-400 shadow-xl backdrop-blur-md pointer-events-none z-30 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{layerMeta.title}</span>
          <span className="text-zinc-500">|</span>
          <span className="text-amber-400">{layerMeta.range}</span>
          <span className="text-zinc-500">|</span>
          <span className="text-white">{layerMeta.count} Dynamic Hotspots</span>
        </div>
      )}
    </div>
  );
}
