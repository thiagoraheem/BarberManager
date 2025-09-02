import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { formatDate, formatTime, formatAppointmentTimeRange } from '../utils/formatters';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    barbeiro_id: '',
    status: ''
  });
  const [formData, setFormData] = useState({
    cliente_id: '',
    barbeiro_id: '',
    servico_id: '',
    data_hora: '',
    observacoes: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [clientsRes, barbersRes, servicesRes] = await Promise.all([
        api.get('/clients'),
        api.get('/users/barbeiros/list'),
        api.get('/services')
      ]);
      
      setClients(clientsRes.data);
      setBarbers(barbersRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.date) params.append('date_filter', filters.date);
      if (filters.barbeiro_id) params.append('barbeiro_id', filters.barbeiro_id);
      
      const response = await api.get(`/appointments?${params}`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const appointmentData = {
        ...formData,
        cliente_id: parseInt(formData.cliente_id),
        barbeiro_id: parseInt(formData.barbeiro_id),
        servico_id: parseInt(formData.servico_id),
        data_hora: new Date(formData.data_hora).toISOString()
      };

      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.id}`, appointmentData);
      } else {
        await api.post('/appointments', appointmentData);
      }

      setShowModal(false);
      setEditingAppointment(null);
      resetForm();
      loadAppointments();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento. Tente novamente.');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      cliente_id: appointment.cliente_id,
      barbeiro_id: appointment.barbeiro_id,
      servico_id: appointment.servico_id,
      data_hora: new Date(appointment.data_hora).toISOString().slice(0, 16),
      observacoes: appointment.observacoes || ''
    });
    setShowModal(true);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      loadAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      barbeiro_id: '',
      servico_id: '',
      data_hora: '',
      observacoes: ''
    });
  };

  const openNewAppointmentModal = () => {
    resetForm();
    setEditingAppointment(null);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      agendado: 'info',
      confirmado: 'success',
      em_andamento: 'warning',
      concluido: 'primary',
      cancelado: 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  return (
    <div className="container-fluid fade-in">
      {/* Cabeçalho */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1 fw-bold">📅 Agendamentos</h1>
              <p className="text-muted mb-0">Gerencie os agendamentos da barbearia</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={openNewAppointmentModal}
            >
              <i className="fas fa-plus me-2"></i>
              Novo Agendamento
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Data</label>
              <input
                type="date"
                className="form-control"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Barbeiro</label>
              <select
                className="form-select"
                value={filters.barbeiro_id}
                onChange={(e) => setFilters({...filters, barbeiro_id: e.target.value})}
              >
                <option value="">Todos os barbeiros</option>
                {barbers.map(barber => (
                  <option key={barber.id} value={barber.id}>{barber.nome}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Todos os status</option>
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button 
                className="btn btn-outline-primary w-100"
                onClick={loadAppointments}
              >
                <i className="fas fa-search me-2"></i>
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista de Agendamentos</h5>
          <span className="badge bg-primary">{appointments.length} agendamentos</span>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary mb-3"></div>
              <p>Carregando agendamentos...</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Barbeiro</th>
                    <th>Serviço</th>
                    <th>Data/Hora</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
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
                          <div>
                            <div className="fw-semibold">{appointment.cliente?.nome}</div>
                            <small className="text-muted">{appointment.cliente?.telefone}</small>
                          </div>
                        </div>
                      </td>
                      <td>{appointment.barbeiro?.nome}</td>
                      <td>
                        <div>
                          <div>{appointment.servico?.nome}</div>
                          <small className="text-muted">{appointment.servico?.duracao_minutos}min</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div>{formatDate(appointment.data_hora)}</div>
                          <small className="text-muted">
                            {formatAppointmentTimeRange(appointment.data_hora, appointment.servico?.duracao_minutos)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="dropdown">
                          <button 
                            className={`btn btn-sm btn-${getStatusColor(appointment.status)} dropdown-toggle`}
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            {getStatusLabel(appointment.status)}
                          </button>
                          <ul className="dropdown-menu">
                            <li><button className="dropdown-item" onClick={() => handleStatusChange(appointment.id, 'agendado')}>Agendado</button></li>
                            <li><button className="dropdown-item" onClick={() => handleStatusChange(appointment.id, 'confirmado')}>Confirmado</button></li>
                            <li><button className="dropdown-item" onClick={() => handleStatusChange(appointment.id, 'em_andamento')}>Em Andamento</button></li>
                            <li><button className="dropdown-item" onClick={() => handleStatusChange(appointment.id, 'concluido')}>Concluído</button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item text-danger" onClick={() => handleStatusChange(appointment.id, 'cancelado')}>Cancelar</button></li>
                          </ul>
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEdit(appointment)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-calendar-times fa-4x text-muted mb-3"></i>
              <h5 className="text-muted">Nenhum agendamento encontrado</h5>
              <p className="text-muted">Use os filtros acima ou crie um novo agendamento.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Agendamento */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
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
                      <label className="form-label">Cliente *</label>
                      <select
                        className="form-select"
                        value={formData.cliente_id}
                        onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                        required
                      >
                        <option value="">Selecione o cliente</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Barbeiro *</label>
                      <select
                        className="form-select"
                        value={formData.barbeiro_id}
                        onChange={(e) => setFormData({...formData, barbeiro_id: e.target.value})}
                        required
                      >
                        <option value="">Selecione o barbeiro</option>
                        {barbers.map(barber => (
                          <option key={barber.id} value={barber.id}>{barber.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Serviço *</label>
                      <select
                        className="form-select"
                        value={formData.servico_id}
                        onChange={(e) => setFormData({...formData, servico_id: e.target.value})}
                        required
                      >
                        <option value="">Selecione o serviço</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.nome} - R$ {service.preco.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Data e Hora *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.data_hora}
                        onChange={(e) => setFormData({...formData, data_hora: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Observações</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                        placeholder="Observações adicionais sobre o agendamento..."
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
                    Salvar Agendamento
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

export default Appointments;
