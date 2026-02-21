import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Eye,
  Users,
  ShoppingCart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { productosApi } from '../../../api/productosApi';
import { variantesApi } from '../../../api/variantesApi';
import { useTheme } from '../../../context/ThemeContext';
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import SafeChartContainer from '../../../components/common/SafeChartContainer';

const ProductoEstadisticasPage = () => {
  const { idProducto } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  // Colores para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        
        // Obtener estadísticas completas del producto
        const estadisticasRes = await productosApi.getEstadisticasProducto(idProducto);
        const datos = estadisticasRes?.datos || estadisticasRes;
        
        setProducto(datos?.producto || {});
        setVariantes(datos?.variantes?.detalle || []);
        setEstadisticas({
          ventasMensuales: datos?.ventas?.mensuales || [],
          variantesRendimiento: datos?.variantesRendimiento || []
        });
        
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (idProducto) {
      fetchDatos();
    }
  }, [idProducto]);

  // Calcular métricas
  const metricas = useMemo(() => {
    if (!estadisticas) return { totalVentas: 0, totalUnidades: 0, promedioVenta: 0, crecimiento: 0 };
    
    const ventas = estadisticas.ventasMensuales || [];
    const totalVentas = ventas.reduce((sum, v) => sum + v.ventas, 0);
    const totalUnidades = ventas.reduce((sum, v) => sum + v.unidades, 0);
    const promedioVenta = ventas.length > 0 ? totalVentas / ventas.length : 0;
    
    // Calcular crecimiento
    const crecimiento = ventas.length > 1 
      ? ((ventas[ventas.length - 1].ventas - ventas[ventas.length - 2].ventas) / ventas[ventas.length - 2].ventas) * 100
      : 0;
    
    return { totalVentas, totalUnidades, promedioVenta, crecimiento };
  }, [estadisticas]);

  // Formatear moneda
  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-semibold text-slate-900 dark:text-white">
              {entry.name}: {entry.name === 'Ventas' ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full mx-auto mb-4" />
          <span className="text-slate-600 dark:text-slate-400">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Producto no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/admin/productos')}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="admin-h1 text-slate-900 dark:text-white">
                Estadísticas del Producto
              </h1>
              <p className="admin-body text-slate-500 dark:text-slate-400 mt-1">
                {producto.nombreProducto}
              </p>
            </div>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-small text-slate-500 dark:text-slate-400">Ventas Totales</p>
                <p className="admin-h3 text-slate-900 dark:text-white">
                  {formatCurrency(metricas.totalVentas)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600/20" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-small text-slate-500 dark:text-slate-400">Unidades Vendidas</p>
                <p className="admin-h3 text-slate-900 dark:text-white">
                  {metricas.totalUnidades.toLocaleString()}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600/20" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-small text-slate-500 dark:text-slate-400">Promedio Mensual</p>
                <p className="admin-h3 text-slate-900 dark:text-white">
                  {formatCurrency(metricas.promedioVenta)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600/20" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-small text-slate-500 dark:text-slate-400">Crecimiento</p>
                <p className={`admin-h3 ${metricas.crecimiento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metricas.crecimiento >= 0 ? '+' : ''}{metricas.crecimiento.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600/20" />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Ventas Mensuales */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="admin-h3 text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Ventas Mensuales
            </h3>
            <SafeChartContainer 
              className="w-full relative bg-slate-50 dark:bg-slate-900/30 rounded-lg"
              style={{ 
                width: '100%', 
                height: '350px'
              }}
              minHeight={300}
            >
              <AreaChart data={estadisticas.ventasMensuales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'} vertical={false} />
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(val) => formatCurrency(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                  animationDuration={1000}
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, fill: '#3b82f6', stroke: isDark ? '#1e293b' : '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </SafeChartContainer>
          </div>

          {/* Gráfico de Variantes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="admin-h3 text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Rendimiento por Variante
            </h3>
            <SafeChartContainer 
              className="w-full relative bg-slate-50 dark:bg-slate-900/30 rounded-lg"
              style={{ 
                width: '100%', 
                height: '350px'
              }}
              minHeight={300}
            >
              <BarChart data={estadisticas.variantesRendimiento} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'} vertical={false} />
                <XAxis
                  dataKey="nombre"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 500 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(val) => formatCurrency(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="ventas"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                  animationDuration={800}
                />
              </BarChart>
            </SafeChartContainer>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="admin-h3 text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Información del Producto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="admin-small text-slate-500 dark:text-slate-400 mb-1">Código de Referencia</p>
              <p className="admin-body text-slate-900 dark:text-white">{producto.codigoReferencia || 'N/A'}</p>
            </div>
            <div>
              <p className="admin-small text-slate-500 dark:text-slate-400 mb-1">Total de Variantes</p>
              <p className="admin-body text-slate-900 dark:text-white">{variantes.length}</p>
            </div>
            <div>
              <p className="admin-small text-slate-500 dark:text-slate-400 mb-1">Estado</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                producto.estado === 'activo' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300'
              }`}>
                {producto.estado === 'activo' ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Activo</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Inactivo</>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoEstadisticasPage;
