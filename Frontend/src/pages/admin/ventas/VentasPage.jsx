import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiSearch, FiFilter, FiCalendar, FiDollarSign,
  FiPackage, FiTrendingUp, FiUsers, FiEye,
  FiEdit3, FiDownload, FiActivity, FiChevronLeft, FiChevronRight, FiX
} from 'react-icons/fi';
import { ventasApi } from '../../../api/ventasApi';
import { estadosPedidoApi } from '../../../api/estadosPedidoApi';
import ModalVenta from '../../../components/admin/ventas/ModalVenta';
import Swal from 'sweetalert2';

const VentasPage = () => {
  // ========================================
  // ESTADOS DEL COMPONENTE
  // ========================================
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalVentaOpen, setModalVentaOpen] = useState(false);
  const [estadosPedido, setEstadosPedido] = useState([]);
  const [modalEstadoOpen, setModalEstadoOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const [filtros, setFiltros] = useState({
    pagina: 1,
    limite: 10,
    busqueda: '',
    estadoPedido: ''
  });

  const [paginacion, setPaginacion] = useState({});
  const navigate = useNavigate();

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => { cargarVentas(); }, [filtros]);

  useEffect(() => {
    const cargarEstadosPedido = async () => {
      try {
        const res = await estadosPedidoApi.getEstadosPedido();
        setEstadosPedido(res.datos || []);
      } catch (error) {
        console.error('Error cargando estados de pedido:', error);
      }
    };
    cargarEstadosPedido();
  }, []);

  // ========================================
  // FUNCIONES DE DATOS
  // ========================================
  const cargarVentas = async () => {
    setCargando(true);
    try {
      const res = await ventasApi.getVentas(filtros);
      setVentas(res.datos || []);
      setPaginacion(res.paginacion || {});
    } catch (error) {
      console.error("Error cargando ventas", error);
      Swal.fire('Error', 'No se pudieron cargar las ventas', 'error');
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstadoPedido = async (idVenta, nuevoEstadoId) => {
    try {
      await ventasApi.actualizarEstado(idVenta, nuevoEstadoId);
      await cargarVentas();
      setModalEstadoOpen(false);
      setVentaSeleccionada(null);
      Swal.fire('Éxito', 'Estado del pedido actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Swal.fire('Error', 'No se pudo cambiar el estado del pedido', 'error');
    }
  };

  const abrirModalEstado = (venta) => {
    setVentaSeleccionada(venta);
    setModalEstadoOpen(true);
  };

  // ========================================
  // UTILIDADES DE FORMATO
  // ========================================
  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    });
  };

  const getStatusColor = (colorHex) => {
    if (!colorHex) return 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400';
    const hex = colorHex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? 'text-gray-800' : 'text-white';
  };

  // ========================================
  // KPIs
  // ========================================
  const totalVendido = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
  const ticketPromedio = ventas.length > 0 ? totalVendido / ventas.length : 0;
  const clientesUnicos = new Set(ventas.map(v => v.idUsuario)).size;

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <button onClick={() => navigate('/admin')} className="hover:text-indigo-500 transition-colors">Panel</button>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300">Ventas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <FiDollarSign className="h-5 w-5" />
            </div>
            Ventas & Facturación
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Gestión centralizada de transacciones y salidas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/ventas/detalles')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm shadow-sm"
          >
            <FiActivity className="h-4 w-4" />
            <span>Análisis</span>
          </button>

          <button
            onClick={() => setModalVentaOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm"
          >
            <FiPlus className="h-4 w-4" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <FiDollarSign />, label: 'Ingresos Brutos', value: formatearPrecio(totalVendido), accent: 'indigo', trend: '+12.5%' },
          { icon: <FiPackage />, label: 'Pedidos', value: paginacion.totalRegistros || ventas.length, accent: 'blue', trend: 'Hoy' },
          { icon: <FiTrendingUp />, label: 'Ticket Promedio', value: formatearPrecio(ticketPromedio), accent: 'emerald', trend: 'Estable' },
          { icon: <FiUsers />, label: 'Clientes Únicos', value: clientesUnicos, accent: 'rose', trend: 'Nuevos' }
        ].map((kpi, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-xl bg-${kpi.accent}-50 dark:bg-${kpi.accent}-950/30 text-${kpi.accent}-600 dark:text-${kpi.accent}-400 flex items-center justify-center text-lg`}>
                {kpi.icon}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${kpi.trend.includes('+') ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 bg-slate-50 dark:bg-slate-800'}`}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">
              {kpi.label}
            </p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {kpi.value}
            </h3>
          </div>
        ))}
      </div>

      {/* ── TABLA DE VENTAS ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">

        {/* Barra de filtros */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por factura o cliente..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value, pagina: 1 })}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm">
              <FiFilter className="h-4 w-4 text-slate-400" />
              <span>Filtros</span>
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm">
              <FiCalendar className="h-4 w-4 text-slate-400" />
              <span>Fecha</span>
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nº Factura</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Monto</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Estado</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Pago</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {cargando ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                      <span className="text-sm text-slate-400 font-medium">Cargando transacciones…</span>
                    </div>
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <FiDollarSign className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm font-medium text-slate-400">No hay ventas registradas</p>
                    <p className="text-xs text-slate-300 mt-1">Crea una nueva venta para comenzar</p>
                  </td>
                </tr>
              ) : (
                ventas.map((venta) => (
                  <tr
                    key={venta.idVenta}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors duration-200 group"
                  >
                    {/* Nº Factura */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1.5 rounded-lg">
                        {venta.numeroFactura}
                      </span>
                    </td>

                    {/* Cliente */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                          {venta.usuarioCliente?.nombres} {venta.usuarioCliente?.apellidos}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5">
                          {venta.usuarioCliente?.usuario || 'Consumidor Final'}
                        </span>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-500 font-medium">
                        {new Date(venta.creadoEn).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Monto */}
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatearPrecio(venta.total)}
                      </span>
                    </td>

                    {/* Estado Operativo */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => abrirModalEstado(venta)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold transition-all hover:opacity-90 hover:shadow-md ${getStatusColor(venta.estadoPedido?.color)}`}
                        style={{ backgroundColor: venta.estadoPedido?.color || '#64748b' }}
                        title="Cambiar estado"
                      >
                        {venta.estadoPedido?.nombreEstado || 'Pendiente'}
                      </button>
                    </td>

                    {/* Pago */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${
                          venta.estadoPago === 'pagada' ? 'bg-emerald-500' :
                          venta.estadoPago === 'parcial' ? 'bg-amber-500' : 'bg-slate-300'
                        }`} />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                          {venta.estadoPago}
                        </span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/admin/ventas/detalles/${venta.idVenta}`)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                          title="Ver detalle"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>

                        <button
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all"
                          title="Descargar"
                        >
                          <FiDownload className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => abrirModalEstado(venta)}
                          className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm"
                          title="Cambiar estado"
                        >
                          <FiEdit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-medium">
            Mostrando <span className="font-semibold text-slate-600 dark:text-slate-300">{ventas.length}</span> de <span className="font-semibold text-slate-600 dark:text-slate-300">{paginacion.totalRegistros || 0}</span> ventas
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={paginacion.paginaActual === 1}
              onClick={() => setFiltros({ ...filtros, pagina: filtros.pagina - 1 })}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>

            {paginacion.totalPaginas > 0 && (
              <span className="text-xs font-medium text-slate-400 px-2">
                {paginacion.paginaActual} / {paginacion.totalPaginas}
              </span>
            )}

            <button
              disabled={paginacion.paginaActual === paginacion.totalPaginas}
              onClick={() => setFiltros({ ...filtros, pagina: filtros.pagina + 1 })}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
              <FiChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL NUEVA VENTA ── */}
      <ModalVenta
        isOpen={modalVentaOpen}
        onClose={() => setModalVentaOpen(false)}
        onVentaCreada={cargarVentas}
      />

      {/* ── MODAL CAMBIO DE ESTADO ── */}
      {modalEstadoOpen && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">

            {/* Header del modal */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600">
                    <FiEdit3 className="h-4 w-4" />
                  </div>
                  Cambiar Estado del Pedido
                </h2>
                <button
                  onClick={() => { setModalEstadoOpen(false); setVentaSeleccionada(null); }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Info de la venta */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Comprobante</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-lg mt-0.5">
                    {ventaSeleccionada.numeroFactura}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Cliente</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg mt-0.5">
                    {ventaSeleccionada.usuarioCliente?.nombres} {ventaSeleccionada.usuarioCliente?.apellidos}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Estado Actual</span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-lg mt-0.5 ${getStatusColor(ventaSeleccionada.estadoPedido?.color)}`}
                    style={{ backgroundColor: ventaSeleccionada.estadoPedido?.color }}
                  >
                    {ventaSeleccionada.estadoPedido?.nombreEstado}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid de estados */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-220px)] custom-scrollbar">
              <p className="text-xs font-medium text-slate-400 mb-4">Selecciona el nuevo estado operativo:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {estadosPedido.map((estado) => {
                  const isActual = ventaSeleccionada.estadoPedido?.idEstadoPedido === estado.idEstadoPedido;
                  const colorHex = estado.color || '#6B7280';

                  return (
                    <button
                      key={estado.idEstadoPedido}
                      onClick={() => cambiarEstadoPedido(ventaSeleccionada.idVenta, estado.idEstadoPedido)}
                      disabled={isActual}
                      className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                        isActual
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 cursor-default ring-4 ring-indigo-500/10'
                          : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600/40 hover:shadow-lg hover:-translate-y-0.5'
                      }`}
                    >
                      {isActual && (
                        <div className="absolute -top-2.5 -right-2.5 bg-indigo-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-md border-2 border-white dark:border-slate-900">
                          Actual
                        </div>
                      )}

                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="h-10 w-10 rounded-xl shadow-md flex items-center justify-center font-bold text-white text-sm"
                          style={{ backgroundColor: colorHex }}
                        >
                          {estado.orden}
                        </div>
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-white line-clamp-1">
                          {estado.nombreEstado}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {estado.descripcion || 'Sin descripción disponible.'}
                      </p>

                      <div
                        className="h-1 rounded-full transition-all duration-300"
                        style={{ backgroundColor: colorHex, opacity: isActual ? 1 : 0.4 }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <p className="text-xs text-slate-400 font-medium">
                El cambio impactará el historial del cliente
              </p>
              <button
                onClick={() => { setModalEstadoOpen(false); setVentaSeleccionada(null); }}
                className="px-5 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasPage;