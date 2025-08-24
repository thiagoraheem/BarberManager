import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: 'fas fa-chart-dashboard', label: 'Dashboard' },
    { path: '/agendamentos', icon: 'fas fa-calendar-alt', label: 'Agendamentos' },
    { path: '/clientes', icon: 'fas fa-users', label: 'Clientes' },
    { path: '/servicos', icon: 'fas fa-cut', label: 'Serviços' },
    { path: '/pos', icon: 'fas fa-cash-register', label: 'Ponto de Venda' },
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
      <div className="p-4 border-bottom">
        <div className="d-flex align-items-center">
          <div className="me-3">
            <i className="fas fa-cut fa-2x text-primary"></i>
          </div>
          <div>
            <h5 className="mb-0 fw-bold">BarberShop</h5>
            <small className="text-muted">Sistema de Gestão</small>
          </div>
        </div>
      </div>

      {/* Informações do usuário */}
      <div className="p-4 border-bottom">
        <div className="d-flex align-items-center">
          <div className="avatar me-3">
            <div 
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
              style={{ width: '45px', height: '45px' }}
            >
              <i className="fas fa-user text-white"></i>
            </div>
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-semibold">{user?.nome}</h6>
            <small className="text-muted">{roleLabels[user?.role] || user?.role}</small>
          </div>
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="p-3 flex-grow-1">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
                end={item.path === '/'}
              >
                <i className={`${item.icon} me-3`}></i>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Rodapé com logout */}
      <div className="p-3 border-top">
        <button 
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
          onClick={logout}
        >
          <i className="fas fa-sign-out-alt me-2"></i>
          Sair
        </button>
      </div>

      {/* Informações adicionais */}
      <div className="p-3 text-center">
        <small className="text-muted">
          <div>✂️ Sistema v1.0</div>
          <div>© 2024 BarberShop</div>
        </small>
      </div>
    </div>
  );
};

export default Sidebar;
