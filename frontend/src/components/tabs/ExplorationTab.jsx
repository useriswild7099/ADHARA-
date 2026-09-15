import React from 'react';
import { GodsEyeVisor } from '../visor/GodsEyeVisor';
import { Card } from '../ui/card';
import { Info, Satellite, Cpu, MapPin } from 'lucide-react';

export function ExplorationTab({
  mines,
  activeTarget,
  onTargetSelect,
  gridData
}) {
  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            Module 1: Multi-Spectral Mineral Exploration & Reconnaissance
          </h2>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Fusing Google Earth Engine AlphaEarth 64-D Foundation Embeddings with Sentinel-1 SAR & Landsat-9 Thermal Flux.
          </p>
        </div>
      </div>

      {/* Geospatial Reconnaissance Visor */}
      <GodsEyeVisor
        mines={mines}
        activeTarget={activeTarget}
        onTargetSelect={onTargetSelect}
        gridData={gridData}
      />

      {/* Telemetry Cards Ribbon Below Visor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <Card className="p-3.5 sm:p-4 bg-surface/70">
          <div className="text-[10px] sm:text-[10.5px] font-semibold text-muted-foreground uppercase font-mono">
            Active Concession
          </div>
          <div className="text-xs sm:text-sm font-bold font-mono text-foreground mt-1 flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
            <span className="truncate">{activeTarget?.name}</span>
          </div>
          <div className="text-[11px] sm:text-xs text-sky-400 font-mono mt-0.5 sm:mt-1">
            {activeTarget?.lat.toFixed(4)}°N, {activeTarget?.lon.toFixed(4)}°E
          </div>
        </Card>

        <Card className="p-4 bg-surface/70">
          <div className="text-[10.5px] font-semibold text-muted-foreground uppercase font-mono">
            Sensor Constellation
          </div>
          <div className="text-sm font-bold font-mono text-foreground mt-1 flex items-center gap-1.5">
            <Satellite className="h-4 w-4 text-emerald-400" />
            AlphaEarth + Sentinel-1/2
          </div>
          <div className="text-xs text-emerald-400 font-mono mt-1">
            ● 64-D Latent Embeddings Synced
          </div>
        </Card>

        <Card className="p-4 bg-surface/70">
          <div className="text-[10.5px] font-semibold text-muted-foreground uppercase font-mono">
            Orebody Characteristic
          </div>
          <div className="text-sm font-bold font-mono text-foreground mt-1">
            {activeTarget?.grade}
          </div>
          <div className="text-xs text-amber-400 font-mono mt-1">
            {activeTarget?.depth} | {activeTarget?.elev}m MSL
          </div>
        </Card>

        <Card className="p-4 bg-surface/70">
          <div className="text-[10.5px] font-semibold text-muted-foreground uppercase font-mono">
            Mining Belt & State
          </div>
          <div className="text-sm font-bold font-mono text-foreground mt-1">
            {activeTarget?.belt}
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-1">
            {activeTarget?.state} | {activeTarget?.operator}
          </div>
        </Card>
      </div>

      {/* Deep-Dive Sensor Physics Accordion Card */}
      <Card className="p-5 bg-surface/50 border border-white/10 font-sans">
        <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info className="h-4 w-4" />
          Space-to-Ground Geological Remote Sensing Foundations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-300 leading-relaxed mt-3">
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5">
            <b className="text-foreground block mb-1 text-emerald-400">1. Sentinel-2 Chlorophyll Anomaly (NDVI)</b>
            Deep manganese beds alter soil geochemistry. Surface vegetation experiences heavy metal phytotoxicity, dampening near-infrared (NIR) reflection captured by Sentinel-2 Band 8.
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5">
            <b className="text-foreground block mb-1 text-amber-400">2. Landsat-9 Thermal Inertia (Band 10)</b>
            Massive manganese ore has high specific gravity (~4.8), resulting in high volumetric thermal capacity. Thermal sensors record lower daytime heating and delayed nocturnal cooling.
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5">
            <b className="text-foreground block mb-1 text-sky-400">3. AlphaEarth 64-D Latent Fusion (GEE)</b>
            Pretrained foundation representations condense multi-year Sentinel-1 SAR and optical bands into 64-D unit vectors. Cosine similarity against Braunite ore signatures pinpoints hidden veins.
          </div>
        </div>
      </Card>
    </div>
  );
}
