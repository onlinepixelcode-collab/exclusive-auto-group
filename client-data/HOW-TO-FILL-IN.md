# Inspection checklist: how to fill it in

Open `inspection-checklist.csv` in Excel, Numbers or Google Sheets. One row per car (the stock reference is in the `ref` column).

For each system, type one of these words, or leave it blank:

| What you enter | Light on the website |
|---|---|
| *(nothing)* | Green: no issues noted (this is the default) |
| a note only (in the `notes_…` column) | Amber: shows your note on hover |
| `advisory` | Amber: fine, but worth noting (e.g. tyres at 40%) |
| `attention` | Red: needs attention |
| `good` | Green: checked and good |

- `inspected_on`: date of the inspection, e.g. `25 Nov 2026`
- `inspected_by`: name shown on the site, e.g. `Exclusive Auto Group workshop`
- `notes_…` columns: optional short note shown when a visitor hovers the light, e.g. `Front tyres 40%`

Every light is green unless you add a note or a status, so please add a note or `attention` for anything a buyer should know about. Each car also shows a "Request the report" button.

When done, save as CSV and run (from the project folder):

    python3 tools/build_inspections.py

This updates `site/data/inspections.js`, which the car pages read.
