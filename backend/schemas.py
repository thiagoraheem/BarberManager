from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from models import UserRole, AppointmentStatus, PaymentMethod

# Base schemas
class UserBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    role: UserRole = UserRole.RECEPCIONISTA

class UserCreate(UserBase):
    senha: str

class UserUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    role: Optional[UserRole] = None
    ativo: Optional[bool] = None

class User(UserBase):
    id: int
    ativo: bool
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Client schemas
class ClientBase(BaseModel):
    nome: str
    email: Optional[EmailStr] = None
    telefone: str
    cpf: Optional[str] = None
    data_nascimento: Optional[datetime] = None
    endereco: Optional[str] = None
    observacoes: Optional[str] = None

class ClientCreate(ClientBase):
    aceite_lgpd: bool = False

class ClientUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    cpf: Optional[str] = None
    data_nascimento: Optional[datetime] = None
    endereco: Optional[str] = None
    observacoes: Optional[str] = None
    ativo: Optional[bool] = None

class Client(ClientBase):
    id: int
    ativo: bool
    aceite_lgpd: bool
    data_aceite_lgpd: Optional[datetime] = None
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Service schemas
class ServiceBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    preco: float
    duracao_minutos: int

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    preco: Optional[float] = None
    duracao_minutos: Optional[int] = None
    ativo: Optional[bool] = None

class Service(ServiceBase):
    id: int
    ativo: bool
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Appointment schemas
class AppointmentBase(BaseModel):
    cliente_id: int
    barbeiro_id: int
    servico_id: int
    data_hora: datetime
    observacoes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    data_hora: Optional[datetime] = None
    status: Optional[AppointmentStatus] = None
    observacoes: Optional[str] = None

class Appointment(AppointmentBase):
    id: int
    status: AppointmentStatus
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# POS schemas
class SaleItemCreate(BaseModel):
    servico_id: int
    quantidade: int = 1
    preco_unitario: float

class SaleCreate(BaseModel):
    cliente_id: Optional[int] = None
    itens: List[SaleItemCreate]
    desconto: float = 0
    metodo_pagamento: PaymentMethod
    observacoes: Optional[str] = None

class SaleItem(BaseModel):
    id: int
    servico_id: int
    quantidade: int
    preco_unitario: float
    subtotal: float
    
    class Config:
        from_attributes = True

class Sale(BaseModel):
    id: int
    vendedor_id: int
    cliente_id: Optional[int] = None
    total: float
    desconto: float
    metodo_pagamento: PaymentMethod
    observacoes: Optional[str] = None
    criado_em: datetime
    itens: List[SaleItem]
    
    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Login(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@barbearia.com",
                "senha": "admin123"
            }
        }

# Dashboard schemas
class DashboardStats(BaseModel):
    agendamentos_hoje: int
    faturamento_mes: float
    clientes_total: int
    agendamentos_pendentes: int
