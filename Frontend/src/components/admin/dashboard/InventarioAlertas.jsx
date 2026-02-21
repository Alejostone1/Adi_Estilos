import React from 'react';
import { Badge, Skeleton, Typography } from 'antd';
import { AlertTriangle, Package, Bell, TrendingDown, ShieldAlert } from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

const InventarioAlertas = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4 p-2">
        <Skeleton active paragraph={{ rows: 4 }} title={{ width: '60%' }} />
      </div>
    );
  }

  const alertas = [];

  // Agregar productos con stock bajo
  if (data?.stockBajo?.items) {
    data.stockBajo.items.forEach((item, index) => {
      const urgencia = item.cantidadStock <= item.stockMinimo * 0.5 ? 'alta' : 'media';
      alertas.push({
        id: `stock-${index}`,
        tipo: 'stock_bajo',
        icon: urgencia === 'alta' ? ShieldAlert : TrendingDown,
        titulo: urgencia === 'alta' ? 'Stock crítico' : 'Stock bajo',
        producto: item.producto.nombreProducto,
        variante: item.variante?.nombreVariante,
        actual: item.cantidadStock,
        minimo: item.stockMinimo,
        color: urgencia === 'alta' ? 'red' : 'amber',
        urgencia
      });
    });
  }

  const getUrgenciaStyles = (urgencia) => {
    if (urgencia === 'alta') {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-100 dark:border-red-800/50',
        icon: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-500',
        text: 'text-red-900 dark:text-red-100'
      };
    }
    return {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-100 dark:border-amber-800/50',
      icon: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-500',
      text: 'text-amber-900 dark:text-amber-100'
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Monitoreo de stock
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Alertas críticas
          </h3>
        </div>
        
        {alertas.length > 0 && (
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full">
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">{alertas.length}</span>
          </div>
        )}
      </div>

      {alertas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Todo en orden</p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">No hay alertas pendientes</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px] pr-1 custom-scrollbar">
            {alertas.slice(0, 5).map((alerta) => {
              const styles = getUrgenciaStyles(alerta.urgencia);
              const Icon = alerta.icon;
              
              return (
                <div 
                  key={alerta.id}
                  className={`p-3 rounded-xl ${styles.bg} border ${styles.border} flex gap-3 items-start hover:shadow-sm transition-all`}
                >
                  <div className={`mt-0.5 w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className={`w-4 h-4 ${styles.icon}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${styles.badge} text-white`}>
                        {alerta.urgencia === 'alta' ? 'Crítico' : 'Bajo'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Stock: {alerta.actual} / {alerta.minimo}
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${styles.text} truncate`}>
                      {alerta.producto}
                    </p>
                    {alerta.variante && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {alerta.variante}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {alertas.length > 5 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">
              +{alertas.length - 5} alertas más
            </p>
          )}

          <button className="mt-4 w-full py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            Ver todas las alertas
          </button>
        </>
      )}
    </div>
  );
};

export default InventarioAlertas;
