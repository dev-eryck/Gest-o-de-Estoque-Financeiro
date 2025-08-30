import React, { useState, useEffect } from 'react';

import { Plus, Search, Filter, Package, TrendingUp, TrendingDown, AlertTriangle, BarChart3, ArrowUpDown } from 'lucide-react';
import api from '../config/axios';
import toast from 'react-hot-toast';

const Estoque = () => {

  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    produto_id: '',
    tipo: 'entrada',
    quantidade: '',
    motivo: '',
    observacao: '',
    data: new Date().toISOString().split('T')[0]
  });

  const tiposMovimentacao = [
    { value: 'entrada', label: 'Entrada', color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp },
    { value: 'saida', label: 'Saída', color: 'text-red-600', bg: 'bg-red-50', icon: TrendingDown },
    { value: 'ajuste', label: 'Ajuste', color: 'text-blue-600', bg: 'bg-blue-50', icon: ArrowUpDown }
  ];

  const motivosEntrada = [
    'Compra de fornecedor',
    'Devolução de cliente',
    'Transferência entre filiais',
    'Inventário',
    'Outros'
  ];

  const motivosSaida = [
    'Venda',
    'Perda/Estrago',
    'Transferência entre filiais',
    'Inventário',
    'Outros'
  ];

  const motivosAjuste = [
    'Correção de inventário',
    'Diferença de contagem',
    'Ajuste de sistema',
    'Outros'
  ];

  useEffect(() => {
    fetchProdutos();
    fetchMovimentacoes();
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await api.get('/api/produtos');
      setProdutos(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProdutos([]);
    }
  };

  const fetchMovimentacoes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/estoque/movimentacoes');
      setMovimentacoes(response.data.data || []);
    } catch (error) {
      toast.error('Erro ao carregar movimentações');
      console.error('Erro:', error);
      setMovimentacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
              await api.post('/api/estoque/movimentacao', formData);
      toast.success('Movimentação registrada com sucesso!');
      setShowForm(false);
      resetForm();
      fetchMovimentacoes();
      fetchProdutos(); // Atualizar estoque dos produtos
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao registrar movimentação';
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      produto_id: '',
      tipo: 'entrada',
      quantidade: '',
      motivo: '',
      observacao: '',
      data: new Date().toISOString().split('T')[0]
    });

  };

  const handleNewMovement = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const handleProductChange = (produtoId) => {
    setFormData({...formData, produto_id: produtoId});
  };

  const getMotivosByTipo = (tipo) => {
    switch (tipo) {
      case 'entrada': return motivosEntrada;
      case 'saida': return motivosSaida;
      case 'ajuste': return motivosAjuste;
      default: return [];
    }
  };

  const getTipoInfo = (tipo) => {
    return tiposMovimentacao.find(t => t.value === tipo) || tiposMovimentacao[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Filtros
  const filteredMovimentacoes = movimentacoes.filter(mov => {
    const matchesSearch = mov.produto_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mov.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mov.observacao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || mov.tipo === selectedType;
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && new Date(mov.data).toDateString() === new Date().toDateString()) ||
                       (dateFilter === 'week' && (new Date() - new Date(mov.data)) <= 7 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === 'month' && (new Date() - new Date(mov.data)) <= 30 * 24 * 60 * 60 * 1000);

    return matchesSearch && matchesType && matchesDate;
  });

  // Estatísticas
  const totalProdutos = produtos.length;
  const produtosSemEstoque = produtos.filter(p => p.quantidade === 0).length;
  const produtosEstoqueBaixo = produtos.filter(p => p.quantidade > 0 && p.quantidade <= (p.estoque_minimo || 5)).length;
        const valorTotalEstoque = produtos.reduce((total, p) => total + (p.quantidade * p.preco_venda), 0);

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
          <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
          <p className="text-red-600 font-medium">Gerencie movimentações e acompanhe o estoque do BAR DO CARNEIRO</p>
        </div>
                 <button
           onClick={handleNewMovement}
           className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
         >
           <Plus className="w-5 h-5" />
           Nova Movimentação
         </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{totalProdutos}</p>
            </div>
                         <Package className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
              <p className="text-2xl font-bold text-red-600">{produtosSemEstoque}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold text-yellow-600">{produtosEstoqueBaixo}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ {valorTotalEstoque.toFixed(2)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar movimentações..."
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
            {tiposMovimentacao.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
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
            {filteredMovimentacoes.length} de {movimentacoes.length} movimentações
          </div>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Nova Movimentação de Estoque</h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto *
              </label>
              <select
                required
                value={formData.produto_id}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="">Selecione um produto</option>
                {produtos.map(produto => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} - Estoque: {produto.quantidade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Movimentação *
              </label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                {tiposMovimentacao.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantidade}
                onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="0"
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
                Motivo *
              </label>
              <select
                required
                value={formData.motivo}
                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="">Selecione um motivo</option>
                {getMotivosByTipo(formData.tipo).map(motivo => (
                  <option key={motivo} value={motivo}>{motivo}</option>
                ))}
              </select>
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
                placeholder="Observações adicionais sobre a movimentação..."
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
                             <button
                 type="submit"
                 className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
               >
                 Registrar Movimentação
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

      {/* Lista de Movimentações */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovimentacoes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Nenhuma movimentação encontrada</p>
                    <p className="text-sm">Comece registrando sua primeira movimentação!</p>
                  </td>
                </tr>
              ) : (
                filteredMovimentacoes.map((mov) => {
                  const tipoInfo = getTipoInfo(mov.tipo);
                  const TipoIcon = tipoInfo.icon;
                  
                  return (
                    <tr key={mov.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(mov.data)}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(mov.data)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{mov.produto_nome}</div>
                        <div className="text-xs text-gray-500">Categoria: {mov.produto_categoria}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoInfo.bg} ${tipoInfo.color}`}>
                          <TipoIcon className="w-3 h-3 mr-1" />
                          {tipoInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${mov.tipo === 'entrada' ? 'text-green-600' : mov.tipo === 'saida' ? 'text-red-600' : 'text-blue-600'}`}>
                          {mov.tipo === 'entrada' ? '+' : mov.tipo === 'saida' ? '-' : '±'} {mov.quantidade}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{mov.motivo}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {mov.observacao || '-'}
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

export default Estoque;
