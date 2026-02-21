import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  obtenerTodosLosTiposMovimiento,
  crearTipoMovimiento,
  actualizarTipoMovimiento,
  desactivarTipoMovimiento
} from '../../../api/tiposMovimientoApi';
import { Button, Modal, Form, Input, Switch, message, Spin, Space } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Package, ArrowUpDown, DollarSign, CheckCircle2, XCircle, Search, RefreshCcw, Trash2, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TiposMovimientoPage = () => {
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [form] = Form.useForm();

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');

  // Cargar tipos de movimiento
  const cargarTiposMovimiento = useCallback(async () => {
    try {
      setLoading(true);
      const response = await obtenerTodosLosTiposMovimiento();
      const tiposData = response.datos?.datos || [];
      setTiposMovimiento(tiposData);
    } catch (error) {
      message.error('Error al cargar tipos de movimiento');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarTiposMovimiento();
  }, [cargarTiposMovimiento]);

  // Filtrado
  const filteredTipos = useMemo(() => {
    return tiposMovimiento.filter(t => {
      const fullText = `${t.nombreTipo} ${t.descripcion || ''}`.toLowerCase();
      const matchesSearch = fullText.includes(searchTerm.toLowerCase());
      const matchesTipo = filterTipo === 'all' || t.tipo === filterTipo;
      const matchesEstado = filterEstado === 'all' ||
        (filterEstado === 'activo' && t.activo) ||
        (filterEstado === 'inactivo' && !t.activo);
      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [tiposMovimiento, searchTerm, filterTipo, filterEstado]);

  // Abrir modal para crear/editar
  const abrirModal = (tipo = null) => {
    setEditingTipo(tipo);
    if (tipo) {
      form.setFieldsValue(tipo);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalVisible(false);
    setEditingTipo(null);
    form.resetFields();
  };

  // Guardar tipo de movimiento
  const guardarTipoMovimiento = async (values) => {
    try {
      if (editingTipo) {
        await actualizarTipoMovimiento(editingTipo.idTipoMovimiento, values);
        message.success('Tipo de movimiento actualizado exitosamente');
      } else {
        await crearTipoMovimiento(values);
        message.success('Tipo de movimiento creado exitosamente');
      }
      cerrarModal();
      cargarTiposMovimiento();
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al guardar tipo de movimiento');
    }
  };

  // Desactivar tipo de movimiento
  const handleDesactivar = async (idTipoMovimiento) => {
    try {
      await desactivarTipoMovimiento(idTipoMovimiento);
      message.success('Tipo de movimiento desactivado exitosamente');
      cargarTiposMovimiento();
    } catch (error) {
      message.error('Error al desactivar tipo de movimiento');
    }
  };

  // Cambiar estado activo/inactivo
  const cambiarEstado = async (checked, record) => {
    try {
      await actualizarTipoMovimiento(record.idTipoMovimiento, {
        ...record,
        activo: checked
      });
      message.success(`Tipo de movimiento ${checked ? 'activado' : 'desactivado'} exitosamente`);
      cargarTiposMovimiento();
    } catch (error) {
      message.error('Error al cambiar estado');
    }
  };

  // Stats Cards Components - MAS PEQUEÑAS Y LETRA MAS SUAVE
  const StatCard = ({ title, value, color, icon: Icon, subtext }) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      emerald: 'from-emerald-500 to-emerald-600',
      amber: 'from-amber-500 to-amber-600',
      purple: 'from-purple-500 to-purple-600'
    };

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
        <div className="flex justify-between items-start mb-2">
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${colorMap[color]} text-white shadow-md`}>
            <Icon size={14} strokeWidth={2} />
          </div>
        </div>
        <div className="space-y-0.5">
          <h3 className="text-xl font-normal text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
          <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {title}
          </p>
        </div>
        {subtext && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[8px] font-normal text-slate-400 dark:text-slate-500">
              {subtext}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Mobile Card Component - LETRA MAS PROFESIONAL
  const MobileTipoCard = ({ tipo, idx }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-base
            ${tipo.tipo === 'entrada' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
              tipo.tipo === 'salida' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
              'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
            {tipo.nombreTipo?.charAt(0)}
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white text-sm">{tipo.nombreTipo}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">ID: #{tipo.idTipoMovimiento}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
          ${tipo.activo
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
        }`}>
          {tipo.activo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {tipo.activo ? 'Activo' : 'Inactivo'}
        </div>
      </div>

      {/* Tipo Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
          ${tipo.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
            tipo.tipo === 'salida' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
          <ArrowUpDown size={10} />
          {tipo.tipo === 'entrada' ? 'Entrada' : tipo.tipo === 'salida' ? 'Salida' : 'Ajuste'}
        </span>
      </div>

      {/* Description */}
      {tipo.descripcion && (
        <div className="mb-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{tipo.descripcion}</p>
        </div>
      )}

      {/* Afecta Costo */}
      <div className="mb-3">
        <div className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs
          ${tipo.afectaCosto
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-slate-50 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'
          }`}>
          <DollarSign size={12} />
          {tipo.afectaCosto ? 'Afecta costo' : 'No afecta costo'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => abrirModal(tipo)}
          className="flex-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5"
        >
          <Pencil size={14} />
          Editar
        </button>
        {tipo.activo && (
          <button
            onClick={() => handleDesactivar(tipo.idTipoMovimiento)}
            className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} />
            Desactivar
          </button>
        )}
      </div>
    </motion.div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Cargando tipos de movimiento...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalTipos = tiposMovimiento.length;
  const entradas = tiposMovimiento.filter(t => t.tipo === 'entrada').length;
  const salidas = tiposMovimiento.filter(t => t.tipo === 'salida').length;
  const ajustes = tiposMovimiento.filter(t => t.tipo === 'ajuste').length;
  const activos = tiposMovimiento.filter(t => t.activo).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 sm:p-6 lg:p-10 space-y-10 transition-colors duration-300">

      {/* Professional Dashboard Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">
            <Package size={14} strokeWidth={3} />
            Administración de Inventario
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Tipos de Movimiento
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-medium max-w-xl">
            Configura los diferentes tipos de movimientos de inventario del sistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarTiposMovimiento}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
            title="Sincronizar datos"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => abrirModal()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
          >
            <PlusOutlined size={18} />
            <span className="hidden sm:inline">Nuevo Tipo</span>
            <span className="sm:hidden">Añadir</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Total Tipos"
          value={totalTipos}
          color="blue"
          icon={Package}
          subtext="Movimientos configurados"
        />
        <StatCard
          title="Entradas"
          value={entradas}
          color="emerald"
          icon={ArrowUpDown}
          subtext="Tipos de entrada"
        />
        <StatCard
          title="Salidas"
          value={salidas}
          color="purple"
          icon={ArrowUpDown}
          subtext="Tipos de salida"
        />
        <StatCard
          title="Tipos Activos"
          value={activos}
          color="amber"
          icon={CheckCircle2}
          subtext="Disponibles para uso"
        />
      </div>

      {/* Filters & Workspace */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-18" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
              <select
                className="bg-transparent border-none text-[13px] font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer px-4 py-2"
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
              >
                <option value="all">Todos los Tipos</option>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
              <select
                className="bg-transparent border-none text-[13px] font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer px-4 py-2"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="all">Estado: Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content - Responsive */}
        <div className="p-4 sm:p-6">
          {filteredTipos.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                <Package size={32} className="sm:size-40" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-center text-sm sm:text-base">No se encontraron tipos de movimiento con esos filtros.</p>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="space-y-4 lg:hidden">
                <AnimatePresence>
                  {filteredTipos.map((tipo, idx) => (
                    <MobileTipoCard key={tipo.idTipoMovimiento} tipo={tipo} idx={idx} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-slate-800/30 text-left">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Nombre</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Tipo</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Descripción</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Afecta Costo</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Estado</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-right border-b border-slate-100 dark:border-slate-700/50">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                    <AnimatePresence>
                      {filteredTipos.map((tipo, idx) => (
                        <motion.tr
                          key={tipo.idTipoMovimiento}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm
                                ${tipo.tipo === 'entrada' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                                  tipo.tipo === 'salida' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                                  'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                                {tipo.nombreTipo?.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {tipo.nombreTipo}
                                </div>
                                <div className="text-xs font-mono text-gray-400 dark:text-gray-500">#{tipo.idTipoMovimiento}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
                              ${tipo.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                tipo.tipo === 'salida' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                              <ArrowUpDown size={10} />
                              {tipo.tipo === 'entrada' ? 'Entrada' : tipo.tipo === 'salida' ? 'Salida' : 'Ajuste'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                              {tipo.descripcion || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                ${tipo.afectaCosto
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                              }`}>
                                <DollarSign size={10} className="mr-1" />
                                {tipo.afectaCosto ? 'Sí' : 'No'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <button
                              onClick={() => cambiarEstado(!tipo.activo, tipo)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium uppercase transition-all cursor-pointer
                              ${tipo.activo
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}
                            >
                              {tipo.activo ? 'Activo' : 'Inactivo'}
                            </button>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => abrirModal(tipo)}
                                className="card-3d p-2.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil size={16} />
                              </motion.button>

                              {tipo.activo && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDesactivar(tipo.idTipoMovimiento)}
                                  className="card-3d p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Desactivar"
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 sm:p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium text-center">
            Mostrando <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredTipos.length}</span> de <span className="font-bold">{tiposMovimiento.length}</span> registros totales
          </p>
        </div>
      </div>

      {/* Modal para crear/editar - Mantenemos Ant Design */}
      <Modal
        title={editingTipo ? 'Editar Tipo de Movimiento' : 'Crear Tipo de Movimiento'}
        open={modalVisible}
        onCancel={cerrarModal}
        footer={null}
        width={600}
        className="dark:[&_.ant-modal-content]:bg-slate-800 dark:[&_.ant-modal-header]:border-slate-700 dark:[&_.ant-modal-header]:bg-slate-800 dark:[&_.ant-modal-title]:text-white"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={guardarTipoMovimiento}
        >
          <Form.Item
            name="nombreTipo"
            label={<span className="text-gray-900 dark:text-white">Nombre del Tipo</span>}
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input
              placeholder="Ej: Compra, Venta, Ajuste Manual"
              className="border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-500"
            />
          </Form.Item>

          <Form.Item
            name="tipo"
            label={<span className="text-gray-900 dark:text-white">Tipo de Movimiento</span>}
            rules={[{ required: true, message: 'El tipo es obligatorio' }]}
          >
            <select
              placeholder="Selecciona el tipo"
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white text-sm font-semibold transition-all"
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </Form.Item>

          <Form.Item
            name="afectaCosto"
            label={<span className="text-gray-900 dark:text-white">¿Afecta el costo?</span>}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label={<span className="text-gray-900 dark:text-white">Descripción (opcional)</span>}
          >
            <Input.TextArea
              placeholder="Describe el propósito de este tipo de movimiento"
              rows={3}
              className="border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-500"
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={cerrarModal} className="dark:text-gray-300 dark:border-slate-600 dark:bg-slate-700 hover:dark:bg-slate-600">
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="dark:bg-blue-600 dark:border-blue-600"
              >
                {editingTipo ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TiposMovimientoPage;
