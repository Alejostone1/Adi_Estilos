import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Package, 
  ChevronRight, 
  Layers, 
  Tag, 
  DollarSign, 
  Box,
  LayoutGrid,
  AlertCircle,
  Palette,
  Ruler
} from 'lucide-react';

import { productosApi } from '../../api/productosApi';
import { variantesApi } from '../../api/variantesApi';
import PrecioFormateado from '../common/PrecioFormateado';
import StatusBadge from './StatusBadge';
import StockIndicator from './StockIndicator';

export default function CategoryDrilldownDrawer({ isOpen, onClose, categoria }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [variantesMap, setVariantesMap] = useState({});
  const [loadingVariantes, setLoadingVariantes] = useState({});

  // Reset state when drawer closes or category changes
  useEffect(() => {
    if (isOpen && categoria) {
      fetchProductos();
    } else {
      setProductos([]);
      setExpandedProduct(null);
      setVariantesMap({});
    }
  }, [isOpen, categoria]);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      // Assuming obtenerProductos can take params
      const response = await productosApi.obtenerProductos({ idCategoria: categoria.idCategoria });
      const data = response.datos || response.data || response;
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar productos de la categoría:", error);
    } finally {
      setLoading(false);
    }
  };

  // Flatten products into variants for direct visibility
  const todasLasVariantes = productos.flatMap(producto => 
    producto.variantes.map(variante => ({
      ...variante,
      nombreProducto: producto.nombreProducto,
      codigoReferencia: producto.codigoReferencia,
      imagenPrincipal: producto.imagenes?.[0]?.rutaImagen || producto.imagenPrincipal,
      precioVentaSugerido: producto.precioVentaSugerido
    }))
  );

  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return '/placeholder.png';
    if (typeof imagenPath !== 'string') return '/placeholder.png';
    
    if (imagenPath.startsWith('http')) return imagenPath;
    
    const baseUrl = 'http://localhost:3000';
    
    // Si ya empieza con /uploads/, solo concatenamos el base
    if (imagenPath.startsWith('/uploads/')) {
      return `${baseUrl}${imagenPath}`;
    }
    
    // Si empieza con uploads/ (sin barra), añadimos barra y base
    if (imagenPath.startsWith('uploads/')) {
      return `${baseUrl}/${imagenPath}`;
    }
    
    // Caso por defecto: asumimos que es una ruta relativa que necesita /uploads/
    return `${baseUrl}/uploads/${imagenPath}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay con blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />
      
      {/* Panel Lateral */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-slate-950 shadow-2xl flex flex-col transition-all duration-500 ease-in-out">
          
          {/* Header del Panel - Estilo Premium */}
          <div className="px-8 py-10 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/30 rotate-3 hover:rotate-0 transition-all duration-500">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-admin-black text-slate-900 dark:text-white leading-none tracking-tight">
                    {categoria?.nombreCategoria}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-admin-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.25em]">
                      Catálogo de Variantes
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <span className="text-[11px] font-admin-bold text-slate-400 dark:text-slate-500 italic">
                      {todasLasVariantes.length} registros activos
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all active:scale-95 group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-admin-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.1em]">Sincronización Live</span>
              </div>
              <StatusBadge status={categoria?.estado} size="sm" />
            </div>
          </div>

          {/* Cuerpo - Lista Plana de Variantes */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <div className="relative">
                  <div className="h-16 w-16 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
                  <div className="absolute top-0 left-0 h-16 w-16 border-4 border-t-indigo-600 border-transparent rounded-full animate-spin" />
                </div>
                <span className="font-admin-black text-slate-400 animate-pulse uppercase tracking-[0.3em] text-[10px]">Analizando SKUs...</span>
              </div>
            ) : todasLasVariantes.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-10">
                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100 dark:border-slate-800">
                  <LayoutGrid className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                </div>
                <h3 className="font-admin-black text-slate-500 dark:text-white text-xl tracking-tight">Categoría sin existencias</h3>
                <p className="text-xs font-admin-medium text-slate-400 mt-2 max-w-[240px] mx-auto leading-relaxed">
                  No hay productos o variantes vinculadas a esta clasificación en este momento.
                </p>
              </div>
            ) : (
              todasLasVariantes.map((variante) => (
                <div 
                  key={variante.idVariante}
                  className="group relative flex items-center gap-6 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-indigo-600 active:scale-[0.985] cursor-pointer"
                  onClick={() => navigate(`/admin/productos`)}
                >
                  {/* Thumbnail de Variante */}
                  <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-1 shrink-0 relative shadow-sm group-hover:shadow-md transition-all">
                    <img 
                      src={getImagenUrl(variante.imagenesVariantes?.[0]?.rutaImagen || variante.imagenPrincipal)} 
                      alt={variante.nombreProducto}
                      className="w-full h-full object-cover rounded-[1.25rem] transition-transform duration-700 group-hover:scale-115"
                      onError={(e) => { e.target.src = '/placeholder.png' }}
                    />
                    {variante.cantidadStock <= 0 && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-[9px] font-admin-black text-white bg-rose-600 px-2 py-1 rounded-lg uppercase tracking-wider">Agotado</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Información Técnica */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-[10px] font-admin-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-xl">
                        {variante.codigoReferencia}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-medium">
                        SKU: {variante.codigoSku}
                      </span>
                    </div>
                    
                    <h4 className="font-admin-black text-slate-800 dark:text-white text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                      {variante.nombreProducto}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-3">
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-700/30">
                          <Palette className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px] font-admin-bold text-slate-600 dark:text-slate-300">
                            {variante.color?.nombreColor || 'N/A'}
                          </span>
                       </div>
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-700/30">
                          <Ruler className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px] font-admin-bold text-slate-600 dark:text-slate-300">
                             {variante.talla?.nombreTalla || 'Única'}
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* Negocio y Disponibilidad */}
                  <div className="text-right flex flex-col items-end gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-admin-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1 opacity-60">
                        Costo PVP
                      </span>
                      <span className="text-xl font-admin-black text-slate-900 dark:text-white tracking-tighter">
                        <PrecioFormateado precio={variante.precioVenta || variante.precioVentaSugerido} />
                      </span>
                    </div>
                    <StockIndicator 
                      currentStock={variante.cantidadStock} 
                      minStock={variante.stockMinimo} 
                      size="sm" 
                      variant="compact"
                    />
                  </div>

                  {/* Indicador de Acción */}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer del Panel */}
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <button 
              onClick={onClose}
              className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-admin-black text-xs uppercase tracking-[0.4em] transition-all active:scale-[0.98] shadow-2xl hover:shadow-indigo-500/20 flex items-center justify-center gap-3 group"
            >
              Cerrar Catálogo
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

