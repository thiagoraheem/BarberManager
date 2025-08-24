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
  const [error, setError] = useState(null); // Adicionado estado para error

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
      setError(null); // Limpar erro anterior
      const response = await api.post('/auth/login', {
        email,
        password: password
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
      console.error('Detalhes do erro:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      let errorMessage = 'Erro no login. Tente novamente.';

      if (error.response) {
        // Erro da API
        switch (error.response.status) {
          case 401:
            errorMessage = 'Email ou senha incorretos';
            break;
          case 422:
            // Capturar detalhes de validação do erro 422
            const validationDetails = error.response.data?.detail;
            if (Array.isArray(validationDetails)) {
              const fieldErrors = validationDetails.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
              errorMessage = `Dados inválidos: ${fieldErrors}`;
            } else if (typeof validationDetails === 'string') {
              errorMessage = `Erro de validação: ${validationDetails}`;
            } else {
              errorMessage = 'Dados inválidos. Verifique email e senha.';
            }
            break;
          case 500:
            errorMessage = 'Erro interno do servidor';
            break;
          default:
            errorMessage = error.response.data?.detail || 'Erro no servidor';
        }
      } else if (error.request) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
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
    refreshToken,
    error // Incluir error no value do context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};