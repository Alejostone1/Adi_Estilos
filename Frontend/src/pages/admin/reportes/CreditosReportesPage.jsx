import React, { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Eye,
  Wallet,
  ArrowUpRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import SafeChartContainer from '../../../components/common/SafeChartContainer';
import { getCreditosReport } from '../../../api/reportesApi';
import { usuariosApi } from '../../../api/usuariosApi';
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

/**
 * CreditosReportesPage: Módulo para análisis de cartera y recuperación de créditos.
 */
export default function CreditosReportesPage() {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  const [reporte, setReporte] = useState(null);
  const [clientes, setClientes] = useState([]);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    idUsuario: '',
    estado: '',
    soloVencidos: 'false',
    page: 1,
    limit: 10
  });

  // --- CARGA DE DATOS ---
  const cargarCatalogos = useCallback(async () => {
    try {
      const resClientes = await usuariosApi.getUsuarios({ idRol: 2, limit: 100 });
      setClientes(resClientes.usuarios || []);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  }, []);

  const fetchReporte = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCreditosReport(filtros);
      setReporte(response.datos);
    } catch (error) {
      console.error("Error loading credit report:", error);
      Swal.fire('Error', 'No se pudieron sincronizar los datos de cartera', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarCatalogos();
    fetchReporte();
  }, [fetchReporte, cargarCatalogos]);

  // --- HANDLERS ---
  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value, 
      page: 1 
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      idUsuario: '',
      estado: '',
      soloVencidos: 'false',
      page: 1,
      limit: 10
    });
  };

  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, page: nuevaPagina }));
  };

  // --- COMPONENTES AUXILIARES ---
  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
      <div className={`absolute -right-4 -bottom-4 opacity-[0.03] text-${color}-500 transform scale-150 rotate-12 group-hover:scale-[1.7] transition-transform duration-700`}>
        <Icon size={100} />
      </div>
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
          <p className="text-[10px] font-semibold text-slate-400">{subtitle}</p>
        </div>
        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 shadow-inner`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header Corporativo */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50 dark:shadow-none">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gestión de Cartera y Créditos</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Análisis de recuperación de capital y riesgo crediticio.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchReporte}
            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:text-emerald-600 transition-all active:rotate-180"
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider">
            <Download className="h-4 w-4" />
            Reporte Cartera
          </button>
        </div>
      </div>

      {/* Filtros Avanzados */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha Inicial</label>
            <input 
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
            <select 
              name="idUsuario"
              value={filtros.idUsuario}
              onChange={handleFiltroChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white cursor-pointer"
            >
              <option value="">Todos los clientes</option>
              {clientes.map(c => <option key={c.idUsuario} value={c.idUsuario}>{c.nombres} {c.apellidos}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Estado Crédito</label>
            <select 
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white cursor-pointer"
            >
              <option value="">Cualquier estado</option>
              <option value="activo">Activo</option>
              <option value="pagado">Pagado</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
          <div className="flex items-center gap-4 mt-6 lg:mt-0">
             <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl w-full">
                <input 
                  type="checkbox"
                  name="soloVencidos"
                  id="soloVencidos"
                  checked={filtros.soloVencidos === 'true'}
                  onChange={handleFiltroChange}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="soloVencidos" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer select-none">Solo en Mora</label>
             </div>
          </div>
          <div className="flex items-end">
             <button 
                onClick={limpiarFiltros}
                className="w-full h-12 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-xl hover:bg-rose-100 transition-all font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2"
             >
                <X size={14} /> Limpiar Filtros
             </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4 text-center">
           <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Auditando estados de cuenta...</p>
        </div>
      ) : reporte && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          {/* Dashboard KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Cartera Total" 
              value={<PrecioFormateado precio={reporte.kpis.totalOtorgado} />} 
              subtitle="Capital prestado histórico"
              icon={Wallet} 
              color="indigo" 
            />
            <StatCard 
              title="Saldo Pendiente" 
              value={<PrecioFormateado precio={reporte.kpis.totalPendiente} />} 
              subtitle="Capital por recuperar"
              icon={TrendingUp} 
              color="emerald" 
            />
            <StatCard 
              title="Recuperación" 
              value={`${reporte.kpis.porcentajeRecuperacion.toFixed(1)}%`} 
              subtitle="Índice de recaudo"
              icon={CheckCircle2} 
              color="amber" 
            />
            <StatCard 
              title="En Riesgo (Mora)" 
              value={`${reporte.kpis.countVencidos}`} 
              subtitle="Créditos vencidos no pagados"
              icon={AlertTriangle} 
              color="rose" 
            />
          </div>

          {/* Gráficos Cartera */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h3 className="text-sm font-bold dark:text-white uppercase tracking-wider">Histórico de Colocación</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Créditos otorgados en los últimos 6 meses.</p>
                   </div>
                </div>
                 <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
                    <SafeChartContainer width="100%" height="100%" aspect={2.5}>
                       <BarChart data={reporte.graficos.evolucion} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `$${v/1000}k`} />
                         <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                         <Bar dataKey="otorgado" fill="#10B981" radius={[8, 8, 0, 0]} barSize={40} />
                       </BarChart>
                    </SafeChartContainer>
                 </div>
              </div>

              <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                 <div className="flex justify-between items-start mb-10">
                    <div>
                       <h3 className="text-sm font-bold dark:text-white uppercase tracking-wider">Distribución por Estado</h3>
                       <p className="text-[11px] text-slate-400 font-medium">Segmentación de cartera actual.</p>
                    </div>
                    <PieChartIcon className="h-5 w-5 text-emerald-500" />
                 </div>
                 <div className="h-[250px] w-full" style={{ minHeight: '250px' }}>
                    <SafeChartContainer width="100%" height="100%" aspect={1.5}>
                       <PieChart>
                          <Pie data={reporte.graficos.estados} dataKey="_count.idCredito" nameKey="estado" innerRadius={60} outerRadius={85} paddingAngle={10}>
                             {reporte.graficos.estados.map((entry, idx) => (
                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </SafeChartContainer>
                 </div>
                <div className="mt-8 space-y-3">
                   {reporte.graficos.estados.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}} />
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">{item.estado}</span>
                         </div>
                         <span className="text-xs font-bold dark:text-white">{item._count.idCredito} Créditos</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Tabla de Créditos Detallados */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
                      <CreditCard size={18} />
                   </div>
                   <div>
                      <h3 className="text-sm font-bold dark:text-white uppercase tracking-wider">Relación Maestra de Créditos</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Detalle de obligación y días de morosidad</p>
                   </div>
                </div>
                <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                   {reporte.tabla.paginacion.totalItems} Documentos
                </span>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado / Crédito</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Titular</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vencimiento</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Monto</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Saldo</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Acción</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {reporte.tabla.datos.map((credito) => (
                        <tr key={credito.idCredito} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className={`h-2.5 w-2.5 rounded-full ${credito.estado === 'pagado' ? 'bg-emerald-500' : (credito.diasMora > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500')}`} />
                                 <div className="flex flex-col">
                                    <span className="text-xs font-bold dark:text-white uppercase tracking-tight">#{credito.idCredito}</span>
                                    {credito.diasMora > 0 && (
                                       <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">Mora: {credito.diasMora} días</span>
                                    )}
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{credito.usuario.nombres} {credito.usuario.apellidos}</span>
                                 <span className="text-[10px] text-slate-400 font-medium">C.C. {credito.usuario.cedula}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <Clock size={12} className="text-slate-400" />
                                 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{new Date(credito.fechaVencimiento).toLocaleDateString()}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right font-bold text-xs text-slate-700 dark:text-slate-300">
                              <PrecioFormateado precio={credito.montoTotal} />
                           </td>
                           <td className="px-8 py-6 text-right">
                              <span className={`text-sm font-black ${credito.saldoPendiente > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                                 <PrecioFormateado precio={credito.saldoPendiente} />
                              </span>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <button 
                                 onClick={() => navigate(`/admin/creditos/detalle/${credito.idCredito}`)}
                                 className="h-9 w-9 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              >
                                 <Eye size={16} />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* Paginación */}
             <div className="px-8 py-6 bg-slate-50 dark:bg-transparent border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Página {reporte.tabla.paginacion.currentPage} de {reporte.tabla.paginacion.totalPages}</span>
                <div className="flex gap-2">
                   <button 
                      disabled={reporte.tabla.paginacion.currentPage === 1}
                      onClick={() => cambiarPagina(reporte.tabla.paginacion.currentPage - 1)}
                      className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-all"
                   >
                      <ChevronLeft size={16} />
                   </button>
                   <button 
                      disabled={reporte.tabla.paginacion.currentPage === reporte.tabla.paginacion.totalPages}
                      onClick={() => cambiarPagina(reporte.tabla.paginacion.currentPage + 1)}
                      className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-all"
                   >
                      <ChevronRight size={16} />
                   </button>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
