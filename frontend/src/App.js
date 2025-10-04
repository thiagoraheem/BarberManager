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
import Cash from './pages/Cash';
import Reports from './pages/Reports';
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
      <div className="app-container">
        <div className="main-background">
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
        </div>
        <div className="d-flex justify-center align-center min-h-screen">
          <div className="main-card text-center">
            <div className="spinner mb-3"></div>
            <h5 className="text-dark">Carregando Sistema...</h5>
          </div>
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
          <div className="app-container">
            <div className="main-background">
              <div className="floating-shape"></div>
              <div className="floating-shape"></div>
              <div className="floating-shape"></div>
              <div className="floating-shape"></div>
            </div>
            <div className="d-flex">
              <Sidebar />
              <div className="flex-1">
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
                    path="/caixa" 
                    element={
                      <PrivateRoute>
                        <Cash />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/relatorios" 
                    element={
                      <PrivateRoute>
                        <Reports />
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
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
