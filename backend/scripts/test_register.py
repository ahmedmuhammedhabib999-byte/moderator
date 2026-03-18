import json
import urllib.request

url = "http://localhost:8000/api/v1/register"

payload = {"email": "test@example.com", "password": "test123"}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)

try:
    with urllib.request.urlopen(req) as resp:
        print("status", resp.status)
        print(resp.read().decode())
except Exception as e:
    import traceback

    traceback.print_exc()
