import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Satellite, QrCode, X, ExternalLink } from 'lucide-react';

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
  const [showQr, setShowQr] = useState(false);

  return (
    <>
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

          <button
            onClick={() => setShowQr(true)}
            title="Scan QR Code for Repository & Mobile Access"
            className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 hover:border-primary/50 text-xs font-mono text-foreground px-2.5 py-1.5 rounded-lg transition-all min-h-[36px]"
          >
            <QrCode className="h-4 w-4 text-primary shrink-0" />
            <span className="hidden sm:inline">QR Code</span>
          </button>

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

      {/* QR Code Presentation Modal */}
      {showQr && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowQr(false)}
        >
          <div 
            className="bg-zinc-950 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-3 right-3 p-1 rounded-lg text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-sky-950/80 border border-primary/40 flex items-center justify-center text-primary">
                <Satellite className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-foreground">ADHARA Platform</div>
                <div className="text-[10px] font-mono text-muted-foreground">SIH26009 | MOIL LIMITED</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl inline-block my-2 shadow-[0_0_25px_rgba(0,212,255,0.2)]">
              <img 
                src="/qr_code.png" 
                alt="ADHARA Live Web App QR Code" 
                className="w-52 h-52 object-contain"
              />
            </div>

            <p className="text-xs text-zinc-300 font-sans mt-2">
              Scan with your mobile camera to launch the live tactical dashboard on Vercel.
            </p>

            <div className="mt-3 flex flex-col gap-1.5">
              <a
                href="https://adhara-seven.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/40 text-xs font-mono text-primary hover:bg-primary/30 font-semibold transition-all"
              >
                <span>adhara-seven.vercel.app</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://github.com/useriswild7099/ADHARA-"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <span>GitHub: useriswild7099/ADHARA-</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
