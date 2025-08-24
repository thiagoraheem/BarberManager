import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../utils/api';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [userFormData, setUserFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    role: 'recepcionista',
    senha: ''
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user) {
      setProfileData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || ''
      });
    }

    if (isAdmin) {
      loadUsers();
    }
  }, [user, isAdmin]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        alert('Perfil atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar perfil: ' + result.error);
      }
    } catch (error) {
      alert('Erro inesperado ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          nome: userFormData.nome,
          email: userFormData.email,
          telefone: userFormData.telefone,
          role: userFormData.role
        });
      } else {
        await api.post('/users', userFormData);
      }

      setShowUserModal(false);
      setEditingUser(null);
      resetUserForm();
      loadUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário. Tente novamente.');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone || '',
      role: user.role,
      senha: ''
    });
    setShowUserModal(true);
  };

  const resetUserForm = () => {
    setUserFormData({
      nome: '',
      email: '',
      telefone: '',
      role: 'recepcionista',
      senha: ''
    });
  };

  const openNewUserModal = () => {
    resetUserForm();
    setEditingUser(null);
    setShowUserModal(true);
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrador',
      barbeiro: 'Barbeiro',
      recepcionista: 'Recepcionista'
    };
    return labels[role] || role;
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-danger',
      barbeiro: 'bg-primary',
      recepcionista: 'bg-success'
    };
    return badges[role] || 'bg-secondary';
  };

  return (
    <div className="container-fluid fade-in">
      {/* Cabeçalho */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-1 fw-bold">⚙️ Configurações</h1>
          <p className="text-muted mb-0">Gerencie suas configurações e preferências</p>
        </div>
      </div>

      <div className="row">
        {/* Perfil do Usuário */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Meu Perfil
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleProfileSubmit}>
                <div className="text-center mb-4">
                  <div 
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto text-white"
                    style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                  >
                    {user?.nome?.charAt(0)?.toUpperCase()}
                  </div>
                  <h4 className="mt-2 mb-1">{user?.nome}</h4>
                  <span className={`badge ${getRoleBadge(user?.role)}`}>
                    {getRoleLabel(user?.role)}
                  </span>
                </div>

                <div className="mb-3">
                  <label className="form-label">Nome Completo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.nome}
                    onChange={(e) => setProfileData({...profileData, nome: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Telefone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={profileData.telefone}
                    onChange={(e) => setProfileData({...profileData, telefone: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Salvar Perfil
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Configurações do Sistema */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-cogs me-2"></i>
                Preferências do Sistema
              </h5>
            </div>
            <div className="card-body">
              {/* Tema */}
              <div className="mb-4">
                <h6 className="fw-semibold">Aparência</h6>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span>Tema {isDark ? 'Escuro' : 'Claro'}</span>
                    <br />
                    <small className="text-muted">
                      {isDark ? 'Interface com cores escuras' : 'Interface com cores claras'}
                    </small>
                  </div>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={toggleTheme}
                  >
                    <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} me-2`}></i>
                    {isDark ? 'Modo Claro' : 'Modo Escuro'}
                  </button>
                </div>
              </div>

              <hr />

              {/* Informações do Sistema */}
              <div className="mb-4">
                <h6 className="fw-semibold">Informações do Sistema</h6>
                <div className="row">
                  <div className="col-6">
                    <small className="text-muted d-block">Versão:</small>
                    <strong>1.0.0</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Status:</small>
                    <span className="badge bg-success">Online</span>
                  </div>
                </div>
              </div>

              <hr />

              {/* LGPD */}
              <div className="mb-4">
                <h6 className="fw-semibold">
                  <i className="fas fa-shield-alt me-2"></i>
                  Proteção de Dados (LGPD)
                </h6>
                <p className="text-muted small">
                  Este sistema está em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD).
                </p>
                <div className="d-flex gap-2">
                  <span className="badge bg-success">
                    <i className="fas fa-check me-1"></i>
                    Conformidade LGPD
                  </span>
                  <span className="badge bg-info">
                    <i className="fas fa-lock me-1"></i>
                    Dados Protegidos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gerenciamento de Usuários (apenas admin) */}
      {isAdmin && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-users-cog me-2"></i>
                  Gerenciar Usuários
                </h5>
                <button 
                  className="btn btn-primary"
                  onClick={openNewUserModal}
                >
                  <i className="fas fa-user-plus me-2"></i>
                  Novo Usuário
                </button>
              </div>
              <div className="card-body">
                {users.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Usuário</th>
                          <th>Email</th>
                          <th>Telefone</th>
                          <th>Função</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white me-3"
                                  style={{ width: '35px', height: '35px', fontSize: '14px' }}
                                >
                                  {user.nome.charAt(0).toUpperCase()}
                                </div>
                                <span className="fw-semibold">{user.nome}</span>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>{user.telefone || 'Não informado'}</td>
                            <td>
                              <span className={`badge ${getRoleBadge(user.role)}`}>
                                {getRoleLabel(user.role)}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${user.ativo ? 'bg-success' : 'bg-danger'}`}>
                                {user.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditUser(user)}
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
                  <div className="text-center py-4">
                    <i className="fas fa-users-slash fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">Nenhum usuário encontrado</h5>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Usuário */}
      {showUserModal && isAdmin && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowUserModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUserSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userFormData.nome}
                      onChange={(e) => setUserFormData({...userFormData, nome: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Telefone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={userFormData.telefone}
                      onChange={(e) => setUserFormData({...userFormData, telefone: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Função *</label>
                    <select
                      className="form-select"
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                      required
                    >
                      <option value="recepcionista">Recepcionista</option>
                      <option value="barbeiro">Barbeiro</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  {!editingUser && (
                    <div className="mb-3">
                      <label className="form-label">Senha *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={userFormData.senha}
                        onChange={(e) => setUserFormData({...userFormData, senha: e.target.value})}
                        required={!editingUser}
                        placeholder="Senha para o novo usuário"
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowUserModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    Salvar Usuário
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

export default Settings;
