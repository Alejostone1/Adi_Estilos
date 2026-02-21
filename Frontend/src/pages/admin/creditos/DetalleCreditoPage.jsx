import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiUser, FiShoppingBag, FiCreditCard, FiClock, FiCheckCircle, 
  FiFileText, FiDollarSign, FiCalendar, FiPlus, FiSearch, FiArrowRight, FiEye, FiActivity, FiBriefcase
} from 'react-icons/fi';
import { creditosApi } from '../../../api/creditosApi';
import { useAuth } from '../../../context/AuthContext';
import ModalRegistrarAbono from '../../../components/admin/creditos/ModalRegistrarAbono';
import Swal from 'sweetalert2';

const DetalleCreditoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [credito, setCredito] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbonoOpen, setModalAbonoOpen] = useState(false);
  
  const [listaCreditos, setListaCreditos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtrados, setFiltrados] = useState([]);

  useEffect(() => {
    if (id) {
      cargarDetalle();
    } else {
      cargarListaCreditos();
    }
  }, [id]);

  const cargarDetalle = async () => {
    setCargando(true);
    try {
      const res = await creditosApi.getCreditoById(id);
      setCredito(res.datos || res);
    } catch (error) {
      console.error('Error cargando detalle de crédito', error);
      Swal.fire('Error', 'No se pudo cargar la información del crédito', 'error');
      navigate('/admin/creditos/detalle');
    } finally {
      setCargando(false);
    }
  };

  const cargarListaCreditos = async () => {
    setCargando(true);
    try {
      const res = await creditosApi.getCreditos({ limite: 50 });
      const datos = res.datos || [];
      setListaCreditos(datos);
      setFiltrados(datos);
    } catch (error) {
      console.error('Error cargando lista de créditos', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!id && busqueda) {
      const q = busqueda.toLowerCase();
      const filtered = listaCreditos.filter(c => 
        c.usuarioCliente?.nombres?.toLowerCase().includes(q) ||
        c.usuarioCliente?.apellidos?.toLowerCase().includes(q) ||
        c.venta?.numeroFactura?.toString().includes(q) ||
        c.idCredito.toString().includes(q)
      );
      setFiltrados(filtered);
    } else {
      setFiltrados(listaCreditos);
    }
  }, [busqueda, listaCreditos, id]);

  const formatearPrecio = (valor) => {
    const numero = Math.round(Number(valor) || 0);
    return numero.toLocaleString('es-CO');
  };

  const calculateDebtPercentage = () => {
    if (!credito) return 0;
    return Math.round((credito.saldoPendiente / credito.montoTotal) * 100);
  };

  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return null;
    if (imagenPath.startsWith('http')) return imagenPath;
    const rutaRelativa = imagenPath.startsWith('/uploads/') ? imagenPath.replace('/uploads/', '') : imagenPath;
    return `http://localhost:3000/api/imagenes/servir/${rutaRelativa}`;
  };

  if (cargando) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#f8fafc] dark:bg-slate-950 gap-4">
        <div className="w-12 h-12 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Expediente...</p>
      </div>
    );
  }

  // MODO BUSCADOR
  if (!id) {
    return (
      <div className="p-6 md:p-10 bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
        <div className="max-w-[1400px] mx-auto space-y-12">
           
           <div className="max-w-4xl mx-auto text-center space-y-8 pt-10">
              <nav className="flex items-center justify-center space-x-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-500 mb-2">
                <Link to="/admin" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-400 dark:text-slate-500 font-medium tracking-normal">Consulta de Cartera</span>
              </nav>
              <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight leading-tight">
                Auditoría de <span className="text-indigo-500">Cartera Global</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-normal max-w-2xl mx-auto">
                Accede a la base de datos de créditos para gestionar pagos, historial de cobranza y estados de liquidación.
              </p>

              <div className="relative group max-w-2xl mx-auto">
                 <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <FiSearch className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                 </div>
                 <input 
                   type="text" 
                   value={busqueda}
                   onChange={(e) => setBusqueda(e.target.value)}
                   placeholder="Buscar por cliente, factura o ID de crédito..."
                   className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-lg font-medium transition-all outline-none"
                 />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtrados.map((item) => (
                 <div 
                    key={item.idCredito}
                    onClick={() => navigate(`/admin/creditos/detalle/${item.idCredito}`)}
                    className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                 >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                        OP #{item.idCredito}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                         item.estado === 'pagado' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' 
                          : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20'
                      }`}>
                         {item.estado}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">
                       {item.usuarioCliente?.nombres} <span className="text-slate-400 font-normal">{item.usuarioCliente?.apellidos}</span>
                    </h3>
                    
                    <div className="mt-8 space-y-4">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Recuperable</span>
                          <span className="text-xl font-semibold text-rose-500 tracking-tight">$ {formatearPrecio(item.saldoPendiente)}</span>
                       </div>
                       
                       <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                             className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                             style={{ width: `${Math.round(((item.montoTotal - item.saldoPendiente) / item.montoTotal) * 100)}%` }}
                          />
                       </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-slate-400">
                       <p className="text-[10px] uppercase font-bold tracking-tighter">
                        {Math.round(((item.montoTotal - item.saldoPendiente) / item.montoTotal) * 100)}% Liquidado
                       </p>
                       <div className="flex items-center gap-2 group-hover:text-indigo-500 transition-colors text-[11px] font-semibold uppercase">
                          Expediente <FiArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>
                 </div>
              ))}
              
              {filtrados.length === 0 && (
                 <div className="col-span-full py-24 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <FiBriefcase className="h-8 w-8" />
                    </div>
                    <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Sin coincidencias en la cartera</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  // MODO DETALLE
  return (
    <div className="p-5 md:p-10 bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
           <div className="flex items-start gap-6">
              <button 
                onClick={() => navigate('/admin/creditos/detalle')}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 transition-all active:scale-95"
              >
                <FiArrowLeft className="h-5.5 w-5.5" />
              </button>
              <div>
                 <nav className="flex items-center space-x-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-500 mb-2">
                    <Link to="/admin" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <Link to="/admin/creditos/detalle" className="hover:text-indigo-600 transition-colors">Cartera</Link>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <span className="text-slate-400 dark:text-slate-500 font-medium tracking-normal">Expediente #{credito.idCredito}</span>
                 </nav>
                 <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Análisis Individual</h1>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      credito.estado === 'pagado'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20'
                    }`}>
                      {credito.estado}
                    </span>
                 </div>
              </div>
           </div>

           {credito.estado === 'activo' && (
             <button 
                onClick={() => setModalAbonoOpen(true)}
                className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-semibold uppercase text-[11px] tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
             >
                <FiPlus className="h-4 w-4" /> Registrar Recaudo
             </button>
           )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
           
           {/* Section Left: User & Transactions */}
           <div className="xl:col-span-8 space-y-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* ID Tarjeta Cliente */}
                 <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                         <div className="h-5 w-5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <FiUser size={12} />
                         </div>
                         Titular de la Deuda
                      </h3>
                      <p className="text-2xl font-semibold text-slate-900 dark:text-white leading-tight">{credito.usuarioCliente?.nombres} {credito.usuarioCliente?.apellidos}</p>
                      <p className="text-sm text-indigo-500 font-medium mb-8 mt-1">{credito.usuarioCliente?.correoElectronico}</p>
                      
                      <div className="space-y-3">
                         <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 font-medium">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Identificación</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300">{credito.usuarioCliente?.usuario || 'N/A'}</span>
                         </div>
                         <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 font-medium">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Línea de Contacto</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300">{credito.usuarioCliente?.telefono || 'N/A'}</span>
                         </div>
                      </div>
                    </div>
                 </div>

                 {/* Venta de Referencia */}
                 <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                         <div className="h-5 w-5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <FiFileText size={12} />
                         </div>
                         Venta Vinculada
                      </h3>
                      <p className="text-2xl font-semibold text-slate-900 dark:text-white">Factura {credito.venta?.numeroFactura}</p>
                      <p className="text-xs text-slate-400 font-medium mb-8 mt-1 lowercase first-letter:uppercase tracking-tight">Emisión: {new Date(credito.venta?.creadoEn).toLocaleDateString()}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Factura</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">$ {formatearPrecio(credito.venta?.total)}</p>
                         </div>
                         <div className="bg-indigo-50/50 dark:bg-indigo-500/5 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20">
                            <p className="text-[9px] font-bold text-indigo-400 uppercase mb-1">Capital Financiado</p>
                            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">$ {formatearPrecio(credito.montoTotal)}</p>
                         </div>
                      </div>

                      <button
                         onClick={() => navigate(`/admin/ventas/detalle/${credito.idVenta}`)}
                         className="mt-6 w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-900 dark:bg-slate-800 text-white font-semibold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                      >
                         <FiEye className="h-4 w-4" /> Inspeccionar Venta
                      </button>
                    </div>
                 </div>
              </div>

              {/* Inventario Financiado */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                       <FiShoppingBag className="text-indigo-500" /> Detalle de Artículos
                    </h3>
                    <span className="text-[10px] px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full font-bold text-slate-400">
                      {credito.venta?.detalleVentas?.length} ÍTEMS
                    </span>
                 </div>
                 
                 <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                     {credito.venta?.detalleVentas?.map((item) => {
                        const imageUrl = getImagenUrl(item.variante?.imagenesVariantes?.[0]?.rutaImagen || item.variante?.producto?.imagenesProductos?.[0]?.rutaImagen);
                        return (
                           <div key={item.idDetalleVenta} className="flex flex-col sm:flex-row gap-6 p-6 rounded-3xl bg-slate-50/40 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/50 transition-all hover:bg-white dark:hover:bg-slate-800 group items-start sm:items-center">
                              <div className="h-20 w-20 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border border-slate-200 dark:border-slate-800 self-center sm:self-auto">
                                 {imageUrl ? (
                                    <img src={imageUrl} alt="P" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                       <FiShoppingBag className="h-6 w-6" />
                                    </div>
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="font-semibold text-slate-900 dark:text-white text-base leading-tight truncate uppercase tracking-tight">{item.variante?.producto?.nombreProducto}</p>
                                 <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-[9px] font-bold bg-white dark:bg-slate-900 px-3 py-1 rounded-lg text-slate-500 border border-slate-200 dark:border-slate-700 uppercase tracking-wide">
                                       {item.variante?.color?.nombreColor}
                                    </span>
                                    <span className="text-[9px] font-bold bg-white dark:bg-slate-900 px-3 py-1 rounded-lg text-slate-500 border border-slate-200 dark:border-slate-700 uppercase tracking-wide">
                                       Talle: {item.variante?.talla?.nombreTalla}
                                    </span>
                                 </div>
                              </div>
                              <div className="w-full sm:w-auto text-left sm:text-right flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-200 dark:border-slate-700">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">Cant x{Number(item.cantidad)}</p>
                                 <p className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">$ {formatearPrecio(item.totalLinea || item.subtotal)}</p>
                              </div>
                           </div>
                        )
                     })}
                 </div>
              </div>
           </div>

           {/* Section Right: Financial Status */}
           <div className="xl:col-span-4 space-y-10">
              
              <div className="bg-indigo-600 dark:bg-indigo-950/40 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-500/20 border border-indigo-500/20 relative overflow-hidden text-center">
                 <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                 <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mb-6">Saldo Pendiente de Pago</p>
                    <p className="text-5xl font-semibold tracking-tighter mb-10">$ {formatearPrecio(credito.saldoPendiente)}</p>
                    
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-10">
                       <div 
                         className="absolute top-0 left-0 h-full bg-emerald-400 transition-all duration-1000 ease-out"
                         style={{ width: `${100 - calculateDebtPercentage()}%` }} 
                       />
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-white/10 pt-8">
                       <div className="text-left space-y-1">
                          <p className="uppercase text-[9px] font-bold opacity-50 tracking-widest">Financiado</p>
                          <p className="text-base font-semibold">$ {formatearPrecio(credito.montoTotal)}</p>
                       </div>
                       <div className="text-right space-y-1">
                          <p className="uppercase text-[9px] font-bold text-emerald-400 tracking-widest">Liquidado ({100 - calculateDebtPercentage()}%)</p>
                          <p className="text-xl font-semibold text-emerald-400">$ {formatearPrecio(credito.totalAbonado)}</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Timeline de Recaudos */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">
                 <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-3">
                    <FiClock className="text-indigo-500" /> Bitácora de Recaudo
                 </h3>
                 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2 relative">
                    <div className="absolute left-3 top-2 bottom-6 w-[2px] bg-slate-100 dark:bg-slate-800" />
                    
                    {credito.venta?.pagos?.filter(p => p.tipoPago === 'abono' || p.metodoPago?.nombreMetodo.toLowerCase().includes('crédito') === false).map((pago, idx) => (
                       <div key={pago.idPago} className="relative pl-10 group">
                          <div className="absolute left-[-1px] top-1.5 h-4 w-4 rounded-full bg-white dark:bg-slate-950 border-4 border-indigo-500 z-10 transition-transform group-hover:scale-125 shadow-sm shadow-indigo-500/30" />
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100/60 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                             <div className="flex justify-between items-start mb-3">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                   {new Date(pago.fechaPago).toLocaleDateString()}
                                </span>
                                <span className="text-base font-semibold text-emerald-600">+$ {formatearPrecio(pago.monto)}</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-slate-500 capitalize">{pago.metodoPago?.nombreMetodo}</p>
                                {pago.referencia && (
                                   <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded uppercase">Ref: {pago.referencia}</span>
                                )}
                             </div>
                          </div>
                       </div>
                    ))}

                    {(!credito.venta?.pagos || credito.venta?.pagos.length === 0) && (
                       <div className="text-center py-20 flex flex-col items-center">
                          <div className="h-14 w-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 text-slate-200">
                             <FiDollarSign size={24} />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-10">
                             Inicia el seguimiento de cartera <br/> registrando el primer abono
                          </p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>

      <ModalRegistrarAbono
        isOpen={modalAbonoOpen}
        onClose={() => setModalAbonoOpen(false)}
        credito={credito}
        onAbonoRegistrado={cargarDetalle}
      />
    </div>
  );
};

export default DetalleCreditoPage;
