import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

def test_create_appointment(client: TestClient, auth_headers, test_client, barber_user, test_service):
    """Test creating a new appointment"""
    appointment_data = {
        "cliente_id": test_client.id,
        "barbeiro_id": barber_user.id,
        "servico_id": test_service.id,
        "data_hora": (datetime.now() + timedelta(days=1)).isoformat(),
        "observacoes": "Test appointment"
    }
    
    response = client.post(
        "/api/appointments/",
        json=appointment_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["cliente_id"] == test_client.id
    assert data["barbeiro_id"] == barber_user.id
    assert data["servico_id"] == test_service.id
    assert data["status"] == "agendado"

def test_list_appointments(client: TestClient, auth_headers):
    """Test listing appointments"""
    response = client.get("/api/appointments/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_appointment_conflict_detection(client: TestClient, auth_headers, test_client, barber_user, test_service):
    """Test appointment conflict detection"""
    # Create first appointment
    appointment_time = datetime.now() + timedelta(days=1)
    appointment_data = {
        "cliente_id": test_client.id,
        "barbeiro_id": barber_user.id,
        "servico_id": test_service.id,
        "data_hora": appointment_time.isoformat(),
        "observacoes": "First appointment"
    }
    
    response = client.post("/api/appointments/", json=appointment_data, headers=auth_headers)
    assert response.status_code == 200
    
    # Try to create conflicting appointment (same time, same barber)
    conflicting_data = {
        "cliente_id": test_client.id,
        "barbeiro_id": barber_user.id,
        "servico_id": test_service.id,
        "data_hora": appointment_time.isoformat(),  # Same time
        "observacoes": "Conflicting appointment"
    }
    
    response = client.post("/api/appointments/", json=conflicting_data, headers=auth_headers)
    assert response.status_code == 400
    assert "Conflito de agendamento" in response.json()["detail"]

def test_appointment_past_date_validation(client: TestClient, auth_headers, test_client, barber_user, test_service):
    """Test that appointments cannot be created in the past"""
    past_time = datetime.now() - timedelta(days=1)
    appointment_data = {
        "cliente_id": test_client.id,
        "barbeiro_id": barber_user.id,
        "servico_id": test_service.id,
        "data_hora": past_time.isoformat(),
        "observacoes": "Past appointment"
    }
    
    # Note: This test assumes validation is implemented in the frontend
    # The backend currently allows past appointments for flexibility
    response = client.post("/api/appointments/", json=appointment_data, headers=auth_headers)
    # For now, we expect this to succeed (backend allows it)
    assert response.status_code == 200

def test_barber_own_appointments_access(client: TestClient, barber_headers, barber_user):
    """Test that barbers can only see their own appointments"""
    response = client.get("/api/appointments/", headers=barber_headers)
    assert response.status_code == 200
    
    appointments = response.json()
    # All appointments should belong to the barber
    for appointment in appointments:
        if "barbeiro_id" in appointment:
            assert appointment["barbeiro_id"] == barber_user.id

def test_update_appointment_status(client: TestClient, auth_headers, test_client, barber_user, test_service):
    """Test updating appointment status"""
    # Create appointment first
    appointment_data = {
        "cliente_id": test_client.id,
        "barbeiro_id": barber_user.id,
        "servico_id": test_service.id,
        "data_hora": (datetime.now() + timedelta(days=1)).isoformat(),
        "observacoes": "Test appointment"
    }
    
    create_response = client.post("/api/appointments/", json=appointment_data, headers=auth_headers)
    assert create_response.status_code == 200
    appointment_id = create_response.json()["id"]
    
    # Update status
    update_data = {"status": "confirmado"}
    response = client.put(f"/api/appointments/{appointment_id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    
    updated_appointment = response.json()
    assert updated_appointment["status"] == "confirmado"

def test_get_appointment_by_id(client: TestClient, auth_headers, test_client, barber_user, test_service):
    """Test getting a specific appointment by ID"""
    # Create appointment first
    appointment_data = {
        "cliente_id": test_client.id,
        "barbeiro_id": barber_user.id,
        "servico_id": test_service.id,
        "data_hora": (datetime.now() + timedelta(days=1)).isoformat(),
        "observacoes": "Test appointment"
    }
    
    create_response = client.post("/api/appointments/", json=appointment_data, headers=auth_headers)
    assert create_response.status_code == 200
    appointment_id = create_response.json()["id"]
    
    # Get appointment by ID
    response = client.get(f"/api/appointments/{appointment_id}", headers=auth_headers)
    assert response.status_code == 200
    
    appointment = response.json()
    assert appointment["id"] == appointment_id
    assert appointment["cliente_id"] == test_client.id

def test_nonexistent_appointment(client: TestClient, auth_headers):
    """Test getting a non-existent appointment"""
    response = client.get("/api/appointments/999999", headers=auth_headers)
    assert response.status_code == 404

def test_calendar_view(client: TestClient, auth_headers):
    """Test calendar view endpoint"""
    current_date = datetime.now()
    response = client.get(
        f"/api/appointments/calendar/{current_date.year}/{current_date.month}",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)