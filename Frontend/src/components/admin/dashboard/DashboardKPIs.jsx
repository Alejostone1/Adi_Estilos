import React from 'react';
import { Skeleton, Typography } from 'antd';
import { DollarSign, ShoppingCart, CreditCard, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const { Text } = Typography;

const DashboardKPIs = ({ data, loading, rango }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-5 bg-white dark:bg-slate-800/60 rounded-xl">
            <Skeleton active paragraph={{ rows: 2 }} title={{ width: '40%' }} />
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
    return `$${num.toLocaleString('es-CO')}`;
  };
  
  const formatNumber = (value) => Number(value).toLocaleString('es-CO');

  // Traducir rango para mostrar
  const rangoLabel = {
    'dia': 'Hoy',
    'semana': 'Esta semana',
    'mes': 'Este mes'
  }[rango] || rango;

  // Calcular tendencias (simuladas por ahora, podrían venir del backend)
  const getTrend = (value, index) => {
    // Simulación: valores alternados para demo visual
    const trends = [
      { type: 'up', value: 12.5 },
      { type: 'down', value: -5.2 },
      { type: 'neutral', value: 0 },
      { type: 'up', value: 8.3 }
    ];
    return trends[index] || { type: 'neutral', value: 0 };
  };

  const kpis = [
    {
      title: 'Ingresos totales',
      value: data?.resumenVentas?.totalVentas || 0,
      icon: DollarSign,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-100 dark:border-blue-800/30',
      formatter: formatCurrency,
      subtext: `Ventas ${rangoLabel.toLowerCase()}`
    },
    {
      title: 'Pedidos realizados',
      value: data?.resumenVentas?.numeroVentas || 0,
      icon: ShoppingCart,
      color: 'violet',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20',
      textColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-100 dark:border-violet-800/30',
      formatter: formatNumber,
      subtext: 'Transacciones'
    },
    {
      title: 'Créditos en curso',
      value: data?.resumenCreditos?.creditosActivos || 0,
      icon: CreditCard,
      color: 'amber',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-100 dark:border-amber-800/30',
      formatter: formatNumber,
      subtext: 'Cuentas por cobrar'
    },
    {
      title: 'Nuevos clientes',
      value: data?.nuevosClientes || 0,
      icon: Users,
      color: 'emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-100 dark:border-emerald-800/30',
      formatter: formatNumber,
      subtext: 'Registros recientes'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const trend = getTrend(kpi.value, index);
        const TrendIcon = trend.type === 'up' ? TrendingUp : trend.type === 'down' ? TrendingDown : Minus;
        const trendColor = trend.type === 'up' ? 'text-emerald-600' : trend.type === 'down' ? 'text-red-600' : 'text-slate-400';
        
        return (
          <div 
            key={index}
            className={`p-5 rounded-xl border ${kpi.borderColor} ${kpi.bgColor} bg-white dark:bg-slate-800/60 hover:shadow-md transition-all group`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${kpi.textColor}`} />
              </div>
              <span className="px-2 py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 rounded-full uppercase tracking-wide">
                {rangoLabel}
              </span>
            </div>
            
            {/* Value */}
            <div className="mb-2">
              <p className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                {kpi.formatter(kpi.value)}
              </p>
            </div>
            
            {/* Title & Subtext */}
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              {kpi.title}
            </p>
            
            {/* Footer with trend */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {kpi.subtext}
              </p>
              <div className={`flex items-center gap-1 ${trendColor}`}>
                <TrendIcon className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardKPIs;
