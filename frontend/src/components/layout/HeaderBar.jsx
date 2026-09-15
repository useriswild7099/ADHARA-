import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Radio, Satellite, ShieldAlert, Cpu } from 'lucide-react';

function LiveClock() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().split(' ')[4] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-900/90 border border-white/10 px-3 py-1.5 rounded-lg font-mono text-xs text-sky-400 font-bold tracking-wider">
      {timeStr}
    </div>
  );
}

export const HeaderBar = React.memo(function HeaderBar({ activeTarget, onTargetChange, mines }) {
  return (
    <header className="rounded-xl border border-white/10 bg-surface/80 p-4 shadow-sm backdrop-blur-md mb-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-lg bg-sky-950/60 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(0,212,255,0.3)]">
          <Satellite className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-1.5">
              MOIL Limited
              <span className="text-xs text-muted-foreground font-normal">| Ministry of Steel</span>
            </h1>
            <Badge variant="tactical" className="hidden sm:inline-flex">
              SIH26009 SPACE TECH
            </Badge>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground tracking-tight">
            MULTIMODAL SATELLITE REMOTE SENSING // CAUSAL PRODUCTION OPTIMIZATION
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Active Concession Selector */}
        <select
          value={activeTarget?.id || ''}
          onChange={(e) => {
            const m = mines.find((mine) => mine.id === e.target.value);
            if (m) onTargetChange(m);
          }}
          className="bg-zinc-900 border border-white/10 text-xs font-mono text-foreground px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary"
        >
          {mines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.state})
            </option>
          ))}
        </select>

        <div className="hidden md:flex items-center gap-2 bg-zinc-900/90 border border-white/10 px-3 py-1.5 rounded-lg font-mono text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
          <span className="text-muted-foreground">GEE ALPHAEARTH:</span>
          <span className="text-primary font-semibold">64-D SYNCED</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 bg-zinc-900/90 border border-white/10 px-3 py-1.5 rounded-lg font-mono text-xs">
          <span className="text-muted-foreground">NASA POWER:</span>
          <span className="text-emerald-400 font-semibold">ONLINE</span>
        </div>

        <LiveClock />
      </div>
    </header>
  );
});
