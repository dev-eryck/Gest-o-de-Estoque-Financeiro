import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, Users, ShoppingCart, DollarSign, AlertTriangle, ArrowUpRight, Activity } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProdutos: 0,
    totalFuncionarios: 0,
    totalVendas: 0,
    valorTotalVendas: 0
  });
  const [vendasPorMes, setVendasPorMes] = useState([]);
  const [produtosPorCategoria, setProdutosPorCategoria] = useState([]);
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas
      const [produtosRes, funcionariosRes, vendasRes] = await Promise.all([
        axios.get('/api/produtos'),
        axios.get('/api/funcionarios'),
        axios.get('/api/vendas')
      ]);

      const produtos = produtosRes.data.data || [];
      const funcionarios = funcionariosRes.data.data || [];
      const vendas = vendasRes.data.data || [];

      // Calcular estatísticas
      const valorTotal = vendas.reduce((total, venda) => {
        const produto = produtos.find(p => p.id === venda.produto_id);
        return total + (produto ? produto.preco_venda * venda.quantidade : 0);
      }, 0);

      // Produtos com baixo estoque
      const baixoEstoque = produtos.filter(p => p.quantidade <= p.estoque_minimo);

      setStats({
        totalProdutos: produtos.length,
        totalFuncionarios: funcionarios.length,
        totalVendas: vendas.length,
        valorTotalVendas: valorTotal
      });

      setProdutosBaixoEstoque(baixoEstoque);

      // Dados para gráficos
      const vendasPorMesData = [
        { mes: 'Jan', vendas: 12, valor: 2400 },
        { mes: 'Fev', vendas: 19, valor: 3800 },
        { mes: 'Mar', vendas: 15, valor: 3000 },
        { mes: 'Abr', vendas: 22, valor: 4400 },
        { mes: 'Mai', vendas: 18, valor: 3600 },
        { mes: 'Jun', vendas: 25, valor: 5000 }
      ];

      // Calcular produtos por categoria usando dados reais
      const categoriasCount = {};
      produtos.forEach(produto => {
        if (produto.categoria) {
          categoriasCount[produto.categoria] = (categoriasCount[produto.categoria] || 0) + 1;
        }
      });

      const categoriasData = Object.entries(categoriasCount).map(([categoria, count], index) => {
        const colors = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#06b6d4', '#84cc16'];
        return {
          name: categoria,
          value: count,
          color: colors[index % colors.length]
        };
      });

      // Se não houver categorias, usar dados padrão
      if (categoriasData.length === 0) {
        categoriasData.push(
          { name: 'Sem Categoria', value: produtos.length, color: '#6b7280' }
        );
      }

      setVendasPorMes(vendasPorMesData);
      setProdutosPorCategoria(categoriasData);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-red-600 font-medium">Visão geral do sistema BAR DO CARNEIRO</p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-red-600" />
          <span className="text-sm text-gray-600">Tempo real</span>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Produtos */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Total de Produtos</p>
              <p className="text-3xl font-bold text-red-900">{stats.totalProdutos}</p>
            </div>
            <div className="p-3 bg-red-500 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpRight className="w-4 h-4 text-red-600 mr-1" />
            <span className="text-red-600 font-medium">+12%</span>
            <span className="text-gray-600 ml-1">vs mês anterior</span>
          </div>
        </div>

        {/* Total de Funcionários */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Funcionários</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalFuncionarios}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpRight className="w-4 h-4 text-blue-600 mr-1" />
            <span className="text-blue-600 font-medium">+5%</span>
            <span className="text-gray-600 ml-1">vs mês anterior</span>
          </div>
        </div>

        {/* Total de Vendas */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total de Vendas</p>
              <p className="text-3xl font-bold text-green-900">{stats.totalVendas}</p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+18%</span>
            <span className="text-gray-600 ml-1">vs mês anterior</span>
          </div>
        </div>

        {/* Valor Total */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Valor Total</p>
              <p className="text-3xl font-bold text-purple-900">R$ {stats.valorTotalVendas.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpRight className="w-4 h-4 text-purple-600 mr-1" />
            <span className="text-purple-600 font-medium">+23%</span>
            <span className="text-gray-600 ml-1">vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Vendas por Mês */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Vendas por Mês</h3>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="vendas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Produtos por Categoria */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Produtos por Categoria</h3>
            <Package className="w-5 h-5 text-red-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={produtosPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {produtosPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertas e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos com Baixo Estoque */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Alerta de Estoque</h3>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          {produtosBaixoEstoque.length > 0 ? (
            <div className="space-y-3">
              {produtosBaixoEstoque.slice(0, 5).map((produto) => (
                <div key={produto.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-900">{produto.nome}</p>
                    <p className="text-sm text-red-600">Estoque: {produto.quantidade}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Crítico
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 font-medium">Estoque em dia!</p>
              <p className="text-gray-500 text-sm">Todos os produtos estão com estoque adequado</p>
            </div>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex flex-col items-center">
              <Package className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Novo Produto</span>
            </button>
            <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex flex-col items-center">
              <Users className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Novo Funcionário</span>
            </button>
            <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex flex-col items-center">
              <ShoppingCart className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Nova Venda</span>
            </button>
            <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex flex-col items-center">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Relatórios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
