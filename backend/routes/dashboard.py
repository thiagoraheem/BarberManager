from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta

from database import get_db
from schemas import DashboardStats
from crud import get_dashboard_stats
from auth import get_current_active_user
from utils.cache import cache_dashboard_stats
from models import User

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def read_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obter estatísticas do dashboard"""
    return get_dashboard_stats(db)

@router.get("/recent-activities")
@cache_dashboard_stats(ttl=120)  # Cache for 2 minutes
async def get_recent_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obter atividades recentes para o dashboard"""
    from datetime import datetime, timedelta
    from models import Appointment, Sale, AppointmentStatus
    from sqlalchemy.orm import joinedload
    
    # Últimos agendamentos (próximos 5 dias)
    today = datetime.now()
    five_days_ahead = today + timedelta(days=5)
    
    recent_appointments = db.query(Appointment).options(
        joinedload(Appointment.cliente),
        joinedload(Appointment.barbeiro),
        joinedload(Appointment.servico)
    ).filter(
        Appointment.data_hora >= today,
        Appointment.data_hora <= five_days_ahead,
        Appointment.status.in_([
            AppointmentStatus.AGENDADO,
            AppointmentStatus.CONFIRMADO
        ])
    ).order_by(Appointment.data_hora).limit(10).all()
    
    # Últimas vendas (hoje)
    today_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
    recent_sales = db.query(Sale).options(
        joinedload(Sale.vendedor),
        joinedload(Sale.cliente)
    ).filter(
        Sale.criado_em >= today_start
    ).order_by(Sale.criado_em.desc()).limit(5).all()
    
    return {
        "agendamentos": [
            {
                "id": apt.id,
                "cliente_nome": apt.cliente.nome,
                "barbeiro_nome": apt.barbeiro.nome,
                "servico_nome": apt.servico.nome,
                "data_hora": apt.data_hora.isoformat(),
                "status": apt.status.value
            }
            for apt in recent_appointments
        ],
        "vendas": [
            {
                "id": sale.id,
                "vendedor_nome": sale.vendedor.nome,
                "cliente_nome": sale.cliente.nome if sale.cliente else "Cliente avulso",
                "total": sale.total,
                "metodo_pagamento": sale.metodo_pagamento.value,
                "criado_em": sale.criado_em.isoformat()
            }
            for sale in recent_sales
        ]
    }
