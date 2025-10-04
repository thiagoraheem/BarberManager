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
      cancelado: 'error'
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
          <div className="d-flex justify-between align-center">
            <div>
              <h1 className="text-2xl mb-1 text-bold text-dark">📅 Agendamentos</h1>
              <p className="text-light mb-0">Gerencie os agendamentos da barbearia</p>
            </div>
            <button 
              className="modern-btn-primary"
              onClick={openNewAppointmentModal}
            >
              <i className="fas fa-plus mr-2"></i>
              Novo Agendamento
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="main-card mb-4 slide-in-up">
        <div className="p-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label text-dark text-semibold">Data</label>
              <input
                type="date"
                className="modern-input"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label text-dark text-semibold">Barbeiro</label>
              <select
                className="modern-input"
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
              <label className="form-label text-dark text-semibold">Status</label>
              <select
                className="modern-input"
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
            <div className="col-md-3 d-flex align-end">
              <button 
                className="modern-btn-outline w-full hover-lift transition"
                onClick={loadAppointments}
              >
                <i className="fas fa-search mr-2"></i>
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div className="main-card slide-in-up">
        <div className="card-header d-flex justify-between align-center p-4 border-b border-white-border">
          <h5 className="mb-0 text-dark text-semibold">Lista de Agendamentos</h5>
          <span className="badge bg-primary text-white px-3 py-1 rounded text-sm">{appointments.length} agendamentos</span>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mb-3"></div>
              <p className="text-dark">Carregando agendamentos...</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="modern-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th className="text-dark text-semibold">Cliente</th>
                    <th className="text-dark text-semibold">Barbeiro</th>
                    <th className="text-dark text-semibold">Serviço</th>
                    <th className="text-dark text-semibold">Data/Hora</th>
                    <th className="text-dark text-semibold">Status</th>
                    <th className="text-dark text-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
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
                          <div>
                            <div className="text-semibold text-dark">{appointment.cliente?.nome}</div>
                            <small className="text-light">{appointment.cliente?.telefone}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-dark">{appointment.barbeiro?.nome}</td>
                      <td>
                        <div>
                          <div className="text-dark">{appointment.servico?.nome}</div>
                          <small className="text-light">{appointment.servico?.duracao_minutos}min</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="text-dark">{formatDate(appointment.data_hora)}</div>
                          <small className="text-light">
                            {formatAppointmentTimeRange(appointment.data_hora, appointment.servico?.duracao_minutos)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="dropdown">
                          <button 
                            className={`badge bg-${getStatusColor(appointment.status)} text-white px-2 py-1 rounded text-xs cursor-pointer hover-opacity transition`}
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            {getStatusLabel(appointment.status)}
                          </button>
                          <ul className="dropdown-menu shadow-lg border-0 rounded-lg">
                            <li><button className="dropdown-item hover-bg-light transition" onClick={() => handleStatusChange(appointment.id, 'agendado')}>Agendado</button></li>
                            <li><button className="dropdown-item hover-bg-light transition" onClick={() => handleStatusChange(appointment.id, 'confirmado')}>Confirmado</button></li>
                            <li><button className="dropdown-item hover-bg-light transition" onClick={() => handleStatusChange(appointment.id, 'em_andamento')}>Em Andamento</button></li>
                            <li><button className="dropdown-item hover-bg-light transition" onClick={() => handleStatusChange(appointment.id, 'concluido')}>Concluído</button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item text-error hover-bg-light transition" onClick={() => handleStatusChange(appointment.id, 'cancelado')}>Cancelar</button></li>
                          </ul>
                        </div>
                      </td>
                      <td>
                        <button 
                          className="modern-btn-outline text-sm px-3 py-1 hover-lift transition"
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
            <div className="text-center py-8">
              <i className="fas fa-calendar-times text-4xl text-light mb-3"></i>
              <h5 className="text-light mb-2">Nenhum agendamento encontrado</h5>
              <p className="text-light">Use os filtros acima ou crie um novo agendamento.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Agendamento */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="main-card">
              <div className="card-header d-flex justify-between align-center p-4 border-b border-white-border">
                <h5 className="text-dark text-semibold">
                  {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h5>
                <button 
                  type="button" 
                  className="modern-btn-outline text-sm px-2 py-1"
                  onClick={() => setShowModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-dark text-semibold">Cliente *</label>
                      <select
                        className="modern-input"
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
                      <label className="form-label text-dark text-semibold">Barbeiro *</label>
                      <select
                        className="modern-input"
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
                      <label className="form-label text-dark text-semibold">Serviço *</label>
                      <select
                        className="modern-input"
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
                      <label className="form-label text-dark text-semibold">Data e Hora *</label>
                      <input
                        type="datetime-local"
                        className="modern-input"
                        value={formData.data_hora}
                        onChange={(e) => setFormData({...formData, data_hora: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-dark text-semibold">Observações</label>
                      <textarea
                        className="modern-input"
                        rows="3"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                        placeholder="Observações adicionais sobre o agendamento..."
                      />
                    </div>
                  </div>
                </div>
                <div className="card-footer d-flex justify-end gap-3 p-4 border-t border-white-border">
                  <button 
                    type="button" 
                    className="modern-btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="modern-btn-primary">
                    <i className="fas fa-save mr-2"></i>
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
