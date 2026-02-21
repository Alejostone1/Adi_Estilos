// ======================================================
// ColoresPage.jsx
// Panel administrativo premium para gestión de colores
// Compatible con backend Prisma
// Soporte modo claro / oscuro
// Tipografía admin universal
// ======================================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Edit,
  Trash2,
  Plus,
  RefreshCcw,
  Search,
  X,
  Palette,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Copy,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { AdminPageLayout } from '../../../components/common/AdminPagePlaceholder';
import { coloresApi } from '../../../api/coloresApi';

// ======================================================
// Componente principal
// ======================================================
export default function ColoresPage() {
  // ----------------------
  // Estados principales
  // ----------------------
  const [colores, setColores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----------------------
  // Estados de búsqueda
  // ----------------------
  const [busqueda, setBusqueda] = useState("");

  // ----------------------
  // Estados de paginación
  // ----------------------
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(12); // Más colores por página

  // ----------------------
  // Estados de formulario
  // ----------------------
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [colorEditando, setColorEditando] = useState(null);

  // ----------------------
  // Obtener colores
  // ----------------------
  const fetchColores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await coloresApi.getColores();
      setColores(response?.datos || []);
    } catch (err) {
      setError(err?.message || "Error al obtener colores");
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------
  // Filtrado por búsqueda y paginación
  // ----------------------
  const coloresFiltrados = colores.filter((color) => {
    const texto = busqueda.toLowerCase();
    return (
      color.nombreColor.toLowerCase().includes(texto) ||
      (color.codigoHex && color.codigoHex.toLowerCase().includes(texto))
    );
  });

  // Lógica de paginación
  const totalPaginas = Math.ceil(coloresFiltrados.length / itemsPorPagina);
  const coloresPaginados = coloresFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  // ----------------------
  // Cargar al iniciar
  // ----------------------
  useEffect(() => {
    fetchColores();
  }, [fetchColores]);

  // ======================================================
  // Render
  // ======================================================
  return (
    <AdminPageLayout
      title="Gestión de Colores"
      icon={<Palette className="w-8 h-8 text-indigo-600" />}
      description="Administración completa de colores utilizados en productos"
    >
      {/* Header con tipografía admin */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="admin-h1 text-slate-900 dark:text-white">
            Gestión de Colores
          </h1>
        </div>
        <p className="admin-body text-slate-500 dark:text-slate-400 ml-14">
          Administra el catálogo de colores: códigos HEX, nombres y estados
        </p>
      </div>

      {/* Toolbar Premium */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre o código HEX..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-admin-regular text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchColores}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-admin-semibold text-sm shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Color
            </button>
          </div>
        </div>
      </div>

      {/* Estados */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <span className="admin-body text-slate-500 dark:text-slate-400 animate-pulse">Cargando colores...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="admin-body text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && coloresFiltrados.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Palette className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="admin-h3 text-slate-900 dark:text-white mb-2">
            {busqueda ? 'No se encontraron colores' : 'No hay colores registrados'}
          </h3>
          <p className="admin-body text-slate-500 dark:text-slate-400">
            {busqueda ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer color para comenzar'}
          </p>
        </div>
      )}

      {/* Grid de colores mejorado con paginación */}
      {!loading && !error && coloresFiltrados.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Header del grid */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <span className="admin-small text-slate-500 dark:text-slate-400 font-admin-medium uppercase tracking-wide">
                {coloresFiltrados.length} colores encontrados
              </span>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Grid responsive */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {coloresPaginados.map((color) => (
                <ColorCard
                  key={color.idColor}
                  color={color}
                  onEdit={() => {
                    setColorEditando(color);
                    setMostrarFormulario(true);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Paginador */}
          {totalPaginas > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <p className="admin-small text-slate-400 dark:text-slate-400">
                  Mostrando <span className="text-slate-700 dark:text-slate-300 font-admin-semibold">
                    {(paginaActual - 1) * itemsPorPagina + 1} - {Math.min(paginaActual * itemsPorPagina, coloresFiltrados.length)}
                  </span> de {coloresFiltrados.length} colores
                </p>
                
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  
                  {/* Números de página */}
                  {[...Array(totalPaginas)].map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrentPage = pageNum === paginaActual;
                    const showPage = pageNum === 1 || pageNum === totalPaginas || Math.abs(pageNum - paginaActual) <= 1 || Math.abs(pageNum - paginaActual) <= 1;
                    
                    if (!showPage && pageNum !== 1 && pageNum !== totalPaginas) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPaginaActual(pageNum)}
                        className={`w-8 h-8 rounded-lg font-admin-bold text-xs transition-all shadow-sm ${
                          isCurrentPage
                            ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-slate-900/20'
                            : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <ColorFormModal
          color={colorEditando}
          onClose={() => {
            setMostrarFormulario(false);
            setColorEditando(null);
          }}
          onSave={async (colorData) => {
            try {
              if (colorEditando) {
                await coloresApi.updateColor(colorEditando.idColor, colorData);
              } else {
                await coloresApi.createColor(colorData);
              }
              await fetchColores();
              setMostrarFormulario(false);
              setColorEditando(null);
            } catch (error) {
              console.error('Error al guardar color:', error);
              // Aquí podrías mostrar un toast de error
            }
          }}
        />
      )}
    </AdminPageLayout>
  );
}

// ======================================================
// Tarjeta de color mejorada y más compacta
// ======================================================
function ColorCard({ color, onEdit }) {
  const [copiado, setCopiado] = useState(false);
  
  const getContrastColor = (hex) => {
    if (!hex) return "#000";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
      ? "#000"
      : "#fff";
  };

  const copiarHex = async () => {
    try {
      await navigator.clipboard.writeText(color.codigoHex);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="card-3d bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Preview del color - más compacto */}
      <div className="relative h-20 md:h-24 flex items-center justify-center" style={{ backgroundColor: color.codigoHex || '#ccc' }}>
        <div className="text-center px-2" style={{ color: getContrastColor(color.codigoHex) }}>
          <div className="font-admin-semibold text-sm md:text-base mb-0.5">{color.nombreColor}</div>
          <div className="font-admin-medium text-xs md:text-sm opacity-90 font-mono">{color.codigoHex}</div>
        </div>
        
        {/* Botón de copiar - más pequeño */}
        <button
          onClick={copiarHex}
          className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm"
          title="Copiar código HEX"
        >
          {copiado ? (
            <CheckCircle className="w-3 h-3 text-emerald-600" />
          ) : (
            <Copy className="w-3 h-3 text-slate-600 dark:text-slate-400" />
          )}
        </button>
      </div>

      {/* Información y acciones - más compacto */}
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.codigoHex }} />
            <span className="admin-body text-slate-700 dark:text-slate-300">{color.nombreColor}</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-admin-bold uppercase tracking-wide ${
            color.estado === 'activo'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            {color.estado}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="admin-small text-slate-500 dark:text-slate-400 font-mono">{color.codigoHex}</span>
          <button
            onClick={onEdit}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-all hover:scale-110"
            title="Editar color"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// Modal de formulario de color mejorado
// ======================================================
function ColorFormModal({ color, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombreColor: color?.nombreColor || '',
    codigoHex: color?.codigoHex || '#000000',
    estado: color?.estado || 'activo'
  });
  const [loading, setLoading] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombreColor.trim()) {
      setErrorForm('El nombre del color es requerido');
      return;
    }

    setLoading(true);
    setErrorForm(null);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrorForm(error?.message || 'Error al guardar color');
    } finally {
      setLoading(false);
    }
  };

  const coloresPredefinidos = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
    '#FF4500', '#DC143C', '#4169E1', '#32CD32', '#FFD700'
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                {color ? <Edit className="w-4 h-4 md:w-6 md:h-6" /> : <Plus className="w-4 h-4 md:w-6 md:h-6" />}
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-admin-semibold text-slate-900 dark:text-white">
                  {color ? 'Editar Color' : 'Nuevo Color'}
                </h2>
                <p className="text-xs md:text-sm font-admin-medium text-slate-500 dark:text-slate-400">
                  {color ? 'Modifica los datos existentes' : 'Configura un nuevo color'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Error */}
        {errorForm && (
          <div className="mx-4 md:mx-6 mt-3 md:mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-xs md:text-sm font-admin-medium text-rose-700 dark:text-rose-400">{errorForm}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-5">
          
          {/* Nombre del color */}
          <div>
            <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-2">
              Nombre del Color *
            </label>
            <input
              type="text"
              value={formData.nombreColor}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, nombreColor: e.target.value }));
                setErrorForm(null);
              }}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-admin-semibold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Ej: Rojo Carmín"
              required
            />
          </div>

          {/* Selector de color */}
          <div>
            <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-2 md:mb-3">
              Código HEX
            </label>

            <div className="flex items-center gap-2 md:gap-3 mb-3">
              <input
                type="color"
                value={formData.codigoHex}
                onChange={(e) => setFormData(prev => ({ ...prev, codigoHex: e.target.value }))}
                className="w-12 h-10 md:w-16 md:h-12 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer bg-white dark:bg-slate-800"
              />
              <input
                type="text"
                value={formData.codigoHex}
                onChange={(e) => setFormData(prev => ({ ...prev, codigoHex: e.target.value }))}
                className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-admin-medium text-sm text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="#000000"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>

            {/* Paleta de colores predefinidos */}
            <div>
              <p className="text-xs font-admin-bold text-slate-400 uppercase tracking-wide mb-2">Colores populares:</p>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 md:gap-2">
                {coloresPredefinidos.map((colorHex) => (
                  <button
                    key={colorHex}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, codigoHex: colorHex }))}
                    className="w-full aspect-square rounded-lg md:rounded-xl border-2 border-white dark:border-slate-700 shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: colorHex }}
                    title={colorHex}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-2 md:mb-3">
              Estado
            </label>
            <div className="flex gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, estado: 'activo' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3 px-3 md:px-4 rounded-xl border transition-all ${
                  formData.estado === 'activo'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <CheckCircle className={`w-3.5 h-3.5 md:w-4 md:h-4 ${formData.estado === 'activo' ? 'text-emerald-500' : ''}`} />
                <span className="font-admin-medium text-xs md:text-sm">Activo</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, estado: 'inactivo' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3 px-3 md:px-4 rounded-xl border transition-all ${
                  formData.estado === 'inactivo'
                    ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <X className={`w-3.5 h-3.5 md:w-4 md:h-4 ${formData.estado === 'inactivo' ? 'text-rose-500' : ''}`} />
                <span className="font-admin-medium text-xs md:text-sm">Inactivo</span>
              </button>
            </div>
          </div>

          {/* Vista previa */}
          <div>
            <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-2 md:mb-3">
              Vista Previa
            </label>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div
                className="flex-1 h-16 md:h-20 rounded-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-white font-admin-semibold text-base md:text-lg"
                style={{ backgroundColor: formData.codigoHex }}
              >
                {formData.nombreColor || 'Nombre del Color'}
              </div>
              <div className="p-2.5 md:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <div className="text-xs font-admin-bold text-slate-400 uppercase tracking-wide">HEX</div>
                  <div className="font-admin-medium text-xs md:text-sm text-slate-700 dark:text-slate-300 font-mono">{formData.codigoHex}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-3 md:pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 md:py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-admin-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nombreColor.trim()}
              className="flex-1 py-2.5 md:py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-admin-semibold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-900/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs md:text-sm">Guardando...</span>
                </span>
              ) : (
                <span className="text-xs md:text-sm">{color ? 'Guardar Cambios' : 'Crear Color'}</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
