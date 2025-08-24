
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
import bcrypt
import os

from database import get_db
from crud import get_user_by_email

# Configurações JWT
SECRET_KEY = os.getenv("SECRET_KEY", "sua-chave-secreta-super-segura-mude-em-producao")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

class TokenData(BaseModel):
    email: str = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica senha usando bcrypt"""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception as e:
        print(f"Erro na verificação da senha: {e}")
        return False

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Cria token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verifica e decodifica token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

def authenticate_user(db: Session, email: str, password: str):
    """Autentica usuário"""
    try:
        print(f"Tentando autenticar usuário: {email}")
        user = get_user_by_email(db, email)
        if not user:
            print(f"Usuário não encontrado: {email}")
            return False
        if not user.ativo:
            print(f"Usuário inativo: {email}")
            return False
        
        print(f"Verificando senha para usuário: {email}")
        if not verify_password(password, user.senha_hash):
            print(f"Senha incorreta para usuário: {email}")
            return False
        
        print(f"Autenticação bem-sucedida para: {email}")
        return user
    except Exception as e:
        print(f"Erro na autenticação: {e}")
        return False

async def get_current_user(
    token: str = Depends(security),
    db: Session = Depends(get_db)
):
    """Obter usuário atual através do token"""
    email = verify_token(token.credentials)
    user = get_user_by_email(db, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_current_active_user(current_user = Depends(get_current_user)):
    """Verificar se o usuário está ativo"""
    if not current_user.ativo:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    return current_user

def require_role(allowed_roles: list):
    """Decorator para verificar se o usuário tem permissão baseada no role"""
    async def role_checker(current_user = Depends(get_current_active_user)):
        from models import UserRole
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissões insuficientes"
            )
        return current_user
    return role_checker
