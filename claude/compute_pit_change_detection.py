"""
PIT BOUNDARY CHANGE DETECTION & WATERLOGGING HAZARD ENGINE (SIH26009)
--------------------------------------------------------------------
Implements the temporal change detection outlined in the research:
- Annual AlphaEarth Latent Distance: Delta_E = 1 - (v_2017 . v_2024)
- Pit Footprint Shift: Active bench expansion vs. static bedrock
- Haul-Road Waterlogging & Instability Index (SAR Radar Backscatter)
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def analyze_pit_dynamics():
    print("Executing Pit Footprint Change Detection (2017 vs. 2024)...")
    df = pd.read_csv("grid_data.csv")

    # Change categories based on Delta_E
    # Delta E >= 0.05: Active excavation / rapid bench cut
    # Delta E in [0.02, 0.05): Overburden dumping / perimeter haulage
    # Delta E < 0.02: Stable unmined terrain
    conditions = [
        (df["delta_e"] >= 0.05),
        (df["delta_e"] >= 0.02) & (df["delta_e"] < 0.05),
        (df["delta_e"] < 0.02)
    ]
    choices = ["Active Excavation / Bench Cut", "Overburden / Dump Movement", "Stable Unmined Terrain"]
    df["terrain_classification"] = np.select(conditions, choices, default="Stable Unmined Terrain")

    # Waterlogging Risk Index (fuses SAR moisture dimension + low elevation runoff)
    # High soil moisture + low thermal inertia = high saturation pooling
    moisture_hazard = (df["soil_moisture"] * 0.6) + ((48.0 - df["land_temp"]) / 28.0 * 0.4)
    df["waterlogging_risk_index"] = np.clip(moisture_hazard, 0.0, 1.0).round(4)
    
    # Save change detection dataset
    output_cols = [
        "x", "y", "delta_e", "terrain_classification", 
        "waterlogging_risk_index", "alphaearth_similarity"
    ]
    df[output_cols].to_csv("pit_change_detection.csv", index=False)
    print(" Generated 'pit_change_detection.csv' successfully.")

    # Generate diagnostic visualization
    grid_size = int(np.sqrt(len(df)))
    delta_e_map = df.pivot(index="y", columns="x", values="delta_e").values
    waterlog_map = df.pivot(index="y", columns="x", values="waterlogging_risk_index").values

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    im1 = ax1.imshow(delta_e_map, cmap="magma", origin="lower")
    ax1.set_title("Pit Footprint Divergence (ΔE: 2017–2024)")
    ax1.set_xlabel("Grid X")
    ax1.set_ylabel("Grid Y")
    fig.colorbar(im1, ax=ax1, label="Latent Shift ΔE")

    im2 = ax2.imshow(waterlog_map, cmap="Blues", origin="lower")
    ax2.set_title("Bench & Haul Road Waterlogging Hazard")
    ax2.set_xlabel("Grid X")
    ax2.set_ylabel("Grid Y")
    fig.colorbar(im2, ax=ax2, label="Saturation Risk (0-1)")

    plt.tight_layout()
    plt.savefig("pit_change_detection.png", dpi=120)
    plt.close()
    print(" Saved 'pit_change_detection.png'.")

if __name__ == "__main__":
    analyze_pit_dynamics()
