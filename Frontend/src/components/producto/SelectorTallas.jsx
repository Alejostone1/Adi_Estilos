import React from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

const SelectorTallas = ({ tallas = [], onSelectTalla, selectedTalla, stockInfo = [] }) => {
  if (!tallas.length) return null;

  const getStockForTalla = (tallaId) => {
    const varianteConTalla = stockInfo.find(s => 
      s.id_talla === tallaId || 
      s.talla?.idTalla === tallaId ||
      s.idTalla === tallaId
    );
    return varianteConTalla?.stock ?? varianteConTalla?.cantidadStock ?? 0;
  };

  return (
    <div className="bg-gray-50/80 rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Talla
        </h4>
        <span className="text-sm font-medium text-gray-900 bg-white px-3 py-1 rounded-full shadow-sm">
          {selectedTalla?.nombre || 'Selecciona una'}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tallas.map((talla, index) => {
          const isSelected = selectedTalla?.id === talla.id;
          const stock = getStockForTalla(talla.id);
          const isDisabled = stock === 0;
          const isLowStock = stock > 0 && stock <= 3;

          return (
            <motion.button
              key={talla.id}
              type="button"
              onClick={() => !isDisabled && onSelectTalla(talla)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative min-w-[3.5rem] px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                ${isSelected 
                  ? 'bg-gray-900 text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-800 border border-gray-200'
                }
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200' 
                  : 'hover:border-gray-900 hover:shadow-md active:scale-95'
                }
              `}
              aria-label={`Seleccionar talla ${talla.nombre}`}
            >
              <span className={isDisabled ? 'line-through text-gray-400' : ''}>
                {talla.nombre}
              </span>
              
              {/* Indicador de seleccionado */}
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.span>
              )}
              
              {/* Indicador de stock bajo */}
              {isLowStock && !isDisabled && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
                  title={`Solo ${stock} disponibles`}
                >
                  <AlertCircle className="w-3 h-3 text-white" />
                </span>
              )}
              
              {/* Badge de agotado */}
              {isDisabled && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded whitespace-nowrap">
                  Agotado
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Leyenda de stock */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
          <span>Pocas unidades</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded">Agotado</span>
          <span>Sin stock</span>
        </div>
      </div>
    </div>
  );
};

export default SelectorTallas;
