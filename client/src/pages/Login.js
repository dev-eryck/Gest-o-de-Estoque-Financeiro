import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Package, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.senha) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      
      const result = await login(formData.username, formData.senha);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        // O redirecionamento será feito automaticamente pelo contexto
        navigate('/');
      } else {
        toast.error(result.message || 'Erro ao fazer login');
      }
    } catch (error) {
      toast.error('Erro inesperado ao fazer login');
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
            <Package className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            BAR DO CARNEIRO
          </h2>
          <p className="text-red-200 text-lg">
            Sistema de Gestão
          </p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-red-300" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Digite seu usuário"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-white mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-red-300" />
                </div>
                <input
                  id="senha"
                  name="senha"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.senha}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-red-300 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-red-300 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          {/* Informações de Acesso */}
          <div className="mt-6 text-center">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-medium text-red-200 mb-2">
                Acesso Inicial
              </h3>
              <div className="text-xs text-red-100 space-y-1">
                <p><strong>Usuário:</strong> admin</p>
                <p><strong>Senha:</strong> admin123</p>
                <p className="text-red-200 mt-2">
                  ⚠️ Altere a senha após o primeiro acesso
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-red-200 text-sm">
            © 2024 BAR DO CARNEIRO - Sistema de Gestão
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
