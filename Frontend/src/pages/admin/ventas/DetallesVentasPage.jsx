import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiShoppingCart, FiUser, FiDollarSign,
  FiSearch, FiFilter, FiCalendar, FiHash, FiActivity, FiLayers, FiPackage,
  FiCreditCard, FiFileText, FiPhone, FiMail, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle, FiPrinter, FiDownload
} from 'react-icons/fi';
import { ventasApi } from '../../../api/ventasApi';
import Swal from 'sweetalert2';

const DetallesVentasPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    totalVendido: 0,
    totalItems: 0,
    promedioVenta: 0,
    clienteTop: 'N/A'
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      let data;
      if (id) {
        const res = await ventasApi.getVentaById(id);
        data = [res.datos || res];
      } else {
        const res = await ventasApi.getVentas({ limite: 100 });
        data = res.datos || [];
      }

      setVentas(Array.isArray(data) ? data : []);
      calcularEstadisticas(data);
    } catch (error) {
      console.error('Error cargando detalles de ventas:', error);
      Swal.fire('Error', 'No se pudieron cargar los detalles', 'error');
    } finally {
      setCargando(false);
    }
  };

  const calcularEstadisticas = (lista) => {
    if (!Array.isArray(lista)) return;

    let totalItems = 0;
    let totalVendido = 0;
    const clientes = {};

    lista.forEach(v => {
      totalVendido += Number(v.total || 0);
      v.detalleVentas?.forEach(d => {
        totalItems += Number(d.cantidad || 0);
      });
      const cNombre = `${v.usuarioCliente?.nombres} ${v.usuarioCliente?.apellidos}`;
      if (v.usuarioCliente) {
        clientes[cNombre] = (clientes[cNombre] || 0) + Number(v.total || 0);
      }
    });

    const topCliente = Object.entries(clientes).sort((a, b) => b[1] - a[1])[0];

    setEstadisticas({
      totalVendido,
      totalItems,
      promedioVenta: lista.length > 0 ? totalVendido / lista.length : 0,
      clienteTop: topCliente ? topCliente[0] : 'N/A'
    });
  };

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  // Aplatana todos los detalles de todas las ventas cargadas
  const todosLosDetalles = Array.isArray(ventas) ? ventas.flatMap(v => {
    if (!v) return [];
    return (v.detalleVentas || []).map(d => ({
      ...d,
      ventaRef: v.numeroFactura || `#${v.idVenta}`,
      idVenta: v.idVenta,
      cliente: `${v.usuarioCliente?.nombres} ${v.usuarioCliente?.apellidos}`,
      fecha: v.creadoEn,
      estadoPedido: v.estadoPedido
    }))
  }) : [];

  const detallesFiltrados = todosLosDetalles.filter(d => {
    const q = (filtroBusqueda || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (d.variante?.producto?.nombreProducto || '').toLowerCase().includes(q) ||
      (d.ventaRef || '').toLowerCase().includes(q) ||
      (d.cliente || '').toLowerCase().includes(q) ||
      String(d.idVenta || '').toLowerCase().includes(q) ||
      String(d.idDetalleVenta || '').toLowerCase().includes(q)
    );
  });

    if (id && ventas.length > 0) {
    const venta = ventas[0];
    const isPaid = venta.saldoPendiente <= 0;

    const getImageUrl = (variante) => {
      const imgPath = variante?.imagenesVariantes?.[0]?.rutaImagen ||
                      variante?.producto?.imagenes?.[0]?.rutaImagen ||
                      variante?.producto?.imagenesProductos?.[0]?.rutaImagen;

      if (!imgPath) return null;
      if (imgPath.startsWith('http')) return imgPath;

      let cleanPath = imgPath.replace(/\\/g, '/');
      if (cleanPath.startsWith('backend/')) cleanPath = cleanPath.replace('backend/', '');
      if (cleanPath.startsWith('/backend/')) cleanPath = cleanPath.replace('/backend/', '');
      if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;

      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
      return cleanPath.startsWith('/uploads') ? `${baseUrl}${cleanPath}` : `${baseUrl}/uploads${cleanPath}`;
    };

    return (
      <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
        <div className="max-w-[1400px] mx-auto space-y-6">
          
          {/* Header Detalle */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
               <button
                onClick={() => navigate('/admin/ventas')}
                className="p-2.5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:scale-105 transition-all text-gray-500 hover:text-indigo-600"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                   <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                     isPaid 
                     ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900' 
                     : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900'
                   }`}>
                     {isPaid ? 'Pagado Completamente' : 'Saldo Pendiente'}
                   </span>
                   <span className="text-gray-400 text-xs font-medium">{new Date(venta.creadoEn).toLocaleDateString()}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                  Orden #{venta.numeroFactura}
                </h1>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 shadow-sm transition-all text-sm">
                 <FiPrinter className="h-4 w-4" /> <span className="hidden sm:inline">Imprimir</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all text-sm">
                 <FiDownload className="h-4 w-4" /> <span className="hidden sm:inline">Exportar PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* Columna 1: Cliente & Info */}
             <div className="space-y-6">
                {/* Cliente */}
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                   <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <FiUser className="text-indigo-500" /> Información del Cliente
                   </h3>
                   <div className="flex items-center gap-4 mb-5">
                      <div className="h-14 w-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 text-lg font-bold">
                         {venta.usuarioCliente?.nombres?.[0]}
                      </div>
                      <div>
                         <p className="font-semibold text-gray-900 dark:text-white">{venta.usuarioCliente?.nombres} {venta.usuarioCliente?.apellidos}</p>
                         <p className="text-xs text-gray-500 font-medium">ID: {venta.usuarioCliente?.usuario}</p>
                         <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold uppercase rounded-md">Cliente Frecuente</span>
                      </div>
                   </div>
                   <div className="space-y-2.5">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg font-medium">
                         <FiMail className="text-gray-400 h-4 w-4 flex-shrink-0" />
                         <span className="truncate">{venta.usuarioCliente?.correoElectronico}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg font-medium">
                         <FiPhone className="text-gray-400 h-4 w-4 flex-shrink-0" />
                         <span>{venta.usuarioCliente?.telefono || 'Sin teléfono'}</span>
                      </div>
                   </div>
                </div>

                {/* Logística */}
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                   <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <FiMapPin className="text-indigo-500" /> Datos de Entrega
                   </h3>
                   <div className="relative pl-4 border-l-2 border-dashed border-gray-200 dark:border-gray-700 space-y-4">
                      <div>
                         <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Dirección de Envío</p>
                         <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{venta.direccionEntrega || 'Misma dirección de facturación'}</p>
                      </div>
                      {venta.notas && (
                        <div>
                           <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Notas / Instrucciones</p>
                           <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                             "{venta.notas}"
                           </p>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             {/* Columna 2: Productos */}
             <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                   <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <FiPackage className="text-indigo-500" /> Items Comprados 
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-medium">{venta.detalleVentas?.length}</span>
                   </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[600px]">
                   {venta.detalleVentas?.map((item, idx) => {
                      const mov = venta.movimientos?.find(m => m.idVariante === item.idVariante);
                      const imageUrl = getImageUrl(item.variante);

                      return (
                        <div key={idx} className="flex gap-3 p-3.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-colors group">
                           <div className="h-16 w-16 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-gray-100 dark:border-gray-700">
                              {imageUrl ? (
                                <img src={imageUrl} alt="Producto" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                   <FiPackage className="h-6 w-6" />
                                </div>
                              )}
                           </div>
                           <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                              <div>
                                 <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight truncate" title={item.variante?.producto?.nombreProducto}>
                                   {item.variante?.producto?.nombreProducto}
                                 </p>
                                 <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {item.variante?.talla && (
                                      <span className="text-[10px] font-medium bg-slate-50 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300">
                                        T: {item.variante.talla.nombreTalla}
                                      </span>
                                    )}
                                    {item.variante?.color && (
                                      <div className="flex items-center gap-1 text-[10px] font-medium bg-slate-50 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300">
                                        C: {item.variante.color.nombreColor}
                                        <div className="h-2 w-2 rounded-full ring-1 ring-gray-200" style={{ backgroundColor: item.variante.color.codigoHex }} />
                                      </div>
                                    )}
                                 </div>
                              </div>
                              
                              <div className="mt-2.5 flex justify-between items-end">
                                 <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] text-gray-400 font-semibold">Cant: {Number(item.cantidad)}</span>
                                       {mov && (
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-semibold border border-indigo-100 dark:border-indigo-900/30">
                                             <span>Stock: {Number(mov.stockAnterior)}</span>
                                             <span>→</span>
                                             <span>{Number(mov.stockNuevo)}</span>
                                          </div>
                                       )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium">SKU: {item.variante?.codigoSku}</p>
                                 </div>
                                 <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatearPrecio(item.subtotal)}</p>
                              </div>
                           </div>
                        </div>
                      );
                   })}
                </div>
                <div className="p-5 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 space-y-2">
                   <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>Subtotal</span>
                      <span className="font-semibold">{formatearPrecio(venta.subtotal)}</span>
                   </div>
                   <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>Descuentos</span>
                      <span className="font-semibold text-rose-500">-{formatearPrecio(venta.descuentoTotal)}</span>
                   </div>
                   <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>Impuestos</span>
                      <span className="font-semibold">+{formatearPrecio(venta.impuestos)}</span>
                   </div>
                   <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2.5 border-t border-gray-200 dark:border-gray-700 mt-2">
                      <span>Total</span>
                      <span>{formatearPrecio(venta.total)}</span>
                   </div>
                </div>
             </div>

             {/* Columna 3: Pagos & Estado */}
             <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                   <div className="flex justify-between items-center mb-5">
                     <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <FiCreditCard className="text-indigo-500" /> Historial de Pagos
                     </h3>
                     <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[10px] font-semibold rounded-md">
                        {venta.pagos?.length} Pagos
                     </span>
                   </div>

                   <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {venta.pagos && venta.pagos.length > 0 ? (
                        venta.pagos.map((pago) => (
                          <div key={pago.idPago} className="relative bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                             <div className="flex justify-between items-start mb-2">
                                <div>
                                   <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{pago.metodoPago?.nombreMetodo || 'Método Desconocido'}</p>
                                   <p className="text-[10px] text-gray-400 font-medium mt-0.5">{new Date(pago.fechaPago).toLocaleString()}</p>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">+{formatearPrecio(pago.monto)}</span>
                             </div>
                             {pago.referencia && (
                               <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg inline-block border border-gray-100 dark:border-gray-700">
                                  <p className="text-[10px] font-medium text-gray-500">Ref: <span className="text-gray-800 dark:text-gray-300 select-all font-semibold">{pago.referencia}</span></p>
                               </div>
                             )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                           <p className="text-xs text-gray-400 font-medium">No hay pagos registrados</p>
                        </div>
                      )}
                   </div>
                   
                   <div className="mt-5 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-semibold text-gray-500">Total Abonado</span>
                         <span className="text-sm font-bold text-emerald-600">{formatearPrecio(venta.totalPagado)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-semibold text-gray-500">Saldo Pendiente</span>
                         <span className={`text-lg font-bold ${venta.saldoPendiente > 0 ? 'text-rose-500' : 'text-gray-400'}`}>{formatearPrecio(venta.saldoPendiente)}</span>
                      </div>
                   </div>
                </div>

                {/* Crédito Info (si existe) */}
                 {venta.credito && (
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                       <div className="absolute -right-8 -top-8 h-32 w-32 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-full transition-colors duration-500" />
                       <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-5 relative z-10 flex items-center gap-2">
                          <FiFileText className="text-indigo-500" /> Información de Crédito
                       </h3>
                       <div className="space-y-5 relative z-10">
                          <div className="grid grid-cols-2 gap-3">
                             <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Inicio</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{new Date(venta.credito.fechaInicio).toLocaleDateString()}</p>
                             </div>
                             <div className="bg-rose-50 dark:bg-rose-900/10 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
                                <p className="text-[10px] font-medium text-rose-400 uppercase tracking-wider mb-0.5">Vencimiento</p>
                                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{venta.credito.fechaVencimiento ? new Date(venta.credito.fechaVencimiento).toLocaleDateString() : 'N/A'}</p>
                             </div>
                          </div>

                          <div className="space-y-2.5">
                             <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-gray-500">Monto Total</span>
                                <span className="font-bold text-gray-800 dark:text-white">{formatearPrecio(venta.credito.montoTotal)}</span>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-gray-500">Total Abonado</span>
                                <span className="font-bold text-emerald-600">{formatearPrecio(venta.credito.totalAbonado)}</span>
                             </div>
                             <div className="relative pt-2">
                                <div className="flex justify-between items-end mb-1.5">
                                   <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Saldo Pendiente</span>
                                   <span className="text-base font-bold text-indigo-600">{formatearPrecio(venta.credito.saldoPendiente)}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                   <div 
                                      className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-lg shadow-indigo-500/20"
                                      style={{ width: `${Math.min(100, (Number(venta.credito.totalAbonado) / Number(venta.credito.montoTotal)) * 100)}%` }}
                                   />
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                             <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Estado del Crédito</span>
                             <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase shadow-sm border ${
                                venta.credito.estado === 'activo' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900' 
                                : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900'
                             }`}>
                                {venta.credito.estado || 'Activo'}
                             </span>
                          </div>
                       </div>
                    </div>
                 )}
             </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
             <button
              onClick={() => navigate('/admin/ventas')}
              className="p-2.5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:scale-105 transition-all text-gray-500 hover:text-indigo-600"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <Link to="/admin/ventas" className="hover:text-indigo-500 transition-colors">Operaciones</Link>
                <span>/</span>
                <span className="text-slate-600 dark:text-slate-300">Auditoría de Salidas</span>
              </nav>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Dashboard de Auditoría
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mt-1">
                <FiActivity className="text-emerald-500" />
                Seguimiento volumétrico de mercancía despachada
              </p>
            </div>
          </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80 group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors h-4 w-4" />
                <input
                  type="text"
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  placeholder="Buscar ítem, factura o cliente..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>
            </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Facturación Bruta"
            value={formatearPrecio(estadisticas.totalVendido)}
            subtitle="Monto total procesado"
            icon={<FiDollarSign />}
            color="indigo"
          />
          <AnalyticsCard
            title="Volumen Despachado"
            value={estadisticas.totalItems}
            subtitle="Unidades totales vendidas"
            icon={<FiPackage />}
            color="blue"
          />
          <AnalyticsCard
            title="Cliente Preferencial"
            value={estadisticas.clienteTop}
            subtitle="Mayor aporte a ingresos"
            icon={<FiUser />}
            color="rose"
          />
          <AnalyticsCard
            title="Ticket Promedio"
            value={formatearPrecio(estadisticas.promedioVenta)}
            subtitle="Valor medio por transacción"
            icon={<FiLayers />}
            color="purple"
          />
        </div>

        {/* Detailed Data Table */}
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/30">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Relación de Ítems Vendidos</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Consolidado dinámico de variantes comercializadas</p>
            </div>
            <div className="bg-indigo-600 px-4 py-1.5 rounded-xl shadow-md shadow-indigo-500/20">
              <span className="text-xs font-semibold text-white">{detallesFiltrados.length} Registros</span>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            {cargando ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-400 font-medium">Sincronizando auditoría…</p>
              </div>
            ) : (
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Variante & Producto</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Factura Ref</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Destinatario</th>
                    <th className="py-3.5 px-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cant.</th>
                    <th className="py-3.5 px-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precio Unit.</th>
                    <th className="py-3.5 px-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dcto. Línea</th>
                    <th className="py-3.5 px-6 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Transacción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                  {detallesFiltrados.map((detalle, idx) => {
                    const imgPath = detalle.variante?.imagenesVariantes?.[0]?.rutaImagen ||
                                detalle.variante?.producto?.imagenesProductos?.[0]?.rutaImagen;

                    let imageUrl = null;
                    if (imgPath) {
                      if (imgPath.startsWith('http')) {
                        imageUrl = imgPath;
                      } else {
                        let cleanPath = imgPath.replace(/\\/g, '/');
                        if (cleanPath.startsWith('backend/')) cleanPath = cleanPath.replace('backend/', '');
                        if (cleanPath.startsWith('/backend/')) cleanPath = cleanPath.replace('/backend/', '');
                        if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
                        const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
                        imageUrl = cleanPath.startsWith('/uploads')
                          ? `${baseUrl}${cleanPath}`
                          : `${baseUrl}/uploads${cleanPath}`;
                      }
                    }

                    return (
                      <tr key={`${detalle.idDetalleVenta}-${idx}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                              {imageUrl ? (
                                <img src={imageUrl} alt="Producto" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <FiPackage className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate max-w-[200px]">
                                {detalle.variante?.producto?.nombreProducto}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-500">
                                  {detalle.variante?.color?.nombreColor || 'N/A'}
                                </span>
                                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                  {detalle.variante?.talla?.nombreTalla || 'Única'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Link to={`/admin/ventas`} className="flex items-center gap-1.5 text-indigo-500 hover:underline">
                            <FiHash className="h-3 w-3" />
                            <span className="text-sm font-bold">{detalle.ventaRef}</span>
                          </Link>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-medium">
                            <FiCalendar className="h-2.5 w-2.5" />
                            <span>{new Date(detalle.fecha).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                           <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                              {detalle.cliente?.[0]}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{detalle.cliente}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-200">{detalle.cantidad}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{formatearPrecio(detalle.precioUnitario)}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`text-[11px] font-semibold border px-2 py-0.5 rounded-lg ${Number(detalle.descuentoLinea) > 0 ? 'bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800' : 'text-gray-300 border-transparent'}`}>
                            {Number(detalle.descuentoLinea) > 0 ? `-${formatearPrecio(detalle.descuentoLinea)}` : '$0'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {formatearPrecio(detalle.totalLinea)}
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

/* Componentes Visuales Internos */

const AnalyticsCard = ({ title, value, subtitle, icon, color }) => {
  const styles = {
    indigo: "from-indigo-600 to-blue-700 shadow-indigo-500/20",
    blue: "from-blue-500 to-indigo-600 shadow-blue-500/20",
    rose: "from-rose-500 to-pink-600 shadow-rose-500/20",
    purple: "from-purple-600 to-indigo-800 shadow-purple-500/20"
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${styles[color]} opacity-[0.03] rounded-bl-[80px] translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700`} />

      <div className="flex items-center gap-4">
        <div className={`h-11 w-11 bg-gradient-to-br ${styles[color]} rounded-xl flex items-center justify-center text-white text-lg shadow-lg flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">{title}</h4>
          <p className="text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate">{value}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-medium text-gray-400">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesVentasPage;