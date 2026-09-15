import React, { useState } from 'react';
import { GlobeStage } from './GlobeStage';
import { SatelliteStage } from './SatelliteStage';
import { VisorReticle } from './VisorReticle';
import { FlirOverlay } from './FlirOverlay';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Globe, Map, Eye, Layers, Compass, Crosshair } from 'lucide-react';

export function GodsEyeVisor({
  mines,
  activeTarget,
  onTargetSelect,
  gridData
}) {
  const [dimension, setDimension] = useState('3D'); // '3D' or '2D'
  const [opticsMode, setOpticsMode] = useState('natural'); // 'natural', 'flir', 'nvg', 'amber'
  const [activeLayer, setActiveLayer] = useState('ore'); // 'ore', 'alpha', 'pit', 'water', 'thermal', 'ndvi'
  const [targetLocation, setTargetLocation] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const triggerTransition = (newDim, targetLat, targetLon, message) => {
    setIsScanning(true);
    setScanMessage(message || (newDim === '2D' ? 'TRANSITIONING // 10m SATELLITE RECON' : 'GLOBAL VIEW // 3D SPHERE'));
    if (targetLat && targetLon) {
      setTargetLocation({ lat: targetLat, lon: targetLon });
    }
    setTimeout(() => {
      setDimension(newDim);
    }, 400);
    setTimeout(() => {
      setIsScanning(false);
    }, 900);
  };

  const handleDoubleClickedGlobe = (lat, lng) => {
    triggerTransition('2D', lat, lng, 'TARGET SELECTED // 10m RECON');
  };

  const handleAscendTo3D = () => {
    triggerTransition('3D', null, null, 'GLOBAL ORBIT VIEW');
  };

  const layersList = [
    { id: 'ore', label: 'Ore Probability', code: 'RF Prob', color: '#ef4444' },
    { id: 'alpha', label: 'AlphaEarth 64-D', code: 'v · s', color: '#38bdf8' },
    { id: 'pit', label: 'Pit Divergence ΔE', code: 'Shift', color: '#f59e0b' },
    { id: 'water', label: 'SAR Waterlogging', code: 'VV/VH', color: '#0284c7' },
    { id: 'thermal', label: 'Landsat Thermal', code: 'Band 10', color: '#f43f5e' },
    { id: 'ndvi', label: 'Sentinel-2 NDVI', code: 'Chlorophyll', color: '#10b981' }
  ];

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-zinc-950 via-[#0a0a0f] to-zinc-950 border border-white/10 p-4 sm:p-6 overflow-hidden flex flex-col items-center justify-center min-h-[740px] shadow-2xl">
      {/* Top Header Controls Overlay */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-3 z-30 px-2">
        <div className="flex items-center gap-2 font-mono text-xs text-sky-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold tracking-wider">GEOSPATIAL RECONNAISSANCE INTERFACE</span>
        </div>

        {/* Optics Mode Selector */}
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-white/10 p-1 rounded-lg backdrop-blur-md">
          <button
            onClick={() => setOpticsMode('natural')}
            className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded transition-all ${
              opticsMode === 'natural' ? 'bg-sky-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Natural RGB
          </button>
          <button
            onClick={() => setOpticsMode('flir')}
            className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded transition-all ${
              opticsMode === 'flir' ? 'bg-rose-700 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Thermal FLIR
          </button>
          <button
            onClick={() => setOpticsMode('nvg')}
            className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded transition-all ${
              opticsMode === 'nvg' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Phosphor NVG
          </button>
          <button
            onClick={() => setOpticsMode('amber')}
            className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded transition-all ${
              opticsMode === 'amber' ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Amber Radar
          </button>
        </div>

        {/* 3D vs 2D Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-white/10 p-1 rounded-lg backdrop-blur-md">
          <button
            onClick={() => triggerTransition('3D')}
            className={`px-3 py-1 text-xs font-mono font-medium rounded flex items-center gap-1.5 transition-all ${
              dimension === '3D' ? 'bg-sky-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            3D ORBIT
          </button>
          <button
            onClick={() => triggerTransition('2D', activeTarget?.lat, activeTarget?.lon)}
            className={`px-3 py-1 text-xs font-mono font-medium rounded flex items-center gap-1.5 transition-all ${
              dimension === '2D' ? 'bg-sky-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Map className="h-3.5 w-3.5" />
            2D GROUND (10m)
          </button>
        </div>
      </div>

      {/* Main Recon Stage with Flanking Floating Cards */}
      <div className="relative w-full flex items-center justify-center py-4">
        {/* Floating Left HUD Card (Data Layers) */}
        <div className="hidden xl:block absolute left-4 top-4 w-60 rounded-xl border border-white/10 bg-surface/85 p-3.5 shadow-2xl backdrop-blur-md z-30 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2.5">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Space Sensors
            </span>
            <span className="text-emerald-400 text-[9.5px]">6 SYNCS</span>
          </div>

          <div className="space-y-1">
            {layersList.map((lay) => (
              <div
                key={lay.id}
                onClick={() => {
                  setActiveLayer(lay.id);
                  if (dimension === '3D') {
                    triggerTransition('2D', activeTarget?.lat, activeTarget?.lon, `ENGAGING ${lay.label.toUpperCase()} SENSOR MATRIX`);
                  }
                }}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  activeLayer === lay.id
                    ? 'bg-sky-950/70 border border-primary/50 text-sky-400 font-bold'
                    : 'bg-zinc-900/40 hover:bg-zinc-900/80 text-zinc-300 border border-transparent'
                }`}
              >
                <span>{lay.label}</span>
                <span style={{ color: lay.color }} className="text-[10px] font-extrabold">
                  {lay.code}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 text-[9px] text-zinc-400 space-y-1">
            <div>DATUM: WGS84 / EGM96</div>
            <div>NIIRS: RATING 6.2 (RECON)</div>
            <div className="text-emerald-400 font-semibold">● NASA POWER CLIMATE SYNC</div>
          </div>
        </div>

        {/* -------------------------------------------------------------
             THE CIRCULAR GOD'S EYE VISOR (100% ROUND KEYHOLE SCOPE)
             ------------------------------------------------------------- */}
        <div className="relative flex items-center justify-center">
          <div className="visor-keyhole">
            {/* 3D Earth Globe Stage */}
            <GlobeStage
              isActive={dimension === '3D'}
              mines={mines}
              activeTarget={activeTarget}
              opticsMode={opticsMode}
              onMineSelect={(m) => onTargetSelect(m)}
              onDoubleClickedLocation={handleDoubleClickedGlobe}
            />

            {/* 2D 10m High-Resolution Tactical Satellite Stage */}
            <SatelliteStage
              isActive={dimension === '2D'}
              targetLocation={targetLocation}
              activeMine={activeTarget}
              gridData={gridData}
              activeLayer={activeLayer}
              opticsMode={opticsMode}
              onAscendTo3D={handleAscendTo3D}
            />

            {/* Tactical Crosshair Reticle & Range Rings */}
            <VisorReticle activeTarget={activeTarget} />

            {/* FLIR / NVG Scanline FX Overlay */}
            <FlirOverlay opticsMode={opticsMode} />

            {/* Scanner Pulse Overlay on Transition */}
            {isScanning && (
              <div className="absolute inset-0 rounded-full z-40 bg-radial-gradient flex flex-col items-center justify-center pointer-events-none bg-sky-950/70 backdrop-blur-sm animate-in fade-in">
                <div className="text-primary font-mono text-xs font-extrabold tracking-widest uppercase mb-2 animate-pulse">
                  {scanMessage}
                </div>
                <div className="w-36 h-1 bg-sky-900 rounded overflow-hidden">
                  <div className="w-full h-full bg-primary animate-ping" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Right HUD Card (Concession Telemetry) */}
        <div className="hidden xl:block absolute right-4 top-4 w-64 rounded-xl border border-white/10 bg-surface/85 p-3.5 shadow-2xl backdrop-blur-md z-30 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2.5">
            <span className="flex items-center gap-1.5">
              <Crosshair className="h-3.5 w-3.5" />
              Target Lock
            </span>
            <Badge variant="tactical" className="text-[9px] px-1.5 py-0">
              {activeTarget?.status ? 'TRACKING' : 'LOCKED'}
            </Badge>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-zinc-500">CONCESSION:</span>
              <span className="text-foreground font-bold">{activeTarget?.name || 'BALAGHAT'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-zinc-500">BELT:</span>
              <span className="text-sky-400">{activeTarget?.belt || 'Sausar Belt'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-zinc-500">GPS:</span>
              <span className="text-foreground font-mono">
                {activeTarget?.lat.toFixed(4)}°N, {activeTarget?.lon.toFixed(4)}°E
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-zinc-500">MGRS GRID:</span>
              <span className="text-amber-400">{activeTarget?.mgrs || '44Q KM 1800 8700'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-zinc-500">ORE GRADE:</span>
              <span className="text-amber-400 font-bold">{activeTarget?.grade || '42.5% Mn'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-zinc-500">ELEVATION:</span>
              <span className="text-foreground">{activeTarget?.elev || 305}m MSL</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-zinc-500">EXTRACTION:</span>
              <span className="text-foreground">{activeTarget?.type || 'Underground'}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-zinc-500">ANNUAL OUTPUT:</span>
              <span className="text-emerald-400 font-bold">{activeTarget?.annual_output || '450k t/yr'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Pan-India Quick-Lock Dock */}
      <div className="w-full flex flex-wrap items-center justify-center gap-1.5 mt-3 z-30 max-w-5xl px-2">
        {mines.slice(0, 8).map((m) => (
          <button
            key={m.id}
            onClick={() => onTargetSelect(m)}
            className={`px-3 py-1.5 rounded-full font-mono text-[10.5px] font-semibold transition-all whitespace-nowrap ${
              activeTarget?.id === m.id
                ? 'bg-sky-600 text-white shadow-[0_0_12px_rgba(0,212,255,0.4)] border border-sky-400'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-white/10'
            }`}
          >
            {m.name.replace(' Complex', '').replace(' Group of Mines', '').replace(' Deposits', '')}
          </button>
        ))}
      </div>
    </div>
  );
}
