from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from typing import Optional
import io

from database import get_db
from auth import get_current_active_user, require_role
from models import User, UserRole
from utils.reports import create_report_generator

router = APIRouter()

@router.get("/financial")
async def generate_financial_report(
    start_date: date = Query(..., description="Data inicial (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Data final (YYYY-MM-DD)"),
    format: str = Query("excel", regex="^(excel|pdf)$", description="Formato do relatório"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.RECEPCIONISTA]))
):
    """
    Gerar relatório financeiro completo
    
    - **start_date**: Data inicial do período
    - **end_date**: Data final do período  
    - **format**: Formato do arquivo (excel ou pdf)
    """
    try:
        # Validate date range
        if start_date > end_date:
            raise HTTPException(status_code=400, detail="Data inicial deve ser anterior à data final")
        
        if (end_date - start_date).days > 365:
            raise HTTPException(status_code=400, detail="Período máximo de 1 ano")
        
        # Generate report
        report_generator = create_report_generator(db)
        report_data = report_generator.generate_financial_report(
            start_date=start_date,
            end_date=end_date,
            format_type=format
        )
        
        # Prepare response
        filename = f"relatorio_financeiro_{start_date}_{end_date}.{format if format == 'pdf' else 'xlsx'}"
        media_type = "application/pdf" if format == "pdf" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        
        return StreamingResponse(
            io.BytesIO(report_data),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")

@router.get("/clients")
async def generate_client_report(
    format: str = Query("excel", regex="^(excel|pdf)$", description="Formato do relatório"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.RECEPCIONISTA]))
):
    """
    Gerar relatório de clientes
    
    - **format**: Formato do arquivo (excel ou pdf)
    """
    try:
        # Generate report
        report_generator = create_report_generator(db)
        report_data = report_generator.generate_client_report(format_type=format)
        
        # Prepare response
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"relatorio_clientes_{timestamp}.{format if format == 'pdf' else 'xlsx'}"
        media_type = "application/pdf" if format == "pdf" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        
        return StreamingResponse(
            io.BytesIO(report_data),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")

@router.get("/appointments")
async def generate_appointment_report(
    start_date: date = Query(..., description="Data inicial (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Data final (YYYY-MM-DD)"),
    format: str = Query("excel", regex="^(excel|pdf)$", description="Formato do relatório"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.RECEPCIONISTA]))
):
    """
    Gerar relatório de agendamentos
    
    - **start_date**: Data inicial do período
    - **end_date**: Data final do período
    - **format**: Formato do arquivo (excel ou pdf)
    """
    try:
        # Validate date range
        if start_date > end_date:
            raise HTTPException(status_code=400, detail="Data inicial deve ser anterior à data final")
        
        if (end_date - start_date).days > 365:
            raise HTTPException(status_code=400, detail="Período máximo de 1 ano")
        
        # Generate report
        report_generator = create_report_generator(db)
        report_data = report_generator.generate_appointment_report(
            start_date=start_date,
            end_date=end_date,
            format_type=format
        )
        
        # Prepare response
        filename = f"relatorio_agendamentos_{start_date}_{end_date}.{format if format == 'pdf' else 'xlsx'}"
        media_type = "application/pdf" if format == "pdf" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        
        return StreamingResponse(
            io.BytesIO(report_data),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")

@router.get("/quick-stats")
async def get_quick_stats(
    period: str = Query("month", regex="^(week|month|quarter|year)$", description="Período para estatísticas"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obter estatísticas rápidas para dashboard
    
    - **period**: Período (week, month, quarter, year)
    """
    try:
        from datetime import datetime, timedelta
        from sqlalchemy import func
        from models import Sale, Appointment, Client
        
        # Calculate date range based on period
        today = date.today()
        if period == "week":
            start_date = today - timedelta(days=7)
        elif period == "month":
            start_date = today.replace(day=1)
        elif period == "quarter":
            quarter_start_month = ((today.month - 1) // 3) * 3 + 1
            start_date = today.replace(month=quarter_start_month, day=1)
        else:  # year
            start_date = today.replace(month=1, day=1)
        
        # Get statistics
        total_sales = db.query(func.sum(Sale.total)).filter(
            func.date(Sale.criado_em) >= start_date
        ).scalar() or 0
        
        total_appointments = db.query(Appointment).filter(
            func.date(Appointment.data_hora) >= start_date
        ).count()
        
        new_clients = db.query(Client).filter(
            func.date(Client.criado_em) >= start_date
        ).count()
        
        # Calculate trends (compare with previous period)
        period_days = (today - start_date).days
        previous_start = start_date - timedelta(days=period_days)
        previous_end = start_date - timedelta(days=1)
        
        previous_sales = db.query(func.sum(Sale.total)).filter(
            func.date(Sale.criado_em) >= previous_start,
            func.date(Sale.criado_em) <= previous_end
        ).scalar() or 0
        
        sales_trend = ((total_sales - previous_sales) / previous_sales * 100) if previous_sales > 0 else 0
        
        return {
            "period": period,
            "start_date": start_date.isoformat(),
            "end_date": today.isoformat(),
            "total_sales": total_sales,
            "total_appointments": total_appointments,
            "new_clients": new_clients,
            "sales_trend": round(sales_trend, 1),
            "avg_ticket": round(total_sales / max(total_appointments, 1), 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas: {str(e)}")

@router.get("/export-templates")
async def get_export_templates(
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Listar templates de relatórios disponíveis
    """
    return {
        "financial": {
            "name": "Relatório Financeiro",
            "description": "Análise completa de vendas, métodos de pagamento e performance",
            "formats": ["excel", "pdf"],
            "required_params": ["start_date", "end_date"]
        },
        "clients": {
            "name": "Relatório de Clientes", 
            "description": "Lista detalhada de clientes e conformidade LGPD",
            "formats": ["excel", "pdf"],
            "required_params": []
        },
        "appointments": {
            "name": "Relatório de Agendamentos",
            "description": "Análise de agendamentos por período e status",
            "formats": ["excel", "pdf"],
            "required_params": ["start_date", "end_date"]
        }
    }

@router.post("/custom-export")
async def create_custom_export(
    report_config: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Criar exportação customizada (funcionalidade futura)
    """
    # Placeholder for future custom report functionality
    return {
        "message": "Funcionalidade de relatórios customizados em desenvolvimento",
        "config_received": report_config
    }