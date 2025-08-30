import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import api from '../config/axios';
import toast from 'react-hot-toast';

const Produtos = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    preco_venda: '',
    preco_custo: '',
    quantidade: '',
    categoria: '',
    descricao: '',
    estoque_minimo: ''
  });

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/produtos');
      // A API retorna {success: true, data: [...]}
      setProdutos(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
      console.error('Erro:', error);
      setProdutos([]); // Garantir que produtos seja sempre um array
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await api.get('/api/categorias');
      // A API retorna {success: true, data: [...]}
      setCategorias(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategorias([]); // Garantir que categorias seja sempre um array
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await api.put(`/api/produtos/${editingProduct.id}`, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/api/produtos', formData);
        toast.success('Produto criado com sucesso!');
      }
      
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchProdutos();
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar produto';
      toast.error(message);
    }
  };

  const handleEdit = (produto) => {
    setEditingProduct(produto);
    setFormData({
      nome: produto.nome || '',
      preco_venda: produto.preco_venda?.toString() || '',
      preco_custo: produto.preco_custo?.toString() || '',
      quantidade: produto.quantidade?.toString() || '',
      categoria: produto.categoria || '',
      descricao: produto.descricao || '',
      estoque_minimo: produto.estoque_minimo?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/api/produtos/${id}`);
        toast.success('Produto excluído com sucesso!');
        fetchProdutos();
      } catch (error) {
        toast.error('Erro ao excluir produto');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      preco_venda: '',
      preco_custo: '',
      quantidade: '',
      categoria: '',
      descricao: '',
      estoque_minimo: ''
    });
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    resetForm();
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
  };

  // Filtros
  const filteredProdutos = Array.isArray(produtos) ? produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || produto.categoria === selectedCategory;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && produto.quantidade <= (produto.estoque_minimo || 5)) ||
                        (stockFilter === 'out' && produto.quantidade === 0);

    return matchesSearch && matchesCategory && matchesStock;
  }) : [];

  const getStockStatus = (quantidade, estoqueMinimo) => {
    if (quantidade === 0) return { text: 'Sem estoque', color: 'text-red-600', bg: 'bg-red-50' };
    if (quantidade <= (estoqueMinimo || 5)) return { text: 'Estoque baixo', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: 'Em estoque', color: 'text-green-600', bg: 'bg-green-50' };
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-red-600 font-medium">Gerencie o catálogo de produtos do BAR DO CARNEIRO</p>
        </div>
        <button
          onClick={() => navigate('/produtos/novo')}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Todas as categorias</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nome}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Todos os estoques</option>
              <option value="low">Estoque baixo</option>
              <option value="out">Sem estoque</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleNewProduct}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Formulário de Edição */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Nome do produto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nome}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.preco_venda}
                onChange={(e) => setFormData({...formData, preco_venda: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Custo (R$) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.preco_custo}
                onChange={(e) => setFormData({...formData, preco_custo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade em Estoque *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantidade}
                onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={formData.estoque_minimo}
                onChange={(e) => setFormData({...formData, estoque_minimo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Descrição detalhada do produto..."
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {editingProduct ? 'Atualizar' : 'Criar'} Produto
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

      {/* Lista de Produtos */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Venda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Custo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProdutos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Nenhum produto encontrado</p>
                    <p className="text-sm">Comece adicionando seu primeiro produto!</p>
                  </td>
                </tr>
              ) : (
                filteredProdutos.map((produto) => {
                  const stockStatus = getStockStatus(produto.quantidade, produto.estoque_minimo);
                  
                  return (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                          {produto.descricao && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {produto.descricao}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {produto.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        R$ {parseFloat(produto.preco_venda || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        R$ {parseFloat(produto.preco_custo || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{produto.quantidade}</div>
                        {produto.estoque_minimo && (
                          <div className="text-xs text-gray-500">
                            Mín: {produto.estoque_minimo}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.text === 'Estoque baixo' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(produto)}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(produto.id)}
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

export default Produtos;
