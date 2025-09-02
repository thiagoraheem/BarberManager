import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const Cash = () => {
  const { user } = useAuth();
  const [cashStatus, setCashStatus] = useState(null);
  const [currentCash, setCurrentCash] = useState(null);
  const [cashHistory, setCashHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Form states
  const [openForm, setOpenForm] = useState({
    valor_inicial: 0,
    observacoes_abertura: ''
  });
  const [closeForm, setCloseForm] = useState({
    valor_final: 0,
    observacoes_fechamento: ''
  });

  useEffect(() => {
    loadCashData();
  }, []);

  const loadCashData = async () => {
    try {
      setLoading(true);
      
      // Check cash status
      const statusResponse = await api.get('/cash/status');
      setCashStatus(statusResponse.data);

      // If there's an open cash, load its details
      if (statusResponse.data.has_open_cash) {
        const currentResponse = await api.get('/cash/current');
        setCurrentCash(currentResponse.data);
      }

      // Load cash history
      const historyResponse = await api.get('/cash/');
      setCashHistory(historyResponse.data);

    } catch (error) {
      console.error('Erro ao carregar dados do caixa:', error);
      setError('Erro ao carregar dados do caixa');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCash = async () => {
    try {
      setLoading(true);
      setError('');

      await api.post('/cash/open', openForm);
      
      setSuccess('Caixa aberto com sucesso!');
      setShowOpenModal(false);
      setOpenForm({ valor_inicial: 0, observacoes_abertura: '' });
      
      // Reload data
      await loadCashData();

    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      setError(error.response?.data?.detail || 'Erro ao abrir caixa');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCash = async () => {
    try {
      setLoading(true);
      setError('');

      if (!currentCash) {
        setError('Nenhum caixa aberto encontrado');
        return;
      }

      await api.put(`/cash/${currentCash.id}/close`, closeForm);
      
      setSuccess('Caixa fechado com sucesso!');
      setShowCloseModal(false);
      setCloseForm({ valor_final: 0, observacoes_fechamento: '' });
      
      // Reload data
      await loadCashData();

    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      setError(error.response?.data?.detail || 'Erro ao fechar caixa');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading && !cashStatus) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '200px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">💰 Gestão de Caixa</h1>
            {!cashStatus?.has_open_cash ? (
              <button 
                className="btn btn-success"
                onClick={() => setShowOpenModal(true)}
              >
                <i className="fas fa-plus me-2"></i>Abrir Caixa
              </button>
            ) : (
              <button 
                className="btn btn-danger"
                onClick={() => setShowCloseModal(true)}
              >
                <i className="fas fa-lock me-2"></i>Fechar Caixa
              </button>
            )}
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

          {/* Current Cash Status */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Status Atual do Caixa</h5>
                  <span className={`badge ${cashStatus?.has_open_cash ? 'bg-success' : 'bg-secondary'}`}>
                    {cashStatus?.has_open_cash ? 'ABERTO' : 'FECHADO'}
                  </span>
                </div>
                <div className="card-body">
                  {currentCash ? (
                    <div className="row">
                      <div className="col-md-3">
                        <div className="text-center">
                          <h6>Valor Inicial</h6>
                          <h4 className="text-primary">{formatCurrency(currentCash.valor_inicial)}</h4>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h6>Vendas Dinheiro</h6>
                          <h4 className="text-success">{formatCurrency(currentCash.valor_vendas_dinheiro)}</h4>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h6>Vendas Cartão</h6>
                          <h4 className="text-info">{formatCurrency(currentCash.valor_vendas_cartao)}</h4>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h6>Vendas PIX</h6>
                          <h4 className="text-warning">{formatCurrency(currentCash.valor_vendas_pix)}</h4>
                        </div>
                      </div>
                      <div className="col-12 mt-3">
                        <div className="bg-light p-3 rounded">
                          <div className="row">
                            <div className="col-md-6">
                              <strong>Aberto em:</strong> {formatDateTime(currentCash.data_abertura)}
                            </div>
                            <div className="col-md-6">
                              <strong>Operador:</strong> {user?.nome}
                            </div>
                            {currentCash.observacoes_abertura && (
                              <div className="col-12 mt-2">
                                <strong>Observações:</strong> {currentCash.observacoes_abertura}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      <i className="fas fa-cash-register fa-3x mb-3 opacity-50"></i>
                      <p>Nenhum caixa aberto no momento</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cash History */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Histórico de Caixas</h5>
                </div>
                <div className="card-body">
                  {cashHistory.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Data Abertura</th>
                            <th>Data Fechamento</th>
                            <th>Valor Inicial</th>
                            <th>Valor Final</th>
                            <th>Vendas</th>
                            <th>Status</th>
                            <th>Diferença</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cashHistory.map(cash => {
                            const totalVendas = (cash.valor_vendas_dinheiro || 0) + (cash.valor_vendas_cartao || 0) + (cash.valor_vendas_pix || 0);
                            const expectedFinal = (cash.valor_inicial || 0) + (cash.valor_vendas_dinheiro || 0);
                            const difference = (cash.valor_final || 0) - expectedFinal;
                            
                            return (
                              <tr key={cash.id}>
                                <td>{formatDateTime(cash.data_abertura)}</td>
                                <td>{cash.data_fechamento ? formatDateTime(cash.data_fechamento) : '-'}</td>
                                <td>{formatCurrency(cash.valor_inicial)}</td>
                                <td>{cash.valor_final ? formatCurrency(cash.valor_final) : '-'}</td>
                                <td>{formatCurrency(totalVendas)}</td>
                                <td>
                                  <span className={`badge ${cash.status === 'aberto' ? 'bg-success' : 'bg-secondary'}`}>
                                    {cash.status.toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  {cash.status === 'fechado' && (
                                    <span className={`text-${difference >= 0 ? 'success' : 'danger'}`}>
                                      {formatCurrency(difference)}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      <p>Nenhum histórico de caixa encontrado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Open Cash Modal */}
      {showOpenModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Abrir Caixa</h5>
                <button type="button" className="btn-close" onClick={() => setShowOpenModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Valor Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={openForm.valor_inicial}
                    onChange={(e) => setOpenForm({...openForm, valor_inicial: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Observações</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={openForm.observacoes_abertura}
                    onChange={(e) => setOpenForm({...openForm, observacoes_abertura: e.target.value})}
                    placeholder="Observações opcionais sobre a abertura do caixa"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOpenModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-success" onClick={handleOpenCash} disabled={loading}>
                  {loading ? 'Abrindo...' : 'Abrir Caixa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Cash Modal */}
      {showCloseModal && currentCash && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Fechar Caixa</h5>
                <button type="button" className="btn-close" onClick={() => setShowCloseModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-12">
                    <div className="alert alert-info">
                      <h6>Resumo do Caixa</h6>
                      <div className="row">
                        <div className="col-6">Valor Inicial: {formatCurrency(currentCash.valor_inicial)}</div>
                        <div className="col-6">Vendas Dinheiro: {formatCurrency(currentCash.valor_vendas_dinheiro)}</div>
                      </div>
                      <div className="row">
                        <div className="col-6">Vendas Cartão: {formatCurrency(currentCash.valor_vendas_cartao)}</div>
                        <div className="col-6">Vendas PIX: {formatCurrency(currentCash.valor_vendas_pix)}</div>
                      </div>
                      <hr />
                      <strong>
                        Valor Esperado: {formatCurrency((currentCash.valor_inicial || 0) + (currentCash.valor_vendas_dinheiro || 0))}
                      </strong>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Valor Final no Caixa *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={closeForm.valor_final}
                    onChange={(e) => setCloseForm({...closeForm, valor_final: parseFloat(e.target.value) || 0})}
                    placeholder="Conte o dinheiro em caixa"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Observações de Fechamento</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={closeForm.observacoes_fechamento}
                    onChange={(e) => setCloseForm({...closeForm, observacoes_fechamento: e.target.value})}
                    placeholder="Observações sobre o fechamento (diferenças, problemas, etc.)"
                  ></textarea>
                </div>
                
                {closeForm.valor_final !== 0 && (
                  <div className="alert alert-warning">
                    <strong>Diferença: </strong>
                    {formatCurrency(closeForm.valor_final - ((currentCash.valor_inicial || 0) + (currentCash.valor_vendas_dinheiro || 0)))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={handleCloseCash} disabled={loading || closeForm.valor_final === 0}>
                  {loading ? 'Fechando...' : 'Fechar Caixa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cash;