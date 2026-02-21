import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiPackage, FiTruck, FiDollarSign,
  FiSearch, FiFilter, FiCalendar, FiUser,
  FiHash, FiTag, FiClock, FiActivity, FiLayers
} from 'react-icons/fi';
import comprasApi from '../../../api/comprasApi';

const formatearPrecioColombia = (valor) => {
  const numero = Math.round(Number(valor) || 0);
  return numero.toLocaleString('es-CO');
};

const getImagenUrl = (imagenPath) => {
  if (!imagenPath) return null;
  if (imagenPath.startsWith('http')) return imagenPath;
  const rutaRelativa = imagenPath.startsWith('/uploads/') 
    ? imagenPath.replace('/uploads/', '')
    : imagenPath;
  return `http://localhost:3000/api/imagenes/servir/${rutaRelativa}`;
};

const DetalleComprasPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    totalInversion: 0,
    totalItems: 0,
    promedioItem: 0,
    proveedorTop: 'N/A'
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      let data;
      if (id) {
        const res = await comprasApi.obtenerCompra(id);
        data = [res.datos || res];
      } else {
        const res = await comprasApi.obtenerCompras({ limite: 50 });
        data = Array.isArray(res) ? res : res.datos || [];
      }

      setCompras(data);
      calcularEstadisticas(data);
    } catch (error) {
      console.error('Error cargando detalles de compras:', error);
    } finally {
      setCargando(false);
    }
  };

  const calcularEstadisticas = (lista) => {
    let totalItems = 0;
    let totalInversion = 0;
    const proveedores = {};

    lista.forEach(c => {
      const total = Number(c.total) || 0;
      totalInversion += total;
      c.detalleCompras?.forEach(d => {
        totalItems += Number(d.cantidad) || 0;
      });
      const pNombre = c.proveedor?.nombreProveedor;
      if (pNombre) {
        proveedores[pNombre] = (proveedores[pNombre] || 0) + total;
      }
    });

    const topProv = Object.entries(proveedores).sort((a, b) => b[1] - a[1])[0];

    setEstadisticas({
      totalInversion,
      totalItems,
      promedioItem: totalItems > 0 ? totalInversion / totalItems : 0,
      proveedorTop: topProv ? topProv[0] : 'N/A'
    });
  };

  const todosLosDetalles = compras.flatMap(c =>
    (c.detalleCompras || []).map(d => ({
      ...d,
      compraRef: c.numeroCompra || `#${c.idCompra}`,
      idCompra: c.idCompra,
      proveedor: c.proveedor?.nombreProveedor,
      fecha: c.fechaCompra,
      estadoPedido: c.estadoPedido
    }))
  );

  const detallesFiltrados = todosLosDetalles.filter(d =>
    d.variante?.producto?.nombreProducto?.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    d.compraRef.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    d.proveedor?.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="flex items-start gap-6">
            <button
              onClick={() => navigate('/admin/compras')}
              className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 text-slate-500"
            >
              <FiArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <nav className="flex items-center space-x-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-500 mb-2">
                <Link to="/admin/compras" className="hover:text-indigo-600 transition-colors">Abastecimiento</Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-400 dark:text-slate-500 font-medium tracking-normal">Análisis Crítico de Ítems</span>
              </nav>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight leading-none">
                {id ? `Operación: ${compras[0]?.numeroCompra || id}` : "Auditoría Detallada de Mercancía"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-3 font-normal text-lg max-w-2xl">
                {id ? "Desglose técnico de la orden de compra seleccionada." : "Seguimiento exhaustivo de cada unidad ingresada al inventario a través de compras."}
              </p>
            </div>
          </div>

          {!id && (
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96 group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  placeholder="Producto, referencia o socio proveedor..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Suma de Inversión"
            value={`$${formatearPrecioColombia(estadisticas.totalInversion)}`}
            subtitle="Basado en registros actuales"
            icon={<FiDollarSign />}
            color="indigo"
          />
          <AnalyticsCard
            title="Volumen de Carga"
            value={`${estadisticas.totalItems} Uds.`}
            subtitle="Unidades totales ingresadas"
            icon={<FiPackage />}
            color="blue"
          />
          <AnalyticsCard
            title="Proveedor Top"
            value={estadisticas.proveedorTop}
            subtitle="Mayor flujo de capital"
            icon={<FiTruck />}
            color="emerald"
          />
          <AnalyticsCard
            title="Costo Operativo Unitario"
            value={`$${formatearPrecioColombia(estadisticas.promedioItem)}`}
            subtitle="Eficiencia de compra"
            icon={<FiLayers />}
            color="purple"
          />
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Relación Analítica de Productos</h2>
              <p className="text-sm text-slate-400 font-normal mt-1 text-balance">Datos técnicos y financieros por cada variante adquirida.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">{detallesFiltrados.length} Registros Encontrados</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {cargando ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-[3px] border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-400 animate-pulse tracking-wide uppercase">Procesando metadatos...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/10">
                    <th className="px-10 py-5 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Variante</th>
                    <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Referencia</th>
                    <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Aliado</th>
                    <th className="px-6 py-5 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-5 text-right text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">P. Unitario</th>
                    <th className="px-6 py-5 text-right text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Aplicaciones</th>
                    <th className="px-10 py-5 text-right text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Impacto Económico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {detallesFiltrados.map((detalle, idx) => {
                    const img = detalle.variante?.imagenesVariantes?.[0]?.rutaImagen ||
                                detalle.variante?.producto?.imagenes?.[0]?.rutaImagen;

                    return (
                      <tr key={`${detalle.idDetalleCompra}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group">
                        <td className="px-10 py-6">
                          <div className="flex items-center space-x-5">
                            <div className="relative h-12 w-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 transition-transform group-hover:scale-105">
                              {img ? (
                                <img src={getImagenUrl(img)} alt="Variante" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <FiPackage className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                                {detalle.variante?.producto?.nombreProducto}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 font-medium">
                                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                  {detalle.variante?.color?.codigoHex && (
                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white/20" style={{ backgroundColor: detalle.variante.color.codigoHex }} />
                                  )}
                                  <span className="text-[10px] text-slate-500 uppercase">{detalle.variante?.color?.nombreColor || 'N/A'}</span>
                                </div>
                                <span className="text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg text-[10px] bg-indigo-50 dark:bg-indigo-500/10 font-semibold uppercase tracking-wider">
                                  T-{detalle.variante?.talla?.nombreTalla || 'U'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col">
                            <Link to={`/admin/compras`} className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors font-semibold text-sm">
                              <FiHash className="h-3 w-3" />
                              <span>{detalle.compraRef}</span>
                            </Link>
                            <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">
                              {new Date(detalle.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                              {detalle.proveedor?.[0]}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 tracking-tight">{detalle.proveedor || 'Anónimo'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{Number(detalle.cantidad)}</span>
                        </td>
                        <td className="px-6 py-6 text-right font-medium text-sm text-slate-500 dark:text-slate-400">
                          ${formatearPrecioColombia(detalle.precioUnitario)}
                        </td>
                        <td className="px-6 py-6 text-right">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${Number(detalle.descuentoLinea) > 0 ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'text-slate-300 dark:text-slate-700'}`}>
                            {Number(detalle.descuentoLinea) > 0 ? `-$${formatearPrecioColombia(detalle.descuentoLinea)}` : '$0'}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                            ${formatearPrecioColombia(detalle.totalLinea)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Componentes Visuales Privados */

const AnalyticsCard = ({ title, value, subtitle, icon, color }) => {
  const styles = {
    indigo: "bg-indigo-600 text-white shadow-indigo-500/20",
    blue: "bg-blue-600 text-white shadow-blue-500/20",
    emerald: "bg-emerald-600 text-white shadow-emerald-500/20",
    purple: "bg-purple-600 text-white shadow-purple-500/20"
  };

  const bgIcons = {
    indigo: "bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400",
    blue: "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400",
    purple: "bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400"
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
      <div className="flex items-center space-x-3">
        <div className={`h-10 w-10 ${bgIcons[color]} rounded-lg flex items-center justify-center text-lg transition-transform group-hover:scale-110 duration-300 shadow-sm flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{title}</h4>
          <p className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight mt-0.5 truncate">{value}</p>
          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight mt-1 truncate">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default DetalleComprasPage;
