import requests
import time

def test_login():
    url = "http://localhost:8000/api/auth/login"
    data = {
        "email": "admin@barbearia.com",
        "password": "admin123"
    }
    
    print(f"Testing login endpoint: {url}")
    print(f"Data: {data}")
    
    try:
        start_time = time.time()
        response = requests.post(url, json=data, timeout=10)
        end_time = time.time()
        
        print(f"Response time: {end_time - start_time:.2f} seconds")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
    except requests.exceptions.Timeout:
        print("Request timed out after 10 seconds")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()