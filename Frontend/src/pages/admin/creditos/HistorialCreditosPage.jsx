import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiEye, FiArrowRight, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiActivity, FiBriefcase
} from 'react-icons/fi';
import { creditosApi } from '../../../api/creditosApi';
import Swal from 'sweetalert2';

const HistorialCreditosPage = () => {
  const navigate = useNavigate();
  const [creditos, setCreditos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    cargarCreditos();
  }, []);

  const cargarCreditos = async () => {
    setCargando(true);
    try {
      const res = await creditosApi.getCreditos({ limite: 100 });
      setCreditos(res.datos || []);
    } catch (error) {
      console.error('Error cargando créditos', error);
      Swal.fire('Error', 'No se pudo cargar el historial de créditos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const formatearPrecio = (valor) => {
    const numero = Math.round(Number(valor) || 0);
    return numero.toLocaleString('es-CO');
  };

  const creditosFiltrados = creditos.filter(credito => {
    const cumpleEstado = filtroEstado === 'todos' || credito.estado === filtroEstado;
    const q = busqueda.toLowerCase();
    const cumpleBusqueda = 
      credito.usuarioCliente?.nombres?.toLowerCase().includes(q) ||
      credito.usuarioCliente?.apellidos?.toLowerCase().includes(q) ||
      String(credito.venta?.numeroFactura).toLowerCase().includes(q);
    
    return cumpleEstado && cumpleBusqueda;
  });

  const totalCartera = creditos.reduce((acc, c) => acc + (c.estado === 'activo' ? Number(c.saldoPendiente) : 0), 0);
  const totalRecaudado = creditos.reduce((acc, c) => acc + Number(c.totalAbonado), 0);

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* Header con Navegación Mejorada */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="flex items-start gap-6">
            <button
              onClick={() => navigate('/admin')}
              className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 text-slate-500 group"
              title="Volver al Dashboard"
            >
              <FiArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <nav className="flex items-center space-x-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-500 mb-2">
                <Link to="/admin" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <Link to="/admin/creditos" className="hover:text-indigo-600 transition-colors">Cartera</Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-400 dark:text-slate-500 font-medium tracking-normal">Historial Maestro</span>
              </nav>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight leading-none">
                Auditoría de Créditos
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-3 font-normal text-lg max-w-2xl">
                Registro histórico detallado de todas las transacciones de crédito y estados de liquidación.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
             <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-4 min-w-[200px]">
                <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                   <FiBriefcase className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cartera Viva</p>
                   <p className="text-lg font-semibold text-slate-900 dark:text-white">$ {formatearPrecio(totalCartera)}</p>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-4 min-w-[200px]">
                <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                   <FiCheckCircle className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recaudo Total</p>
                   <p className="text-lg font-semibold text-slate-900 dark:text-white">$ {formatearPrecio(totalRecaudado)}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Panel de Control y Filtros */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
           <div className="relative w-full md:w-[450px] group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Identificación del cliente, nombres o referencia de venta..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
              />
           </div>
           
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              {['todos', 'activo', 'pagado'].map(filtro => (
                <button
                  key={filtro}
                  onClick={() => setFiltroEstado(filtro)}
                  className={`px-6 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    filtroEstado === filtro 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {filtro === 'todos' ? 'Ver Todos' : filtro}
                </button>
              ))}
           </div>
        </div>

        {/* Tabla Maestro */}
        <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
               <thead>
                 <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                   <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Titular del Crédito</th>
                   <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Operación</th>
                   <th className="px-6 py-5 text-right text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Compromiso</th>
                   <th className="px-6 py-5 text-right text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Liquidado</th>
                   <th className="px-6 py-5 text-right text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pendiente</th>
                   <th className="px-6 py-5 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Calificación</th>
                   <th className="px-8 py-5 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gestión</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                 {cargando ? (
                   <tr>
                    <td colSpan="7" className="py-24">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-[3px] border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">Cargando registros históricos...</p>
                      </div>
                    </td>
                  </tr>
                 ) : creditosFiltrados.length === 0 ? (
                   <tr>
                    <td colSpan="7" className="py-24 text-center">
                       <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <FiActivity className="h-8 w-8" />
                       </div>
                       <p className="text-slate-500 dark:text-slate-400 font-medium">No se encontraron créditos registrados con los filtros aplicados</p>
                    </td>
                  </tr>
                 ) : (
                   creditosFiltrados.map((credito) => (
                     <tr key={credito.idCredito} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 font-semibold border border-slate-200 dark:border-slate-700">
                              {credito.usuarioCliente?.nombres?.[0]}
                            </div>
                            <div>
                               <p className="font-semibold text-slate-900 dark:text-white text-sm">{credito.usuarioCliente?.nombres} {credito.usuarioCliente?.apellidos}</p>
                               <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">ID Usuario: {credito.idUsuario}</p>
                            </div>
                          </div>
                       </td>
                       <td className="px-6 py-6 font-medium">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                              {credito.venta?.numeroFactura || 'S/N'}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">{new Date(credito.fechaInicio).toLocaleDateString()}</p>
                          </div>
                       </td>
                       <td className="px-6 py-6 text-right">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">$ {formatearPrecio(credito.montoTotal)}</span>
                       </td>
                       <td className="px-6 py-6 text-right">
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">$ {formatearPrecio(credito.totalAbonado)}</span>
                       </td>
                       <td className="px-6 py-6 text-right">
                          <span className={`text-sm font-bold ${Number(credito.saldoPendiente) > 0 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-600 line-through'}`}>
                            $ {formatearPrecio(credito.saldoPendiente)}
                          </span>
                       </td>
                       <td className="px-6 py-6 text-center">
                          <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            credito.estado === 'pagado' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20' 
                            : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/20'
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${credito.estado === 'pagado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {credito.estado}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-center">
                          <button 
                            onClick={() => navigate(`/admin/creditos/detalle/${credito.idCredito}`)}
                            className="inline-flex items-center justify-center h-10 w-10 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-slate-200 dark:border-slate-800 rounded-xl transition-all active:scale-95 shadow-sm"
                            title="Ver Expediente"
                          >
                             <FiArrowRight className="h-4 w-4" />
                          </button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
};

export default HistorialCreditosPage;
