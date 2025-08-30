import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../config/axios';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Briefcase,
  UserCheck,
  UserX
} from 'lucide-react';

const Funcionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCargo, setSelectedCargo] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: '',
    salario: '',
    data_admissao: '',
    status: 'ativo',
    // Campos de usuário
    username: '',
    password: '',
    confirmPassword: '',
    criarUsuario: true
  });

  const cargos = [
    'Garçom',
    'Caixa',
    'Cozinheiro',
    'Auxiliar de Cozinha',
    'Limpeza',
    'Segurança',
    'Gerente',
    'Estagiário'
  ];

  const statusOptions = [
    { value: 'ativo', label: 'Ativo', color: 'text-green-600', bg: 'bg-green-50' },
    { value: 'inativo', label: 'Inativo', color: 'text-red-600', bg: 'bg-red-50' },
    { value: 'ferias', label: 'Férias', color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: 'licenca', label: 'Licença', color: 'text-yellow-600', bg: 'bg-yellow-50' }
  ];

  // Mapeamento de cargos para permissões do sistema
  const cargoPermissoes = {
    'Garçom': 'garcom',
    'Caixa': 'caixa',
    'Cozinheiro': 'estoque',
    'Auxiliar de Cozinha': 'estoque',
    'Limpeza': 'estoque',
    'Segurança': 'estoque',
    'Gerente': 'gerente',
    'Estagiário': 'estoque'
  };

  // Mapeamento reverso para exibição
  const cargoDisplayNames = {
    'garcom': 'Garçom',
    'caixa': 'Caixa',
    'estoque': 'Estoque',
    'gerente': 'Gerente',
    'dono': 'Dono'
  };

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/funcionarios');
      setFuncionarios(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Erro ao carregar funcionários');
      console.error('Erro:', error);
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Formulário submetido com dados:', formData);
    
    // Validações do frontend
    if (!formData.nome || !formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    if (!formData.cargo || !formData.cargo.trim()) {
      toast.error('Cargo é obrigatório');
      return;
    }
    
    if (!formData.status || !formData.status.trim()) {
      toast.error('Status é obrigatório');
      return;
    }
    
    // Validações de usuário
    if (formData.criarUsuario) {
      if (!formData.username || !formData.password) {
        toast.error('Usuário e senha são obrigatórios quando criar usuário está marcado');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }
      
      if (formData.password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        return;
      }
    }
    
    try {
      if (editingEmployee) {
        // Atualizar funcionário existente
        console.log('🔄 Atualizando funcionário:', editingEmployee.id);
        await api.put(`/api/funcionarios/${editingEmployee.id}`, formData);
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        // Criar novo funcionário
        const funcionarioData = {
          nome: formData.nome.trim(),
          cpf: formData.cpf?.trim() || null,
          email: formData.email?.trim() || null,
          telefone: formData.telefone?.trim() || null,
          cargo: formData.cargo.trim(),
          salario: formData.salario || null,
          data_admissao: formData.data_admissao || null,
          status: formData.status.trim(),
          endereco: null // Campo obrigatório na tabela
        };
        
        console.log('➕ Criando funcionário com dados:', funcionarioData);
        console.log('🔍 Validação dos campos obrigatórios:');
        console.log('  - Nome:', funcionarioData.nome, 'Válido:', !!funcionarioData.nome);
        console.log('  - Cargo:', funcionarioData.cargo, 'Válido:', !!funcionarioData.cargo);
        console.log('  - Status:', funcionarioData.status, 'Válido:', !!funcionarioData.status);

        const funcionarioResponse = await api.post('/api/funcionarios', funcionarioData);
        console.log('✅ Resposta da API:', funcionarioResponse.data);
        
        // Criar usuário se solicitado
        if (formData.criarUsuario) {
          try {
            console.log('👤 Criando usuário com dados:', {
              nome_completo: formData.nome.trim(),
              email: formData.email?.trim() || null,
              username: formData.username,
              senha: formData.password,
              cargo: cargoPermissoes[formData.cargo] || 'estoque'
            });

            const usuarioData = {
              nome_completo: formData.nome.trim(),
              email: formData.email?.trim() || null,
              username: formData.username,
              senha: formData.password,
              cargo: cargoPermissoes[formData.cargo] || 'estoque'
            };

            const usuarioResponse = await api.post('/api/auth/registro', usuarioData);
            console.log('✅ Usuário criado com sucesso:', usuarioResponse.data);
            toast.success('Funcionário e usuário criados com sucesso!');
          } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            console.error('❌ Detalhes do erro:', error.response?.data);
            toast.error('Funcionário criado, mas erro ao criar usuário: ' + (error.response?.data?.message || 'Erro desconhecido'));
          }
        } else {
          toast.success('Funcionário criado com sucesso!');
        }
      }
      
      setShowForm(false);
      setEditingEmployee(null);
      resetForm();
      fetchFuncionarios();
    } catch (error) {
      console.error('❌ Erro ao salvar funcionário:', error);
      console.error('❌ Resposta da API:', error.response?.data);
      const message = error.response?.data?.message || 'Erro ao salvar funcionário';
      toast.error(message);
    }
  };

  const handleEdit = (funcionario) => {
    setEditingEmployee(funcionario);
    setFormData({
      nome: funcionario.nome || '',
      cpf: funcionario.cpf || '',
      email: funcionario.email || '',
      telefone: funcionario.telefone || '',
      cargo: funcionario.cargo || '',
      salario: funcionario.salario?.toString() || '',
      data_admissao: funcionario.data_admissao?.split('T')[0] || '',
      status: funcionario.status || 'ativo',
      // Campos de usuário (vazios para edição)
      username: '',
      password: '',
      confirmPassword: '',
      criarUsuario: false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await api.delete(`/api/funcionarios/${id}`);
        toast.success('Funcionário excluído com sucesso!');
        fetchFuncionarios();
      } catch (error) {
        toast.error('Erro ao excluir funcionário');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      cargo: '',
      salario: '',
      data_admissao: '',
      status: 'ativo',
      username: '',
      password: '',
      confirmPassword: '',
      criarUsuario: true
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleNewEmployee = () => {
    setEditingEmployee(null);
    resetForm();
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
    resetForm();
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '-';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  // Filtros
  const filteredFuncionarios = funcionarios.filter(funcionario => {
    const matchesSearch = funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         funcionario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         funcionario.cpf.includes(searchTerm);
    const matchesCargo = selectedCargo === 'all' || funcionario.cargo === selectedCargo;
    const matchesStatus = selectedStatus === 'all' || funcionario.status === selectedStatus;

    return matchesSearch && matchesCargo && matchesStatus;
  });

  const getStatusInfo = (status) => {
    if (!status) {
      return { value: 'ativo', label: 'Ativo', color: 'text-green-600', bg: 'bg-green-50' };
    }
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-red-600 font-medium">Gerencie a equipe e usuários do BAR DO CARNEIRO</p>
        </div>
        <button
          onClick={handleNewEmployee}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Funcionário
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar funcionários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          
          <select
            value={selectedCargo}
            onChange={(e) => setSelectedCargo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value="all">Todos os cargos</option>
            {cargos.map(cargo => (
              <option key={cargo} value={cargo}>{cargo}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value="all">Todos os status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {filteredFuncionarios.length} de {funcionarios.length} funcionários
          </div>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção de Dados do Funcionário */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                Dados do Funcionário
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="Nome completo do funcionário"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="000.000.000-00"
                    maxLength="14"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <select
                    required
                    value={formData.cargo}
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="">Selecione um cargo</option>
                    {cargos.map(cargo => (
                      <option key={cargo} value={cargo}>{cargo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salario}
                    onChange={(e) => setFormData({...formData, salario: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Admissão
                  </label>
                  <input
                    type="date"
                    value={formData.data_admissao}
                    onChange={(e) => setFormData({...formData, data_admissao: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Seção de Criação de Usuário */}
            {!editingEmployee && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="criarUsuario"
                    checked={formData.criarUsuario}
                    onChange={(e) => setFormData({...formData, criarUsuario: e.target.checked})}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="criarUsuario" className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-red-600" />
                    Criar Usuário para Acesso ao Sistema
                  </label>
                </div>

                {formData.criarUsuario && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome de Usuário *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required={formData.criarUsuario}
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          placeholder="nome.usuario"
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Senha *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required={formData.criarUsuario}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          placeholder="Mínimo 6 caracteres"
                          minLength="6"
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Senha *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required={formData.criarUsuario}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          placeholder="Confirme a senha"
                          minLength="6"
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="font-medium text-blue-800 mb-1">Permissões automáticas:</p>
                        <p>O usuário receberá automaticamente as permissões baseadas no cargo selecionado.</p>
                        {formData.cargo && cargoPermissoes[formData.cargo] && (
                          <p className="mt-1 text-blue-700">
                            <strong>Cargo:</strong> {formData.cargo} → <strong>Permissão:</strong> {cargoPermissoes[formData.cargo]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {editingEmployee ? 'Atualizar' : 'Criar'} Funcionário
                {formData.criarUsuario && !editingEmployee && <span>+ Usuário</span>}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Funcionários */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funcionário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFuncionarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Nenhum funcionário encontrado</p>
                    <p className="text-sm">Comece adicionando seu primeiro funcionário!</p>
                  </td>
                </tr>
              ) : (
                filteredFuncionarios.map((funcionario) => {
                  const statusInfo = getStatusInfo(funcionario.status);
                  
                  return (
                    <tr key={funcionario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{funcionario.nome}</div>
                          <div className="text-sm text-gray-500">CPF: {formatCPF(funcionario.cpf)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {funcionario.email || '-'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {formatPhone(funcionario.telefone)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{funcionario.cargo}</span>
                        </div>
                        {funcionario.salario && (
                          <div className="text-xs text-gray-500 mt-1">
                            R$ {parseFloat(funcionario.salario).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                          {funcionario.status === 'ativo' && <UserCheck className="w-3 h-3 mr-1" />}
                          {funcionario.status === 'inativo' && <UserX className="w-3 h-3 mr-1" />}
                          {statusInfo.label}
                        </span>
                        {funcionario.data_admissao && (
                          <div className="text-xs text-gray-500 mt-1">
                            Admissão: {new Date(funcionario.data_admissao).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(funcionario)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(funcionario.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Funcionarios;
