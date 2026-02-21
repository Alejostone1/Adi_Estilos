import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Edit, Plus, RefreshCcw, Search, Filter, X, Eye, Trash2,
  Building2, Phone, Mail, MapPin, Calendar, CheckCircle, AlertCircle,
  ToggleLeft, ToggleRight, Package, TrendingUp, DollarSign,
  Star, Clock, FileText, Grid3x3, Upload, Camera,
  ChevronDown, ChevronUp, Palette, Ruler, Hash, Box,
  CircleDot, ArrowUpRight, Layers, Tag, AlertTriangle, Loader2
} from 'lucide-react';
import { proveedoresApi } from "../../../api/proveedoresApi";
import { productosApi } from "../../../api/productosApi";
import { useAuth } from "../../../context/AuthContext";

export default function ProveedoresPage() {
  const { token } = useAuth();

  // Función para construir URLs completas de imágenes
 const getImagenUrl = (imagenPath) => {
  if (!imagenPath) return '/placeholder.png';

  if (imagenPath.startsWith('http')) {
    return imagenPath;
  }

  return imagenPath;
};


  // Estados principales
  const [proveedores, setProveedores] = useState([]);
  const [productosPorProveedor, setProductosPorProveedor] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de modales
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [proveedorEditando, setProveedorEditando] = useState(null);

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de imágenes
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [previsualizacionImagen, setPrevisualizacionImagen] = useState(null);

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [proveedoresPorPagina] = useState(12);

  // Función para obtener proveedores
  const fetchProveedores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await proveedoresApi.listarProveedores();
      let proveedoresData = [];

      if (response && response.datos && Array.isArray(response.datos)) {
        proveedoresData = response.datos;
      } else if (response && response.data && Array.isArray(response.data)) {
        proveedoresData = response.data;
      } else if (Array.isArray(response)) {
        proveedoresData = response;
      }

      const proveedoresValidos = proveedoresData.filter(proveedor =>
        proveedor && typeof proveedor === 'object' && proveedor.idProveedor !== undefined
      );

      setProveedores(proveedoresValidos);
    } catch (err) {
      console.error('Error al obtener proveedores:', err);
      const errorMessage = err?.mensaje || err?.message || 'Error al obtener proveedores';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener productos de un proveedor
  const fetchProductosProveedor = useCallback(async (idProveedor) => {
    setCargandoProductos(true);
    try {
      const response = await productosApi.obtenerProductos({
        idProveedor: idProveedor,
        estado: 'activo'
      });

      let productosData = [];
      if (response && response.datos && Array.isArray(response.datos)) {
        productosData = response.datos;
      } else if (response && response.data && Array.isArray(response.data)) {
        productosData = response.data;
      } else if (Array.isArray(response)) {
        productosData = response;
      }

      setProductosPorProveedor(prev => ({
        ...prev,
        [idProveedor]: productosData
      }));
    } catch (err) {
      console.error('Error al obtener productos del proveedor:', err);
      setProductosPorProveedor(prev => ({
        ...prev,
        [idProveedor]: []
      }));
    } finally {
      setCargandoProductos(false);
    }
  }, []);

  // Filtrado
  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    if (!proveedor) return false;

    const nombre = proveedor?.nombreProveedor || '';
    const nit = proveedor?.nitCC || '';
    const contacto = proveedor?.contacto || '';
    const correo = proveedor?.correoElectronico || '';
    const estado = proveedor?.estado || '';

    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda =
      nombre.toLowerCase().includes(busquedaLower) ||
      nit.toLowerCase().includes(busquedaLower) ||
      contacto.toLowerCase().includes(busquedaLower) ||
      correo.toLowerCase().includes(busquedaLower);

    const coincideEstado = filtroEstado === 'todos' || estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina);
  const proveedoresPaginados = proveedoresFiltrados.slice(
    (paginaActual - 1) * proveedoresPorPagina,
    paginaActual * proveedoresPorPagina
  );

  // Cargar datos al iniciar
  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  // Función para manejar selección de imagen
  const handleImagenSeleccion = (event) => {
    const archivo = event.target.files[0];
    if (archivo) {
      setImagenSeleccionada(archivo);
      setPrevisualizacionImagen({
        archivo,
        url: URL.createObjectURL(archivo),
        nombre: archivo.name
      });
    }
  };

  const formatearFecha = (fecha, opciones) => {
  if (!fecha) return '—';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', opciones);
};


  // Función para eliminar imagen seleccionada
  const eliminarImagenSeleccionada = () => {
    setImagenSeleccionada(null);
    setPrevisualizacionImagen(null);
  };

  // Función para cambiar estado
  const cambiarEstadoProveedor = async (idProveedor, nuevoEstado) => {
    try {
      await proveedoresApi.updateProveedor(idProveedor, { estado: nuevoEstado });
      await fetchProveedores();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al cambiar el estado del proveedor';
      alert(errorMessage);
    }
  };

  // Función para eliminar proveedor
  const eliminarProveedor = async (idProveedor) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await proveedoresApi.deleteProveedor(idProveedor);
      await fetchProveedores();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al eliminar el proveedor';
      alert(errorMessage);
    }
  };

  // Componentes auxiliares
  const BadgeEstado = ({ estado }) => {
    const getEstadoStyle = (estado) => {
      switch (estado?.toLowerCase()) {
        case 'activo': return 'bg-green-100 text-green-800';
        case 'inactivo': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getEstadoIcon = (estado) => {
      switch (estado?.toLowerCase()) {
        case 'activo': return <CheckCircle className="w-3 h-3" />;
        case 'inactivo': return <ToggleLeft className="w-3 h-3" />;
        default: return <AlertCircle className="w-3 h-3" />;
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoStyle(estado)}`}>
        {getEstadoIcon(estado)}
        <span className="ml-1">{estado || 'Sin estado'}</span>
      </span>
    );
  };

  const ProveedorCard = ({ proveedor }) => {
    const productosCount =
  Array.isArray(productosPorProveedor?.[proveedor.idProveedor])
    ? productosPorProveedor[proveedor.idProveedor].length
    : 0;


    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300 overflow-hidden">
        {/* Header con imagen */}
        <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
          <img
            src={getImagenUrl(proveedor.imagenProveedor)}
            alt={proveedor.nombreProveedor}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Evitar bucle infinito si ya estamos en el placeholder
              if (!e.target.src.includes('placeholder.png')) {
                e.target.src = getImagenUrl('/placeholder.png');
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white leading-tight truncate">
                  {proveedor.nombreProveedor}
                </h3>
                <p className="text-sm text-white/90 font-mono">
                  NIT: {proveedor.nitCC}
                </p>
              </div>
            </div>
          </div>

          {/* Badge de estado */}
          <div className="absolute top-4 right-4">
            <BadgeEstado estado={proveedor.estado} />
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Información de contacto */}
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            {proveedor.contacto && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <span className="truncate">{proveedor.contacto}</span>
              </div>
            )}

            {proveedor.correoElectronico && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span className="truncate">{proveedor.correoElectronico}</span>
              </div>
            )}

            {proveedor.telefono && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <span>{proveedor.telefono}</span>
              </div>
            )}

            {proveedor.direccion && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span className="truncate">{proveedor.direccion}</span>
              </div>
            )}
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <Package className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">{productosCount}</div>
              <div className="text-xs text-gray-600">Productos</div>
            </div>

            <div className="text-center p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">Activo</div>
              <div className="text-xs text-gray-600">Estado</div>
            </div>

            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">
                {formatearFecha(proveedor.creadoEn, {
  month: 'short',
  day: 'numeric'
})}

              </div>
              <div className="text-xs text-gray-600">Registro</div>
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2">
            <button
              title="Ver detalles"
              onClick={() => {
                setProveedorSeleccionado(proveedor);
                setMostrarDetalles(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              Detalles
            </button>

            <button
              title="Ver productos"
              onClick={async () => {
                setProveedorSeleccionado(proveedor);
                await fetchProductosProveedor(proveedor.idProveedor);
                setMostrarProductos(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium transition-colors"
            >
              <Package className="w-4 h-4" />
              Productos
            </button>
          </div>

          {/* Acciones secundarias */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              title="Editar"
              onClick={() => {
                setProveedorEditando(proveedor);
                setMostrarFormulario(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>

            <button
              title={proveedor.estado === 'activo' ? 'Desactivar' : 'Activar'}
              onClick={() => {
                const nuevoEstado = proveedor.estado === 'activo' ? 'inactivo' : 'activo';
                if (window.confirm(`¿Estás seguro de que deseas ${nuevoEstado === 'activo' ? 'activar' : 'desactivar'} el proveedor "${proveedor.nombreProveedor}"?`)) {
                  cambiarEstadoProveedor(proveedor.idProveedor, nuevoEstado);
                }
              }}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                proveedor.estado === 'activo'
                  ? 'bg-red-50 hover:bg-red-100 text-red-600'
                  : 'bg-green-50 hover:bg-green-100 text-green-600'
              }`}
            >
              {proveedor.estado === 'activo' ? (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <ToggleRight className="w-4 h-4" />
                  Activar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
          </div>
          <p className="text-gray-600">Panel administrativo profesional para gestión completa de proveedores y sus productos</p>
        </div>

        <div className="space-y-6">
          {/* Barra superior */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, NIT, contacto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  mostrarFiltros
                    ? 'bg-gray-100 border-gray-300'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {filtroEstado !== 'todos' && (
                  <span className="ml-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchProveedores}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>

              <button
                onClick={() => setMostrarFormulario(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Nuevo Proveedor
              </button>
            </div>
          </div>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex items-end gap-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setBusqueda('');
                    setFiltroEstado('todos');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}

          {/* Estados */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
              <span className="ml-3 text-gray-500">Cargando proveedores...</span>
            </div>
          )}

          {error && (
            <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error:</span>
                {error}
              </div>
            </div>
          )}

          {!loading && !error && proveedoresFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">
                {busqueda || filtroEstado !== 'todos'
                  ? 'No se encontraron proveedores con los filtros aplicados'
                  : 'No hay proveedores registrados'}
              </p>
              {(busqueda || filtroEstado !== 'todos') && (
                <button
                  onClick={() => {
                    setBusqueda('');
                    setFiltroEstado('todos');
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {/* Grid de proveedores */}
          {!loading && !error && proveedoresFiltrados.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proveedoresPaginados.map((proveedor) => (
                  <ProveedorCard
                    key={proveedor.idProveedor}
                    proveedor={proveedor}
                  />
                ))}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Anterior
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                      <button
                        key={pagina}
                        onClick={() => setPaginaActual(pagina)}
                        className={`px-3 py-2 rounded-lg transition ${
                          pagina === paginaActual
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pagina}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL DE DETALLES DEL PROVEEDOR — Diseño Premium                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {mostrarDetalles && proveedorSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setMostrarDetalles(false); setProveedorSeleccionado(null); }} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
            {/* Hero image header */}
            <div className="relative h-44 bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden flex-shrink-0">
              <img
                src={getImagenUrl(proveedorSeleccionado.imagenProveedor)}
                alt={proveedorSeleccionado.nombreProveedor}
                className="w-full h-full object-cover opacity-30"
                onError={(e) => { if (!e.target.src.includes('placeholder.png')) { e.target.src = getImagenUrl('/placeholder.png'); } }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <button onClick={() => { setMostrarDetalles(false); setProveedorSeleccionado(null); }} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-all">
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white leading-tight truncate">{proveedorSeleccionado.nombreProveedor}</h2>
                  <p className="text-sm text-blue-100 font-mono">NIT: {proveedorSeleccionado.nitCC}</p>
                </div>
                <BadgeEstado estado={proveedorSeleccionado.estado} />
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Contact grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow icon={<Users className="h-4 w-4" />} label="Contacto" value={proveedorSeleccionado.contacto} />
                <DetailRow icon={<Mail className="h-4 w-4" />} label="Correo" value={proveedorSeleccionado.correoElectronico} isLink />
                <DetailRow icon={<Phone className="h-4 w-4" />} label="Teléfono" value={proveedorSeleccionado.telefono} />
                <DetailRow icon={<Calendar className="h-4 w-4" />} label="Registro" value={formatearFecha(proveedorSeleccionado.creadoEn, { year: 'numeric', month: 'long', day: 'numeric' })} />
              </div>

              {/* Address */}
              {proveedorSeleccionado.direccion && (
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dirección</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{proveedorSeleccionado.direccion}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Notas</p>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{proveedorSeleccionado.notas || 'Sin notas registradas'}</p>
                </div>
              </div>

              {/* Quick action */}
              <button
                onClick={async () => {
                  setMostrarDetalles(false);
                  await fetchProductosProveedor(proveedorSeleccionado.idProveedor);
                  setMostrarProductos(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-semibold text-sm rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <Package className="h-4 w-4" />
                Ver Productos de este Proveedor
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL DE PRODUCTOS DEL PROVEEDOR — Con variantes expandibles      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {mostrarProductos && proveedorSeleccionado && (
        <ModalProductosProveedor
          proveedor={proveedorSeleccionado}
          productos={productosPorProveedor[proveedorSeleccionado.idProveedor] || []}
          cargando={cargandoProductos}
          getImagenUrl={getImagenUrl}
          onClose={() => { setMostrarProductos(false); setProveedorSeleccionado(null); }}
        />
      )}

      {/* Modal de formulario de proveedor */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h2>
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setProveedorEditando(null);
                    eliminarImagenSeleccionada();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);

                const proveedorData = {
                  nombreProveedor: formData.get('nombreProveedor'),
                  nitCC: formData.get('nitCC'),
                  contacto: formData.get('contacto'),
                  correoElectronico: formData.get('correoElectronico'),
                  telefono: formData.get('telefono'),
                  direccion: formData.get('direccion'),
                  estado: formData.get('estado'),
                  notas: formData.get('notas')
                };

                try {
                  if (imagenSeleccionada) {
                    try {
                      const imagenResult = await proveedoresApi.subirImagenProveedor(imagenSeleccionada);
                      proveedorData.imagenProveedor = imagenResult.url;
                    } catch (uploadError) {
                      console.error('Error en la subida de imagen:', uploadError);
                    }
                  } else if (proveedorEditando?.imagenProveedor) {
                    proveedorData.imagenProveedor = proveedorEditando.imagenProveedor;
                  }

                  if (proveedorEditando) {
                    await proveedoresApi.updateProveedor(proveedorEditando.idProveedor, proveedorData);
                  } else {
                    await proveedoresApi.crearProveedor(proveedorData);
                  }

                  setImagenSeleccionada(null);
                  setPrevisualizacionImagen(null);
                  await fetchProveedores();
                  setMostrarFormulario(false);
                  setProveedorEditando(null);
                } catch (error) {
                  console.error('Error al guardar proveedor:', error);
                  alert(error?.mensaje || error?.message || 'Error al guardar el proveedor');
                }
              }} className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Proveedor</label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagenSeleccion}
                      className="hidden"
                      id="imagen-proveedor"
                    />
                    <label
                      htmlFor="imagen-proveedor"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {previsualizacionImagen ? (
                        <div className="relative">
                          <img
                            src={previsualizacionImagen.url}
                            alt={previsualizacionImagen.nombre}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              eliminarImagenSeleccionada();
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mb-3" />
                          <span className="text-sm text-gray-600 font-medium">
                            Haz clic para subir imagen
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF hasta 10MB
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {proveedorEditando?.imagenProveedor && !previsualizacionImagen && (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={getImagenUrl(proveedorEditando.imagenProveedor)}
                        alt="Imagen actual"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Imagen actual</p>
                        <p className="text-xs">Se mantendrá si no subes una nueva</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Proveedor *</label>
                    <input
                      type="text"
                      name="nombreProveedor"
                      defaultValue={proveedorEditando?.nombreProveedor}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NIT/CC *</label>
                    <input
                      type="text"
                      name="nitCC"
                      defaultValue={proveedorEditando?.nitCC}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contacto</label>
                    <input
                      type="text"
                      name="contacto"
                      defaultValue={proveedorEditando?.contacto}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      name="correoElectronico"
                      defaultValue={proveedorEditando?.correoElectronico}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      defaultValue={proveedorEditando?.telefono}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      name="estado"
                      defaultValue={proveedorEditando?.estado || 'activo'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <textarea
                    name="direccion"
                    rows={3}
                    defaultValue={proveedorEditando?.direccion}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                  <textarea
                    name="notas"
                    rows={4}
                    placeholder="Notas adicionales sobre el proveedor..."
                    defaultValue={proveedorEditando?.notas}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setProveedorEditando(null);
                      eliminarImagenSeleccionada();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {proveedorEditando ? 'Actualizar' : 'Crear'} Proveedor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* COMPONENTE AUXILIAR: DetailRow para modal de detalles                      */
/* ═══════════════════════════════════════════════════════════════════════════ */
const DetailRow = ({ icon, label, value, isLink }) => (
  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
    <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      {value ? (
        isLink ? (
          <a href={`mailto:${value}`} className="text-sm font-medium text-blue-600 hover:underline truncate block">{value}</a>
        ) : (
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{value}</p>
        )
      ) : (
        <p className="text-sm text-slate-400 italic">No especificado</p>
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
/* COMPONENTE: Modal de Productos del Proveedor (con variantes expandibles)  */
/* ═══════════════════════════════════════════════════════════════════════════ */
const ModalProductosProveedor = ({ proveedor, productos, cargando, getImagenUrl, onClose }) => {
  const [busquedaProd, setBusquedaProd] = useState('');
  const [expandidos, setExpandidos] = useState({});

  const toggleExpandir = (idProducto) => {
    setExpandidos(prev => ({ ...prev, [idProducto]: !prev[idProducto] }));
  };

  const expandirTodos = () => {
    const allExpanded = productos.every(p => expandidos[p.idProducto]);
    const nuevoEstado = {};
    productos.forEach(p => { nuevoEstado[p.idProducto] = !allExpanded; });
    setExpandidos(nuevoEstado);
  };

  const productosFiltrados = productos.filter(p => {
    const q = busquedaProd.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.nombreProducto || '').toLowerCase().includes(q) ||
      (p.codigoReferencia || '').toLowerCase().includes(q) ||
      (p.variantes || []).some(v => (v.codigoSku || '').toLowerCase().includes(q))
    );
  });

  // Stats rápidos
  const totalVariantes = productos.reduce((sum, p) => sum + (p.variantes?.length || 0), 0);
  const totalStock = productos.reduce((sum, p) => {
    return sum + (p.variantes || []).reduce((s, v) => s + (Number(v.cantidadStock) || 0), 0);
  }, 0);
  const stockBajo = productos.reduce((sum, p) => {
    return sum + (p.variantes || []).filter(v => Number(v.cantidadStock) <= 5 && Number(v.cantidadStock) > 0).length;
  }, 0);
  const sinStock = productos.reduce((sum, p) => {
    return sum + (p.variantes || []).filter(v => Number(v.cantidadStock) <= 0).length;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Productos del Proveedor</h2>
                <p className="text-xs text-slate-500 font-medium">{proveedor.nombreProveedor} · {proveedor.nitCC}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-4 gap-3">
            <MiniKpi icon={<Box className="h-3.5 w-3.5" />} label="Productos" value={productos.length} color="indigo" />
            <MiniKpi icon={<Layers className="h-3.5 w-3.5" />} label="Variantes" value={totalVariantes} color="purple" />
            <MiniKpi icon={<Hash className="h-3.5 w-3.5" />} label="Stock Total" value={totalStock} color="emerald" />
            <MiniKpi icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Sin Stock" value={sinStock} color="rose" />
          </div>

          {/* Search + Actions */}
          <div className="flex items-center gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={busquedaProd}
                onChange={(e) => setBusquedaProd(e.target.value)}
                placeholder="Buscar producto o SKU…"
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
            {productos.length > 0 && (
              <button onClick={expandirTodos} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap">
                <Layers className="h-3.5 w-3.5" />
                {productos.every(p => expandidos[p.idProducto]) ? 'Colapsar' : 'Expandir'} Todo
              </button>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cargando ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Cargando productos…</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                <Package className="h-7 w-7 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500">
                {busquedaProd ? 'No se encontraron productos con esa búsqueda' : 'Este proveedor no tiene productos asociados'}
              </p>
            </div>
          ) : (
            productosFiltrados.map((producto) => (
              <ProductoCardExpandible
                key={producto.idProducto}
                producto={producto}
                expandido={!!expandidos[producto.idProducto]}
                onToggle={() => toggleExpandir(producto.idProducto)}
                getImagenUrl={getImagenUrl}
              />
            ))
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            Mostrando {productosFiltrados.length} de {productos.length} productos
          </p>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-all">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Mini KPI para el modal ─── */
const MiniKpi = ({ icon, label, value, color }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${colors[color]}`}>
      {icon}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-sm font-bold leading-none">{value}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/* COMPONENTE: Producto Card Expandible con Variantes                        */
/* ═══════════════════════════════════════════════════════════════════════════ */

const ProductoCardExpandible = ({ producto, expandido, onToggle, getImagenUrl }) => {
  const variantes = producto.variantes || [];
  const totalStock = variantes.reduce((sum, v) => sum + (Number(v.cantidadStock) || 0), 0);
  const imagenPrincipal = producto.imagenPrincipal || producto.imagenes?.[0]?.rutaImagen;

  const precioMin = variantes.length > 0 ? Math.min(...variantes.map(v => Number(v.precioVenta) || 0)) : Number(producto.precioVentaSugerido) || 0;
  const precioMax = variantes.length > 0 ? Math.max(...variantes.map(v => Number(v.precioVenta) || 0)) : precioMin;

  // Colores únicos de las variantes
  const coloresUnicos = [...new Map(variantes.filter(v => v.color).map(v => [v.color.idColor, v.color])).values()];
  // Tallas únicas
  const tallasUnicas = [...new Map(variantes.filter(v => v.talla).map(v => [v.talla.idTalla, v.talla])).values()];

  return (
    <div className={`bg-white dark:bg-slate-800/50 rounded-2xl border transition-all duration-200 ${
      expandido
        ? 'border-indigo-200 dark:border-indigo-900/50 shadow-md shadow-indigo-500/5'
        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
    }`}>
      {/* Producto Header — siempre visible */}
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-4 text-left">
        {/* Imagen */}
        <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
          {imagenPrincipal ? (
            <img
              src={getImagenUrl(imagenPrincipal)}
              alt={producto.nombreProducto}
              className="w-full h-full object-cover"
              onError={(e) => { if (!e.target.src.includes('placeholder.png')) e.target.src = getImagenUrl('/placeholder.png'); }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-6 w-6 text-slate-300 dark:text-slate-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">{producto.nombreProducto}</h3>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              producto.estado === 'activo'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
            }`}>{producto.estado}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400 font-mono">{producto.codigoReferencia}</span>
            {producto.categoria && (
              <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Tag className="h-2.5 w-2.5" />{producto.categoria.nombreCategoria}
              </span>
            )}
          </div>
        </div>

        {/* Colors Preview */}
        {coloresUnicos.length > 0 && (
          <div className="hidden sm:flex items-center gap-0.5">
            {coloresUnicos.slice(0, 5).map(c => (
              <div
                key={c.idColor}
                className="h-5 w-5 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                style={{ backgroundColor: c.codigoHex || '#ccc' }}
                title={c.nombreColor}
              />
            ))}
            {coloresUnicos.length > 5 && (
              <span className="text-[10px] text-slate-400 ml-1">+{coloresUnicos.length - 5}</span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4 text-right flex-shrink-0">
          <div>
            <p className="text-[10px] font-medium text-slate-400 uppercase">Variantes</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{variantes.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-400 uppercase">Stock</p>
            <p className={`text-sm font-bold ${totalStock <= 0 ? 'text-rose-500' : totalStock <= 10 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{totalStock}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-400 uppercase">Precio</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {precioMin === precioMax
                ? `$${precioMin.toLocaleString()}`
                : `$${precioMin.toLocaleString()} - $${precioMax.toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* Chevron */}
        <div className={`p-1.5 rounded-lg transition-colors ${expandido ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-300'}`}>
          {expandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Variantes — expandible */}
      {expandido && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          {/* Summary bar */}
          <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/70 flex items-center gap-4 text-xs">
            {coloresUnicos.length > 0 && (
              <span className="flex items-center gap-1 text-slate-500">
                <Palette className="h-3.5 w-3.5" />
                {coloresUnicos.length} color{coloresUnicos.length !== 1 ? 'es' : ''}
              </span>
            )}
            {tallasUnicas.length > 0 && (
              <span className="flex items-center gap-1 text-slate-500">
                <Ruler className="h-3.5 w-3.5" />
                {tallasUnicas.length} talla{tallasUnicas.length !== 1 ? 's' : ''}
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-500">
              <Box className="h-3.5 w-3.5" />
              {totalStock} unidades en stock
            </span>
          </div>

          {variantes.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-slate-400">Este producto no tiene variantes configuradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="py-2 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-left">SKU</th>
                    <th className="py-2 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-left">Color</th>
                    <th className="py-2 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-left">Talla</th>
                    <th className="py-2 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Costo</th>
                    <th className="py-2 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Venta</th>
                    <th className="py-2 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Margen</th>
                    <th className="py-2 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {variantes.map((v) => {
                    const costo = Number(v.precioCosto) || 0;
                    const venta = Number(v.precioVenta) || 0;
                    const margen = venta - costo;
                    const margenPct = venta > 0 ? ((margen / venta) * 100).toFixed(0) : 0;
                    const stock = Number(v.cantidadStock) || 0;

                    return (
                      <tr key={v.idVariante} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4">
                          <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">{v.codigoSku}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          {v.color ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="h-5 w-5 rounded-full border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0"
                                style={{ backgroundColor: v.color.codigoHex || '#ccc' }}
                              />
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{v.color.nombreColor}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          {v.talla ? (
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{v.talla.nombreTalla}</span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="text-xs text-slate-500">${costo.toLocaleString()}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">${venta.toLocaleString()}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`text-xs font-semibold ${margen > 0 ? 'text-emerald-600' : margen < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {margenPct}%
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <StockBadge stock={stock} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Badge visual de stock ─── */
const StockBadge = ({ stock }) => {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 px-2 py-0.5 rounded-lg">
        <CircleDot className="h-2.5 w-2.5" /> Agotado
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-0.5 rounded-lg">
        <AlertTriangle className="h-2.5 w-2.5" /> {stock}
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{stock}</span>
  );
};