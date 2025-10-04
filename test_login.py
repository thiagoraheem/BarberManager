import requests
import json

# Testar login
url = "http://localhost:8000/api/auth/login"
data = {
    "email": "admin@barbearia.com",
    "password": "admin123"
}

try:
    print("Testando login...")
    print(f"URL: {url}")
    print(f"Dados: {data}")
    
    response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
    
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        print("✅ Login bem-sucedido!")
        print(f"Response: {response.json()}")
    else:
        print("❌ Erro no login!")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"Erro na requisição: {e}")