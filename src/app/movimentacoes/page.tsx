'use client';

import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/data/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateTime, exportToCSV } from '@/lib/utils';
import { 
  Move, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Download,
  Package
} from 'lucide-react';
import Link from 'next/link';

export default function MovimentacoesPage() {
  const { moves, products, employees, suppliers } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const categories = Array.from(new Set(products.map(p => p.category)));
  const suppliersList = suppliers;

  const filteredMoves = moves.filter(move => {
    const product = products.find(p => p.id === move.productId);
    if (!product) return false;

    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || !typeFilter || move.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || !categoryFilter || product.category === categoryFilter;
    const matchesSupplier = supplierFilter === 'all' || !supplierFilter || product.supplierId === supplierFilter;
    const matchesDate = dateFilter === 'all' || !dateFilter || move.date.startsWith(dateFilter);

    return matchesSearch && matchesType && matchesCategory && matchesSupplier && matchesDate;
  });

  const handleExportCSV = () => {
    const exportData = filteredMoves.map(move => {
      const product = products.find(p => p.id === move.productId);
      const employee = employees.find(e => e.id === move.employeeId);
      const supplier = product ? suppliers.find(s => s.id === product.supplierId) : null;

      return {
        Data: formatDateTime(move.date),
        Tipo: move.type === 'entrada' ? 'Entrada' : 'Saída',
        Produto: product?.name || '',
        SKU: product?.sku || '',
        Categoria: product?.category || '',
        Fornecedor: supplier?.name || '',
        Quantidade: move.quantity,
        'Custo Unitário': move.unitCost ? formatCurrency(move.unitCost) : 'N/A',
        'Preço Unitário': move.unitPrice ? formatCurrency(move.unitPrice) : 'N/A',
        Motivo: move.reason,
        Funcionário: employee?.name || '',
        Observações: move.notes || ''
      };
    });
    
    exportToCSV(exportData, 'movimentacoes');
  };

  const getMoveTypeIcon = (type: 'entrada' | 'saída') => {
    return type === 'entrada' ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : (
      <TrendingDown className="h-4 w-4 text-danger" />
    );
  };

  const getMoveTypeBadge = (type: 'entrada' | 'saída') => {
    return type === 'entrada' ? (
      <Badge variant="success">Entrada</Badge>
    ) : (
      <Badge variant="destructive">Saída</Badge>
    );
  };

  if (moves.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Movimentações</h1>
            <p className="text-muted-foreground">
              Controle de entrada e saída de produtos do BAR DO CARNEIRO
            </p>
          </div>
        </div>
        <Breadcrumbs />
        <EmptyState
          icon={Move}
          title="Nenhuma movimentação registrada"
          description="Comece registrando a primeira movimentação de estoque."
          actionLabel="Nova Movimentação"
          onAction={() => window.location.href = '/movimentacoes?action=nova'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimentações</h1>
          <p className="text-muted-foreground">
            Controle de entrada e saída de produtos do BAR DO CARNEIRO
          </p>
        </div>
        <Button asChild>
          <Link href="/movimentacoes?action=nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Movimentação
          </Link>
        </Button>
      </div>

      <Breadcrumbs />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="text-sm font-medium">Buscar Produto</label>
              <Input
                placeholder="Nome ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saída">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Fornecedor</label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os fornecedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {suppliersList.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moves List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Histórico de Movimentações
            <Badge variant="outline" className="ml-2">
              {filteredMoves.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMoves.map((move) => {
              const product = products.find(p => p.id === move.productId);
              const employee = employees.find(e => e.id === move.employeeId);
              const supplier = product ? suppliers.find(s => s.id === product.supplierId) : null;

              if (!product) return null;

              return (
                <div key={move.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {getMoveTypeIcon(move.type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <Badge variant="outline">{product.sku}</Badge>
                        {getMoveTypeBadge(move.type)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>Quantidade: {move.quantity} {product.unit}</span>
                        {move.unitCost && (
                          <span>Custo: {formatCurrency(move.unitCost)}</span>
                        )}
                        {move.unitPrice && (
                          <span>Preço: {formatCurrency(move.unitPrice)}</span>
                        )}
                        <span>Motivo: {move.reason}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>Funcionário: {employee?.name}</span>
                        <span>Data: {formatDateTime(move.date)}</span>
                        <span>Fornecedor: {supplier?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {move.type === 'entrada' ? '+' : '-'}{move.quantity} {product.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Estoque: {product.stock} {product.unit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMoves.length === 0 && (
            <EmptyState
              icon={Search}
              title="Nenhuma movimentação encontrada"
              description="Tente ajustar os filtros de busca."
            />
          )}
        </CardContent>
      </Card>

      {/* Export Button */}
      {filteredMoves.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV ({filteredMoves.length} movimentações)
          </Button>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild variant="outline" className="h-20">
              <Link href="/movimentacoes?action=nova&type=entrada">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" />
                  <div>Nova Entrada</div>
                  <div className="text-xs text-muted-foreground">Compra ou ajuste</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20">
              <Link href="/movimentacoes?action=nova&type=saida">
                <div className="text-center">
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-danger" />
                  <div>Nova Saída</div>
                  <div className="text-xs text-muted-foreground">Venda ou perda</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20">
              <Link href="/produtos">
                <div className="text-center">
                  <Package className="h-6 w-6 mx-auto mb-2" />
                  <div>Ver Produtos</div>
                  <div className="text-xs text-muted-foreground">Gerenciar estoque</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
