import React, { useState, useEffect } from 'react';

const PublicBooking = () => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clientData, setClientData] = useState({
    nome: '',
    email: '',
    telefone: '',
    aceite_lgpd: false
  });

  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    fetchServices();
    fetchBarbers();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE}/public/services`);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  };

  const fetchBarbers = async () => {
    try {
      const response = await fetch(`${API_BASE}/public/barbers`);
      const data = await response.json();
      setBarbers(data);
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
    }
  };

  const fetchAvailableSlots = async (barberId, date) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/public/availability/${barberId}?date_str=${date}`);
      const data = await response.json();
      setAvailableSlots(data);
    } catch (error) {
      setError('Erro ao carregar horários disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime || !clientData.nome || !clientData.email || !clientData.telefone || !clientData.aceite_lgpd) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        cliente: clientData,
        barbeiro_id: selectedBarber.id,
        servico_id: selectedService.id,
        data_hora: `${selectedDate}T${selectedTime}:00`,
        observacoes: ''
      };

      const response = await fetch(`${API_BASE}/public/book-appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Agendamento realizado com sucesso!');
        setStep(5);
      } else {
        setError(result.detail || 'Erro ao realizar agendamento');
      }
    } catch (error) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header text-center">
              <h1>✂️ Agendamento Online</h1>
              <div className="progress mt-3">
                <div className="progress-bar" style={{width: `${(step/5)*100}%`}}></div>
              </div>
            </div>
            <div className="card-body">

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {/* Step 1: Services */}
              {step === 1 && (
                <div>
                  <h3>Escolha o Serviço</h3>
                  <div className="row">
                    {services.map(service => (
                      <div key={service.id} className="col-md-6 mb-3">
                        <div 
                          className={`card ${selectedService?.id === service.id ? 'border-primary' : ''}`}
                          onClick={() => setSelectedService(service)}
                          style={{cursor: 'pointer'}}
                        >
                          <div className="card-body">
                            <h5>{service.nome}</h5>
                            <p>R$ {service.preco.toFixed(2)} - {service.duracao_minutos}min</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setStep(2)}
                    disabled={!selectedService}
                  >
                    Próximo
                  </button>
                </div>
              )}

              {/* Step 2: Barbers */}
              {step === 2 && (
                <div>
                  <h3>Escolha o Barbeiro</h3>
                  <div className="row">
                    {barbers.map(barber => (
                      <div key={barber.id} className="col-md-6 mb-3">
                        <div 
                          className={`card ${selectedBarber?.id === barber.id ? 'border-primary' : ''}`}
                          onClick={() => setSelectedBarber(barber)}
                          style={{cursor: 'pointer'}}
                        >
                          <div className="card-body text-center">
                            <i className="fas fa-user-circle fa-3x mb-2"></i>
                            <h5>{barber.nome}</h5>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-secondary me-2" onClick={() => setStep(1)}>Voltar</button>
                  <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!selectedBarber}>Próximo</button>
                </div>
              )}

              {/* Step 3: Date/Time */}
              {step === 3 && (
                <div>
                  <h3>Escolha Data e Horário</h3>
                  <div className="mb-3">
                    <label>Data:</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={selectedDate}
                      min={today}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime('');
                        if (selectedBarber && e.target.value) {
                          fetchAvailableSlots(selectedBarber.id, e.target.value);
                        }
                      }}
                    />
                  </div>
                  
                  {selectedDate && (
                    <div>
                      <label>Horários disponíveis:</label>
                      {loading ? (
                        <p>Carregando...</p>
                      ) : (
                        <div className="row">
                          {availableSlots.filter(slot => slot.available).map(slot => (
                            <div key={slot.datetime} className="col-3 mb-2">
                              <button
                                className={`btn btn-outline-primary w-100 ${selectedTime === slot.formatted_time ? 'active' : ''}`}
                                onClick={() => setSelectedTime(slot.formatted_time)}
                              >
                                {slot.formatted_time}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <button className="btn btn-secondary me-2" onClick={() => setStep(2)}>Voltar</button>
                    <button className="btn btn-primary" onClick={() => setStep(4)} disabled={!selectedTime}>Próximo</button>
                  </div>
                </div>
              )}

              {/* Step 4: Client Data */}
              {step === 4 && (
                <div>
                  <h3>Seus Dados</h3>
                  <div className="mb-3">
                    <label>Nome completo:</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={clientData.nome}
                      onChange={(e) => setClientData({...clientData, nome: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Email:</label>
                    <input 
                      type="email" 
                      className="form-control"
                      value={clientData.email}
                      onChange={(e) => setClientData({...clientData, email: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Telefone:</label>
                    <input 
                      type="tel" 
                      className="form-control"
                      value={clientData.telefone}
                      onChange={(e) => setClientData({...clientData, telefone: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        checked={clientData.aceite_lgpd}
                        onChange={(e) => setClientData({...clientData, aceite_lgpd: e.target.checked})}
                      />
                      <label className="form-check-label">
                        Aceito os termos de uso e política de privacidade
                      </label>
                    </div>
                  </div>
                  
                  <button className="btn btn-secondary me-2" onClick={() => setStep(3)}>Voltar</button>
                  <button 
                    className="btn btn-success" 
                    onClick={handleBookingSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Agendando...' : 'Confirmar Agendamento'}
                  </button>
                </div>
              )}

              {/* Step 5: Success */}
              {step === 5 && (
                <div className="text-center">
                  <i className="fas fa-check-circle fa-5x text-success mb-3"></i>
                  <h3>Agendamento Confirmado!</h3>
                  <p>Você receberá uma confirmação por email.</p>
                  <button className="btn btn-primary" onClick={() => {setStep(1); setSelectedService(null); setSelectedBarber(null); setSelectedDate(''); setSelectedTime(''); setClientData({nome: '', email: '', telefone: '', aceite_lgpd: false}); setSuccess('');}}>
                    Novo Agendamento
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;