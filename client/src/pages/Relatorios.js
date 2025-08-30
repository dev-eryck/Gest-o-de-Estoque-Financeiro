import React, { useState, useEffect } from 'react';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Package, Users, ShoppingCart, DollarSign } from 'lucide-react';
import api from '../config/axios';
import toast from 'react-hot-toast';

const Relatorios = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    produtos: 0,
    funcionarios: 0,
    vendas: 0,
    valorTotal: 0
  });
  const [vendasPorMes, setVendasPorMes] = useState([]);
  const [produtosPorCategoria, setProdutosPorCategoria] = useState([]);
  const [topProdutos, setTopProdutos] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas básicas
      const [produtosRes, funcionariosRes, vendasRes] = await Promise.all([
              api.get('/api/produtos'),
      api.get('/api/funcionarios'),
      api.get('/api/vendas')
      ]);

      const produtos = produtosRes.data.data || [];
      const funcionarios = funcionariosRes.data.data || [];
      const vendas = vendasRes.data.data || [];

      // Calcular estatísticas
      const valorTotal = vendas.reduce((sum, v) => sum + (v.preco_unitario * v.quantidade), 0);
      
      setStats({
        produtos: produtos.length,
        funcionarios: funcionarios.length,
        vendas: vendas.length,
        valorTotal: valorTotal.toFixed(2)
      });

      // Simular dados de vendas por mês (em um sistema real, viria da API)
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const vendasPorMesData = meses.map((mes, index) => ({
        mes,
        vendas: Math.floor(Math.random() * 50) + 10,
        valor: Math.floor(Math.random() * 5000) + 1000
      }));
      setVendasPorMes(vendasPorMesData);

      // Simular produtos por categoria
      const categorias = ['Bebidas', 'Comidas', 'Limpeza', 'Outros'];
      const produtosPorCategoriaData = categorias.map(cat => ({
        categoria: cat,
        quantidade: Math.floor(Math.random() * 20) + 5
      }));
      setProdutosPorCategoria(produtosPorCategoriaData);

      // Simular top produtos
      const topProdutosData = produtos.slice(0, 5).map((prod, index) => ({
        nome: prod.nome,
        vendas: Math.floor(Math.random() * 100) + 10,
        valor: (prod.preco_venda * (Math.floor(Math.random() * 100) + 10)).toFixed(2)
      }));
      setTopProdutos(topProdutosData);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <BarChart className="w-8 h-8 text-red-600 mr-3" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-red-600 font-medium">Análises e métricas do sistema</p>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.produtos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Funcionários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.funcionarios}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.vendas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ {stats.valorTotal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por mês */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vendasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
                             {/* Legend removido temporariamente */}
              <Line type="monotone" dataKey="vendas" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Produtos por categoria */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={produtosPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoria, quantidade }) => `${categoria}: ${quantidade}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {produtosPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top produtos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Produtos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProdutos.map((produto, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {produto.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {produto.vendas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {produto.valor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão de atualizar */}
      <div className="flex justify-center">
        <button
          onClick={fetchData}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Atualizar Relatórios
        </button>
      </div>
    </div>
  );
};

export default Relatorios;
