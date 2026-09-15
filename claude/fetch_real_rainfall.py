"""
REAL DATA PIPELINE: NASA POWER CLIMATE API (SIH26009)
----------------------------------------------------
Implements the geo-data-fetch skill contract.
Fetches authentic monthly precipitation for the MOIL Balaghat Mine
Coordinates: 21.8700° N, 80.1800° E (Balaghat District, MP, India).
"""

import requests
import pandas as pd
import numpy as np
import calendar

# MOIL Balaghat Flagship Mine Coordinates
LATITUDE = 21.8700
LONGITUDE = 80.1800
START_YEAR = 2021
END_YEAR = 2023  # 36 months total (2021, 2022, 2023)

print(f"Querying NASA POWER API for Balaghat Mine ({LATITUDE}°N, {LONGITUDE}°E)...")
url = (
    f"https://power.larc.nasa.gov/api/temporal/monthly/point?"
    f"parameters=PRECTOTCORR&community=AG&longitude={LONGITUDE}&latitude={LATITUDE}&"
    f"start={START_YEAR}&end={END_YEAR}&format=JSON"
)

response = requests.get(url, timeout=30)
response.raise_for_status()
data = response.json()

precip_dict = data["properties"]["parameter"]["PRECTOTCORR"]

records = []
month_counter = 1

for yyyymm, val_mm_day in precip_dict.items():
    # Ignore annual summary keys (e.g., 202113)
    if len(yyyymm) == 6 and not yyyymm.endswith("13"):
        year = int(yyyymm[:4])
        month = int(yyyymm[4:])
        days_in_month = calendar.monthrange(year, month)[1]
        
        # Convert mm/day to total monthly rainfall in mm
        monthly_rainfall_mm = round(val_mm_day * days_in_month, 1)
        records.append({
            "month": month_counter,
            "year_month": f"{year}-{month:02d}",
            "rainfall_mm": monthly_rainfall_mm
        })
        month_counter += 1

real_rainfall_df = pd.DataFrame(records[:36])  # Exactly 36 months
print(f"Successfully fetched {len(real_rainfall_df)} months of authentic NASA precipitation data!")
print(real_rainfall_df.head(12))

# Save to real_rainfall_balaghat.csv
real_rainfall_df.to_csv("real_rainfall_balaghat.csv", index=False)
print("\nSaved real_rainfall_balaghat.csv")
