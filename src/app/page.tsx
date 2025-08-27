'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Search,
  ArrowRight,
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { products, employees, moves } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Estatísticas
  const totalProducts = products.length;
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.active).length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  
  // Movimentações recentes
  const recentMoves = moves.slice(0, 5);
  
  // Produtos com baixo estoque
  const criticalProducts = products.filter(p => p.stock <= p.minStock).slice(0, 5);

  // Calcular receita total das movimentações de saída (vendas)
  const totalRevenue = moves
    .filter(m => m.type === 'saída' && m.reason === 'venda')
    .reduce((sum, m) => sum + (m.quantity * (m.unitPrice || 0)), 0);

  // Produtos filtrados por busca
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral do sistema BAR DO CARNEIRO
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produtos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Funcionários Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              de {totalEmployees} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Movimentações
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{moves.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de movimentações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Atalhos Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/produtos/novo">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 hover:border-blue-300">
                <CardContent className="p-4 text-center">
                  <Plus className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-blue-600">Novo Produto</h3>
                  <p className="text-sm text-muted-foreground">Cadastrar produto</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/funcionarios/novo">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 hover:border-green-300">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-green-600">Novo Funcionário</h3>
                  <p className="text-sm text-muted-foreground">Cadastrar funcionário</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/vendas">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-red-200 hover:border-red-300">
                <CardContent className="p-4 text-center">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <h3 className="font-semibold text-red-600">Nova Venda</h3>
                  <p className="text-sm text-muted-foreground">Registrar venda</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/movimentacoes/nova">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 hover:border-purple-300">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold text-purple-600">Movimentação</h3>
                  <p className="text-sm text-muted-foreground">Ajustar estoque</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos com Baixo Estoque */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Produtos com baixo estoque:</span>
                <Badge variant="warning" className="bg-orange-100 text-orange-800">
                  {lowStockProducts}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Produtos sem estoque:</span>
                <Badge variant="destructive">
                  {outOfStockProducts}
                </Badge>
              </div>
              
              {criticalProducts.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Produtos críticos:</h4>
                  <div className="space-y-2">
                    {criticalProducts.map(product => (
                      <div key={product.id} className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                        <span className="text-sm">{product.name}</span>
                        <Badge variant="outline" className="text-orange-600">
                          Estoque: {product.stock}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Movimentações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Movimentações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMoves.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma movimentação recente
                </p>
              ) : (
                recentMoves.map((move, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={move.type === 'entrada' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {move.type}
                      </Badge>
                      <span className="text-sm">
                        {products.find(p => p.id === move.productId)?.name || 'Produto não encontrado'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {move.quantity} unid.
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(move.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {moves.length > 5 && (
                <div className="mt-4 text-center">
                  <Link href="/movimentacoes">
                    <Button variant="outline" size="sm">
                      Ver todas as movimentações
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Produtos em Destaque */}
      {searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos Encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{product.name}</h3>
                    <Badge 
                      variant={product.stock === 0 ? 'destructive' : product.stock <= product.minStock ? 'secondary' : 'default'}
                    >
                      {product.stock === 0 ? 'Sem Estoque' : product.stock <= product.minStock ? 'Baixo Estoque' : 'Em Estoque'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Estoque: {product.stock}</span>
                    <span className="text-sm font-bold text-green-600">
                      R$ {product.price.toFixed(2)}
                    </span>
      </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links de Navegação */}
      <Card>
        <CardHeader>
          <CardTitle>Navegação Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/produtos">
              <Button variant="outline" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                Produtos
              </Button>
            </Link>
            
            <Link href="/funcionarios">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Funcionários
              </Button>
            </Link>
            
            <Link href="/vendas">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Vendas
              </Button>
            </Link>
            
            <Link href="/relatorios">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

