import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSearch,
  FiCheckCircle, FiXCircle, FiChevronUp, FiChevronDown,
  FiPackage, FiShoppingCart, FiX, FiSave, FiAlertTriangle,
  FiInfo, FiGrid, FiList, FiRefreshCw
} from 'react-icons/fi';
import { estadosPedidoApi } from '../../../api/estadosPedidoApi';
import Swal from 'sweetalert2';

// ─── Colores predeterminados para los estados ─────────────────────────────────
const COLORES_PRESET = [
  { hex: '#6366f1', nombre: 'Índigo' },
  { hex: '#3b82f6', nombre: 'Azul' },
  { hex: '#06b6d4', nombre: 'Cyan' },
  { hex: '#10b981', nombre: 'Esmeralda' },
  { hex: '#22c55e', nombre: 'Verde' },
  { hex: '#eab308', nombre: 'Amarillo' },
  { hex: '#f97316', nombre: 'Naranja' },
  { hex: '#ef4444', nombre: 'Rojo' },
  { hex: '#ec4899', nombre: 'Rosa' },
  { hex: '#8b5cf6', nombre: 'Violeta' },
  { hex: '#64748b', nombre: 'Gris' },
  { hex: '#0f172a', nombre: 'Oscuro' },
];

// ─── Componente principal ──────────────────────────────────────────────────────
const EstadosPedidoPage = () => {
  const navigate = useNavigate();

  // Estado principal
  const [estados, setEstados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    nombreEstado: '',
    descripcion: '',
    color: '#6366f1',
    orden: 0,
    activo: true
  });

  // ─── Cargar datos ────────────────────────────────────────────────────────────
  const cargarEstados = useCallback(async () => {
    setCargando(true);
    try {
      const res = await estadosPedidoApi.getEstadosPedido();
      setEstados(res.datos || []);
    } catch (error) {
      console.error('Error cargando estados:', error);
      Swal.fire('Error', 'No se pudieron cargar los estados de pedido', 'error');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEstados();
  }, [cargarEstados]);

  // ─── Filtro ──────────────────────────────────────────────────────────────────
  const estadosFiltrados = estados.filter(e => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      e.nombreEstado.toLowerCase().includes(q) ||
      (e.descripcion || '').toLowerCase().includes(q)
    );
  });

  // ─── Abrir modal ─────────────────────────────────────────────────────────────
  const abrirCrear = () => {
    setEditando(null);
    setForm({
      nombreEstado: '',
      descripcion: '',
      color: '#6366f1',
      orden: estados.length > 0 ? Math.max(...estados.map(e => e.orden)) + 1 : 1,
      activo: true
    });
    setModalAbierto(true);
  };

  const abrirEditar = (estado) => {
    setEditando(estado);
    setForm({
      nombreEstado: estado.nombreEstado,
      descripcion: estado.descripcion || '',
      color: estado.color || '#6366f1',
      orden: estado.orden,
      activo: estado.activo
    });
    setModalAbierto(true);
  };

  // ─── Guardar (crear/editar) ──────────────────────────────────────────────────
  const guardar = async () => {
    if (!form.nombreEstado.trim()) {
      Swal.fire('Campo requerido', 'El nombre del estado es obligatorio', 'warning');
      return;
    }

    setGuardando(true);
    try {
      if (editando) {
        await estadosPedidoApi.actualizarEstadoPedido(editando.idEstadoPedido, form);
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: `Estado "${form.nombreEstado}" actualizado correctamente`,
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        await estadosPedidoApi.crearEstadoPedido(form);
        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: `Estado "${form.nombreEstado}" creado correctamente`,
          timer: 1800,
          showConfirmButton: false
        });
      }
      setModalAbierto(false);
      cargarEstados();
    } catch (error) {
      console.error('Error guardando:', error);
      Swal.fire('Error', error.mensaje || 'No se pudo guardar el estado', 'error');
    } finally {
      setGuardando(false);
    }
  };

  // ─── Eliminar (soft-delete) ──────────────────────────────────────────────────
  const confirmarEliminar = async (estado) => {
    const totalRelaciones = (estado._count?.ventas || 0) + (estado._count?.compras || 0);

    const result = await Swal.fire({
      title: `¿Desactivar "${estado.nombreEstado}"?`,
      html: totalRelaciones > 0
        ? `<p class="text-sm text-gray-500">Este estado tiene <strong>${estado._count.ventas} venta(s)</strong> y <strong>${estado._count.compras} compra(s)</strong> asociadas.</p>
           <p class="text-sm text-amber-600 mt-2">Se desactivará pero las referencias existentes se conservarán.</p>`
        : '<p class="text-sm text-gray-500">El estado será desactivado. Podrás reactivarlo posteriormente.</p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await estadosPedidoApi.eliminarEstadoPedido(estado.idEstadoPedido);
        Swal.fire({
          icon: 'success',
          title: 'Desactivado',
          text: `"${estado.nombreEstado}" ha sido desactivado`,
          timer: 1800,
          showConfirmButton: false
        });
        cargarEstados();
      } catch (error) {
        console.error('Error eliminando:', error);
        Swal.fire('Error', error.mensaje || 'No se pudo desactivar el estado', 'error');
      }
    }
  };

  // ─── Reactivar ───────────────────────────────────────────────────────────────
  const reactivar = async (estado) => {
    try {
      await estadosPedidoApi.actualizarEstadoPedido(estado.idEstadoPedido, { activo: true });
      Swal.fire({
        icon: 'success',
        title: 'Reactivado',
        text: `"${estado.nombreEstado}" ha sido reactivado`,
        timer: 1800,
        showConfirmButton: false
      });
      cargarEstados();
    } catch (error) {
      Swal.fire('Error', 'No se pudo reactivar el estado', 'error');
    }
  };

  // ─── Cambiar orden ───────────────────────────────────────────────────────────
  const cambiarOrden = async (estado, direccion) => {
    const ordenActual = estado.orden;
    const nuevoOrden = direccion === 'up' ? ordenActual - 1 : ordenActual + 1;

    // Buscar el estado vecino
    const vecino = estados.find(e => e.orden === nuevoOrden);

    try {
      // Intercambiar órdenes
      await estadosPedidoApi.actualizarEstadoPedido(estado.idEstadoPedido, { orden: nuevoOrden });
      if (vecino) {
        await estadosPedidoApi.actualizarEstadoPedido(vecino.idEstadoPedido, { orden: ordenActual });
      }
      cargarEstados();
    } catch (error) {
      console.error('Error cambiando orden:', error);
    }
  };

  // ─── Stats rápidos ───────────────────────────────────────────────────────────
  const totalActivos = estados.filter(e => e.activo).length;
  const totalInactivos = estados.filter(e => !e.activo).length;
  const totalVentasVinculadas = estados.reduce((sum, e) => sum + (e._count?.ventas || 0), 0);
  const totalComprasVinculadas = estados.reduce((sum, e) => sum + (e._count?.compras || 0), 0);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ── Header ──────────────────────────── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/ventas')}
              className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:scale-105 transition-all text-slate-500 hover:text-indigo-600"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Estados de Pedido
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Configura los estados del flujo de ventas y compras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72 group">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors h-4 w-4" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar estado..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={cargarEstados}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-indigo-600 transition-all"
              title="Recargar"
            >
              <FiRefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={abrirCrear}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm"
            >
              <FiPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Estado</span>
            </button>
          </div>
        </div>

        {/* ── KPI Cards ───────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={<FiGrid />} label="Total Estados" value={estados.length} color="indigo" />
          <KPICard icon={<FiCheckCircle />} label="Activos" value={totalActivos} color="emerald" />
          <KPICard icon={<FiShoppingCart />} label="Ventas Vinculadas" value={totalVentasVinculadas} color="blue" />
          <KPICard icon={<FiPackage />} label="Compras Vinculadas" value={totalComprasVinculadas} color="purple" />
        </div>

        {/* ── Tabla ───────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Flujo de Estados</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Ordenados por flujo de proceso</p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
              {estadosFiltrados.length} de {estados.length}
            </span>
          </div>

          {cargando ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Cargando estados…</p>
            </div>
          ) : estadosFiltrados.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                <FiList className="h-7 w-7 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500">
                {busqueda ? 'No se encontraron resultados' : 'No hay estados de pedido registrados'}
              </p>
              {!busqueda && (
                <button
                  onClick={abrirCrear}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <FiPlus className="h-4 w-4" /> Crear primer estado
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">Orden</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Descripción</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Estatus</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Ventas</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Compras</th>
                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                  {estadosFiltrados.map((estado, idx) => (
                    <tr
                      key={estado.idEstadoPedido}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group ${!estado.activo ? 'opacity-50' : ''}`}
                    >
                      {/* Orden */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 w-6 text-center">{estado.orden}</span>
                          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => cambiarOrden(estado, 'up')}
                              disabled={idx === 0}
                              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400 hover:text-slate-600"
                            >
                              <FiChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => cambiarOrden(estado, 'down')}
                              disabled={idx === estadosFiltrados.length - 1}
                              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400 hover:text-slate-600"
                            >
                              <FiChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Nombre + Color */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
                            style={{ backgroundColor: estado.color || '#64748b' }}
                          >
                            {estado.nombreEstado?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-800 dark:text-white">
                            {estado.nombreEstado}
                          </span>
                        </div>
                      </td>

                      {/* Descripción */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs truncate">
                          {estado.descripcion || '—'}
                        </p>
                      </td>

                      {/* Estatus activo/inactivo */}
                      <td className="py-3.5 px-4 text-center">
                        {estado.activo ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40">
                            <FiCheckCircle className="h-3 w-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-500 border border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/40">
                            <FiXCircle className="h-3 w-3" /> Inactivo
                          </span>
                        )}
                      </td>

                      {/* Conteo Ventas */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {estado._count?.ventas || 0}
                        </span>
                      </td>

                      {/* Conteo Compras */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {estado._count?.compras || 0}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => abrirEditar(estado)}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                            title="Editar"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          {estado.activo ? (
                            <button
                              onClick={() => confirmarEliminar(estado)}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                              title="Desactivar"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => reactivar(estado)}
                              className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                              title="Reactivar"
                            >
                              <FiRefreshCw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Preview Timeline ─────────────────── */}
        {estadosFiltrados.filter(e => e.activo).length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiInfo className="text-indigo-500" /> Vista Previa del Flujo
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {estadosFiltrados
                .filter(e => e.activo)
                .sort((a, b) => a.orden - b.orden)
                .map((estado, idx, arr) => (
                  <React.Fragment key={estado.idEstadoPedido}>
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm"
                      style={{ backgroundColor: estado.color || '#64748b' }}
                    >
                      <span className="opacity-70">{estado.orden}.</span>
                      {estado.nombreEstado}
                    </div>
                    {idx < arr.length - 1 && (
                      <span className="text-slate-300 dark:text-slate-600 text-lg">→</span>
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Crear/Editar ─────────────────── */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !guardando && setModalAbierto(false)}
          />

          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editando ? 'Editar Estado' : 'Nuevo Estado'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {editando ? `Editando: ${editando.nombreEstado}` : 'Configura un nuevo estado para el flujo'}
                </p>
              </div>
              <button
                onClick={() => !guardando && setModalAbierto(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre del Estado *
                </label>
                <input
                  type="text"
                  value={form.nombreEstado}
                  onChange={(e) => setForm({ ...form, nombreEstado: e.target.value })}
                  placeholder="Ej: Pendiente, En Proceso, Entregado..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Describe cuándo se usa este estado..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Color + Orden */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Color UI
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    {COLORES_PRESET.map(c => (
                      <button
                        key={c.hex}
                        onClick={() => setForm({ ...form, color: c.hex })}
                        className={`h-6 w-6 rounded-lg transition-all ${
                          form.color === c.hex
                            ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-indigo-500 scale-110'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.nombre}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Orden en flujo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.orden}
                    onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700 dark:text-slate-200"
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Define la posición en el flujo de proceso
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Vista Previa
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0"
                    style={{ backgroundColor: form.color || '#64748b' }}
                  >
                    {form.nombreEstado?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      {form.nombreEstado || 'Nombre del estado'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Orden: {form.orden} · {form.activo ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                  <div
                    className="ml-auto px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: form.color || '#64748b' }}
                  >
                    {form.nombreEstado || 'Estado'}
                  </div>
                </div>
              </div>

              {/* Activo (solo en edición) */}
              {editando && (
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Estado Activo</p>
                    <p className="text-[10px] text-slate-400 font-medium">Los estados inactivos no aparecen en los formularios</p>
                  </div>
                  <button
                    onClick={() => setForm({ ...form, activo: !form.activo })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form.activo ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        form.activo ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/30">
              <button
                onClick={() => !guardando && setModalAbierto(false)}
                disabled={guardando}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando || !form.nombreEstado.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {guardando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" />
                    {editando ? 'Actualizar' : 'Crear Estado'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Componente KPICard ──────────────────────────────────────────────────────
const KPICard = ({ icon, label, value, color }) => {
  const colorMap = {
    indigo: 'from-indigo-600 to-blue-700',
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-600 to-indigo-700',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-3.5 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className={`h-10 w-10 bg-gradient-to-br ${colorMap[color]} rounded-xl flex items-center justify-center text-white text-lg shadow-md flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default EstadosPedidoPage;
