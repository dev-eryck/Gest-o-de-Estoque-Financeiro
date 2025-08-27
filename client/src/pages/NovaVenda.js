import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function NovaVenda() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    produto_id: '',
    funcionario_id: '',
    quantidade: '',
    total: '',
    observacao: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [produtosRes, funcionariosRes] = await Promise.all([
        axios.get('/api/produtos'),
        axios.get('/api/funcionarios')
      ]);
      
      setProdutos(produtosRes.data.data || []);
      setFuncionarios(funcionariosRes.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar produtos e funcionários');
    }
  };

  const handleProdutoChange = (e) => {
    const produtoId = e.target.value;
    const produto = produtos.find(p => p.id == produtoId);
    
    setFormData(prev => ({
      ...prev,
      produto_id: produtoId,
      total: produto && prev.quantidade ? (produto.preco_venda * prev.quantidade).toFixed(2) : ''
    }));
  };

  const handleQuantidadeChange = (e) => {
    const quantidade = parseFloat(e.target.value) || 0;
    const produto = produtos.find(p => p.id == formData.produto_id);
    const precoVenda = produto ? produto.preco_venda : 0;
    
    setFormData(prev => ({
      ...prev,
      quantidade: e.target.value,
      total: (quantidade * precoVenda).toFixed(2)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/vendas', formData);
      toast.success('Venda registrada com sucesso!');
      navigate('/vendas');
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      toast.error(error.response?.data?.message || 'Erro ao registrar venda');
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
          onClick={() => navigate('/vendas')}
          className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Vendas
        </button>
        <div className="flex items-center">
          <ShoppingCart className="w-8 h-8 text-red-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Venda</h1>
            <p className="text-red-600 font-medium">Registre uma nova venda no sistema</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto *
              </label>
              <select
                name="produto_id"
                value={formData.produto_id}
                onChange={handleProdutoChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Selecione um produto</option>
                {produtos.map(produto => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} - Estoque: {produto.quantidade}
                  </option>
                ))}
              </select>
            </div>

            {/* Funcionário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funcionário *
              </label>
              <select
                name="funcionario_id"
                value={formData.funcionario_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Selecione um funcionário</option>
                {funcionarios.filter(f => f.status === 'ativo').map(funcionario => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome} - {funcionario.cargo}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade *
              </label>
              <input
                type="number"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleQuantidadeChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="1"
              />
            </div>

            {/* Informações do Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Informações do Produto
              </label>
              {formData.produto_id && (() => {
                const produto = produtos.find(p => p.id == formData.produto_id);
                return produto ? (
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-sm text-gray-600">
                      <p><strong>Preço de Venda:</strong> R$ {produto.preco_venda?.toFixed(2) || '0.00'}</p>
                      <p><strong>Preço de Custo:</strong> R$ {produto.preco_custo?.toFixed(2) || '0.00'}</p>
                      <p><strong>Estoque:</strong> {produto.quantidade} unidades</p>
                      <p><strong>Margem:</strong> {produto.preco_venda && produto.preco_custo ? 
                        `${(((produto.preco_venda - produto.preco_custo) / produto.preco_custo) * 100).toFixed(2)}%` : '0.00%'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-500 text-sm">
                    Selecione um produto para ver as informações
                  </div>
                );
              })()}
            </div>

            {/* Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total da Venda
              </label>
              <input
                type="text"
                value={`R$ ${formData.total || '0.00'}`}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 font-semibold"
              />
            </div>
          </div>

          {/* Observação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observação
            </label>
            <textarea
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Observações sobre a venda..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/vendas')}
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
                  Registrando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Registrar Venda
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NovaVenda;
