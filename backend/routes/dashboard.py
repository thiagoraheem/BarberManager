from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta

from database import get_db
from schemas import DashboardStats
from crud import get_dashboard_stats
from auth import get_current_active_user
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
async def get_recent_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obter atividades recentes para o dashboard"""
    # Últimos agendamentos (últimos 7 dias)
    week_ago = datetime.now() - timedelta(days=7)
    
    # Esta é uma versão simplificada - seria melhor ter queries específicas
    return {
        "message": "Atividades recentes carregadas",
        "period": "últimos 7 dias"
    }
