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
    <header className="rounded-xl border border-white/10 bg-surface/80 p-3 sm:p-4 shadow-sm backdrop-blur-md mb-4 sm:mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-sky-950/60 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(0,212,255,0.3)] shrink-0">
          <Satellite className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-1">
              MOIL Limited
              <span className="text-[11px] sm:text-xs text-muted-foreground font-normal">| Ministry of Steel</span>
            </h1>
            <Badge variant="tactical" className="text-[9px] sm:text-[10px] py-0 px-1.5">
              SIH26009
            </Badge>
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground tracking-tight truncate">
            MULTIMODAL SATELLITE REMOTE SENSING // CAUSAL AI
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-2.5">
        {/* Active Concession Selector */}
        <select
          value={activeTarget?.id || ''}
          onChange={(e) => {
            const m = mines.find((mine) => mine.id === e.target.value);
            if (m) onTargetChange(m);
          }}
          className="flex-1 sm:flex-initial bg-zinc-900 border border-white/10 text-xs font-mono text-foreground px-2.5 sm:px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary min-h-[36px]"
        >
          {mines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.state})
            </option>
          ))}
        </select>

        <div className="hidden md:flex items-center gap-2 bg-zinc-900/90 border border-white/10 px-3 py-1.5 rounded-lg font-mono text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
          <span className="text-muted-foreground">GEE:</span>
          <span className="text-primary font-semibold">64-D</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 bg-zinc-900/90 border border-white/10 px-3 py-1.5 rounded-lg font-mono text-xs">
          <span className="text-muted-foreground">NASA:</span>
          <span className="text-emerald-400 font-semibold">SYNC</span>
        </div>

        <LiveClock />
      </div>
    </header>
  );
});
