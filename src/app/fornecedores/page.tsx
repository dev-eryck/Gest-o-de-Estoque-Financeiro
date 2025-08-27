'use client';

import { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/data/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatPhone, formatCNPJ, exportToCSV } from '@/lib/utils';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function FornecedoresPage() {
  const { suppliers, products, deleteSupplier } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.cnpj && supplier.cnpj.includes(searchTerm));
    const matchesCategory = categoryFilter === 'all' || !categoryFilter ||
                           products.some(p => p.supplierId === supplier.id && p.category === categoryFilter);

    return matchesSearch && matchesCategory;
  });

  const handleDeleteSupplier = (supplierId: string, supplierName: string) => {
    const supplierProducts = products.filter(p => p.supplierId === supplierId);
    if (supplierProducts.length > 0) {
      alert(`Não é possível excluir o fornecedor "${supplierName}" pois existem ${supplierProducts.length} produtos associados.`);
      return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o fornecedor "${supplierName}"?`)) {
      deleteSupplier(supplierId);
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredSuppliers.map(supplier => {
      const supplierProducts = products.filter(p => p.supplierId === supplier.id);
      const totalProducts = supplierProducts.length;
      const totalValue = supplierProducts.reduce((sum, p) => sum + (p.cost * p.stock), 0);

      return {
        Nome: supplier.name,
        CNPJ: supplier.cnpj,
        Email: supplier.email,
        Telefone: supplier.phone,
        Endereço: supplier.address || '',
        'Total de Produtos': totalProducts,
        'Valor Total em Estoque': totalValue.toFixed(2),
        'Data de Cadastro': new Date(supplier.createdAt).toLocaleDateString('pt-BR')
      };
    });
    
    exportToCSV(exportData, 'fornecedores');
  };

  if (suppliers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
            <p className="text-muted-foreground">
              Gerencie os fornecedores do BAR DO CARNEIRO
            </p>
          </div>
        </div>
        <Breadcrumbs />
        <EmptyState
          icon={Building2}
          title="Nenhum fornecedor cadastrado"
          description="Comece cadastrando o primeiro fornecedor."
          actionLabel="Novo Fornecedor"
          onAction={() => window.location.href = '/fornecedores/novo'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie os fornecedores do BAR DO CARNEIRO
          </p>
        </div>
        <Button asChild>
          <Link href="/fornecedores/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
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
                placeholder="Nome, email ou CNPJ..."
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
                  {Array.from(new Set(products.map(p => p.category))).map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value="all" onValueChange={(value) => {}} disabled>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  // setStatusFilter(''); // Status filter removed
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map((supplier) => {
          const supplierProducts = products.filter(p => p.supplierId === supplier.id);
          const totalProducts = supplierProducts.length;
          const totalValue = supplierProducts.reduce((sum, p) => sum + (p.cost * p.stock), 0);
          const lowStockProducts = supplierProducts.filter(p => p.stock <= p.minStock).length;

          return (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {supplier.cnpj && (
                          <Badge variant="outline">CNPJ: {supplier.cnpj}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/fornecedores/${supplier.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/fornecedores/${supplier.id}/editar`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
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
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{formatPhone(supplier.phone)}</span>
                  </div>
                  {supplier.address && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-lg font-bold text-primary">{totalProducts}</div>
                    <div className="text-xs text-muted-foreground">Produtos</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-lg font-bold text-warning">{lowStockProducts}</div>
                    <div className="text-xs text-muted-foreground">Baixo Estoque</div>
                  </div>
                </div>

                {totalValue > 0 && (
                  <div className="pt-2 border-t">
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground">Valor em Estoque</div>
                      <div className="text-lg font-bold text-success">
                        R$ {totalValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <EmptyState
          icon={Search}
          title="Nenhum fornecedor encontrado"
          description="Tente ajustar os filtros de busca."
        />
      )}

      {/* Export Button */}
      {filteredSuppliers.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={handleExportCSV} variant="outline">
            <Package className="mr-2 h-4 w-4" />
            Exportar CSV ({filteredSuppliers.length} fornecedores)
          </Button>
        </div>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{suppliers.length}</div>
              <div className="text-sm text-muted-foreground">Total de Fornecedores</div>
            </div>
            {/* <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-success">
                {suppliers.filter(s => s.status === 'ativo').length}
              </div>
              <div className="text-sm text-muted-foreground">Ativos</div>
            </div> */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {products.filter(p => p.stock <= p.minStock).length}
              </div>
              <div className="text-sm text-muted-foreground">Produtos Baixo Estoque</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {products.reduce((sum, p) => sum + (p.cost * p.stock), 0).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Valor Total (R$)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
