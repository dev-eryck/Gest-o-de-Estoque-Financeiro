import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  BarChart3, 
  Filter,
  Search,
  Edit,
  Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../config/axios';
import toast from 'react-hot-toast';

const ControleFinanceiro = () => {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [periodo, setPeriodo] = useState('mes');
  
  // Estados para dados
  const [caixaAtual, setCaixaAtual] = useState({});
  const [resumo, setResumo] = useState({});
  const [transacoes, setTransacoes] = useState([]);
  const [vendasPorMes, setVendasPorMes] = useState([]);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    tipo: 'venda',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    observacao: ''
  });

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [caixaRes, resumoRes, transacoesRes] = await Promise.all([
              api.get('/api/controle-financeiro/caixa-atual'),
      api.get(`/api/controle-financeiro/resumo?periodo=${periodo}`),
      api.get('/api/controle-financeiro')
      ]);

      setCaixaAtual(caixaRes.data.data);
      setResumo(resumoRes.data.data);
      setTransacoes(transacoesRes.data.data);
      
      // Gerar dados para gráficos
      generateChartData(transacoesRes.data.data);
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateChartData = (transacoes) => {
          // Dados de vendas por mês
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const vendasPorMesData = meses.map((mes, index) => {
        const mesTransacoes = transacoes.filter(t => 
          t.tipo === 'venda' && 
          new Date(t.data).getMonth() === index
        );
        const totalVendas = mesTransacoes.reduce((sum, t) => sum + parseFloat(t.valor), 0);
        
        // Calcular lucro real baseado em custos e receitas
        const custosMes = transacoes.filter(t => 
          t.tipo === 'custo' && 
          new Date(t.data).getMonth() === index
        ).reduce((sum, t) => sum + parseFloat(t.valor), 0);
        
        const lucro = totalVendas - custosMes;
        
        return {
          mes,
          vendas: totalVendas,
          lucro: lucro
        };
      });
    
    setVendasPorMes(vendasPorMesData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTransaction) {
        await api.put(`/api/controle-financeiro/${editingTransaction.id}`, formData);
        toast.success('Transação atualizada com sucesso!');
      } else {
        await api.post('/api/controle-financeiro', formData);
        toast.success('Transação criada com sucesso!');
      }
      
      setShowForm(false);
      setEditingTransaction(null);
      resetForm();
      fetchData();
      
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar transação';
      toast.error(message);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      tipo: transaction.tipo,
      descricao: transaction.descricao,
      valor: transaction.valor,
      data: transaction.data,
      categoria: transaction.categoria || '',
      observacao: transaction.observacao || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta transação?')) return;
    
    try {
              await api.delete(`/api/controle-financeiro/${id}`);
      toast.success('Transação deletada com sucesso!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao deletar transação');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'venda',
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      categoria: '',
      observacao: ''
    });
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    resetForm();
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
    resetForm();
  };

  const getTipoInfo = (tipo) => {
    const tipos = {
      venda: { label: 'Venda', color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp },
      custo: { label: 'Custo', color: 'text-red-600', bg: 'bg-red-50', icon: TrendingDown },
      ajuste: { label: 'Ajuste', color: 'text-blue-600', bg: 'bg-blue-50', icon: BarChart3 },
      caixa_inicial: { label: 'Caixa Inicial', color: 'text-purple-600', bg: 'bg-purple-50', icon: DollarSign }
    };
    return tipos[tipo] || tipos.venda;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Filtros
  const filteredTransacoes = transacoes.filter(trans => {
    const matchesSearch = trans.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trans.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || trans.tipo === selectedType;
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && new Date(trans.data).toDateString() === new Date().toDateString()) ||
                       (dateFilter === 'week' && (new Date() - new Date(trans.data)) <= 7 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === 'month' && (new Date() - new Date(trans.data)) <= 30 * 24 * 60 * 60 * 1000);

    return matchesSearch && matchesType && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle Financeiro</h1>
          <p className="text-red-600 font-medium">Gerencie o fluxo de caixa e acompanhe a saúde financeira do BAR DO CARNEIRO</p>
        </div>
        <button
          onClick={handleNewTransaction}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Nova Transação
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Caixa Atual</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(caixaAtual.saldo_atual || 0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendas ({periodo})</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo.vendas || 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Custos ({periodo})</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(resumo.custos || 0)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro ({periodo})</p>
              <p className={`text-2xl font-bold ${(resumo.lucro || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(resumo.lucro || 0)}
              </p>
              <p className="text-sm text-gray-500">
                Margem: {(resumo.margem_lucro || 0).toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Seletor de Período */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Período:</label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value="dia">Hoje</option>
            <option value="semana">Última Semana</option>
            <option value="mes">Este Mês</option>
            <option value="ano">Este Ano</option>
          </select>
          <div className="text-sm text-gray-500">
            {resumo.data_inicio && resumo.data_fim && (
              <span>{formatDate(resumo.data_inicio)} a {formatDate(resumo.data_fim)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vendas por mês */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vendasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="vendas" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por tipo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Vendas', value: resumo.vendas || 0, color: '#10b981' },
                  { name: 'Custos', value: resumo.custos || 0, color: '#ef4444' },
                  { name: 'Ajustes', value: resumo.ajustes || 0, color: '#3b82f6' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Vendas', value: resumo.vendas || 0, color: '#10b981' },
                  { name: 'Custos', value: resumo.custos || 0, color: '#ef4444' },
                  { name: 'Ajustes', value: resumo.ajustes || 0, color: '#3b82f6' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="venda">Venda</option>
                <option value="custo">Custo</option>
                <option value="ajuste">Ajuste</option>
                <option value="caixa_inicial">Caixa Inicial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                required
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="Ex: Bebidas, Comidas, Limpeza..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <input
                type="text"
                required
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="Descrição da transação..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observação
              </label>
              <textarea
                value={formData.observacao}
                onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="Observações adicionais..."
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                {editingTransaction ? 'Atualizar' : 'Salvar'} Transação
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value="all">Todos os tipos</option>
            <option value="venda">Vendas</option>
            <option value="custo">Custos</option>
            <option value="ajuste">Ajustes</option>
            <option value="caixa_inicial">Caixa Inicial</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value="all">Todas as datas</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>

          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {filteredTransacoes.length} de {transacoes.length} transações
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransacoes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Nenhuma transação encontrada</p>
                    <p className="text-sm">Comece registrando sua primeira transação!</p>
                  </td>
                </tr>
              ) : (
                filteredTransacoes.map((trans) => {
                  const tipoInfo = getTipoInfo(trans.tipo);
                  const TipoIcon = tipoInfo.icon;
                  
                  return (
                    <tr key={trans.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(trans.data)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoInfo.bg} ${tipoInfo.color}`}>
                          <TipoIcon className="w-3 h-3 mr-1" />
                          {tipoInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{trans.descricao}</div>
                        {trans.observacao && (
                          <div className="text-xs text-gray-500">{trans.observacao}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{trans.categoria || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${trans.tipo === 'venda' ? 'text-green-600' : trans.tipo === 'custo' ? 'text-red-600' : 'text-blue-600'}`}>
                          {formatCurrency(trans.valor)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(trans)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(trans.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ControleFinanceiro;
