"""
STEP 1: MAKE PRETEND DATA
-------------------------
MOIL did not give us real data, so we make believable fake data first.
This lets us build and test everything today. Later, we swap this file's
output for real satellite images and real MOIL production reports.
"""

import numpy as np
import pandas as pd

np.random.seed(42)

# -----------------------------------------------------------------
# PART A: Pretend "satellite grid" for one mining area
# Think of this like a checkerboard laid over the mine.
# Each square has 3 "satellite" readings:
#   ndvi          -> how green/healthy plants are (low = stressed = maybe ore below)
#   soil_moisture -> how wet the soil is
#   land_temp     -> ground surface temperature
# -----------------------------------------------------------------
grid_size = 30
xs, ys = np.meshgrid(range(grid_size), range(grid_size))
xs, ys = xs.flatten(), ys.flatten()

# Pretend there are 3 real ore "hot spots" on this grid
hot_spots = [(7, 8), (20, 22), (15, 5)]


def distance_to_nearest_hotspot(x, y):
    return min(np.hypot(x - hx, y - hy) for hx, hy in hot_spots)


rows = []
for x, y in zip(xs, ys):
    dist = distance_to_nearest_hotspot(x, y)
    # Closer to a hotspot -> lower ndvi (stressed veg), lower soil moisture,
    # higher land temp. We add random noise so it's not a perfectly clean pattern.
    ndvi = np.clip(0.6 - 0.4 * np.exp(-dist / 6) + np.random.normal(0, 0.05), 0, 1)
    soil_moisture = np.clip(0.5 - 0.3 * np.exp(-dist / 6) + np.random.normal(0, 0.05), 0, 1)
    land_temp = np.clip(30 + 8 * np.exp(-dist / 6) + np.random.normal(0, 1), 20, 45)
    # Label: 1 = "ore likely" if within 4 grid-squares of a hotspot
    label = 1 if dist < 4 else 0
    rows.append([x, y, ndvi, soil_moisture, land_temp, label])

grid_df = pd.DataFrame(
    rows, columns=["x", "y", "ndvi", "soil_moisture", "land_temp", "label"]
)
grid_df.to_csv("grid_data.csv", index=False)

# -----------------------------------------------------------------
# PART B: Pretend production history (36 months)
# Columns:
#   month           -> month number
#   rainfall_mm     -> pretend monthly rainfall
#   downtime_hours  -> pretend equipment downtime that month
#   production_tons -> actual ore produced that month
# -----------------------------------------------------------------
n_months = 36
month = np.arange(1, n_months + 1)

# Rainfall: Use authentic NASA POWER rainfall if available, else simulate
import os
if os.path.exists("real_rainfall_balaghat.csv"):
    real_rain = pd.read_csv("real_rainfall_balaghat.csv")
    rainfall = real_rain["rainfall_mm"].values[:n_months]
    print("Using authentic NASA POWER climate data for Balaghat Mine.")
else:
    # Rainfall: higher in monsoon months (roughly month 6-9 each year)
    rainfall = 50 + 150 * np.clip(np.sin((month % 12 - 6) / 12 * 2 * np.pi) + 0.3, 0, None)
    rainfall += np.random.normal(0, 10, n_months)
    rainfall = np.clip(rainfall, 0, None)

# Downtime: random equipment issues, occasionally a bad month
downtime = np.random.poisson(20, n_months).astype(float)
downtime[[10, 22, 30]] += 40  # a few bad breakdown months

# Base production, reduced by rainfall and downtime
base_production = 4000
production = (
    base_production
    - 3.0 * rainfall
    - 8.0 * downtime
    + np.random.normal(0, 100, n_months)
)
production = np.clip(production, 500, None)

prod_df = pd.DataFrame(
    {
        "month": month,
        "rainfall_mm": rainfall.round(1),
        "downtime_hours": downtime.round(0),
        "production_tons": production.round(0),
    }
)
prod_df.to_csv("production_history.csv", index=False)

print("Made grid_data.csv (satellite-style grid) and production_history.csv (production history).")
print(grid_df.head())
print(prod_df.head())
