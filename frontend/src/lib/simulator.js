/**
 * What-If Causality Simulator
 * Computes forward 6-month mining tonnage from NASA rainfall anomaly,
 * preventative maintenance hours saved, and overtime boost.
 */
import modelMetrics from '../data/modelMetrics.json';
import forecastResults from '../data/forecastResults.json';

export function runSimulation({ simRain = 0, simMaint = 0, simOvertime = 0 }) {
  const { coef_month, coef_rainfall, coef_downtime, intercept, safe_threshold_tons } = modelMetrics.forecasting;

  // Base forward months: months 31 to 36
  const baseRainfall = [80, 220, 260, 140, 45, 10]; // Historical monsoon distribution
  const baseDowntime = [45, 55, 60, 50, 40, 35];

  const simulatedRows = forecastResults.map((row, idx) => {
    const month = row.month;
    const rain = Math.max(0, baseRainfall[idx] + simRain);
    const down = Math.max(0, baseDowntime[idx] - simMaint);

    // Causal linear regression
    const rawPred = intercept + (coef_month * month) + (coef_rainfall * rain) + (coef_downtime * down) + simOvertime;
    const simulatedTonnage = Math.round(rawPred);
    const baseTonnage = Math.round(row.regression_forecast);
    const isRisk = simulatedTonnage < safe_threshold_tons;
    const deficitTons = Math.max(0, safe_threshold_tons - simulatedTonnage);

    // Trigger attribution
    let trigger = "Normal Operating Variance";
    if (rain > 180) trigger = "Monsoon Pit Flooding";
    else if (down > 50) trigger = "Fleet Breakdown / Maintenance";

    return {
      month,
      baselineForecast: Math.round(row.baseline_forecast),
      arimaForecast: Math.round(row.arima_forecast),
      regressionForecast: baseTonnage,
      simulatedForecast: simulatedTonnage,
      shortfallRisk: isRisk,
      deficitTons,
      trigger,
      rainfallMm: rain,
      downtimeHours: down
    };
  });

  const totalSimTonnage = simulatedRows.reduce((acc, r) => acc + r.simulatedForecast, 0);
  const totalBaseTonnage = simulatedRows.reduce((acc, r) => acc + r.regressionForecast, 0);
  const tonnageDelta = totalSimTonnage - totalBaseTonnage;
  const simRisks = simulatedRows.filter(r => r.shortfallRisk).length;
  const baseRisks = forecastResults.filter(r => r.shortfall_risk).length;
  const riskDelta = simRisks - baseRisks;

  return {
    rows: simulatedRows,
    totalSimTonnage,
    totalBaseTonnage,
    tonnageDelta,
    simRisks,
    baseRisks,
    riskDelta,
    threshold: safe_threshold_tons,
    isSimActive: simRain !== 0 || simMaint !== 0 || simOvertime !== 0
  };
}
