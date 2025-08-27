import React, { useState } from 'react';
import { Settings, Database, Bell, Shield, Palette, Save, RefreshCw, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('geral');
  const [configs, setConfigs] = useState({
    empresa: {
      nome: 'BAR DO CARNEIRO',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua das Flores, 123 - Centro',
      telefone: '(11) 99999-9999',
      email: 'contato@barcarneiro.com'
    },
    sistema: {
      moeda: 'BRL',
      timezone: 'America/Sao_Paulo',
      idioma: 'pt-BR',
      tema: 'claro'
    },
    estoque: {
      alertaEstoqueBaixo: 10,
      alertaEstoqueCritico: 5,
      diasParaVencimento: 30,
      permitirEstoqueNegativo: false
    },
    notificacoes: {
      emailEstoqueBaixo: true,
      emailVendasDiarias: true,
      emailRelatoriosSemanais: true,
      pushNotifications: true
    }
  });

  const tabs = [
    { id: 'geral', name: 'Geral', icon: Settings },
    { id: 'empresa', name: 'Empresa', icon: Settings },
    { id: 'sistema', name: 'Sistema', icon: Settings },
    { id: 'estoque', name: 'Estoque', icon: Database },
    { id: 'notificacoes', name: 'Notificações', icon: Bell },
    { id: 'seguranca', name: 'Segurança', icon: Shield },
    { id: 'aparencia', name: 'Aparência', icon: Palette }
  ];

  const handleSave = async () => {
    try {
      // Aqui você salvaria as configurações na API
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja redefinir todas as configurações?')) {
      // Aqui você resetaria para os valores padrão
      toast.success('Configurações redefinidas!');
    }
  };

  const handleBackup = () => {
    toast.success('Backup iniciado com sucesso!');
  };

  const handleRestore = () => {
    toast.success('Restauração iniciada com sucesso!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'geral':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Informações Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    value={configs.empresa.nome}
                    onChange={(e) => setConfigs({
                      ...configs,
                      empresa: { ...configs.empresa, nome: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={configs.empresa.cnpj}
                    onChange={(e) => setConfigs({
                      ...configs,
                      empresa: { ...configs.empresa, cnpj: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Ações do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleBackup}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Fazer Backup
                </button>
                <button
                  onClick={handleRestore}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Restaurar Backup
                </button>
              </div>
            </div>
          </div>
        );

      case 'empresa':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Dados da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={configs.empresa.endereco}
                    onChange={(e) => setConfigs({
                      ...configs,
                      empresa: { ...configs.empresa, endereco: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={configs.empresa.telefone}
                    onChange={(e) => setConfigs({
                      ...configs,
                      empresa: { ...configs.empresa, telefone: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={configs.empresa.email}
                    onChange={(e) => setConfigs({
                      ...configs,
                      empresa: { ...configs.empresa, email: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'sistema':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Configurações do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda
                  </label>
                  <select
                    value={configs.sistema.moeda}
                    onChange={(e) => setConfigs({
                      ...configs,
                      sistema: { ...configs.sistema, moeda: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="BRL">Real (BRL)</option>
                    <option value="USD">Dólar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuso Horário
                  </label>
                  <select
                    value={configs.sistema.timezone}
                    onChange={(e) => setConfigs({
                      ...configs,
                      sistema: { ...configs.sistema, timezone: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/Manaus">Manaus (GMT-4)</option>
                    <option value="America/Belem">Belém (GMT-3)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma
                  </label>
                  <select
                    value={configs.sistema.idioma}
                    onChange={(e) => setConfigs({
                      ...configs,
                      sistema: { ...configs.sistema, idioma: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tema
                  </label>
                  <select
                    value={configs.sistema.tema}
                    onChange={(e) => setConfigs({
                      ...configs,
                      sistema: { ...configs.sistema, tema: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="claro">Claro</option>
                    <option value="escuro">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'estoque':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Configurações de Estoque</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alerta de Estoque Baixo
                  </label>
                  <input
                    type="number"
                    value={configs.estoque.alertaEstoqueBaixo}
                    onChange={(e) => setConfigs({
                      ...configs,
                      estoque: { ...configs.estoque, alertaEstoqueBaixo: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alerta de Estoque Crítico
                  </label>
                  <input
                    type="number"
                    value={configs.estoque.alertaEstoqueCritico}
                    onChange={(e) => setConfigs({
                      ...configs,
                      estoque: { ...configs.estoque, alertaEstoqueCritico: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias para Vencimento
                  </label>
                  <input
                    type="number"
                    value={configs.estoque.diasParaVencimento}
                    onChange={(e) => setConfigs({
                      ...configs,
                      estoque: { ...configs.estoque, diasParaVencimento: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={configs.estoque.permitirEstoqueNegativo}
                    onChange={(e) => setConfigs({
                      ...configs,
                      estoque: { ...configs.estoque, permitirEstoqueNegativo: e.target.checked }
                    })}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Permitir estoque negativo
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notificacoes':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Configurações de Notificações</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email - Estoque Baixo</h4>
                    <p className="text-sm text-gray-500">Receber emails quando produtos estiverem com estoque baixo</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configs.notificacoes.emailEstoqueBaixo}
                    onChange={(e) => setConfigs({
                      ...configs,
                      notificacoes: { ...configs.notificacoes, emailEstoqueBaixo: e.target.checked }
                    })}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email - Vendas Diárias</h4>
                    <p className="text-sm text-gray-500">Receber relatório diário de vendas por email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configs.notificacoes.emailVendasDiarias}
                    onChange={(e) => setConfigs({
                      ...configs,
                      notificacoes: { ...configs.notificacoes, emailVendasDiarias: e.target.checked }
                    })}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email - Relatórios Semanais</h4>
                    <p className="text-sm text-gray-500">Receber relatório semanal completo por email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configs.notificacoes.emailRelatoriosSemanais}
                    onChange={(e) => setConfigs({
                      ...configs,
                      notificacoes: { ...configs.notificacoes, emailRelatoriosSemanais: e.target.checked }
                    })}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Notificações Push</h4>
                    <p className="text-sm text-gray-500">Receber notificações em tempo real no navegador</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configs.notificacoes.pushNotifications}
                    onChange={(e) => setConfigs({
                      ...configs,
                      notificacoes: { ...configs.notificacoes, pushNotifications: e.target.checked }
                    })}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'seguranca':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Configurações de Segurança</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sessão (minutos)
                  </label>
                  <input
                    type="number"
                    defaultValue={30}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Exigir autenticação em duas etapas
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Registrar todas as ações dos usuários
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'aparencia':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Configurações de Aparência</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Principal
                  </label>
                  <input
                    type="color"
                    defaultValue="#ef4444"
                    className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Densidade da Interface
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
                    <option value="compact">Compacta</option>
                    <option value="normal">Normal</option>
                    <option value="comfortable">Confortável</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-red-600 font-medium">Personalize o sistema conforme suas necessidades</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Ações */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReset}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Redefinir
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
