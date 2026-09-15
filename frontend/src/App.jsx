import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { HeaderBar } from './components/layout/HeaderBar';
import { KpiRibbon } from './components/layout/KpiRibbon';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { runSimulation } from './lib/simulator';

// Lazy-loaded Tab Modules for Optimal Bundle Splitting
const ExplorationTab = lazy(() =>
  import('./components/tabs/ExplorationTab').then((m) => ({ default: m.ExplorationTab }))
);
const ForecastTab = lazy(() =>
  import('./components/tabs/ForecastTab').then((m) => ({ default: m.ForecastTab }))
);
const PlaybookTab = lazy(() =>
  import('./components/tabs/PlaybookTab').then((m) => ({ default: m.PlaybookTab }))
);
const ValidationTab = lazy(() =>
  import('./components/tabs/ValidationTab').then((m) => ({ default: m.ValidationTab }))
);

// Import JSON Data Feeds
import minesData from './data/mines.json';
import gridData from './data/gridData.json';
import productionHistory from './data/productionHistory.json';
import modelMetrics from './data/modelMetrics.json';

function TabSkeleton() {
  return (
    <div className="w-full min-h-[480px] rounded-2xl bg-surface/40 border border-white/10 p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <div className="text-xs font-mono text-sky-400 font-semibold tracking-widest uppercase">
        Loading Telemetry & Visual Module...
      </div>
    </div>
  );
}

export default function App() {
  const [activeTarget, setActiveTarget] = useState(minesData[0]);
  const [activeTab, setActiveTab] = useState('exploration');

  // Simulator Sliders
  const [simRain, setSimRain] = useState(0);
  const [simMaint, setSimMaint] = useState(0);
  const [simOvertime, setSimOvertime] = useState(0);

  // Stable handlers to prevent child re-renders
  const handleTargetChange = useCallback((m) => {
    setActiveTarget(m);
  }, []);

  // Compute Simulation Dynamically
  const simData = useMemo(() => {
    return runSimulation({ simRain, simMaint, simOvertime });
  }, [simRain, simMaint, simOvertime]);

  // High-yield cells count
  const highYieldCount = useMemo(() => {
    return gridData.filter((d) => d.ore_probability >= 0.70).length;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-3 sm:p-6 max-w-7xl mx-auto font-sans">
      <div>
        {/* Executive Header Bar */}
        <HeaderBar
          activeTarget={activeTarget}
          onTargetChange={handleTargetChange}
          mines={minesData}
        />

        {/* Dynamic Top KPI Ribbon */}
        <KpiRibbon
          simData={simData}
          highYieldCount={highYieldCount}
          totalCells={gridData.length}
          metrics={modelMetrics}
        />

        {/* Main Interface Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-1">
            <TabsList className="w-full sm:w-auto flex">
              <TabsTrigger value="exploration" className="gap-2">
                Exploration & Satellite Recon (Module 1)
              </TabsTrigger>
              <TabsTrigger value="forecast" className="gap-2">
                Production Forecast & Simulator (Module 2)
              </TabsTrigger>
              <TabsTrigger value="playbook" className="gap-2">
                Operational Playbook (Module 3)
              </TabsTrigger>
              <TabsTrigger value="validation" className="gap-2">
                Methodological Validation
              </TabsTrigger>
            </TabsList>
          </div>

          <Suspense fallback={<TabSkeleton />}>
            <TabsContent value="exploration">
              <ExplorationTab
                mines={minesData}
                activeTarget={activeTarget}
                onTargetSelect={handleTargetChange}
                gridData={gridData}
              />
            </TabsContent>

            <TabsContent value="forecast">
              <ForecastTab
                productionHistory={productionHistory}
                simData={simData}
                simRain={simRain}
                setSimRain={setSimRain}
                simMaint={simMaint}
                setSimMaint={setSimMaint}
                simOvertime={simOvertime}
                setSimOvertime={setSimOvertime}
              />
            </TabsContent>

            <TabsContent value="playbook">
              <PlaybookTab simData={simData} />
            </TabsContent>

            <TabsContent value="validation">
              <ValidationTab metrics={modelMetrics} />
            </TabsContent>
          </Suspense>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between text-xs font-mono text-muted-foreground gap-3">
        <div>
          MOIL Limited Remote Sensing & Production Optimization Platform | Problem Statement: SIH26009
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400">GEE AlphaEarth 64-D Synced</span>
          <span className="text-sky-400">NASA POWER Precipitation Connected</span>
        </div>
      </footer>
    </div>
  );
}
