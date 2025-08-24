from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas import Service, ServiceCreate, ServiceUpdate
from crud import get_services, get_service, create_service, update_service
from auth import get_current_active_user, require_role
from models import User, UserRole

router = APIRouter()

@router.get("/", response_model=List[Service])
async def read_services(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Listar serviços"""
    return get_services(db, skip=skip, limit=limit, active_only=active_only)

@router.get("/{service_id}", response_model=Service)
async def read_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obter serviço por ID"""
    db_service = get_service(db, service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return db_service

@router.post("/", response_model=Service)
async def create_new_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Criar novo serviço (apenas admin)"""
    return create_service(db, service)

@router.put("/{service_id}", response_model=Service)
async def update_existing_service(
    service_id: int,
    service_update: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Atualizar serviço (apenas admin)"""
    db_service = update_service(db, service_id, service_update)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return db_service
