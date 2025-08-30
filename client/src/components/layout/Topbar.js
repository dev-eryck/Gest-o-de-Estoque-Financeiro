import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Command, Bell, User, LogOut, Edit, Save, X } from 'lucide-react';
import api from '../../config/axios';
import toast from 'react-hot-toast';

const Topbar = () => {
  const { usuario, logout } = useAuth();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({
    nome_completo: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (usuario) {
      setProfileData({
        nome_completo: usuario.nome_completo || '',
        username: usuario.username || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [usuario]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchNotificacoesNaoLidas();
  }, []);

  const fetchNotificacoesNaoLidas = async () => {
    try {
      const response = await api.get('/api/notificacoes/nao-lidas');
      setNotificacoesNaoLidas(response.data.count || 0);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const runCommand = (action) => {
    action();
    setShowCommandPalette(false);
  };

  const handleProfileUpdate = async () => {
    try {
      // Validações
      if (!profileData.nome_completo.trim()) {
        toast.error('Nome completo é obrigatório');
        return;
      }

      if (profileData.newPassword && profileData.newPassword.length < 6) {
        toast.error('Nova senha deve ter pelo menos 6 caracteres');
        return;
      }

      if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }

      if (profileData.newPassword && !profileData.currentPassword) {
        toast.error('Senha atual é obrigatória para alterar a senha');
        return;
      }

      const updateData = {
        nome_completo: profileData.nome_completo.trim()
      };

      if (profileData.newPassword) {
        updateData.currentPassword = profileData.currentPassword;
        updateData.newPassword = profileData.newPassword;
      }

              await api.put('/api/auth/perfil', updateData);
      toast.success('Perfil atualizado com sucesso!');
      
      // Atualizar dados do usuário localmente
      if (usuario) {
        usuario.nome_completo = profileData.nome_completo.trim();
      }
      
      setShowProfileEdit(false);
      setProfileData({
        nome_completo: profileData.nome_completo.trim(),
        username: profileData.username,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao atualizar perfil';
      toast.error(message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Lado esquerdo - Busca e Comandos */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Barra de pesquisa */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar produtos, funcionários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {/* Botão de comandos */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Command className="w-4 h-4" />
              <span>Comandos</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">⌘K</kbd>
            </button>
          </div>

          {/* Lado direito - Notificações e Usuário */}
          <div className="flex items-center space-x-4">
            {/* Notificações */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {notificacoesNaoLidas > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificacoesNaoLidas}
                </span>
              )}
            </button>

            {/* Menu do usuário */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">{usuario?.nome_completo || usuario?.username || 'Usuário'}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {usuario?.cargo || 'Usuário'}
                </span>
              </button>

              {/* Dropdown do usuário */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{usuario?.nome_completo || 'Nome não definido'}</p>
                    <p className="text-sm text-gray-500">{usuario?.username}</p>
                    <p className="text-xs text-gray-400 capitalize">{usuario?.cargo || 'Usuário'}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowProfileEdit(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar Perfil</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Comandos Rápidos</h3>
              <button
                onClick={() => setShowCommandPalette(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Navegação</h4>
                <button
                  onClick={() => runCommand(() => window.location.href = '/')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Ir para Dashboard</span>
                </button>
                <button
                  onClick={() => runCommand(() => window.location.href = '/produtos')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Ir para Produtos</span>
                </button>
                <button
                  onClick={() => runCommand(() => window.location.href = '/funcionarios')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Ir para Funcionários</span>
                </button>
                <button
                  onClick={() => runCommand(() => window.location.href = '/estoque')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Ir para Estoque</span>
                </button>
                <button
                  onClick={() => runCommand(() => window.location.href = '/vendas')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Ir para Vendas</span>
                </button>
                <button
                  onClick={() => runCommand(() => window.location.href = '/relatorios')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Ir para Relatórios</span>
                </button>
                <button
                  onClick={() => runCommand(() => window.location.href = '/categorias')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Ir para Categorias</span>
                </button>
                <button
                  onClick={() => runCommand(() => window.location.href = '/controle-financeiro')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Ir para Controle Financeiro</span>
                </button>
                <button
                  onClick={() => runCommand(() => window.location.href = '/configuracoes')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Ir para Configurações</span>
                </button>
                <button
                  onClick={() => runCommand(() => window.location.href = '/notificacoes')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Ir para Notificações</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Perfil */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Editar Perfil</h3>
              <button
                onClick={() => setShowProfileEdit(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={profileData.nome_completo}
                  onChange={(e) => setProfileData({...profileData, nome_completo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome de Usuário
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Nome de usuário não pode ser alterado</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Alterar Senha (Opcional)</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="Digite sua senha atual"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="Mínimo 6 caracteres"
                      minLength="6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="Confirme a nova senha"
                      minLength="6"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowProfileEdit(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleProfileUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
