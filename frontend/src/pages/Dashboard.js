import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState({
    agendamentos_hoje: 0,
    faturamento_mes: 0,
    clientes_total: 0,
    agendamentos_pendentes: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas
      const statsResponse = await api.get('/dashboard/stats');
      setStats(statsResponse.data);

      // Carregar agendamentos recentes
      const appointmentsResponse = await api.get('/appointments?limit=5');
      setRecentAppointments(appointmentsResponse.data);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`stat-card ${color}`}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1 opacity-75">{title}</h6>
          <h2 className="mb-1 fw-bold">{value}</h2>
          {subtitle && <small className="opacity-75">{subtitle}</small>}
        </div>
        <div className="opacity-75">
          <i className={`${icon} fa-2x`}></i>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <h5>Carregando dashboard...</h5>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid fade-in">
      {/* Cabeçalho */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1 fw-bold">📊 Dashboard</h1>
              <p className="text-muted mb-0">Visão geral do seu negócio</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={loadDashboardData}
              title="Atualizar dados"
            >
              <i className="fas fa-sync-alt me-2"></i>
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            title="Agendamentos Hoje"
            value={stats.agendamentos_hoje}
            icon="fas fa-calendar-day"
            color=""
            subtitle="agendamentos"
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            title="Faturamento do Mês"
            value={formatCurrency(stats.faturamento_mes)}
            icon="fas fa-chart-line"
            color="success"
            subtitle="receita total"
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            title="Total de Clientes"
            value={stats.clientes_total}
            icon="fas fa-users"
            color="info"
            subtitle="clientes ativos"
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            title="Agendamentos Pendentes"
            value={stats.agendamentos_pendentes}
            icon="fas fa-clock"
            color="warning"
            subtitle="aguardando"
          />
        </div>
      </div>

      <div className="row">
        {/* Agendamentos recentes */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-calendar-alt me-2"></i>
                Próximos Agendamentos
              </h5>
              <a href="/agendamentos" className="btn btn-sm btn-outline-primary">
                Ver Todos
              </a>
            </div>
            <div className="card-body">
              {recentAppointments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Serviço</th>
                        <th>Data/Hora</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar me-2">
                                <div 
                                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                                  style={{ width: '35px', height: '35px', fontSize: '14px' }}
                                >
                                  {appointment.cliente?.nome?.charAt(0)?.toUpperCase()}
                                </div>
                              </div>
                              <span className="fw-semibold">{appointment.cliente?.nome}</span>
                            </div>
                          </td>
                          <td>{appointment.servico?.nome}</td>
                          <td>
                            <small>
                              {new Date(appointment.data_hora).toLocaleDateString('pt-BR')}<br />
                              {new Date(appointment.data_hora).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${
                              appointment.status === 'agendado' ? 'bg-info' :
                              appointment.status === 'confirmado' ? 'bg-success' :
                              appointment.status === 'em_andamento' ? 'bg-warning' :
                              appointment.status === 'concluido' ? 'bg-primary' :
                              'bg-danger'
                            }`}>
                              {appointment.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Nenhum agendamento encontrado</h5>
                  <p className="text-muted">Os próximos agendamentos aparecerão aqui.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Ações Rápidas
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <a href="/agendamentos" className="btn btn-outline-primary">
                  <i className="fas fa-plus me-2"></i>
                  Novo Agendamento
                </a>
                <a href="/clientes" className="btn btn-outline-success">
                  <i className="fas fa-user-plus me-2"></i>
                  Cadastrar Cliente
                </a>
                <a href="/pos" className="btn btn-outline-warning">
                  <i className="fas fa-cash-register me-2"></i>
                  Abrir POS
                </a>
                <a href="/servicos" className="btn btn-outline-info">
                  <i className="fas fa-cut me-2"></i>
                  Gerenciar Serviços
                </a>
              </div>
            </div>
          </div>

          {/* Informações do sistema */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Informações do Sistema
              </h6>
            </div>
            <div className="card-body">
              <small className="text-muted">
                <div className="mb-2">
                  <strong>Versão:</strong> 1.0.0
                </div>
                <div className="mb-2">
                  <strong>Última atualização:</strong> Hoje
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className="badge bg-success ms-1">Online</span>
                </div>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
