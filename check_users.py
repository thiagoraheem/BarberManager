import sqlite3

# Conectar ao banco de dados
conn = sqlite3.connect('barbearia.db')
cursor = conn.cursor()

# Verificar usuários
cursor.execute('SELECT id, nome, email, ativo, senha_hash FROM users')
users = cursor.fetchall()

print('Usuários no banco:')
for user in users:
    print(f'ID: {user[0]}, Nome: {user[1]}, Email: {user[2]}, Ativo: {user[3]}')
    print(f'Hash da senha: {user[4][:50]}...')
    print('---')

conn.close()