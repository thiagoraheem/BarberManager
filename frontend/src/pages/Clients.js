import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { formatDate, formatCPF, formatPhone } from '../utils/formatters';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    data_nascimento: '',
    endereco: '',
    observacoes: '',
    aceite_lgpd: false
  });

  useEffect(() => {
    loadClients();
  }, [searchTerm]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/clients?${params}`);
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const clientData = {
        ...formData,
        data_nascimento: formData.data_nascimento ? new Date(formData.data_nascimento).toISOString() : null
      };

      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, clientData);
      } else {
        await api.post('/clients', clientData);
      }

      setShowModal(false);
      setEditingClient(null);
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Tente novamente.');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      nome: client.nome || '',
      email: client.email || '',
      telefone: client.telefone || '',
      cpf: client.cpf || '',
      data_nascimento: client.data_nascimento ? client.data_nascimento.split('T')[0] : '',
      endereco: client.endereco || '',
      observacoes: client.observacoes || '',
      aceite_lgpd: client.aceite_lgpd || false
    });
    setShowModal(true);
  };

  const handleDeactivate = async (clientId) => {
    if (window.confirm('Tem certeza que deseja desativar este cliente? Esta ação está relacionada à conformidade LGPD.')) {
      try {
        await api.delete(`/clients/${clientId}`);
        loadClients();
      } catch (error) {
        console.error('Erro ao desativar cliente:', error);
        alert('Erro ao desativar cliente. Tente novamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      data_nascimento: '',
      endereco: '',
      observacoes: '',
      aceite_lgpd: false
    });
  };

  const openNewClientModal = () => {
    resetForm();
    setEditingClient(null);
    setShowModal(true);
  };

  const handlePhoneChange = (e) => {
    const value = formatPhone(e.target.value);
    setFormData({...formData, telefone: value});
  };

  const handleCPFChange = (e) => {
    const value = formatCPF(e.target.value);
    setFormData({...formData, cpf: value});
  };

  return (
    <div className="container-fluid fade-in">
      {/* Cabeçalho */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1 fw-bold">👥 Clientes</h1>
              <p className="text-muted mb-0">Gerencie os clientes da barbearia</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={openNewClientModal}
            >
              <i className="fas fa-user-plus me-2"></i>
              Novo Cliente
            </button>
          </div>
        </div>
      </div>

      {/* Pesquisa */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Pesquisar Cliente</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-times me-2"></i>
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista de Clientes</h5>
          <span className="badge bg-primary">{clients.length} clientes</span>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary mb-3"></div>
              <p>Carregando clientes...</p>
            </div>
          ) : clients.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Contato</th>
                    <th>CPF</th>
                    <th>Data Nascimento</th>
                    <th>LGPD</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar me-3">
                            <div 
                              className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                              style={{ width: '40px', height: '40px' }}
                            >
                              {client.nome.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="fw-semibold">{client.nome}</div>
                            {client.observacoes && (
                              <small className="text-muted">
                                <i className="fas fa-sticky-note me-1"></i>
                                Tem observações
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          {client.telefone && (
                            <div>
                              <i className="fas fa-phone me-1 text-muted"></i>
                              {client.telefone}
                            </div>
                          )}
                          {client.email && (
                            <div>
                              <i className="fas fa-envelope me-1 text-muted"></i>
                              {client.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {client.cpf || 'Não informado'}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">
                          {client.data_nascimento ? formatDate(client.data_nascimento) : 'Não informado'}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${client.aceite_lgpd ? 'bg-success' : 'bg-warning'}`}>
                          {client.aceite_lgpd ? 'Aceito' : 'Pendente'}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatDate(client.criado_em)}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(client)}
                            title="Editar cliente"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleDeactivate(client.id)}
                            title="Desativar cliente (LGPD)"
                          >
                            <i className="fas fa-user-slash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-users-slash fa-4x text-muted mb-3"></i>
              <h5 className="text-muted">Nenhum cliente encontrado</h5>
              <p className="text-muted">
                {searchTerm ? 'Tente ajustar sua pesquisa.' : 'Cadastre o primeiro cliente da barbearia.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cliente */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nome Completo *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        required
                        placeholder="Nome completo do cliente"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Telefone *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.telefone}
                        onChange={handlePhoneChange}
                        required
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">CPF</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.cpf}
                        onChange={handleCPFChange}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Data de Nascimento</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.data_nascimento}
                        onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Endereço</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.endereco}
                        onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                        placeholder="Endereço completo"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Observações</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                        placeholder="Observações sobre o cliente, preferências, alergias, etc."
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="aceite_lgpd"
                          checked={formData.aceite_lgpd}
                          onChange={(e) => setFormData({...formData, aceite_lgpd: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="aceite_lgpd">
                          <strong>Aceite LGPD</strong>
                          <br />
                          <small className="text-muted">
                            O cliente autoriza o tratamento de seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD).
                          </small>
                        </label>
                      </div>
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
                    Salvar Cliente
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

export default Clients;
