import pytest
from fastapi.testclient import TestClient

def test_create_client(client: TestClient, auth_headers):
    """Test creating a new client"""
    client_data = {
        "nome": "João Silva",
        "email": "joao@test.com",
        "telefone": "11999887766",
        "cpf": "12345678901",
        "aceite_lgpd": True
    }
    
    response = client.post("/api/clients/", json=client_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["nome"] == "João Silva"
    assert data["email"] == "joao@test.com"
    assert data["aceite_lgpd"] == True
    assert data["ativo"] == True

def test_list_clients(client: TestClient, auth_headers):
    """Test listing clients"""
    response = client.get("/api/clients/", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)

def test_get_client_by_id(client: TestClient, auth_headers, test_client):
    """Test getting a specific client by ID"""
    response = client.get(f"/api/clients/{test_client.id}", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == test_client.id
    assert data["nome"] == test_client.nome

def test_update_client(client: TestClient, auth_headers, test_client):
    """Test updating client information"""
    update_data = {
        "nome": "Cliente Atualizado",
        "telefone": "11888776655"
    }
    
    response = client.put(f"/api/clients/{test_client.id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["nome"] == "Cliente Atualizado"
    assert data["telefone"] == "11888776655"

def test_client_email_uniqueness(client: TestClient, auth_headers, test_client):
    """Test that client emails must be unique"""
    duplicate_client_data = {
        "nome": "Cliente Duplicado",
        "email": test_client.email,  # Same email as existing client
        "telefone": "11777666555",
        "aceite_lgpd": True
    }
    
    response = client.post("/api/clients/", json=duplicate_client_data, headers=auth_headers)
    # Should fail due to unique constraint
    assert response.status_code in [400, 422]

def test_client_search(client: TestClient, auth_headers):
    """Test client search functionality"""
    # Create a client with specific name for searching
    client_data = {
        "nome": "Maria Santos",
        "email": "maria@search.com",
        "telefone": "11555444333",
        "aceite_lgpd": True
    }
    
    create_response = client.post("/api/clients/", json=client_data, headers=auth_headers)
    assert create_response.status_code == 200
    
    # Search for the client
    search_response = client.get("/api/clients/?search=Maria", headers=auth_headers)
    assert search_response.status_code == 200
    
    search_results = search_response.json()
    assert len(search_results) > 0
    assert any(client["nome"] == "Maria Santos" for client in search_results)

def test_lgpd_consent_tracking(client: TestClient, auth_headers):
    """Test LGPD consent tracking"""
    client_data = {
        "nome": "Cliente LGPD",
        "email": "lgpd@test.com",
        "telefone": "11444333222",
        "aceite_lgpd": True
    }
    
    response = client.post("/api/clients/", json=client_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["aceite_lgpd"] == True
    assert "data_aceite_lgpd" in data
    assert data["data_aceite_lgpd"] is not None

def test_client_without_lgpd_consent(client: TestClient, auth_headers):
    """Test creating client without LGPD consent"""
    client_data = {
        "nome": "Cliente Sem LGPD",
        "email": "semlgpd@test.com",
        "telefone": "11333222111",
        "aceite_lgpd": False
    }
    
    response = client.post("/api/clients/", json=client_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["aceite_lgpd"] == False
    assert data["data_aceite_lgpd"] is None

def test_nonexistent_client(client: TestClient, auth_headers):
    """Test getting a non-existent client"""
    response = client.get("/api/clients/999999", headers=auth_headers)
    assert response.status_code == 404

def test_client_pagination(client: TestClient, auth_headers):
    """Test client list pagination"""
    # Test with pagination parameters
    response = client.get("/api/clients/?skip=0&limit=5", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5