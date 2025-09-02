import pytest
import sys
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Set testing environment
os.environ["TESTING"] = "true"

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app
from database import Base, get_db
from models import User, Client, Service, Appointment, Sale, AppointmentStatus, UserRole, PaymentMethod
from auth import create_access_token

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def db_engine():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create test database session"""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client():
    """Create test client"""
    return TestClient(app)

@pytest.fixture
def admin_user(db_session):
    """Create admin user for testing"""
    import bcrypt
    
    hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
    user = User(
        nome="Admin Test",
        email="admin@test.com",
        telefone="11999999999",
        senha_hash=hashed_password.decode('utf-8'),
        role=UserRole.ADMIN,
        ativo=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def barber_user(db_session):
    """Create barber user for testing"""
    import bcrypt
    
    hashed_password = bcrypt.hashpw("barber123".encode('utf-8'), bcrypt.gensalt())
    user = User(
        nome="Barbeiro Test",
        email="barbeiro@test.com",
        telefone="11988888888",
        senha_hash=hashed_password.decode('utf-8'),
        role=UserRole.BARBEIRO,
        ativo=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_client(db_session):
    """Create test client"""
    client = Client(
        nome="Cliente Test",
        email="cliente@test.com",
        telefone="11977777777",
        aceite_lgpd=True,
        ativo=True
    )
    db_session.add(client)
    db_session.commit()
    db_session.refresh(client)
    return client

@pytest.fixture
def test_service(db_session):
    """Create test service"""
    service = Service(
        nome="Corte Teste",
        preco=30.0,
        duracao_minutos=30,
        ativo=True
    )
    db_session.add(service)
    db_session.commit()
    db_session.refresh(service)
    return service

@pytest.fixture
def admin_token(admin_user):
    """Create admin access token"""
    return create_access_token(data={"sub": admin_user.email})

@pytest.fixture
def barber_token(barber_user):
    """Create barber access token"""
    return create_access_token(data={"sub": barber_user.email})

@pytest.fixture
def auth_headers(admin_token):
    """Create authorization headers"""
    return {"Authorization": f"Bearer {admin_token}"}

@pytest.fixture
def barber_headers(barber_token):
    """Create barber authorization headers"""
    return {"Authorization": f"Bearer {barber_token}"}