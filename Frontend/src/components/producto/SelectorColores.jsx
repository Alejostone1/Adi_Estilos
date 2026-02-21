import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const SelectorColores = ({ colores = [], onSelectColor, selectedColor }) => {
  if (!colores.length) return null;
  
  return (
    <div className="bg-gray-50/80 rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Color
        </h4>
        <span className="text-sm font-medium text-gray-900 bg-white px-3 py-1 rounded-full shadow-sm">
          {selectedColor?.nombre || 'Selecciona uno'}
        </span>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {colores.map((color, index) => {
          const isSelected = selectedColor?.id === color.id;
          const colorHex = color.hex || color.codigoHex || '#cccccc';
          
          return (
            <motion.button
              key={color.id}
              type="button"
              onClick={() => onSelectColor(color)}
              className={`
                group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
                ${isSelected 
                  ? 'bg-gray-900 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                }
              `}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              aria-label={`Seleccionar color ${color.nombre}`}
            >
              {/* Círculo de color */}
              <span
                className={`
                  w-6 h-6 rounded-full border-2 transition-all
                  ${isSelected ? 'border-white' : 'border-gray-300 group-hover:border-gray-400'}
                `}
                style={{ backgroundColor: colorHex }}
              />
              
              {/* Nombre del color - visible en todos los tamaños */}
              <span className="text-sm font-medium">
                {color.nombre}
              </span>
              
              {/* Checkmark para seleccionado */}
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1"
                >
                  <Check className="w-4 h-4" />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const isLightColor = (hex) => {
  if (!hex) return true;
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};

export default SelectorColores;
