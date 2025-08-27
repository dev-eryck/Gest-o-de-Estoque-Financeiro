import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function NovoProduto() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    preco_venda: '',
    preco_custo: '',
    quantidade: '',
    categoria: '',
    descricao: '',
    codigo_barras: '',
    fornecedor: '',
    estoque_minimo: '5'
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Calcular margem de lucro automaticamente
  useEffect(() => {
    if (formData.preco_venda && formData.preco_custo) {
      const precoVenda = parseFloat(formData.preco_venda);
      const precoCusto = parseFloat(formData.preco_custo);
      
      if (precoVenda > 0 && precoCusto > 0) {
        const margem = ((precoVenda - precoCusto) / precoCusto) * 100;
        // A margem será exibida no campo calculado
      }
    }
  }, [formData.preco_venda, formData.preco_custo]);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get('/api/categorias');
      setCategorias(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação: preço de venda deve ser maior que preço de custo
    if (parseFloat(formData.preco_venda) <= parseFloat(formData.preco_custo)) {
      toast.error('O preço de venda deve ser maior que o preço de custo!');
      return;
    }
    
    setLoading(true);

    try {
      await axios.post('/api/produtos', formData);
      toast.success('Produto criado com sucesso!');
      navigate('/produtos');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/produtos')}
          className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Produtos
        </button>
        <div className="flex items-center">
          <Package className="w-8 h-8 text-red-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
            <p className="text-red-600 font-medium">Adicione um novo produto ao sistema</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ex: Cerveja Heineken"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.nome}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Preço de Custo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Custo *
              </label>
              <input
                type="number"
                name="preco_custo"
                value={formData.preco_custo}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="0.00"
              />
            </div>

            {/* Preço de Venda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Venda *
              </label>
              <input
                type="number"
                name="preco_venda"
                value={formData.preco_venda}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="0.00"
              />
            </div>

            {/* Margem de Lucro (Calculada) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Margem de Lucro
              </label>
              <input
                type="text"
                value={formData.preco_venda && formData.preco_custo ? 
                  `${(((formData.preco_venda - formData.preco_custo) / formData.preco_custo) * 100).toFixed(2)}%` : 
                  '0.00%'
                }
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Calculado automaticamente"
              />
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade Inicial *
              </label>
              <input
                type="number"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="0"
              />
            </div>

            {/* Código de Barras */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Barras
              </label>
              <input
                type="text"
                name="codigo_barras"
                value={formData.codigo_barras}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="1234567890123"
              />
            </div>

            {/* Fornecedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fornecedor
              </label>
              <input
                type="text"
                name="fornecedor"
                value={formData.fornecedor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Nome do fornecedor"
              />
            </div>

            {/* Estoque Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Mínimo
              </label>
              <input
                type="number"
                name="estoque_minimo"
                value={formData.estoque_minimo}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="5"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Descrição detalhada do produto..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Produto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NovoProduto;
