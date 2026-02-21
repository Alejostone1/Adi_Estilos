import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Package, FileText, Clock, CheckCircle, 
  DollarSign, Calendar, Search, ArrowRight, Eye, Edit, Trash2,
  AlertCircle, ChevronRight, Hash, Truck, RefreshCcw, Info,
  ExternalLink, Printer, MoreVertical, Download, Filter,
  Palette, Ruler, LayoutGrid
} from 'lucide-react';
import { devolucionesApi } from '../../../api/devolucionesApi';
import DevolucionForm from './DevolucionForm';
import Swal from 'sweetalert2';

/**
 * DetalleDevolucionPage: Refactorizada para un perfil corporativo y profesional.
 * Utiliza la fuente Inter del proyecto, pesos visuales balanceados y minimalismo.
 */
const DetalleDevolucionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [devolucion, setDevolucion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  
  const [listaDevoluciones, setListaDevoluciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    if (id) {
      cargarDetalle();
    } else {
      cargarListaDevoluciones();
    }
    window.scrollTo(0, 0);
  }, [id]);

  const cargarDetalle = async () => {
    setCargando(true);
    try {
      const res = await devolucionesApi.getDevolucionById(id);
      setDevolucion(res.datos || res);
    } catch (error) {
      console.error('Error cargando detalle de devolución', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Lectura',
        text: 'No pudimos acceder al expediente solicitado.',
        confirmButtonColor: '#000'
      });
      navigate('/admin/devoluciones/detalle');
    } finally {
      setCargando(false);
    }
  };

  const cargarListaDevoluciones = async () => {
    setCargando(true);
    try {
      const res = await devolucionesApi.getDevoluciones({ limite: 100 });
      setListaDevoluciones(res.datos || []);
    } catch (error) {
      console.error('Error cargando lista de devoluciones', error);
    } finally {
      setCargando(false);
    }
  };

  const filtrados = useMemo(() => {
    if (id) return [];
    
    return listaDevoluciones.filter(d => {
      const q = busqueda.toLowerCase();
      const cumpleTexto = !busqueda || (
        d.usuarioCliente?.nombres?.toLowerCase().includes(q) ||
        d.usuarioCliente?.apellidos?.toLowerCase().includes(q) ||
        d.numeroDevolucion?.toLowerCase().includes(q) ||
        d.venta?.numeroFactura?.toString().includes(busqueda)
      );
      
      const cumpleEstado = filtroEstado === 'todos' || d.estado === filtroEstado;
      
      return cumpleTexto && cumpleEstado;
    });
  }, [listaDevoluciones, busqueda, filtroEstado, id]);

  const stats = useMemo(() => {
    return {
      total: listaDevoluciones.length,
      pendientes: listaDevoluciones.filter(d => d.estado === 'pendiente').length,
      procesadas: listaDevoluciones.filter(d => d.estado === 'procesada').length
    };
  }, [listaDevoluciones]);

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const formatearFecha = (fecha, extendida = true) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CO', extendida ? {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    } : {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return null;
    if (typeof imagenPath !== 'string') return null;
    if (imagenPath.startsWith('http')) return imagenPath;
    const baseUrl = 'http://localhost:3000';
    if (imagenPath.startsWith('/uploads/') || imagenPath.startsWith('uploads/')) {
       return `${baseUrl}/${imagenPath.startsWith('/') ? imagenPath.slice(1) : imagenPath}`;
    }
    return `${baseUrl}/uploads/${imagenPath}`;
  };

  if (cargando) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="w-10 h-10 border-[3px] border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  // Protección contra nulos si estamos en vista de detalle y aún no hay data
  if (id && !devolucion) return null;

  // VISTA 1: LISTADO (DASHBOARD)
  if (!id) {
    return (
      <div className="p-6 md:p-10 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Gestión de Devoluciones
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Panel administrativo de retornos y garantías.
              </p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              <CardStat title="Total" value={stats.total} icon={<LayoutGrid className="h-4 w-4" />} />
              <CardStat title="Procesadas" value={stats.procesadas} icon={<CheckCircle className="h-4 w-4" />} />
              <CardStat title="Pendientes" value={stats.pendientes} icon={<Clock className="h-4 w-4" />} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="text" 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por código, factura o cliente..."
                className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
              {['todos', 'pendiente', 'procesada'].map(estado => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-5 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                    filtroEstado === estado 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {estado}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtrados.map((item) => (
                <DevolucionCard 
                  key={item.idDevolucion} 
                  item={item} 
                  onClick={() => navigate(`/admin/devoluciones/detalle/${item.idDevolucion}`)}
                  formatearMoneda={formatearMoneda}
                />
              ))}
            </AnimatePresence>
            
            {filtrados.length === 0 && (
              <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">No se encontraron resultados</h3>
                <p className="text-slate-400 text-xs mt-1">Intente ajustar los filtros de búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: DETALLE DEL EXPEDIENTE
  return (
    <div className="p-6 md:p-10 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto space-y-8">
        
        {/* Barra de título y acciones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/devoluciones/detalle')}
              className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expediente de Devolución</span>
                <StatusBadge estado={devolucion.estado} />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                {devolucion.numeroDevolucion}
              </h1>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <ActionBtn icon={<Printer />} label="Imprimir" onClick={() => window.print()} />
            <ActionBtn 
              icon={<Edit />} 
              label="Editar" 
              onClick={() => setMostrarModalEdicion(true)}
              disabled={devolucion.estado === 'procesada'}
              primary
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            
            {/* Información Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Información del Cliente</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {devolucion.usuarioCliente?.nombres} {devolucion.usuarioCliente?.apellidos}
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">{devolucion.usuarioCliente?.correoElectronico || 'Sin correo registrado'}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">NIT / Cédula:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{devolucion.usuarioCliente?.numeroDocumento || '—'}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md border-t-4 border-t-blue-500/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referencia de Venta</span>
                  </div>
                  <button onClick={() => navigate(`/admin/ventas/detalle/${devolucion.idVenta}`)} className="text-slate-400 hover:text-blue-500 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">#{devolucion.venta?.numeroFactura}</h3>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mt-2">Modalidad: {devolucion.tipoDevolucion}</p>
              </div>
            </div>

            {/* Motivos */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Info className="h-4 w-4 text-slate-400" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Justificación del Retorno</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-2 border-slate-300 dark:border-slate-600">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{devolucion.motivo}"
                  </p>
                </div>
                {devolucion.observaciones && (
                  <div className="pl-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Notas Internas</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {devolucion.observaciones}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Listado de Productos */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wide flex items-center gap-2">
                  <Package className="h-4 w-4" /> Ítems en Devolución
                </h3>
                <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  {devolucion.detalleDevoluciones?.length} SKUs
                </span>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800 px-6">
                {devolucion.detalleDevoluciones?.map((item, idx) => {
                  const imgUrl = getImagenUrl(
                    item.variante?.imagenesVariantes?.[0]?.rutaImagen || 
                    item.variante?.producto?.imagenes?.[0]?.rutaImagen
                  );

                  return (
                    <div key={idx} className="py-6 flex flex-col sm:flex-row items-center gap-6 group">
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-inner p-1">
                        {imgUrl ? (
                          <img src={imgUrl} alt={item.variante?.producto?.nombreProducto} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="h-6 w-6" /></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                          {item.variante?.producto?.nombreProducto}
                        </h4>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1">
                          <span className="text-[10px] font-medium text-slate-400">{item.variante?.codigoSku}</span>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Cantidad: {item.cantidadDevuelta}</span>
                          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
                            <span className="w-2 h-2 rounded-full border border-slate-200 dark:border-slate-700" style={{ backgroundColor: item.variante?.color?.codigoHex }} />
                            <span className="text-[10px] font-medium text-slate-500">{item.variante?.color?.nombreColor}</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-500">Talla: {item.variante?.talla?.nombreTalla}</span>
                        </div>
                      </div>

                      <div className="min-w-[120px] text-center sm:text-right pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50 dark:border-slate-800">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Liquidación</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">{formatearMoneda(item.subtotal)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lateral */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-2xl shadow-sm relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl bg-white dark:bg-slate-800/50"></div>
              
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2 relative z-10 text-slate-400">
                Monto Final Liquidado
              </p>
              
              <h2 className="text-4xl font-bold mb-10 tracking-tight relative z-10 text-slate-900 dark:text-white">
                {formatearMoneda(devolucion.totalDevolucion)}
              </h2>
              
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 relative z-10">
                <FinancialRow 
                  label="Base Imponible" 
                  value={formatearMoneda(devolucion.subtotalDevolucion)} 
                  light={false}
                />
                <FinancialRow 
                  label="Impuestos (IVA)" 
                  value={formatearMoneda(devolucion.impuestosDevolucion || 0)} 
                  light={false}
                />
              </div>

               <div className="mt-8 pt-6 relative z-10">
                  <div className={`px-4 py-2.5 rounded-lg text-center text-[11px] font-bold uppercase tracking-wider border transition-all ${
                    devolucion.estado === 'procesada' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50' 
                    : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>
                    {devolucion.estado === 'procesada' ? 'Capital Sincronizado' : 'Pendiente de Cierre'}
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" /> Historial de Registro
              </h3>
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-100 dark:before:bg-slate-800">
                <AuditoriaRow label="Fecha de Creación" value={formatearFecha(devolucion.creadoEn)} />
                <AuditoriaRow label="Responsable administrativo" value={devolucion.usuarioRegistroRef?.nombres || 'Administrador Central'} />
                <AuditoriaRow label="Última modificación" value={formatearFecha(devolucion.actualizadoEn)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mostrarModalEdicion && (
          <DevolucionForm
            devolucion={devolucion}
            accion="editar"
            onClose={() => setMostrarModalEdicion(false)}
            onSuccess={() => {
              setMostrarModalEdicion(false);
              cargarDetalle();
              Swal.fire({
                icon: 'success',
                title: 'Registro Actualizado',
                text: 'Los cambios se han guardado correctamente.',
                confirmButtonColor: '#0f172a'
              });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// COMPONENTES AUXILIARES LOCALES

const CardStat = ({ title, value, icon }) => (
  <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 pr-10 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 min-w-[160px] flex-shrink-0">
    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg border border-slate-100 dark:border-slate-700 shadow-inner">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{title}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
    </div>
  </div>
);

// Fix: Usando forwardRef y reduciendo animaciones
const DevolucionCard = forwardRef(({ item, onClick, formatearMoneda }, ref) => (
  <motion.div 
    ref={ref}
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-300 dark:hover:border-blue-900 transition-all hover:shadow-md h-full flex flex-col"
  >
    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-50 dark:border-slate-800/50">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.numeroDevolucion}</span>
      <StatusBadge estado={item.estado} small />
    </div>

    <div className="flex-1 mb-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
        {item.usuarioCliente?.nombres} {item.usuarioCliente?.apellidos}
      </h3>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
         <span className="text-[9px] font-bold text-slate-400 uppercase">Factura</span>
         <p className="text-xs font-bold text-slate-700 dark:text-slate-300">#{item.venta?.numeroFactura}</p>
      </div>
      <div>
         <span className="text-[9px] font-bold text-slate-400 uppercase">Liquidado</span>
         <p className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-tight">{formatearMoneda(item.totalDevolucion)}</p>
      </div>
    </div>

    <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800/50 text-[10px] font-bold uppercase text-slate-300 group">
      <span className="group-hover:text-blue-500 transition-colors">Visualizar expediente</span>
      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
    </div>
  </motion.div>
));

const StatusBadge = ({ estado, small = false }) => {
  const config = {
    procesada: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50',
    pendiente: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50'
  };
  return (
    <span className={`${small ? 'px-3 py-1 text-[9px]' : 'px-5 py-2 text-[10px]'} rounded-md font-bold uppercase tracking-wider border ${config[estado] || 'bg-slate-50 text-slate-600'}`}>
      {estado}
    </span>
  );
};

const ActionBtn = ({ icon, label, onClick, disabled, primary }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
      primary 
      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' 
      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`}
  >
    {React.cloneElement(icon, { className: "h-4 w-4" })}
    {label}
  </button>
);

const FinancialRow = ({ label, value, light }) => (
  <div className="flex justify-between items-center text-xs">
    <span className={`font-bold uppercase tracking-widest ${light ? 'text-white/60' : 'text-slate-400'}`}>
      {label}
    </span>
    <span className={`font-bold ${light ? 'text-white' : 'text-slate-700 dark:text-slate-100'}`}>
      {value}
    </span>
  </div>
);

const AuditoriaRow = ({ label, value }) => (
  <div className="pl-6 pt-1">
       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
       <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</p>
  </div>
);

export default DetalleDevolucionPage;
