---
name: geo-data-fetch
description: Use when the task involves getting REAL satellite, rainfall, or geology data for the MOIL manganese project (SIH26009) instead of the practice/fake data. Covers Google Earth Engine + AlphaEarth embeddings, NASA POWER rainfall, and Bhuvan/GSI Bhukosh geology layers.
---

# Fetching real data for the MOIL project

This project currently runs on fake practice data (see `data_generator.py`).
This skill explains how to replace it with real data, region by region.

## 1. Satellite features (replaces the ndvi/soil_moisture/land_temp columns)
Preferred path — **AlphaEarth embeddings via Google Earth Engine**:
- These are free, precomputed, 10m-resolution embeddings covering the whole
  Earth, 2017–2024. No model download or GPU needed.
- Requires a (free) Earth Engine account: `earthengine authenticate`.
- Dataset: Earth Engine `GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL` collection.
- For each grid point (lat, lon), pull the 64-dimensional embedding vector
  for the target year and use it in place of (or in addition to) ndvi/soil_moisture/land_temp.

Fallback path — compute indices yourself from Sentinel-2:
- Use Sentinel Hub or Earth Engine to pull Sentinel-2 L2A bands for the region.
- Compute NDVI = (NIR - Red) / (NIR + Red).
- Compute a simple moisture index from SWIR/NIR bands.
- Use MODIS LST (land surface temperature) collection for the temperature column.

## 2. Rainfall (replaces the rainfall_mm column)
Use the NASA POWER API — free, no login required.
- Endpoint pattern: `https://power.larc.nasa.gov/api/temporal/monthly/point`
- Pass latitude/longitude of the mine and a date range.
- Parameter for rainfall: `PRECTOTCORR`.

## 3. Geology layers (optional overlay for the map)
- GSI Bhukosh (https://bhukosh.gsi.gov.in) — Indian geological/mineral maps.
- Bhuvan API (https://bhuvan-app1.nrsc.gov.in/api/) — Indian thematic layers,
  requires a free access token.

## 4. Real mine locations to anchor labels
- Use MOIL's public annual reports to find real mine names and approximate
  locations (e.g. Balaghat, Ukwa, Gumgaon, Dongri Buzurg, Kandri — Madhya
  Pradesh/Maharashtra manganese belt).
- Treat these as positive "ore likely" anchor points the same way
  `data_generator.py` treats its fake hot_spots — replace the `hot_spots`
  list with real coordinates once known.

## Output contract
Whatever source you use, the output MUST still be a `grid_data.csv` with the
same column names the rest of the pipeline expects (`x, y, <feature columns>,
label`), so `train_prospectivity.py` keeps working without changes.
