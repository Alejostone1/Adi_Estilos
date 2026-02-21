import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Edit,
  Trash2,
  Plus,
  RefreshCcw,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Ruler,
  CheckCircle,
  AlertCircle,
  Hash,
  Type,
  MoreVertical,
  Layers,
  Settings2,
  Loader2,
  Baby,
  Users,
  Footprints
} from 'lucide-react';

import { AdminPageLayout } from '../../../components/common/AdminPagePlaceholder';
import { tallasApi } from '../../../api/tallasApi';

// ======================================================
// TallasPage.jsx
// Panel administrativo premium para gestión de tallas
// ======================================================

export default function TallasPage() {
  // ----------------------
  // Estados principales
  // ----------------------
  const [tallas, setTallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----------------------
  // Estados de búsqueda y filtros
  // ----------------------
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // ----------------------
  // Estados de paginación
  // ----------------------
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(8);

  // ----------------------
  // Estados de formulario
  // ----------------------
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tallaEditando, setTallaEditando] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  // ----------------------
  // Tipos de talla
  // ----------------------
  const tiposTalla = useMemo(() => [
    { value: 'numerica', label: 'Numérica', color: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30' },
    { value: 'alfabetica', label: 'Alfabética', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30' },
    { value: 'bebe', label: 'Bebé', color: 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800/30' },
    { value: 'nino', label: 'Niño', color: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/30' },
    { value: 'calzado', label: 'Calzado', color: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30' },
    { value: 'otra', label: 'Otra', color: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800/30' },
  ], []);

  const fetchTallas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tallasApi.getTallas();
      const data = response.datos || response.data || response || [];
      setTallas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.mensaje || err?.message || 'Error al obtener tallas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTallas();
  }, [fetchTallas]);

  // Lógica de filtrado
  const tallasFiltradas = useMemo(() => {
    return tallas.filter((talla) => {
      if (!talla) return false;
      const coincideBusqueda = (talla.nombreTalla || '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideTipo = filtroTipo === 'todos' || talla.tipoTalla === filtroTipo;
      const coincideEstado = filtroEstado === 'todos' || talla.estado === filtroEstado;
      return coincideBusqueda && coincideTipo && coincideEstado;
    });
  }, [tallas, busqueda, filtroTipo, filtroEstado]);

  // Lógica de paginación
  const totalPaginas = Math.ceil(tallasFiltradas.length / itemsPorPagina);
  const tallasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return tallasFiltradas.slice(inicio, inicio + itemsPorPagina);
  }, [tallasFiltradas, paginaActual, itemsPorPagina]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroTipo, filtroEstado]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroTipo('todos');
    setFiltroEstado('todos');
  };

  return (
    <AdminPageLayout
      title="Maestro de Tallas"
      icon={<Ruler className="w-8 h-8 text-purple-600" />}
      description="Define y organiza las dimensiones de tallaje para tus productos"
    >
      {/* Header con tipografía admin */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Ruler className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="admin-h1 text-slate-900 dark:text-white">
            Gestión de Tallas
          </h1>
        </div>
        <p className="admin-body text-slate-500 dark:text-slate-400 ml-14">
          Administra el catálogo de tallas: numéricas, alfabéticas, por edad y más
        </p>
      </div>
      {/* Dashboard de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Registros', val: tallas.length, icon: Ruler, color: 'blue' },
          { label: 'Tallas Activas', val: tallas.filter(t => t.estado === 'activo').length, icon: CheckCircle, color: 'emerald' },
          { label: 'Filtros Aplicados', val: tallasFiltradas.length, icon: Filter, color: 'purple' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
             </div>
             <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stat.val}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Toolbar Premium */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:max-w-2xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Identificador o nombre de talla..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-bold text-sm transition-all ${
                mostrarFiltros
                  ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              Configurar Filtros
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchTallas}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-purple-600 transition-colors"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-purple-600 text-white rounded-2xl font-black text-sm tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-900/10"
            >
              <Plus className="w-4 h-4" />
              Nueva Talla
            </button>
          </div>
        </div>

        {/* Filtros Expandidos */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Tipo Dimensional</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold"
              >
                <option value="todos">Todos los Tipos</option>
                {tiposTalla.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Estado Sistema</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold"
              >
                <option value="todos">Cualquier Estado</option>
                <option value="activo">Activo (Visible)</option>
                <option value="inactivo">Inactivo (Oculto)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={limpiarFiltros}
                className="text-xs font-black text-rose-500 hover:text-rose-600 flex items-center gap-1.5 p-2"
              >
                <X className="w-3 h-3" /> Limpiar Selección
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla Premium */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
            <span className="text-sm font-black text-slate-400 animate-pulse uppercase tracking-widest">Sincronizando tallaje...</span>
          </div>
        ) : tallasFiltradas.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Layers className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Sin resultados</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">No hay registros que coincidan con los criterios actuales.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">Identificador</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">Tipo</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">Estado</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">Fecha Registro</th>
                    <th className="px-12 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {tallasPaginadas.map((talla) => (
                    <tr key={talla.idTalla} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center border border-purple-100 dark:border-purple-800/30 text-purple-600 font-black text-xs">
                               {talla.nombreTalla?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{talla.nombreTalla}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <BadgeTipo tipo={talla.tipoTalla} tipos={tiposTalla} />
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${talla.estado === 'activo' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                           <span className={`text-xs font-bold uppercase tracking-tighter ${talla.estado === 'activo' ? 'text-emerald-600' : 'text-rose-500'}`}>
                             {talla.estado}
                           </span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                             {talla.creadoEn ? new Date(talla.creadoEn).toLocaleDateString() : '--/--/----'}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400">Hace {Math.floor(Math.random()*10)} días</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => { setTallaEditando(talla); setMostrarFormulario(true); }}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-all"
                            >
                               <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={async () => {
                                if (window.confirm(`¿Confirmar desactivación de "${talla.nombreTalla}"?`)) {
                                   try {
                                     setCargandoAccion(true);
                                     await tallasApi.updateTalla(talla.idTalla, { ...talla, estado: 'inactivo' });
                                     await fetchTallas();
                                   } catch(e) { alert('Error al procesar la solicitud'); }
                                   finally { setCargandoAccion(false); }
                                }
                              }}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación Premium */}
            {totalPaginas > 1 && (
              <div className="px-6 py-6 bg-slate-50/30 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400">
                   Mostrando <span className="text-slate-900 dark:text-white">{(paginaActual - 1) * itemsPorPagina + 1} - {Math.min(paginaActual * itemsPorPagina, tallasFiltradas.length)}</span> de {tallasFiltradas.length} registros
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  {[...Array(totalPaginas)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPaginaActual(i + 1)}
                      className={`w-9 h-9 rounded-xl font-black text-xs transition-all shadow-sm ${
                        paginaActual === i + 1
                          ? 'bg-slate-900 dark:bg-purple-600 text-white shadow-xl shadow-purple-500/20'
                          : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Premium */}
      {mostrarFormulario && (
        <TallaFormModal
          talla={tallaEditando}
          tiposTalla={tiposTalla}
          onClose={() => { setMostrarFormulario(false); setTallaEditando(null); }}
          loading={cargandoAccion}
          onSave={async (data) => {
            try {
              setCargandoAccion(true);
              if (tallaEditando) await tallasApi.updateTalla(tallaEditando.idTalla, data);
              else await tallasApi.createTalla(data);
              await fetchTallas();
              setMostrarFormulario(false);
              setTallaEditando(null);
            } catch (err) { throw new Error(err?.mensaje || 'Error al guardar'); }
            finally { setCargandoAccion(false); }
          }}
        />
      )}
    </AdminPageLayout>
  );
}

// ----------------------
// Sub-componentes
// ----------------------

function BadgeTipo({ tipo, tipos }) {
  const t = tipos.find(x => x.value === tipo) || { label: tipo, color: 'bg-slate-50 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${t.color}`}>
      {t.label}
    </span>
  );
}

function TallaFormModal({ talla, tiposTalla, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    nombreTalla: talla?.nombreTalla || '',
    tipoTalla: talla?.tipoTalla || 'alfabetica',
    estado: talla?.estado || 'activo'
  });
  const [errorForm, setErrorForm] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  const submit = async (e) => {
    e.preventDefault();
    if (!formData.nombreTalla.trim()) {
      setErrorForm('El nombre de la talla es requerido');
      return;
    }
    try { await onSave(formData); }
    catch (e) { setErrorForm(e.message); }
  };

  // Iconos por tipo de talla
  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'numerica': return <Hash className="w-4 h-4" />;
      case 'alfabetica': return <Type className="w-4 h-4" />;
      case 'bebe': return <Baby className="w-4 h-4" />;
      case 'nino': return <Users className="w-4 h-4" />;
      case 'calzado': return <Footprints className="w-4 h-4" />;
      default: return <MoreVertical className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-4 lg:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                {talla ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-xl font-admin-semibold text-slate-900 dark:text-white">
                  {talla ? 'Editar Talla' : 'Nueva Talla'}
                </h2>
                <p className="text-sm font-admin-medium text-slate-500 dark:text-slate-400">
                  {talla ? 'Modifica los datos existentes' : 'Configura una nueva dimensión'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Error */}
        {errorForm && (
          <div className="mx-5 md:mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-sm font-admin-medium text-rose-700 dark:text-rose-400">{errorForm}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={submit} className="p-5 md:p-6 space-y-5">
          
          {/* Nombre de la talla */}
          <div>
            <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-2">
              Nombre de la Talla *
            </label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                value={formData.nombreTalla}
                onChange={e => {
                  setFormData({...formData, nombreTalla: e.target.value});
                  setErrorForm(null);
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-admin-semibold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                placeholder="Ej: XL, 42, 12 meses..."
              />
            </div>
            <p className="mt-1.5 text-xs font-admin-regular text-slate-400">
              Identificador único que se mostrará en los productos
            </p>
          </div>

          {/* Tipo de talla - Grid de opciones visuales - RESPONSIVE */}
          <div>
            <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-3">
              Tipo de Clasificación
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tiposTalla.map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setFormData({...formData, tipoTalla: tipo.value})}
                  className={`flex items-center gap-2 p-2.5 md:p-3 rounded-xl border transition-all ${
                    formData.tipoTalla === tipo.value
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${formData.tipoTalla === tipo.value ? 'bg-purple-200 dark:bg-purple-800' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    {getTipoIcon(tipo.value)}
                  </div>
                  <span className="font-admin-medium text-xs md:text-sm truncate">{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Estado - Toggle moderno */}
          <div>
            <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-3">
              Estado de Disponibilidad
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, estado: 'activo'})}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                  formData.estado === 'activo'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${formData.estado === 'activo' ? 'text-emerald-500' : ''}`} />
                <span className="font-admin-medium text-sm">Activo</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, estado: 'inactivo'})}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                  formData.estado === 'inactivo'
                    ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <X className={`w-4 h-4 ${formData.estado === 'inactivo' ? 'text-rose-500' : ''}`} />
                <span className="font-admin-medium text-sm">Inactivo</span>
              </button>
            </div>
          </div>

          {/* Preview de la talla */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-admin-bold text-slate-400 uppercase tracking-wide mb-2">Vista previa</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-admin-bold text-lg">
                {formData.nombreTalla?.substring(0, 2).toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-admin-semibold text-slate-900 dark:text-white">
                  {formData.nombreTalla || 'Nombre de talla'}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-admin-bold uppercase tracking-tight bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 mt-1">
                  {tiposTalla.find(t => t.value === formData.tipoTalla)?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Footer - RESPONSIVE */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-admin-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || !formData.nombreTalla.trim()}
              className="w-full sm:flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-admin-semibold text-sm shadow-lg shadow-purple-200 dark:shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-300 dark:hover:shadow-purple-900/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </span>
              ) : (
                talla ? 'Guardar Cambios' : 'Crear Talla'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
