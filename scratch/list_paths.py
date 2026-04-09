import json

with open('openapi.json', 'r') as f:
    data = json.load(f)

paths = data.get('paths', {})
admin_paths = [p for p in paths.keys() if '/api/v1/hospital-admin' in p]
admin_paths.sort()

for p in admin_paths:
    print(p)
