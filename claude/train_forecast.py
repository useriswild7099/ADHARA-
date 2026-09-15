"""
STEP 3 / BOX 2: "WILL WE HIT OUR TARGET?"
-------------------------------------------
We look at past months of production and guess the next few months.

We use TWO simple methods on purpose:
1. A basic trend/seasonal method (Exponential Smoothing) - easy to explain,
   hard to break, good "safety net" model.
2. A Linear Regression that also looks at rainfall and downtime, so we can
   say WHY a month might be low (too much rain? too much downtime?).

Judges like seeing you compared a simple method against a smarter one.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.holtwinters import ExponentialSmoothing

df = pd.read_csv("production_history.csv")

train = df.iloc[:-6]   # first 30 months = practice
test = df.iloc[-6:]    # last 6 months = pretend "future" to check ourselves

# ---------- Method 1: simple trend/seasonal baseline ----------
smoothing_model = ExponentialSmoothing(
    train["production_tons"], trend="add", seasonal=None
).fit()
baseline_forecast = smoothing_model.forecast(6)

# ---------- Method 2: regression using rainfall + downtime as clues ----------
X_train = train[["month", "rainfall_mm", "downtime_hours"]]
y_train = train["production_tons"]
reg_model = LinearRegression().fit(X_train, y_train)
import joblib
joblib.dump(reg_model, "forecast_model.pkl")

X_test = test[["month", "rainfall_mm", "downtime_hours"]]
regression_forecast = reg_model.predict(X_test)

from statsmodels.tsa.arima.model import ARIMA
arima_model = ARIMA(train["production_tons"], order=(1, 1, 1)).fit()
arima_forecast = arima_model.forecast(6)

# ---------- Compare all methods against what actually happened ----------
comparison = pd.DataFrame(
    {
        "month": test["month"].values,
        "actual": test["production_tons"].values,
        "baseline_forecast": baseline_forecast.values.round(0),
        "arima_forecast": arima_forecast.values.round(0),
        "regression_forecast": regression_forecast.round(0),
    }
)
print(comparison)

baseline_error = np.mean(np.abs(comparison["actual"] - comparison["baseline_forecast"]))
arima_error = np.mean(np.abs(comparison["actual"] - comparison["arima_forecast"]))
regression_error = np.mean(np.abs(comparison["actual"] - comparison["regression_forecast"]))
print(f"\nAverage error - baseline (Exp Smoothing): {baseline_error:.0f} tons")
print(f"Average error - baseline (ARIMA): {arima_error:.0f} tons")
print(f"Average error - causal regression (Climate + Downtime): {regression_error:.0f} tons")

# ---------- Shortfall risk rule ----------
# If forecast is more than 10% below the historical average, flag it as a risk,
# and guess WHY by checking which input (rainfall or downtime) is unusually high.
avg_production = train["production_tons"].mean()
threshold = 0.90 * avg_production

comparison["shortfall_risk"] = comparison["regression_forecast"] < threshold


def guess_cause(row_index):
    rainfall_val = test.iloc[row_index]["rainfall_mm"]
    downtime_val = test.iloc[row_index]["downtime_hours"]
    if rainfall_val > train["rainfall_mm"].mean() + train["rainfall_mm"].std():
        return "High rainfall"
    elif downtime_val > train["downtime_hours"].mean() + train["downtime_hours"].std():
        return "Equipment downtime"
    else:
        return "Unclear - monitor closely"


comparison["likely_cause"] = [
    guess_cause(i) if risk else "-" for i, risk in enumerate(comparison["shortfall_risk"])
]

comparison.to_csv("forecast_results.csv", index=False)
print("\n", comparison[["month", "regression_forecast", "shortfall_risk", "likely_cause"]])

# ---------- Chart ----------
plt.figure(figsize=(8, 5))
plt.plot(df["month"], df["production_tons"], label="Actual (history)", color="black")
plt.plot(test["month"], comparison["baseline_forecast"], "--", label="Baseline forecast")
plt.plot(test["month"], comparison["regression_forecast"], "--", label="Regression forecast")
plt.axhline(threshold, color="red", linestyle=":", label="Shortfall risk line")
plt.xlabel("Month")
plt.ylabel("Production (tons)")
plt.title("Production Forecast (practice data)")
plt.legend()
plt.tight_layout()
plt.savefig("forecast_chart.png", dpi=120)
print("\nSaved forecast_chart.png and forecast_results.csv")
