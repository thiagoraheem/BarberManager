import pytest
from fastapi.testclient import TestClient

def test_create_sale(client: TestClient, auth_headers, test_client, test_service):
    """Test creating a new sale"""
    sale_data = {
        "cliente_id": test_client.id,
        "itens": [
            {
                "servico_id": test_service.id,
                "quantidade": 1,
                "preco_unitario": test_service.preco
            }
        ],
        "desconto": 0,
        "metodo_pagamento": "dinheiro",
        "observacoes": "Venda teste"
    }
    
    response = client.post("/api/pos/sales", json=sale_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["cliente_id"] == test_client.id
    assert data["total"] == test_service.preco
    assert data["metodo_pagamento"] == "dinheiro"
    assert len(data["itens"]) == 1

def test_sale_without_client(client: TestClient, auth_headers, test_service):
    """Test creating a sale without specifying a client"""
    sale_data = {
        "itens": [
            {
                "servico_id": test_service.id,
                "quantidade": 2,
                "preco_unitario": test_service.preco
            }
        ],
        "desconto": 5.0,
        "metodo_pagamento": "cartao_credito"
    }
    
    response = client.post("/api/pos/sales", json=sale_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["cliente_id"] is None
    assert data["total"] == (test_service.preco * 2) - 5.0  # With discount
    assert data["metodo_pagamento"] == "cartao_credito"

def test_multiple_items_sale(client: TestClient, auth_headers, test_service, db_session):
    """Test creating a sale with multiple items"""
    # Create another service for testing
    from models import Service
    service2 = Service(
        nome="Barba Teste",
        preco=20.0,
        duracao_minutos=20,
        ativo=True
    )
    db_session.add(service2)
    db_session.commit()
    db_session.refresh(service2)
    
    sale_data = {
        "itens": [
            {
                "servico_id": test_service.id,
                "quantidade": 1,
                "preco_unitario": test_service.preco
            },
            {
                "servico_id": service2.id,
                "quantidade": 1,
                "preco_unitario": service2.preco
            }
        ],
        "desconto": 0,
        "metodo_pagamento": "pix"
    }
    
    response = client.post("/api/pos/sales", json=sale_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    expected_total = test_service.preco + service2.preco
    assert data["total"] == expected_total
    assert len(data["itens"]) == 2

def test_sale_with_discount(client: TestClient, auth_headers, test_service):
    """Test creating a sale with discount"""
    discount_amount = 10.0
    sale_data = {
        "itens": [
            {
                "servico_id": test_service.id,
                "quantidade": 1,
                "preco_unitario": test_service.preco
            }
        ],
        "desconto": discount_amount,
        "metodo_pagamento": "dinheiro"
    }
    
    response = client.post("/api/pos/sales", json=sale_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    expected_total = test_service.preco - discount_amount
    assert data["total"] == expected_total
    assert data["desconto"] == discount_amount

def test_list_sales(client: TestClient, auth_headers):
    """Test listing sales"""
    response = client.get("/api/pos/sales", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)

def test_sales_date_filter(client: TestClient, auth_headers):
    """Test filtering sales by date"""
    from datetime import date
    today = date.today()
    
    response = client.get(
        f"/api/pos/sales?start_date={today}&end_date={today}",
        headers=auth_headers
    )
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)

def test_payment_methods_endpoint(client: TestClient, auth_headers):
    """Test getting available payment methods"""
    response = client.get("/api/pos/payment-methods", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    # Should include common payment methods
    payment_methods = [method["value"] for method in data]
    assert "dinheiro" in payment_methods
    assert "cartao_credito" in payment_methods
    assert "pix" in payment_methods

def test_sale_invalid_service(client: TestClient, auth_headers):
    """Test creating sale with invalid service ID"""
    sale_data = {
        "itens": [
            {
                "servico_id": 999999,  # Non-existent service
                "quantidade": 1,
                "preco_unitario": 30.0
            }
        ],
        "metodo_pagamento": "dinheiro"
    }
    
    response = client.post("/api/pos/sales", json=sale_data, headers=auth_headers)
    # Should fail with foreign key constraint or validation error
    assert response.status_code in [400, 422, 500]

def test_sale_calculation_accuracy(client: TestClient, auth_headers, test_service):
    """Test that sale totals are calculated correctly"""
    quantity = 3
    unit_price = 25.50
    discount = 5.25
    
    sale_data = {
        "itens": [
            {
                "servico_id": test_service.id,
                "quantidade": quantity,
                "preco_unitario": unit_price
            }
        ],
        "desconto": discount,
        "metodo_pagamento": "cartao_debito"
    }
    
    response = client.post("/api/pos/sales", json=sale_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    expected_subtotal = quantity * unit_price
    expected_total = expected_subtotal - discount
    
    assert data["total"] == expected_total
    assert data["itens"][0]["subtotal"] == expected_subtotal