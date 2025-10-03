import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    setError('');

    // Validação inicial antes de chamar o login
    if (!formData.email || !formData.password) {
      setError('Por favor, preencha email e senha');
      return;
    }

    setLoading(true);

    try {
      console.log('Dados de login:', { email: formData.email, password: formData.password });
      
      // Passar os dados do formulário corretamente
      const result = await login(formData.email, formData.password);
      console.log('Resultado do login:', result);
      
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        // Exibir a mensagem de erro corretamente
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || 'Erro no login. Tente novamente';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Erro no login:', err);
      // Exibir mensagem de erro genérica em caso de erro inesperado
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">
      {/* Background com animação */}
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      {/* Container principal */}
      <div className={`login-content ${isVisible ? 'visible' : ''}`}>
        <div className="row min-vh-100 g-0">
          
          {/* Lado esquerdo - Branding */}
          <div className="col-lg-6 d-none d-lg-flex">
            <div className="brand-section">
              <div className="brand-content">
                <div className="brand-logo">
                  <div className="logo-icon">
                    <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="45" fill="url(#gradient1)" />
                      <path d="M30 40 L70 40 M35 50 L65 50 M40 60 L60 60" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#667eea" />
                          <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h1 className="brand-title">BarberManager</h1>
                  <p className="brand-subtitle">Sistema de Gestão Profissional</p>
                </div>

                <div className="features-grid">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <h3>Agendamentos</h3>
                    <p>Controle total da sua agenda</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="fas fa-users"></i>
                    </div>
                    <h3>Clientes</h3>
                    <p>Gestão completa de clientes</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <h3>Relatórios</h3>
                    <p>Análises e métricas detalhadas</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="fas fa-cash-register"></i>
                    </div>
                    <h3>Vendas</h3>
                    <p>PDV integrado e eficiente</p>
                  </div>
                </div>

                <div className="testimonial">
                  <blockquote>
                    "Revolucionou a forma como gerencio minha barbearia. Simples, eficiente e completo!"
                  </blockquote>
                  <cite>— João Silva, Barbearia Premium</cite>
                </div>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário */}
          <div className="col-lg-6 d-flex align-items-center justify-content-center">
            <div className="form-section">
              
              {/* Logo mobile */}
              <div className="mobile-logo d-lg-none">
                <div className="logo-icon-small">
                  <svg width="50" height="50" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="45" fill="url(#gradient2)" />
                    <path d="M30 40 L70 40 M35 50 L65 50 M40 60 L60 60" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h2>BarberManager</h2>
              </div>

              {/* Formulário de login */}
              <div className="login-form">
                <div className="form-header">
                  <h3>Bem-vindo de volta!</h3>
                  <p>Entre com suas credenciais para acessar o sistema</p>
                </div>

                {error && (
                  <div className="alert alert-danger custom-alert">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{typeof error === 'string' ? error : 'Erro no login'}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      <i className="fas fa-envelope"></i>
                      Email
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="email"
                        className="form-control modern-input"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="seu@email.com"
                        autoComplete="email"
                      />
                      <div className="input-focus-border"></div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      <i className="fas fa-lock"></i>
                      Senha
                    </label>
                    <div className="input-wrapper password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control modern-input"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                      <div className="input-focus-border"></div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary modern-btn w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner"></div>
                        <span>Entrando...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt"></i>
                        <span>Entrar no Sistema</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Credenciais de demonstração */}
                <div className="demo-credentials">
                  <div className="demo-header">
                    <i className="fas fa-info-circle"></i>
                    <span>Credenciais de Demonstração</span>
                  </div>
                  <div className="demo-list">
                    <div className="demo-item">
                      <strong>Administrador:</strong>
                      <span>admin@barbearia.com / admin123</span>
                    </div>
                    <div className="demo-item">
                      <strong>Barbeiro:</strong>
                      <span>barbeiro@barbearia.com / barbeiro123</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="login-footer">
                  <div className="security-badge">
                    <i className="fas fa-shield-alt"></i>
                    <span>Conexão segura e criptografada</span>
                  </div>
                  <div className="copyright">
                    <small>© 2025 BarberManager. Desenvolvido com ❤️ para barbearias modernas.</small>
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

export default Login;