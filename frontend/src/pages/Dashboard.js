import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { formatCurrency, formatAppointmentTimeRange } from '../utils/formatters';

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
    <div className={`stat-card ${color} slide-in-up`}>
      <div className="d-flex justify-between align-start">
        <div>
          <h6 className="mb-1 text-light">{title}</h6>
          <h2 className="mb-1 text-bold text-white">{value}</h2>
          {subtitle && <small className="text-light">{subtitle}</small>}
        </div>
        <div className="text-light opacity-75">
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-center align-center" style={{ minHeight: '400px' }}>
          <div className="main-card text-center">
            <div className="spinner mb-3"></div>
            <h5 className="text-dark">Carregando dashboard...</h5>
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
          <div className="d-flex justify-between align-center">
            <div>
              <h1 className="text-2xl mb-1 text-bold text-dark">📊 Dashboard</h1>
              <p className="text-light mb-0">Visão geral do seu negócio</p>
            </div>
            <button 
              className="modern-btn-primary"
              onClick={loadDashboardData}
              title="Atualizar dados"
            >
              <i className="fas fa-sync-alt mr-2"></i>
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
            color="primary"
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
          <div className="main-card slide-in-up">
            <div className="card-header d-flex justify-between align-center p-4 border-b border-white-border">
              <h5 className="mb-0 text-dark text-semibold">
                <i className="fas fa-calendar-alt mr-2 text-primary"></i>
                Próximos Agendamentos
              </h5>
              <a href="/agendamentos" className="modern-btn-outline">
                Ver Todos
              </a>
            </div>
            <div className="p-4">
              {recentAppointments.length > 0 ? (
                <div className="modern-table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th className="text-dark text-semibold">Cliente</th>
                        <th className="text-dark text-semibold">Serviço</th>
                        <th className="text-dark text-semibold">Data/Hora</th>
                        <th className="text-dark text-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.map((appointment) => (
                        <tr key={appointment.id} className="hover-lift transition">
                          <td>
                            <div className="d-flex align-center">
                              <div className="mr-3">
                                <div 
                                  className="rounded-full bg-primary d-flex align-center justify-center text-white text-semibold"
                                  style={{ width: '35px', height: '35px', fontSize: '14px' }}
                                >
                                  {appointment.cliente?.nome?.charAt(0)?.toUpperCase()}
                                </div>
                              </div>
                              <span className="text-semibold text-dark">{appointment.cliente?.nome}</span>
                            </div>
                          </td>
                          <td className="text-dark">{appointment.servico?.nome}</td>
                          <td>
                            <small className="text-light">
                              {new Date(appointment.data_hora).toLocaleDateString('pt-BR')}<br />
                              {formatAppointmentTimeRange(appointment.data_hora, appointment.servico?.duracao_minutos)}
                            </small>
                          </td>
                          <td>
                            <span className={`badge px-2 py-1 rounded text-xs text-semibold ${
                              appointment.status === 'agendado' ? 'bg-info text-white' :
                              appointment.status === 'confirmado' ? 'bg-success text-white' :
                              appointment.status === 'em_andamento' ? 'bg-warning text-dark' :
                              appointment.status === 'concluido' ? 'bg-primary text-white' :
                              'bg-error text-white'
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
                <div className="text-center py-8">
                  <i className="fas fa-calendar-times text-4xl text-light mb-3"></i>
                  <h5 className="text-light mb-2">Nenhum agendamento encontrado</h5>
                  <p className="text-light">Os próximos agendamentos aparecerão aqui.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="col-lg-4 mb-4">
          <div className="main-card slide-in-up">
            <div className="card-header p-4 border-b border-white-border">
              <h5 className="mb-0 text-dark text-semibold">
                <i className="fas fa-bolt mr-2 text-primary"></i>
                Ações Rápidas
              </h5>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <a href="/agendamentos" className="modern-btn-outline w-full d-flex align-center justify-center hover-lift transition">
                  <i className="fas fa-plus mr-2"></i>
                  Novo Agendamento
                </a>
                <a href="/clientes" className="modern-btn-secondary w-full d-flex align-center justify-center hover-lift transition">
                  <i className="fas fa-user-plus mr-2"></i>
                  Cadastrar Cliente
                </a>
                <a href="/pos" className="modern-btn-outline w-full d-flex align-center justify-center hover-lift transition">
                  <i className="fas fa-cash-register mr-2"></i>
                  Abrir POS
                </a>
                <a href="/servicos" className="modern-btn-outline w-full d-flex align-center justify-center hover-lift transition">
                  <i className="fas fa-cut mr-2"></i>
                  Gerenciar Serviços
                </a>
              </div>
            </div>
          </div>

          {/* Informações do sistema */}
          <div className="main-card mt-4 slide-in-up">
            <div className="card-header p-4 border-b border-white-border">
              <h6 className="mb-0 text-dark text-semibold">
                <i className="fas fa-info-circle mr-2 text-primary"></i>
                Informações do Sistema
              </h6>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="d-flex justify-between">
                  <span className="text-light text-semibold">Versão:</span>
                  <span className="text-dark">1.0.0</span>
                </div>
                <div className="d-flex justify-between">
                  <span className="text-light text-semibold">Última atualização:</span>
                  <span className="text-dark">Hoje</span>
                </div>
                <div className="d-flex justify-between align-center">
                  <span className="text-light text-semibold">Status:</span>
                  <span className="badge bg-success text-white px-2 py-1 rounded text-xs">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
