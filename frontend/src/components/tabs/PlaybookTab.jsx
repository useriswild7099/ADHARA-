import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertOctagon, CheckCircle2, ShieldAlert, Wrench, CloudRain, Zap } from 'lucide-react';

export function PlaybookTab({ simData }) {
  const { rows, simRisks, threshold } = simData;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            Module 3: Prescriptive Operational Action Playbook
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated mitigation protocols triggered by causal weather anomalies and equipment bottleneck thresholds.
          </p>
        </div>
      </div>

      {simRisks === 0 ? (
        <Card className="p-6 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                All Operational Targets Cleared — Zero Shortfall Risk
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                All upcoming 6 months meet or exceed the safe extraction threshold of{' '}
                <b>{threshold.toLocaleString()} tons</b>. Continue standard preventative maintenance cycles.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs px-3 py-1">
              {simRisks} Production Deficit Windows Flagged
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Action checklists generated for site engineers:
            </span>
          </div>

          {rows
            .filter((r) => r.shortfallRisk)
            .map((r) => (
              <Card
                key={r.month}
                className="p-5 border-l-4 border-l-destructive bg-surface/70 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="h-5 w-5 text-destructive" />
                    <span className="text-sm font-bold text-foreground font-mono">
                      Month {r.month}: Projected Output {r.simulatedForecast.toLocaleString()} tons
                    </span>
                    <span className="text-xs text-destructive font-mono font-semibold">
                      (Deficit: -{r.deficitTons.toLocaleString()} t)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.trigger.includes('Monsoon') ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <CloudRain className="h-3 w-3" />
                        Monsoon Surge ({r.rainfallMm} mm)
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="flex items-center gap-1">
                        <Wrench className="h-3 w-3" />
                        Fleet Bottleneck ({r.downtimeHours} hrs)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Tactical Checklist */}
                <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/5 text-xs text-zinc-300 font-sans space-y-2">
                  <b className="text-primary font-mono text-[11px] uppercase tracking-wider block">
                    Priority Operational Directive:
                  </b>
                  {r.trigger.includes('Monsoon') ? (
                    <ul className="space-y-1.5 list-disc pl-5">
                      <li>
                        <b>Advance Primary Bench Blasting</b>: Schedule heavy explosive cycles into the first 10 days of the month ahead of forecast rainfall peaks.
                      </li>
                      <li>
                        <b>Pre-Position Dewatering Assets</b>: Deploy two 150 kW diesel submersible pumps at Sump Bench #3 to prevent pit bottom inundation.
                      </li>
                      <li>
                        <b>Elevate ROM Stockpiles</b>: Haul high-grade ore to upland transit pads to avoid wet haul road slippage during active monsoons.
                      </li>
                    </ul>
                  ) : (
                    <ul className="space-y-1.5 list-disc pl-5">
                      <li>
                        <b>Reallocate Standby Fleet</b>: Mobilize 1 standby 40-ton dumper and 2.5 m³ hydraulic shovel from overburden stripping to active ore faces.
                      </li>
                      <li>
                        <b>Preemptive Fluid Overhaul</b>: Conduct preventative bearing and hydraulic fluid servicing during non-extraction night shifts.
                      </li>
                      <li>
                        <b>Verify Critical Spares</b>: Ensure replacement dragline hoist cables and shovel bucket teeth are present in central warehouse inventory.
                      </li>
                    </ul>
                  )}
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
