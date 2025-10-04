import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/', icon: 'fas fa-chart-dashboard', label: 'Dashboard' },
    { path: '/agendamentos', icon: 'fas fa-calendar-alt', label: 'Agendamentos' },
    { path: '/clientes', icon: 'fas fa-users', label: 'Clientes' },
    { path: '/servicos', icon: 'fas fa-cut', label: 'Serviços' },
    { path: '/pos', icon: 'fas fa-cash-register', label: 'Ponto de Venda' },
    { path: '/caixa', icon: 'fas fa-money-bill-wave', label: 'Gestão de Caixa' },
    { path: '/relatorios', icon: 'fas fa-chart-bar', label: 'Relatórios' },
    { path: '/configuracoes', icon: 'fas fa-cog', label: 'Configurações' }
  ];

  const roleLabels = {
    admin: 'Administrador',
    barbeiro: 'Barbeiro',
    recepcionista: 'Recepcionista'
  };

  return (
    <div className="sidebar">
      {/* Logo e título */}
      <div className="p-4 border-bottom border-white-border">
        <div className="d-flex align-items-center">
          <div className="me-3">
            <i className="fas fa-cut fa-2x text-primary"></i>
          </div>
          <div>
            <h5 className="mb-0 text-semibold text-dark">BarberShop</h5>
            <small className="text-light">Sistema de Gestão</small>
          </div>
        </div>
      </div>

      {/* Informações do usuário */}
      <div className="p-4 border-bottom border-white-border">
        <div className="d-flex align-items-center">
          <div className="avatar me-3">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ 
                width: '45px', 
                height: '45px',
                background: 'var(--primary-gradient)',
                color: 'white'
              }}
            >
              <i className="fas fa-user"></i>
            </div>
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-1 text-semibold text-dark">{user?.nome}</h6>
            <small className="text-light">{roleLabels[user?.role] || user?.role}</small>
          </div>
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="p-3 flex-grow-1">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li className="nav-item mb-2" key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center p-3 rounded-md transition hover-lift ${
                    isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-dark hover-opacity'
                  }`
                }
                end={item.path === '/'}
                style={({ isActive }) => ({
                  background: isActive ? 'var(--primary-gradient)' : 'transparent',
                  textDecoration: 'none'
                })}
              >
                <i className={`${item.icon} me-3`}></i>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Rodapé com logout */}
      <div className="p-3 border-top border-white-border">
        <button 
          className="modern-btn-outline w-100 d-flex align-items-center justify-content-center"
          onClick={logout}
          style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
        >
          <i className="fas fa-sign-out-alt me-2"></i>
          Sair
        </button>
      </div>

      {/* Informações adicionais */}
      <div className="p-3 text-center">
        <small className="text-light">
          <div>✂️ Sistema v1.0</div>
          <div>© 2024 BarberShop</div>
        </small>
      </div>
    </div>
  );
};

export default Sidebar;
