from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, date
from typing import List, Optional
import bcrypt

from models import User, Client, Service, Appointment, Sale, SaleItem, UserRole, AppointmentStatus
from schemas import UserCreate, UserUpdate, ClientCreate, ClientUpdate, ServiceCreate, ServiceUpdate, AppointmentCreate, AppointmentUpdate, SaleCreate

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).filter(User.ativo == True).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    hashed_password = bcrypt.hashpw(user.senha.encode('utf-8'), bcrypt.gensalt())
    db_user = User(
        nome=user.nome,
        email=user.email,
        telefone=user.telefone,
        senha_hash=hashed_password.decode('utf-8'),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        for key, value in user_update.dict(exclude_unset=True).items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Client CRUD
def get_client(db: Session, client_id: int):
    return db.query(Client).filter(Client.id == client_id).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(Client).filter(Client.ativo == True)
    if search:
        query = query.filter(
            (Client.nome.contains(search)) | 
            (Client.telefone.contains(search)) |
            (Client.email.contains(search))
        )
    return query.offset(skip).limit(limit).all()

def create_client(db: Session, client: ClientCreate):
    db_client = Client(**client.dict())
    if db_client.aceite_lgpd:
        db_client.data_aceite_lgpd = datetime.now()
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client_update: ClientUpdate):
    db_client = get_client(db, client_id)
    if db_client:
        for key, value in client_update.dict(exclude_unset=True).items():
            setattr(db_client, key, value)
        db.commit()
        db.refresh(db_client)
    return db_client

# Service CRUD
def get_service(db: Session, service_id: int):
    return db.query(Service).filter(Service.id == service_id).first()

def get_services(db: Session, skip: int = 0, limit: int = 100, active_only: bool = True):
    query = db.query(Service)
    if active_only:
        query = query.filter(Service.ativo == True)
    return query.offset(skip).limit(limit).all()

def create_service(db: Session, service: ServiceCreate):
    db_service = Service(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_service(db: Session, service_id: int, service_update: ServiceUpdate):
    db_service = get_service(db, service_id)
    if db_service:
        for key, value in service_update.dict(exclude_unset=True).items():
            setattr(db_service, key, value)
        db.commit()
        db.refresh(db_service)
    return db_service

# Appointment CRUD
def get_appointment(db: Session, appointment_id: int):
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()

def get_appointments(db: Session, skip: int = 0, limit: int = 100, date_filter: date = None, barbeiro_id: int = None):
    query = db.query(Appointment)
    
    if date_filter:
        query = query.filter(func.date(Appointment.data_hora) == date_filter)
    
    if barbeiro_id:
        query = query.filter(Appointment.barbeiro_id == barbeiro_id)
    
    return query.order_by(Appointment.data_hora).offset(skip).limit(limit).all()

def create_appointment(db: Session, appointment: AppointmentCreate):
    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: int, appointment_update: AppointmentUpdate):
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        for key, value in appointment_update.dict(exclude_unset=True).items():
            setattr(db_appointment, key, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

# Sale CRUD
def create_sale(db: Session, sale: SaleCreate, vendedor_id: int):
    total = sum(item.quantidade * item.preco_unitario for item in sale.itens) - sale.desconto
    
    db_sale = Sale(
        vendedor_id=vendedor_id,
        cliente_id=sale.cliente_id,
        total=total,
        desconto=sale.desconto,
        metodo_pagamento=sale.metodo_pagamento,
        observacoes=sale.observacoes
    )
    db.add(db_sale)
    db.flush()  # Para obter o ID da venda
    
    # Adicionar itens da venda
    for item in sale.itens:
        subtotal = item.quantidade * item.preco_unitario
        db_item = SaleItem(
            venda_id=db_sale.id,
            servico_id=item.servico_id,
            quantidade=item.quantidade,
            preco_unitario=item.preco_unitario,
            subtotal=subtotal
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

def get_sales(db: Session, skip: int = 0, limit: int = 100, start_date: date = None, end_date: date = None):
    query = db.query(Sale)
    
    if start_date:
        query = query.filter(func.date(Sale.criado_em) >= start_date)
    if end_date:
        query = query.filter(func.date(Sale.criado_em) <= end_date)
    
    return query.order_by(Sale.criado_em.desc()).offset(skip).limit(limit).all()

# Dashboard stats
def get_dashboard_stats(db: Session):
    today = date.today()
    current_month = today.month
    current_year = today.year
    
    # Agendamentos de hoje
    agendamentos_hoje = db.query(Appointment).filter(
        func.date(Appointment.data_hora) == today
    ).count()
    
    # Faturamento do mês
    faturamento_mes = db.query(func.sum(Sale.total)).filter(
        and_(
            extract('month', Sale.criado_em) == current_month,
            extract('year', Sale.criado_em) == current_year
        )
    ).scalar() or 0
    
    # Total de clientes ativos
    clientes_total = db.query(Client).filter(Client.ativo == True).count()
    
    # Agendamentos pendentes (agendados ou confirmados)
    agendamentos_pendentes = db.query(Appointment).filter(
        Appointment.status.in_([AppointmentStatus.AGENDADO, AppointmentStatus.CONFIRMADO])
    ).count()
    
    return {
        "agendamentos_hoje": agendamentos_hoje,
        "faturamento_mes": float(faturamento_mes),
        "clientes_total": clientes_total,
        "agendamentos_pendentes": agendamentos_pendentes
    }
