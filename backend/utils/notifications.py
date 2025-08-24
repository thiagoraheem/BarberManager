import os
from typing import Optional
from models import Appointment

def send_email_notification(to_email: str, subject: str, body: str):
    """
    Enviar notificação por email (simulado)
    Em produção, integrar com serviços como SendGrid, AWS SES, etc.
    """
    print(f"📧 EMAIL ENVIADO PARA: {to_email}")
    print(f"ASSUNTO: {subject}")
    print(f"CORPO: {body}")
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
    Enviar notificações relacionadas a agendamentos
    """
    cliente = appointment.cliente
    barbeiro = appointment.barbeiro
    servico = appointment.servico
    
    # Formatação de data/hora em português
    data_formatada = appointment.data_hora.strftime("%d/%m/%Y às %H:%M")
    
    if action == "criado":
        # Notificar cliente
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
        
        if cliente.telefone:
            sms_message = f"Agendamento confirmado para {data_formatada} - {servico.nome} com {barbeiro.nome}. Barbearia."
            send_sms_notification(cliente.telefone, sms_message)
    
    elif action == "atualizado":
        # Notificar sobre mudanças no agendamento
        if cliente.email:
            subject = "🔄 Agendamento Atualizado - Barbearia"
            body = f"""
Olá {cliente.nome}!

Seu agendamento foi atualizado:

📅 Nova Data/Hora: {data_formatada}
✂️ Serviço: {servico.nome}
👨‍💼 Barbeiro: {barbeiro.nome}
📋 Status: {appointment.status.value.title()}

Em caso de dúvidas, entre em contato conosco.
            """
            send_email_notification(cliente.email, subject, body)

def send_daily_schedule_reminder(barbeiro_email: str, appointments_count: int):
    """
    Enviar lembrete diário da agenda para barbeiros
    """
    subject = "📅 Sua agenda de hoje"
    body = f"""
Bom dia!

Você tem {appointments_count} agendamento(s) para hoje.

Tenha um ótimo dia de trabalho!
    """
    send_email_notification(barbeiro_email, subject, body)
