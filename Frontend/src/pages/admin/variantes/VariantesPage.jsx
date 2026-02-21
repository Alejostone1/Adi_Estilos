import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  Edit,
  Trash2,
  Plus,
  RefreshCcw,
  Filter,
  X,
  DollarSign,
  Package,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Grid3X3,
  Grid,
  List,
  ArrowUpDown,
  ArrowRight,
  Box,
  Tag,
  TrendingUp,
  TrendingDown,
  Minus,
  ToggleLeft,
  ToggleRight,
  Ruler,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { productosApi } from "../../../api/productosApi";
import { variantesApi } from "../../../api/variantesApi";
import { coloresApi } from "../../../api/coloresApi";
import { tallasApi } from "../../../api/tallasApi";
import { imagenesApi } from "../../../api/imagenesApi";
import { categoriasApi } from "../../../api/categoriasApi";
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import { proveedoresApi } from "../../../api/proveedoresApi";
import { useAuth } from "../../../context/AuthContext";

// Importar componentes personalizados
import VariantImageGallery from '../../../components/admin/VariantImageGallery';
import ColorSwatch from '../../../components/admin/ColorSwatch';
import StatusBadge from '../../../components/admin/StatusBadge';
import StockIndicator from '../../../components/admin/StockIndicator';
import VariantDetailModal from '../../../components/admin/VariantDetailModal';

export default function VariantesPage() {
  const navigate = useNavigate();
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
  const [variantes, setVariantes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('todos');
  const [filtroColor, setFiltroColor] = useState('todos');
  const [filtroTalla, setFiltroTalla] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [variantesPorPagina] = useState(15);
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'grid'

  // Estados para el modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Función para obtener todas las variantes
  const fetchVariantes = useCallback(async () => {
    try {
      const response = await variantesApi.getVariantes();
      let variantesData = [];

      if (response && response.datos && Array.isArray(response.datos)) {
        variantesData = response.datos;
      } else if (response && response.data && Array.isArray(response.data)) {
        variantesData = response.data;
      } else if (Array.isArray(response)) {
        variantesData = response;
      }

      // Cargar imágenes para cada variante
      const variantesConImagenes = await Promise.all(
        variantesData.map(async (variante) => {
          try {
            const imagenesResponse = await imagenesApi.getImagenesVariante(variante.idVariante);
            const imagenesData = imagenesResponse.datos || imagenesResponse.data || imagenesResponse;
            return {
              ...variante,
              imagenesVariantes: Array.isArray(imagenesData) ? imagenesData : []
            };
          } catch (err) {
            console.error('Error al cargar imágenes de la variante:', err);
            return {
              ...variante,
              imagenesVariantes: []
            };
          }
        })
      );

      setVariantes(variantesConImagenes);
    } catch (err) {
      console.error('Error al obtener variantes:', err);
      setVariantes([]);
    }
  }, []);

  // Función para obtener productos
  const fetchProductos = useCallback(async () => {
    try {
      const response = await productosApi.obtenerProductos();
      const productosData = response.datos || response.data || response;
      setProductos(Array.isArray(productosData) ? productosData : []);
      setProductos(productosData);
    } catch (err) {
      console.error('Error al obtener productos:', err);
      setProductos([]);
    }
  }, []);

  // Función para cargar datos relacionados del modal
  const fetchRelatedData = useCallback(async (variante) => {
    try {
      // Obtener producto
      const productResponse = await productosApi.getProductoById(variante.idProducto);
      const productoData = productResponse.datos || productResponse.data || productResponse;
      setSelectedProduct(productoData);

      // Obtener categoría si existe
      if (productoData?.idCategoria) {
        const categoryResponse = await categoriasApi.getCategoriaById(productoData.idCategoria);
        const categoryData = categoryResponse.datos || categoryResponse.data || categoryResponse;
        setSelectedCategory(categoryData);
      }

      // Obtener proveedor si existe
      if (productoData?.idProveedor) {
        const providerResponse = await proveedoresApi.obtenerProveedorById(productoData.idProveedor);
        const providerData = providerResponse.datos || providerResponse.data || providerResponse;
        setSelectedProvider(providerData);
      }

      // Obtener imágenes del producto
      if (productoData?.idProducto) {
        const imagesResponse = await imagenesApi.getImagenesProducto(productoData.idProducto);
        const imagesData = imagesResponse.datos || imagesResponse.data || imagesResponse;
        setSelectedProduct(prev => ({
          ...prev,
          imagenesProductos: Array.isArray(imagesData) ? imagesData : []
        }));
      }
    } catch (err) {
      console.error('Error al cargar datos relacionados:', err);
    }
  }, []);

  // Función para abrir el modal de detalles
  const openDetailModal = async (variante) => {
    setSelectedVariant(variante);
    await fetchRelatedData(variante);
    setShowDetailModal(true);
  };

  // Función para cerrar el modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedVariant(null);
    setSelectedProduct(null);
    setSelectedCategory(null);
    setSelectedProvider(null);
  };

  // Función para obtener datos relacionados
  const fetchDatosRelacionados = useCallback(async () => {
    try {
      const [coloresRes, tallasRes] = await Promise.all([
        coloresApi.getColores(),
        tallasApi.getTallas()
      ]);

      setColores(coloresRes?.datos || coloresRes || []);
      setTallas(tallasRes?.datos || tallasRes || []);
    } catch (err) {
      console.error('Error al obtener datos relacionados:', err);
    }
  }, []);

  // Filtrado de variantes
  const variantesFiltradas = variantes.filter((variante) => {
    if (!variante) return false;

    const sku = variante?.codigoSku || '';
    const producto = variante?.producto?.nombreProducto || '';
    const color = variante?.color?.nombreColor || '';
    const talla = variante?.talla?.nombreTalla || '';
    const estado = variante?.estado || '';

    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda =
      sku.toLowerCase().includes(busquedaLower) ||
      producto.toLowerCase().includes(busquedaLower) ||
      color.toLowerCase().includes(busquedaLower) ||
      talla.toLowerCase().includes(busquedaLower);

    const coincideProducto = filtroProducto === 'todos' || variante.idProducto === parseInt(filtroProducto);
    const coincideColor = filtroColor === 'todos' || variante.idColor === parseInt(filtroColor);
    const coincideTalla = filtroTalla === 'todos' || variante.idTalla === parseInt(filtroTalla);
    const coincideEstado = filtroEstado === 'todos' || estado === filtroEstado;

    return coincideBusqueda && coincideProducto && coincideColor && coincideTalla && coincideEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(variantesFiltradas.length / variantesPorPagina);
  const variantesPaginadas = variantesFiltradas.slice(
    (paginaActual - 1) * variantesPorPagina,
    paginaActual * variantesPorPagina
  );

  // Cargar datos al iniciar
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchVariantes(),
      fetchProductos(),
      fetchDatosRelacionados()
    ]).finally(() => {
      setLoading(false);
    });
  }, [fetchVariantes, fetchProductos, fetchDatosRelacionados]);

  // Componentes auxiliares
  const BadgeEstado = ({ estado }) => {
    const getEstadoStyle = (estado) => {
      switch (estado?.toLowerCase()) {
          case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
          case 'inactivo': return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
          default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
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

  // Función para eliminar variante
  const eliminarVariante = async (idVariante) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta variante? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await variantesApi.deleteVariante(idVariante);
      await fetchVariantes();
    } catch (error) {
      console.error('Error al eliminar variante:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al eliminar la variante';
      alert(errorMessage);
    }
  };

  // Función para cambiar estado de variante
  const cambiarEstadoVariante = async (idVariante, nuevoEstado) => {
    try {
      await variantesApi.updateVariante(idVariante, { estado: nuevoEstado });
      await fetchVariantes();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al cambiar el estado de la variante';
      alert(errorMessage);
    }
  };

  // Obtener información del producto
  const getProductoInfo = (idProducto) => {
    return productos.find(p => p.idProducto === idProducto);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4 mx-auto" />
          <span className="admin-body text-slate-500 dark:text-slate-400 animate-pulse">Cargando variantes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 max-w-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="admin-body text-red-700 dark:text-red-300">Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header con tipografía admin */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="admin-h1 text-slate-900 dark:text-white">
              Gestión de Variantes
            </h1>
          </div>
          <p className="admin-body text-slate-500 dark:text-slate-400 ml-14">
            Panel administrativo para gestión completa de variantes de productos
          </p>
        </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="admin-small text-slate-500 dark:text-slate-400">Total Variantes</span>
                  <p className="admin-h3 text-slate-900 dark:text-white">{variantes.length}</p>
                </div>
                <Layers className="w-8 h-8 text-purple-600/20" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="admin-small text-slate-500 dark:text-slate-400">Activas</span>
                  <p className="admin-h3 text-emerald-600 dark:text-emerald-400">
                    {variantes.filter(v => v.estado === 'activo').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600/20" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="admin-small text-slate-500 dark:text-slate-400">Inactivas</span>
                  <p className="admin-h3 text-slate-600 dark:text-slate-300">
                    {variantes.filter(v => v.estado === 'inactivo').length}
                  </p>
                </div>
                <ToggleLeft className="w-8 h-8 text-slate-600/20" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="admin-small text-slate-500 dark:text-slate-400">Productos con Variantes</span>
                  <p className="admin-h3 text-blue-600 dark:text-blue-400">
                    {[...new Set(variantes.map(v => v.idProducto))].length}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-600/20" />
              </div>
            </div>
          </div>

        <div className="space-y-4 md:space-y-6">
          {/* Toolbar Premium */}
          <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por SKU, producto, color o talla..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-admin-regular text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                    mostrarFiltros
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="admin-body text-slate-700 dark:text-slate-300">Filtros</span>
                  {(filtroProducto !== 'todos' || filtroColor !== 'todos' || filtroTalla !== 'todos' || filtroEstado !== 'todos') && (
                    <span className="ml-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {(filtroProducto !== 'todos' ? 1 : 0) + (filtroColor !== 'todos' ? 1 : 0) + (filtroTalla !== 'todos' ? 1 : 0) + (filtroEstado !== 'todos' ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={fetchVariantes}
                  className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-purple-600 transition-colors"
                >
                  <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => navigate('/admin/productos')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-admin-semibold text-sm shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Ver Productos</span>
                </button>
              </div>
            </div>
          </div>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex items-end gap-4 flex-1 flex-wrap">
                  <div className="flex-1 min-w-[140px] sm:min-w-[180px]">
                    <label className="block admin-small text-slate-700 dark:text-slate-300 mb-2">Producto</label>
                    <select
                      value={filtroProducto}
                      onChange={(e) => setFiltroProducto(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-admin-regular text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    >
                      <option value="todos">Todos los productos</option>
                      {productos.map(producto => (
                        <option key={producto.idProducto} value={producto.idProducto}>
                          {producto.nombreProducto}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[120px] sm:min-w-[140px]">
                    <label className="block admin-small text-slate-700 dark:text-slate-300 mb-2">Color</label>
                    <select
                      value={filtroColor}
                      onChange={(e) => setFiltroColor(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-admin-regular text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    >
                      <option value="todos">Todos los colores</option>
                      {colores.map(color => (
                        <option key={color.idColor} value={color.idColor}>
                          {color.nombreColor}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
                    <label className="block admin-small text-slate-700 dark:text-slate-300 mb-2">Talla</label>
                    <select
                      value={filtroTalla}
                      onChange={(e) => setFiltroTalla(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-admin-regular text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    >
                      <option value="todos">Todas las tallas</option>
                      {tallas.map(talla => (
                        <option key={talla.idTalla} value={talla.idTalla}>
                          {talla.nombreTalla}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
                    <label className="block admin-small text-slate-700 dark:text-slate-300 mb-2">Estado</label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-admin-regular text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
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
                    setFiltroProducto('todos');
                    setFiltroColor('todos');
                    setFiltroTalla('todos');
                    setFiltroEstado('todos');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm admin-body text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}  {/* Estados */}
          {variantesFiltradas.length === 0 && (
            <div className="text-center py-12">
              <Layers className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {busqueda || filtroProducto !== 'todos' || filtroColor !== 'todos' || filtroTalla !== 'todos' || filtroEstado !== 'todos'
                  ? 'No se encontraron variantes con los filtros aplicados'
                  : 'No hay variantes registradas en el sistema'}
              </p>
              {(busqueda || filtroProducto !== 'todos' || filtroColor !== 'todos' || filtroTalla !== 'todos' || filtroEstado !== 'todos') && (
                <button
                  onClick={() => {
                    setBusqueda('');
                    setFiltroProducto('todos');
                    setFiltroColor('todos');
                    setFiltroTalla('todos');
                    setFiltroEstado('todos');
                  }}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-800 underline"
                >
                  Limpiar filtros
                </button>
              )}
              {variantes.length === 0 && (
                <button
                  onClick={() => navigate('/admin/productos')}
                  className="mt-4 text-sm text-purple-600 hover:text-purple-800 underline"
                >
                  Ir a productos para crear variantes
                </button>
              )}                                                                                                                            
            </div>
          )}

          {/* Tabla de variantes moderna */}
          {variantesFiltradas.length > 0 && (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {/* Header de la tabla */}
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="admin-h3 text-slate-900 dark:text-white">
                      Todas las Variantes ({variantesFiltradas.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-lg transition-all ${
                          viewMode === 'table'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        title="Vista de tabla"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${
                          viewMode === 'grid'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        title="Vista de cuadrícula"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {viewMode === 'table' ? (
                  /* Vista de tabla */
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-3 md:px-6 py-2 md:py-3 text-left admin-small text-slate-600 dark:text-slate-400 uppercase tracking-wide font-admin-bold">
                            SKU
                          </th>
                          <th className="px-3 md:px-6 py-2 md:py-3 text-left admin-small text-slate-600 dark:text-slate-400 uppercase tracking-wide font-admin-bold">
                            Producto
                          </th>
                          <th className="px-3 md:px-6 py-2 md:py-3 text-left admin-small text-slate-600 dark:text-slate-400 uppercase tracking-wide font-admin-bold hidden sm:table-cell">
                            Color
                          </th>
                          <th className="px-3 md:px-6 py-2 md:py-3 text-left admin-small text-slate-600 dark:text-slate-400 uppercase tracking-wide font-admin-bold hidden md:table-cell">
                            Talla
                          </th>
                          <th className="px-3 md:px-6 py-2 md:py-3 text-left admin-small text-slate-600 dark:text-slate-400 uppercase tracking-wide font-admin-bold hidden lg:table-cell">
                            Imágenes
                          </th>
                          <th className="px-3 md:px-6 py-2 md:py-3 text-left admin-small text-slate-600 dark:text-slate-400 uppercase tracking-wide font-admin-bold">
                            Precios
                          </th>
                          <th className="px-3 md:px-6 py-2 md:py-3 text-left admin-small text-slate-600 dark:text-slate-400 uppercase tracking-wide font-admin-bold">
                            Stock
                          </th>
                          <th className="px-3 md:px-6 py-2 md:py-3 text-left admin-small text-slate-600 dark:text-slate-400 uppercase tracking-wide font-admin-bold">
                            Estado
                          </th>
                          <th className="px-3 md:px-6 py-2 md:py-3 text-right admin-small text-slate-600 dark:text-slate-400 uppercase tracking-wide font-admin-bold">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {variantesPaginadas.map((variante) => {
                          const productoInfo = getProductoInfo(variante.idProducto);
                          return (
                            <tr
                              key={variante.idVariante}
                              className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-admin-medium text-slate-900 dark:text-white">
                                    {variante.codigoSku}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <div className="flex flex-col gap-1">
                                  <div className="inline-flex items-center gap-2 px-2 md:px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl max-w-fit group/prod cursor-help">
                                    <Package className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs md:text-sm font-admin-bold text-blue-900 dark:text-blue-100 tracking-tight">
                                      {productoInfo?.nombreProducto || 'Producto no encontrado'}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/productos/${variante.idProducto}/variantes`);
                                      }}
                                      className="ml-1 opacity-0 group-hover/prod:opacity-100 text-blue-600 hover:text-blue-800 p-0.5 rounded-md hover:bg-blue-100 transition-all"
                                      title="Filtrar por este producto"
                                    >
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <span className="text-[9px] font-admin-bold text-slate-400 uppercase tracking-widest ml-1 hidden sm:inline">
                                    REF: {productoInfo?.codigoReferencia || 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                                <ColorSwatch
                                  color={variante.color}
                                  size="sm"
                                  showName={true}
                                />
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                                <div className="flex items-center gap-2">
                                  <Ruler className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                                  <span className="text-sm font-admin-medium text-slate-900 dark:text-white">
                                    {variante.talla?.nombreTalla || '-'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4 hidden lg:table-cell">
                                <VariantImageGallery
                                  variant={variante}
                                  product={productoInfo}
                                  size="sm"
                                  showBadge={true}
                                />
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                                    <span className="text-sm font-admin-medium text-slate-900 dark:text-white">
                                      <PrecioFormateado precio={variante.precioVenta} />
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="admin-small text-slate-500 dark:text-slate-400">Costo:</span>
                                    <span className="admin-small text-slate-600 dark:text-slate-400">
                                      <PrecioFormateado precio={variante.precioCosto} />
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <StockIndicator
                                  currentStock={variante.cantidadStock}
                                  minStock={variante.stockMinimo}
                                  maxStock={variante.stockMaximo}
                                  size="sm"
                                  variant="detailed"
                                />
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <StatusBadge
                                  status={variante.estado}
                                  size="sm"
                                  showIcon={true}
                                />
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => openDetailModal(variante)}
                                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                                    title="Ver detalles completos"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => navigate(`/admin/productos/${variante.idProducto}/variantes`)}
                                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                                    title="Gestionar variantes del producto"
                                  >
                                    <Layers className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const nuevoEstado = variante.estado === 'activo' ? 'inactivo' : 'activo';
                                      if (window.confirm(`¿Estás seguro de que deseas ${nuevoEstado === 'activo' ? 'activar' : 'desactivar'} esta variante?`)) {
                                        cambiarEstadoVariante(variante.idVariante, nuevoEstado);
                                      }
                                    }}
                                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title={variante.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                  >
                                    {variante.estado === 'activo' ? (
                                      <ToggleLeft className="w-3.5 h-3.5" />
                                    ) : (
                                      <ToggleRight className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => eliminarVariante(variante.idVariante)}
                                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    title="Eliminar variante"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Vista de cuadrícula */
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {variantesPaginadas.map((variante) => {
                        const productoInfo = getProductoInfo(variante.idProducto);
                        return (
                          <div
                            key={variante.idVariante}
                            className="card-3d card-elevated bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-lg p-4 hover:shadow-lg transition-shadow"
                          >
                            {/* Header de la card */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {variante.codigoSku}
                                </h4>
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                   <Package className="w-3 h-3 text-slate-400" />
                                   <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                                     {productoInfo?.nombreProducto || 'Producto no encontrado'}
                                   </p>
                                </div>
                                <div className="mt-1">
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                     REF: {productoInfo?.codigoReferencia || 'N/A'}
                                   </span>
                                </div>
                                <div className="mt-3">
                                  <StatusBadge
                                    status={variante.estado}
                                    size="xs"
                                    variant="dot"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openDetailModal(variante)}
                                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition"
                                  title="Ver detalles"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => navigate(`/admin/productos/${variante.idProducto}/variantes`)}
                                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition"
                                  title="Ver producto"
                                >
                                  <Package className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => eliminarVariante(variante.idVariante)}
                                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Imagen principal */}
                            <div className="mb-3">
                              <VariantImageGallery
                                variant={variante}
                                product={productoInfo}
                                size="lg"
                                showBadge={true}
                              />
                            </div>

                            {/* Detalles */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <ColorSwatch
                                  color={variante.color}
                                  size="sm"
                                  showName={false}
                                />
                                <span className="text-sm text-gray-600">
                                  {variante.talla?.nombreTalla || '-'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  <PrecioFormateado precio={variante.precioVenta} />
                                </span>
                                <StockIndicator
                                  currentStock={variante.cantidadStock}
                                  minStock={variante.stockMinimo}
                                  variant="minimal"
                                  showNumbers={true}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Paginador mejorado */}
              {totalPaginas > 1 && (
                <div className="px-4 md:px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/40">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="admin-small text-slate-400 dark:text-slate-400">
                      Mostrando <span className="admin-body text-slate-700 dark:text-slate-300">
                        {(paginaActual - 1) * variantesPorPagina + 1} - {Math.min(paginaActual * variantesPorPagina, variantesFiltradas.length)}
                      </span> de {variantesFiltradas.length} variantes
                    </p>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                        disabled={paginaActual === 1}
                        className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </button>
                      
                      {/* Números de página */}
                      <div className="flex gap-1">
                        {[...Array(totalPaginas)].map((_, i) => {
                          const pageNum = i + 1;
                          const isCurrentPage = pageNum === paginaActual;
                          const showPage = pageNum === 1 || pageNum === totalPaginas || Math.abs(pageNum - paginaActual) <= 1;
                          
                          if (!showPage && pageNum !== 1 && pageNum !== totalPaginas) return null;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPaginaActual(pageNum)}
                              className={`w-8 h-8 rounded-lg font-admin-bold text-xs transition-all ${
                                isCurrentPage
                                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                  : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                        disabled={paginaActual === totalPaginas}
                        className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-all"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de Detalles de Variante */}
        <VariantDetailModal
          variante={selectedVariant}
          producto={selectedProduct}
          categoria={selectedCategory}
          proveedor={selectedProvider}
          isOpen={showDetailModal}
          onClose={closeDetailModal}
        />
      </div>
    </div>
  );
}
