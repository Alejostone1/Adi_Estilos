import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer } from 'recharts';

/**
 * SafeChartContainer - Wrapper component for Recharts ResponsiveContainer
 * Prevents width(-1) and height(-1) errors by ensuring valid dimensions
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Chart components to render
 * @param {number} props.minWidth - Minimum width (default: 300)
 * @param {number} props.minHeight - Minimum height (default: 280)
 * @param {string} props.width - Container width (default: "100%")
 * @param {string} props.height - Container height (default: "100%")
 * @param {number} props.initialWidth - Initial width for dimension calculation
 * @param {number} props.initialHeight - Initial height for dimension calculation
 */
const SafeChartContainer = ({
  children,
  minWidth = 300,
  minHeight = 280,
  width = "100%",
  height = "100%",
  initialWidth = 400,
  initialHeight = 300,
  className = "",
  style = {},
  aspect,
  ...rest
}) => {
  const [containerDimensions, setContainerDimensions] = useState({
    width: initialWidth,
    height: initialHeight
  });
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Función para actualizar dimensiones de forma segura
    const updateDimensions = () => {
      if (container) {
        const rect = container.getBoundingClientRect();
        const clientWidth = rect.width || container.clientWidth || 0;
        const clientHeight = rect.height || container.clientHeight || 0;
        
        // Solo actualizar si tenemos dimensiones válidas y mayores que cero
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerDimensions({ width: clientWidth, height: clientHeight });
          setIsReady(true);
        }
      }
    };

    // Limpiar observer existente
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Medición inicial inmediata
    updateDimensions();
    
    // Configurar ResizeObserver para cambios futuros
    timeoutRef.current = setTimeout(() => {
      observerRef.current = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          // Solo actualizar si tenemos dimensiones reales y válidas
          if (width > 0 && height > 0) {
            setContainerDimensions({ width, height });
            setIsReady(true);
          }
        }
      });

      observerRef.current.observe(container);
    }, 0); // Sin delay para evitar el error

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Estilo del contenedor con dimensiones seguras
  const containerStyle = {
    width,
    height,
    minWidth: `${minWidth}px`,
    minHeight: `${minHeight}px`,
    position: 'relative',
    ...style
  };

  return (
    <div 
      ref={containerRef}
      className={className}
      style={containerStyle}
      {...rest}
    >
      {isReady && containerDimensions.width > 0 && containerDimensions.height > 0 ? (
        <ResponsiveContainer 
          width="100%" 
          height="100%"
          minWidth={minWidth}
          minHeight={minHeight}
          aspect={aspect}
        >
          {children}
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center" style={{ height: '100%', minHeight: `${minHeight}px` }}>
          <div className="text-slate-400 dark:text-slate-500 text-sm animate-pulse">
            Cargando gráfico...
          </div>
        </div>
      )}
    </div>
  );
};

export default SafeChartContainer;
