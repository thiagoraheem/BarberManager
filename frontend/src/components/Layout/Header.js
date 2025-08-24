import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar horário a cada segundo
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR');
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <header className="header">
      <div className="d-flex justify-content-between align-items-center w-100">
        {/* Saudação e informações */}
        <div>
          <h4 className="mb-1 fw-bold">
            {getGreeting()}, {user?.nome?.split(' ')[0]}! 👋
          </h4>
          <p className="mb-0 text-muted">
            <i className="fas fa-calendar-day me-2"></i>
            {formatDate(currentTime)}
          </p>
        </div>

        {/* Área direita - controles */}
        <div className="d-flex align-items-center gap-3">
          {/* Horário atual */}
          <div className="text-end d-none d-md-block">
            <div className="fw-bold text-primary">{formatTime(currentTime)}</div>
            <small className="text-muted">Horário atual</small>
          </div>

          {/* Notificações */}
          <div className="position-relative">
            <button className="btn btn-outline-secondary position-relative">
              <i className="fas fa-bell"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
                <span className="visually-hidden">notificações não lidas</span>
              </span>
            </button>
          </div>

          {/* Toggle de tema */}
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
          >
            <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>

          {/* Menu do usuário */}
          <div className="dropdown">
            <button 
              className="btn btn-outline-primary dropdown-toggle d-flex align-items-center"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="fas fa-user-circle me-2"></i>
              <span className="d-none d-md-inline">{user?.nome}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-item-text">
                  <div className="fw-bold">{user?.nome}</div>
                  <small className="text-muted">{user?.email}</small>
                </span>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item" href="/configuracoes">
                  <i className="fas fa-user-cog me-2"></i>
                  Meu Perfil
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="/configuracoes">
                  <i className="fas fa-cog me-2"></i>
                  Configurações
                </a>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item text-danger" href="#">
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Sair
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
