import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  X,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Grid3X3,
  List,
  Filter,
  LayoutGrid
} from 'lucide-react';
import { categoriasApi } from '../../../api/categoriasApi';
import { useAuth } from '../../../context/AuthContext';
import CategoryDrilldownDrawer from '../../../components/admin/CategoryDrilldownDrawer';

// ======================================================
// Componente principal
// ======================================================
export default function CategoriasPage() {
  const { token } = useAuth();

  // Estados principales
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [drilldownCategory, setDrilldownCategory] = useState(null);

  // Estados para imágenes
  const [imagenCategoriaUrl, setImagenCategoriaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Formulario
  const [formData, setFormData] = useState({
    nombreCategoria: '',
    descripcion: '',
    estado: 'activo',
    imagenCategoria: '',
    categoriaPadre: ''  // Nuevo campo para jerarquía
  });

  // Función para obtener URLs de imágenes
  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return '/placeholder.png';
    if (imagenPath.startsWith('http')) return imagenPath;
    if (imagenPath.startsWith('/uploads/')) return `http://localhost:3000${imagenPath}`;
    return `http://localhost:3000/uploads/${imagenPath}`;
  };

  // Obtener categorías
  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriasApi.obtenerTodasLasCategorias();
      setCategorias(response.datos || []);
    } catch (err) {
      setError(err.message || 'Error al obtener categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al iniciar
  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Filtrar categorías
  const categoriasFiltradas = categorias.filter(categoria =>
    categoria.nombreCategoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Manejar subida de imagen
  const handleImageUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await categoriasApi.uploadImagenCategoria(file);
      if (response && response.url) {
        setImagenCategoriaUrl(response.url);
        setFormData({ ...formData, imagenCategoria: response.url });
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Manejar apertura de modal
  const handleOpenModal = (categoria = null) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nombreCategoria: categoria.nombreCategoria,
        descripcion: categoria.descripcion || '',
        estado: categoria.estado,
        imagenCategoria: categoria.imagenCategoria || '',
        categoriaPadre: categoria.categoriaPadre || ''  // Incluir padre
      });
      setImagenCategoriaUrl(categoria.imagenCategoria || '');
    } else {
      setEditingCategoria(null);
      setFormData({
        nombreCategoria: '',
        descripcion: '',
        estado: 'activo',
        imagenCategoria: '',
        categoriaPadre: ''
      });
      setImagenCategoriaUrl('');
    }
    setShowModal(true);
  };

  // Manejar cierre de modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setFormData({
      nombreCategoria: '',
      descripcion: '',
      estado: 'activo',
      imagenCategoria: '',
      categoriaPadre: ''
    });
    setImagenCategoriaUrl('');
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoria) {
        await categoriasApi.updateCategoria(editingCategoria.idCategoria, formData);
      } else {
        await categoriasApi.createCategoria(formData);
      }
      handleCloseModal();
      fetchCategorias();
    } catch (err) {
      setError(err.message || 'Error al guardar categoría');
    }
  };

  // Manejar eliminación
  const handleDelete = async (idCategoria) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;
    try {
      await categoriasApi.deleteCategoria(idCategoria);
      fetchCategorias();
    } catch (err) {
      setError(err.message || 'Error al eliminar categoría');
    }
  };

  // Ver imagen
  const handleViewImage = (e, categoria) => {
    e.stopPropagation();
    setSelectedCategoria(categoria);
    setShowImageModal(true);
  };

  const handleOpenDrilldown = (categoria) => {
    setDrilldownCategory(categoria);
    setIsDrilldownOpen(true);
  };

  // Componente de tarjeta para vista grid - CON JERARQUÍA
  const CategoriaCard = ({ categoria }) => {
    const esSubcategoria = categoria.categoriaPadre !== null && categoria.categoriaPadre !== undefined;
    const categoriaPadre = esSubcategoria ? categorias.find(c => c.idCategoria === categoria.categoriaPadre) : null;
    const tieneSubcategorias = categorias.some(c => c.categoriaPadre === categoria.idCategoria);
    
    return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer relative"
      onClick={() => handleOpenDrilldown(categoria)}
    >
      {/* Badge de jerarquía */}
      <div className="absolute top-3 left-3 z-10 flex gap-1.5">
        {esSubcategoria && (
          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-admin-bold uppercase tracking-wide rounded-full">
            Subcategoría
          </span>
        )}
        {tieneSubcategorias && (
          <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[10px] font-admin-bold uppercase tracking-wide rounded-full">
            Tiene hijas
          </span>
        )}
      </div>

      {/* Imagen de la categoría */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
        {categoria.imagenCategoria ? (
          <>
            <img
              src={getImagenUrl(categoria.imagenCategoria)}
              alt={categoria.nombreCategoria}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            <button
              onClick={(e) => handleViewImage(e, categoria)}
              className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-sm"
            >
              <Eye className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
              <span className="text-white text-xs font-admin-bold flex items-center justify-center gap-2">
                 <LayoutGrid className="w-3 h-3" /> Explorar Inventario
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-sm font-admin-medium">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Indicador de padre si es subcategoría */}
        {esSubcategoria && categoriaPadre && (
          <div className="flex items-center gap-1.5 mb-2 text-amber-600 dark:text-amber-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[10px] font-admin-medium uppercase tracking-wide truncate">
              {categoriaPadre.nombreCategoria}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between mb-2">
          <h3 className="font-admin-semibold text-slate-900 dark:text-slate-100 text-base leading-tight flex-1">
            {categoria.nombreCategoria}
          </h3>
          <span className={`ml-2 px-2 py-1 rounded-full text-[10px] font-admin-bold uppercase tracking-wide shrink-0 ${
            categoria.estado === 'activo'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {categoria.estado}
          </span>
        </div>

        {categoria.descripcion && (
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 line-clamp-2 font-admin-regular">
            {categoria.descripcion}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Tag className="w-3 h-3" />
            <span className="font-admin-medium">ID: {categoria.idCategoria}</span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleOpenModal(categoria); }}
              className="p-2 text-violet-600 hover:bg-violet-100 dark:text-violet-400 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(categoria.idCategoria); }}
              className="p-2 text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header mejorado con tipografía admin */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-violet-600 rounded-xl text-white shadow-lg shadow-violet-200 dark:shadow-none">
                  <Tag className="w-5 h-5" />
                </div>
                <h1 className="admin-h1 text-slate-900 dark:text-white">
                  Gestión de Categorías
                </h1>
              </div>
              <p className="admin-body text-slate-500 dark:text-slate-400">
                Organiza tu catálogo con jerarquía: categorías principales y subcategorías
              </p>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="card-3d card-elevated inline-flex items-center gap-2 px-5 py-3 bg-violet-600 text-white rounded-xl font-admin-semibold text-admin-sm shadow-lg shadow-violet-200 dark:shadow-none hover:bg-violet-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Nueva Categoría
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de herramientas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 font-admin-regular text-sm"
              />
            </div>

            {/* Controles */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchCategorias}
                className="card-3d p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                title="Actualizar"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estados */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-600 mr-3" />
            <span className="admin-body text-slate-500 dark:text-slate-400">Cargando categorías...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-700 dark:text-red-300 font-admin-medium text-sm">{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && categoriasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="admin-h3 text-slate-900 dark:text-slate-100 mb-2">
              {searchTerm ? 'No se encontraron categorías' : 'No hay categorías registradas'}
            </h3>
            <p className="admin-body text-slate-500 dark:text-slate-400">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera categoría para comenzar'}
            </p>
          </div>
        )}

        {/* Vista Grid */}
        {!loading && !error && categoriasFiltradas.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoriasFiltradas.map((categoria) => (
              <CategoriaCard key={categoria.idCategoria} categoria={categoria} />
            ))}
          </div>
        )}

        {/* Vista Lista */}
        {!loading && !error && categoriasFiltradas.length > 0 && viewMode === 'list' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categoriasFiltradas.map((categoria) => (
                    <tr key={categoria.idCategoria} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex items-center cursor-pointer group/item"
                          onClick={() => handleOpenDrilldown(categoria)}
                        >
                          <div className="flex-shrink-0 h-10 w-10">
                            {categoria.imagenCategoria ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover transition-transform group-hover/item:scale-110"
                                src={getImagenUrl(categoria.imagenCategoria)}
                                alt={categoria.nombreCategoria}
                                onError={(e) => { e.target.src = '/placeholder.png'; }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-black text-gray-900 dark:text-gray-100 group-hover/item:text-blue-600 transition-colors">
                              {categoria.nombreCategoria}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                               <LayoutGrid className="w-3 h-3" /> Ver productos
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {categoria.descripcion || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          categoria.estado === 'activo'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {categoria.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {categoria.imagenCategoria && (
                            <button
                              onClick={(e) => handleViewImage(e, categoria)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                              title="Ver imagen"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(categoria)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(categoria.idCategoria)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar"
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
          </div>
        )}
      </div>

      {/* Modal de Creación/Edición - CON JERARQUÍA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="p-5 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl text-white shadow-lg shadow-violet-200 dark:shadow-none">
                    <Tag className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg md:text-xl font-admin-semibold text-slate-900 dark:text-slate-100">
                    {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Imagen */}
              <div className="mb-6 md:mb-8">
                <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Imagen de la Categoría
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                  {/* Preview */}
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 md:w-32 md:h-32 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                      {imagenCategoriaUrl ? (
                        <img
                          src={getImagenUrl(imagenCategoriaUrl)}
                          alt="Previsualización"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/placeholder.png'; }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-xs font-admin-medium">Sin imagen</span>
                        </div>
                      )}
                    </div>

                    {imagenCategoriaUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagenCategoriaUrl('');
                          setFormData({ ...formData, imagenCategoria: '' });
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-sm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Upload */}
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      id="imagenCategoria"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor="imagenCategoria"
                      className="flex flex-col items-center justify-center w-full h-28 md:h-32 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-7 h-7 text-violet-600 animate-spin mb-2" />
                          <span className="text-sm font-admin-medium text-slate-600 dark:text-slate-400">Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-7 h-7 text-slate-400 dark:text-slate-500 mb-2" />
                          <span className="text-sm font-admin-medium text-slate-600 dark:text-slate-400">
                            {imagenCategoriaUrl ? 'Cambiar imagen' : 'Subir imagen'}
                          </span>
                          <span className="text-xs font-admin-regular text-slate-400 dark:text-slate-500 mt-1">
                            PNG, JPG hasta 5MB
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Campos del formulario */}
              <div className="space-y-5 md:space-y-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombreCategoria}
                    onChange={(e) => setFormData({ ...formData, nombreCategoria: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-admin-regular text-sm transition-all"
                    placeholder="Ej: Ropa Masculina"
                  />
                </div>

                {/* Selector de Categoría Padre - NUEVO */}
                <div>
                  <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-violet-500" />
                    Categoría Padre (Opcional)
                  </label>
                  <select
                    value={formData.categoriaPadre}
                    onChange={(e) => setFormData({ ...formData, categoriaPadre: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-admin-regular text-sm transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Sin categoría padre (Categoría Principal) --</option>
                    {categorias
                      .filter(c => c.idCategoria !== editingCategoria?.idCategoria) // No puede ser su propio padre
                      .map(categoria => (
                        <option key={categoria.idCategoria} value={categoria.idCategoria}>
                          {categoria.nombreCategoria} (ID: {categoria.idCategoria})
                        </option>
                      ))}
                  </select>
                  <p className="text-xs font-admin-regular text-slate-500 dark:text-slate-400 mt-1.5 ml-1">
                    Selecciona una categoría padre para crear una subcategoría, o déjalo vacío para una categoría principal.
                  </p>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-admin-regular text-sm transition-all resize-none"
                    placeholder="Describe brevemente esta categoría..."
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-admin-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Estado
                  </label>
                  <div className="flex gap-3">
                    <label className={`flex-1 flex items-center gap-3 p-3 md:p-4 rounded-xl border cursor-pointer transition-all ${formData.estado === 'activo' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700'}`}>
                      <input
                        type="radio"
                        name="estado"
                        value="activo"
                        checked={formData.estado === 'activo'}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="font-admin-medium text-sm text-slate-700 dark:text-slate-300">Activo</span>
                      </div>
                    </label>
                    <label className={`flex-1 flex items-center gap-3 p-3 md:p-4 rounded-xl border cursor-pointer transition-all ${formData.estado === 'inactivo' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700'}`}>
                      <input
                        type="radio"
                        name="estado"
                        value="inactivo"
                        checked={formData.estado === 'inactivo'}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                      />
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-600" />
                        <span className="font-admin-medium text-sm text-slate-700 dark:text-slate-300">Inactivo</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-5 py-2.5 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-admin-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl font-admin-semibold text-sm shadow-lg shadow-violet-200 dark:shadow-none hover:shadow-xl hover:shadow-violet-300 dark:hover:shadow-none hover:-translate-y-0.5 transition-all"
                >
                  {editingCategoria ? 'Actualizar Categoría' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Vista de Imagen */}
      {showImageModal && selectedCategoria && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={getImagenUrl(selectedCategoria.imagenCategoria)}
              alt={selectedCategoria.nombreCategoria}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <h3 className="text-white text-xl font-semibold">{selectedCategoria.nombreCategoria}</h3>
              <p className="text-white/80 text-sm mt-1">
                {selectedCategoria.descripcion || 'Sin descripción'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Explorador de Productos por Categoría (Drill-down) */}
      <CategoryDrilldownDrawer 
        isOpen={isDrilldownOpen}
        onClose={() => setIsDrilldownOpen(false)}
        categoria={drilldownCategory}
      />
    </div>
  );
}
