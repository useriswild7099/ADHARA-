import React from 'react';
import { Card } from '../ui/card';
import { Slider } from '../ui/slider';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { Sliders, CheckCircle } from 'lucide-react';

export function ForecastTab({
  productionHistory,
  simData,
  simRain,
  setSimRain,
  simMaint,
  setSimMaint,
  simOvertime,
  setSimOvertime
}) {
  const { rows, tonnageDelta, simRisks, baseRisks, threshold, isSimActive } = simData;

  // Prepare chart data: combine past 6 historical months with forward 6 forecast months
  const pastSlice = productionHistory.slice(-6).map((r) => ({
    month: `M${r.month}`,
    actual: r.production_tons,
    baseline: null,
    causalAI: null,
    simulated: null
  }));

  const futureSlice = rows.map((r) => ({
    month: `M${r.month}`,
    actual: null,
    baseline: r.baselineForecast,
    causalAI: r.regressionForecast,
    simulated: isSimActive ? r.simulatedForecast : null
  }));

  const chartData = [...pastSlice, ...futureSlice];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            Module 2: Causal Production Forecasting & Forward Scenario Simulator
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connecting real NASA satellite precipitation and machine breakdown hours to causal linear regression.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left 2 Cols: Interactive Recharts Forecast Curve */}
        <Card className="p-3.5 sm:p-5 lg:col-span-2 bg-surface/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
            <span className="text-[11px] sm:text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              6-Month Trajectory vs Safe Target ({threshold.toLocaleString()} t)
            </span>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] sm:text-[10.5px] font-mono text-primary font-bold">MAE: 80 TONS (-85%)</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} domain={[2400, 4200]} tickLine={false} width={45} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121215',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                <ReferenceLine
                  y={threshold}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: 'Safe Threshold', fill: '#ef4444', fontSize: 9 }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Historical Actuals"
                  stroke="#71717a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Baseline (Holt-Winters)"
                  stroke="#a1a1aa"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                />
                <Line
                  type="monotone"
                  dataKey="causalAI"
                  name="Causal Model (Base Plan)"
                  stroke="#00d4ff"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                {isSimActive && (
                  <Line
                    type="monotone"
                    dataKey="simulated"
                    name="Simulated (What-If Active)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-zinc-900/60 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono">
            <span className="text-zinc-400">Baseline Error: <b>527 tons MAE</b></span>
            <span className="text-primary font-bold">Causal Model Error: <b>80 tons MAE</b></span>
            <span className="text-emerald-400 font-bold">Net Error Reduction: <b>+84.8%</b></span>
          </div>
        </Card>

        {/* Right Col: Live What-If Sliders */}
        <Card className="p-3.5 sm:p-5 bg-surface/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
              <Sliders className="h-4 w-4" />
              What-If Scenario Parameters
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">
              Simulate operational anomalies in real time to assess forward extraction shortfalls.
            </p>

            {/* Slider 1: Rainfall */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">Rainfall Anomaly</span>
                <span className="text-primary font-bold">
                  {simRain > 0 ? `+${simRain}` : simRain} mm/mo
                </span>
              </div>
              <Slider
                min={-50}
                max={120}
                step={5}
                value={[simRain]}
                onValueChange={(val) => setSimRain(val[0])}
              />
              <span className="text-[10px] text-zinc-500 block">Monsoon surge or dry spells</span>
            </div>

            {/* Slider 2: Maintenance */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">Preventative Maintenance</span>
                <span className="text-emerald-400 font-bold">{simMaint} hrs saved</span>
              </div>
              <Slider
                min={0}
                max={35}
                step={5}
                value={[simMaint]}
                onValueChange={(val) => setSimMaint(val[0])}
              />
              <span className="text-[10px] text-zinc-500 block">Backup fleet & overhaul uptime</span>
            </div>

            {/* Slider 3: Overtime */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">Shift Output Boost</span>
                <span className="text-amber-400 font-bold">+{simOvertime} t/mo</span>
              </div>
              <Slider
                min={0}
                max={300}
                step={25}
                value={[simOvertime]}
                onValueChange={(val) => setSimOvertime(val[0])}
              />
              <span className="text-[10px] text-zinc-500 block">Overtime bench haulage cycles</span>
            </div>
          </div>

          {/* Intervention Impact Card */}
          {isSimActive ? (
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                <CheckCircle className="h-4 w-4" />
                Intervention Active
              </div>
              <div className="text-zinc-300 text-[11px] space-y-0.5">
                <div>Extraction Delta: <b className="text-emerald-400">{tonnageDelta >= 0 ? `+${tonnageDelta.toLocaleString()}` : tonnageDelta.toLocaleString()} tons</b></div>
                <div>Deficit Windows: <b className="text-emerald-400">{simRisks} of 6</b> (was {baseRisks})</div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/5 text-xs font-mono text-zinc-400">
              Adjust parameters to simulate climate impacts and fleet recovery.
            </div>
          )}
        </Card>
      </div>

      {/* Forward 6-Month Projection Table */}
      <Card className="p-3.5 sm:p-5 bg-surface/80">
        <div className="text-xs font-bold text-foreground uppercase tracking-wider font-mono mb-3">
          Forward 6-Month Projection Telemetry Table
        </div>
        <div className="overflow-x-auto touch-scroll">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Baseline (Holt-Winters)</TableHead>
                <TableHead>Causal AI (Base)</TableHead>
                <TableHead>Simulated Tonnage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trigger Diagnosis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-bold whitespace-nowrap">Month {row.month}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{row.baselineForecast.toLocaleString()} t</TableCell>
                  <TableCell className="text-sky-400 font-bold whitespace-nowrap">{row.regressionForecast.toLocaleString()} t</TableCell>
                  <TableCell className="text-foreground font-bold whitespace-nowrap">{row.simulatedForecast.toLocaleString()} t</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.shortfallRisk ? (
                      <Badge variant="destructive">Deficit (-{row.deficitTons} t)</Badge>
                    ) : (
                      <Badge variant="success">Cleared (+{row.simulatedForecast - threshold} t)</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-400 whitespace-nowrap">{row.trigger}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
