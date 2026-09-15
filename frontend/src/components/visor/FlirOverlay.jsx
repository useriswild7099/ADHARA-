import React from 'react';

export function FlirOverlay({ opticsMode }) {
  if (opticsMode === 'natural') return null;

  return (
    <div className="absolute inset-0 pointer-events-none rounded-full overflow-hidden z-20">
      {/* Scanline pattern */}
      {(opticsMode === 'flir' || opticsMode === 'amber') && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
            backgroundSize: '100% 4px'
          }}
        />
      )}

      {/* Tactical Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.85)]" />

      {/* Mode Tag */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-[9px] font-extrabold tracking-widest uppercase px-3 py-1 rounded bg-black/70 border border-white/20 text-white shadow-lg">
        {opticsMode === 'flir' && 'THERMAL INFRARED (FLIR) // EMISSIVITY INVERSION'}
        {opticsMode === 'nvg' && 'NIGHT OPTICS (NVG) // PHOSPHOR ENHANCED'}
        {opticsMode === 'amber' && 'RADAR PHOSPHOR DISPLAY (AMBER)'}
      </div>
    </div>
  );
}
