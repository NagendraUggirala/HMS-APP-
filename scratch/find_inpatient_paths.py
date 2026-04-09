import json

with open('openapi.json', 'r') as f:
    data = json.load(f)

paths = data.get('paths', {})
matches = [p for p in paths.keys() if 'admission' in p.lower() or 'inpatient' in p.lower()]
matches.sort()

for p in matches:
    print(p)
