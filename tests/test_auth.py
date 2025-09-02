import pytest
from fastapi.testclient import TestClient

def test_login_success(client: TestClient, admin_user):
    """Test successful login"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": admin_user.email,
            "password": "admin123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_password(client: TestClient, admin_user):
    """Test login with invalid password"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": admin_user.email,
            "password": "wrong_password"
        }
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_login_invalid_email(client: TestClient):
    """Test login with invalid email"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": "nonexistent@test.com",
            "password": "anypassword"
        }
    )
    assert response.status_code == 401

def test_get_current_user(client: TestClient, auth_headers):
    """Test getting current user info"""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert "nome" in data
    assert "role" in data

def test_unauthorized_access(client: TestClient):
    """Test accessing protected endpoint without token"""
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_invalid_token(client: TestClient):
    """Test accessing protected endpoint with invalid token"""
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401

def test_role_based_access(client: TestClient, barber_headers):
    """Test role-based access control"""
    # Barber should not be able to create users (admin only)
    response = client.post(
        "/api/users/",
        json={
            "nome": "Test User",
            "email": "test@test.com",
            "senha": "test123",
            "role": "recepcionista"
        },
        headers=barber_headers
    )
    assert response.status_code == 403