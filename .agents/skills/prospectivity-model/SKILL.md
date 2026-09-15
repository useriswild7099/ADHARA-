---
name: prospectivity-model
description: Use when training, tuning, or explaining the "where is the ore" model for the MOIL project. Covers which model to pick, how to keep it explainable, and how to validate it responsibly given weak/proxy labels.
---

# Prospectivity model conventions (MOIL / SIH26009)

## Default model
Use `RandomForestClassifier` (see `train_prospectivity.py`) as the default.
Only reach for TerraTorch + a fine-tuned foundation model (Prithvi/Clay) if:
- there is spare time after the core pipeline works end-to-end, AND
- a GPU is available, AND
- the team can explain what fine-tuning changed and why.

## Always report
- Accuracy (or AUC) on a held-out test split, not just training accuracy.
- Feature importances — every prospectivity claim should be traceable to
  which input (e.g. AlphaEarth embedding dimension, NDVI, soil moisture)
  drove it.

## Label honesty
Labels in this project are proxy labels (distance to a known/assumed mine
location), not verified drill-confirmed ground truth. Any write-up or demo
must say this explicitly — do not present the heatmap as verified geology.

## Output contract
Save:
- `grid_predictions.csv` — every grid cell + its `ore_probability`
- `prospectivity_model.pkl` — the trained model (joblib)
- `prospectivity_heatmap.png` — visual for the dashboard/PPT

`app.py` reads `grid_predictions.csv` directly — keep that filename and the
`x, y, ore_probability` columns stable even if the underlying model changes.
