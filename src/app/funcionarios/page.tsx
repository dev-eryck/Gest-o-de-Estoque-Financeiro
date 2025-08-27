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
import { formatPhone, formatCPF, getRoleColor, getShiftColor } from '@/lib/utils';
import { 
  Users, 
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
  User
} from 'lucide-react';
import Link from 'next/link';

export default function FuncionariosPage() {
  const { employees, deleteEmployee } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const roles = Array.from(new Set(employees.map(e => e.role)));
  const shifts = Array.from(new Set(employees.map(e => e.shift)));

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.cpf.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || !roleFilter || employee.role === roleFilter;
    const matchesShift = shiftFilter === 'all' || !shiftFilter || employee.shift === shiftFilter;
    const matchesStatus = statusFilter === 'all' || !statusFilter || employee.active === (statusFilter === 'ativo');

    return matchesSearch && matchesRole && matchesShift && matchesStatus;
  });

  const handleDeleteEmployee = (employeeId: string, employeeName: string) => {
    if (confirm(`Tem certeza que deseja excluir o funcionário "${employeeName}"?`)) {
      deleteEmployee(employeeId);
    }
  };

  if (employees.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
            <p className="text-muted-foreground">
              Gerencie a equipe do BAR DO CARNEIRO
            </p>
          </div>
        </div>
        <Breadcrumbs />
        <EmptyState
          icon={Users}
          title="Nenhum funcionário cadastrado"
          description="Comece cadastrando o primeiro funcionário da equipe."
          actionLabel="Novo Funcionário"
          onAction={() => window.location.href = '/funcionarios/novo'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">
            Gerencie a equipe do BAR DO CARNEIRO
          </p>
        </div>
        <Button asChild>
          <Link href="/funcionarios/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Funcionário
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
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cargo</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os cargos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cargos</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Turno</label>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os turnos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os turnos</SelectItem>
                  {shifts.map(shift => (
                    <SelectItem key={shift} value={shift}>
                      {shift}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setShiftFilter('all');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {employee.role}
                    </Badge>
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
                      <Link href={`/funcionarios/${employee.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/funcionarios/${employee.id}/editar`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteEmployee(employee.id, employee.name)}
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
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{formatPhone(employee.phone)}</span>
                </div>
                {employee.observations && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{employee.observations}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {employee.shift}
                  </Badge>
                  <Badge variant={employee.active ? 'default' : 'secondary'}>
                    {employee.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Admitido em {new Date(employee.admissionDate).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <EmptyState
          icon={Search}
          title="Nenhum funcionário encontrado"
          description="Tente ajustar os filtros de busca."
        />
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{employees.length}</div>
              <div className="text-sm text-muted-foreground">Total de Funcionários</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {employees.filter(e => e.active).length}
              </div>
              <div className="text-sm text-muted-foreground">Ativos</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">
                {employees.filter(e => !e.active).length}
              </div>
              <div className="text-sm text-muted-foreground">Inativos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
