import urllib.request
import json
import os

repo_url = "https://api.github.com/repos/pepeangell5/CYBERDECK-MINI-ESP32"

try:
    response = urllib.request.urlopen(repo_url)
    data = json.loads(response.read().decode('utf-8'))
    print(f"Original description: {data.get('description')}")
except Exception as e:
    print(f"Error fetching repo data: {e}")
