'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { productSchema, type ProductFormData } from '@/lib/schema';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Package } from 'lucide-react';
import Link from 'next/link';

export default function NovoProdutoPage() {
  const router = useRouter();
  const { addProduct, suppliers } = useAppStore();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      unit: 'un',
      contentMl: 0,
      abv: 0,
      cost: 0,
      price: 0,
      stock: 0,
      minStock: 0,
    },
  });

  const watchedCategory = watch('category');
  const watchedName = watch('name');

  const onSubmit = async (data: ProductFormData) => {
    try {
      addProduct(data);
      toast({
        title: 'Produto criado com sucesso!',
        description: `${data.name} foi adicionado ao sistema.`,
      });
      router.push('/produtos');
    } catch (error) {
      toast({
        title: 'Erro ao criar produto',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const generateSKU = () => {
    if (watchedCategory && watchedName) {
      const prefix = watchedCategory.substring(0, 2).toUpperCase();
      const namePart = watchedName
        .split(' ')
        .map(word => word.substring(0, 2).toUpperCase())
        .join('')
        .substring(0, 6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      const sku = `${prefix}-${namePart}-${random}`;
      setValue('sku', sku);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Produto</h1>
          <p className="text-muted-foreground">
            Adicione um novo produto ao catálogo do BAR DO CARNEIRO
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/produtos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <Breadcrumbs />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ex: Cerveja Pilsen 350ml"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    {...register('sku')}
                    placeholder="Ex: CZ-PILSEN-350"
                    className={errors.sku ? 'border-destructive' : ''}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSKU}
                    disabled={!watchedCategory || !watchedName}
                  >
                    Gerar
                  </Button>
                </div>
                {errors.sku && (
                  <p className="text-sm text-destructive mt-1">{errors.sku.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ean">EAN/UPC (Opcional)</Label>
                <Input
                  id="ean"
                  {...register('ean')}
                  placeholder="7890000000000"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select onValueChange={(value) => setValue('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cervejas">Cervejas</SelectItem>
                    <SelectItem value="Refrigerantes">Refrigerantes</SelectItem>
                    <SelectItem value="Destilados">Destilados</SelectItem>
                    <SelectItem value="Vinhos">Vinhos</SelectItem>
                    <SelectItem value="Sucos">Sucos</SelectItem>
                    <SelectItem value="Águas">Águas</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="supplierId">Fornecedor *</Label>
                <Select onValueChange={(value) => setValue('supplierId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supplierId && (
                  <p className="text-sm text-destructive mt-1">{errors.supplierId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Localização *</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Ex: Geladeira 1, Prateleira A"
                  className={errors.location ? 'border-destructive' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Especificações Técnicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="unit">Unidade *</Label>
                <Select onValueChange={(value) => setValue('unit', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="garrafa">Garrafa</SelectItem>
                    <SelectItem value="lata">Lata</SelectItem>
                    <SelectItem value="ml">Mililitros</SelectItem>
                    <SelectItem value="un">Unidade</SelectItem>
                  </SelectContent>
                </Select>
                {errors.unit && (
                  <p className="text-sm text-destructive mt-1">{errors.unit.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contentMl">Conteúdo (ml) *</Label>
                <Input
                  id="contentMl"
                  type="number"
                  {...register('contentMl', { valueAsNumber: true })}
                  placeholder="350"
                  className={errors.contentMl ? 'border-destructive' : ''}
                />
                {errors.contentMl && (
                  <p className="text-sm text-destructive mt-1">{errors.contentMl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="abv">Teor Alcoólico (%) *</Label>
                <Input
                  id="abv"
                  type="number"
                  step="0.1"
                  {...register('abv', { valueAsNumber: true })}
                  placeholder="4.5"
                  className={errors.abv ? 'border-destructive' : ''}
                />
                {errors.abv && (
                  <p className="text-sm text-destructive mt-1">{errors.abv.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preços e Estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="cost">Preço de Custo (R$) *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('cost', { valueAsNumber: true })}
                  placeholder="3.20"
                  className={errors.cost ? 'border-destructive' : ''}
                />
                {errors.cost && (
                  <p className="text-sm text-destructive mt-1">{errors.cost.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="price">Preço de Venda (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="7.50"
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stock">Estoque Atual *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  {...register('stock', { valueAsNumber: true })}
                  placeholder="96"
                  className={errors.stock ? 'border-destructive' : ''}
                />
                {errors.stock && (
                  <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="minStock">Estoque Mínimo *</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  {...register('minStock', { valueAsNumber: true })}
                  placeholder="24"
                  className={errors.minStock ? 'border-destructive' : ''}
                />
                {errors.minStock && (
                  <p className="text-sm text-destructive mt-1">{errors.minStock.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validade</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="expiry">Data de Validade (Opcional)</Label>
              <Input
                id="expiry"
                type="date"
                {...register('expiry')}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Deixe em branco se o produto não tiver validade
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/produtos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
          </Button>
        </div>
      </form>
    </div>
  );
}

