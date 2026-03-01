# Get token first
# Get token first
token = "admin@jls.in" # wait, we need real login.
# Write simple fastapi test client
from fastapi.testclient import TestClient
import os, sys
sys.path.append(os.path.join(os.getcwd(), 'server'))
from server.main import app

client = TestClient(app)

# We need to bypass auth or login
login_data = {"username": "admin@jls.in", "password": "password123"}
r = client.post("/auth/login", data=login_data)
if r.status_code == 200:
    token = r.json()["access_token"]
    res = client.get("/documents/", headers={"Authorization": f"Bearer {token}"})
    print(res.status_code)
    print(res.json())
else:
    print("Login failed", r.json())
