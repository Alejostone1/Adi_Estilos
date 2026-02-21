import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WizardStep3 = ({ formData, onUpdateFormData }) => {
  const [ganancia, setGanancia] = useState('');

  const precioCompra = parseFloat(formData.precioCompra) || 0;
  const precioVenta = parseFloat(formData.precioVenta) || 0;

  // Calcular porcentaje de ganancia automáticamente
  useEffect(() => {
    if (precioCompra > 0) {
      const porcentaje = ((precioVenta - precioCompra) / precioCompra) * 100;
      setGanancia(porcentaje.toFixed(2));
      onUpdateFormData({ porcentajeGanancia: porcentaje.toFixed(2) });
    }
  }, [precioCompra, precioVenta]);

  const handlePrecioCompraChange = (e) => {
    onUpdateFormData({ precioCompra: e.target.value });
  };

  const handlePrecioVentaChange = (e) => {
    onUpdateFormData({ precioVenta: e.target.value });
  };

  const margenActual = precioVenta - precioCompra;
  const porcentajeGanancia = precioCompra > 0 ? ganancia : 0;

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {/* Header Informativo */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
           <TrendingUp size={20} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Estructura Comercial</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Define los valores base. El sistema calculará el margen y te alertará sobre la viabilidad de la ganancia.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Precio de Compra */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Costo Base (Compra) *</label>
          <div className="relative group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              type="number"
              value={formData.precioCompra || ''}
              onChange={(e) => onUpdateFormData({ precioCompra: e.target.value })}
              placeholder="0.00"
              className="w-full pl-10 pr-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Precio de Venta */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Precio de Venta Sugerido *</label>
          <div className="relative group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 font-bold">$</span>
            <input
              type="number"
              value={formData.precioVenta || ''}
              onChange={(e) => onUpdateFormData({ precioVenta: e.target.value })}
              placeholder="0.00"
              className="w-full pl-10 pr-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Dash de Rentabilidad */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Costo</p>
            <p className="text-sm font-black text-slate-600 dark:text-slate-300">$ {Number(precioCompra).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10 text-center col-span-1">
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1 italic">Margen Bruto</p>
            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">$ {Number(margenActual).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">P. Final</p>
            <p className="text-sm font-black text-slate-600 dark:text-slate-300">$ {Number(precioVenta).toLocaleString()}</p>
        </div>
      </div>

      {/* Indicador Maestro de Ganancia */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                    porcentajeGanancia >= 30 ? 'bg-emerald-500' :
                    porcentajeGanancia >= 15 ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">Viabilidad del Margen</p>
            </div>
            <span className={`text-xl font-black ${
                porcentajeGanancia >= 30 ? 'text-emerald-500' :
                porcentajeGanancia >= 15 ? 'text-amber-500' : 'text-rose-500'
            }`}>
                {porcentajeGanancia}%
            </span>
        </div>

        <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.max(porcentajeGanancia, 0), 100)}%` }}
                className={`h-full rounded-full ${
                    porcentajeGanancia >= 30 ? 'bg-emerald-500' :
                    porcentajeGanancia >= 15 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
            />
        </div>

        <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
            <div className={porcentajeGanancia >= 15 ? 'text-emerald-500' : 'text-rose-500'}>
                {porcentajeGanancia >= 30 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            </div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                {porcentajeGanancia >= 30 ? 'Estrategia de alta rentabilidad detectada' :
                 porcentajeGanancia >= 15 ? 'Margen saludable para operación estándar' :
                 'Alerta: El margen es insuficiente para cubrir costos operativos'}
            </p>
        </div>
      </div>

      {/* Cambio Rápido */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Calculadora de Margen Rápida
          </p>
          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg uppercase">
            Basado en Costo
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[15, 25, 30, 45, 60, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => {
                const nuevoPrecioVenta = Math.round(precioCompra * (1 + pct / 100));
                onUpdateFormData({ precioVenta: nuevoPrecioVenta });
              }}
              disabled={precioCompra <= 0}
              className="flex flex-col items-center justify-center gap-1 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600">+{pct}%</span>
            </button>
          ))}
        </div>
        <p className="text-[9px] text-slate-400 italic text-center">
          * El precio de venta se ajustará automáticamente sumando el % seleccionado al costo.
        </p>
      </div>
    </div>
  );
};

export default WizardStep3;
