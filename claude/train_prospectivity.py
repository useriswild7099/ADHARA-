"""
STEP 2 / BOX 1: MINERAL PROSPECTIVITY MODEL WITH ALPHAEARTH FUSION (SIH26009)
----------------------------------------------------------------------------
Trains an ensemble prospectivity model combining:
  1. Surface geobotanical stress (NDVI drop)
  2. Soil moisture absorption & thermal inertia
  3. AlphaEarth 64-D Foundation Embeddings & Cosine Similarity to known MOIL deposits
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score
import joblib

df = pd.read_csv("grid_data.csv")

# Feature selection: Fusing physical proxies with AlphaEarth Foundation representations
core_features = ["ndvi", "soil_moisture", "land_temp", "alphaearth_similarity"]
# Add top multimodal embedding axes if present in grid_data.csv
embedding_cols = [c for c in df.columns if c.startswith("ae_")]
selected_embeddings = embedding_cols[:8] if len(embedding_cols) >= 8 else []
features = core_features + selected_embeddings

X = df[features]
y = df["label"]

# Train/Test Split (80/20) with stratification
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42)
model.fit(X_train, y_train)

# Comprehensive Senior Engineering Evaluation
accuracy = model.score(X_test, y_test)
y_pred_proba = model.predict_proba(X_test)[:, 1]
y_pred = model.predict(X_test)
auc = roc_auc_score(y_test, y_pred_proba)
precision = precision_score(y_test, y_pred, zero_division=0)
recall = recall_score(y_test, y_pred, zero_division=0)
f1 = f1_score(y_test, y_pred, zero_division=0)

print(f"==================================================")
print(f"PROSPECTIVITY MODEL EVALUATION (HELD-OUT TEST SET)")
print(f"==================================================")
print(f"  Model Accuracy: {accuracy:.2%}")
print(f"  ROC-AUC Score:  {auc:.4f}")
print(f"  Precision:      {precision:.2%}")
print(f"  Recall:         {recall:.2%}")
print(f"  F1-Score:       {f1:.4f}")

print("\nTop Contributing Features (Explainability):")
importances = sorted(zip(features, model.feature_importances_), key=lambda x: x[1], reverse=True)
for feat, imp in importances[:6]:
    print(f"  - {feat:25s}: {imp:.2%}")

# Infer probability for ALL cells in the exploration lease
df["ore_probability"] = model.predict_proba(df[features])[:, 1].round(4)

# Keep required columns for downstream dashboard compatibility
output_cols = [
    "x", "y", "ndvi", "soil_moisture", "land_temp", 
    "alphaearth_similarity", "ore_probability", "label"
]
if "delta_e" in df.columns:
    output_cols.append("delta_e")

df[output_cols].to_csv("grid_predictions.csv", index=False)
joblib.dump(model, "prospectivity_model.pkl")

# Generate High-Resolution Prospectivity Heatmap
grid_size = int(np.sqrt(len(df)))
heatmap = df.pivot(index="y", columns="x", values="ore_probability").values

plt.figure(figsize=(7, 6))
plt.imshow(heatmap, cmap="RdYlBu_r", origin="lower", vmin=0, vmax=1)
plt.colorbar(label="Manganese Ore Likelihood (0.0 to 1.0)")
plt.title("MOIL Sausar Belt: AlphaEarth Fused Prospectivity Heatmap")
plt.xlabel("Grid X (Eastings)")
plt.ylabel("Grid Y (Northings)")
plt.tight_layout()
plt.savefig("prospectivity_heatmap.png", dpi=140)
plt.close()

print("\n Successfully updated 'grid_predictions.csv', 'prospectivity_model.pkl', and 'prospectivity_heatmap.png'.")
