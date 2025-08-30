import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ShoppingCart, DollarSign, Calendar, User, Package, Edit, Trash2, Receipt } from 'lucide-react';
import api from '../config/axios';
import toast from 'react-hot-toast';

const Vendas = () => {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    produto_id: '',
    funcionario_id: '',
    quantidade: '',
    preco_unitario: '',
    observacao: '',
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchVendas();
    fetchProdutos();
    fetchFuncionarios();
  }, []);

  const fetchVendas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/vendas');
      // A API retorna {success: true, data: [...]}
      setVendas(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Erro ao carregar vendas');
      console.error('Erro:', error);
      setVendas([]); // Garantir que vendas seja sempre um array
    } finally {
      setLoading(false);
    }
  };

  const fetchProdutos = async () => {
    try {
      const response = await api.get('/api/produtos');
      // A API retorna {success: true, data: [...]}
      setProdutos(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProdutos([]); // Garantir que produtos seja sempre um array
    }
  };

  const fetchFuncionarios = async () => {
    try {
      const response = await api.get('/api/funcionarios');
      // A API retorna {success: true, data: [...]}
      const funcionariosData = response.data.data || response.data || [];
      setFuncionarios(Array.isArray(funcionariosData) ? funcionariosData.filter(f => f.status === 'ativo') : []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      setFuncionarios([]); // Garantir que funcionarios seja sempre um array
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSale) {
        await api.put(`/api/vendas/${editingSale.id}`, formData);
        toast.success('Venda atualizada com sucesso!');
      } else {
        await api.post('/api/vendas', formData);
        toast.success('Venda registrada com sucesso!');
      }
      
      setShowForm(false);
      setEditingSale(null);
      resetForm();
      fetchVendas();
      fetchProdutos(); // Atualizar estoque
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar venda';
      toast.error(message);
    }
  };

  const handleEdit = (venda) => {
    setEditingSale(venda);
    setFormData({
      produto_id: venda.produto_id.toString(),
      funcionario_id: venda.funcionario_id.toString(),
      quantidade: venda.quantidade.toString(),
      preco_unitario: venda.preco_unitario.toString(),
      observacao: venda.observacao || '',
      data: venda.data.split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda? O estoque será restaurado.')) {
      try {
        await api.delete(`/api/vendas/${id}`);
        toast.success('Venda excluída com sucesso!');
        fetchVendas();
        fetchProdutos(); // Atualizar estoque
      } catch (error) {
        toast.error('Erro ao excluir venda');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      produto_id: '',
      funcionario_id: '',
      quantidade: '',
      preco_unitario: '',
      observacao: '',
      data: new Date().toISOString().split('T')[0]
    });
  };

  const handleNewSale = () => {
    setEditingSale(null);
    resetForm();
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSale(null);
    resetForm();
  };

  const handleProductChange = (produtoId) => {
    const produto = produtos.find(p => p.id.toString() === produtoId);
    if (produto) {
      setFormData({
        ...formData,
        produto_id: produtoId,
        preco_unitario: produto.preco_venda?.toString() || '0'
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filtros
  const filteredVendas = vendas.filter(venda => {
    const matchesSearch = venda.produto_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venda.funcionario_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venda.observacao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmployee = selectedEmployee === 'all' || venda.funcionario_id.toString() === selectedEmployee;
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && new Date(venda.data).toDateString() === new Date().toDateString()) ||
                       (dateFilter === 'week' && (new Date() - new Date(venda.data)) <= 7 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === 'month' && (new Date() - new Date(venda.data)) <= 30 * 24 * 60 * 60 * 1000);

    return matchesSearch && matchesEmployee && matchesDate;
  });

  // Estatísticas
  const totalVendas = vendas.length;
  const valorTotalVendas = vendas.reduce((total, v) => total + (v.quantidade * v.preco_unitario), 0);
  const vendasHoje = vendas.filter(v => new Date(v.data).toDateString() === new Date().toDateString()).length;
  const valorVendasHoje = vendas.filter(v => new Date(v.data).toDateString() === new Date().toDateString())
    .reduce((total, v) => total + (v.quantidade * v.preco_unitario), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
          <p className="text-red-600 font-medium">Registre e gerencie as vendas do BAR DO CARNEIRO</p>
        </div>
        <button
          onClick={() => navigate('/vendas/nova')}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Venda
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold text-gray-900">{totalVendas}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(valorTotalVendas)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
              <p className="text-2xl font-bold text-blue-600">{vendasHoje}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Hoje</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(valorVendasHoje)}</p>
            </div>
            <Receipt className="w-8 h-8 text-blue-500" />
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
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">Todos os funcionários</option>
            {funcionarios.map(funcionario => (
              <option key={funcionario.id} value={funcionario.id}>{funcionario.nome}</option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">Todas as datas</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>

          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {filteredVendas.length} de {vendas.length} vendas
          </div>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingSale ? 'Editar Venda' : 'Nova Venda'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto *
              </label>
              <select
                required
                value={formData.produto_id}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Selecione um produto</option>
                {produtos.filter(p => p.quantidade > 0).map(produto => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} - Estoque: {produto.quantidade} - R$ {produto.preco_venda}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funcionário *
              </label>
              <select
                required
                value={formData.funcionario_id}
                onChange={(e) => setFormData({...formData, funcionario_id: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Selecione um funcionário</option>
                {funcionarios.map(funcionario => (
                  <option key={funcionario.id} value={funcionario.id}>{funcionario.nome} - {funcionario.cargo}</option>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço Unitário (R$) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.preco_unitario}
                onChange={(e) => setFormData({...formData, preco_unitario: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Observações sobre a venda..."
              />
            </div>

            {formData.produto_id && formData.quantidade && formData.preco_unitario && (
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Resumo da Venda</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Quantidade:</span>
                    <span className="ml-2 font-medium">{formData.quantidade}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Preço Unitário:</span>
                    <span className="ml-2 font-medium">{formatCurrency(parseFloat(formData.preco_unitario))}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Total:</span>
                    <span className="ml-2 font-bold text-lg text-primary">
                      {formatCurrency(parseFloat(formData.quantidade) * parseFloat(formData.preco_unitario))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {editingSale ? 'Atualizar' : 'Registrar'} Venda
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

      {/* Lista de Vendas */}
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
                  Funcionário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Unit.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Nenhuma venda encontrada</p>
                    <p className="text-sm">Comece registrando sua primeira venda!</p>
                  </td>
                </tr>
              ) : (
                filteredVendas.map((venda) => {
                  const total = venda.quantidade * venda.preco_unitario;
                  
                  return (
                    <tr key={venda.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(venda.data)}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(venda.data)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{venda.produto_nome}</div>
                            <div className="text-xs text-gray-500">{venda.produto_categoria}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{venda.funcionario_nome}</div>
                            <div className="text-xs text-gray-500">{venda.funcionario_cargo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{venda.quantidade}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatCurrency(venda.preco_unitario)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-primary">{formatCurrency(total)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(venda)}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(venda.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
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

export default Vendas;
