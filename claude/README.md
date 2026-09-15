# MOIL Prototype (SIH26009) — Beginner Guide

This folder has a small working version of the full idea, using **pretend
data** so you can see it run today. Later you swap the pretend data for real
data.

## What's in here
- `data_generator.py` → makes pretend satellite grid + pretend production history
- `train_prospectivity.py` → Box 1: guesses where ore is likely
- `train_forecast.py` → Box 2: guesses future production + shortfall risk
- `app.py` → Box 3: the dashboard that shows everything together
- `requirements.txt` → list of tools to install

## How to run it (step by step)
1. Install Python 3.9+ from [python.org](https://python.org) if you don't have it.
2. Open a terminal in this folder.
3. Install the tools:
   ```
   pip install -r requirements.txt
   ```
4. Make the pretend data and train both models (run these once, in order):
   ```
   python data_generator.py
   python train_prospectivity.py
   python train_forecast.py
   ```
5. Start the dashboard:
   ```
   streamlit run app.py
   ```
   Your browser will open automatically showing the map, the forecast, and
   the risk warnings.

## What to do next (in order)
1. **Get comfortable with this fake version first.** Open each `.py` file
   and read the comments — they explain what each part does in plain words.
2. **Swap in real satellite data** for `grid_data.csv`:
   - Sign up (free) at Google Earth Engine or use Copernicus Browser.
   - Pull Sentinel-2 imagery for a real MOIL mine area (e.g. Balaghat, MP).
   - Compute NDVI, soil moisture proxy, and land surface temperature for a
     grid over that area — same 3 columns your fake data already has, so
     `train_prospectivity.py` barely needs to change.
3. **Swap in real production numbers** for `production_history.csv`:
   - Pull monthly/quarterly figures from MOIL's public annual reports.
   - Pull real rainfall data for that mine's district from NASA POWER
     (free, no login needed).
4. **Improve the models once real data works:**
   - Try Nixtla's `statsforecast` and `neuralforecast` libraries for a
     stronger forecast (they plug in similarly to `train_forecast.py`).
   - Try `rs-embed` to turn raw satellite images into features automatically
     instead of hand-computing NDVI etc.
5. **Polish the dashboard** — add a real map (try the `leafmap` library) once
   the plain heatmap image feels too basic.

## Common beginner questions
- **"Do I need a powerful computer?"** No — everything here runs fine on a
  normal laptop, no GPU needed.
- **"What if my real data is messy or small?"** That's normal and expected —
  say so honestly in your presentation. Judges care more that you understood
  the limitation than that your numbers are perfect.
- **"Something breaks when I run it"** — run the 3 steps in order
  (`data_generator.py` → `train_prospectivity.py` → `train_forecast.py`)
  before `streamlit run app.py`, since the dashboard reads files those
  scripts create.
