import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const POS = () => {
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [discount, setDiscount] = useState(0);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [servicesRes, clientsRes, paymentMethodsRes] = await Promise.all([
        api.get('/services?active_only=true'),
        api.get('/clients'),
        api.get('/pos/payment-methods')
      ]);
      
      setServices(servicesRes.data);
      setClients(clientsRes.data);
      setPaymentMethods(paymentMethodsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (service) => {
    const existingItem = cart.find(item => item.servico_id === service.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.servico_id === service.id 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        servico_id: service.id,
        nome: service.nome,
        preco_unitario: service.preco,
        quantidade: 1
      }]);
    }
  };

  const updateQuantity = (servicoId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(servicoId);
      return;
    }
    
    setCart(cart.map(item => 
      item.servico_id === servicoId 
        ? { ...item, quantidade: newQuantity }
        : item
    ));
  };

  const removeFromCart = (servicoId) => {
    setCart(cart.filter(item => item.servico_id !== servicoId));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.preco_unitario * item.quantidade), 0);
  };

  const getTotal = () => {
    return getSubtotal() - discount;
  };

  const handleSale = async () => {
    if (cart.length === 0) {
      alert('Adicione pelo menos um serviço ao carrinho.');
      return;
    }
    
    if (!paymentMethod) {
      alert('Selecione um método de pagamento.');
      return;
    }

    try {
      setProcessing(true);
      
      const saleData = {
        cliente_id: selectedClient || null,
        itens: cart.map(item => ({
          servico_id: item.servico_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        })),
        desconto: discount,
        metodo_pagamento: paymentMethod,
        observacoes: observations || null
      };

      await api.post('/pos/sale', saleData);
      
      // Limpar formulário
      setCart([]);
      setSelectedClient('');
      setPaymentMethod('');
      setDiscount(0);
      setObservations('');
      
      alert('Venda realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao realizar venda:', error);
      alert('Erro ao realizar venda. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const clearCart = () => {
    if (window.confirm('Deseja limpar o carrinho?')) {
      setCart([]);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <h5>Carregando POS...</h5>
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
              <h1 className="h3 mb-1 fw-bold">💰 Ponto de Venda (POS)</h1>
              <p className="text-muted mb-0">Sistema de vendas da barbearia</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-danger"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                <i className="fas fa-trash me-2"></i>
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Serviços Disponíveis */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-cut me-2"></i>
                Serviços Disponíveis
              </h5>
            </div>
            <div className="card-body">
              {services.length > 0 ? (
                <div className="row">
                  {services.map((service) => (
                    <div key={service.id} className="col-md-6 col-lg-4 mb-3">
                      <div 
                        className="card h-100 service-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => addToCart(service)}
                      >
                        <div className="card-body text-center">
                          <i className="fas fa-cut fa-2x text-primary mb-2"></i>
                          <h6 className="card-title">{service.nome}</h6>
                          <p className="card-text text-muted small">
                            {service.duracao_minutos} minutos
                          </p>
                          <h5 className="text-primary mb-0">
                            {formatCurrency(service.preco)}
                          </h5>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-cut fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Nenhum serviço disponível</h5>
                  <p className="text-muted">Configure os serviços primeiro.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carrinho e Checkout */}
        <div className="col-lg-4">
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-shopping-cart me-2"></i>
                Carrinho
              </h5>
              <span className="badge bg-primary">{cart.length} itens</span>
            </div>
            <div className="card-body">
              {cart.length > 0 ? (
                <>
                  {cart.map((item) => (
                    <div key={item.servico_id} className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.nome}</h6>
                        <small className="text-muted">
                          {formatCurrency(item.preco_unitario)} x {item.quantidade}
                        </small>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="input-group input-group-sm me-2" style={{ width: '100px' }}>
                          <button 
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => updateQuantity(item.servico_id, item.quantidade - 1)}
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                          <input 
                            type="number" 
                            className="form-control text-center"
                            value={item.quantidade}
                            onChange={(e) => updateQuantity(item.servico_id, parseInt(e.target.value) || 0)}
                            min="0"
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => updateQuantity(item.servico_id, item.quantidade + 1)}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFromCart(item.servico_id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2">
                    <div className="d-flex justify-content-between">
                      <span>Subtotal:</span>
                      <strong>{formatCurrency(getSubtotal())}</strong>
                    </div>
                    {discount > 0 && (
                      <div className="d-flex justify-content-between text-success">
                        <span>Desconto:</span>
                        <strong>-{formatCurrency(discount)}</strong>
                      </div>
                    )}
                    <hr />
                    <div className="d-flex justify-content-between">
                      <span><strong>Total:</strong></span>
                      <h5 className="text-primary mb-0">
                        <strong>{formatCurrency(getTotal())}</strong>
                      </h5>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Carrinho vazio</p>
                </div>
              )}
            </div>
          </div>

          {/* Dados da Venda */}
          {cart.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-receipt me-2"></i>
                  Finalizar Venda
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Cliente (opcional)</label>
                  <select
                    className="form-select"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                  >
                    <option value="">Selecione o cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Método de Pagamento *</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="">Selecione o método</option>
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Desconto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={getSubtotal()}
                    className="form-control"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Observações</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Observações sobre a venda..."
                  />
                </div>

                <button 
                  className="btn btn-success w-100 fw-bold"
                  onClick={handleSale}
                  disabled={processing || cart.length === 0 || !paymentMethod}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card me-2"></i>
                      Finalizar Venda - {formatCurrency(getTotal())}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POS;
