from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import Client

def get_client_data_export(db: Session, client_id: int):
    """
    Exportar todos os dados do cliente para conformidade com LGPD
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        return None
    
    # Coletar todos os dados relacionados ao cliente
    client_data = {
        "dados_pessoais": {
            "id": client.id,
            "nome": client.nome,
            "email": client.email,
            "telefone": client.telefone,
            "cpf": client.cpf,
            "data_nascimento": client.data_nascimento.isoformat() if client.data_nascimento else None,
            "endereco": client.endereco,
            "observacoes": client.observacoes,
            "criado_em": client.criado_em.isoformat(),
            "atualizado_em": client.atualizado_em.isoformat() if client.atualizado_em else None
        },
        "lgpd": {
            "aceite_lgpd": client.aceite_lgpd,
            "data_aceite_lgpd": client.data_aceite_lgpd.isoformat() if client.data_aceite_lgpd else None
        },
        "agendamentos": [],
        "vendas": []
    }
    
    # Adicionar agendamentos
    for appointment in client.agendamentos:
        client_data["agendamentos"].append({
            "id": appointment.id,
            "data_hora": appointment.data_hora.isoformat(),
            "servico": appointment.servico.nome,
            "barbeiro": appointment.barbeiro.nome,
            "status": appointment.status.value,
            "observacoes": appointment.observacoes,
            "criado_em": appointment.criado_em.isoformat()
        })
    
    return client_data

def anonymize_client_data(db: Session, client_id: int):
    """
    Anonimizar dados do cliente (direito ao esquecimento - LGPD)
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        return False
    
    # Anonimizar dados pessoais
    client.nome = f"Cliente_Anonimizado_{client.id}"
    client.email = None
    client.telefone = "***********"
    client.cpf = None
    client.data_nascimento = None
    client.endereco = None
    client.observacoes = "Dados anonimizados conforme LGPD"
    client.ativo = False
    client.atualizado_em = datetime.now()
    
    db.commit()
    return True

def check_data_retention_compliance(db: Session):
    """
    Verificar conformidade com retenção de dados (LGPD)
    Clientes inativos há mais de 5 anos devem ser anonimizados
    """
    five_years_ago = datetime.now() - timedelta(days=5*365)
    
    old_inactive_clients = db.query(Client).filter(
        Client.ativo == False,
        Client.atualizado_em < five_years_ago
    ).all()
    
    anonymized_count = 0
    for client in old_inactive_clients:
        if anonymize_client_data(db, client.id):
            anonymized_count += 1
    
    return {
        "clients_checked": len(old_inactive_clients),
        "clients_anonymized": anonymized_count,
        "retention_cutoff": five_years_ago.isoformat()
    }

def generate_lgpd_consent_text():
    """
    Gerar texto de consentimento LGPD
    """
    return """
CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS (LGPD)

Ao concordar com este termo, você autoriza nossa barbearia a coletar, armazenar e processar seus dados pessoais para:

1. Agendamento e prestação de serviços
2. Comunicação sobre agendamentos e promoções
3. Histórico de atendimentos
4. Gestão financeira e fiscal

SEUS DIREITOS:
- Acesso aos seus dados
- Correção de dados incorretos
- Exclusão de dados (direito ao esquecimento)
- Portabilidade dos dados
- Revogação do consentimento

Para exercer seus direitos ou esclarecer dúvidas, entre em contato conosco.

Data de vigência: {data_atual}
    """.replace("{data_atual}", datetime.now().strftime("%d/%m/%Y"))
