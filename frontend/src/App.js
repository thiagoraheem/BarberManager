import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Components
import Login from './components/Auth/Login';
import PrivateRoute from './components/Auth/PrivateRoute';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';

// Pages
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Clients from './pages/Clients';
import Services from './pages/Services';
import POS from './pages/POS';
import Settings from './pages/Settings';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();

  // Set theme attribute on document
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <h5>Carregando Sistema...</h5>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <div className="d-flex">
            <Sidebar />
            <div className="flex-fill">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/agendamentos" 
                    element={
                      <PrivateRoute>
                        <Appointments />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/clientes" 
                    element={
                      <PrivateRoute>
                        <Clients />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/servicos" 
                    element={
                      <PrivateRoute>
                        <Services />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/pos" 
                    element={
                      <PrivateRoute>
                        <POS />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/configuracoes" 
                    element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
