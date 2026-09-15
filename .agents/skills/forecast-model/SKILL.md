---
name: forecast-model
description: Use when training, upgrading, or explaining the production shortfall forecast for the MOIL project. Covers which forecasting library to reach for depending on how much real data is available, and how to keep a fallback so a demo never breaks.
---

# Forecast model conventions (MOIL / SIH26009)

## Pick the model based on how much real history you have
- Fewer than ~24 months of real monthly data → don't trust a neural model.
  Use `statsforecast` (AutoETS/AutoARIMA) as the primary model.
- 24+ months of real data with rainfall/downtime as extra columns →
  `neuralforecast` (start with N-BEATS or TFT) is worth trying, but ALWAYS
  keep the statsforecast run as a comparison baseline (see
  `train_forecast.py` — it already runs both and prints the error of each).
- Data is real but very sparse/gappy (e.g. only a handful of points per
  mine) → try `chronos-forecasting` or `timesfm` zero-shot instead of
  training anything from scratch. Note: Nixtla's own benchmarking has found
  Chronos can be noticeably slower and sometimes less accurate than a
  well-tuned classical model, so don't assume the fancier model wins —
  always compare against the simple baseline before choosing it.

## Never skip
- The shortfall-risk threshold logic and the "likely cause" rule
  (rainfall vs. downtime vs. unclear) already in `train_forecast.py`. This
  is what turns a raw forecast into something a mine manager can act on —
  it matters more to judges than which model produced the number.

## Output contract
Save `forecast_results.csv` with columns:
`month, actual, regression_forecast (or chosen model's forecast), shortfall_risk, likely_cause`
`app.py` reads this file directly — keep these column names stable.
