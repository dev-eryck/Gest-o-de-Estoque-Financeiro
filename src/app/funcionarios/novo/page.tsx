'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAppStore } from '@/lib/store';
import { employeeSchema, type EmployeeFormData } from '@/lib/schema';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function NovoFuncionarioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addEmployee } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      canAdjustStock: false,
      active: true,
      baseSalary: 0
    }
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      addEmployee(data);

      toast({
        title: "Funcionário cadastrado!",
        description: `${data.name} foi adicionado à equipe com sucesso.`,
      });

      router.push('/funcionarios');
    } catch (error) {
      toast({
        title: "Erro ao cadastrar funcionário",
        description: "Ocorreu um erro ao salvar o funcionário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Funcionário</h1>
          <p className="text-muted-foreground">
            Cadastre um novo membro da equipe
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/funcionarios">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <Breadcrumbs />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  {...register('name')}
                  className="mt-1"
                  placeholder="Nome completo do funcionário"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  {...register('cpf')}
                  className="mt-1"
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {errors.cpf && (
                  <p className="text-sm text-destructive mt-1">{errors.cpf.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  type="email"
                  {...register('email')}
                  className="mt-1"
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  {...register('phone')}
                  className="mt-1"
                  placeholder="(00) 00000-0000"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="observations">Observações</Label>
                <Input
                  {...register('observations')}
                  className="mt-1"
                  placeholder="Observações sobre o funcionário"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="role">Cargo *</Label>
                <Select 
                  value={watch('role')} 
                  onValueChange={(value) => setValue('role', value as any)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                    <SelectItem value="Barman">Barman</SelectItem>
                    <SelectItem value="Garçom">Garçom</SelectItem>
                    <SelectItem value="Cozinha">Cozinha</SelectItem>
                    <SelectItem value="Caixa">Caixa</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="shift">Turno *</Label>
                <Select 
                  value={watch('shift')} 
                  onValueChange={(value) => setValue('shift', value as any)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manhã">Manhã (6h - 14h)</SelectItem>
                    <SelectItem value="tarde">Tarde (14h - 22h)</SelectItem>
                    <SelectItem value="noite">Noite (22h - 6h)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.shift && (
                  <p className="text-sm text-destructive mt-1">{errors.shift.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="admissionDate">Data de Admissão *</Label>
                <Input
                  type="date"
                  {...register('admissionDate')}
                  className="mt-1"
                />
                {errors.admissionDate && (
                  <p className="text-sm text-destructive mt-1">{errors.admissionDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="baseSalary">Salário Base (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('baseSalary', { valueAsNumber: true })}
                  className="mt-1"
                  placeholder="0.00"
                />
                {errors.baseSalary && (
                  <p className="text-sm text-destructive mt-1">{errors.baseSalary.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="canAdjustStock">Pode Ajustar Estoque</Label>
                <Select 
                  value={watch('canAdjustStock')?.toString() || 'false'} 
                  onValueChange={(value) => setValue('canAdjustStock', value === 'true')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                {...register('observations')}
                className="mt-1"
                placeholder="Observações adicionais sobre o funcionário..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/funcionarios">Cancelar</Link>
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
                Salvar Funcionário
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
