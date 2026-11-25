"""Converts client-data/inspection-checklist.csv into site/data/inspections.js for the car-page warning lights.
Run: python3 tools/build_inspections.py"""
import csv, json, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
MAP = {'engine': 'engine', 'gearbox': 'gearbox', 'brakes': 'brakes', 'tyres': 'tyres', 'headlights': 'lights', 'battery': 'battery',
       'suspension': 'suspension', 'service_history': 'service'}
OK = {'good', 'advisory', 'attention'}
out, skipped = {}, []
with open(os.path.join(ROOT, 'client-data', 'inspection-checklist.csv'), newline='', encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        ref = (row.get('ref') or '').strip()
        if not ref: continue
        items, notes = {}, {}
        for col, key in MAP.items():
            v = (row.get(col) or '').strip().lower()
            if v in OK: items[key] = v
            elif v: skipped.append(f'{ref} {col}="{v}"')
            n = (row.get('notes_' + col) or '').strip()
            if n: notes[key] = n[:80]
        if items or notes or (row.get('inspected_on') or '').strip():
            out[ref] = {'date': (row.get('inspected_on') or '').strip(), 'by': (row.get('inspected_by') or '').strip(), 'items': items, 'notes': notes}
with open(os.path.join(ROOT, 'site', 'data', 'inspections.js'), 'w') as f:
    f.write('/* Generated from client-data/inspection-checklist.csv by tools/build_inspections.py. Do not edit by hand. */\n')
    f.write('window.EAG_INSPECTIONS=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(f'{len(out)} inspected cars written.' + (f' Ignored unknown values: {", ".join(skipped)}' if skipped else ''))
