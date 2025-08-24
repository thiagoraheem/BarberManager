import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    duracao_minutos: ''
  });
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const serviceData = {
        ...formData,
        preco: parseFloat(formData.preco),
        duracao_minutos: parseInt(formData.duracao_minutos)
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, serviceData);
      } else {
        await api.post('/services', serviceData);
      }

      setShowModal(false);
      setEditingService(null);
      resetForm();
      loadServices();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      alert('Erro ao salvar serviço. Tente novamente.');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      nome: service.nome,
      descricao: service.descricao || '',
      preco: service.preco.toString(),
      duracao_minutos: service.duracao_minutos.toString()
    });
    setShowModal(true);
  };

  const handleToggleActive = async (serviceId, currentStatus) => {
    try {
      await api.put(`/services/${serviceId}`, { ativo: !currentStatus });
      loadServices();
    } catch (error) {
      console.error('Erro ao alterar status do serviço:', error);
      alert('Erro ao alterar status do serviço. Tente novamente.');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco: '',
      duracao_minutos: ''
    });
  };

  const openNewServiceModal = () => {
    resetForm();
    setEditingService(null);
    setShowModal(true);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  };

  return (
    <div className="container-fluid fade-in">
      {/* Cabeçalho */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1 fw-bold">✂️ Serviços</h1>
              <p className="text-muted mb-0">Gerencie os serviços oferecidos pela barbearia</p>
            </div>
            {isAdmin && (
              <button 
                className="btn btn-primary"
                onClick={openNewServiceModal}
              >
                <i className="fas fa-plus me-2"></i>
                Novo Serviço
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title opacity-75">Serviços Ativos</h6>
                  <h3 className="mb-0">{services.filter(s => s.ativo).length}</h3>
                </div>
                <div className="opacity-75">
                  <i className="fas fa-cut fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title opacity-75">Preço Médio</h6>
                  <h3 className="mb-0">
                    {formatCurrency(services.length > 0 ? services.reduce((sum, s) => sum + s.preco, 0) / services.length : 0)}
                  </h3>
                </div>
                <div className="opacity-75">
                  <i className="fas fa-dollar-sign fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title opacity-75">Duração Média</h6>
                  <h3 className="mb-0">
                    {services.length > 0 ? 
                      formatDuration(Math.round(services.reduce((sum, s) => sum + s.duracao_minutos, 0) / services.length)) : 
                      '0min'
                    }
                  </h3>
                </div>
                <div className="opacity-75">
                  <i className="fas fa-clock fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title opacity-75">Maior Preço</h6>
                  <h3 className="mb-0">
                    {formatCurrency(services.length > 0 ? Math.max(...services.map(s => s.preco)) : 0)}
                  </h3>
                </div>
                <div className="opacity-75">
                  <i className="fas fa-crown fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista de Serviços</h5>
          <span className="badge bg-primary">{services.length} serviços</span>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary mb-3"></div>
              <p>Carregando serviços...</p>
            </div>
          ) : services.length > 0 ? (
            <div className="row">
              {services.map((service) => (
                <div key={service.id} className="col-lg-4 col-md-6 mb-4">
                  <div className={`card h-100 ${!service.ativo ? 'opacity-50' : ''}`}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0">{service.nome}</h5>
                        <span className={`badge ${service.ativo ? 'bg-success' : 'bg-secondary'}`}>
                          {service.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      
                      {service.descricao && (
                        <p className="card-text text-muted mb-3">{service.descricao}</p>
                      )}
                      
                      <div className="row text-center mb-3">
                        <div className="col-6">
                          <div className="border-end">
                            <h4 className="text-primary mb-1">{formatCurrency(service.preco)}</h4>
                            <small className="text-muted">Preço</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <h4 className="text-success mb-1">{formatDuration(service.duracao_minutos)}</h4>
                          <small className="text-muted">Duração</small>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-outline-primary btn-sm flex-grow-1"
                            onClick={() => handleEdit(service)}
                          >
                            <i className="fas fa-edit me-1"></i>
                            Editar
                          </button>
                          <button 
                            className={`btn btn-sm ${service.ativo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => handleToggleActive(service.id, service.ativo)}
                          >
                            <i className={`fas ${service.ativo ? 'fa-eye-slash' : 'fa-eye'} me-1`}></i>
                            {service.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-cut fa-4x text-muted mb-3"></i>
              <h5 className="text-muted">Nenhum serviço cadastrado</h5>
              <p className="text-muted">
                {isAdmin ? 'Cadastre o primeiro serviço da barbearia.' : 'Ainda não há serviços cadastrados.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Serviço */}
      {showModal && isAdmin && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome do Serviço *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                      placeholder="Ex: Corte Masculino"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descrição</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      placeholder="Descreva o serviço oferecido..."
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Preço (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={formData.preco}
                        onChange={(e) => setFormData({...formData, preco: e.target.value})}
                        required
                        placeholder="0,00"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Duração (minutos) *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={formData.duracao_minutos}
                        onChange={(e) => setFormData({...formData, duracao_minutos: e.target.value})}
                        required
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    Salvar Serviço
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
