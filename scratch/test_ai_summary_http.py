import requests
import json
import sys

# Test against running FastAPI server at http://localhost:8000
login_url = "http://localhost:8000/api/v1/auth/login"
payload = {
    "email": "mandhanani@gmail.com",
    "password": "Password123!"
}

resp = requests.post(login_url, json=payload)
if resp.status_code != 200:
    print("Login failed:", resp.status_code, resp.text)
    sys.exit(1)

token = resp.json()["data"]["access_token"]
headers = {"Authorization": f"Bearer {token}"}

summary_url = "http://localhost:8000/api/v1/reports/ai-summary?filter=this_month"
resp_summary = requests.post(summary_url, headers=headers)
print("HTTP Status:", resp_summary.status_code)
print("Response Message:", resp_summary.json().get("message"))
data = resp_summary.json().get("data", {})
print("Keys Count:", len(data.keys()))
print("Sample Overall Summary:", data.get("overall_summary"))
print("Sample Action Plan Count:", len(data.get("action_plan", [])))
