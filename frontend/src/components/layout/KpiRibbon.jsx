import React from 'react';
import { Card } from '../ui/card';
import { TrendingUp, AlertTriangle, Crosshair, ShieldCheck } from 'lucide-react';

export function KpiRibbon({ simData, highYieldCount, totalCells, metrics }) {
  const { totalSimTonnage, tonnageDelta, simRisks, baseRisks, isSimActive } = simData;
  const { roc_auc, test_accuracy } = metrics.prospectivity;

  const pctCoverage = ((highYieldCount / totalCells) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-4 sm:mb-6">
      {/* KPI 1: Projected 6-Month Extraction */}
      <Card className="p-3.5 sm:p-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary group-hover:h-[3px] transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-muted-foreground uppercase font-sans">
            Projected 6-Mo Extraction
          </span>
          <TrendingUp className="h-4 w-4 text-primary shrink-0" />
        </div>
        <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-foreground">
          {totalSimTonnage.toLocaleString()}{' '}
          <span className="text-xs text-muted-foreground font-normal">tons</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs font-mono break-words">
          <span className={tonnageDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {isSimActive ? `${tonnageDelta >= 0 ? '+' : ''}${tonnageDelta.toLocaleString()} t (What-If)` : 'Baseline Forecast Plan'}
          </span>
        </div>
      </Card>

      {/* KPI 2: Shortfall Risk Alert Window */}
      <Card className="p-3.5 sm:p-4 relative overflow-hidden group">
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] transition-all ${
            simRisks === 0 ? 'bg-emerald-500' : simRisks <= 2 ? 'bg-amber-500' : 'bg-red-500'
          }`}
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-muted-foreground uppercase font-sans">
            Shortfall Risk Alert Window
          </span>
          <AlertTriangle className={`h-4 w-4 shrink-0 ${simRisks === 0 ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
        <div
          className={`mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono ${
            simRisks === 0 ? 'text-emerald-400' : simRisks <= 2 ? 'text-amber-400' : 'text-red-400'
          }`}
        >
          {simRisks} of 6 <span className="text-xs font-normal text-muted-foreground">months</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-mono break-words">
          {isSimActive
            ? `${simRisks - baseRisks >= 0 ? '+' : ''}${simRisks - baseRisks} vs Baseline Plan`
            : `${baseRisks} months below safe 90% threshold`}
        </div>
      </Card>

      {/* KPI 3: High-Yield Exploration Targets */}
      <Card className="p-3.5 sm:p-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500 group-hover:h-[3px] transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-muted-foreground uppercase font-sans">
            High-Yield Targets
          </span>
          <Crosshair className="h-4 w-4 text-amber-400 shrink-0" />
        </div>
        <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-foreground">
          {highYieldCount} <span className="text-xs text-muted-foreground font-normal">cells</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-mono break-words">
          {pctCoverage}% concession grid (P &ge; 0.70)
        </div>
      </Card>

      {/* KPI 4: Model Confidence */}
      <Card className="p-3.5 sm:p-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 group-hover:h-[3px] transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-muted-foreground uppercase font-sans">
            Prospectivity ROC-AUC
          </span>
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
        </div>
        <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-emerald-400">
          {roc_auc.toFixed(4)}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-mono break-words">
          {test_accuracy.toFixed(1)}% Acc | -{metrics.forecasting.error_reduction_pct}% Error
        </div>
      </Card>
    </div>
  );
}
