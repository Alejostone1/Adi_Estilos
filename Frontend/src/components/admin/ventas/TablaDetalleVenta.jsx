import React from 'react';
import { 
  FiTrash2, FiPlus, FiMinus, FiTag, FiAlertCircle, 
  FiPackage, FiDollarSign, FiPercent 
} from 'react-icons/fi';

const TablaDetalleVenta = ({ carrito, onActualizarCantidad, onActualizarDescuento, onEliminar }) => {
  const UPLOAD_URL = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0 
    });
  };

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 animate-in fade-in duration-500">
        <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <FiPackage className="h-8 w-8 text-slate-200" />
        </div>
        <h4 className="text-slate-700 dark:text-slate-200 font-semibold">Carrito Vacío</h4>
        <p className="text-xs text-slate-400 mt-1">Agrega productos en el paso anterior</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <th className="pb-2 pl-5">Producto</th>
            <th className="pb-2 text-center">Cantidad</th>
            <th className="pb-2 text-right">Precio Unit.</th>
            <th className="pb-2 text-right">Descuento</th>
            <th className="pb-2 text-right">Subtotal</th>
            <th className="pb-2 pr-5 text-center w-12"></th>
          </tr>
        </thead>
        <tbody>
          {carrito.map((item, index) => {
            const subtotal = item.cantidad * item.precioUnitario;
            const totalLinea = subtotal - (Number(item.descuentoLinea) || 0);
            const esStockBajo = item.cantidad >= item.stockActual - 2;

            return (
              <tr
                key={`${item.idVariante}-${index}`}
                className="bg-white dark:bg-slate-800/50 shadow-sm rounded-xl group hover:shadow-md transition-all duration-200 ring-1 ring-slate-100 dark:ring-slate-700/50 hover:ring-indigo-200 dark:hover:ring-indigo-800/50"
              >
                {/* Producto */}
                <td className="py-3.5 pl-5 rounded-l-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-white dark:bg-slate-900 flex-shrink-0 border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={`${UPLOAD_URL}${item.imagenVariante}`}
                        alt={item.producto?.titulo}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
                        {item.producto?.titulo}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded">
                          {item.color?.nombreColor}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-50 dark:bg-slate-700/50 text-slate-500 rounded">
                          {item.talla?.nombreTalla}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Cantidad */}
                <td className="py-3.5 text-center">
                  <div className="inline-flex items-center justify-center p-0.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => onActualizarCantidad(item.idVariante, item.cantidad - 1)}
                      className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:shadow-sm transition-all active:scale-90"
                    >
                      <FiMinus className="h-3 w-3" />
                    </button>

                    <span className="text-sm font-semibold w-9 text-center text-slate-800 dark:text-white">
                      {item.cantidad}
                    </span>

                    <button
                      onClick={() => onActualizarCantidad(item.idVariante, item.cantidad + 1)}
                      className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:shadow-sm transition-all active:scale-90"
                    >
                      <FiPlus className="h-3 w-3" />
                    </button>
                  </div>

                  {esStockBajo && (
                    <div className="mt-1.5 flex items-center justify-center gap-1 animate-pulse">
                      <FiAlertCircle className="h-2.5 w-2.5 text-amber-500" />
                      <span className="text-[10px] font-medium text-amber-500">
                        Stock: {item.stockActual}
                      </span>
                    </div>
                  )}
                </td>

                {/* Precio Unitario */}
                <td className="py-3.5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {formatearPrecio(item.precioUnitario)}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      por unidad
                    </span>
                  </div>
                </td>

                {/* Descuento */}
                <td className="py-3.5 text-right">
                  <div className="relative inline-block">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <FiTag className="h-3 w-3 text-rose-400" />
                    </div>
                    <input
                      type="number"
                      value={item.descuentoLinea || 0}
                      onChange={(e) =>
                        onActualizarDescuento(item.idVariante, e.target.value)
                      }
                      className="w-24 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200/50 dark:border-rose-800/30 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 rounded-lg py-2 pl-8 pr-3 text-xs font-semibold text-rose-600 dark:text-rose-400 text-right transition-all"
                    />
                  </div>
                </td>

                {/* Subtotal */}
                <td className="py-3.5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {formatearPrecio(totalLinea)}
                    </span>
                    {Number(item.descuentoLinea) > 0 && (
                      <span className="text-[10px] font-medium text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-1.5 py-0.5 rounded mt-0.5">
                        -{formatearPrecio(item.descuentoLinea)}
                      </span>
                    )}
                  </div>
                </td>

                {/* Eliminar */}
                <td className="py-3.5 pr-5 text-center rounded-r-xl">
                  <button
                    onClick={() => onEliminar(item.idVariante)}
                    className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-rose-500 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all duration-200"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Resumen inferior */}
      <div className="mt-6 flex justify-end">
         <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50 min-w-[280px] shadow-sm">
            <div className="space-y-2.5">
               <div className="flex justify-between items-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <span>Productos ({carrito.reduce((acc, i) => acc + i.cantidad, 0)})</span>
                  <span className="text-slate-700 dark:text-white font-semibold">
                    {formatearPrecio(carrito.reduce((acc, i) => acc + (i.cantidad * i.precioUnitario), 0))}
                  </span>
               </div>
               <div className="flex justify-between items-center text-xs font-medium text-rose-500">
                  <div className="flex items-center gap-1">
                    <FiPercent className="h-3 w-3" />
                    <span>Descuentos</span>
                  </div>
                  <span>
                    - {formatearPrecio(carrito.reduce((acc, i) => acc + Number(i.descuentoLinea || 0), 0))}
                  </span>
               </div>
               <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300">
                    {formatearPrecio(carrito.reduce((acc, i) => acc + (i.cantidad * i.precioUnitario) - Number(i.descuentoLinea || 0), 0))}
                  </span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TablaDetalleVenta;
