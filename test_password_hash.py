import bcrypt
import sqlite3

def test_password_verification():
    """Testa a verificação de senha"""
    
    # Conectar ao banco e pegar o hash do admin
    conn = sqlite3.connect('barbearia.db')
    cursor = conn.cursor()
    cursor.execute('SELECT senha_hash FROM users WHERE email = ?', ('admin@barbearia.com',))
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        print("❌ Usuário admin não encontrado!")
        return
    
    stored_hash = result[0]
    password = "admin123"
    
    print(f"Senha a verificar: {password}")
    print(f"Hash armazenado: {stored_hash}")
    print(f"Tipo do hash: {type(stored_hash)}")
    print(f"Comprimento do hash: {len(stored_hash)}")
    
    try:
        # Teste 1: Verificação direta
        print("\n=== Teste 1: Verificação direta ===")
        result1 = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
        print(f"Resultado: {result1}")
        
        # Teste 2: Verificar se o hash está no formato correto
        print("\n=== Teste 2: Verificação do formato do hash ===")
        if stored_hash.startswith('$2b$'):
            print("✅ Hash está no formato bcrypt correto")
        else:
            print("❌ Hash não está no formato bcrypt esperado")
            
        # Teste 3: Criar um novo hash e comparar
        print("\n=== Teste 3: Criar novo hash e comparar ===")
        new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        print(f"Novo hash: {new_hash.decode('utf-8')}")
        result3 = bcrypt.checkpw(password.encode('utf-8'), new_hash)
        print(f"Verificação do novo hash: {result3}")
        
    except Exception as e:
        print(f"❌ Erro durante a verificação: {e}")
        print(f"Tipo do erro: {type(e)}")

if __name__ == "__main__":
    test_password_verification()