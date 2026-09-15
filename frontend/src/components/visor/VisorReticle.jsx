import React from 'react';

export function VisorReticle({ activeTarget }) {
  return (
    <>
      {/* Rotating Azimuth Bearing Dial */}
      <div className="absolute -inset-4 rounded-full border border-dashed border-sky-400/30 pointer-events-none z-10 animate-azimuth-spin">
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold text-red-400 bg-background px-1 border border-red-500/40 rounded">
          000° N
        </div>
        <div className="absolute top-1/2 -right-3 -translate-y-1/2 font-mono text-[8px] font-bold text-sky-400 bg-background px-1 border border-sky-400/40 rounded">
          090° E
        </div>
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold text-sky-400 bg-background px-1 border border-sky-400/40 rounded">
          180° S
        </div>
        <div className="absolute top-1/2 -left-3 -translate-y-1/2 font-mono text-[8px] font-bold text-sky-400 bg-background px-1 border border-sky-400/40 rounded">
          270° W
        </div>
      </div>

      {/* Sweeping Radar Beam */}
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,212,255,0.18)_0deg,transparent_60deg)] animate-radar-sweep pointer-events-none z-15" />

      {/* Center Reticle Crosshairs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-dashed border-sky-400/60 pointer-events-none z-25">
        <div className="absolute top-1/2 -left-3 -right-3 h-[1px] bg-sky-400/80" />
        <div className="absolute left-1/2 -top-3 -bottom-3 w-[1px] bg-sky-400/80" />
      </div>

      {/* Concentric Distance Range Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-dotted border-sky-400/20 pointer-events-none z-12" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-dotted border-sky-400/15 pointer-events-none z-12" />

      {/* Flanking Speed & Altitude Rims */}
      <div className="hidden sm:flex absolute top-1/4 bottom-1/4 -left-12 flex-col justify-between text-[8px] font-mono text-white/40 border-r border-sky-400/30 pr-1.5 pointer-events-none z-25 text-right">
        <span>100%</span>
        <span>80%</span>
        <span>60%</span>
        <span>40%</span>
        <span>20%</span>
        <span>0%</span>
        <div className="text-[7px] font-bold text-sky-400 uppercase [writing-mode:vertical-lr] rotate-180 self-center my-auto">
          ORE PROBABILITY
        </div>
      </div>

      <div className="hidden sm:flex absolute top-1/4 bottom-1/4 -right-12 flex-col justify-between text-[8px] font-mono text-white/40 border-l border-sky-400/30 pl-1.5 pointer-events-none z-25 text-left">
        <span>600m</span>
        <span>500m</span>
        <span>400m</span>
        <span>300m</span>
        <span>200m</span>
        <span>100m</span>
        <div className="text-[7px] font-bold text-sky-400 uppercase [writing-mode:vertical-lr] self-center my-auto">
          SURFACE ELEVATION
        </div>
      </div>
    </>
  );
}
