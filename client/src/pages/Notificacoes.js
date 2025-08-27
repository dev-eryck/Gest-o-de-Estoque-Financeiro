import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, Search, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Notificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar notificações da API
  useEffect(() => {
    fetchNotificacoes();
  }, []);

  const fetchNotificacoes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notificacoes');
      if (response.data.success) {
        setNotificacoes(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const tipos = [
    { id: 'todas', nome: 'Todas', cor: 'text-gray-600' },
    { id: 'info', nome: 'Informação', cor: 'text-blue-600' },
    { id: 'success', nome: 'Sucesso', cor: 'text-green-600' },
    { id: 'warning', nome: 'Aviso', cor: 'text-yellow-600' },
    { id: 'error', nome: 'Erro', cor: 'text-red-600' }
  ];

  const prioridades = {
    urgente: { nome: 'Urgente', cor: 'text-red-600', bg: 'bg-red-100' },
    alta: { nome: 'Alta', cor: 'text-orange-600', bg: 'bg-orange-100' },
    normal: { nome: 'Normal', cor: 'text-blue-600', bg: 'bg-blue-100' },
    baixa: { nome: 'Baixa', cor: 'text-green-600', bg: 'bg-green-100' }
  };

  const marcarComoLida = async (id) => {
    try {
      await axios.put(`/api/notificacoes/${id}/marcar-lida`);
      toast.success('Notificação marcada como lida');
      fetchNotificacoes(); // Recarregar notificações
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await axios.put('/api/notificacoes/marcar-todas-lidas');
      toast.success('Todas as notificações foram marcadas como lidas');
      fetchNotificacoes(); // Recarregar notificações
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  const excluirNotificacao = async (id) => {
    try {
      await axios.delete(`/api/notificacoes/${id}`);
      toast.success('Notificação excluída');
      fetchNotificacoes(); // Recarregar notificações
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      toast.error('Erro ao excluir notificação');
    }
  };

  const limparTodas = async () => {
    if (window.confirm('Tem certeza que deseja limpar todas as notificações?')) {
      try {
        await axios.delete('/api/notificacoes/limpar-todas');
        toast.success('Todas as notificações foram limpas');
        fetchNotificacoes(); // Recarregar notificações
      } catch (error) {
        console.error('Erro ao limpar notificações:', error);
        toast.error('Erro ao limpar notificações');
      }
    }
  };

  const filtrarNotificacoes = () => {
    let filtradas = notificacoes;

    // Filtro por tipo
    if (filter !== 'todas') {
      filtradas = filtradas.filter(notif => notif.tipo === filter);
    }

    // Filtro por busca
    if (searchTerm) {
      filtradas = filtradas.filter(notif => 
        notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.mensagem.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtradas;
  };

  const notificacoesFiltradas = filtrarNotificacoes();
  const naoLidas = notificacoes.filter(notif => !notif.lida).length;

  const formatarTempo = (dataString) => {
    const agora = new Date();
    const dataNotif = new Date(dataString);
    const diff = agora - dataNotif;
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Agora mesmo';
    if (minutos < 60) return `${minutos} min atrás`;
    if (horas < 24) return `${horas}h atrás`;
    if (dias === 1) return 'Ontem';
    return `${dias} dias atrás`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
          <p className="text-red-600 font-medium">
            {naoLidas > 0 ? `${naoLidas} notificação(ões) não lida(s)` : 'Todas as notificações foram lidas'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={marcarTodasComoLidas}
            disabled={naoLidas === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="w-4 h-4 mr-2 inline" />
            Marcar Todas como Lidas
          </button>
          
          <button
            onClick={limparTodas}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2 inline" />
            Limpar Todas
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900">{notificacoes.length}</p>
            </div>
            <Bell className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Não Lidas</p>
              <p className="text-3xl font-bold text-red-600">{naoLidas}</p>
            </div>
            <Bell className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alta Prioridade</p>
              <p className="text-3xl font-bold text-red-600">
                {notificacoes.filter(n => n.prioridade === 'alta' && !n.lida).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoje</p>
              <p className="text-3xl font-bold text-blue-600">
                {notificacoes.filter(n => {
                  const hoje = new Date();
                  const notifDate = new Date(n.data_criacao);
                  return notifDate.toDateString() === hoje.toDateString();
                }).length}
              </p>
            </div>
            <Bell className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Filtro por tipo */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            {tipos.map(tipo => (
              <button
                key={tipo.id}
                onClick={() => setFilter(tipo.id)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${filter === tipo.id
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {tipo.nome}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar notificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div className="text-sm text-gray-500">
            {notificacoesFiltradas.length} de {notificacoes.length} notificações
          </div>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-3">
        {notificacoesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'todas' ? 'Nenhuma notificação encontrada' : 'Nenhuma notificação'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'todas' 
                ? 'Tente ajustar os filtros ou a busca'
                : 'Você está em dia com suas notificações!'
              }
            </p>
          </div>
        ) : (
          notificacoesFiltradas.map((notificacao) => {
            const prioridade = prioridades[notificacao.prioridade] || prioridades.normal;
            const getIcon = (tipo) => {
              switch (tipo) {
                case 'info': return Info;
                case 'success': return CheckCircle;
                case 'warning': return AlertTriangle;
                case 'error': return AlertCircle;
                default: return Bell;
              }
            };
            const Icon = getIcon(notificacao.tipo);
            const getIconColor = (tipo) => {
              switch (tipo) {
                case 'info': return 'text-blue-600';
                case 'success': return 'text-green-600';
                case 'warning': return 'text-yellow-600';
                case 'error': return 'text-red-600';
                default: return 'text-gray-600';
              }
            };
            const getIconBg = (tipo) => {
              switch (tipo) {
                case 'info': return 'bg-blue-50';
                case 'success': return 'bg-green-50';
                case 'warning': return 'bg-yellow-50';
                case 'error': return 'bg-red-50';
                default: return 'bg-gray-50';
              }
            };
            
            return (
              <div
                key={notificacao.id}
                className={`
                  bg-white rounded-xl shadow-sm border p-4 transition-all duration-200
                  ${notificacao.lida ? 'opacity-75' : 'border-l-4 border-l-red-500'}
                  hover:shadow-md
                `}
              >
                <div className="flex items-start space-x-4">
                  {/* Ícone */}
                  <div className={`
                    p-2 rounded-lg ${getIconBg(notificacao.tipo)}
                  `}>
                    <Icon className={`w-5 h-5 ${getIconColor(notificacao.tipo)}`} />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`
                          text-sm font-medium mb-1
                          ${notificacao.lida ? 'text-gray-600' : 'text-gray-900'}
                        `}>
                          {notificacao.titulo}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {notificacao.mensagem}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatarTempo(notificacao.data_criacao)}</span>
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium ${prioridade.bg} ${prioridade.cor}
                          `}>
                            {prioridade.nome}
                          </span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notificacao.lida && (
                          <button
                            onClick={() => marcarComoLida(notificacao.id)}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                            title="Marcar como lida"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => excluirNotificacao(notificacao.id)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Excluir notificação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notificacoes;
