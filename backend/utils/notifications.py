import os
import asyncio
from typing import Optional
from models import Appointment
from utils.email_service import email_service, send_email_notification as async_send_email

# Legacy sync wrapper for email notifications
def send_email_notification(to_email: str, subject: str, body: str):
    """
    Send email notification (with real SMTP support)
    This is a sync wrapper around the async email service
    """
    try:
        # Try to send real email if configured
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If already in async context, create a task
            asyncio.create_task(async_send_email(to_email, subject, body))
        else:
            # If not in async context, run in new loop
            asyncio.run(async_send_email(to_email, subject, body))
    except Exception as e:
        # Fallback to simulation if email fails
        print(f"📧 EMAIL ENVIADO PARA: {to_email}")
        print(f"ASSUNTO: {subject}")
        print(f"CORPO: {body}")
        print(f"⚠️ ERRO DE EMAIL: {e}")
        print("-" * 50)

def send_sms_notification(phone: str, message: str):
    """
    Enviar notificação por SMS (simulado)
    Em produção, integrar com serviços como Twilio, AWS SNS, etc.
    """
    print(f"📱 SMS ENVIADO PARA: {phone}")
    print(f"MENSAGEM: {message}")
    print("-" * 50)

def send_appointment_notification(appointment: Appointment, action: str):
    """
    Send notifications related to appointments using modern email service
    """
    cliente = appointment.cliente
    barbeiro = appointment.barbeiro
    servico = appointment.servico
    
    # Format date/time in Portuguese
    data_formatada = appointment.data_hora.strftime("%d/%m/%Y às %H:%M")
    
    try:
        # Prepare appointment data for the email service
        appointment_data = {
            "cliente_email": cliente.email,
            "cliente_nome": cliente.nome,
            "data_hora_formatada": data_formatada,
            "servico_nome": servico.nome,
            "servico_preco": f"{servico.preco:.2f}",
            "barbeiro_nome": barbeiro.nome,
            "status": appointment.status.value.title() if hasattr(appointment.status, 'value') else str(appointment.status),
            "observacoes": appointment.observacoes or ""
        }
        
        # Send notification using async email service
        if cliente.email:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    asyncio.create_task(
                        email_service.send_appointment_notification(
                            appointment_data, action
                        )
                    )
                else:
                    asyncio.run(
                        email_service.send_appointment_notification(
                            appointment_data, action
                        )
                    )
            except Exception as e:
                print(f"⚠️ Erro ao enviar email: {e}")
                # Fallback to legacy notification
                _send_legacy_email_notification(appointment, action)
        
        # Send SMS (still simulated)
        if cliente.telefone:
            if action == "criado":
                sms_message = f"Agendamento confirmado para {data_formatada} - {servico.nome} com {barbeiro.nome}. Barbearia."
            else:
                sms_message = f"Agendamento atualizado para {data_formatada} - {servico.nome} com {barbeiro.nome}. Barbearia."
            send_sms_notification(cliente.telefone, sms_message)
            
    except Exception as e:
        print(f"⚠️ Erro geral na notificação: {e}")
        # Fallback to legacy notification
        _send_legacy_email_notification(appointment, action)

def _send_legacy_email_notification(appointment: Appointment, action: str):
    """
    Legacy email notification for fallback
    """
    cliente = appointment.cliente
    barbeiro = appointment.barbeiro
    servico = appointment.servico
    data_formatada = appointment.data_hora.strftime("%d/%m/%Y às %H:%M")
    
    if action == "criado":
        if cliente.email:
            subject = "🔔 Agendamento Confirmado - Barbearia"
            body = f"""
Olá {cliente.nome}!

Seu agendamento foi confirmado com sucesso:

📅 Data/Hora: {data_formatada}
✂️ Serviço: {servico.nome}
💰 Valor: R$ {servico.preco:.2f}
👨‍💼 Barbeiro: {barbeiro.nome}

Obrigado por escolher nossa barbearia!
            """
            send_email_notification(cliente.email, subject, body)
    
    elif action == "atualizado":
        if cliente.email:
            subject = "🔄 Agendamento Atualizado - Barbearia"
            body = f"""
Olá {cliente.nome}!

Seu agendamento foi atualizado:

📅 Nova Data/Hora: {data_formatada}
✂️ Serviço: {servico.nome}
👨‍💼 Barbeiro: {barbeiro.nome}
📋 Status: {appointment.status.value.title() if hasattr(appointment.status, 'value') else str(appointment.status)}

Em caso de dúvidas, entre em contato conosco.
            """
            send_email_notification(cliente.email, subject, body)

def send_daily_schedule_reminder(barbeiro_email: str, appointments_count: int):
    """
    Send daily schedule reminder to barbers using modern email service
    """
    try:
        # Try to send with async email service
        barbeiro_nome = barbeiro_email.split('@')[0].title()  # Extract name from email
        
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(
                email_service.send_daily_schedule_reminder(
                    barbeiro_email=barbeiro_email,
                    barbeiro_nome=barbeiro_nome,
                    appointments_count=appointments_count
                )
            )
        else:
            asyncio.run(
                email_service.send_daily_schedule_reminder(
                    barbeiro_email=barbeiro_email,
                    barbeiro_nome=barbeiro_nome,
                    appointments_count=appointments_count
                )
            )
    except Exception as e:
        print(f"⚠️ Erro ao enviar lembrete diário: {e}")
        # Fallback to legacy notification
        subject = "📅 Sua agenda de hoje"
        body = f"""
Bom dia!

Você tem {appointments_count} agendamento(s) para hoje.

Tenha um ótimo dia de trabalho!
        """
        send_email_notification(barbeiro_email, subject, body)
