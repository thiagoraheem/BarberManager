import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configurar interceptor do axios para incluir token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verificar usuário logado ao carregar app
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { 
        email, 
        senha: password 
      });

      const { access_token } = response.data;

      localStorage.setItem('token', access_token);

      // Buscar dados do usuário
      const userResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      setUser(userResponse.data);
      setToken(access_token);

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);

      let errorMessage = 'Erro no login';

      if (error.response) {
        // Servidor retornou um erro
        if (error.response.data) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }

        // Tratar códigos de erro específicos
        if (error.response.status === 401) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.response.status === 422) {
          errorMessage = 'Dados inválidos. Verifique email e senha';
        } else if (error.response.status >= 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente';
        }
      } else if (error.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão. Verifique sua internet';
      }

      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao registrar usuário' 
      };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put(`/users/${user.id}`, userData);
      setUser(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erro ao atualizar perfil' 
      };
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { access_token } = response.data;

      localStorage.setItem('token', access_token);
      setToken(access_token);

      return true;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};