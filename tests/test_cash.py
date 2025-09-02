import pytest
from fastapi.testclient import TestClient

def test_open_cash_register(client: TestClient, auth_headers):
    """Test opening a cash register"""
    cash_data = {
        "valor_inicial": 100.0,
        "observacoes_abertura": "Teste de abertura"
    }
    
    response = client.post("/api/cash/open", json=cash_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["valor_inicial"] == 100.0
    assert data["observacoes_abertura"] == "Teste de abertura"
    assert data["status"] == "aberto"
    assert data["data_fechamento"] is None

def test_get_current_cash_register(client: TestClient, auth_headers):
    """Test getting current open cash register"""
    # First open a cash register
    cash_data = {
        "valor_inicial": 50.0,
        "observacoes_abertura": "Teste corrente"
    }
    
    open_response = client.post("/api/cash/open", json=cash_data, headers=auth_headers)
    assert open_response.status_code == 200
    
    # Then get current cash
    response = client.get("/api/cash/current", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["valor_inicial"] == 50.0
    assert data["status"] == "aberto"

def test_cannot_open_multiple_cash_registers(client: TestClient, auth_headers):
    """Test that user cannot open multiple cash registers"""
    # Open first cash register
    cash_data1 = {
        "valor_inicial": 100.0,
        "observacoes_abertura": "Primeiro caixa"
    }
    
    response1 = client.post("/api/cash/open", json=cash_data1, headers=auth_headers)
    assert response1.status_code == 200
    
    # Try to open second cash register
    cash_data2 = {
        "valor_inicial": 200.0,
        "observacoes_abertura": "Segundo caixa"
    }
    
    response2 = client.post("/api/cash/open", json=cash_data2, headers=auth_headers)
    assert response2.status_code == 400
    assert "Já existe um caixa aberto" in response2.json()["detail"]

def test_close_cash_register(client: TestClient, auth_headers):
    """Test closing a cash register"""
    # First open a cash register
    cash_data = {
        "valor_inicial": 150.0,
        "observacoes_abertura": "Para fechar"
    }
    
    open_response = client.post("/api/cash/open", json=cash_data, headers=auth_headers)
    assert open_response.status_code == 200
    cash_id = open_response.json()["id"]
    
    # Close the cash register
    close_data = {
        "valor_final": 200.0,
        "observacoes_fechamento": "Fechamento teste"
    }
    
    close_response = client.put(f"/api/cash/{cash_id}/close", json=close_data, headers=auth_headers)
    assert close_response.status_code == 200
    
    data = close_response.json()
    assert data["valor_final"] == 200.0
    assert data["observacoes_fechamento"] == "Fechamento teste"
    assert data["status"] == "fechado"
    assert data["data_fechamento"] is not None

def test_cannot_close_already_closed_cash(client: TestClient, auth_headers):
    """Test that cannot close an already closed cash register"""
    # Open and close a cash register
    cash_data = {
        "valor_inicial": 100.0
    }
    
    open_response = client.post("/api/cash/open", json=cash_data, headers=auth_headers)
    cash_id = open_response.json()["id"]
    
    close_data = {"valor_final": 150.0}
    client.put(f"/api/cash/{cash_id}/close", json=close_data, headers=auth_headers)
    
    # Try to close again
    response = client.put(f"/api/cash/{cash_id}/close", json=close_data, headers=auth_headers)
    assert response.status_code == 400
    assert "já está fechado" in response.json()["detail"]

def test_cash_status_no_open_cash(client: TestClient, auth_headers):
    """Test cash status when no cash is open"""
    response = client.get("/api/cash/status", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["has_open_cash"] == False
    assert data["cash_register_id"] is None

def test_cash_status_with_open_cash(client: TestClient, auth_headers):
    """Test cash status when cash is open"""
    # Open a cash register
    cash_data = {"valor_inicial": 75.0}
    open_response = client.post("/api/cash/open", json=cash_data, headers=auth_headers)
    cash_id = open_response.json()["id"]
    
    # Check status
    response = client.get("/api/cash/status", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["has_open_cash"] == True
    assert data["cash_register_id"] == cash_id

def test_list_cash_registers(client: TestClient, auth_headers):
    """Test listing cash registers"""
    response = client.get("/api/cash/", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)

def test_get_current_cash_when_none_open(client: TestClient, auth_headers):
    """Test getting current cash when none is open"""
    response = client.get("/api/cash/current", headers=auth_headers)
    assert response.status_code == 404
    assert "Nenhum caixa aberto" in response.json()["detail"]

def test_close_nonexistent_cash(client: TestClient, auth_headers):
    """Test closing a non-existent cash register"""
    close_data = {"valor_final": 100.0}
    response = client.put("/api/cash/999999/close", json=close_data, headers=auth_headers)
    assert response.status_code == 404

def test_barber_cash_isolation(client: TestClient, barber_headers, auth_headers):
    """Test that barbers only see their own cash registers"""
    # Admin opens a cash register
    admin_cash_data = {"valor_inicial": 100.0}
    admin_response = client.post("/api/cash/open", json=admin_cash_data, headers=auth_headers)
    assert admin_response.status_code == 200
    
    # Barber tries to see cash registers
    barber_response = client.get("/api/cash/", headers=barber_headers)
    assert barber_response.status_code == 200
    
    # Barber should not see admin's cash register
    barber_cash_list = barber_response.json()
    admin_cash_id = admin_response.json()["id"]
    
    barber_cash_ids = [cash["id"] for cash in barber_cash_list]
    assert admin_cash_id not in barber_cash_ids