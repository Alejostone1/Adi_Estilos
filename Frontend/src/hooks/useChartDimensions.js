import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to track element dimensions robustly
 * Solves Recharts width(-1) and height(-1) error
 * Provides stable dimensions for ResponsiveContainer
 */
const useChartDimensions = (initialWidth = 400, initialHeight = 300) => {
  // Inicializamos con valores por defecto para evitar dimensiones inválidas
  const [dimensions, setDimensions] = useState({ 
    width: initialWidth, 
    height: initialHeight 
  });
  const ref = useRef(null);
  const timeoutRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const updateDimensions = () => {
      if (ref.current) {
        const { clientWidth, clientHeight } = ref.current;
        // Solo actualizar si tenemos dimensiones válidas y mayores que cero
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };

    // Limpiar observer existente
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Medición inicial inmediata sin timeout para evitar el error
    updateDimensions();
    
    // Configurar ResizeObserver para cambios futuros
    timeoutRef.current = setTimeout(() => {
      observerRef.current = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          // Solo actualizar si tenemos dimensiones reales y válidas
          if (width > 0 && height > 0) {
            setDimensions({ width, height });
          }
        }
      });

      observerRef.current.observe(ref.current);
    }, 50); // Reducido a 50ms para respuesta más rápida

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [ref, dimensions];
};

export default useChartDimensions;
