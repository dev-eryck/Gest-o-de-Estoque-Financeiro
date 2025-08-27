import React from 'react';
import { ShoppingCart, Package, User, Calendar } from 'lucide-react';

const RecentSalesCard = ({ sales = [], title = 'Vendas Recentes' }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!sales || sales.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Nenhuma venda registrada ainda</p>
          <p className="text-xs text-gray-400 mt-1">As vendas aparecerão aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-4">
        <ShoppingCart className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {sales.slice(0, 5).map((sale) => (
          <div key={sale.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="w-4 h-4 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {sale.produto_nome}
                </h4>
                <span className="text-xs text-gray-500">
                  x{sale.quantidade}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{sale.funcionario_nome}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(sale.data)}</span>
                  <span>{formatTime(sale.data)}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-semibold text-primary">
                {formatCurrency(sale.quantidade * sale.preco_unitario)}
              </div>
              <div className="text-xs text-gray-500">
                {formatCurrency(sale.preco_unitario)}/un
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {sales.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-sm text-primary hover:text-primary/80 font-medium">
            Ver todas as vendas ({sales.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentSalesCard;
