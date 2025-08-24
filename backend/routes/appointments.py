from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from schemas import Appointment, AppointmentCreate, AppointmentUpdate
from crud import get_appointments, get_appointment, create_appointment, update_appointment
from auth import get_current_active_user
from models import User, UserRole
from utils.notifications import send_appointment_notification

router = APIRouter()

@router.get("/", response_model=List[Appointment])
async def read_appointments(
    skip: int = 0,
    limit: int = 100,
    date_filter: Optional[date] = None,
    barbeiro_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Listar agendamentos com filtros opcionais"""
    # Se for barbeiro, mostrar apenas seus agendamentos
    if current_user.role == UserRole.BARBEIRO:
        barbeiro_id = current_user.id
    
    return get_appointments(db, skip=skip, limit=limit, date_filter=date_filter, barbeiro_id=barbeiro_id)

@router.get("/{appointment_id}", response_model=Appointment)
async def read_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obter agendamento por ID"""
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    # Verificar se barbeiro só pode ver seus próprios agendamentos
    if current_user.role == UserRole.BARBEIRO and db_appointment.barbeiro_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    return db_appointment

@router.post("/", response_model=Appointment)
async def create_new_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Criar novo agendamento"""
    db_appointment = create_appointment(db, appointment)
    
    # Enviar notificação
    try:
        send_appointment_notification(db_appointment, "criado")
    except Exception as e:
        print(f"Erro ao enviar notificação: {e}")
    
    return db_appointment

@router.put("/{appointment_id}", response_model=Appointment)
async def update_existing_appointment(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Atualizar agendamento"""
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    # Verificar permissões
    if current_user.role == UserRole.BARBEIRO and db_appointment.barbeiro_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    updated_appointment = update_appointment(db, appointment_id, appointment_update)
    
    # Enviar notificação se status mudou
    if appointment_update.status:
        try:
            send_appointment_notification(updated_appointment, "atualizado")
        except Exception as e:
            print(f"Erro ao enviar notificação: {e}")
    
    return updated_appointment

@router.get("/calendar/{year}/{month}")
async def get_calendar_appointments(
    year: int,
    month: int,
    barbeiro_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obter agendamentos para visualização de calendário"""
    # Se for barbeiro, mostrar apenas seus agendamentos
    if current_user.role == UserRole.BARBEIRO:
        barbeiro_id = current_user.id
    
    # Buscar agendamentos do mês
    appointments = get_appointments(db, limit=1000, barbeiro_id=barbeiro_id)
    
    # Filtrar por mês/ano e formatar para calendário
    calendar_events = []
    for appointment in appointments:
        if appointment.data_hora.year == year and appointment.data_hora.month == month:
            calendar_events.append({
                "id": appointment.id,
                "title": f"{appointment.servico.nome} - {appointment.cliente.nome}",
                "start": appointment.data_hora.isoformat(),
                "status": appointment.status.value,
                "barbeiro": appointment.barbeiro.nome,
                "cliente": appointment.cliente.nome,
                "servico": appointment.servico.nome
            })
    
    return calendar_events
