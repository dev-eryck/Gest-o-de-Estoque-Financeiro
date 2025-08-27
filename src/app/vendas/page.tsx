'use client';

import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  User, 
  Package, 
  Edit, 
  Trash2, 
  Receipt,
  TrendingUp,
  X
} from 'lucide-react';
import Link from 'next/link';

interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productName?: string;
}

interface Sale {
  id: string;
  items: SaleItem[];
  employeeId: string;
  total: number;
  date: string;
  notes?: string;
  employeeName?: string;
}

export default function VendasPage() {
  const { products, employees, addMove } = useAppStore();
  const { toast } = useToast();
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [formData, setFormData] = useState({
    employeeId: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productId: '',
    quantity: '',
    unitPrice: ''
  });

  // Filtrar produtos com estoque
  const availableProducts = products.filter(p => p.stock > 0);
  const activeEmployees = employees.filter(e => e.active);

  const addItemToSale = () => {
    if (!currentItem.productId || !currentItem.quantity || !currentItem.unitPrice) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos do item",
        variant: "destructive"
      });
      return;
    }

    const product = products.find(p => p.id === currentItem.productId);
    if (!product) return;

    const quantity = parseInt(currentItem.quantity);
    const unitPrice = parseFloat(currentItem.unitPrice);
    
    if (quantity > product.stock) {
      toast({
        title: "Erro",
        description: "Quantidade excede o estoque disponível",
        variant: "destructive"
      });
      return;
    }

    const newItem: SaleItem = {
      productId: currentItem.productId,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      productName: product.name
    };

    setSaleItems([...saleItems, newItem]);
    setCurrentItem({ productId: '', quantity: '', unitPrice: '' });
  };

  const removeItemFromSale = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || saleItems.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um funcionário e adicione pelo menos um item",
        variant: "destructive"
      });
      return;
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    try {
      const newSale: Sale = {
        id: `sale_${Date.now()}`,
        items: saleItems,
        employeeId: formData.employeeId,
        total: calculateTotal(),
        date: formData.date,
        notes: formData.notes,
        employeeName: employee.name
      };

      // Adicionar venda
      setSales(prev => [newSale, ...prev]);

      // Atualizar estoque para cada item
      saleItems.forEach(item => {
        addMove({
          productId: item.productId,
          type: 'saída',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          reason: 'venda',
          notes: formData.notes,
          employeeId: formData.employeeId,
          date: formData.date
        });
      });

      toast({ 
        title: "Venda registrada!", 
        description: `${saleItems.length} item(ns) vendido(s) com sucesso` 
      });
      
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast({ 
        title: "Erro ao registrar venda", 
        description: "Tente novamente", 
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSaleItems([]);
    setCurrentItem({ productId: '', quantity: '', unitPrice: '' });
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.items.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEmployee = selectedEmployee === 'all' || sale.employeeId === selectedEmployee;
    const matchesDate = dateFilter === 'all' || sale.date === dateFilter;
    
    return matchesSearch && matchesEmployee && matchesDate;
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = sales.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendas</h1>
          <p className="text-muted-foreground">Gerencie todas as vendas do estabelecimento</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSales}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {averageTicket.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Produto ou funcionário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="employee">Funcionário</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os funcionários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {activeEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Data</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as datas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Array.from(new Set(sales.map(s => s.date))).map(date => (
                    <SelectItem key={date} value={date}>
                      {new Date(date).toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedEmployee('all');
                  setDateFilter('all');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma venda encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Venda #{sale.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {sale.employeeName} • {new Date(sale.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        R$ {sale.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sale.items.length} item(ns)
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {sale.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{item.productName}</span>
                        <span className="text-muted-foreground">
                          {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {sale.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      Obs: {sale.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Nova Venda */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Nova Venda</h2>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações da Venda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeId">Funcionário *</Label>
                  <Select value={formData.employeeId} onValueChange={(value) => setFormData({...formData, employeeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeEmployees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Adicionar Itens */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Itens da Venda</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label htmlFor="productId">Produto</Label>
                    <Select value={currentItem.productId} onValueChange={(value) => setCurrentItem({...currentItem, productId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (Estoque: {product.stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      placeholder="Qtd"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="unitPrice">Preço Unit.</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="R$ 0,00"
                      value={currentItem.unitPrice}
                      onChange={(e) => setCurrentItem({...currentItem, unitPrice: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      onClick={addItemToSale}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Lista de Itens */}
                {saleItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Itens Adicionados:</h4>
                    {saleItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span>{item.productName}</span>
                        <div className="flex items-center space-x-4">
                          <span>{item.quantity}x R$ {item.unitPrice.toFixed(2)}</span>
                          <span className="font-semibold">R$ {item.total.toFixed(2)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItemFromSale(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total da Venda:</span>
                        <span className="text-green-600">R$ {calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações sobre a venda..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Finalizar Venda
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
