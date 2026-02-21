import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Grid3X3 } from 'lucide-react';

const GaleriaImagenes = ({ imagenes = [], imagenPrincipal, nombreProducto }) => {
  const [imagenActiva, setImagenActiva] = useState(imagenPrincipal);
  const [indexActivo, setIndexActivo] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);

  useEffect(() => {
    setImagenActiva(imagenPrincipal);
    setIndexActivo(0);
    setIsLoading(true);
  }, [imagenPrincipal]);

  const todasLasImagenes = [
    { id: 'main', url: imagenPrincipal, tipo: 'principal' },
    ...imagenes.filter(img => img.url !== imagenPrincipal)
  ].filter(img => img.url);

  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/600x800/f3f4f6/9ca3af?text=Sin+imagen';
  };

  const handleSelectImage = useCallback((img, index) => {
    setIsLoading(true);
    setImagenActiva(img.url);
    setIndexActivo(index);
  }, []);

  const handlePrev = useCallback(() => {
    setIsLoading(true);
    const newIndex = indexActivo === 0 ? todasLasImagenes.length - 1 : indexActivo - 1;
    setIndexActivo(newIndex);
    setImagenActiva(todasLasImagenes[newIndex].url);
  }, [indexActivo, todasLasImagenes]);

  const handleNext = useCallback(() => {
    setIsLoading(true);
    const newIndex = indexActivo === todasLasImagenes.length - 1 ? 0 : indexActivo + 1;
    setIndexActivo(newIndex);
    setImagenActiva(todasLasImagenes[newIndex].url);
  }, [indexActivo, todasLasImagenes]);

  // Keyboard navigation
  useEffect(() => {
    if (!isZoomed) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsZoomed(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isZoomed, handlePrev, handleNext]);

  return (
    <div className="flex flex-col gap-5">
      {/* Imagen principal con controles */}
      <div className="relative group">
        <motion.div 
          className="relative bg-gray-50 rounded-2xl overflow-hidden flex justify-center items-center aspect-[3/4] cursor-zoom-in"
          onClick={() => setIsZoomed(!isZoomed)}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={imagenActiva}
              src={imagenActiva || 'https://placehold.co/600x800/f3f4f6/9ca3af?text=Sin+imagen'}
              alt={`Imagen de ${nombreProducto}`}
              className="w-full h-full object-cover"
              onError={handleImageError}
              onLoad={() => setIsLoading(false)}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </AnimatePresence>

          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
            </div>
          )}

          {/* Badge de tipo de imagen */}
          {todasLasImagenes[indexActivo]?.tipo === 'variante' && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
              <span className="text-xs text-white font-medium">
                {todasLasImagenes[indexActivo]?.color && `Color: ${todasLasImagenes[indexActivo].color}`}
                {todasLasImagenes[indexActivo]?.talla && ` • Talla: ${todasLasImagenes[indexActivo].talla}`}
              </span>
            </div>
          )}

          {/* Contador */}
          {todasLasImagenes.length > 1 && (
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
              <span className="text-xs text-gray-700 font-medium">
                {indexActivo + 1} / {todasLasImagenes.length}
              </span>
            </div>
          )}

          {/* Icono de zoom */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-white hover:scale-110 cursor-pointer">
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </div>
        </motion.div>

        {/* Botones de navegación - siempre visibles en móvil, hover en desktop */}
        {todasLasImagenes.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all hover:bg-white hover:scale-110 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all hover:bg-white hover:scale-110 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {todasLasImagenes.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
          {todasLasImagenes.map((imagen, index) => (
            <motion.button
              key={imagen.id || `thumb-${index}`}
              onClick={() => handleSelectImage(imagen, index)}
              className={`
                relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden transition-all
                ${index === indexActivo 
                  ? 'ring-2 ring-gray-900 ring-offset-2' 
                  : 'ring-1 ring-gray-200 hover:ring-gray-400 opacity-70 hover:opacity-100'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={imagen.url || 'https://placehold.co/100x120/f3f4f6/9ca3af?text=...'}
                alt={`Miniatura ${index + 1} de ${nombreProducto}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              
              {/* Indicador de tipo */}
              {imagen.tipo === 'variante' && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
                    <span className="text-[9px] text-white truncate block">
                      {imagen.color || imagen.talla || 'Variante'}
                    </span>
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Modal de zoom profesional */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col"
            onClick={() => setIsZoomed(false)}
          >
            {/* Header del modal */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/50 to-transparent"
            >
              <div className="flex items-center gap-4">
                <span className="text-white/90 font-medium text-sm md:text-base line-clamp-1">
                  {nombreProducto}
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-xs md:text-sm">
                  {indexActivo + 1} / {todasLasImagenes.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {todasLasImagenes.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowThumbnails(!showThumbnails); }}
                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Ver miniaturas"
                  >
                    <Grid3X3 className="w-5 h-5 text-white" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </motion.div>

            {/* Área principal de la imagen */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              {/* Imagen principal con animación */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={imagenActiva}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" style={{ borderWidth: '3px' }} />
                    </div>
                  )}
                  <img
                    src={imagenActiva}
                    alt={nombreProducto}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    onLoad={() => setIsLoading(false)}
                    onError={handleImageError}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Botones de navegación laterales */}
              {todasLasImagenes.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Barra de miniaturas inferior */}
            <AnimatePresence>
              {(showThumbnails || todasLasImagenes.length > 1) && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-t from-black/80 to-transparent px-6 py-4"
                >
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-w-3xl mx-auto">
                    {todasLasImagenes.map((imagen, index) => (
                      <button
                        key={imagen.id || `modal-thumb-${index}`}
                        onClick={(e) => { e.stopPropagation(); handleSelectImage(imagen, index); }}
                        className={`
                          relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden transition-all duration-200
                          ${index === indexActivo 
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50 scale-105' 
                            : 'opacity-50 hover:opacity-80 hover:scale-105'
                          }
                        `}
                      >
                        <img
                          src={imagen.url}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Indicador de progreso (dots) */}
            {todasLasImagenes.length > 1 && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
                {todasLasImagenes.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    onClick={(e) => { e.stopPropagation(); handleSelectImage(todasLasImagenes[index], index); }}
                    className={`
                      w-2 h-2 rounded-full transition-all duration-200
                      ${index === indexActivo ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}
                    `}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Instrucciones de teclado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs hidden md:block"
            >
              Usa ← → para navegar • ESC para cerrar
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GaleriaImagenes;
