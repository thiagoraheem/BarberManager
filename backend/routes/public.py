from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel, EmailStr

from database import get_db
from schemas import ClientCreate, AppointmentCreate, Service, User
from crud import (
    get_services, get_users, create_client, create_appointment, 
    get_appointments, get_client_by_email
)
from models import UserRole, AppointmentStatus
from utils.notifications import send_appointment_notification

router = APIRouter()

class PublicClientCreate(BaseModel):
    """Schema for public client creation"""
    nome: str
    email: EmailStr
    telefone: str
    aceite_lgpd: bool = True

class PublicAppointmentCreate(BaseModel):
    """Schema for public appointment creation"""
    cliente: PublicClientCreate
    barbeiro_id: int
    servico_id: int
    data_hora: datetime
    observacoes: Optional[str] = None

class AvailableSlot(BaseModel):
    """Available time slot for appointments"""
    datetime: datetime
    formatted_time: str
    available: bool

@router.get("/services", response_model=List[Service])
async def get_public_services(
    db: Session = Depends(get_db)
):
    """Get available services for public booking"""
    return get_services(db, active_only=True)

@router.get("/barbers", response_model=List[User])
async def get_public_barbers(
    db: Session = Depends(get_db)
):
    """Get available barbers for public booking"""
    users = get_users(db)
    barbers = [user for user in users if user.role == UserRole.BARBEIRO and user.ativo]
    return barbers

@router.get("/availability/{barbeiro_id}")
async def get_barber_availability(
    barbeiro_id: int,
    date_str: str,  # Format: YYYY-MM-DD
    db: Session = Depends(get_db)
):
    """Get available time slots for a barber on a specific date"""
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Define working hours (9 AM to 6 PM)
    start_hour = 9
    end_hour = 18
    slot_duration = 30  # 30 minutes per slot
    
    # Get existing appointments for this barber on this date
    existing_appointments = get_appointments(
        db, 
        date_filter=target_date, 
        barbeiro_id=barbeiro_id,
        limit=100
    )
    
    # Create time slots
    available_slots = []
    current_datetime = datetime.combine(target_date, datetime.min.time().replace(hour=start_hour))
    end_datetime = datetime.combine(target_date, datetime.min.time().replace(hour=end_hour))
    
    while current_datetime < end_datetime:
        # Check if this slot conflicts with existing appointments
        is_available = True
        
        for appointment in existing_appointments:
            # Calculate appointment end time based on service duration
            appointment_start = appointment.data_hora
            appointment_end = appointment_start + timedelta(minutes=appointment.servico.duracao_minutos)
            
            # Check for overlap
            slot_end = current_datetime + timedelta(minutes=slot_duration)
            if (current_datetime < appointment_end and slot_end > appointment_start):
                is_available = False
                break
        
        # Don't allow booking in the past
        if current_datetime <= datetime.now():
            is_available = False
        
        available_slots.append({
            "datetime": current_datetime.isoformat(),
            "formatted_time": current_datetime.strftime("%H:%M"),
            "available": is_available
        })
        
        current_datetime += timedelta(minutes=slot_duration)
    
    return available_slots

@router.post("/book-appointment")
async def create_public_appointment(
    booking: PublicAppointmentCreate,
    db: Session = Depends(get_db)
):
    """Create a new appointment from public booking"""
    try:
        # Check if appointment time is in the future
        if booking.data_hora <= datetime.now():
            raise HTTPException(
                status_code=400, 
                detail="Não é possível agendar para datas passadas"
            )
        
        # Check if the time slot is available
        existing_appointments = get_appointments(
            db,
            date_filter=booking.data_hora.date(),
            barbeiro_id=booking.barbeiro_id,
            limit=100
        )
        
        # Verify no conflicts with existing appointments
        for appointment in existing_appointments:
            appointment_start = appointment.data_hora
            appointment_end = appointment_start + timedelta(minutes=appointment.servico.duracao_minutos)
            
            # For the new appointment, we need to get service duration
            from crud import get_service
            new_service = get_service(db, booking.servico_id)
            if not new_service:
                raise HTTPException(status_code=404, detail="Serviço não encontrado")
            
            new_appointment_end = booking.data_hora + timedelta(minutes=new_service.duracao_minutos)
            
            # Check for overlap
            if (booking.data_hora < appointment_end and new_appointment_end > appointment_start):
                raise HTTPException(
                    status_code=409,
                    detail=f"Horário não disponível. Conflito com agendamento às {appointment_start.strftime('%H:%M')}"
                )
        
        # Check if client already exists by email
        existing_client = get_client_by_email(db, booking.cliente.email)
        
        if existing_client:
            # Use existing client
            client_id = existing_client.id
        else:
            # Create new client
            client_data = ClientCreate(
                nome=booking.cliente.nome,
                email=booking.cliente.email,
                telefone=booking.cliente.telefone,
                aceite_lgpd=booking.cliente.aceite_lgpd
            )
            new_client = create_client(db, client_data)
            client_id = new_client.id
        
        # Create appointment
        appointment_data = AppointmentCreate(
            cliente_id=client_id,
            barbeiro_id=booking.barbeiro_id,
            servico_id=booking.servico_id,
            data_hora=booking.data_hora,
            observacoes=booking.observacoes,
            status=AppointmentStatus.AGENDADO
        )
        
        new_appointment = create_appointment(db, appointment_data)
        
        # Send notification
        try:
            send_appointment_notification(new_appointment, "criado")
        except Exception as e:
            print(f"Erro ao enviar notificação: {e}")
        
        return {
            "message": "Agendamento criado com sucesso!",
            "appointment_id": new_appointment.id,
            "cliente_nome": new_appointment.cliente.nome,
            "barbeiro_nome": new_appointment.barbeiro.nome,
            "servico_nome": new_appointment.servico.nome,
            "data_hora": new_appointment.data_hora.strftime("%d/%m/%Y às %H:%M"),
            "valor": f"R$ {new_appointment.servico.preco:.2f}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@router.get("/appointment/{appointment_id}/confirm")
async def confirm_public_appointment(
    appointment_id: int,
    token: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Confirm a public appointment (for email links)"""
    from crud import get_appointment, update_appointment
    from schemas import AppointmentUpdate
    
    appointment = get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    # Update appointment status to confirmed
    if appointment.status == AppointmentStatus.AGENDADO:
        update_data = AppointmentUpdate(status=AppointmentStatus.CONFIRMADO)
        updated_appointment = update_appointment(db, appointment_id, update_data)
        
        return {
            "message": "Agendamento confirmado com sucesso!",
            "appointment": {
                "cliente_nome": updated_appointment.cliente.nome,
                "barbeiro_nome": updated_appointment.barbeiro.nome,
                "servico_nome": updated_appointment.servico.nome,
                "data_hora": updated_appointment.data_hora.strftime("%d/%m/%Y às %H:%M"),
                "status": updated_appointment.status.value
            }
        }
    else:
        return {
            "message": "Agendamento já foi confirmado anteriormente",
            "appointment": {
                "cliente_nome": appointment.cliente.nome,
                "barbeiro_nome": appointment.barbeiro.nome,
                "servico_nome": appointment.servico.nome,
                "data_hora": appointment.data_hora.strftime("%d/%m/%Y às %H:%M"),
                "status": appointment.status.value
            }
        }

@router.get("/business-hours")
async def get_business_hours():
    """Get business hours for the barbershop"""
    return {
        "monday": {"open": "09:00", "close": "18:00", "closed": False},
        "tuesday": {"open": "09:00", "close": "18:00", "closed": False},
        "wednesday": {"open": "09:00", "close": "18:00", "closed": False},
        "thursday": {"open": "09:00", "close": "18:00", "closed": False},
        "friday": {"open": "09:00", "close": "18:00", "closed": False},
        "saturday": {"open": "09:00", "close": "16:00", "closed": False},
        "sunday": {"open": "09:00", "close": "14:00", "closed": False}
    }