from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
import time
from typing import Callable
from fastapi import Request, Response

from database import engine, Base
from routes import auth, users, clients, services, appointments, pos, dashboard, cash, public, reports
from utils.rate_limiter import rate_limit_middleware
from utils.security import security_validation_middleware

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Sistema de Gestão de Barbearia iniciado!")
    yield
    # Shutdown
    print("📴 Sistema encerrado!")

app = FastAPI(
    title="Sistema de Gestão de Barbearia",
    description="Sistema completo para gestão de barbearias com agendamentos, POS e multi-usuário",
    version="1.0.0",
    lifespan=lifespan
)

# Performance Middlewares
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "*.localhost", "127.0.0.1"])

# Request timing middleware for performance monitoring
@app.middleware("http")
async def add_process_time_header(request: Request, call_next: Callable):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Security validation middleware  
app.middleware("http")(security_validation_middleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint (must be before static files mount)
@app.get("/api/health")
async def health_check():
    """Verificação de saúde da API"""
    return {"status": "OK", "message": "Sistema de Gestão de Barbearia funcionando!"}

@app.get("/api/system/stats")
async def system_stats():
    """Estatísticas do sistema para monitoramento"""
    from utils.cache import cache
    from utils.rate_limiter import get_rate_limit_stats
    import psutil
    import os
    
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "status": "OK",
            "system": {
                "cpu_usage": cpu_percent,
                "memory_usage": memory.percent,
                "memory_available": memory.available,
                "disk_usage": disk.percent,
                "disk_free": disk.free
            },
            "cache": cache.get_stats(),
            "rate_limiting": get_rate_limit_stats(),
            "process_id": os.getpid()
        }
    except ImportError:
        # Fallback if psutil is not available
        return {
            "status": "OK",
            "message": "System monitoring limited - psutil not available",
            "cache": cache.get_stats(),
            "rate_limiting": get_rate_limit_stats()
        }

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
app.include_router(users.router, prefix="/api/users", tags=["Usuários"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clientes"])
app.include_router(services.router, prefix="/api/services", tags=["Serviços"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Agendamentos"])
app.include_router(pos.router, prefix="/api/pos", tags=["Ponto de Venda"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(cash.router, prefix="/api/cash", tags=["Caixa"])
app.include_router(public.router, prefix="/api/public", tags=["Agendamento Público"])
app.include_router(reports.router, prefix="/api/reports", tags=["Relatórios"])

# Static files for frontend (must be last)
# app.mount("/", StaticFiles(directory="../frontend/build", html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
