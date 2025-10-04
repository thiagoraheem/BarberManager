import requests
import json
import time

def test_login_with_timeout():
    """Testa login com timeout para identificar travamento"""
    
    url = "http://localhost:8000/api/auth/login"
    data = {
        "email": "admin@barbearia.com",
        "password": "admin123"
    }
    
    print("🔍 Testando login com timeout...")
    print(f"URL: {url}")
    print(f"Dados: {data}")
    
    try:
        start_time = time.time()
        
        # Timeout de 10 segundos
        response = requests.post(
            url, 
            json=data, 
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"⏱️ Tempo de resposta: {duration:.2f} segundos")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Login bem-sucedido!")
            result = response.json()
            print(f"🔑 Token recebido: {result.get('access_token', 'N/A')[:50]}...")
        else:
            print("❌ Erro no login!")
            print(f"📝 Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ TIMEOUT! O endpoint demorou mais de 10 segundos para responder")
    except requests.exceptions.ConnectionError:
        print("🔌 ERRO DE CONEXÃO! Não foi possível conectar ao servidor")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        print(f"🔍 Tipo do erro: {type(e)}")

if __name__ == "__main__":
    test_login_with_timeout()