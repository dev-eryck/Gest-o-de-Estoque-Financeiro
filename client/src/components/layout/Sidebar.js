import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Package,
  Users,
  Database,
  ShoppingCart,
  TrendingUp,
  Tag,
  DollarSign,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ onClose }) => {
  const { canAccess } = useAuth();

  const menuItems = [
    {
      path: '/',
      name: 'Dashboard',
      icon: Home,
      description: 'Visão geral do sistema',
      permission: 'dashboard'
    },
    {
      path: '/produtos',
      name: 'Produtos',
      icon: Package,
      description: 'Gerenciar catálogo',
      permission: 'produtos'
    },
    {
      path: '/funcionarios',
      name: 'Funcionários',
      icon: Users,
      description: 'Equipe e usuários do sistema',
      permission: 'funcionarios'
    },
    {
      path: '/estoque',
      name: 'Estoque',
      icon: Database,
      description: 'Controle de inventário',
      permission: 'estoque'
    },
    {
      path: '/vendas',
      name: 'Vendas',
      icon: ShoppingCart,
      description: 'Registro de vendas',
      permission: 'vendas'
    },
    {
      path: '/relatorios',
      name: 'Relatórios',
      icon: TrendingUp,
      description: 'Análises e métricas',
      permission: 'relatorios'
    },
    {
      path: '/categorias',
      name: 'Categorias',
      icon: Tag,
      description: 'Gerenciar categorias',
      permission: 'categorias'
    },
    {
      path: '/controle-financeiro',
      name: 'Controle Financeiro',
      icon: DollarSign,
      description: 'Gerenciar finanças',
      permission: 'controle_financeiro'
    },
    {
      path: '/configuracoes',
      name: 'Configurações',
      icon: Settings,
      description: 'Ajustes do sistema',
      permission: 'configuracoes'
    }
  ];

  // Filtrar itens baseado nas permissões do usuário
  const filteredMenuItems = menuItems.filter(item => canAccess(item.permission));

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl flex flex-col h-screen">
      {/* Header do Sidebar */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BAR DO CARNEIRO</h1>
              <p className="text-xs text-red-400 font-medium">Sistema de Gestão</p>
            </div>
          </div>

          {/* Botão fechar para mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="p-4 space-y-2 flex-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }
              `}
            >
              <div className={`
                p-2 rounded-lg transition-all duration-200
                ${({ isActive }) => isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-700/50 text-gray-400 group-hover:bg-red-500/20 group-hover:text-red-400'
                }
              `}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className={`
                  text-xs transition-colors duration-200
                  ${({ isActive }) => isActive
                    ? 'text-red-100'
                    : 'text-gray-500 group-hover:text-gray-300'
                  }
                `}>
                  {item.description}
                </p>
              </div>

              {/* Indicador de ativo */}
              {({ isActive }) => isActive && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer do Sidebar */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs text-gray-400">Sistema Ativo</p>
          <p className="text-xs text-red-400 font-medium">BAR DO CARNEIRO</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
