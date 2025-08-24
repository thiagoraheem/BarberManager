from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(enum.Enum):
    ADMIN = "admin"
    BARBEIRO = "barbeiro"
    RECEPCIONISTA = "recepcionista"

class AppointmentStatus(enum.Enum):
    AGENDADO = "agendado"
    CONFIRMADO = "confirmado"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"

class PaymentMethod(enum.Enum):
    DINHEIRO = "dinheiro"
    CARTAO_DEBITO = "cartao_debito"
    CARTAO_CREDITO = "cartao_credito"
    PIX = "pix"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    telefone = Column(String(20))
    senha_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.RECEPCIONISTA)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    agendamentos = relationship("Appointment", back_populates="barbeiro")
    vendas = relationship("Sale", back_populates="vendedor")

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True)
    telefone = Column(String(20), nullable=False)
    cpf = Column(String(14), unique=True)
    data_nascimento = Column(DateTime)
    endereco = Column(Text)
    observacoes = Column(Text)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

    # LGPD
    aceite_lgpd = Column(Boolean, default=False)
    data_aceite_lgpd = Column(DateTime)

    # Relacionamentos
    agendamentos = relationship("Appointment", back_populates="cliente")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)
    preco = Column(Float, nullable=False)
    duracao_minutos = Column(Integer, nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    agendamentos = relationship("Appointment", back_populates="servico")
    itens_venda = relationship("SaleItem", back_populates="servico")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    barbeiro_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    servico_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    data_hora = Column(DateTime, nullable=False)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.AGENDADO)
    observacoes = Column(Text)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    cliente = relationship("Client", back_populates="agendamentos")
    barbeiro = relationship("User", back_populates="agendamentos")
    servico = relationship("Service", back_populates="agendamentos")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    vendedor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clients.id"))
    total = Column(Float, nullable=False)
    desconto = Column(Float, default=0)
    metodo_pagamento = Column(Enum(PaymentMethod), nullable=False)
    observacoes = Column(Text)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    vendedor = relationship("User", back_populates="vendas")
    cliente = relationship("Client")
    itens = relationship("SaleItem", back_populates="venda")

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    venda_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    servico_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    quantidade = Column(Integer, default=1)
    preco_unitario = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    # Relacionamentos
    venda = relationship("Sale", back_populates="itens")
    servico = relationship("Service", back_populates="itens_venda")