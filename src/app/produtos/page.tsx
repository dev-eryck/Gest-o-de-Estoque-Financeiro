'use client';

import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/data/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatCurrency, getCategoryColor, getStockStatus, getExpiryStatus, exportToCSV } from '@/lib/utils';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy,
  Download,
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function ProdutosPage() {
  const { products, suppliers, deleteProduct } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const categories = Array.from(new Set(products.map(p => p.category)));
  const suppliersList = suppliers;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || !categoryFilter || product.category === categoryFilter;
    const matchesSupplier = supplierFilter === 'all' || !supplierFilter || product.supplierId === supplierFilter;
    const matchesStock = stockFilter === 'all' || !stockFilter || 
      (stockFilter === 'low' && product.stock <= product.minStock) ||
      (stockFilter === 'out' && product.stock === 0) ||
      (stockFilter === 'normal' && product.stock > product.minStock);

    return matchesSearch && matchesCategory && matchesSupplier && matchesStock;
  });

  const handleExportCSV = () => {
    const exportData = filteredProducts.map(product => ({
      Nome: product.name,
      SKU: product.sku,
      Categoria: product.category,
      Fornecedor: suppliers.find(s => s.id === product.supplierId)?.name || '',
      Estoque: product.stock,
      'Estoque Mínimo': product.minStock,
      'Preço de Custo': product.cost,
      'Preço de Venda': product.price,
      Localização: product.location,
      Validade: product.expiry || 'N/A'
    }));
    
    exportToCSV(exportData, 'produtos');
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(productId);
    }
  };

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie o catálogo de produtos do BAR DO CARNEIRO
            </p>
          </div>
        </div>
        <Breadcrumbs />
        <EmptyState
          icon={Package}
          title="Nenhum produto cadastrado"
          description="Comece adicionando seu primeiro produto ao sistema."
          actionLabel="Adicionar Produto"
          onAction={() => window.location.href = '/produtos/novo'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos do BAR DO CARNEIRO
          </p>
        </div>
        <Button asChild>
          <Link href="/produtos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
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
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Nome ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
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
              <label className="text-sm font-medium">Status do Estoque</label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="normal">Estoque Normal</SelectItem>
                  <SelectItem value="low">Baixo Estoque</SelectItem>
                  <SelectItem value="out">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const supplier = suppliers.find(s => s.id === product.supplierId);
          const stockStatus = getStockStatus(product.stock, product.minStock);
          const expiryStatus = product.expiry ? getExpiryStatus(product.expiry) : 'normal';

          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.sku}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/produtos/${product.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/produtos/${product.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(product.category)}>
                    {product.category}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(product.price)}</p>
                    <p className="text-xs text-muted-foreground">
                      Custo: {formatCurrency(product.cost)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estoque:</span>
                    <span className={stockStatus === 'low' ? 'text-warning font-medium' : ''}>
                      {product.stock} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mínimo:</span>
                    <span>{product.minStock} {product.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Localização:</span>
                    <span className="text-muted-foreground">{product.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {supplier?.name}
                  </div>
                  <div className="flex gap-1">
                    {stockStatus === 'low' && (
                      <Badge variant="secondary">Baixo Estoque</Badge>
                    )}
                    {stockStatus === 'critical' && (
                      <Badge variant="destructive">Sem Estoque</Badge>
                    )}
                    {expiryStatus === 'warning' && (
                      <Badge variant="destructive">Vencendo</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Export Button */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV ({filteredProducts.length} produtos)
          </Button>
        </div>
      )}

      {filteredProducts.length === 0 && searchTerm && (
        <EmptyState
          icon={Search}
          title="Nenhum produto encontrado"
          description="Tente ajustar os filtros de busca."
        />
      )}
    </div>
  );
}

