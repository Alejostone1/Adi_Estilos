import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Calendar, 
  Filter, 
  RefreshCcw, 
  PieChart as PieChartIcon,
  BarChart3,
  Search,
  Users,
  Package,
  ChevronLeft,
  ChevronRight,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Download,
  AlertCircle,
  X,
  CreditCard,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import SafeChartContainer from '../../../components/common/SafeChartContainer';
import { getVentasReport } from '../../../api/reportesApi';
import { estadosPedidoApi } from '../../../api/estadosPedidoApi';
import { usuariosApi } from '../../../api/usuariosApi';
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

/**
 * VentasReportesPage: Módulo profesional de reportes basado en data real de Prisma.
 * Implementa filtros dinámicos, métricas avanzadas y gráficos interactivos.
 */
export default function VentasReportesPage() {
  const navigate = useNavigate();
  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  const [reporte, setReporte] = useState(null);
  const [estados, setEstados] = useState([]);
  const [clientes, setClientes] = useState([]);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    idEstadoPedido: '',
    idUsuario: '',
    page: 1,
    limit: 10
  });

  // --- CARGA DE DATOS ---
  const cargarCatalogos = useCallback(async () => {
    try {
      const [resEstados, resClientes] = await Promise.all([
        estadosPedidoApi.getEstadosPedido(),
        usuariosApi.getUsuarios({ idRol: 2, limit: 100 }) // Solo clientes
      ]);
      setEstados(resEstados.datos || []);
      setClientes(resClientes.usuarios || []);
    } catch (error) {
      console.error("Error cargando catálogos:", error);
    }
  }, []);

  const fetchReporte = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVentasReport(filtros);
      setReporte(response.datos);
    } catch (error) {
      console.error("Error cargando reporte:", error);
      Swal.fire('Error', error.msg || 'No se pudo generar el reporte', 'error');
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
      fechaInicio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0],
      idEstadoPedido: '',
      idUsuario: '',
      page: 1,
      limit: 10
    });
  };

  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, page: nuevaPagina }));
  };

  // --- COMPONENTES AUXILIARES ---
  const KpiCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
      <div className={`absolute -right-4 -bottom-4 opacity-5 text-${color}-500 group-hover:scale-110 transition-transform`}>
        <Icon size={120} />
      </div>
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
            {trend && (
              <span className={`text-[10px] font-bold flex items-center ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50 dark:shadow-none">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Reportes de Ventas</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic">Análisis exhaustivo del rendimiento comercial.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchReporte}
            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200"
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Toolbar Filtros */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="space-y-2 flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Fecha Inicio</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input 
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="space-y-2 flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Fecha Fin</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input 
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFiltroChange}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="space-y-2 flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Estado de Pedido</label>
          <select 
            name="idEstadoPedido"
            value={filtros.idEstadoPedido}
            onChange={handleFiltroChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
          >
            <option value="">Todos los Estados</option>
            {estados.map(e => <option key={e.idEstadoPedido} value={e.idEstadoPedido}>{e.nombreEstado}</option>)}
          </select>
        </div>

        <div className="space-y-2 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Cliente</label>
          <select 
            name="idUsuario"
            value={filtros.idUsuario}
            onChange={handleFiltroChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
          >
            <option value="">Cualquier Cliente</option>
            {clientes.map(c => <option key={c.idUsuario} value={c.idUsuario}>{c.nombres} {c.apellidos}</option>)}
          </select>
        </div>

        <button 
          onClick={limpiarFiltros}
          className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl hover:bg-red-100 transition-all border border-transparent"
          title="Limpiar Filtros"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Report Content */}
      <AnimatePresence mode='wait'>
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-40 gap-4"
          >
            <div className="h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Dimensionando datos comerciales...</p>
          </motion.div>
        ) : reporte && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard 
                title="Ventas Totales" 
                value={<PrecioFormateado precio={reporte.kpis.totalVentas} />} 
                icon={TrendingUp} 
                color="indigo"
              />
              <KpiCard 
                title="Pedidos Realizados" 
                value={reporte.kpis.totalPedidos} 
                icon={ShoppingCart} 
                color="emerald"
              />
              <KpiCard 
                title="Ticket Promedio" 
                value={<PrecioFormateado precio={reporte.kpis.ticketPromedio} />} 
                icon={DollarSign} 
                color="amber"
              />
              <KpiCard 
                title="Ahorro Descuentos" 
                value={<PrecioFormateado precio={reporte.kpis.ahorroPorDescuentos} />} 
                icon={Database} 
                color="purple"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sales over time */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-sm font-bold dark:text-white uppercase tracking-wider">Flujo de Ingresos</h4>
                      <p className="text-[11px] text-slate-400 font-medium">Volumen de ventas diarias durante el periodo seleccionado.</p>
                    </div>
                    <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-500">
                       <TrendingUp className="h-5 w-5" />
                    </div>
                 </div>
                 <div className="h-[350px] w-full mt-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                      <div className="absolute top-10 right-10 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
                    </div>
                    
                    <SafeChartContainer 
                      width="100%" 
                      height="100%" 
                      minHeight={350}
                      className="relative z-10"
                    >
                      <AreaChart data={reporte.graficos.ventasPorDia} margin={{ top: 15, right: 20, left: 20, bottom: 15 }}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.3} />
                        <XAxis 
                          dataKey="fecha" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                          dy={8} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                          tickFormatter={(v) => `$${v/1000}k`} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '12px', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            padding: '8px 12px'
                          }}
                          labelStyle={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}
                          formatter={(value) => [`$${value.toLocaleString()}`, 'Ventas']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#3b82f6" 
                          strokeWidth={2.5}
                          fill="url(#colorFill)"
                          dot={{ r: 0 }}
                          activeDot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </SafeChartContainer>
                 </div>
              </div>
              
              {/* Pie Chart */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-sm font-bold dark:text-white uppercase tracking-wider">Estado de Pedidos</h4>
                      <p className="text-[11px] text-slate-400 font-medium">Distribución por volumen.</p>
                    </div>
                    <PieChartIcon className="h-5 w-5 text-emerald-500" />
                 </div>
                 <div className="h-[250px] w-full flex-grow relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/50 border border-emerald-200/50 dark:border-emerald-700/50">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10"></div>
                      <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
                      <div className="absolute top-8 right-8 w-16 h-16 bg-teal-500/20 rounded-full blur-xl"></div>
                    </div>
                    
                    <SafeChartContainer 
                      width="100%" 
                      height="100%" 
                      minHeight={250}
                      className="relative z-10"
                    >
                       <PieChart>
                          <Pie
                            data={reporte.graficos.ventasPorEstado}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="total"
                          >
                            {reporte.graficos.ventasPorEstado.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                            ))}
                          </Pie>
                          <Tooltip 
                             contentStyle={{ 
                               backgroundColor: '#ffffff', 
                               border: '1px solid #e2e8f0', 
                               borderRadius: '12px', 
                               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                               padding: '8px 12px'
                             }}
                             formatter={(value) => [`$${value.toLocaleString()}`, 'Total']}
                          />
                       </PieChart>
                    </SafeChartContainer>
                 </div>
                 <div className="mt-4 space-y-2">
                    {reporte.graficos.ventasPorEstado.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: item.color}} />
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{item.nombre}</span>
                         </div>
                         <span className="text-[11px] font-bold dark:text-white uppercase tracking-tighter">
                            {((item.total / (reporte.kpis.totalVentas || 1)) * 100).toFixed(1)}%
                         </span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Bottom Section: Top Products and Detail Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               
               {/* Top Products */}
               <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-sm font-bold dark:text-white uppercase tracking-wider">Top 5 Productos</h4>
                    <Package className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="space-y-6">
                    {reporte.graficos.topProductos.map((prod, idx) => (
                      <div key={idx} className="relative group">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[11px] font-bold dark:text-slate-200 truncate pr-4 max-w-[70%]">{prod.nombre}</span>
                           <span className="text-[10px] font-bold text-indigo-500 uppercase">{prod.cantidadVendida} unid.</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(prod.cantidadVendida / (reporte.graficos.topProductos[0]?.cantidadVendida || 1)) * 100}%` }}
                             className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                           />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-12 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/40">
                     <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">Producto Estrella</p>
                     <h5 className="text-sm font-bold dark:text-white">{reporte.graficos.topProductos[0]?.nombre || 'N/A'}</h5>
                     <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full">
                           Mayor Demanda
                        </span>
                     </div>
                  </div>
               </div>

               {/* Detailed Table */}
               <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                     <div>
                        <h4 className="text-sm font-bold dark:text-white uppercase tracking-wider text-indigo-600">Bitácora de Transacciones</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Registros individuales filtrados.</p>
                     </div>
                     <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/50">
                             <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Factura</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {reporte.tablaDetalle.datos.map((venta) => (
                             <tr 
                                key={venta.idVenta} 
                                onClick={() => navigate(`/admin/ventas/detalle/${venta.idVenta}`)}
                                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors cursor-pointer"
                             >
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                         <Eye size={14} />
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-xs font-bold dark:text-white group-hover:text-indigo-600 transition-colors">{venta.numeroFactura}</span>
                                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Ver detalle</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex flex-col">
                                      <span className="text-xs font-bold dark:text-white capitalize">{venta.usuarioCliente.nombres} {venta.usuarioCliente.apellidos}</span>
                                      <span className="text-[10px] text-slate-400 font-medium">NIT/CC: {venta.idUsuario}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                      {new Date(venta.creadoEn).toLocaleDateString()}
                                   </span>
                                </td>
                                <td className="px-6 py-4">
                                   <span 
                                      className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                                      style={{ 
                                        backgroundColor: `${venta.estadoPedido.color}15`, 
                                        color: venta.estadoPedido.color,
                                        borderColor: `${venta.estadoPedido.color}40`
                                      }}
                                   >
                                      {venta.estadoPedido.nombreEstado}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <span className="text-xs font-bold dark:text-white">
                                      <PrecioFormateado precio={venta.total} />
                                   </span>
                                </td>
                             </tr>
                          ))}
                          {reporte.tablaDetalle.datos.length === 0 && (
                            <tr>
                               <td colSpan="5" className="py-20 text-center">
                                  <AlertCircle className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No hay ventas registradas en este periodo</p>
                               </td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  <div className="p-6 bg-slate-50/30 dark:bg-transparent border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Página {reporte.tablaDetalle.paginacion.currentPage} de {reporte.tablaDetalle.paginacion.totalPages}
                     </span>
                     <div className="flex items-center gap-2">
                        <button 
                          disabled={reporte.tablaDetalle.paginacion.currentPage === 1}
                          onClick={() => cambiarPagina(reporte.tablaDetalle.paginacion.currentPage - 1)}
                          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all font-bold"
                        >
                           <ChevronLeft size={16} />
                        </button>
                        <button 
                          disabled={reporte.tablaDetalle.paginacion.currentPage === reporte.tablaDetalle.paginacion.totalPages}
                          onClick={() => cambiarPagina(reporte.tablaDetalle.paginacion.currentPage + 1)}
                          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all font-bold"
                        >
                           <ChevronRight size={16} />
                        </button>
                     </div>
                  </div>
               </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
