import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag, Search, Edit, Trash2, Plus, RefreshCcw, Filter, X,
  DollarSign, Calendar, Percent, Gift, Users, Package,
  Clock, CheckCircle, XCircle, AlertCircle, TrendingUp,
  BarChart3, Eye, EyeOff, Loader2, ChevronDown, ToggleLeft,
  ToggleRight, MoreVertical, ShoppingBag, ChevronRight,
  ChevronLeft, Info, Settings, Target, ShieldCheck
} from 'lucide-react';
import { descuentosApi } from '../../../api/descuentosApi';
import { categoriasApi } from '../../../api/categoriasApi';
import { productosApi } from '../../../api/productosApi';
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

/**
 * DescuentosPage: Rediseño profesional con tipografía Inter balanceada.
 * Se eliminaron pesos excesivos (black) y se suavizaron las animaciones.
 */
export default function DescuentosPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Estados principales
  const [descuentos, setDescuentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de paginación y filtros
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0, totalPages: 0
  });
  const [filters, setFilters] = useState({
    estado: '', tipoDescuento: '', aplicaA: '', buscar: ''
  });

  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDescuento, setSelectedDescuento] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    nombreDescuento: '',
    descripcion: '',
    tipoDescuento: 'porcentaje',
    valorDescuento: '',
    aplicaA: 'total_venta',
    idCategoria: '',
    idProducto: '',
    montoMinimoCompra: 0,
    cantidadMaximaUsos: '',
    usoPorCliente: 1,
    fechaInicio: '',
    fechaFin: '',
    requiereCodigo: false,
    codigoDescuento: ''
  });

  // Estados para datos auxiliares
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [descuentosRes, categoriasRes, productosRes, estadisticasRes] = await Promise.all([
        descuentosApi.obtenerDescuentos({
          page: pagination.page,
          limit: pagination.limit,
          ...filters
        }),
        categoriasApi.obtenerTodasLasCategorias(),
        productosApi.obtenerProductos({ estado: 'activo', limit: 300 }),
        descuentosApi.obtenerEstadisticasDescuentos()
      ]);

      setDescuentos(descuentosRes.descuentos || []);
      setPagination(prev => ({
        ...prev,
        total: descuentosRes.total || 0,
        totalPages: descuentosRes.totalPages || 0
      }));
      setCategorias(categoriasRes.categorias || []);
      setProductos(productosRes.productos || []);
      setEstadisticas(estadisticasRes.estadisticas || {});
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ estado: '', tipoDescuento: '', aplicaA: '', buscar: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      nombreDescuento: '',
      descripcion: '',
      tipoDescuento: 'porcentaje',
      valorDescuento: '',
      aplicaA: 'total_venta',
      idCategoria: '',
      idProducto: '',
      montoMinimoCompra: 0,
      cantidadMaximaUsos: '',
      usoPorCliente: 1,
      fechaInicio: '',
      fechaFin: '',
      requiereCodigo: false,
      codigoDescuento: ''
    });
    setWizardStep(1);
    setIsEditing(false);
    setSelectedDescuento(null);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.nombreDescuento.length >= 3;
      case 2:
        const hasValue = formData.valorDescuento > 0;
        const targetValid = formData.aplicaA === 'total_venta' || 
                           (formData.aplicaA === 'categoria' && formData.idCategoria) ||
                           (formData.aplicaA === 'producto' && formData.idProducto);
        return hasValue && targetValid;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(wizardStep)) setWizardStep(prev => prev + 1);
    else Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Por favor completa los campos requeridos.', timer: 2000, showConfirmButton: false });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const dataToSend = { ...formData };
      
      // Sanitización
      if (dataToSend.valorDescuento) dataToSend.valorDescuento = parseFloat(dataToSend.valorDescuento);
      if (dataToSend.montoMinimoCompra) dataToSend.montoMinimoCompra = parseFloat(dataToSend.montoMinimoCompra);
      if (dataToSend.cantidadMaximaUsos) dataToSend.cantidadMaximaUsos = parseInt(dataToSend.cantidadMaximaUsos);
      if (dataToSend.usoPorCliente) dataToSend.usoPorCliente = parseInt(dataToSend.usoPorCliente);
      
      dataToSend.idCategoria = dataToSend.idCategoria ? parseInt(dataToSend.idCategoria) : null;
      dataToSend.idProducto = dataToSend.idProducto ? parseInt(dataToSend.idProducto) : null;

      if (isEditing) {
        await descuentosApi.actualizarDescuento(selectedDescuento.idDescuento, dataToSend);
      } else {
        await descuentosApi.crearDescuento(dataToSend);
      }

      Swal.fire({ icon: 'success', title: '¡Éxito!', text: `Promoción ${isEditing ? 'actualizada' : 'creada'} correctamente.`, timer: 1500, showConfirmButton: false });
      setShowWizard(false);
      resetForm();
      cargarDatos();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.msg || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditWizard = (descuento) => {
    setSelectedDescuento(descuento);
    setIsEditing(true);
    setFormData({
      nombreDescuento: descuento.nombreDescuento,
      descripcion: descuento.descripcion || '',
      tipoDescuento: descuento.tipoDescuento,
      valorDescuento: descuento.valorDescuento,
      aplicaA: descuento.aplicaA,
      idCategoria: descuento.idCategoria || '',
      idProducto: descuento.idProducto || '',
      montoMinimoCompra: descuento.montoMinimoCompra,
      cantidadMaximaUsos: descuento.cantidadMaximaUsos || '',
      usoPorCliente: descuento.usoPorCliente,
      fechaInicio: descuento.fechaInicio ? new Date(descuento.fechaInicio).toISOString().split('T')[0] : '',
      fechaFin: descuento.fechaFin ? new Date(descuento.fechaFin).toISOString().split('T')[0] : '',
      requiereCodigo: descuento.requiereCodigo,
      codigoDescuento: descuento.codigoDescuento || ''
    });
    setWizardStep(1);
    setShowWizard(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción marcará el descuento como inactivo.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await descuentosApi.eliminarDescuento(id);
        Swal.fire('Eliminado', 'El descuento ha sido desactivado.', 'success');
        cargarDatos();
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar el descuento.', 'error');
      }
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    try {
      await descuentosApi.actualizarEstadoDescuento(id, nuevoEstado);
      cargarDatos();
    } catch (err) {
      Swal.fire('Error', 'No se pudo cambiar el estado.', 'error');
    }
  };

  // Components
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group overflow-hidden relative">
      <div className={`absolute -right-4 -bottom-4 opacity-5 text-indigo-500 group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </div>
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-8 animate-in fade-in duration-300 text-slate-900 dark:text-slate-100">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
            <Tag className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Promociones</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Gestiona incentivos y campañas de fidelización.</p>
          </div>
        </div>
        
        <button 
          onClick={() => { resetForm(); setShowWizard(true); }}
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" />
          Nueva Promoción
        </button>
      </div>

      {/* Grid de Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Campañas" value={estadisticas.totalDescuentos} icon={Tag} />
          <StatCard title="Desc. Activos" value={estadisticas.descuentosActivos} icon={CheckCircle} />
          <StatCard title="Usos Realizados" value={estadisticas.totalUsos} icon={Users} />
          <StatCard title="Ahorro Total" value={<PrecioFormateado precio={estadisticas.ahorroTotal} />} icon={DollarSign} />
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por nombre o código..."
              value={filters.buscar}
              onChange={(e) => handleFilterChange('buscar', e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition-all ${showFilters ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'}`}
             >
               <Filter className="h-5 w-5" />
             </button>
             <button 
               onClick={cargarDatos}
               className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:text-indigo-600 transition-all"
             >
               <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
             </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800 overflow-hidden"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Estado</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white cursor-pointer"
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                >
                  <option value="">Todos los Estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                  <option value="vencido">Vencidos</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tipo de Descuento</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white cursor-pointer"
                  value={filters.tipoDescuento}
                  onChange={(e) => handleFilterChange('tipoDescuento', e.target.value)}
                >
                  <option value="">Todos los Tipos</option>
                  <option value="porcentaje">Porcentaje %</option>
                  <option value="valor_fijo">Valor Fijo $</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Modalidad de Aplicación</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-bold dark:text-white cursor-pointer"
                  value={filters.aplicaA}
                  onChange={(e) => handleFilterChange('aplicaA', e.target.value)}
                >
                  <option value="">Aplica a Todo</option>
                  <option value="total_venta">Total de Venta</option>
                  <option value="categoria">Categorías</option>
                  <option value="producto">Productos</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={clearFilters}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  Limpiar filtros
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabla Premium */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Información de la Campaña</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Beneficio</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Alcance</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Rendimiento / Uso</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading && !descuentos.length ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cargando promociones...</span>
                  </td>
                </tr>
              ) : !descuentos.length ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="h-14 w-14 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Tag className="h-8 w-8" />
                    </div>
                    <h3 className="text-base font-bold dark:text-white">Sin registros</h3>
                    <p className="text-slate-400 text-sm mt-1">No se encontraron promociones activas.</p>
                  </td>
                </tr>
              ) : (
                descuentos.map((d) => (
                  <tr key={d.idDescuento} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${d.estado === 'activo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                          <Gift className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <h4 className="text-sm font-bold dark:text-white truncate max-w-[200px]">{d.nombreDescuento}</h4>
                             <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                               d.estado === 'activo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50' : 
                               d.estado === 'vencido' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50' :
                               'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                             }`}>
                               {d.estado}
                             </span>
                          </div>
                          {d.codigoDescuento && (
                            <div className="flex items-center gap-1 mt-1 font-mono text-[10px] font-bold text-indigo-500 dark:text-indigo-400">
                               <Tag className="h-3 w-3" />
                               {d.codigoDescuento}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <span className="text-base font-bold dark:text-white">
                            {d.tipoDescuento === 'porcentaje' ? `${d.valorDescuento}%` : <PrecioFormateado precio={d.valorDescuento} />}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {d.tipoDescuento === 'porcentaje' ? 'DE DESCUENTO' : 'VALOR FIJO'}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-semibold">
                        <div className="flex flex-col gap-1">
                          <span className="dark:text-slate-300 capitalize">{d.aplicaA.replace('_', ' ')}</span>
                          {d.categoria && <span className="text-[10px] text-slate-400 font-medium">Categoría: {d.categoria.nombreCategoria}</span>}
                          {d.producto && <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">Prod: {d.producto.nombreProducto}</span>}
                        </div>
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex flex-col max-w-[100px]">
                           <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold dark:text-white">{d.usosActuales}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Usados</span>
                           </div>
                           <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 transition-all duration-700"
                                style={{ width: d.cantidadMaximaUsos ? `${Math.min(100, (d.usosActuales / d.cantidadMaximaUsos) * 100)}%` : '100%' }}
                              />
                           </div>
                        </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            title={d.estado === 'activo' ? 'Desactivar' : 'Activar'}
                            onClick={() => handleToggleEstado(d.idDescuento, d.estado)}
                            className={`p-2 rounded-lg transition-colors ${d.estado === 'activo' ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          >
                            {d.estado === 'activo' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                          </button>
                          <button 
                            title="Editar"
                            onClick={() => openEditWizard(d)}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            title="Eliminar"
                            onClick={() => handleDelete(d.idDescuento)}
                            className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWizard(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              {/* Header Wizard */}
              <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="h-11 w-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                      <Gift className="h-5 w-5" />
                   </div>
                   <div>
                      <h2 className="text-lg font-bold dark:text-white leading-tight">Configurar Promo</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Paso {wizardStep} de 4 :
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {wizardStep === 1 ? 'Concepto General' : wizardStep === 2 ? 'Incentivo Económico' : wizardStep === 3 ? 'Restricciones' : 'Vigencia y Cierre'}
                        </span>
                      </div>
                   </div>
                </div>
                <button onClick={() => setShowWizard(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex w-full h-1 bg-slate-50 dark:bg-slate-800">
                {[1,2,3,4].map(s => (
                  <div key={s} className={`flex-1 transition-all duration-300 ${s <= wizardStep ? 'bg-indigo-600' : ''}`} />
                ))}
              </div>

              {/* Body Wizard */}
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
                <AnimatePresence mode='wait' initial={false}>
                  {wizardStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre de la Campaña</label>
                         <input 
                           type="text"
                           name="nombreDescuento"
                           value={formData.nombreDescuento}
                           onChange={handleInputChange}
                           className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all font-semibold placeholder:text-slate-300"
                           placeholder="Ej: Promo Temporada 2026"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Descripción Informativa</label>
                         <textarea 
                           rows="3"
                           name="descripcion"
                           value={formData.descripcion}
                           onChange={handleInputChange}
                           className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all font-semibold placeholder:text-slate-300 resize-none"
                           placeholder="Detalles sobre el propósito de este beneficio..."
                         />
                      </div>
                      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                         <div className="flex items-center gap-3 mb-4">
                            <Tag className="h-4 w-4 text-indigo-500" />
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Mecanismo de Activación</h4>
                         </div>
                         <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                               <input 
                                 type="checkbox" 
                                 className="hidden" 
                                 checked={formData.requiereCodigo}
                                 onChange={(e) => setFormData({...formData, requiereCodigo: e.target.checked})}
                               />
                               <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.requiereCodigo ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 dark:border-slate-600'}`}>
                                 {formData.requiereCodigo && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                               </div>
                               <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Requiere cupón físico/digital</span>
                            </label>
                            {formData.requiereCodigo && (
                              <input 
                                type="text"
                                name="codigoDescuento"
                                value={formData.codigoDescuento}
                                onChange={handleInputChange}
                                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 rounded-lg font-mono text-sm uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400"
                                placeholder="CUPONVIP"
                              />
                            )}
                         </div>
                      </div>
                    </motion.div>
                  )}

                  {wizardStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-2 gap-4">
                         <button 
                           onClick={() => setFormData({...formData, tipoDescuento: 'porcentaje'})}
                           className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${formData.tipoDescuento === 'porcentaje' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'}`}
                         >
                           <Percent size={24} />
                           <span className="text-[10px] font-bold uppercase tracking-wider">Porcentaje %</span>
                         </button>
                         <button 
                           onClick={() => setFormData({...formData, tipoDescuento: 'valor_fijo'})}
                           className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${formData.tipoDescuento === 'valor_fijo' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'}`}
                         >
                           <DollarSign size={24} />
                           <span className="text-[10px] font-bold uppercase tracking-wider">Monto Fijo $</span>
                         </button>
                      </div>

                      <div className="space-y-4 text-center">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Defina la Magnitud del Incentivo</label>
                         <div className="relative inline-block w-full">
                           <input 
                             type="number"
                             name="valorDescuento"
                             value={formData.valorDescuento}
                             onChange={handleInputChange}
                             className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800/80 border-none rounded-2xl text-4xl font-bold text-center text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-200"
                             placeholder="0"
                           />
                           <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300">
                             {formData.tipoDescuento === 'porcentaje' ? '%' : '$'}
                           </div>
                         </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ámbito de Aplicación</h4>
                         <div className="grid grid-cols-3 gap-2">
                           {['total_venta', 'categoria', 'producto'].map((tipo) => (
                             <button 
                               key={tipo}
                               onClick={() => setFormData({...formData, aplicaA: tipo})}
                               className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all border ${formData.aplicaA === tipo ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                             >
                               {tipo.replace('_', ' ')}
                             </button>
                           ))}
                         </div>
                         
                         <AnimatePresence mode="wait">
                            {formData.aplicaA === 'categoria' && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2 overflow-hidden">
                                <select 
                                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm dark:text-white"
                                  value={formData.idCategoria}
                                  onChange={(e) => setFormData({...formData, idCategoria: e.target.value})}
                                >
                                  <option value="">-- Seleccionar Categoría --</option>
                                  {categorias.map(c => <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>)}
                                </select>
                              </motion.div>
                            )}
                            {formData.aplicaA === 'producto' && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2 overflow-hidden">
                                <select 
                                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm dark:text-white"
                                  value={formData.idProducto}
                                  onChange={(e) => setFormData({...formData, idProducto: e.target.value})}
                                >
                                  <option value="">-- Seleccionar Producto --</option>
                                  {productos.map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombreProducto}</option>)}
                                </select>
                              </motion.div>
                            )}
                         </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {wizardStep === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-5">
                         <div className="h-12 w-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800 shadow-sm">
                             <ShieldCheck size={24} />
                         </div>
                         <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Monto Mínimo de Facturación</label>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-slate-300">$</span>
                              <input 
                                type="number"
                                name="montoMinimoCompra"
                                value={formData.montoMinimoCompra}
                                onChange={handleInputChange}
                                className="w-full bg-transparent border-none p-0 text-xl font-bold focus:ring-0 dark:text-white"
                                placeholder="0.00"
                              />
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Límite Global de Usos</label>
                            <div className="flex items-center gap-3">
                               <input 
                                 type="number"
                                 name="cantidadMaximaUsos"
                                 value={formData.cantidadMaximaUsos}
                                 onChange={handleInputChange}
                                 className="flex-1 bg-transparent border-none p-0 text-xl font-bold focus:ring-0 dark:text-white"
                                 placeholder="Sin límite"
                               />
                               <Users size={18} className="text-slate-300" />
                            </div>
                         </div>
                         <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Usos por Usuario</label>
                            <div className="flex items-center gap-3">
                               <input 
                                 type="number"
                                 name="usoPorCliente"
                                 value={formData.usoPorCliente}
                                 onChange={handleInputChange}
                                 className="flex-1 bg-transparent border-none p-0 text-xl font-bold focus:ring-0 dark:text-white"
                                 placeholder="1"
                               />
                               <Settings size={18} className="text-slate-300" />
                            </div>
                         </div>
                      </div>

                      <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start gap-4">
                         <Info className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                         <p className="text-[11px] font-semibold text-blue-700/80 dark:text-blue-400 leading-normal">
                           Las restricciones por cliente requieren validación de identidad. Deja el límite global en blanco para campañas masivas sin límite.
                         </p>
                      </div>
                    </motion.div>
                  )}

                  {wizardStep === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8"
                    >
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <div className="flex items-center gap-2 ml-1">
                                <Calendar size={16} className="text-indigo-500" />
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lanzamiento</h4>
                             </div>
                             <input 
                               type="date"
                               name="fechaInicio"
                               value={formData.fechaInicio}
                               onChange={handleInputChange}
                               className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 transition-all focus:ring-2 focus:ring-indigo-500/20"
                             />
                          </div>
                          <div className="space-y-3">
                             <div className="flex items-center gap-2 ml-1">
                                <Clock size={16} className="text-red-400" />
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiración</h4>
                             </div>
                             <input 
                               type="date"
                               name="fechaFin"
                               value={formData.fechaFin}
                               onChange={handleInputChange}
                               className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 transition-all focus:ring-2 focus:ring-red-500/20"
                             />
                          </div>
                       </div>

                       <div className="p-8 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl text-center space-y-4">
                          <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-800">
                             <CheckCircle size={24} />
                          </div>
                          <h4 className="text-lg font-bold dark:text-white tracking-tight">Vigencia Validada</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 px-6 font-medium leading-relaxed">
                            La campaña "{formData.nombreDescuento}" está lista para ser aplicada sobre {formData.aplicaA.replace('_', ' ')}. Revisa los datos antes de publicar.
                          </p>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Wizard */}
              <div className="px-8 py-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent flex items-center justify-between">
                <button 
                  onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                  disabled={wizardStep === 1}
                  className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors uppercase tracking-wider"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
                
                {wizardStep < 4 ? (
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 uppercase tracking-wider"
                  >
                    Siguiente <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wider disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {isEditing ? 'Guardar Cambios' : 'Activar Promoción'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
