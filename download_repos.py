import os
import shutil
import subprocess
import time

repos = [
    # Geospatial
    ("geospatial", "rs-embed", "https://github.com/cybergis/rs-embed.git"),
    ("geospatial", "aef-loader", "https://github.com/jakenotjay/aef-loader.git"),
    ("geospatial", "Mineral-Prospectivity-Mapping-ML", "https://github.com/Abdallah-M-Ali/Mineral-Prospectivity-Mapping-ML.git"),
    ("geospatial", "mineral-exploration-machine-learning", "https://github.com/RichardScottOZ/mineral-exploration-machine-learning.git"),
    ("geospatial", "Awesome-Remote-Sensing-Foundation-Models", "https://github.com/Jack-bo1220/Awesome-Remote-Sensing-Foundation-Models.git"),
    ("geospatial", "Prithvi-EO-2.0", "https://github.com/NASA-IMPACT/Prithvi-EO-2.0.git"),
    ("geospatial", "terratorch", "https://github.com/torchgeo/terratorch.git"),

    # Forecasting
    ("forecasting", "statsforecast", "https://github.com/Nixtla/statsforecast.git"),
    ("forecasting", "synforecast", "https://github.com/Nixtla/synforecast.git"),
    ("forecasting", "neuralforecast", "https://github.com/Nixtla/neuralforecast.git"),
    ("forecasting", "chronos-forecasting", "https://github.com/amazon-science/chronos-forecasting.git"),
    ("forecasting", "timesfm", "https://github.com/google-research/timesfm.git"),

    # Dashboard / Map
    ("dashboard", "leafmap", "https://github.com/giswqs/leafmap.git"),
    ("dashboard", "kepler.gl", "https://github.com/keplergl/kepler.gl.git"),
    ("dashboard", "deck.gl", "https://github.com/visgl/deck.gl.git"),
]

base_dir = r"c:\Users\Lenovo\Downloads\sih hackathon\reference_repos"

for category, name, url in repos:
    target_path = os.path.join(base_dir, category, name)
    print(f"\n==========================================")
    print(f"[{category.upper()}] Checking {name}...")

    # If valid git repository already exists, skip
    if os.path.exists(os.path.join(target_path, ".git")):
        print(f"-> Already fully cloned. Skipping.")
        continue

    # If broken/empty directory exists, remove it
    if os.path.exists(target_path):
        print(f"-> Incomplete directory found. Cleaning up...")
        shutil.rmtree(target_path, ignore_errors=True)

    print(f"-> Cloning {name} from {url}...")
    cmd = ["git", "clone", "--depth", "1", "--single-branch", url, target_path]
    success = False

    for attempt in range(1, 3):
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=180)
            print(f"-> Successfully cloned {name}!")
            success = True
            break
        except subprocess.CalledProcessError as e:
            print(f"-> Attempt {attempt} failed: {e.stderr.strip()}")
        except subprocess.TimeoutExpired:
            print(f"-> Attempt {attempt} timed out.")
        except Exception as e:
            print(f"-> Attempt {attempt} error: {e}")
        
        if attempt < 2:
            time.sleep(2)

    if not success:
        print(f"-> [WARNING] Could not clone {name}. Moving to next repository.")

print("\n==========================================")
print("All repository checks and downloads completed!")
