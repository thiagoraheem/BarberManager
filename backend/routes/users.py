from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas import User, UserCreate, UserUpdate
from crud import get_users, get_user, create_user, update_user
from auth import get_current_active_user, require_role
from models import UserRole

router = APIRouter()

@router.get("/", response_model=List[User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Listar usuários (apenas admin)"""
    return get_users(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=User)
async def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Obter usuário por ID (apenas admin)"""
    db_user = get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return db_user

@router.post("/", response_model=User)
async def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Criar novo usuário (apenas admin)"""
    return create_user(db, user)

@router.put("/{user_id}", response_model=User)
async def update_existing_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Atualizar usuário (apenas admin)"""
    db_user = update_user(db, user_id, user_update)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return db_user

@router.get("/barbeiros/list", response_model=List[User])
async def list_barbers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Listar apenas barbeiros (para seleção em agendamentos)"""
    return [user for user in get_users(db) if user.role == UserRole.BARBEIRO]
