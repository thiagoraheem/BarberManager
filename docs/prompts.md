🔹 Estrutura de Prompts (Python Backend)
Prompt 1 – Arquitetura do Sistema
Quero criar um sistema de gestão de barbearia com backend em Python (FastAPI) e frontend em React.
Liste a arquitetura recomendada, módulos necessários, padrões de design e stack de tecnologias 
para suportar agendamento online, PDV e notificações. 
Considere escalabilidade, segurança, multiusuário e LGPD.

Prompt 2 – Configuração Inicial
Crie o backend base em Python usando FastAPI:
- Autenticação com JWT
- Perfis de usuário (admin, barbeiro, recepção, cliente)
- Cadastro inicial de clientes e serviços
- Estrutura de banco de dados PostgreSQL usando SQLAlchemy
- Migrações de banco com Alembic
Forneça código completo e instruções de execução (docker-compose preferencialmente).

Prompt 3 – Agendamento Online
Implemente o módulo de agendamento no backend FastAPI:
- CRUD de horários
- Associação de barbeiro/serviço/cliente
- Bloqueio de agenda (férias, folgas)
- API REST para o frontend consumir
- Endpoint público para cliente marcar horário
Forneça exemplos de requisições e respostas JSON.

Prompt 4 – Lembretes Automáticos
Implemente lembretes automáticos de agendamento no backend:
- Integração com Twilio (SMS) e API de WhatsApp (ex.: Meta WhatsApp Cloud API)
- Disparo automático 24h antes da consulta
- Configuração para cada barbeiro/empresa
- Rotina agendada com APScheduler ou Celery
Forneça código com exemplos práticos.

Prompt 5 – PDV Básico
Implemente o módulo de PDV no backend FastAPI:
- Registro de pagamento (dinheiro, cartão, PIX)
- Emissão de recibo simples em PDF
- Relatório de caixa diário
- API para integração com frontend
Use SQLAlchemy para persistência e crie endpoints REST completos.

Prompt 6 – Relatórios Essenciais
Implemente no backend FastAPI endpoints de relatórios:
- Receita diária e mensal
- Total de agendamentos
- Ticket médio
- Exportação de dados para Excel (usando openpyxl) e PDF (usando ReportLab)
Forneça endpoints REST que retornem JSON e arquivos.

Prompt 7 – Fidelidade e Pacotes
Implemente o módulo de fidelidade no backend FastAPI:
- Pontos acumulados por serviço/produto
- Cupons de desconto
- Pacotes de serviços pré-pagos
- API REST para consulta e resgate

Prompt 8 – Gestão de Estoque
Implemente o módulo de estoque no backend FastAPI:
- Cadastro de produtos e variantes
- Controle de entrada e saída de estoque
- Alertas de estoque mínimo
- Relatório de produtos mais vendidos

Prompt 9 – App Mobile do Barbeiro
Implemente endpoints no backend FastAPI para atender ao aplicativo mobile do barbeiro:
- Consulta de agenda própria
- Visualização de comissões
- Inserção de observações/notas sobre clientes
- Histórico de atendimentos

Prompt 10 – Marketing e Integrações
Implemente no backend FastAPI módulos para marketing:
- Disparo de campanhas via SMS/WhatsApp/e-mail
- Link para avaliação de clientes após atendimento
- Integração com Google Calendar e Instagram para agendamento
- Endpoints REST para gerenciamento de campanhas

Prompt 11 – BI e Inovação
Implemente no backend FastAPI um módulo de relatórios avançados com dashboards:
- Ocupação de agenda
- Taxa de retorno de clientes
- Previsão de demanda usando Machine Learning (ex.: scikit-learn)
- API para servir dados ao frontend em gráficos


👉 Cada prompt gera um módulo isolado, pronto para integração.
A ordem segue a classificação obrigatório → desejável → futuro que já estruturamos.