from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from schemas import Sale, SaleCreate
from crud import create_sale, get_sales
from auth import get_current_active_user
from models import User

router = APIRouter()

@router.post("/sale", response_model=Sale)
async def create_new_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Criar nova venda"""
    return create_sale(db, sale, current_user.id)

@router.get("/sales", response_model=List[Sale])
async def read_sales(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Listar vendas com filtros opcionais"""
    return get_sales(db, skip=skip, limit=limit, start_date=start_date, end_date=end_date)

@router.get("/payment-methods")
async def get_payment_methods():
    """Obter métodos de pagamento disponíveis"""
    return [
        {"value": "dinheiro", "label": "Dinheiro"},
        {"value": "cartao_debito", "label": "Cartão de Débito"},
        {"value": "cartao_credito", "label": "Cartão de Crédito"},
        {"value": "pix", "label": "PIX"}
    ]
