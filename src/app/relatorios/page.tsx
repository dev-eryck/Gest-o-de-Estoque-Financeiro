'use client';

import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  Users, 
  Building2,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  AlertCircle
} from 'lucide-react';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function RelatoriosPage() {
  const { products, suppliers, employees, moves, getDashboardStats } = useAppStore();
  const [periodFilter, setPeriodFilter] = useState('30');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = Array.from(new Set(products.map(p => p.category)));
  const stats = getDashboardStats();

  // Filter data based on period
  const getFilteredData = () => {
    const days = parseInt(periodFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return {
      moves: moves.filter(move => new Date(move.date) >= cutoffDate),
      products: products,
      suppliers: suppliers,
      employees: employees
    };
  };

  const filteredData = getFilteredData();

  // Stock by Category Chart Data
  const stockByCategory = categories.map(category => {
    const categoryProducts = products.filter(p => p.category === category);
    const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = categoryProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    return {
      category,
      stock: totalStock,
      value: totalValue,
      products: categoryProducts.length
    };
  }).sort((a, b) => b.value - a.value);

  // Stock Movements Chart Data
  const movementsByDate = filteredData.moves.reduce((acc, move) => {
    const date = new Date(move.date).toLocaleDateString('pt-BR', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    if (!acc[date]) {
      acc[date] = { date, entrada: 0, saida: 0 };
    }
    
    if (move.type === 'entrada') {
      acc[date].entrada += move.quantity;
    } else {
      acc[date].saida += move.quantity;
    }
    
    return acc;
  }, {} as Record<string, { date: string; entrada: number; saida: number }>);

  const movementsChartData = Object.values(movementsByDate).slice(-14);

  // Top Products by Stock Value
  const topProductsByValue = products
    .map(p => ({
      name: p.name,
      value: p.price * p.stock,
      stock: p.stock,
      category: p.category
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Supplier Performance
  const supplierPerformance = suppliers.map(supplier => {
    const supplierProducts = products.filter(p => p.supplierId === supplier.id);
    const totalProducts = supplierProducts.length;
    const totalValue = supplierProducts.reduce((sum, p) => sum + (p.cost * p.stock), 0);
    const lowStockProducts = supplierProducts.filter(p => p.stock <= p.minStock).length;
    
    return {
      name: supplier.name,
      products: totalProducts,
      value: totalValue,
      lowStock: lowStockProducts,
      status: 'ativo' // Default status since Supplier doesn't have status
    };
  }).sort((a, b) => b.value - a.value);

  // Employee Activity
  const employeeActivity = employees.map(employee => {
    const employeeMoves = filteredData.moves.filter(move => move.employeeId === employee.id);
    const totalMoves = employeeMoves.length;
    const totalQuantity = employeeMoves.reduce((sum, move) => sum + move.quantity, 0);
    
    return {
      name: employee.name,
      moves: totalMoves,
      quantity: totalQuantity,
      role: employee.role
    };
  }).sort((a, b) => b.moves - a.moves);

  const handleExportReport = (type: string) => {
    let exportData: any[] = [];
    let filename = '';

    switch (type) {
      case 'produtos':
        exportData = products.map(p => ({
          Nome: p.name,
          SKU: p.sku,
          Categoria: p.category,
          Fornecedor: suppliers.find(s => s.id === p.supplierId)?.name || '',
          Estoque: p.stock,
          'Estoque Mínimo': p.minStock,
          'Preço de Custo': formatCurrency(p.cost),
          'Preço de Venda': formatCurrency(p.price),
          'Valor em Estoque': formatCurrency(p.price * p.stock),
          Status: p.stock <= p.minStock ? 'Baixo Estoque' : 'OK'
        }));
        filename = 'relatorio-produtos';
        break;
      
      case 'movimentacoes':
        exportData = filteredData.moves.map(move => {
          const product = products.find(p => p.id === move.productId);
          const employee = employees.find(e => e.id === move.employeeId);
          const supplier = product ? suppliers.find(s => s.id === product.supplierId) : null;
          
          return {
            Data: formatDate(move.date),
            Tipo: move.type === 'entrada' ? 'Entrada' : 'Saída',
            Produto: product?.name || '',
            Quantidade: move.quantity,
            'Custo Unitário': move.unitCost ? formatCurrency(move.unitCost) : 'N/A',
            'Preço Unitário': move.unitPrice ? formatCurrency(move.unitPrice) : 'N/A',
            Motivo: move.reason,
            Funcionário: employee?.name || '',
            Fornecedor: supplier?.name || ''
          };
        });
        filename = 'relatorio-movimentacoes';
        break;
      
      case 'fornecedores':
        exportData = supplierPerformance.map(s => ({
          Nome: s.name,
          'Total de Produtos': s.products,
          'Valor Total': formatCurrency(s.value),
          'Produtos Baixo Estoque': s.lowStock,
          Status: s.status
        }));
        filename = 'relatorio-fornecedores';
        break;
    }

    if (exportData.length > 0) {
      exportToCSV(exportData, filename);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises e estatísticas do BAR DO CARNEIRO
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="365">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      <Breadcrumbs />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockProducts} com baixo estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Custo: {formatCurrency(stats.totalCost)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.moves.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {periodFilter} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              {employees.filter(e => e.active).length} ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stock by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estoque por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockByCategory.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' ? formatCurrency(Number(value)) : value,
                    name === 'value' ? 'Valor' : 'Estoque'
                  ]}
                />
                <Legend />
                <Bar dataKey="stock" fill="#3b82f6" name="Estoque" />
                <Bar dataKey="value" fill="#10b981" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Movements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Movimentações de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={movementsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="entrada" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Entrada"
                />
                <Line 
                  type="monotone" 
                  dataKey="saida" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Saída"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products by Value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top 10 Produtos por Valor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsByValue} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Supplier Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Performance dos Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierPerformance.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' ? formatCurrency(Number(value)) : value,
                    name === 'value' ? 'Valor' : 'Produtos'
                  ]}
                />
                <Legend />
                <Bar dataKey="products" fill="#3b82f6" name="Produtos" />
                <Bar dataKey="value" fill="#10b981" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Employee Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Atividade dos Funcionários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeActivity.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="moves" fill="#f59e0b" name="Movimentações" />
              <Bar dataKey="quantity" fill="#8b5cf6" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Export Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              onClick={() => handleExportReport('produtos')} 
              variant="outline" 
              className="h-20"
            >
              <div className="text-center">
                <Package className="h-6 w-6 mx-auto mb-2" />
                <div>Relatório de Produtos</div>
                <div className="text-xs text-muted-foreground">Estoque e valores</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => handleExportReport('movimentacoes')} 
              variant="outline" 
              className="h-20"
            >
              <div className="text-center">
                <Activity className="h-6 w-6 mx-auto mb-2" />
                <div>Relatório de Movimentações</div>
                <div className="text-xs text-muted-foreground">Entradas e saídas</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => handleExportReport('fornecedores')} 
              variant="outline" 
              className="h-20"
            >
              <div className="text-center">
                <Building2 className="h-6 w-6 mx-auto mb-2" />
                <div>Relatório de Fornecedores</div>
                <div className="text-xs text-muted-foreground">Performance e produtos</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockProducts > 0 ? (
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <div className="text-2xl font-bold text-warning">{stats.lowStockProducts}</div>
                  <div className="text-sm text-muted-foreground">Produtos com baixo estoque</div>
                </div>
              ) : (
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">✓</div>
                  <div className="text-sm text-muted-foreground">Todos os produtos com estoque adequado</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-danger" />
              Produtos a Vencer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.expiringProducts > 0 ? (
                <div className="text-center p-4 bg-danger/10 rounded-lg">
                  <div className="text-2xl font-bold text-danger">{stats.expiringProducts}</div>
                  <div className="text-sm text-muted-foreground">Produtos próximos do vencimento</div>
                </div>
              ) : (
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">✓</div>
                  <div className="text-sm text-muted-foreground">Nenhum produto próximo do vencimento</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
