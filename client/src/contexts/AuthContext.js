import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [permissoes, setPermissoes] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se há token salvo ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const usuarioSalvo = localStorage.getItem('usuario');
      
      if (token && usuarioSalvo) {
        try {
          const usuarioObj = JSON.parse(usuarioSalvo);
          setUsuario(usuarioObj);
          setIsAuthenticated(true);
          
          // Configurar token no api
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Buscar permissões e só então parar o loading
          await fetchPermissoes();
        } catch (error) {
          console.error('Erro ao restaurar sessão:', error);
          logout();
        }
      }
      
      // Só parar o loading após tudo estar pronto
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchPermissoes = async () => {
    try {
      const response = await api.get('/api/auth/permissoes');
      if (response.data.success) {
        setPermissoes(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      // Se falhar, definir permissões padrão
      setPermissoes({
        dashboard: true,
        produtos: true,
        vendas: true,
        funcionarios: true,
        estoque: true,
        relatorios: true,
        categorias: true,
        controle_financeiro: true,
        configuracao: true,
        notificacoes: true
      });
    }
  };

  const login = async (username, senha) => {
    try {
      console.log('🔐 Tentando fazer login...', { username });
      
      const response = await api.post('/api/auth/login', { username, senha });
      
      if (response.data.success) {
        const { token, usuario: usuarioData } = response.data.data;
        
        console.log('✅ Login bem-sucedido:', usuarioData);
        
        // Salvar no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuarioData));
        
        // Configurar token no api
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Atualizar estado
        setUsuario(usuarioData);
        setIsAuthenticated(true);
        
        console.log('🔄 Estado atualizado, buscando permissões...');
        
        // Buscar permissões
        await fetchPermissoes();
        
        console.log('🎉 Login completo!');
        
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login'
      };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Chamar API de logout
        await api.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      // Limpar headers do api
      delete api.defaults.headers.common['Authorization'];
      
      // Resetar estado
      setUsuario(null);
      setPermissoes({});
      setIsAuthenticated(false);
    }
  };

  const checkPermission = (rota, acao = 'ler') => {
    if (!usuario || !permissoes) return false;
    
    // Dono tem acesso total
    if (usuario.cargo === 'dono') return true;
    
    // Verificar permissão específica
    const rotaPermissoes = permissoes[rota];
    if (!rotaPermissoes) return false;
    
    return rotaPermissoes[acao] || false;
  };

  const canAccess = (rota) => {
    return checkPermission(rota, 'ler');
  };

  const canCreate = (rota) => {
    return checkPermission(rota, 'criar');
  };

  const canEdit = (rota) => {
    return checkPermission(rota, 'editar');
  };

  const canDelete = (rota) => {
    return checkPermission(rota, 'deletar');
  };

  const value = {
    usuario,
    permissoes,
    loading,
    isAuthenticated,
    login,
    logout,
    checkPermission,
    canAccess,
    canCreate,
    canEdit,
    canDelete
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
