# API Documentation - BarberManager System

## Overview

The BarberManager API is a comprehensive RESTful API built with FastAPI that provides complete barbershop management functionality. This documentation covers all available endpoints, authentication methods, request/response formats, and integration examples.

## Base Information

- **Base URL**: `http://localhost:8000/api`
- **API Version**: 1.0.0
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`
- **Rate Limiting**: Yes (varies by endpoint)

## Quick Start

### 1. Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### 2. Get Access Token

```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "admin@barbershop.com",
    "senha": "your_password"
}
```

**Response:**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
        "id": 1,
        "nome": "Administrator",
        "email": "admin@barbershop.com",
        "role": "admin"
    }
}
```

## Authentication Endpoints

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
    "email": "string",
    "senha": "string"
}
```

**Response:** User object with access token

**Rate Limit:** 5 requests per 5 minutes

---

### POST /auth/register
Register new user (Admin only).

**Request Body:**
```json
{
    "nome": "string",
    "email": "string",
    "telefone": "string",
    "senha": "string",
    "role": "admin|barbeiro|recepcionista"
}
```

---

### GET /auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** Current user object

---

## User Management

### GET /users
List all users (Admin only).

**Query Parameters:**
- `skip`: int = 0 (pagination offset)
- `limit`: int = 100 (pagination limit)

**Response:** Array of user objects

---

### PUT /users/{user_id}
Update user information.

**Path Parameters:**
- `user_id`: User ID to update

**Request Body:**
```json
{
    "nome": "string",
    "telefone": "string",
    "ativo": true
}
```

---

## Client Management

### GET /clients
List clients with search and pagination.

**Query Parameters:**
- `skip`: int = 0
- `limit`: int = 100  
- `search`: string (optional) - Search in name, email, phone

**Response:**
```json
[
    {
        "id": 1,
        "nome": "João Silva",
        "email": "joao@email.com",
        "telefone": "(11) 99999-9999",
        "cpf": "123.456.789-10",
        "aceite_lgpd": true,
        "data_aceite_lgpd": "2024-01-15T10:30:00",
        "criado_em": "2024-01-15T10:30:00"
    }
]
```

---

### POST /clients
Create new client.

**Request Body:**
```json
{
    "nome": "string",
    "email": "string",
    "telefone": "string", 
    "cpf": "string",
    "aceite_lgpd": true
}
```

**Validation Rules:**
- Email must be unique
- CPF must be unique and valid format
- LGPD consent is required

---

### PUT /clients/{client_id}
Update client information.

**Path Parameters:**
- `client_id`: Client ID to update

---

### DELETE /clients/{client_id}
Soft delete client (LGPD compliant).

---

## Services Management

### GET /services
List available services.

**Query Parameters:**
- `active_only`: bool = true (show only active services)

**Response:**
```json
[
    {
        "id": 1,
        "nome": "Corte Masculino",
        "preco": 25.00,
        "duracao_minutos": 30,
        "ativo": true
    }
]
```

---

### POST /services
Create new service (Admin only).

**Request Body:**
```json
{
    "nome": "string",
    "preco": 0.0,
    "duracao_minutos": 30,
    "ativo": true
}
```

---

### PUT /services/{service_id}
Update service information.

---

## Appointment Management

### GET /appointments
List appointments with filters.

**Query Parameters:**
- `date_filter`: date (YYYY-MM-DD format)
- `barbeiro_id`: int (filter by barber)
- `skip`: int = 0
- `limit`: int = 100

**Response:**
```json
[
    {
        "id": 1,
        "data_hora": "2024-02-01T14:30:00",
        "status": "AGENDADO",
        "observacoes": "Cliente preferencial",
        "cliente": {
            "id": 1,
            "nome": "João Silva"
        },
        "barbeiro": {
            "id": 2,
            "nome": "Carlos Barbeiro"
        },
        "servico": {
            "id": 1,
            "nome": "Corte Masculino",
            "preco": 25.00,
            "duracao_minutos": 30
        }
    }
]
```

---

### POST /appointments
Create new appointment.

**Request Body:**
```json
{
    "cliente_id": 1,
    "barbeiro_id": 2,
    "servico_id": 1,
    "data_hora": "2024-02-01T14:30:00",
    "observacoes": "string"
}
```

**Validation:**
- Automatically checks for scheduling conflicts
- Validates barbeiro availability
- Calculates end time based on service duration

---

### PUT /appointments/{appointment_id}
Update appointment (reschedule, change status, etc).

---

### DELETE /appointments/{appointment_id}
Cancel appointment.

---

## Point of Sale (POS)

### POST /pos/sales
Process new sale transaction.

**Request Body:**
```json
{
    "cliente_id": 1,
    "metodo_pagamento": "DINHEIRO|CARTAO_DEBITO|CARTAO_CREDITO|PIX",
    "observacoes": "string",
    "itens": [
        {
            "servico_id": 1,
            "quantidade": 1,
            "preco_unitario": 25.00
        }
    ]
}
```

**Response:**
```json
{
    "id": 1,
    "total": 25.00,
    "metodo_pagamento": "CARTAO_DEBITO",
    "criado_em": "2024-02-01T14:30:00",
    "vendedor": {
        "nome": "Recepcionista"
    },
    "cliente": {
        "nome": "João Silva"  
    },
    "itens": [...]
}
```

---

### GET /pos/sales
List sales transactions.

**Query Parameters:**
- `date_filter`: date
- `skip`: int = 0
- `limit`: int = 100

---

## Cash Management

### GET /cash/status
Get current cash register status.

**Response:**
```json
{
    "caixa_aberto": true,
    "caixa_atual": {
        "id": 1,
        "operador": "João",
        "abertura": "2024-02-01T08:00:00",
        "valor_inicial": 100.00,
        "total_vendas": 250.00,
        "vendas_por_metodo": {
            "DINHEIRO": 50.00,
            "CARTAO_DEBITO": 100.00,
            "CARTAO_CREDITO": 75.00,
            "PIX": 25.00
        }
    }
}
```

---

### POST /cash/open
Open cash register.

**Request Body:**
```json
{
    "valor_inicial": 100.00,
    "observacoes": "Abertura do caixa"
}
```

---

### POST /cash/close
Close cash register.

**Request Body:**
```json
{
    "valor_final": 350.00,
    "observacoes": "Fechamento do caixa"
}
```

---

## Dashboard Analytics

### GET /dashboard/stats
Get business statistics.

**Response:**
```json
{
    "receita_mensal": 2500.00,
    "agendamentos_hoje": 8,
    "agendamentos_pendentes": 3,
    "total_clientes": 150
}
```

**Cache:** 60 seconds

---

### GET /dashboard/recent-activities
Get recent activities for dashboard.

**Response:**
```json
{
    "agendamentos": [...],
    "vendas": [...]
}
```

**Cache:** 2 minutes

---

## Public Endpoints (No Authentication)

### GET /public/services
Get available services for public booking.

---

### GET /public/availability
Check available time slots.

**Query Parameters:**
- `date`: date (YYYY-MM-DD)
- `barbeiro_id`: int
- `servico_id`: int

---

### POST /public/book
Create appointment from public interface.

**Request Body:**
```json
{
    "cliente": {
        "nome": "string",
        "email": "string", 
        "telefone": "string",
        "aceite_lgpd": true
    },
    "agendamento": {
        "barbeiro_id": 1,
        "servico_id": 1,
        "data_hora": "2024-02-01T14:30:00"
    }
}
```

---

## Reports

### GET /reports/financial
Generate financial report.

**Query Parameters:**
- `start_date`: date
- `end_date`: date
- `format`: "json|excel|pdf"

---

### GET /reports/appointments
Generate appointments report.

---

### GET /reports/clients
Generate clients report.

---

## Error Handling

### Standard Error Response

```json
{
    "detail": "Error description",
    "error_code": "SPECIFIC_ERROR_CODE",
    "timestamp": "2024-02-01T14:30:00Z"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (e.g., appointment scheduling conflict)
- **422**: Unprocessable Entity (validation error)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

---

## Rate Limits

| Endpoint Pattern | Limit | Window |
|------------------|--------|---------|
| `/api/auth/login` | 5 requests | 5 minutes |
| `/api/public/*` | 20 requests | 1 minute |
| `/api/pos/*` | 50 requests | 1 minute |
| `/api/appointments` | 30 requests | 1 minute |
| All others | 100 requests | 1 minute |

---

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin, Barbeiro, Recepcionista roles
- **Input Validation**: SQL injection and XSS protection
- **Rate Limiting**: Protection against abuse
- **HTTPS**: Enforced in production
- **LGPD Compliance**: Data protection features

---

## Integration Examples

### JavaScript/Axios

```javascript
// Configure base client
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Create appointment
const appointment = await api.post('/appointments', {
    cliente_id: 1,
    barbeiro_id: 2,
    servico_id: 1,
    data_hora: '2024-02-01T14:30:00'
});
```

### Python/Requests

```python
import requests

# Base configuration
base_url = "http://localhost:8000/api"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

# Get appointments
response = requests.get(
    f"{base_url}/appointments",
    headers=headers,
    params={"date_filter": "2024-02-01"}
)

appointments = response.json()
```

---

## Testing

### Health Check

```http
GET /api/health
```

Expected Response:
```json
{
    "status": "OK",
    "message": "Sistema de Gestão de Barbearia funcionando!"
}
```

### System Statistics (Performance Monitoring)

```http
GET /api/system/stats
```

---

## Support

For technical support or API questions:
- Check the interactive documentation at `/docs`
- Review this documentation
- Check system status at `/api/health`

---

*Last updated: February 2024*