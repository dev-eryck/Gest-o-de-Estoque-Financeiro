'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAppStore } from '@/lib/store';
import { formatCurrency, generateId } from '@/lib/utils';
import { 
  ArrowLeft, 
  Save, 
  Package, 
  TrendingUp, 
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const movementSchema = z.object({
  type: z.enum(['entrada', 'saída']),
  productId: z.string().min(1, 'Selecione um produto'),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
  unitCost: z.number().min(0, 'Custo deve ser maior ou igual a 0').optional(),
  unitPrice: z.number().min(0, 'Preço deve ser maior ou igual a 0').optional(),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  notes: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  employeeId: z.string().min(1, 'Selecione um funcionário'),
  supplierId: z.string().optional()
});

type MovementFormData = z.infer<typeof movementSchema>;

export default function NovaMovimentacaoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { addMove, products, employees, suppliers, updateProductStock } = useAppStore();
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultType = searchParams.get('type') as 'entrada' | 'saída' || 'entrada';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: defaultType,
      date: new Date().toISOString().split('T')[0],
      employeeId: employees[0]?.id || ''
    }
  });

  const watchedType = watch('type');
  const watchedProductId = watch('productId');

  useEffect(() => {
    if (watchedProductId) {
      const product = products.find(p => p.id === watchedProductId);
      setSelectedProduct(product);
      if (product) {
        setValue('supplierId', product.supplierId);
      }
    }
  }, [watchedProductId, products, setValue]);

  const onSubmit = async (data: MovementFormData) => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      // Create the movement
      const newMove = {
        quantity: data.quantity,
        unitCost: data.unitCost,
        unitPrice: data.unitPrice,
        date: data.date,
        type: data.type,
        productId: data.productId,
        reason: data.reason as 'compra' | 'venda' | 'perda' | 'consumo_interno' | 'ajuste' | 'transferencia',
        employeeId: data.employeeId,
        supplierId: data.supplierId,
        notes: data.notes
      };

      addMove(newMove);

      // Update product stock
      const stockChange = data.type === 'entrada' ? data.quantity : -data.quantity;
      updateProductStock(selectedProduct.id, stockChange);

      toast({
        title: "Movimentação registrada!",
        description: `${data.type === 'entrada' ? 'Entrada' : 'Saída'} de ${data.quantity} ${selectedProduct.unit} registrada com sucesso.`,
      });

      router.push('/movimentacoes');
    } catch (error) {
      toast({
        title: "Erro ao registrar movimentação",
        description: "Ocorreu um erro ao salvar a movimentação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableProducts = products.filter(p => p.stock > 0 || watchedType === 'entrada');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Movimentação</h1>
          <p className="text-muted-foreground">
            Registre entrada ou saída de produtos do estoque
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/movimentacoes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <Breadcrumbs />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Movement Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {watchedType === 'entrada' ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-danger" />
              )}
              Tipo de Movimentação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select 
                  value={watchedType} 
                  onValueChange={(value: 'entrada' | 'saída') => setValue('type', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        Entrada (Compra/Ajuste)
                      </div>
                    </SelectItem>
                    <SelectItem value="saída">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-danger" />
                        Saída (Venda/Perda)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  type="date"
                  {...register('date')}
                  className="mt-1"
                />
                {errors.date && (
                  <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="productId">Produto *</Label>
                <Select 
                  value={watchedProductId} 
                  onValueChange={(value) => setValue('productId', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{product.name}</span>
                          <span className="text-muted-foreground text-sm">
                            Estoque: {product.stock} {product.unit}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && (
                  <p className="text-sm text-destructive mt-1">{errors.productId.message}</p>
                )}
              </div>

              {selectedProduct && (
                <div className="grid gap-4 md:grid-cols-3 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">SKU</Label>
                    <p className="text-sm">{selectedProduct.sku}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Categoria</Label>
                    <p className="text-sm">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estoque Atual</Label>
                    <p className={`text-sm font-medium ${
                      selectedProduct.stock <= selectedProduct.minStock ? 'text-destructive' : 
                      selectedProduct.stock <= selectedProduct.minStock * 1.5 ? 'text-warning' : 
                      'text-success'
                    }`}>
                      {selectedProduct.stock} {selectedProduct.unit}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Movement Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Movimentação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('quantity', { valueAsNumber: true })}
                  className="mt-1"
                  placeholder="0.00"
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>
                )}
                {selectedProduct && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Unidade: {selectedProduct.unit}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="employeeId">Funcionário Responsável *</Label>
                <Select 
                  value={watch('employeeId')} 
                  onValueChange={(value) => setValue('employeeId', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employeeId && (
                  <p className="text-sm text-destructive mt-1">{errors.employeeId.message}</p>
                )}
              </div>

              {watchedType === 'entrada' && (
                <div>
                  <Label htmlFor="unitCost">Custo Unitário (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('unitCost', { valueAsNumber: true })}
                    className="mt-1"
                    placeholder="0.00"
                  />
                  {errors.unitCost && (
                    <p className="text-sm text-destructive mt-1">{errors.unitCost.message}</p>
                  )}
                </div>
              )}

              {watchedType === 'saída' && (
                <div>
                  <Label htmlFor="unitPrice">Preço Unitário (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('unitPrice', { valueAsNumber: true })}
                    className="mt-1"
                    placeholder="0.00"
                  />
                  {errors.unitPrice && (
                    <p className="text-sm text-destructive mt-1">{errors.unitPrice.message}</p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <Label htmlFor="reason">Motivo *</Label>
                <Select 
                  value={watch('reason')} 
                  onValueChange={(value) => setValue('reason', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {watchedType === 'entrada' ? (
                      <>
                        <SelectItem value="compra">Compra de fornecedor</SelectItem>
                        <SelectItem value="devolucao">Devolução de cliente</SelectItem>
                        <SelectItem value="ajuste">Ajuste de estoque</SelectItem>
                        <SelectItem value="transferencia">Transferência entre filiais</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="venda">Venda</SelectItem>
                        <SelectItem value="perda">Perda/Avaria</SelectItem>
                        <SelectItem value="devolucao">Devolução para fornecedor</SelectItem>
                        <SelectItem value="transferencia">Transferência entre filiais</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {errors.reason && (
                  <p className="text-sm text-destructive mt-1">{errors.reason.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  {...register('notes')}
                  className="mt-1"
                  placeholder="Observações adicionais sobre a movimentação..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Impact Preview */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Impacto no Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">Estoque Atual</Label>
                  <p className="text-2xl font-bold">{selectedProduct.stock}</p>
                  <p className="text-sm text-muted-foreground">{selectedProduct.unit}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">Movimentação</Label>
                  <p className={`text-2xl font-bold ${
                    watchedType === 'entrada' ? 'text-success' : 'text-danger'
                  }`}>
                    {watchedType === 'entrada' ? '+' : '-'}{watch('quantity') || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedProduct.unit}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">Novo Estoque</Label>
                  <p className="text-2xl font-bold">
                    {selectedProduct.stock + (watchedType === 'entrada' ? 1 : -1) * (watch('quantity') || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedProduct.unit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/movimentacoes">Cancelar</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={!isValid || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Movimentação
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
