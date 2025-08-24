
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import User, Client, Service, Appointment, Sale, SaleItem
from schemas import UserCreate, ClientCreate, ServiceCreate, AppointmentCreate, SaleCreate
import bcrypt
from datetime import datetime

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
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

def update_user(db: Session, user_id: int, user_update):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    
    # Se tem senha nova, fazer hash
    if 'senha' in update_data:
        hashed_password = bcrypt.hashpw(update_data['senha'].encode('utf-8'), bcrypt.gensalt())
        update_data['senha_hash'] = hashed_password.decode('utf-8')
        del update_data['senha']
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

# Client CRUD
def get_client(db: Session, client_id: int):
    return db.query(Client).filter(Client.id == client_id).first()

def get_client_by_email(db: Session, email: str):
    return db.query(Client).filter(Client.email == email).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(Client)
    if search:
        query = query.filter(
            or_(
                Client.nome.ilike(f"%{search}%"),
                Client.email.ilike(f"%{search}%"),
                Client.telefone.ilike(f"%{search}%")
            )
        )
    return query.offset(skip).limit(limit).all()

def create_client(db: Session, client: ClientCreate):
    db_client = Client(**client.dict())
    if client.aceite_lgpd:
        db_client.data_aceite_lgpd = datetime.utcnow()
    
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client_update):
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        return None
    
    update_data = client_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
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

def update_service(db: Session, service_id: int, service_update):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        return None
    
    update_data = service_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_service, key, value)
    
    db.commit()
    db.refresh(db_service)
    return db_service

# Appointment CRUD
def get_appointment(db: Session, appointment_id: int):
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Appointment).offset(skip).limit(limit).all()

def create_appointment(db: Session, appointment: AppointmentCreate):
    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

# Sale CRUD
def create_sale(db: Session, sale: SaleCreate, vendedor_id: int):
    # Calcular total
    total = sum(item.quantidade * item.preco_unitario for item in sale.itens)
    total_com_desconto = total - sale.desconto
    
    db_sale = Sale(
        vendedor_id=vendedor_id,
        cliente_id=sale.cliente_id,
        total=total_com_desconto,
        desconto=sale.desconto,
        metodo_pagamento=sale.metodo_pagamento,
        observacoes=sale.observacoes
    )
    
    db.add(db_sale)
    db.flush()  # Para obter o ID
    
    # Adicionar itens
    for item_data in sale.itens:
        subtotal = item_data.quantidade * item_data.preco_unitario
        db_item = SaleItem(
            venda_id=db_sale.id,
            servico_id=item_data.servico_id,
            quantidade=item_data.quantidade,
            preco_unitario=item_data.preco_unitario,
            subtotal=subtotal
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

def get_dashboard_stats(db: Session):
    """Obter estatísticas para o dashboard"""
    from datetime import date
    
    # Contar totais
    total_clients = db.query(Client).filter(Client.ativo == True).count()
    total_services = db.query(Service).filter(Service.ativo == True).count()
    total_users = db.query(User).filter(User.ativo == True).count()
    
    # Agendamentos de hoje
    today = date.today()
    appointments_today = db.query(Appointment).filter(
        Appointment.data_agendamento == today
    ).count()
    
    return {
        "total_clients": total_clients,
        "total_services": total_services,
        "total_users": total_users,
        "appointments_today": appointments_today
    }
