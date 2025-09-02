from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn

from database import engine, Base
from routes import auth, users, clients, services, appointments, pos, dashboard, cash

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

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
app.include_router(users.router, prefix="/api/users", tags=["Usuários"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clientes"])
app.include_router(services.router, prefix="/api/services", tags=["Serviços"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Agendamentos"])
app.include_router(pos.router, prefix="/api/pos", tags=["Ponto de Venda"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(cash.router, prefix="/api/cash", tags=["Caixa"])

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
