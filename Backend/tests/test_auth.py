import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_and_health():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"
    assert health.json()["database"] == "connected"


def test_auth_registration_and_login():
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    # 1. Register
    reg_response = client.post(
        "/api/auth/register",
        json={
            "name": "Test Candidate",
            "email": unique_email,
            "password": password
        }
    )
    assert reg_response.status_code == 200, reg_response.text
    data = reg_response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # 2. Duplicate registration should fail with 400
    dup_response = client.post(
        "/api/auth/register",
        json={
            "name": "Duplicate Candidate",
            "email": unique_email,
            "password": password
        }
    )
    assert dup_response.status_code == 400

    # 3. Login with correct credentials
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": unique_email,
            "password": password
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    # 4. Login with wrong password
    bad_login = client.post(
        "/api/auth/login",
        json={
            "email": unique_email,
            "password": "WrongPassword!"
        }
    )
    assert bad_login.status_code == 401

    # 5. Access /me with token
    headers = {"Authorization": f"Bearer {token}"}
    me_response = client.get("/api/auth/me", headers=headers)
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == unique_email
    assert me_data["name"] == "Test Candidate"

    # 6. Access /me without token
    unauth_response = client.get("/api/auth/me")
    assert unauth_response.status_code == 401 or unauth_response.status_code == 403
