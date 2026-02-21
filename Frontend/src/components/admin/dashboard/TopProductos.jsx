import React from "react";
import PropTypes from "prop-types";

const TopProductos = ({ data = {}, loading = false }) => {
  const topProductos = data?.topProductos || [];

  const totalUnidades = topProductos.reduce(
    (acc, item) => acc + (item?._sum?.cantidad || 0),
    0
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-slate-200 rounded w-1/2"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      
      {/* Header compacto */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Top productos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unidades vendidas
            </p>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {totalUnidades.toLocaleString("es-CO")}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              total
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {topProductos.slice(0, 5).map((item, index) => {
          const cantidad = item?._sum?.cantidad || 0;
          const porcentaje =
            totalUnidades > 0
              ? Math.round((cantidad / totalUnidades) * 100)
              : 0;

          const nombreProducto =
            item?.variante?.producto?.nombreProducto ||
            "Producto desconocido";

          const nombreColor = item?.variante?.color?.nombreColor;
          const codigoColor = item?.variante?.color?.codigoHex; // 👈 importante si lo tienes en BD
          const nombreTalla = item?.variante?.talla?.nombreTalla;

          return (
            <div
              key={item?.id || index}
              className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                
                {/* Ranking minimal */}
                <div className="text-xs font-semibold text-slate-400 w-6">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  
                  {/* Nombre */}
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {nombreProducto}
                    </h4>

                    <div className="text-sm font-semibold text-slate-900 dark:text-white shrink-0">
                      {cantidad}
                    </div>
                  </div>

                  {/* Variante visual */}
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    
                    {/* Swatch color real */}
                    {nombreColor && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full border border-slate-300"
                          style={{
                            backgroundColor: codigoColor || "#ccc",
                          }}
                        />
                        <span>{nombreColor}</span>
                      </div>
                    )}

                    {/* Talla */}
                    {nombreTalla && (
                      <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[11px]">
                        {nombreTalla}
                      </div>
                    )}
                  </div>

                  {/* Barra progreso compacta */}
                  <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 dark:bg-white transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer discreto */}
      <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
        <button className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
          Ver análisis completo →
        </button>
      </div>
    </div>
  );
};

TopProductos.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool,
};

export default TopProductos;