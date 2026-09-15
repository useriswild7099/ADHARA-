# Engineering & Contribution Guidelines: ADHARA Platform

This document outlines architectural conventions, coding standards, and verification procedures for developing and extending the ADHARA platform.

---

## 1. Monorepo Architecture Principles

The repository is structured into two primary decoupled tiers:
* **Frontend Tactical Cockpit (`frontend/`)**: React 18, Vite 8, Tailwind CSS, Three.js WebGL.
* **Geospatial & ML Engine (`claude/`)**: Python 3.9+, Scikit-Learn, Statsmodels, Pandas.

### Key Boundary Rule:
The frontend interacts with the analytical core strictly through static typed JSON data contracts placed in `frontend/src/data/` (compiled by `claude/export_data_for_frontend.py`). When adding new features or telemetry:
1. Implement the mathematical / geospatial algorithm in `claude/`.
2. Update `export_data_for_frontend.py` to serialize the structured output.
3. Import the updated JSON data store into the corresponding React component.

---

## 2. Frontend Development Standards (`frontend/`)

### Performance & Memory Lifecycle
* **Three.js WebGL Resources**: All Three.js geometries, materials, and textures mounted inside `GlobeStage.jsx` or `GodsEyeVisor.jsx` **must** implement explicit disposal hooks (`geometry.dispose()`, `material.dispose()`) inside `useEffect` cleanup routines to prevent GPU memory leaks across tab switches.
* **Code-Splitting**: Major view modules (`ExplorationTab`, `ForecastTab`, `PlaybookTab`, `ValidationTab`) must be imported dynamically using `React.lazy` and wrapped with `<Suspense fallback={<TabSkeleton />}>`.
* **CSS & Design Tokens**: Adhere strictly to the Tailwind color scheme and typography tokens defined in `tailwind.config.js`. Avoid arbitrary inline styling for primary layout elements.

### Build Verification
Before opening a pull request or pushing commits, verify the bundle:
```bash
cd frontend
npm run build
```
Ensure no bundle chunk (outside `vendor-three`) exceeds the 500 KB limit.

---

## 3. Python ML Engine Standards (`claude/`)

* **Determinism & Reproducibility**: All stochastic procedures (train/test splits, Random Forest estimators, synthetic data generators) must specify explicit random seeds (`random_state=42`, `np.random.seed(42)`).
* **Evaluation Integrity**: Never report train-set metrics as model performance. All reported statistics (ROC-AUC, Precision, Recall, F1, MAE) must be computed on held-out test splits.
* **Error Handling & Resilience**: Satellite API connectors (e.g. Google Earth Engine, NASA POWER) must implement graceful fallbacks so that offline environments or unauthenticated sessions do not crash the runtime pipeline.

---

## 4. Operational Commands Recap

| Action | Command (Windows) | Command (Bash / POSIX) |
|---|---|---|
| Launch Full Stack | `run.bat both` | Run `npm run dev` in `frontend/` & `streamlit run app.py` in `claude/` |
| Retrain ML Pipeline | `run.bat pipeline` | Execute Python scripts 1–6 in `claude/` |
| Performance Audit | `node benchmark.js` | `node benchmark.js` |
| Production Web Build | `run.bat build` | `cd frontend && npm run build` |
