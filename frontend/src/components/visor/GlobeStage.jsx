import React, { useEffect, useRef } from 'react';
import Globe from 'globe.gl';

export function GlobeStage({
  isActive,
  mines,
  activeTarget,
  opticsMode,
  onMineSelect,
  onDoubleClickedLocation
}) {
  const containerRef = useRef(null);
  const globeInstanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let globe = null;

    try {
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.round(rect.width) || 560;
      const h = Math.round(rect.height) || 560;

      const ringsData = (mines || []).map((m) => ({
        lat: m.lat,
        lng: m.lon,
        maxR: 4.2,
        propagationSpeed: 2.2,
        repeatPeriod: 1100,
        color: () => m.color || '#38bdf8'
      }));

      globe = Globe()(containerRef.current)
        .width(w)
        .height(h)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
        .atmosphereColor('#00d4ff')
        .atmosphereAltitude(0.24)
        .pointsData(mines || [])
        .pointLat('lat')
        .pointLng('lon')
        .pointColor((d) => d.color || '#38bdf8')
        .pointAltitude(0.06)
        .pointRadius(0.85)
        .pointLabel((d) => `
          <div style="background: rgba(18,18,21,0.95); border: 1px solid ${d.color || '#38bdf8'}; padding: 8px 12px; border-radius: 6px; color: #fafafa; font-family: monospace; font-size: 11px;">
            <div style="font-weight: bold; color: ${d.color || '#38bdf8'};">${d.name}</div>
            <div>Belt: <b>${d.belt}</b> | ${d.state}</div>
            <div>Grade: <b>${d.grade}</b> | Elev: <b>${d.elev}m</b></div>
            <div style="color: #94a3b8; margin-top: 2px;">Double-click to descend into 10m surface</div>
          </div>
        `)
        .ringsData(ringsData)
        .ringColor('color')
        .ringMaxRadius('maxR')
        .ringPropagationSpeed('propagationSpeed')
        .ringRepeatPeriod('repeatPeriod')
        .labelsData(mines || [])
        .labelLat('lat')
        .labelLng('lon')
        .labelText('name')
        .labelSize(1.1)
        .labelDotRadius(0.35)
        .labelColor(() => '#fafafa')
        .labelResolution(3)
        .onPointClick((d) => onMineSelect && onMineSelect(d));

      globeInstanceRef.current = globe;

      // Center initial camera smoothly on India
      globe.pointOfView({ lat: 21.8700, lng: 80.1800, altitude: 1.8 }, 1000);
      globe.controls().autoRotate = false;
      globe.controls().enableZoom = true;

      // Double-click handler on canvas to descend smoothly into 2D mode
      const canvas = containerRef.current.querySelector('canvas');
      if (canvas) {
        canvas.addEventListener('dblclick', () => {
          if (!globeInstanceRef.current) return;
          const pov = globeInstanceRef.current.pointOfView();
          globeInstanceRef.current.pointOfView({ lat: pov.lat, lng: pov.lng, altitude: 0.2 }, 700);
          setTimeout(() => {
            if (onDoubleClickedLocation) {
              onDoubleClickedLocation(pov.lat, pov.lng);
            }
          }, 700);
        });
      }
    } catch (err) {
      console.error('Globe initialization error:', err);
    }

    // Auto-resize with ResizeObserver
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.round(entry.contentRect.width);
        const height = Math.round(entry.contentRect.height);
        if (width > 0 && height > 0 && globeInstanceRef.current) {
          globeInstanceRef.current.width(width);
          globeInstanceRef.current.height(height);
        }
      }
    });

    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    return () => {
      ro.disconnect();
      if (globeInstanceRef.current) {
        try {
          globeInstanceRef.current._destructor?.();
        } catch (e) {
          // ignore destructor cleanup edge cases
        }
        globeInstanceRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [mines]);

  // Target camera orientation when activeTarget changes
  useEffect(() => {
    if (globeInstanceRef.current && activeTarget && isActive) {
      globeInstanceRef.current.pointOfView(
        { lat: activeTarget.lat, lng: activeTarget.lon, altitude: 1.2 },
        1200
      );
    }
  }, [activeTarget, isActive]);

  // Pause / Resume Three.js render loop when active to eliminate background GPU drain
  useEffect(() => {
    if (!globeInstanceRef.current) return;
    try {
      if (isActive) {
        if (typeof globeInstanceRef.current.resumeAnimation === 'function') {
          globeInstanceRef.current.resumeAnimation();
        }
      } else {
        if (typeof globeInstanceRef.current.pauseAnimation === 'function') {
          globeInstanceRef.current.pauseAnimation();
        }
      }
    } catch (e) {
      // guard
    }
  }, [isActive]);

  // Optical filters mapping
  const filterMap = {
    natural: 'none',
    flir: 'contrast(180%) saturate(0%) invert(90%) hue-rotate(180deg) brightness(110%)',
    nvg: 'brightness(135%) contrast(165%) hue-rotate(85deg) saturate(340%)',
    amber: 'brightness(115%) contrast(170%) sepia(100%) hue-rotate(5deg) saturate(280%)'
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 rounded-full overflow-hidden transition-all duration-500 ${
        isActive ? 'opacity-100 pointer-events-auto scale-100 z-10' : 'opacity-0 pointer-events-none scale-105 z-0'
      }`}
      style={{ filter: filterMap[opticsMode] || 'none' }}
    />
  );
}
