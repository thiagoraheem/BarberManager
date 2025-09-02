
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import User, Client, Service, Appointment, Sale, SaleItem
from schemas import UserCreate, ClientCreate, ServiceCreate, AppointmentCreate, SaleCreate
from utils.cache import cache_client_data, cache_service_data, invalidate_client_cache, invalidate_service_cache
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

@cache_client_data(ttl=300)
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
    
    # Invalidate client cache
    invalidate_client_cache()
    
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

@cache_service_data(ttl=600)
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
    
    # Invalidate service cache
    invalidate_service_cache()
    
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

def get_appointments(db: Session, skip: int = 0, limit: int = 100, date_filter=None, barbeiro_id=None):
    query = db.query(Appointment)
    
    if date_filter:
        query = query.filter(Appointment.data_hora.date() == date_filter)
    
    if barbeiro_id:
        query = query.filter(Appointment.barbeiro_id == barbeiro_id)
    
    return query.offset(skip).limit(limit).all()

def check_appointment_conflict(db: Session, appointment: AppointmentCreate, exclude_id: int = None):
    """
    Verifica se há conflito de horário para um agendamento
    Retorna informações do conflito se houver, ou None se não houver
    """
    from datetime import timedelta
    
    # Obter duração do serviço
    service = get_service(db, appointment.servico_id)
    if not service:
        return None
    
    # Calcular horário de início e fim do novo agendamento
    start_time = appointment.data_hora
    end_time = start_time + timedelta(minutes=service.duracao_minutos)
    
    # Buscar agendamentos existentes do mesmo barbeiro no mesmo dia
    from models import AppointmentStatus
    query = db.query(Appointment).filter(
        Appointment.barbeiro_id == appointment.barbeiro_id,
        Appointment.data_hora.date() == start_time.date(),
        Appointment.status.in_([
            AppointmentStatus.AGENDADO,
            AppointmentStatus.CONFIRMADO,
            AppointmentStatus.EM_ANDAMENTO
        ])
    )
    
    # Excluir o próprio agendamento se for uma atualização
    if exclude_id:
        query = query.filter(Appointment.id != exclude_id)
    
    existing_appointments = query.all()
    
    # Verificar conflitos com cada agendamento existente
    for existing in existing_appointments:
        existing_service = existing.servico
        existing_start = existing.data_hora
        existing_end = existing_start + timedelta(minutes=existing_service.duracao_minutos)
        
        # Verificar sobreposição de horários
        # Há conflito se:
        # - O novo agendamento começa antes do existente terminar E
        # - O novo agendamento termina depois do existente começar
        if start_time < existing_end and end_time > existing_start:
            return {
                'barbeiro_nome': existing.barbeiro.nome,
                'data': existing_start.strftime('%d/%m/%Y'),
                'inicio': existing_start.strftime('%H:%M'),
                'fim': existing_end.strftime('%H:%M'),
                'servico': existing_service.nome,
                'cliente': existing.cliente.nome
            }
    
    return None

def create_appointment(db: Session, appointment: AppointmentCreate):
    # Verificar conflitos de agendamento
    conflict = check_appointment_conflict(db, appointment)
    if conflict:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400, 
            detail=f"Conflito de agendamento detectado. Já existe um agendamento para o barbeiro {conflict['barbeiro_nome']} das {conflict['inicio']} às {conflict['fim']} no dia {conflict['data']}."
        )
    
    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: int, appointment_update):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        return None
    
    update_data = appointment_update.dict(exclude_unset=True)
    
    # Se está alterando data/hora, barbeiro ou serviço, verificar conflitos
    if any(field in update_data for field in ['data_hora', 'barbeiro_id', 'servico_id']):
        # Criar objeto temporário com os dados atualizados para verificação
        from schemas import AppointmentCreate
        temp_appointment = AppointmentCreate(
            cliente_id=update_data.get('cliente_id', db_appointment.cliente_id),
            barbeiro_id=update_data.get('barbeiro_id', db_appointment.barbeiro_id),
            servico_id=update_data.get('servico_id', db_appointment.servico_id),
            data_hora=update_data.get('data_hora', db_appointment.data_hora),
            status=update_data.get('status', db_appointment.status),
            observacoes=update_data.get('observacoes', db_appointment.observacoes)
        )
        
        conflict = check_appointment_conflict(db, temp_appointment, exclude_id=appointment_id)
        if conflict:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=400, 
                detail=f"Conflito de agendamento detectado. Já existe um agendamento para o barbeiro {conflict['barbeiro_nome']} das {conflict['inicio']} às {conflict['fim']} no dia {conflict['data']}."
            )
    
    for key, value in update_data.items():
        setattr(db_appointment, key, value)
    
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

# Sale CRUD
def get_sales(db: Session, skip: int = 0, limit: int = 100, start_date=None, end_date=None):
    query = db.query(Sale)
    
    if start_date:
        query = query.filter(Sale.criado_em.date() >= start_date)
    
    if end_date:
        query = query.filter(Sale.criado_em.date() <= end_date)
    
    return query.offset(skip).limit(limit).all()

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
    from sqlalchemy import func
    
    # Contar totais
    total_clients = db.query(Client).filter(Client.ativo == True).count()
    total_services = db.query(Service).filter(Service.ativo == True).count()
    total_users = db.query(User).filter(User.ativo == True).count()
    
    # Agendamentos de hoje
    today = date.today()
    appointments_today = db.query(Appointment).filter(
        func.date(Appointment.data_hora) == today
    ).count()
    
    # Agendamentos pendentes
    from models import AppointmentStatus
    appointments_pending = db.query(Appointment).filter(
        Appointment.status == AppointmentStatus.AGENDADO
    ).count()
    
    # Faturamento do mês atual
    current_month = today.replace(day=1)
    monthly_revenue = db.query(func.sum(Sale.total)).filter(
        func.date(Sale.criado_em) >= current_month
    ).scalar() or 0.0
    
    return {
        "clientes_total": total_clients,
        "agendamentos_hoje": appointments_today,
        "agendamentos_pendentes": appointments_pending,
        "faturamento_mes": monthly_revenue
    }

# Cash Register CRUD
def get_current_cash_register(db: Session, operador_id: int):
    """Obter caixa atual aberto do operador"""
    from models import CashRegister
    return db.query(CashRegister).filter(
        CashRegister.operador_id == operador_id,
        CashRegister.status == "aberto"
    ).first()

def open_cash_register(db: Session, cash_data, operador_id: int):
    """Abrir caixa"""
    from models import CashRegister
    from datetime import datetime
    
    # Verificar se já existe caixa aberto
    existing = get_current_cash_register(db, operador_id)
    if existing:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="Já existe um caixa aberto para este operador. Feche o caixa atual antes de abrir um novo."
        )
    
    db_cash = CashRegister(
        operador_id=operador_id,
        data_abertura=datetime.now(),
        valor_inicial=cash_data.valor_inicial,
        observacoes_abertura=cash_data.observacoes_abertura,
        status="aberto"
    )
    
    db.add(db_cash)
    db.commit()
    db.refresh(db_cash)
    return db_cash

def close_cash_register(db: Session, cash_register_id: int, close_data):
    """Fechar caixa"""
    from models import CashRegister, PaymentMethod
    from datetime import datetime, date
    from sqlalchemy import func
    
    cash_register = db.query(CashRegister).filter(CashRegister.id == cash_register_id).first()
    if not cash_register:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Caixa não encontrado")
    
    if cash_register.status == "fechado":
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Caixa já está fechado")
    
    # Calcular valores das vendas por método de pagamento
    today = date.today()
    vendas_query = db.query(Sale).filter(
        func.date(Sale.criado_em) == today
    )
    
    valor_dinheiro = vendas_query.filter(
        Sale.metodo_pagamento == PaymentMethod.DINHEIRO
    ).with_entities(func.sum(Sale.total)).scalar() or 0.0
    
    valor_cartao = vendas_query.filter(
        Sale.metodo_pagamento.in_([
            PaymentMethod.CARTAO_DEBITO,
            PaymentMethod.CARTAO_CREDITO
        ])
    ).with_entities(func.sum(Sale.total)).scalar() or 0.0
    
    valor_pix = vendas_query.filter(
        Sale.metodo_pagamento == PaymentMethod.PIX
    ).with_entities(func.sum(Sale.total)).scalar() or 0.0
    
    # Atualizar dados do fechamento
    cash_register.data_fechamento = datetime.now()
    cash_register.valor_final = close_data.valor_final
    cash_register.observacoes_fechamento = close_data.observacoes_fechamento
    cash_register.valor_vendas_dinheiro = valor_dinheiro
    cash_register.valor_vendas_cartao = valor_cartao
    cash_register.valor_vendas_pix = valor_pix
    cash_register.status = "fechado"
    
    db.commit()
    db.refresh(cash_register)
    return cash_register

def get_cash_registers(db: Session, skip: int = 0, limit: int = 100, operador_id: int = None):
    """Listar caixas"""
    from models import CashRegister
    query = db.query(CashRegister)
    
    if operador_id:
        query = query.filter(CashRegister.operador_id == operador_id)
    
    return query.offset(skip).limit(limit).all()
