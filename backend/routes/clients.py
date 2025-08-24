from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from schemas import Client, ClientCreate, ClientUpdate
from crud import get_clients, get_client, create_client, update_client
from auth import get_current_active_user
from models import User

router = APIRouter()

@router.get("/", response_model=List[Client])
async def read_clients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Listar clientes com busca opcional"""
    return get_clients(db, skip=skip, limit=limit, search=search)

@router.get("/{client_id}", response_model=Client)
async def read_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obter cliente por ID"""
    db_client = get_client(db, client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return db_client

@router.post("/", response_model=Client)
async def create_new_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Criar novo cliente"""
    return create_client(db, client)

@router.put("/{client_id}", response_model=Client)
async def update_existing_client(
    client_id: int,
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Atualizar cliente"""
    db_client = update_client(db, client_id, client_update)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return db_client

@router.delete("/{client_id}")
async def deactivate_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Desativar cliente (LGPD compliance)"""
    client_update = ClientUpdate(ativo=False)
    db_client = update_client(db, client_id, client_update)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return {"message": "Cliente desativado com sucesso"}
