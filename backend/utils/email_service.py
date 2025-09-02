import asyncio
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from typing import List, Optional
import aiosmtplib
from jinja2 import Environment, FileSystemLoader, select_autoescape
from config.email_config import email_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    """
    Advanced email service with template support and async delivery
    """
    
    def __init__(self):
        self.settings = email_settings
        self._template_env = None
        self._initialize_templates()
    
    def _initialize_templates(self):
        """Initialize Jinja2 template environment"""
        try:
            template_dir = Path(__file__).parent.parent / "templates" / "email"
            if template_dir.exists():
                self._template_env = Environment(
                    loader=FileSystemLoader(str(template_dir)),
                    autoescape=select_autoescape(['html', 'xml'])
                )
                logger.info(f"Email templates loaded from {template_dir}")
            else:
                logger.warning(f"Email template directory not found: {template_dir}")
        except Exception as e:
            logger.error(f"Failed to initialize email templates: {e}")
    
    def _render_template(self, template_name: str, **context) -> tuple[str, str]:
        """
        Render email template with context
        Returns: (html_content, text_content)
        """
        if not self._template_env:
            # Fallback to simple text template
            return self._create_simple_template(**context)
        
        try:
            template = self._template_env.get_template(template_name)
            html_content = template.render(**context)
            
            # Simple text version (remove HTML tags)
            import re
            text_content = re.sub(r'<[^>]+>', '', html_content)
            text_content = re.sub(r'\s+', ' ', text_content).strip()
            
            return html_content, text_content
        except Exception as e:
            logger.error(f"Template rendering failed: {e}")
            return self._create_simple_template(**context)
    
    def _create_simple_template(self, **context) -> tuple[str, str]:
        """Create simple text-based email content"""
        if context.get('appointment_type') == 'created':
            subject = "🔔 Agendamento Confirmado - BarberManager"
            content = f"""
Olá {context.get('cliente_nome', 'Cliente')}!

Seu agendamento foi confirmado com sucesso:

📅 Data/Hora: {context.get('data_hora', 'N/A')}
✂️ Serviço: {context.get('servico_nome', 'N/A')}
💰 Valor: R$ {context.get('preco', '0.00')}
👨‍💼 Barbeiro: {context.get('barbeiro_nome', 'N/A')}

Obrigado por escolher nossa barbearia!
            """
        elif context.get('appointment_type') == 'updated':
            subject = "🔄 Agendamento Atualizado - BarberManager"
            content = f"""
Olá {context.get('cliente_nome', 'Cliente')}!

Seu agendamento foi atualizado:

📅 Nova Data/Hora: {context.get('data_hora', 'N/A')}
✂️ Serviço: {context.get('servico_nome', 'N/A')}
👨‍💼 Barbeiro: {context.get('barbeiro_nome', 'N/A')}
📋 Status: {context.get('status', 'N/A')}

Em caso de dúvidas, entre em contato conosco.
            """
        else:
            subject = context.get('subject', 'BarberManager')
            content = context.get('message', 'Mensagem do BarberManager')
        
        return content, content
    
    async def send_email(
        self, 
        to_email: str, 
        subject: str, 
        template_name: str = None,
        **template_context
    ) -> bool:
        """
        Send email using async SMTP
        """
        if not self.settings.EMAILS_ENABLED:
            logger.info(f"📧 EMAIL SIMULADO PARA: {to_email}")
            logger.info(f"ASSUNTO: {subject}")
            logger.info(f"TEMPLATE: {template_name}")
            logger.info(f"CONTEXTO: {template_context}")
            logger.info("-" * 50)
            return True
        
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.settings.EMAILS_FROM_NAME} <{self.settings.EMAILS_FROM_EMAIL}>"
            message["To"] = to_email
            
            # Render content
            if template_name:
                html_content, text_content = self._render_template(template_name, **template_context)
            else:
                html_content, text_content = self._create_simple_template(
                    subject=subject, 
                    **template_context
                )
            
            # Add text and HTML parts
            text_part = MIMEText(text_content, "plain", "utf-8")
            html_part = MIMEText(html_content, "html", "utf-8")
            
            message.attach(text_part)
            message.attach(html_part)
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.settings.SMTP_HOST,
                port=self.settings.SMTP_PORT,
                start_tls=self.settings.SMTP_TLS,
                username=self.settings.SMTP_USER,
                password=self.settings.SMTP_PASSWORD,
            )
            
            logger.info(f"✅ Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send email to {to_email}: {e}")
            return False
    
    async def send_appointment_notification(
        self,
        appointment_data: dict,
        notification_type: str = "created"
    ) -> bool:
        """
        Send appointment-related notification
        """
        try:
            cliente_email = appointment_data.get("cliente_email")
            if not cliente_email:
                logger.warning("No client email provided for appointment notification")
                return False
            
            # Prepare template context
            context = {
                "appointment_type": notification_type,
                "cliente_nome": appointment_data.get("cliente_nome", "Cliente"),
                "data_hora": appointment_data.get("data_hora_formatada", "N/A"),
                "servico_nome": appointment_data.get("servico_nome", "N/A"),
                "preco": appointment_data.get("servico_preco", "0.00"),
                "barbeiro_nome": appointment_data.get("barbeiro_nome", "N/A"),
                "status": appointment_data.get("status", ""),
                "observacoes": appointment_data.get("observacoes", ""),
            }
            
            if notification_type == "created":
                subject = "🔔 Agendamento Confirmado - BarberManager"
                context["title"] = "Agendamento Confirmado!"
                context["message"] = "Seu agendamento foi confirmado com sucesso:"
            elif notification_type == "updated":
                subject = "🔄 Agendamento Atualizado - BarberManager"
                context["title"] = "Agendamento Atualizado!"
                context["message"] = "Seu agendamento foi atualizado:"
            elif notification_type == "cancelled":
                subject = "❌ Agendamento Cancelado - BarberManager"
                context["title"] = "Agendamento Cancelado"
                context["message"] = "Seu agendamento foi cancelado:"
            else:
                subject = "📅 BarberManager - Notificação"
                context["title"] = "Notificação de Agendamento"
                context["message"] = "Informações sobre seu agendamento:"
            
            # Send email with template
            return await self.send_email(
                to_email=cliente_email,
                subject=subject,
                template_name="appointment_base.html",
                **context
            )
            
        except Exception as e:
            logger.error(f"Failed to send appointment notification: {e}")
            return False
    
    async def send_daily_schedule_reminder(
        self,
        barbeiro_email: str,
        barbeiro_nome: str,
        appointments_count: int,
        appointments_details: List[dict] = None
    ) -> bool:
        """
        Send daily schedule reminder to barber
        """
        try:
            subject = "📅 Sua agenda de hoje - BarberManager"
            
            if appointments_details:
                appointments_list = "\n".join([
                    f"• {apt['hora']} - {apt['cliente']} ({apt['servico']})"
                    for apt in appointments_details
                ])
            else:
                appointments_list = f"Você tem {appointments_count} agendamento(s) hoje."
            
            context = {
                "barbeiro_nome": barbeiro_nome,
                "appointments_count": appointments_count,
                "appointments_list": appointments_list,
                "message": f"Bom dia! Você tem {appointments_count} agendamento(s) para hoje.",
            }
            
            return await self.send_email(
                to_email=barbeiro_email,
                subject=subject,
                **context
            )
            
        except Exception as e:
            logger.error(f"Failed to send daily reminder: {e}")
            return False

# Global email service instance
email_service = EmailService()

# Convenience functions for backward compatibility
async def send_email_notification(to_email: str, subject: str, body: str):
    """Backward compatible email function"""
    return await email_service.send_email(
        to_email=to_email,
        subject=subject,
        message=body
    )

async def send_appointment_notification_async(appointment_data: dict, action: str):
    """Async appointment notification"""
    return await email_service.send_appointment_notification(
        appointment_data=appointment_data,
        notification_type=action
    )

async def send_daily_schedule_reminder_async(
    barbeiro_email: str, 
    barbeiro_nome: str, 
    appointments_count: int
):
    """Async daily reminder"""
    return await email_service.send_daily_schedule_reminder(
        barbeiro_email=barbeiro_email,
        barbeiro_nome=barbeiro_nome,
        appointments_count=appointments_count
    )