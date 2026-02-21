import React from 'react';
import { FiDollarSign, FiPercent, FiTag, FiShoppingBag } from 'react-icons/fi';

const ResumenVenta = ({ subtotal, descuentoTotal, impuestos, total }) => {
  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
        <FiShoppingBag className="h-3.5 w-3.5" />
        Resumen Financiero
      </h3>
      
      <div className="space-y-3.5">
        <div className="flex justify-between items-center group">
          <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Subtotal Bruto</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatearPrecio(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center group">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded bg-rose-50 dark:bg-rose-900/20 text-rose-500">
              <FiTag className="h-3 w-3" />
            </div>
            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Descuentos</span>
          </div>
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400">-{formatearPrecio(descuentoTotal)}</span>
        </div>

        <div className="flex justify-between items-center group">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
              <FiPercent className="h-3 w-3" />
            </div>
            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Impuestos</span>
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">+{formatearPrecio(impuestos)}</span>
        </div>

        <div className="pt-3.5 border-t border-slate-200 dark:border-slate-700 mt-3.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Total a Pagar</span>
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
                {formatearPrecio(total)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">IVA incluido (si aplica)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-3.5 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl shadow-md shadow-indigo-500/15">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <FiDollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-indigo-100">Valor Neto Venta</p>
            <p className="text-base font-bold text-white leading-none">{formatearPrecio(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenVenta;
