'use client';

import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StatCard } from '@/components/data/StatCard';
import { TrendCard } from '@/components/data/TrendCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { formatCurrency, getStockStatus, getExpiryStatus } from '@/lib/utils';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  Move
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { getDashboardStats, getLowStockProducts, getExpiringProducts } = useAppStore();
  const [stats, setStats] = useState(getDashboardStats());

  useEffect(() => {
    setStats(getDashboardStats());
  }, [getDashboardStats]);

  const lowStockProducts = getLowStockProducts();
  const expiringProducts = getExpiringProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do estoque do BAR DO CARNEIRO
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/produtos/novo">
              <Package className="mr-2 h-4 w-4" />
              Novo Produto
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/movimentacoes">
              <Move className="mr-2 h-4 w-4" />
              Movimentações
            </Link>
          </Button>
        </div>
      </div>

      <Breadcrumbs />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Produtos"
          value={stats.totalProducts}
          icon={Package}
          variant="default"
        />
        <StatCard
          title="Baixo Estoque"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          variant="warning"
          description="Produtos com estoque mínimo"
        />
        <StatCard
          title="Vencendo em 7 dias"
          value={stats.expiringProducts}
          icon={Clock}
          variant="danger"
          description="Produtos próximos do vencimento"
        />
        <StatCard
          title="Total de Movimentações"
          value={stats.totalMoves}
          icon={Move}
          variant="default"
        />
      </div>

      {/* Financial Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <TrendCard
          title="Custo Total em Estoque"
          value={formatCurrency(stats.totalCost)}
          change={12.5}
          changeType="increase"
          icon={DollarSign}
          description="Valor total investido em produtos"
        />
        <TrendCard
          title="Valor Potencial de Venda"
          value={formatCurrency(stats.totalValue)}
          change={8.2}
          changeType="increase"
          icon={TrendingUp}
          description="Valor total se todos os produtos forem vendidos"
        />
      </div>

      {/* Alerts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Produtos com Baixo Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Todos os produtos estão com estoque adequado.
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {product.stock} {product.unit} (Mín: {product.minStock})
                      </p>
                    </div>
                    <Badge variant="warning">Baixo Estoque</Badge>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos ({lowStockProducts.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Products Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-danger" />
              Produtos Vencendo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum produto vencendo nos próximos 7 dias.
              </p>
            ) : (
              <div className="space-y-3">
                {expiringProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Vence em: {product.expiry}
                      </p>
                    </div>
                    <Badge variant="danger">Vencendo</Badge>
                  </div>
                ))}
                {expiringProducts.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos ({expiringProducts.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top 10 Produtos por Movimentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Produto</th>
                  <th className="text-left p-2 font-medium">Categoria</th>
                  <th className="text-left p-2 font-medium">Estoque</th>
                  <th className="text-left p-2 font-medium">Movimentações</th>
                  <th className="text-left p-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map(({ product, moves }) => (
                  <tr key={product.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="p-2">
                      <span className={getStockStatus(product.stock, product.minStock) === 'low' ? 'text-warning' : ''}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="p-2">{moves}</td>
                    <td className="p-2">
                      {getStockStatus(product.stock, product.minStock) === 'low' && (
                        <Badge variant="warning">Baixo Estoque</Badge>
                      )}
                      {product.expiry && getExpiryStatus(product.expiry) === 'warning' && (
                        <Badge variant="danger">Vencendo</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <Link href="/produtos">Ver Todos os Produtos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

