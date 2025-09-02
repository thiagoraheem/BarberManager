# Manual do Usuário - BarberManager

## Bem-vindo ao BarberManager

O BarberManager é um sistema completo de gestão para barbearias e salões de beleza. Este manual irá guiá-lo através de todas as funcionalidades do sistema, desde o primeiro acesso até as operações avançadas.

## Sumário

1. [Primeiros Passos](#primeiros-passos)
2. [Dashboard](#dashboard)
3. [Gestão de Clientes](#gestão-de-clientes)
4. [Gestão de Serviços](#gestão-de-serviços)
5. [Agendamentos](#agendamentos)
6. [Ponto de Venda (POS)](#ponto-de-venda-pos)
7. [Gestão de Caixa](#gestão-de-caixa)
8. [Relatórios](#relatórios)
9. [Configurações](#configurações)
10. [Agendamento Público](#agendamento-público)
11. [Dicas e Melhores Práticas](#dicas-e-melhores-práticas)

---

## Primeiros Passos

### Fazendo Login

1. Acesse o sistema através do navegador
2. Digite seu email e senha
3. Clique em "Entrar"

**Perfis de Usuário:**
- **Administrador**: Acesso completo ao sistema
- **Barbeiro**: Agenda pessoal, clientes e vendas
- **Recepcionista**: Agendamentos, clientes e ponto de venda

### Interface Principal

O sistema possui um menu lateral com as seguintes opções:
- 🏠 **Dashboard**: Visão geral do negócio
- 👥 **Clientes**: Gestão da base de clientes
- ✂️ **Serviços**: Catálogo de serviços e preços
- 📅 **Agendamentos**: Controle da agenda
- 💰 **POS**: Ponto de venda
- 💵 **Caixa**: Gestão financeira
- 📊 **Relatórios**: Análises e exportações
- ⚙️ **Configurações**: Gestão de usuários e sistema

---

## Dashboard

O Dashboard é sua central de informações, apresentando:

### Estatísticas Principais
- **Receita Mensal**: Faturamento do mês atual
- **Agendamentos Hoje**: Quantidade de atendimentos do dia
- **Agendamentos Pendentes**: Próximos atendimentos confirmados
- **Total de Clientes**: Base total de clientes cadastrados

### Próximos Agendamentos
Lista dos próximos atendimentos com:
- Nome do cliente
- Barbeiro responsável
- Serviço agendado
- Data e horário
- Status do agendamento

### Vendas Recentes
Últimas transações do dia com informações de:
- Vendedor
- Cliente
- Valor total
- Método de pagamento

---

## Gestão de Clientes

### Visualizando Clientes

Na tela de clientes você pode:
- Ver lista completa de clientes
- Usar a busca para encontrar clientes específicos
- Filtrar por nome, email ou telefone

### Cadastrando Novo Cliente

1. Clique em **"Novo Cliente"**
2. Preencha os campos obrigatórios:
   - **Nome completo**
   - **Email** (único no sistema)
   - **Telefone**
   - **CPF** (único no sistema)
3. Marque **"Aceite LGPD"** (obrigatório)
4. Clique em **"Salvar"**

**⚠️ Importante**: O aceite LGPD é obrigatório conforme a Lei Geral de Proteção de Dados.

### Editando Cliente

1. Clique no ícone de edição (✏️) na linha do cliente
2. Modifique as informações necessárias
3. Clique em **"Atualizar"**

### Histórico do Cliente

Cada cliente possui histórico completo de:
- Agendamentos realizados
- Serviços contratados
- Valor gasto
- Frequência de visitas

---

## Gestão de Serviços

### Visualizando Serviços

A tela de serviços mostra:
- Nome do serviço
- Preço
- Duração em minutos
- Status (ativo/inativo)

### Cadastrando Novo Serviço

1. Clique em **"Novo Serviço"**
2. Preencha as informações:
   - **Nome**: Nome do serviço
   - **Preço**: Valor em reais
   - **Duração**: Tempo em minutos
   - **Ativo**: Marque para disponibilizar o serviço
3. Clique em **"Salvar"**

### Configuração de Preços

- Preços são definidos por serviço
- A duração afeta o cálculo de agenda
- Serviços inativos não aparecem no agendamento

---

## Agendamentos

### Visualizando Agenda

A tela de agendamentos permite:
- Ver agendamentos por data
- Filtrar por barbeiro específico
- Visualizar status dos agendamentos

### Status dos Agendamentos

- 🔵 **Agendado**: Recém criado
- 🟢 **Confirmado**: Cliente confirmou presença
- 🟡 **Em Andamento**: Atendimento iniciado
- ✅ **Concluído**: Serviço finalizado
- ❌ **Cancelado**: Agendamento cancelado

### Criando Novo Agendamento

1. Clique em **"Novo Agendamento"**
2. Selecione:
   - **Cliente**: Digite o nome para buscar
   - **Barbeiro**: Profissional responsável
   - **Serviço**: Tipo de atendimento
   - **Data e Hora**: Quando será realizado
3. Adicione observações se necessário
4. Clique em **"Salvar"**

**🚨 Detecção de Conflitos**: O sistema automaticamente verifica se há sobreposição de horários e alertará sobre conflitos.

### Alterando Status

Para alterar o status de um agendamento:
1. Clique no agendamento desejado
2. Use o menu suspenso de status
3. Selecione o novo status
4. Confirme a alteração

### Reagendamento

1. Clique em **"Editar"** no agendamento
2. Altere a data/hora
3. O sistema verificará novos conflitos
4. Salve as alterações

---

## Ponto de Venda (POS)

O POS permite processar vendas e pagamentos de forma rápida e eficiente.

### Realizando uma Venda

1. **Selecionar Cliente** (opcional):
   - Digite o nome para buscar
   - Ou deixe em branco para cliente avulso

2. **Adicionar Serviços**:
   - Clique em um serviço para adicionar
   - Ajuste a quantidade se necessário
   - O preço aparecerá automaticamente

3. **Escolher Método de Pagamento**:
   - 💵 Dinheiro
   - 💳 Cartão de Débito
   - 💳 Cartão de Crédito
   - 📱 PIX

4. **Finalizar Venda**:
   - Confira o total
   - Adicione observações se necessário
   - Clique em **"Finalizar Venda"**

### Carrinho de Compras

O carrinho mostra:
- Serviços selecionados
- Quantidade de cada item
- Preço unitário
- Subtotal por item
- **Total geral da venda**

### Histórico de Vendas

Acesse vendas anteriores para:
- Consultar detalhes de transações
- Verificar métodos de pagamento
- Analisar vendas por período

---

## Gestão de Caixa

O sistema de caixa controla todo o fluxo financeiro diário.

### Status do Caixa

O caixa pode estar:
- 🔴 **Fechado**: Nenhum operador ativo
- 🟢 **Aberto**: Operador ativo recebendo vendas

### Abrindo o Caixa

1. Clique em **"Abrir Caixa"**
2. Informe:
   - **Valor inicial**: Dinheiro no caixa (troco)
   - **Observações**: Informações relevantes
3. Confirme a abertura

### Monitoramento Durante o Dia

Com o caixa aberto, você vê:
- **Valor inicial**: Quantia para troco
- **Total de vendas**: Soma de todas as vendas
- **Vendas por método**:
  - Dinheiro
  - Cartão de débito
  - Cartão de crédito
  - PIX

### Fechando o Caixa

1. Clique em **"Fechar Caixa"**
2. Conte o dinheiro físico
3. Informe o **valor final**
4. O sistema calculará:
   - **Diferença**: Valor esperado vs contado
   - **Status**: Se há sobra ou falta
5. Adicione observações sobre diferenças
6. Confirme o fechamento

### Relatório de Caixa

Após o fechamento, você terá:
- Resumo completo do dia
- Vendas por método de pagamento
- Diferenças encontradas
- Histórico de operações

---

## Relatórios

### Tipos de Relatórios

1. **Relatório Financeiro**:
   - Receita por período
   - Vendas por método de pagamento
   - Análise de faturamento

2. **Relatório de Clientes**:
   - Lista completa de clientes
   - Dados para contato
   - Conformidade LGPD

3. **Relatório de Agendamentos**:
   - Agendamentos por período
   - Status dos atendimentos
   - Performance por barbeiro

### Gerando Relatórios

1. Acesse **"Relatórios"** no menu
2. Escolha o tipo de relatório
3. Defina o período:
   - Data inicial
   - Data final
4. Selecione o formato:
   - **JSON**: Visualização na tela
   - **Excel**: Download em .xlsx
   - **PDF**: Download em .pdf
5. Clique em **"Gerar Relatório"**

### Análises Disponíveis

- **Faturamento mensal/diário**
- **Serviços mais populares**
- **Performance por barbeiro**
- **Taxa de ocupação da agenda**
- **Métodos de pagamento preferidos**

---

## Configurações

### Gestão de Usuários (Somente Administrador)

#### Criando Novo Usuário

1. Acesse **"Configurações"** → **"Usuários"**
2. Clique em **"Novo Usuário"**
3. Preencha:
   - **Nome completo**
   - **Email** (será o login)
   - **Telefone**
   - **Senha** (mínimo 6 caracteres)
   - **Função**:
     - Administrador
     - Barbeiro
     - Recepcionista
4. Clique em **"Criar Usuário"**

#### Editando Usuários

- Altere informações pessoais
- Ative/desative usuários
- Redefina senhas
- Mude funções (roles)

### Configurações do Sistema

#### Notificações por Email

Configure o sistema para enviar:
- Confirmações de agendamento
- Lembretes automáticos
- Relatórios por email

#### Horário de Funcionamento

Defina:
- Horário de abertura
- Horário de fechamento
- Dias de funcionamento
- Feriados e bloqueios

---

## Agendamento Público

### Interface para Clientes

O sistema oferece uma página pública onde clientes podem:
- Ver serviços disponíveis
- Escolher barbeiro
- Selecionar data e horário
- Fazer agendamento online

### Configuração

1. Ative o agendamento público nas configurações
2. Defina quais serviços ficam disponíveis
3. Configure horários de atendimento
4. Personalize mensagens para o cliente

### Processo do Cliente

1. Cliente acessa a página pública
2. Escolhe o serviço desejado
3. Seleciona barbeiro (se preferir)
4. Vê horários disponíveis
5. Preenche dados pessoais
6. Aceita termos LGPD
7. Confirma agendamento
8. Recebe confirmação por email

---

## Dicas e Melhores Práticas

### Para Recepcionistas

1. **Sempre confirme dados do cliente** antes de agendar
2. **Verifique conflitos** na agenda antes de confirmar horários
3. **Mantenha o caixa organizado** com aberturas e fechamentos diários
4. **Confirme métodos de pagamento** antes de finalizar vendas

### Para Barbeiros

1. **Atualize status dos agendamentos** conforme o atendimento evolui
2. **Adicione observações importantes** sobre preferências do cliente
3. **Comunique indisponibilidades** com antecedência
4. **Monitore sua agenda** regularmente

### Para Administradores

1. **Faça backup regular** dos dados
2. **Monitore relatórios financeiros** semanalmente  
3. **Revise usuários ativos** mensalmente
4. **Mantenha preços atualizados** conforme necessário
5. **Configure notificações** para reduzir no-show

### Segurança e LGPD

1. **Proteja senhas** e dados de acesso
2. **Respeite a privacidade** dos clientes
3. **Mantenha dados atualizados** conforme solicitação dos clientes
4. **Documente aceites LGPD** de todos os clientes

### Performance

1. **Use filtros** para encontrar informações rapidamente
2. **Mantenha navegador atualizado** para melhor performance
3. **Feche abas desnecessárias** se o sistema estiver lento
4. **Reporte problemas** imediatamente ao administrador

---

## Solução de Problemas

### Problemas Comuns

#### "Não consigo fazer login"
- Verifique email e senha
- Certifique-se que o usuário está ativo
- Contate o administrador se necessário

#### "Conflito de agendamento"
- O sistema detectou sobreposição de horários
- Escolha outro horário disponível
- Verifique a duração do serviço

#### "Cliente não aparece na busca"
- Verifique a grafia do nome
- Tente buscar por email ou telefone
- Cliente pode não estar cadastrado

#### "Erro ao processar venda"
- Verifique se o caixa está aberto
- Confirme se há itens no carrinho
- Tente novamente ou contate suporte

### Obtendo Ajuda

1. **Consulte este manual** primeiro
2. **Verifique com outros usuários** da equipe
3. **Contate o administrador** do sistema
4. **Anote detalhes do erro** para facilitar o suporte

---

## Atalhos e Recursos Avançados

### Atalhos de Teclado

- **Ctrl + N**: Novo item (depende da tela atual)
- **Ctrl + S**: Salvar formulário
- **Ctrl + F**: Buscar na página
- **Esc**: Fechar modal/popup

### Recursos de Busca

- **Busca por nome**: Digite parte do nome
- **Busca por email**: Use @ no início
- **Busca por telefone**: Digite números
- **Busca avançada**: Use filtros disponíveis

### Exportação de Dados

- **CSV**: Para importar em planilhas
- **Excel**: Para análises detalhadas
- **PDF**: Para impressão e arquivo
- **JSON**: Para integrações técnicas

---

## Conclusão

O BarberManager foi desenvolvido para simplificar e otimizar a gestão da sua barbearia. Com este manual, você tem todas as informações necessárias para utilizar o sistema de forma eficiente.

Lembre-se:
- ✅ Mantenha dados sempre atualizados
- ✅ Use relatórios para tomar decisões
- ✅ Aproveite a automação para ganhar tempo
- ✅ Mantenha backup dos dados importantes

**Para suporte técnico ou dúvidas sobre funcionalidades, entre em contato com o administrador do sistema.**

---

*Manual atualizado em: Fevereiro 2024*
*Versão do Sistema: 1.0.0*