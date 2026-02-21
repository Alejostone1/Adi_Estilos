import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Edit,
  Trash2,
  Plus,
  RefreshCcw,
  Filter,
  X,
  DollarSign,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Grid3x3,
  List,
  ArrowUpDown,
  Box,
  Tag,
  TrendingUp,
  TrendingDown,
  Minus,
  Palette,
  Ruler,
  Layers,
  ToggleLeft,
  ToggleRight,
  Camera,
  Upload
} from 'lucide-react';
import { productosApi } from '../../../api/productosApi';
import { categoriasApi } from '../../../api/categoriasApi';
import { proveedoresApi } from '../../../api/proveedoresApi';
import { coloresApi } from '../../../api/coloresApi';
import { tallasApi } from '../../../api/tallasApi';
import { imagenesApi } from '../../../api/imagenesApi';
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import ProductosWizard from '../../../components/admin/ProductosWizard';
import { useAuth } from "../../../context/AuthContext";

export default function ProductosPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Función para construir URLs completas de imágenes
  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return '/placeholder.png';

    if (imagenPath.startsWith('http')) {
      return imagenPath;
    }

    if (imagenPath.startsWith('/uploads/')) {
      return `http://localhost:3000${imagenPath}`;
    }

    return `http://localhost:3000/uploads/${imagenPath}`;
  };

  // Estados principales
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroProveedor, setFiltroProveedor] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina] = useState(12);

  // Estados de imágenes
  const [mostrarGaleriaImagenes, setMostrarGaleriaImagenes] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [imagenPrincipalUrl, setImagenPrincipalUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Función para obtener productos
  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productosApi.obtenerProductos();

      let productosData = [];

      if (response && response.datos && Array.isArray(response.datos)) {
        productosData = response.datos;
      } else if (response && response.data && Array.isArray(response.data)) {
        productosData = response.data;
      } else if (Array.isArray(response)) {
        productosData = response;
      }

      const productosValidos = productosData.filter(producto =>
        producto && typeof producto === 'object' && producto.idProducto !== undefined
      );

      setProductos(productosValidos);
    } catch (err) {
      console.error('Error al obtener productos:', err);
      const errorMessage = err?.mensaje || err?.message || 'Error al obtener productos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener datos relacionados
  const fetchDatosRelacionados = useCallback(async () => {
    try {
      const [categoriasRes, proveedoresRes] = await Promise.all([
        categoriasApi.obtenerTodasLasCategorias(),
        proveedoresApi.listarProveedores()
      ]);

      setCategorias(categoriasRes?.datos || categoriasRes || []);
      setProveedores(proveedoresRes?.datos || proveedoresRes || []);
    } catch (err) {
      console.error('Error al obtener datos relacionados:', err);
    }
  }, []);

  // Filtrado
  const productosFiltrados = productos.filter((producto) => {
    if (!producto) return false;

    const nombre = producto?.nombreProducto || '';
    const codigo = producto?.codigoReferencia || '';
    const categoria = producto?.categoria?.nombreCategoria || '';
    const proveedor = producto?.proveedor?.nombreProveedor || '';
    const estado = producto?.estado || '';

    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda =
      nombre.toLowerCase().includes(busquedaLower) ||
      codigo.toLowerCase().includes(busquedaLower);

    const coincideCategoria = filtroCategoria === 'todos' || producto.idCategoria === parseInt(filtroCategoria);
    const coincideProveedor = filtroProveedor === 'todos' || producto.idProveedor === parseInt(filtroProveedor);
    const coincideEstado = filtroEstado === 'todos' || estado === filtroEstado;

    return coincideBusqueda && coincideCategoria && coincideProveedor && coincideEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * productosPorPagina,
    paginaActual * productosPorPagina
  );

  // Cargar datos al iniciar
  useEffect(() => {
    fetchProductos();
    fetchDatosRelacionados();
  }, [fetchProductos, fetchDatosRelacionados]);

  // Efecto para gestionar los datos del formulario de producto
  useEffect(() => {
    if (mostrarFormulario) {
      if (productoEditando) {
        setImagenPrincipalUrl(productoEditando.imagenPrincipal || '');
      } else {
        setImagenPrincipalUrl('');
      }
    }
  }, [mostrarFormulario, productoEditando]);

  // Función para manejar la carga de la imagen principal
  const handleImagenUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await productosApi.uploadImagenProducto(file);
      if (response && response.url) {
        setImagenPrincipalUrl(response.url);
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      alert(error?.mensaje || error?.message || "Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const refetchProductDetails = async (idProducto) => {
    try {
      const refreshedProduct = await productosApi.getProductoById(idProducto);
      const productData = refreshedProduct.datos || refreshedProduct.data || refreshedProduct;
      setProductoSeleccionado(productData);
      setGalleryImages(productData.imagenes || []);
    } catch (error) {
      console.error("Error al recargar los detalles del producto:", error);
      alert("No se pudieron actualizar los detalles del producto.");
    }
  };

  const handleGalleryImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !productoSeleccionado) return;

    setIsGalleryUploading(true);
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      await imagenesApi.createImagenProducto(productoSeleccionado.idProducto, formData);
      await refetchProductDetails(productoSeleccionado.idProducto);
    } catch (error) {
      console.error("Error al subir imagen a la galería:", error);
      alert(error?.mensaje || error?.message || "Error al subir la imagen.");
    } finally {
      setIsGalleryUploading(false);
    }
  };

  const handleDeleteImage = async (idImagen) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta imagen?")) return;

    try {
      await imagenesApi.deleteImagenProducto(idImagen);
      await refetchProductDetails(productoSeleccionado.idProducto);
      await fetchProductos();
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      alert(error?.mensaje || error?.message || "Error al eliminar la imagen.");
    }
  };

  const handleSetPrincipal = async (idImagen) => {
    if (!window.confirm("¿Deseas establecer esta imagen como la principal del producto?")) return;

    try {
      await imagenesApi.setImagenPrincipal(idImagen);
      await refetchProductDetails(productoSeleccionado.idProducto);
      await fetchProductos();
    } catch (error) {
      console.error("Error al establecer la imagen principal:", error);
      alert(error?.mensaje || error?.message || "Error al establecer la imagen principal.");
    }
  };

  // Función para cambiar estado
  const cambiarEstadoProducto = async (idProducto, nuevoEstado) => {
    try {
      await productosApi.updateProducto(idProducto, { estado: nuevoEstado });
      await fetchProductos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al cambiar el estado del producto';
      alert(errorMessage);
    }
  };

  // Función para eliminar producto
  const eliminarProducto = async (idProducto) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await productosApi.deleteProducto(idProducto);
      await fetchProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al eliminar el producto';
      alert(errorMessage);
    }
  };

  // Función para abrir el modal de nuevo producto
  const handleOpenModal = () => {
    setProductoEditando(null);
    setMostrarFormulario(true);
  };

  // Componentes auxiliares
  const BadgeEstado = ({ estado }) => {
    const getEstadoStyle = (estado) => {
      switch (estado?.toLowerCase()) {
        case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'inactivo': return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
        case 'descontinuado': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
      }
    };

    const getEstadoIcon = (estado) => {
      switch (estado?.toLowerCase()) {
        case 'activo': return <CheckCircle className="w-3 h-3" />;
        case 'inactivo': return <ToggleLeft className="w-3 h-3" />;
        case 'descontinuado': return <X className="w-3 h-3" />;
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

  // Componentes auxiliares para el modal de detalles - Estilo Universal SaaS
  const InfoBox = ({ icon: Icon, label, value, subValue, highlight = false }) => (
    <div className="flex items-start gap-4">
      {Icon && <Icon className="mt-1 text-slate-400 flex-shrink-0" size={18} />}
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
        <p className={`text-sm font-bold truncate ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
          {value || 'No especificado'}
        </p>
        {subValue && <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );

  const FeatureBadge = ({ active, label }) => (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
      active 
        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-400'
    }`}>
      {active ? <CheckCircle size={14} /> : <X size={14} />}
      <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  );

  const ProductoCard = ({ producto }) => {
    const imagenUrl = getImagenUrl(producto.imagenPrincipal);
    const totalStock = producto.variantes?.reduce((acc, v) => acc + (Number(v.cantidadStock) || 0), 0) || 0;
    const numVariantes = producto.variantes?.length || 0;

    // Calcular el costo base (mínimo) desde las variantes si no existe en el producto
    const costoBase = producto.variantes?.length > 0
      ? Math.min(...producto.variantes.map(v => Number(v.precioCosto) || 0))
      : (Number(producto.precioCompra) || 0);

    return (
      <div className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col h-full border-b-4 hover:border-b-indigo-500">
        {/* Imagen y Badges Superiores */}
        <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-slate-50 dark:bg-slate-950">
          <img
            src={imagenUrl}
            alt={producto.nombreProducto}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => { e.target.src = '/placeholder.png'; }}
          />
          
          <div className="absolute top-4 left-4">
            <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-xl px-2.5 py-1.5 shadow-sm border border-white/20">
               <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">#{producto.codigoReferencia}</span>
            </div>
          </div>

          <div className="absolute top-4 right-4">
            <BadgeEstado estado={producto.estado} />
          </div>

          <div className="absolute bottom-4 left-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
             {producto.tieneColores && <div className="p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20"><Palette size={12} className="text-purple-500" /></div>}
             {producto.tieneTallas && <div className="p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20"><Ruler size={12} className="text-blue-500" /></div>}
          </div>
        </div>

        {/* Contenido Card Refinado */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-6">
            <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2 opacity-80">
              {producto.categoria?.nombreCategoria || 'Sin categoría'}
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 min-h-[2.5rem]">
              {producto.nombreProducto}
            </h3>
          </div>

          {/* Información de Negocio e Inventario - Cuadrícula 2x2 */}
          <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
            {/* Columna Precios */}
            <div className="space-y-4 border-r border-slate-100 dark:border-slate-800/50 pr-4">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Costo Base</p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  <PrecioFormateado precio={costoBase} />
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-1 italic">PVP Sugerido</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  <PrecioFormateado precio={producto.precioVentaSugerido || 0} />
                </p>
              </div>
            </div>

            {/* Columna Inventario */}
            <div className="space-y-4 pl-2">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Variantes</p>
                <div className={`text-sm font-bold ${numVariantes > 0 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                   {numVariantes > 0 ? `${numVariantes} Skus` : 'Simple'}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Stock Total</p>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                  totalStock > 10 ? 'bg-emerald-50 text-emerald-600' : totalStock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                }`}>
                   {totalStock} <span className="opacity-60 font-semibold text-[9px]">UDS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => { setProductoSeleccionado(producto); setMostrarDetalles(true); }}
              className="flex-1 h-11 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-bold hover:shadow-lg transition-all active:scale-95"
            >
              <Eye size={14} />
              Ver Ficha
            </button>
            <button
              onClick={() => navigate(`/admin/productos/${producto.idProducto}/variantes`)}
              className="w-11 h-11 flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-100 transition-all active:scale-95"
              title="Inventario Detallado"
            >
              <Layers size={18} />
            </button>
            <button
              onClick={() => { setProductoEditando(producto); setMostrarFormulario(true); }}
              className="w-11 h-11 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
              title="Editar"
            >
              <Edit size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-0 sm:p-6 lg:p-10 transition-colors duration-300">
      
      {/* SaaS Header Section */}
      <div className="max-w-[1600px] mx-auto p-6 sm:p-0 space-y-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <Package size={14} strokeWidth={3} />
              Catálogo Maestro
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Gestión de Productos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-medium max-w-xl">
              Control centralizado de inventario, variantes, precios y galería multimedia.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchProductos}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
              title="Sincronizar catálogo"
            >
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nuevo Producto</span>
              <span className="sm:hidden">Añadir</span>
            </button>
          </div>
        </div>

        {/* Filters Workspace */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row gap-6 items-center bg-slate-50/50 dark:bg-slate-900/30">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-18" />
              <input 
                type="text"
                placeholder="Filtrar por nombre, referencia o código..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all text-sm font-medium"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm w-full lg:w-auto">
                <select 
                  className="bg-transparent border-none text-[13px] font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer px-4 py-2 flex-1 lg:flex-none"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="todos">Todas las Categorías</option>
                  {categorias.map(c => <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>)}
                </select>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden lg:block" />
                <select 
                  className="bg-transparent border-none text-[13px] font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer px-4 py-2 flex-1 lg:flex-none"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {loading && (
            <div className="flex flex-col justify-center items-center py-24 space-y-4">
              <div className="relative">
                <div className="h-12 w-12 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
                <div className="absolute top-0 left-0 h-12 w-12 border-4 border-t-indigo-500 border-transparent rounded-full animate-spin" />
              </div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sincronizando inventario...</span>
            </div>
          )}

          {error && (
            <div className="p-8 border-2 border-rose-100 dark:border-rose-900/20 bg-rose-50 dark:bg-rose-900/10 rounded-3xl text-rose-600 text-center">
              <AlertCircle size={40} className="mx-auto mb-4" />
              <h3 className="text-lg font-black mb-2 tracking-tight">Interrupción de Datos</h3>
              <p className="font-semibold text-sm opacity-80">{error}</p>
              <button onClick={fetchProductos} className="mt-6 px-6 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Reintentar Conexión</button>
            </div>
          )}

          {!loading && !error && productosFiltrados.length === 0 && (
            <div className="text-center py-24 bg-white dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Package size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-6" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Catálogo sin coincidencias</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">No encontramos productos con los parámetros especificados.</p>
              <button onClick={() => { setBusqueda(''); setFiltroCategoria('todos'); setFiltroEstado('todos'); }} className="mt-8 font-black text-indigo-500 uppercase text-[10px] tracking-[0.2em] border-b-2 border-indigo-500/20 hover:border-indigo-500 transition-all">Restablecer Búsqueda</button>
            </div>
          )}

          {!loading && !error && productosFiltrados.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
                {productosPaginados.map((producto) => (
                  <ProductoCard key={producto.idProducto} producto={producto} />
                ))}
              </div>

              {/* Pagination SaaS Style */}
              {totalPaginas > 1 && (
                <div className="flex justify-center items-center gap-4 pt-12">
                  <button
                    onClick={() => { setPaginaActual(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={paginaActual === 1}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs disabled:opacity-30 transition-all"
                  >
                    Anterior
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => { setPaginaActual(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${p === paginaActual ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => { setPaginaActual(p => Math.min(totalPaginas, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={paginaActual === totalPaginas}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs disabled:opacity-30 transition-all"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Detalles - Diseño Profesional Responsivo */}
      <AnimatePresence>
        {mostrarDetalles && productoSeleccionado && (
          <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/40 backdrop-blur-md p-0 sm:p-4">
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="relative w-full max-w-full sm:max-w-2xl h-full bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header Detalle Refinado */}
              <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Gestión de Catálogo</h3>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Especificaciones Técnicas</h2>
                </div>
                <button 
                  onClick={() => {setMostrarDetalles(false); setProductoSeleccionado(null);}}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all hover:rotate-90"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Scrollable Body - Elegancia Extrema */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 sm:p-12 space-y-12">
                  {/* Hero Section Refinada */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="relative group aspect-square overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-2xl">
                      <img
                        src={getImagenUrl(productoSeleccionado.imagenPrincipal)}
                        alt={productoSeleccionado.nombreProducto}
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={() => { setGalleryImages(productoSeleccionado.images || productoSeleccionado.imagenes || []); setMostrarGaleriaImagenes(true); }}
                        className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                      >
                        <Camera size={20} className="text-indigo-600" />
                      </button>
                    </div>

                    <div className="flex flex-col justify-center space-y-8">
                      <div>
                        <span className="inline-block text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-[10px] uppercase tracking-widest mb-4">
                          {productoSeleccionado.categoria?.nombreCategoria || 'General'}
                        </span>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-[1.1]">{productoSeleccionado.nombreProducto}</h1>
                        <div className="mt-3 flex items-center gap-3">
                           <span className="text-slate-400 font-mono text-xs">REF: {productoSeleccionado.codigoReferencia}</span>
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                           <BadgeEstado estado={productoSeleccionado.estado} />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Costo Promedio</p>
                            <p className="text-2xl font-bold text-slate-500 dark:text-slate-400 tracking-tight">
                               <PrecioFormateado precio={productoSeleccionado.variantes?.length > 0 ? (productoSeleccionado.variantes.reduce((acc, v) => acc + (Number(v.precioCosto) || 0), 0) / productoSeleccionado.variantes.length) : (Number(productoSeleccionado.precioCompra) || 0)} />
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-2">Precio de Venta</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                               <PrecioFormateado precio={productoSeleccionado.precioVentaSugerido} />
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">U. Medida</p>
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{productoSeleccionado.unidadMedida || 'Unidad'}</p>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Total Stock</p>
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {productoSeleccionado.variantes?.reduce((acc, v) => acc + (Number(v.cantidadStock) || 0), 0) || 0} uds
                             </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informacion Adicional - Estilo Universal */}
                  <div className="space-y-10">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                      <div className="space-y-8">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Box size={14} /> Atributos de Identidad
                        </h4>
                        <div className="space-y-6">
                          <InfoBox 
                            label="Fabricante / Proveedor" 
                            value={productoSeleccionado.proveedor?.nombreProveedor} 
                            subValue={productoSeleccionado.proveedor?.contacto}
                            icon={Package}
                          />
                          <div className="flex flex-wrap gap-2 pt-2">
                            <FeatureBadge active={productoSeleccionado.tieneColores} label="Gestión de Color" />
                            <FeatureBadge active={productoSeleccionado.tieneTallas} label="Gestión de Tallas" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Tag size={14} /> Clasificación
                        </h4>
                        <div className="space-y-6">
                          <InfoBox label="Categoría Principal" value={productoSeleccionado.categoria?.nombreCategoria} icon={TrendingUp} highlight />
                          {productoSeleccionado.descripcion && (
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 italic">Sinopsis</p>
                               <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-3">"{productoSeleccionado.descripcion}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Desglose de Variantes con Imágenes */}
                    <section className="space-y-8">
                       <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                             <Layers size={14} /> Inventario por Variante
                          </h4>
                          <span className="text-[10px] font-bold text-indigo-500 uppercase">{productoSeleccionado.variantes?.length || 0} configuraciones</span>
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {productoSeleccionado.variantes?.map((v) => (
                             <div key={v.idVariante} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 group hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                                {/* Thumbnail de Variante */}
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100 dark:border-slate-800">
                                   <img 
                                     src={v.imagenesVariantes?.[0]?.rutaImagen ? getImagenUrl(v.imagenesVariantes[0].rutaImagen) : getImagenUrl(productoSeleccionado.imagenPrincipal)} 
                                     className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                   />
                                </div>
                                                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                       {v.color?.nombreColor || 'Sin Color'} <span className="text-slate-300 mx-1">/</span> {v.talla?.nombreTalla || 'Sin Talla'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[9px] font-mono text-slate-400 tracking-tighter">{v.codigoSku}</span>
                                      <span className="text-[9px] font-bold text-slate-400">•</span>
                                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase">Costo: <PrecioFormateado precio={v.precioCosto || 0} /></span>
                                    </div>
                                 </div>

                                <div className={`px-3 py-2 rounded-xl text-xs font-bold ${
                                  Number(v.cantidadStock) > 5 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 
                                  Number(v.cantidadStock) > 0 ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' : 
                                  'text-rose-600 bg-rose-50 dark:bg-rose-500/10'
                                }`}>
                                   {v.cantidadStock} <span className="text-[10px] opacity-60">uds</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Acciones Footer Refinadas */}
              <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-4">
                 <button 
                   onClick={() => navigate(`/admin/productos/${productoSeleccionado.idProducto}/variantes`)}
                   className="flex-1 h-14 bg-indigo-600 text-white rounded-[1.25rem] font-bold text-sm shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                   <Layers size={18} />
                   Gestionar Inventario
                 </button>
                 <button 
                   onClick={() => { setMostrarDetalles(false); setProductoEditando(productoSeleccionado); setMostrarFormulario(true); }}
                   className="flex-1 h-14 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-[1.25rem] font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-3 active:scale-95"
                 >
                   <Edit size={18} />
                   Editar Maestro
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Otras vistas modales (Galería, Imagen, Formulario) */}
      {/* ... conservadas tal cual pero con ajustes de z-index y responsividad ... */}
      <AnimatePresence>
        {mostrarGaleriaImagenes && productoSeleccionado && (
          <div className="fixed inset-0 z-[80] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
             >
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                   <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Galería de Medios</h2>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{productoSeleccionado.nombreProducto}</p>
                   </div>
                   <button onClick={() => setMostrarGaleriaImagenes(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"><X className="text-slate-400" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {galleryImages.map((imagen) => (
                        <div key={imagen.idImagen} className="relative group aspect-square rounded-3xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 bg-slate-100 transition-all hover:border-indigo-500">
                           <img src={getImagenUrl(imagen.rutaImagen)} className="w-full h-full object-cover" />
                           {imagen.esPrincipal && <div className="absolute top-3 left-3 bg-indigo-600 text-[10px] font-black text-white px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg">Main</div>}
                           <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                              <button onClick={() => setViewingImage(imagen.rutaImagen)} className="p-2.5 bg-white text-slate-900 rounded-xl hover:scale-110 transition-all"><Eye size={16} /></button>
                              <button onClick={() => handleDeleteImage(imagen.idImagen)} className="p-2.5 bg-rose-600 text-white rounded-xl hover:scale-110 transition-all"><Trash2 size={16} /></button>
                              {!imagen.esPrincipal && <button onClick={() => handleSetPrincipal(imagen.idImagen)} className="p-2.5 bg-white text-slate-900 rounded-xl hover:scale-110 transition-all"><CheckCircle size={16} /></button>}
                           </div>
                        </div>
                      ))}
                      <label className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                         <input type="file" className="hidden" onChange={handleGalleryImageUpload} />
                         <Upload size={32} className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 transition-colors" />
                         <span className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-widest">{isGalleryUploading ? 'Subiendo...' : 'Añadir'}</span>
                      </label>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ProductosWizard
        isOpen={mostrarFormulario}
        onClose={() => { setMostrarFormulario(false); setProductoEditando(null); }}
        producto={productoEditando}
        onSuccess={() => fetchProductos()}
      />

      {viewingImage && (
        <div className="fixed inset-0 z-[90] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer" onClick={() => setViewingImage(null)}>
           <motion.img 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             src={getImagenUrl(viewingImage)} 
             className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl shadow-indigo-500/10" 
           />
           <button onClick={() => setViewingImage(null)} className="absolute top-10 right-10 p-4 text-white hover:bg-white/10 rounded-full transition-all"><X size={32} /></button>
        </div>
      )}
    </div>
  );
}