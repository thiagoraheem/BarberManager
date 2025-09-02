import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [financialForm, setFinancialForm] = useState({
    start_date: '',
    end_date: '',
    format: 'excel'
  });

  const [appointmentForm, setAppointmentForm] = useState({
    start_date: '',
    end_date: '',
    format: 'excel'
  });

  const [clientFormat, setClientFormat] = useState('excel');
  const [quickStats, setQuickStats] = useState(null);

  // Get default dates (current month)
  React.useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    setFinancialForm(prev => ({
      ...prev,
      start_date: formatDate(firstDay),
      end_date: formatDate(lastDay)
    }));
    
    setAppointmentForm(prev => ({
      ...prev,
      start_date: formatDate(firstDay),
      end_date: formatDate(lastDay)
    }));

    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      const response = await api.get('/reports/quick-stats?period=month');
      setQuickStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas rápidas:', error);
    }
  };

  const downloadReport = async (endpoint, params = {}) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const queryParams = new URLSearchParams(params).toString();
      const url = `/reports/${endpoint}${queryParams ? '?' + queryParams : ''}`;
      
      const response = await api.get(url, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Extract filename from response headers or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'relatorio.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess('Relatório baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      setError(error.response?.data?.detail || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleFinancialReport = () => {
    if (!financialForm.start_date || !financialForm.end_date) {
      setError('Selecione as datas para o relatório financeiro');
      return;
    }
    downloadReport('financial', financialForm);
  };

  const handleClientReport = () => {
    downloadReport('clients', { format: clientFormat });
  };

  const handleAppointmentReport = () => {
    if (!appointmentForm.start_date || !appointmentForm.end_date) {
      setError('Selecione as datas para o relatório de agendamentos');
      return;
    }
    downloadReport('appointments', appointmentForm);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Check if user has permission for reports
  if (!['admin', 'recepcionista'].includes(user?.role)) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Você não tem permissão para acessar relatórios.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">📊 Relatórios e Análises</h1>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}

          {/* Quick Stats */}
          {quickStats && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">📈 Estatísticas Rápidas (Mês Atual)</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="text-center">
                          <h6>Faturamento</h6>
                          <h4 className="text-success">{formatCurrency(quickStats.total_sales)}</h4>
                          <small className={`text-${quickStats.sales_trend >= 0 ? 'success' : 'danger'}`}>
                            {quickStats.sales_trend >= 0 ? '↗' : '↘'} {Math.abs(quickStats.sales_trend)}%
                          </small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h6>Agendamentos</h6>
                          <h4 className="text-primary">{quickStats.total_appointments}</h4>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h6>Novos Clientes</h6>
                          <h4 className="text-info">{quickStats.new_clients}</h4>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h6>Ticket Médio</h6>
                          <h4 className="text-warning">{formatCurrency(quickStats.avg_ticket)}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Generation */}
          <div className="row">
            {/* Financial Report */}
            <div className="col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">💰 Relatório Financeiro</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">
                    Análise completa de vendas, métodos de pagamento e performance por período.
                  </p>
                  
                  <div className="mb-3">
                    <label className="form-label">Data Inicial</label>
                    <input
                      type="date"
                      className="form-control"
                      value={financialForm.start_date}
                      onChange={(e) => setFinancialForm({...financialForm, start_date: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Data Final</label>
                    <input
                      type="date"
                      className="form-control"
                      value={financialForm.end_date}
                      onChange={(e) => setFinancialForm({...financialForm, end_date: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Formato</label>
                    <select
                      className="form-select"
                      value={financialForm.format}
                      onChange={(e) => setFinancialForm({...financialForm, format: e.target.value})}
                    >
                      <option value="excel">Excel (.xlsx)</option>
                      <option value="pdf">PDF (.pdf)</option>
                    </select>
                  </div>
                  
                  <button
                    className="btn btn-success w-100"
                    onClick={handleFinancialReport}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download me-2"></i>
                        Baixar Relatório
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Clients Report */}
            <div className="col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">👥 Relatório de Clientes</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">
                    Lista completa de clientes ativos com informações de contato e conformidade LGPD.
                  </p>
                  
                  <div className="mb-3">
                    <label className="form-label">Formato</label>
                    <select
                      className="form-select"
                      value={clientFormat}
                      onChange={(e) => setClientFormat(e.target.value)}
                    >
                      <option value="excel">Excel (.xlsx)</option>
                      <option value="pdf">PDF (.pdf)</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Inclui todos os clientes ativos cadastrados no sistema.
                    </small>
                  </div>
                  
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleClientReport}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download me-2"></i>
                        Baixar Relatório
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Appointments Report */}
            <div className="col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">📅 Relatório de Agendamentos</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">
                    Análise detalhada de agendamentos por período com status e barbeiros.
                  </p>
                  
                  <div className="mb-3">
                    <label className="form-label">Data Inicial</label>
                    <input
                      type="date"
                      className="form-control"
                      value={appointmentForm.start_date}
                      onChange={(e) => setAppointmentForm({...appointmentForm, start_date: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Data Final</label>
                    <input
                      type="date"
                      className="form-control"
                      value={appointmentForm.end_date}
                      onChange={(e) => setAppointmentForm({...appointmentForm, end_date: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Formato</label>
                    <select
                      className="form-select"
                      value={appointmentForm.format}
                      onChange={(e) => setAppointmentForm({...appointmentForm, format: e.target.value})}
                    >
                      <option value="excel">Excel (.xlsx)</option>
                      <option value="pdf">PDF (.pdf)</option>
                    </select>
                  </div>
                  
                  <button
                    className="btn btn-info w-100"
                    onClick={handleAppointmentReport}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download me-2"></i>
                        Baixar Relatório
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">ℹ️ Informações sobre Relatórios</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Formato Excel (.xlsx)</h6>
                      <ul className="list-unstyled text-muted">
                        <li>• Múltiplas planilhas com análises detalhadas</li>
                        <li>• Gráficos e tabelas interativas</li>
                        <li>• Dados estruturados para análise</li>
                        <li>• Formatação profissional</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6>Formato PDF (.pdf)</h6>
                      <ul className="list-unstyled text-muted">
                        <li>• Relatório consolidado em documento único</li>
                        <li>• Formatação para impressão</li>
                        <li>• Resumos executivos</li>
                        <li>• Fácil compartilhamento</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="alert alert-info mt-3">
                    <i className="fas fa-lightbulb me-2"></i>
                    <strong>Dica:</strong> Para análises detalhadas, recomendamos o formato Excel. 
                    Para apresentações e arquivamento, utilize o formato PDF.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;