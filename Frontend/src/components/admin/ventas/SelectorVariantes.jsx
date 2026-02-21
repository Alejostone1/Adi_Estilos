import React, { useState, useEffect } from 'react';
import { galeriaApi } from '../../../api/galeriaApi';
import { 
  FiSearch, FiBox, FiChevronDown, FiPlus, FiAlertCircle, 
  FiImage, FiTag, FiShoppingBag, FiInfo 
} from 'react-icons/fi';

const SelectorVariantes = ({ alAgregar }) => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const resultado = await galeriaApi.listarProductosGaleria();
      setProductos(resultado.datos || []);
    } catch (error) {
      console.error("Error cargando productos de galería", error);
    } finally {
      setCargando(false);
    }
  };

  const toggleExpandir = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const productosFiltrados = productos.filter(p => 
    p.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const UPLOAD_URL = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  return (
    <div className="flex flex-col h-[600px] space-y-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <FiShoppingBag className="h-4 w-4" />
          </div>
          Catálogo de Productos
        </h3>
        <p className="text-xs text-slate-500 ml-10">Selecciona los productos y variantes para agregar al pedido</p>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          placeholder="Buscar por nombre de producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-indigo-100 border-t-indigo-600"></div>
              <FiBox className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-indigo-600 animate-pulse" />
            </div>
            <p className="mt-4 text-sm text-slate-400 font-medium">Cargando inventario...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <FiSearch className="h-8 w-8 text-slate-200 mx-auto mb-3" />
            <h4 className="text-slate-700 dark:text-slate-200 font-semibold">Sin resultados</h4>
            <p className="text-xs text-slate-400 mt-1">No se encontraron productos coincidentes</p>
          </div>
        ) : (
          productosFiltrados.map(producto => (
            <div 
              key={producto.id}
              className={`group bg-white dark:bg-slate-800 border transition-all duration-300 rounded-xl overflow-hidden ${
                expandidos[producto.id] 
                ? 'border-indigo-300 dark:border-indigo-700 shadow-lg shadow-indigo-500/5' 
                : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm hover:shadow-md'
              }`}
            >
              <div 
                className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                  expandidos[producto.id] ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/20'
                }`}
                onClick={() => toggleExpandir(producto.id)}
              >
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-white flex-shrink-0 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform duration-300">
                  {producto.imagen ? (
                    <img 
                      src={`${UPLOAD_URL}${producto.imagen}`} 
                      alt={producto.titulo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-slate-50 dark:bg-slate-800">
                      <FiImage className="text-slate-200 text-xl" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                      {producto.nombreCategoria || 'General'}
                    </span>
                    <span className="text-[10px] text-slate-400">Ref: {producto.subtitulo}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 transition-colors">
                    {producto.titulo}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1.5">
                       <div className="flex -space-x-1">
                          {producto.variantes?.slice(0,4).map((v, idx) => (
                            <div 
                              key={idx} 
                              className="h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
                              style={{ backgroundColor: v.color?.codigoHex || '#cbd5e1' }}
                              title={v.color?.nombreColor}
                            />
                          ))}
                       </div>
                       <span className="text-xs text-slate-400 font-medium">
                         {producto.variantes?.length || 0} Variantes
                       </span>
                    </div>
                    {(producto.variantes?.reduce((acc, v) => acc + v.cantidadStock, 0) || 0) <= 5 && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600">
                        <FiAlertCircle className="h-2.5 w-2.5" /> Stock Bajo
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                   <div className={`p-2 rounded-lg transition-all ${
                     expandidos[producto.id] ? 'bg-indigo-600 text-white rotate-180 shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                   }`}>
                     <FiChevronDown className="h-4 w-4" />
                   </div>
                </div>
              </div>

              {expandidos[producto.id] && (
                <div className="px-5 pb-5 bg-gradient-to-b from-transparent to-slate-50/30 dark:to-slate-900/20 border-t border-slate-100/50 dark:border-slate-700/50 animate-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 pt-4">
                    {producto.variantes && producto.variantes.length > 0 ? (
                      producto.variantes.map(variante => (
                        <div 
                          key={variante.id}
                          className="flex items-center gap-3 bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 group/item"
                        >
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 flex-shrink-0 border border-slate-100 dark:border-slate-700 group-hover/item:scale-105 transition-transform duration-300">
                             <img 
                                src={`${UPLOAD_URL}${variante.imagen || producto.imagen}`} 
                                alt="Variante"
                                className="h-full w-full object-cover"
                              />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <div 
                                className="h-3 w-3 rounded-full border border-slate-200 dark:border-slate-600" 
                                style={{ backgroundColor: variante.color?.codigoHex || '#cbd5e1' }}
                              />
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                {variante.color?.nombreColor || 'S/C'}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="text-[11px] font-medium px-1 py-0.5 bg-slate-50 dark:bg-slate-700 text-slate-500 rounded">
                                {variante.talla?.nombreTalla || 'T/U'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2.5 mt-1">
                              <span className="text-sm font-bold text-indigo-600">
                                ${variante.precioVenta?.toLocaleString() || '0'}
                              </span>
                              <span className={`text-[10px] font-medium ${
                                variante.cantidadStock > 5 
                                  ? 'text-slate-400' 
                                  : variante.cantidadStock > 0 
                                    ? 'text-amber-500' 
                                    : 'text-rose-500'
                              }`}>
                                {variante.cantidadStock > 0 ? `Stock: ${variante.cantidadStock}` : 'Agotado'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alAgregar(variante, producto);
                            }}
                            disabled={variante.cantidadStock <= 0}
                            className={`h-9 w-9 rounded-lg transition-all flex items-center justify-center shadow-sm ${
                              variante.cantidadStock > 0 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110 active:scale-90 shadow-indigo-500/20' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-300 cursor-not-allowed shadow-none'
                            }`}
                          >
                            <FiPlus className={`h-4 w-4 ${variante.cantidadStock > 0 ? '' : 'opacity-30'}`} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-6 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <FiInfo className="h-6 w-6 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-medium">Sin variantes disponibles</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default SelectorVariantes;
