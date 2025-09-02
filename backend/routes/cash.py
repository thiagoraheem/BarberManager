from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas import CashRegister, CashRegisterOpen, CashRegisterClose
from crud import (
    get_current_cash_register, 
    open_cash_register, 
    close_cash_register, 
    get_cash_registers
)
from auth import get_current_active_user
from models import User, UserRole

router = APIRouter()

@router.get("/current", response_model=CashRegister)
async def get_current_cash(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obter caixa atual aberto do usuário"""
    cash_register = get_current_cash_register(db, current_user.id)
    if not cash_register:
        raise HTTPException(status_code=404, detail="Nenhum caixa aberto encontrado")
    return cash_register

@router.post("/open", response_model=CashRegister)
async def open_cash(
    cash_data: CashRegisterOpen,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Abrir caixa"""
    return open_cash_register(db, cash_data, current_user.id)

@router.put("/{cash_register_id}/close", response_model=CashRegister)
async def close_cash(
    cash_register_id: int,
    close_data: CashRegisterClose,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Fechar caixa"""
    # Verificar se o usuário é o operador do caixa ou é admin
    cash_register = get_current_cash_register(db, current_user.id)
    if (not cash_register or cash_register.id != cash_register_id) and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    return close_cash_register(db, cash_register_id, close_data)

@router.get("/", response_model=List[CashRegister])
async def list_cash_registers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Listar caixas"""
    # Se não for admin, mostrar apenas os próprios caixas
    operador_id = None if current_user.role == UserRole.ADMIN else current_user.id
    return get_cash_registers(db, skip=skip, limit=limit, operador_id=operador_id)

@router.get("/status")
async def get_cash_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Verificar status do caixa (aberto/fechado)"""
    cash_register = get_current_cash_register(db, current_user.id)
    return {
        "has_open_cash": cash_register is not None,
        "cash_register_id": cash_register.id if cash_register else None
    }