#!/usr/bin/env python3
"""
Script para inicializar o sistema completo de gestão de barbearia
"""

import os
import sys
import subprocess
import signal
import time
from pathlib import Path

def run_command(command, cwd=None, env=None):
    """Executa um comando do sistema"""
    try:
        return subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            env=env,
            check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao executar comando: {command}")
        print(f"Código de saída: {e.returncode}")
        return None

def check_python_version():
    """Verifica se a versão do Python é adequada"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 ou superior é necessário")
        sys.exit(1)
    print(f"✅ Python {sys.version} detectado")

def check_node_version():
    """Verifica se Node.js está instalado"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()} detectado")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ Node.js não encontrado")
    return False

def install_python_dependencies():
    """Instala dependências Python"""
    print("📦 Instalando dependências Python...")
    
    # Lista de dependências necessárias
    dependencies = [
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "sqlalchemy>=2.0.0",
        "pydantic[email]>=2.0.0",
        "python-jose[cryptography]>=3.3.0",
        "python-multipart>=0.0.6",
        "bcrypt>=4.0.0",
        "python-dotenv>=1.0.0"
    ]
    
    for dep in dependencies:
        print(f"  📥 Instalando {dep}...")
        result = run_command(f"python -m pip install {dep}")
        if result is None:
            print(f"❌ Falha ao instalar {dep}")
            return False
    
    print("✅ Dependências Python instaladas com sucesso")
    return True

def setup_database():
    """Configura o banco de dados"""
    print("🗄️ Configurando banco de dados...")
    
    # Criar diretório para o banco SQLite se não existir
    db_dir = Path("backend")
    db_dir.mkdir(exist_ok=True)
    
    print("✅ Banco de dados configurado")
    return True

def create_default_user():
    """Cria usuário administrador padrão"""
    print("👤 Criando usuário administrador padrão...")
    
    # Script para criar usuário admin
    script = '''
import sys
sys.path.append("backend")

from database import SessionLocal, Base, engine
from models import User, UserRole
import bcrypt

# Criar tabelas
Base.metadata.create_all(bind=engine)

# Criar sessão
db = SessionLocal()

try:
    # Verificar se já existe admin
    existing_admin = db.query(User).filter(User.email == "admin@barbearia.com").first()
    
    if not existing_admin:
        # Criar usuário admin
        hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        admin_user = User(
            nome="Administrador",
            email="admin@barbearia.com",
            telefone="(11) 99999-9999",
            senha_hash=hashed_password.decode('utf-8'),
            role=UserRole.ADMIN,
            ativo=True
        )
        
        db.add(admin_user)
        db.commit()
        print("✅ Usuário administrador criado: admin@barbearia.com / admin123")
    else:
        print("✅ Usuário administrador já existe")

    # Criar barbeiro de exemplo
    existing_barber = db.query(User).filter(User.email == "barbeiro@barbearia.com").first()
    
    if not existing_barber:
        hashed_password = bcrypt.hashpw("barbeiro123".encode('utf-8'), bcrypt.gensalt())
        barber_user = User(
            nome="João Silva",
            email="barbeiro@barbearia.com",
            telefone="(11) 88888-8888",
            senha_hash=hashed_password.decode('utf-8'),
            role=UserRole.BARBEIRO,
            ativo=True
        )
        
        db.add(barber_user)
        db.commit()
        print("✅ Barbeiro de exemplo criado: barbeiro@barbearia.com / barbeiro123")
    else:
        print("✅ Barbeiro de exemplo já existe")

finally:
    db.close()
'''
    
    try:
        exec(script)
        return True
    except Exception as e:
        print(f"❌ Erro ao criar usuário padrão: {e}")
        return False

def create_sample_data():
    """Cria dados de exemplo"""
    print("📋 Criando dados de exemplo...")
    
    script = '''
import sys
sys.path.append("backend")

from database import SessionLocal
from models import Service, Client
from datetime import datetime

db = SessionLocal()

try:
    # Criar serviços de exemplo
    services_data = [
        {"nome": "Corte Masculino", "descricao": "Corte tradicional masculino", "preco": 25.00, "duracao_minutos": 30},
        {"nome": "Barba", "descricao": "Aparar e modelar barba", "preco": 15.00, "duracao_minutos": 20},
        {"nome": "Corte + Barba", "descricao": "Corte completo com barba", "preco": 35.00, "duracao_minutos": 45},
        {"nome": "Corte Infantil", "descricao": "Corte para crianças até 12 anos", "preco": 20.00, "duracao_minutos": 25},
        {"nome": "Desenho", "descricao": "Desenhos e detalhes especiais", "preco": 10.00, "duracao_minutos": 15}
    ]
    
    for service_data in services_data:
        existing = db.query(Service).filter(Service.nome == service_data["nome"]).first()
        if not existing:
            service = Service(**service_data)
            db.add(service)
    
    # Criar cliente de exemplo
    existing_client = db.query(Client).filter(Client.email == "cliente@exemplo.com").first()
    if not existing_client:
        client = Client(
            nome="Carlos Eduardo",
            email="cliente@exemplo.com",
            telefone="(11) 77777-7777",
            cpf="123.456.789-00",
            aceite_lgpd=True,
            data_aceite_lgpd=datetime.now()
        )
        db.add(client)
    
    db.commit()
    print("✅ Dados de exemplo criados com sucesso")

finally:
    db.close()
'''
    
    try:
        exec(script)
        return True
    except Exception as e:
        print(f"❌ Erro ao criar dados de exemplo: {e}")
        return False

def start_backend():
    """Inicia o servidor backend"""
    print("🚀 Iniciando servidor backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Diretório backend não encontrado")
        return None
    
    # Iniciar servidor FastAPI
    return subprocess.Popen([
        "python", "-m", "uvicorn", "main:app", 
        "--host", "0.0.0.0", 
        "--port", "8000", 
        "--reload"
    ], cwd=backend_dir)

def start_frontend():
    """Inicia o servidor frontend (desenvolvimento)"""
    print("🎨 Iniciando servidor frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Diretório frontend não encontrado")
        return None
    
    # Instalar dependências npm se necessário
    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists():
        print("📦 Instalando dependências do frontend...")
        result = run_command("npm install", cwd=frontend_dir)
        if result is None:
            print("❌ Falha ao instalar dependências do frontend")
            return None
    
    # Iniciar servidor de desenvolvimento
    env = os.environ.copy()
    env['PORT'] = '5000'
    
    return subprocess.Popen([
        "npm", "start"
    ], cwd=frontend_dir, env=env)

def main():
    """Função principal"""
    print("🔧 Iniciando Sistema de Gestão de Barbearia")
    print("=" * 50)
    
    # Verificações iniciais
    check_python_version()
    
    # Instalar dependências
    if not install_python_dependencies():
        print("❌ Falha ao instalar dependências Python")
        sys.exit(1)
    
    # Configurar banco de dados
    if not setup_database():
        print("❌ Falha ao configurar banco de dados")
        sys.exit(1)
    
    # Criar usuário padrão
    if not create_default_user():
        print("❌ Falha ao criar usuário padrão")
        sys.exit(1)
    
    # Criar dados de exemplo
    if not create_sample_data():
        print("⚠️ Aviso: Falha ao criar dados de exemplo (não crítico)")
    
    print("\n" + "=" * 50)
    print("🎉 Configuração concluída com sucesso!")
    print("\n📋 Credenciais de acesso:")
    print("   Admin: admin@barbearia.com / admin123")
    print("   Barbeiro: barbeiro@barbearia.com / barbeiro123")
    print("\n🌐 URLs do sistema:")
    print("   Backend API: http://localhost:8000")
    print("   Frontend: http://localhost:5000")
    print("   Documentação API: http://localhost:8000/docs")
    
    # Iniciar servidores
    print("\n🚀 Iniciando servidores...")
    
    backend_process = start_backend()
    if backend_process is None:
        print("❌ Falha ao iniciar backend")
        sys.exit(1)
    
    # Aguardar um pouco para o backend iniciar
    time.sleep(3)
    
    # Verificar se Node.js está disponível para o frontend
    frontend_process = None
    if check_node_version():
        frontend_process = start_frontend()
        if frontend_process is None:
            print("⚠️ Frontend não pôde ser iniciado, mas o backend está rodando")
    else:
        print("⚠️ Node.js não encontrado. Apenas o backend será iniciado.")
        print("   Para usar o frontend, instale Node.js e execute: npm start no diretório frontend")
    
    print("\n✅ Sistema iniciado com sucesso!")
    print("   Pressione Ctrl+C para encerrar")
    
    def signal_handler(sig, frame):
        print("\n🛑 Encerrando sistema...")
        
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        
        print("✅ Sistema encerrado com sucesso!")
        sys.exit(0)
    
    # Configurar handler para Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Aguardar processos
        if frontend_process:
            frontend_process.wait()
        backend_process.wait()
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()
