import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingDown, 
  Truck, 
  DollarSign, 
  Calendar, 
  Filter, 
  RefreshCcw, 
  PieChart as PieChartIcon,
  BarChart3,
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Download,
  X,
  Eye,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import SafeChartContainer from '../../../components/common/SafeChartContainer';
import { getComprasReport } from '../../../api/reportesApi';
import { proveedoresApi } from '../../../api/proveedoresApi';
import { estadosPedidoApi } from '../../../api/estadosPedidoApi';
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

/**
 * ComprasReportesPage: Módulo profesional de análisis de abastecimiento.
 */
export default function ComprasReportesPage() {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  const [reporte, setReporte] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [estados, setEstados] = useState([]);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    idProveedor: '',
    idEstadoPedido: '',
    montoMin: '',
    montoMax: '',
    page: 1,
    limit: 10
  });

  // --- CARGA DE DATOS ---
  const cargarCatalogos = useCallback(async () => {
    try {
      const [resProv, resEst] = await Promise.all([
        proveedoresApi.listarProveedores(),
        estadosPedidoApi.getEstadosPedido()
      ]);
      setProveedores(resProv.datos || []);
      setEstados(resEst.datos || []);
    } catch (error) {
      console.error("Error loading catalogs:", error);
    }
  }, []);

  const fetchReporte = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getComprasReport(filtros);
      setReporte(response.datos);
    } catch (error) {
      console.error("Error loading report:", error);
      Swal.fire('Error', 'No se pudieron sincronizar los datos de compras', 'error');
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
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0],
      idProveedor: '',
      idEstadoPedido: '',
      montoMin: '',
      montoMax: '',
      page: 1,
      limit: 10
    });
  };

  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, page: nuevaPagina }));
  };

  // --- COMPONENTES AUXILIARES ---
  const KpiCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
      <div className={`absolute -right-4 -bottom-4 opacity-[0.03] text-${color}-500 transform scale-150 rotate-12 group-hover:scale-[1.7] transition-transform duration-700`}>
        <Icon size={100} />
      </div>
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
        </div>
        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 shadow-inner`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header Corporativo */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50 dark:shadow-none">
            <Truck className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Análisis de Abastecimiento</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Control de inversión y flujo de mercancía de entrada.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchReporte}
            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:text-indigo-600 transition-all active:rotate-180"
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider">
            <Download className="h-4 w-4" />
            Consolidado PDF
          </button>
        </div>
      </div>

      {/* Panel de Control - Filtros */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Periodo Inicial</label>
            <input 
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Periodo Final</label>
            <input 
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFiltroChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Socio de Negocio</label>
            <select 
              name="idProveedor"
              value={filtros.idProveedor}
              onChange={handleFiltroChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white appearance-none cursor-pointer"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map(p => <option key={p.idProveedor} value={p.idProveedor}>{p.nombreProveedor}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Estado Operativo</label>
            <select 
              name="idEstadoPedido"
              value={filtros.idEstadoPedido}
              onChange={handleFiltroChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white appearance-none cursor-pointer"
            >
              <option value="">Cualquier estado</option>
              {estados.map(e => <option key={e.idEstadoPedido} value={e.idEstadoPedido}>{e.nombreEstado}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
             <button 
                onClick={limpiarFiltros}
                className="w-full h-12 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-xl hover:bg-rose-100 transition-all font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2"
             >
                <X size={14} /> Reiniciar
             </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
           <div className="h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cuadrando balances de compra...</p>
        </div>
      ) : reporte && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          {/* Dashboard KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard 
              title="Inversión Total" 
              value={<PrecioFormateado precio={reporte.kpis.totalInversion} />} 
              icon={TrendingDown} 
              color="indigo" 
            />
            <KpiCard 
              title="Órdenes de Compra" 
              value={reporte.kpis.totalOrdenes} 
              icon={FileText} 
              color="emerald" 
            />
            <KpiCard 
              title="Promedio por Orden" 
              value={<PrecioFormateado precio={reporte.kpis.promedioCompra} />} 
              icon={DollarSign} 
              color="amber" 
            />
            <KpiCard 
              title="Ahorro en Descuentos" 
              value={<PrecioFormateado precio={reporte.kpis.totalAhorro} />} 
              icon={Database} 
              color="purple" 
            />
          </div>

          {/* Gráficos Principales */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h3 className="text-sm font-bold dark:text-white uppercase tracking-wider">Histórico de Adquisiciones</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Inversión acumulada diaria por orden de compra.</p>
                   </div>
                </div>
                <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
                   <SafeChartContainer width="100%" height="100%" aspect={2.5}>
                      <AreaChart data={reporte.graficos.evolucion} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `$${v/1000}k`} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="inversion" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorInv)" />
                      </AreaChart>
                   </SafeChartContainer>
                </div>
             </div>

             <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h3 className="text-sm font-bold dark:text-white uppercase tracking-wider">Estado Operativo</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Distribución por volumen de órdenes.</p>
                   </div>
                   <PieChartIcon className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="h-[250px] w-full" style={{ minHeight: '250px' }}>
                   <SafeChartContainer width="100%" height="100%" aspect={1.5}>
                      <PieChart>
                         <Pie data={reporte.graficos.porEstado} dataKey="cantidad" innerRadius={60} outerRadius={85} paddingAngle={10}>
                            {reporte.graficos.porEstado.map((entry, idx) => (
                               <Cell key={idx} fill={entry.color} />
                            ))}
                         </Pie>
                         <Tooltip />
                      </PieChart>
                   </SafeChartContainer>
                </div>
                <div className="mt-8 space-y-3">
                   {reporte.graficos.porEstado.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: item.color}} />
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{item.nombre}</span>
                         </div>
                         <span className="text-xs font-bold dark:text-white">{item.cantidad} OC</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Tabla Detallada */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                      <FileText size={18} />
                   </div>
                   <div>
                      <h3 className="text-sm font-bold dark:text-white uppercase tracking-wider">Bitácora de Órdenes de Compra</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Historial cronológico completo</p>
                   </div>
                </div>
                <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                   {reporte.tabla.paginacion.totalItems} Documentos
                </span>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proveedor</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Inversión Bruta</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {reporte.tabla.datos.map((compra) => (
                        <tr 
                           key={compra.idCompra} 
                           onClick={() => navigate(`/admin/compras/detalle/${compra.idCompra}`)}
                           className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all cursor-pointer"
                        >
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                    <Eye size={14} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-xs font-bold dark:text-white tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{compra.numeroCompra}</span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">Items: {compra.detalleCompras?.length}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{compra.proveedor.nombreProveedor}</span>
                                 <span className="text-[10px] text-slate-400 font-medium">NIT: {compra.proveedor.nitCC}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{new Date(compra.fechaCompra).toLocaleDateString()}</span>
                           </td>
                           <td className="px-8 py-6">
                              <span 
                                 className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border"
                                 style={{ 
                                    backgroundColor: `${compra.estadoPedido.color}10`, 
                                    color: compra.estadoPedido.color,
                                    borderColor: `${compra.estadoPedido.color}30`
                                 }}
                              >
                                 {compra.estadoPedido.nombreEstado}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <span className="text-sm font-bold dark:text-white mr-1">
                                 <PrecioFormateado precio={compra.total} />
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* Paginación Real */}
             <div className="px-8 py-6 bg-slate-50 dark:bg-transparent border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Página {reporte.tabla.paginacion.currentPage} de {reporte.tabla.paginacion.totalPages}</span>
                <div className="flex gap-2">
                   <button 
                      disabled={reporte.tabla.paginacion.currentPage === 1}
                      onClick={() => cambiarPagina(reporte.tabla.paginacion.currentPage - 1)}
                      className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all font-bold"
                   >
                      <ChevronLeft size={16} />
                   </button>
                   <button 
                      disabled={reporte.tabla.paginacion.currentPage === reporte.tabla.paginacion.totalPages}
                      onClick={() => cambiarPagina(reporte.tabla.paginacion.currentPage + 1)}
                      className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all font-bold"
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
