#!/usr/bin/env python3
"""
Script para criar usuários de demonstração no BarberManager
"""

import sys
import os
import sqlite3
from datetime import datetime
import hashlib
import secrets

# Função para criar hash da senha (usando bcrypt como o backend)
def get_password_hash(password: str) -> str:
    """Cria hash da senha usando bcrypt como o backend"""
    import bcrypt
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def create_demo_users():
    """Cria os usuários de demonstração no banco de dados"""
    
    # Caminho para o banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'barbearia.db')
    
    try:
        # Conectar ao banco SQLite
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se a tabela users existe
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'barber',
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        users_created = []
        
        # Verificar se os usuários já existem
        cursor.execute("SELECT email FROM users WHERE email IN (?, ?)", 
                      ("admin@barbearia.com", "barbeiro@barbearia.com"))
        existing_users = [row[0] for row in cursor.fetchall()]
        
        # Criar usuário administrador se não existir
        if "admin@barbearia.com" not in existing_users:
            admin_hash = get_password_hash("admin123")
            cursor.execute("""
                INSERT INTO users (name, email, hashed_password, role, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, ("Administrador Demo", "admin@barbearia.com", admin_hash, "admin", True, datetime.utcnow()))
            users_created.append("admin@barbearia.com")
            print("✅ Usuário administrador criado: admin@barbearia.com / admin123")
        else:
            print("ℹ️  Usuário administrador já existe: admin@barbearia.com")
        
        # Criar usuário barbeiro se não existir
        if "barbeiro@barbearia.com" not in existing_users:
            barbeiro_hash = get_password_hash("barbeiro123")
            cursor.execute("""
                INSERT INTO users (name, email, hashed_password, role, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, ("Barbeiro Demo", "barbeiro@barbearia.com", barbeiro_hash, "barber", True, datetime.utcnow()))
            users_created.append("barbeiro@barbearia.com")
            print("✅ Usuário barbeiro criado: barbeiro@barbearia.com / barbeiro123")
        else:
            print("ℹ️  Usuário barbeiro já existe: barbeiro@barbearia.com")
        
        # Salvar as alterações
        conn.commit()
        
        if users_created:
            print(f"\n🎉 {len(users_created)} usuário(s) de demonstração criado(s) com sucesso!")
        else:
            print("\n✨ Todos os usuários de demonstração já existem no banco de dados.")
        
        # Listar todos os usuários
        print("\n📋 Usuários disponíveis no sistema:")
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        print("Colunas da tabela users:", [col[1] for col in columns])
        
        cursor.execute("SELECT * FROM users")
        all_users = cursor.fetchall()
        for user in all_users:
            print(f"   • Usuário: {user}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar usuários de demonstração: {e}")
        if 'conn' in locals():
            conn.close()
        return False

if __name__ == "__main__":
    print("🚀 Criando usuários de demonstração para o BarberManager...")
    print("=" * 60)
    
    success = create_demo_users()
    
    print("=" * 60)
    if success:
        print("✅ Script executado com sucesso!")
        print("\n🔑 Credenciais de demonstração:")
        print("   Administrador: admin@barbearia.com / admin123")
        print("   Barbeiro: barbeiro@barbearia.com / barbeiro123")
    else:
        print("❌ Falha na execução do script!")
        sys.exit(1)