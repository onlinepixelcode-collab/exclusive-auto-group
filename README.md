# Exclusive Auto Group — website demo

Cinematic multi-page demo website for Exclusive Auto Group (Cape Town), built by Pixel Code.

- `site/` — the website (static HTML, CSS and JavaScript; open `site/index.html` or serve the folder)
- `tools/build_pages.py` — regenerates the inner pages from one template (`python3 tools/build_pages.py`)
- `tools/build_inspections.py` — turns `client-data/inspection-checklist.csv` into the car-page warning lights
- `client-data/` — the inspection checklist the dealership fills in, with instructions

Run locally:

    python3 -m http.server 5178 --directory site

Stock data in `site/data/stock.js` is a snapshot of the dealership's public listing.
