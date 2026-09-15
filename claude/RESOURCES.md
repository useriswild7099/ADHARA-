# Resources for SIH26009 (MOIL) — Data, APIs, Repos, Papers, Antigravity Skills

## 1. Data sources & APIs (all free)

| Source | What it gives you | Link |
|---|---|---|
| Google Earth Engine — AlphaEarth "Satellite Embedding" dataset | Precomputed 10m-resolution AI embeddings covering the whole Earth, 2017–2024. No model download, no GPU — just query by lat/lon/year. **Best beginner shortcut for the prospectivity model.** | earthengine.google.com |
| Copernicus / Sentinel Hub | Raw Sentinel-2 multi-spectral imagery if you want to compute NDVI/soil moisture/temperature yourself instead of using embeddings | dataspace.copernicus.eu |
| NASA POWER API | Free rainfall/climate data by lat/lon and date range, no login needed | power.larc.nasa.gov/docs/services/api |
| Bhuvan (ISRO/NRSC) | Indian satellite imagery + thematic layers + a public API (needs a free access token) | bhuvan-app1.nrsc.gov.in/api |
| GSI Bhukosh | Indian geological & mineral maps | bhukosh.gsi.gov.in |
| MOIL annual reports / Indian Bureau of Mines yearbooks | Real historical production figures, mine names and locations | moil.nic.in (investor/annual reports section) |

## 2. GitHub repos worth knowing about

**Geospatial / prospectivity**
- `cybergis/rs-embed` — one-line embeddings from remote sensing foundation models (Prithvi, TerraMind, etc.) for any place/time
- `torchgeo/terratorch` (mirrored as `IBM/terratorch`) — toolkit for fine-tuning geospatial foundation models (Prithvi, Clay, and others)
- `NASA-IMPACT/Prithvi-EO-2.0` — the actual Prithvi foundation model + fine-tuning examples
- `jakenotjay/aef-loader` — easy Python access to AlphaEarth embedding tiles outside Earth Engine
- `Abdallah-M-Ali/Mineral-Prospectivity-Mapping-ML` — the RF/SVM/ANN/CNN reference architecture (gold prospection, easily adaptable to manganese)
- `RichardScottOZ/mineral-exploration-machine-learning` — a huge curated list of mineral-exploration ML code, papers, and datasets; worth browsing
- `Jack-bo1220/Awesome-Remote-Sensing-Foundation-Models` — curated list of remote-sensing foundation models

**Forecasting**
- `Nixtla/neuralforecast` — 30+ neural forecasting models (N-BEATS, TFT, etc.), sklearn-style API
- `Nixtla/statsforecast` — fast classical models (AutoARIMA, AutoETS) — your safety-net baseline
- `Nixtla/synforecast` — generates synthetic time series if you need more practice data in the Nixtla format
- `amazon-science/chronos-forecasting` and Google's `timesfm` (pip: `chronos-forecasting`, `timesfm`) — zero-shot forecasting foundation models, useful if real data turns out very sparse

**Dashboard**
- `giswqs/leafmap` — Python interactive mapping, integrates with Streamlit
- `keplergl/kepler.gl` and `visgl/deck.gl` — WebGL map visualization, for a finale-stage upgrade

## 3. Research papers (background reading, especially before writing the PPT)

**Manganese-specific**
- *Predicting Manganese Mineralization Using Multi-Source Remote Sensing and Machine Learning: Malkansu Manganese Belt, Western Kunlun* (Minerals, 2025) — RF/Naive Bayes/XGBoost, AUC 0.92–0.98
- *Manganese mineral prospectivity based on deep convolutional neural networks in Songtao, NE Guizhou* (Earth Science Informatics, 2024)
- *Geological Controls and Prospectivity Mapping for Manganese Ore Deposits... Sinai Microplate, Egypt* (Journal of Earth Science, 2023)
- Singh & Rao (2006) — early image-processing work specifically on distinguishing **Indian** ferruginous manganese ores — good to cite given your project is India-based

**General methodology / background**
- *A review of machine learning in processing remote sensing data for mineral exploration* — arXiv:2103.07678
- *TerraTorch: The Geospatial Foundation Models Toolkit* — arXiv:2503.20563
- *Any Model, Any Place, Any Time: Get Remote Sensing Foundation Model Embeddings On Demand* (the rs-embed paper) — arXiv:2602.23678

## 4. Google Antigravity — what it is & skills for this project

Google Antigravity is Google's agent-first IDE (built on Gemini 3), where you
delegate whole coding tasks to an AI agent instead of writing every line
yourself. It supports **Skills** — small folders with a `SKILL.md` file that
teach the agent your project's specific conventions, so it doesn't have to
re-figure them out every session.

There's no ready-made public skill for mineral prospectivity or MOIL
specifically — this is niche enough that you'd write your own. I've already
added three starter skills into this project folder under `.agent/skills/`:

- `geo-data-fetch/SKILL.md` — how to swap the fake data for real satellite/rainfall/geology data
- `prospectivity-model/SKILL.md` — house rules for the ore-mapping model (which model to default to, what to always report, output file contract)
- `forecast-model/SKILL.md` — house rules for the forecasting model (which library to reach for depending on how much real data you have, output file contract)

If you open this project folder in Antigravity, these skills load automatically
whenever a task matches their description — you don't need to paste them into
every prompt.
