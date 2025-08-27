import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

// Pages
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Funcionarios from './pages/Funcionarios';
import Estoque from './pages/Estoque';
import Vendas from './pages/Vendas';
import Relatorios from './pages/Relatorios';
import Categorias from './pages/Categorias';
import ControleFinanceiro from './pages/ControleFinanceiro';
import Configuracoes from './pages/Configuracoes';
import Notificacoes from './pages/Notificacoes';
import Login from './pages/Login';
import NovoProduto from './pages/NovoProduto';
import NovaVenda from './pages/NovaVenda';
import NovoFuncionario from './pages/NovoFuncionario';

// Componente para rotas protegidas
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, loading, canAccess } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !canAccess(requiredPermission)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Componente principal da aplicação
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rota de login - sempre acessível */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      
      {/* Rotas protegidas - apenas para usuários autenticados */}
      {isAuthenticated ? (
        <>
          <Route path="/" element={
            <ProtectedRoute requiredPermission="dashboard">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <Dashboard />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/produtos" element={
            <ProtectedRoute requiredPermission="produtos">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <Produtos />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/funcionarios" element={
            <ProtectedRoute requiredPermission="funcionarios">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <Funcionarios />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/estoque" element={
            <ProtectedRoute requiredPermission="estoque">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <Estoque />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/vendas" element={
            <ProtectedRoute requiredPermission="vendas">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <Vendas />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/relatorios" element={
            <ProtectedRoute requiredPermission="relatorios">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <Relatorios />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/categorias" element={
            <ProtectedRoute requiredPermission="categorias">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <Categorias />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/controle-financeiro" element={
            <ProtectedRoute requiredPermission="controle_financeiro">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <ControleFinanceiro />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/configuracoes" element={
            <ProtectedRoute requiredPermission="configuracoes">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <Configuracoes />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/notificacoes" element={
            <ProtectedRoute requiredPermission="notificacoes">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <Notificacoes />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          {/* Rotas para criação de novos itens */}
          <Route path="/produtos/novo" element={
            <ProtectedRoute requiredPermission="produtos">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <NovoProduto />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/vendas/nova" element={
            <ProtectedRoute requiredPermission="vendas">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <NovaVenda />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/funcionarios/novo" element={
            <ProtectedRoute requiredPermission="funcionarios">
              <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Topbar />
                  <div className="overflow-y-auto h-full">
                    <NovoFuncionario />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          {/* Redirecionar rotas não encontradas para dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        /* Se não estiver autenticado, redirecionar para login */
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
