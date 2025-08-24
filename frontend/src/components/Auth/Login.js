import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.senha);
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex">
      {/* Lado esquerdo - Imagem/Info */}
      <div 
        className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-white position-relative"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          backgroundImage: `url('https://pixabay.com/get/g6db67f61c55b6849b63e3fa1ef5408e5a7ebeb434739edd2789179736ad24e40c8a89cbc1679023b6c2e67889285f68e589701639be13b91fe50ba54bcaa0263_1280.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="text-center p-5">
          <div className="mb-4">
            <i className="fas fa-cut fa-4x mb-3"></i>
          </div>
          <h1 className="display-4 fw-bold mb-3">BarberShop</h1>
          <h4 className="mb-4">Sistema de Gestão Profissional</h4>
          <p className="lead mb-4">
            Gerencie agendamentos, clientes e vendas de forma simples e eficiente.
          </p>
          <div className="row text-center">
            <div className="col-4">
              <i className="fas fa-calendar-check fa-2x mb-2"></i>
              <p>Agendamentos</p>
            </div>
            <div className="col-4">
              <i className="fas fa-users fa-2x mb-2"></i>
              <p>Clientes</p>
            </div>
            <div className="col-4">
              <i className="fas fa-chart-line fa-2x mb-2"></i>
              <p>Relatórios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="col-md-6 d-flex flex-column justify-content-center p-5">
        <div className="mx-auto" style={{ maxWidth: '400px', width: '100%' }}>
          {/* Logo mobile */}
          <div className="text-center mb-4 d-md-none">
            <i className="fas fa-cut fa-3x text-primary mb-2"></i>
            <h2 className="fw-bold">BarberShop</h2>
          </div>

          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-4 fw-bold">
                Fazer Login
              </h3>

              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope me-2"></i>
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="senha" className="form-label">
                    <i className="fas fa-lock me-2"></i>
                    Senha
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Carregando...</span>
                      </span>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Entrar
                    </>
                  )}
                </button>
              </form>

              <hr className="my-4" />

              <div className="text-center text-muted">
                <small>
                  <i className="fas fa-shield-alt me-1"></i>
                  Sistema seguro e confiável
                </small>
              </div>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="text-center mt-4">
            <small className="text-muted">
              Desenvolvido com ❤️ para barbearias modernas
            </small>
          </div>

          {/* Demo credentials */}
          <div className="mt-4">
            <div className="card bg-light">
              <div className="card-body p-3">
                <h6 className="card-title mb-2">
                  <i className="fas fa-info-circle me-2"></i>
                  Credenciais de Demonstração
                </h6>
                <small className="text-muted">
                  <strong>Admin:</strong> admin@barbearia.com / admin123<br />
                  <strong>Barbeiro:</strong> barbeiro@barbearia.com / barbeiro123
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
