import React, { useState, useEffect } from 'react';
import {
  FiPlus, FiPackage, FiTrendingUp, FiDollarSign, FiCalendar,
  FiEye, FiEdit3, FiArrowRight, FiFilter, FiSearch, FiHash
} from 'react-icons/fi';
import ModalCompra from '../../../components/admin/compras/ModalCompra';
import ModalDetalleCompra from '../../../components/admin/compras/ModalDetalleCompra';
import ModalCambiarEstadoCompra from '../../../components/admin/compras/ModalCambiarEstadoCompra';
import comprasApi from '../../../api/comprasApi';
import { useNavigate } from 'react-router-dom';

const formatearPrecioColombia = (valor) => {
  const numero = Math.round(Number(valor) || 0);
  return numero.toLocaleString('es-CO');
};

const ComprasPage = () => {
  const navigate = useNavigate();
  const [modalCompraOpen, setModalCompraOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalEstadoOpen, setModalEstadoOpen] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const [filtros, setFiltros] = useState({
    idProveedor: '',
    estado: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const [estadisticas, setEstadisticas] = useState({
    totalCompras: 0,
    totalMes: 0,
    ordenesActivas: 0
  });

  useEffect(() => {
    cargarCompras();
  }, []);

  const cargarComprasConFiltros = async () => {
    setCargando(true);
    try {
      const params = { limite: 10 };
      
      if (filtros.idProveedor) params.idProveedor = filtros.idProveedor;
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
      if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
      
      const data = await comprasApi.obtenerCompras(params);
      const listaCompras = Array.isArray(data) ? data : data.datos || [];
      setCompras(listaCompras);

      const total = listaCompras.reduce((acc, c) => acc + Number(c.total || 0), 0);
      setEstadisticas({
        totalCompras: (data.paginacion?.totalItems || listaCompras.length),
        totalMes: total,
        ordenesActivas: listaCompras.filter(c => c.estadoPedido?.nombreEstado?.toUpperCase().includes('PENDIENTE')).length
      });
    } catch (error) {
      console.error('Error cargando compras con filtros:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarCompras = async () => {
    setCargando(true);
    try {
      const data = await comprasApi.obtenerCompras({ limite: 10 });
      const listaCompras = Array.isArray(data) ? data : data.datos || [];
      setCompras(listaCompras);

      const total = listaCompras.reduce((acc, c) => acc + Number(c.total || 0), 0);
      setEstadisticas({
        totalCompras: (data.paginacion?.totalItems || listaCompras.length),
        totalMes: total,
        ordenesActivas: listaCompras.filter(c => c.estadoPedido?.nombreEstado?.toUpperCase().includes('PENDIENTE')).length
      });
    } catch (error) {
      console.error('Error cargando compras:', error);
    } finally {
      setCargando(false);
    }
  };

  const abrirDetalle = (compra) => {
    setCompraSeleccionada(compra);
    setModalDetalleOpen(true);
  };

  const abrirCambioEstado = (compra) => {
    setCompraSeleccionada(compra);
    setModalEstadoOpen(true);
  };

  const handleCompraCreada = () => {
    cargarCompras();
  };

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Gestión de Compras
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-normal text-lg">
            Control de órdenes, proveedores y recepción de mercancía.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/compras/detalle')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-medium rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b-2 active:translate-y-0.5"
          >
            <FiPackage className="text-indigo-500" />
            <span>Análisis de Ítems</span>
          </button>
          <button
            onClick={() => setModalCompraOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <FiPlus />
            <span>Nueva Compra</span>
          </button>
        </div>
      </div>

      {/* Dashboard de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <KPICard
          title="Órdenes Totales"
          value={estadisticas.totalCompras}
          icon={<FiPackage />}
          color="indigo"
          description="Total registros históricos"
        />
        <KPICard
          title="Inversión Mensual"
          value={`$${formatearPrecioColombia(estadisticas.totalMes)}`}
          icon={<FiDollarSign />}
          color="emerald"
          description="Periodo actual acumulado"
        />
        <KPICard
          title="Pendientes por Recibir"
          value={estadisticas.ordenesActivas}
          icon={<FiTrendingUp />}
          color="amber"
          description="Requieren atención inmediata"
        />
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Historial de Abastecimiento
            </h2>
            <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full text-indigo-600 dark:text-indigo-400">
              {compras.length} registros
            </span>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por número o proveedor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <button 
              onClick={() => setFiltrosVisibles(!filtrosVisibles)}
              className={`p-2.5 rounded-xl transition-all border ${
                filtrosVisibles 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <FiFilter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Panel de Filtros */}
        {filtrosVisibles && (
          <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Socio Proveedor</label>
                <select
                  value={filtros.idProveedor}
                  onChange={(e) => setFiltros({...filtros, idProveedor: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                >
                  <option value="">Todos los socios</option>
                  {/* Poblado dinámicamente */}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado de Pedido</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                >
                  <option value="">Todos los estados</option>
                  <option value="8">✅ Recibida</option>
                  <option value="9">⏳ Pendiente</option>
                  <option value="10">📦 Parcial</option>
                  <option value="7">❌ Cancelada</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha Inicio</label>
                <input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha Fin</label>
                <input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => {
                  setFiltros({idProveedor: '', estado: '', fechaInicio: '', fechaFin: ''});
                  setBusqueda('');
                }}
                className="px-5 py-2 text-sm text-slate-500 font-medium hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Resetear Filtros
              </button>
              <button
                onClick={() => cargarComprasConFiltros()}
                className="px-6 py-2 bg-slate-900 dark:bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-md"
              >
                Aplicar Búsqueda
              </button>
            </div>
          </div>
        )}

        {/* Tabla Estilizada */}
        <div className="overflow-x-auto">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-10 h-10 border-[3px] border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-400">Sincronizando inventario...</p>
            </div>
          ) : compras.length === 0 ? (
            <EmptyState onClick={() => setModalCompraOpen(true)} />
          ) : (
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                <tr>
                  <th className="px-8 py-5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Orden / ID</th>
                  <th className="px-8 py-5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-8 py-5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-8 py-5 text-right text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-8 py-5 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-8 py-5 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {compras.map((compra) => (
                  <tr key={compra.idCompra} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <FiHash className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {compra.numeroCompra || `#${compra.idCompra}`}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Interno: {compra.idCompra}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {compra.proveedor?.nombreProveedor || 'Desconocido'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Autorizado por {compra.usuarioRegistro?.usuario || 'Sistema'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <FiCalendar className="text-slate-300 dark:text-slate-600" />
                        <span>{new Date(compra.fechaCompra).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        $ {formatearPrecioColombia(compra.total)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div
                        className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border"
                        style={{
                          backgroundColor: `${compra.estadoPedido?.color}08`,
                          color: compra.estadoPedido?.color,
                          borderColor: `${compra.estadoPedido?.color}20`
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: compra.estadoPedido?.color }} />
                        {compra.estadoPedido?.nombreEstado || 'En Proceso'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirDetalle(compra)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                          title="Ver Detalle"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => abrirCambioEstado(compra)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                          title="Cambiar Estado"
                        >
                          <FiEdit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modales */}
      <ModalCompra
        isOpen={modalCompraOpen}
        onClose={() => setModalCompraOpen(false)}
        onCompraCreada={handleCompraCreada}
      />

      <ModalDetalleCompra
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        compra={compraSeleccionada}
      />

      <ModalCambiarEstadoCompra
        isOpen={modalEstadoOpen}
        onClose={() => setModalEstadoOpen(false)}
        compra={compraSeleccionada}
        onEstadoActualizado={cargarCompras}
      />
    </div>
  );
};

/* Componentes de apoyo internos */

const KPICard = ({ title, value, icon, color, description }) => {
  const themes = {
    indigo: "bg-indigo-600 text-white ring-indigo-500/20 shadow-indigo-500/10",
    emerald: "bg-emerald-600 text-white ring-emerald-500/20 shadow-emerald-500/10",
    amber: "bg-amber-500 text-white ring-amber-500/20 shadow-amber-500/10"
  };

  const bgIcons = {
    indigo: "bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400",
    emerald: "bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400"
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">{title}</span>
            <p className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{value}</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{description}</p>
        </div>
        <div className={`h-14 w-14 ${bgIcons[color]} rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onClick }) => (
  <div className="text-center py-24 px-8 bg-slate-50/30 dark:bg-transparent">
    <div className="relative inline-block mb-8">
      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-5" />
      <FiPackage className="h-16 w-16 text-slate-200 dark:text-slate-800 mx-auto relative z-10" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No se encontraron registros</h3>
    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-sm">Empieza a gestionar tu abastecimiento creando una nueva orden de compra estratégica con tus proveedores.</p>
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg active:scale-95"
    >
      <span>Nueva Compra</span>
      <FiArrowRight />
    </button>
  </div>
);

export default ComprasPage;
