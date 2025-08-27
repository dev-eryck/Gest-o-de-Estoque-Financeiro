import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function NovoFuncionario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    telefone: '',
    email: '',
    cpf: '',
    endereco: '',
    data_admissao: '',
    salario: '',
    status: 'ativo'
  });

  const cargos = [
    'Gerente',
    'Atendente',
    'Caixa',
    'Estoquista',
    'Auxiliar',
    'Segurança',
    'Limpeza'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/funcionarios', formData);
      toast.success('Funcionário criado com sucesso!');
      navigate('/funcionarios');
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/funcionarios')}
          className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Funcionários
        </button>
        <div className="flex items-center">
          <UserPlus className="w-8 h-8 text-red-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novo Funcionário</h1>
            <p className="text-red-600 font-medium">Adicione um novo funcionário ao sistema</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Nome completo do funcionário"
              />
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo *
              </label>
              <select
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Selecione um cargo</option>
                {cargos.map(cargo => (
                  <option key={cargo} value={cargo}>
                    {cargo}
                  </option>
                ))}
              </select>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="funcionario@email.com"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF *
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="123.456.789-00"
              />
            </div>

            {/* Data de Admissão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Admissão
              </label>
              <input
                type="date"
                name="data_admissao"
                value={formData.data_admissao}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Salário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salário
              </label>
              <input
                type="number"
                name="salario"
                value={formData.salario}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="0.00"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="ferias">Férias</option>
                <option value="licenca">Licença</option>
              </select>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <textarea
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Endereço completo..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/funcionarios')}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Funcionário
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NovoFuncionario;
