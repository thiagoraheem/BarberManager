
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import bcrypt
from typing import Optional

from models import User, Client, Service, Appointment, Sale, SaleItem, UserRole, AppointmentStatus
from schemas import (
    UserCreate, UserUpdate, ClientCreate, ClientUpdate, 
    ServiceCreate, ServiceUpdate, AppointmentCreate, AppointmentUpdate,
    SaleCreate
)

# User CRUD
def get_user(db: Session, user_id: int):
    """Obter usuário por ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """Obter usuário por email"""
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Listar usuários"""
    return db.query(User).filter(User.ativo == True).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    """Criar novo usuário"""
    # Hash da senha
    hashed_password = bcrypt.hashpw(user.senha.encode('utf-8'), bcrypt.gensalt())
    
    db_user = User(
        nome=user.nome,
        email=user.email,
        telefone=user.telefone,
        senha_hash=hashed_password.decode('utf-8'),
        role=user.role,
        ativo=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    """Atualizar usuário"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        update_data = user_update.dict(exclude_unset=True)
        if 'senha' in update_data:
            # Hash da nova senha
            hashed_password = bcrypt.hashpw(update_data['senha'].encode('utf-8'), bcrypt.gensalt())
            update_data['senha_hash'] = hashed_password.decode('utf-8')
            del update_data['senha']
        
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db_user.atualizado_em = datetime.utcnow()
        db.commit()
        db.refresh(db_user)
    return db_user

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Client CRUD
def get_client(db: Session, client_id: int):
    """Obter cliente por ID"""
    return db.query(Client).filter(Client.id == client_id).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100):
    """Listar clientes"""
    return db.query(Client).filter(Client.ativo == True).offset(skip).limit(limit).all()

def create_client(db: Session, client: ClientCreate):
    """Criar novo cliente"""
    db_client = Client(**client.dict())
    if client.aceite_lgpd:
        db_client.data_aceite_lgpd = datetime.utcnow()
    
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client_update: ClientUpdate):
    """Atualizar cliente"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if db_client:
        update_data = client_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_client, field, value)
        
        db_client.atualizado_em = datetime.utcnow()
        db.commit()
        db.refresh(db_client)
    return db_client

# Service CRUD
def get_service(db: Session, service_id: int):
    """Obter serviço por ID"""
    return db.query(Service).filter(Service.id == service_id).first()

def get_services(db: Session, skip: int = 0, limit: int = 100):
    """Listar serviços"""
    return db.query(Service).filter(Service.ativo == True).offset(skip).limit(limit).all()

def create_service(db: Session, service: ServiceCreate):
    """Criar novo serviço"""
    db_service = Service(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_service(db: Session, service_id: int, service_update: ServiceUpdate):
    """Atualizar serviço"""
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if db_service:
        update_data = service_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_service, field, value)
        
        db_service.atualizado_em = datetime.utcnow()
        db.commit()
        db.refresh(db_service)
    return db_service

# Appointment CRUD
def get_appointment(db: Session, appointment_id: int):
    """Obter agendamento por ID"""
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    """Listar agendamentos"""
    return db.query(Appointment).offset(skip).limit(limit).all()

def create_appointment(db: Session, appointment: AppointmentCreate):
    """Criar novo agendamento"""
    db_appointment = Appointment(**appointment.dict(), status=AppointmentStatus.AGENDADO)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: int, appointment_update: AppointmentUpdate):
    """Atualizar agendamento"""
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if db_appointment:
        update_data = appointment_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_appointment, field, value)
        
        db_appointment.atualizado_em = datetime.utcnow()
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

# Sale CRUD
def create_sale(db: Session, sale_data: SaleCreate, vendedor_id: int):
    """Criar nova venda"""
    # Calcular total
    total = sum(item.preco_unitario * item.quantidade for item in sale_data.itens)
    total -= sale_data.desconto
    
    db_sale = Sale(
        vendedor_id=vendedor_id,
        cliente_id=sale_data.cliente_id,
        total=total,
        desconto=sale_data.desconto,
        metodo_pagamento=sale_data.metodo_pagamento,
        observacoes=sale_data.observacoes
    )
    db.add(db_sale)
    db.flush()  # Para obter o ID da venda
    
    # Criar itens da venda
    for item_data in sale_data.itens:
        db_item = SaleItem(
            venda_id=db_sale.id,
            servico_id=item_data.servico_id,
            quantidade=item_data.quantidade,
            preco_unitario=item_data.preco_unitario,
            subtotal=item_data.preco_unitario * item_data.quantidade
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

def get_sales(db: Session, skip: int = 0, limit: int = 100):
    """Listar vendas"""
    return db.query(Sale).offset(skip).limit(limit).all()

# Dashboard stats
def get_dashboard_stats(db: Session):
    """Obter estatísticas do dashboard"""
    today = datetime.now().date()
    first_day_month = datetime(today.year, today.month, 1)
    
    # Agendamentos hoje
    agendamentos_hoje = db.query(Appointment).filter(
        func.date(Appointment.data_hora) == today
    ).count()
    
    # Faturamento do mês
    faturamento_mes = db.query(func.sum(Sale.total)).filter(
        Sale.criado_em >= first_day_month
    ).scalar() or 0
    
    # Total de clientes
    clientes_total = db.query(Client).filter(Client.ativo == True).count()
    
    # Agendamentos pendentes
    agendamentos_pendentes = db.query(Appointment).filter(
        Appointment.status == AppointmentStatus.AGENDADO
    ).count()
    
    return {
        "agendamentos_hoje": agendamentos_hoje,
        "faturamento_mes": float(faturamento_mes),
        "clientes_total": clientes_total,
        "agendamentos_pendentes": agendamentos_pendentes
    }
