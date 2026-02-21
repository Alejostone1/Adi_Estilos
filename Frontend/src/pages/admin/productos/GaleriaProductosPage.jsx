import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Image as ImageIcon, Plus, Search, Filter, X, Eye, Edit,
  Trash2, Star, ArrowUpDown, Grid3x3, Layers, Palette, Ruler,
  Upload, ChevronLeft, ChevronRight, Loader2, AlertCircle,
  CheckCircle, Camera, Move, Tag, Calendar, TrendingUp, Box
} from 'lucide-react';
import Swal from 'sweetalert2';
import { productosApi } from "../../../api/productosApi";
import { variantesApi } from "../../../api/variantesApi";
import { imagenesApi } from "../../../api/imagenesApi";
import { categoriasApi } from "../../../api/categoriasApi";
import { proveedoresApi } from "../../../api/proveedoresApi";
import { coloresApi } from "../../../api/coloresApi";
import { tallasApi } from "../../../api/tallasApi";
import { useAuth } from "../../../context/AuthContext";

// Componentes personalizados
import ColorSwatch from '../../../components/admin/ColorSwatch';
import StatusBadge from '../../../components/admin/StatusBadge';

export default function GaleriaProductosPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Estados principales
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroProveedor, setFiltroProveedor] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de categorías y proveedores
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  // Estados para modales
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductGallery, setShowProductGallery] = useState(false);
  const [showVariantGallery, setShowVariantGallery] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Estados para gestión de imágenes
  const [imagenesProducto, setImagenesProducto] = useState([]);
  const [imagenesVariante, setImagenesVariante] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Función para obtener URL de imagen
  const getImagenUrl = (imagenPath) => {
    console.log('🖼️ getImagenUrl recibió:', imagenPath);
    
    if (!imagenPath) {
      console.log('❌ imagenPath es nulo o vacío');
      return '/placeholder.png';
    }
    
    if (imagenPath.startsWith('http')) {
      console.log('✅ imagenPath ya es URL completa:', imagenPath);
      return imagenPath;
    }
    
    // Extraer la ruta relativa (quitar /uploads/ si existe)
    const rutaRelativa = imagenPath.startsWith('/uploads/') 
      ? imagenPath.replace('/uploads/', '')
      : imagenPath;
    
    // Opción 1: URL estática (puede fallar por CORS)
    const urlEstatica = `http://localhost:3000${imagenPath.startsWith('/') ? imagenPath : '/uploads/' + imagenPath}`;
    
    // Opción 2: URL a través de la API (CORS-friendly)
    const urlApi = `http://localhost:3000/api/imagenes/servir/${rutaRelativa}`;
    
    console.log('🔄 Probando URL estática:', urlEstatica);
    console.log('🔄 URL alternativa (API):', urlApi);
    
    // Por ahora usar la API para evitar problemas de CORS
    return urlApi;
  };

  // Componente de imagen optimizada con lazy loading
  const ImagenOptimizada = ({ src, alt, className, onError }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setError(true);
          if (onError) onError(e);
        }}
        style={{
          opacity: loaded ? 1 : 0.7,
          transition: 'opacity 0.3s ease',
          filter: error ? 'blur(5px)' : 'none'
        }}
      />
    );
  };

  // Función para manejar errores de carga de imágenes
  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/600x800/f3f4f6/9ca3af?text=Error+al+cargar';
    e.target.onerror = null; // Prevenir bucles infinitos
  };

  // Función para verificar si la URL de imagen es válida
  const isValidImageUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Función para forzar recarga de imágenes
  const forzarRecargaImagenes = () => {
    // Forzar recarga de imágenes que no cargan
    const imagenes = document.querySelectorAll('img');
    imagenes.forEach(img => {
      if (img.src && !img.complete) {
        const src = img.src;
        img.src = '';
        setTimeout(() => {
          img.src = src;
        }, 10);
      }
    });
  };

  // Función para mostrar notificaciones con SweetAlert2 (modal centrado)
  const mostrarNotificacion = (tipo, titulo, mensaje) => {
    Swal.fire({
      icon: tipo,
      title: titulo,
      text: mensaje,
      showConfirmButton: true,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false,
      allowEscapeKey: false,
      position: 'center'
    });
  };

  // Función para mostrar confirmaciones con SweetAlert2
  const mostrarConfirmacion = async (titulo, texto, icono = 'warning') => {
    const result = await Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
  };

  // Función para validar archivos de imagen
  const validarArchivosImagen = (files) => {
    const errores = [];
    const archivosValidos = [];
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const tamanoMaximo = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach((file, index) => {
      // Validar tipo
      if (!tiposPermitidos.includes(file.type)) {
        errores.push(`Archivo ${index + 1}: Tipo no permitido. Solo se aceptan JPEG, PNG, GIF y WebP.`);
        return;
      }

      // Validar tamaño
      if (file.size > tamanoMaximo) {
        errores.push(`Archivo ${index + 1}: El tamaño excede los 5MB permitidos.`);
        return;
      }

      archivosValidos.push(file);
    });

    return { archivosValidos, errores };
  };

  // Función para previsualizar imágenes antes de subirlas
  const previsualizarImagenes = (files) => {
    return new Promise((resolve) => {
      const previews = [];
      let loadedCount = 0;

      Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[index] = e.target.result;
          loadedCount++;
          if (loadedCount === files.length) {
            resolve(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    });
  };

  // Función para obtener productos con sus imágenes y variantes
  const fetchProductosConDatos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productosApi.obtenerProductos();
      const productosData = response.datos || response.data || response || [];

      console.log('📦 Datos de productos recibidos:', productosData);
      
      if (Array.isArray(productosData)) {
        // Log detallado del primer producto para depuración
        if (productosData.length > 0) {
          console.log('🔍 Primer producto (detallado):', {
            id: productosData[0].id,
            nombre: productosData[0].nombreProducto,
            imagenesProductos: productosData[0].imagenesProductos,
            imagenPrincipal: productosData[0].imagenesProductos?.[0]
          });
        }
        setProductos(productosData);
      } else {
        console.error("La respuesta de la API no es un array:", productosData);
        setProductos([]);
      }
    } catch (err) {
      console.error('Error al obtener productos:', err);
      setError('Error al cargar los productos. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener categorías y proveedores
  const fetchDatosRelacionados = useCallback(async () => {
    try {
      const [categoriasRes, proveedoresRes] = await Promise.all([
        categoriasApi.obtenerTodasLasCategorias(),
        proveedoresApi.obtenerProveedores()
      ]);

      setCategorias(categoriasRes?.datos || categoriasRes || []);
      setProveedores(proveedoresRes?.datos || proveedoresRes || []);
    } catch (err) {
      console.error('Error al obtener datos relacionados:', err);
    }
  }, []);

  // Filtrado de productos
  const productosFiltrados = productos.filter((producto) => {
    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda =
      producto.nombreProducto?.toLowerCase().includes(busquedaLower) ||
      producto.codigoReferencia?.toLowerCase().includes(busquedaLower);

    const coincideCategoria = filtroCategoria === 'todos' || producto.idCategoria === parseInt(filtroCategoria);
    const coincideProveedor = filtroProveedor === 'todos' || producto.idProveedor === parseInt(filtroProveedor);

    return coincideBusqueda && coincideCategoria && coincideProveedor;
  });

  // Función para abrir galería de producto
  const openProductGallery = async (producto) => {
    setSelectedProduct(producto);
    setImagenesProducto(producto.imagenesProductos || []);
    setShowProductGallery(true);
  };

  // Función para abrir galería de variante
  const openVariantGallery = async (variante, producto) => {
    setSelectedProduct(producto);
    setSelectedVariant(variante);
    setImagenesVariante(variante.imagenesVariantes || []);
    setShowVariantGallery(true);
  };

  // Función para subir imágenes de producto
  const handleUploadProductoImages = async (files) => {
    if (!selectedProduct || files.length === 0) return;

    // Validar archivos
    const { archivosValidos, errores } = validarArchivosImagen(files);
    
    if (errores.length > 0) {
      await Swal.fire({
        icon: 'error',
        title: 'Archivos no válidos',
        html: errores.join('<br>'),
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (archivosValidos.length === 0) {
      mostrarNotificacion('warning', 'Advertencia', 'No hay archivos válidos para subir');
      return;
    }

    // Mostrar previsualización
    const previews = await previsualizarImagenes(archivosValidos);
    
    const confirmado = await Swal.fire({
      title: '¿Subir imágenes?',
      html: `
        <div class="text-left">
          <p>Se van a subir ${archivosValidos.length} imagen(es):</p>
          <div class="grid grid-cols-3 gap-2 mt-3">
            ${previews.map(preview => `
              <img src="${preview}" class="w-full h-20 object-cover rounded" />
            `).join('')}
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Subir',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmado) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = archivosValidos.map(async (file, index) => {
        const formData = new FormData();
        formData.append('imagen', file);
        formData.append('descripcion', `Imagen ${imagenesProducto.length + index + 1}`);
        formData.append('orden', imagenesProducto.length + index);

        const response = await imagenesApi.createImagenProducto(selectedProduct.idProducto, formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });

        return response.datos || response.data || response;
      });

      const nuevasImagenes = await Promise.all(uploadPromises);
      setImagenesProducto([...imagenesProducto, ...nuevasImagenes]);

      // Actualizar el producto en la lista principal
      await fetchProductosConDatos();
      mostrarNotificacion('success', '¡Éxito!', `${nuevasImagenes.length} imagen(es) subida(s) correctamente`);
      
      // Forzar recarga de imágenes
      setTimeout(forzarRecargaImagenes, 500);
    } catch (err) {
      console.error('Error al subir imágenes:', err);
      const errorMessage = err.response?.data?.mensaje || err.message || 'Error desconocido al subir las imágenes';
      mostrarNotificacion('error', 'Error al subir', errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Función para subir imágenes de variante
  const handleUploadVarianteImages = async (files) => {
    if (!selectedVariant || files.length === 0) return;

    // Validar archivos
    const { archivosValidos, errores } = validarArchivosImagen(files);
    
    if (errores.length > 0) {
      await Swal.fire({
        icon: 'error',
        title: 'Archivos no válidos',
        html: errores.join('<br>'),
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (archivosValidos.length === 0) {
      mostrarNotificacion('warning', 'Advertencia', 'No hay archivos válidos para subir');
      return;
    }

    // Mostrar previsualización
    const previews = await previsualizarImagenes(archivosValidos);
    
    const confirmado = await Swal.fire({
      title: '¿Subir imágenes de variante?',
      html: `
        <div class="text-left">
          <p>Se van a subir ${archivosValidos.length} imagen(es) para la variante:</p>
          <div class="grid grid-cols-3 gap-2 mt-3">
            ${previews.map(preview => `
              <img src="${preview}" class="w-full h-20 object-cover rounded" />
            `).join('')}
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Subir',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmado) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = archivosValidos.map(async (file, index) => {
        const formData = new FormData();
        formData.append('imagen', file);
        formData.append('descripcion', `Imagen ${imagenesVariante.length + index + 1}`);
        formData.append('orden', imagenesVariante.length + index);

        const response = await imagenesApi.createImagenVariante(selectedVariant.idVariante, formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });

        return response.datos || response.data || response;
      });

      const nuevasImagenes = await Promise.all(uploadPromises);
      setImagenesVariante([...imagenesVariante, ...nuevasImagenes]);

      // Actualizar los datos
      await fetchProductosConDatos();
      mostrarNotificacion('success', '¡Éxito!', `${nuevasImagenes.length} imagen(es) de variante subida(s) correctamente`);
      
      // Forzar recarga de imágenes
      setTimeout(forzarRecargaImagenes, 500);
    } catch (err) {
      console.error('Error al subir imágenes de variante:', err);
      mostrarNotificacion('error', 'Error', 'No se pudieron subir las imágenes de la variante. Intente nuevamente.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Función para eliminar imagen de producto
  const handleDeleteProductoImage = async (idImagen) => {
    const confirmado = await mostrarConfirmacion(
      '¿Eliminar imagen actual?',
      'Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta imagen?',
      'warning'
    );
    
    if (!confirmado) return;

    try {
      await imagenesApi.deleteImagenProducto(idImagen);
      setImagenesProducto(imagenesProducto.filter(img => img.idImagen !== idImagen));
      await fetchProductosConDatos();
      mostrarNotificacion('success', 'Eliminada', 'La imagen seleccionada fue eliminada correctamente');
      
      // Forzar recarga de imágenes
      setTimeout(forzarRecargaImagenes, 500);
    } catch (err) {
      console.error('Error al eliminar imagen:', err);
      mostrarNotificacion('error', 'Error', 'No se pudo eliminar la imagen seleccionada. Intente nuevamente.');
    }
  };

  // Función para eliminar imagen de variante
  const handleDeleteVarianteImage = async (idImagen) => {
    const confirmado = await mostrarConfirmacion(
      '¿Eliminar imagen actual?',
      'Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta imagen de la variante?',
      'warning'
    );
    
    if (!confirmado) return;

    try {
      await imagenesApi.deleteImagenVariante(idImagen);
      setImagenesVariante(imagenesVariante.filter(img => img.idImagen !== idImagen));
      await fetchProductosConDatos();
      mostrarNotificacion('success', 'Eliminada', 'La imagen de la variante fue eliminada correctamente');
      
      // Forzar recarga de imágenes
      setTimeout(forzarRecargaImagenes, 500);
    } catch (err) {
      console.error('Error al eliminar imagen de variante:', err);
      mostrarNotificacion('error', 'Error', 'No se pudo eliminar la imagen de la variante. Intente nuevamente.');
    }
  };

  // Función para marcar imagen principal de producto
  const handleSetProductoMainImage = async (idImagen) => {
    try {
      await imagenesApi.setImagenPrincipal(idImagen);
      await fetchProductosConDatos();

      // Actualizar el estado local
      const updatedImages = imagenesProducto.map(img => ({
        ...img,
        esPrincipal: img.idImagen === idImagen
      }));
      setImagenesProducto(updatedImages);
      mostrarNotificacion('success', 'Actualizada', 'La imagen principal fue actualizada correctamente');
      
      // Forzar recarga de imágenes
      setTimeout(forzarRecargaImagenes, 500);
    } catch (err) {
      console.error('Error al marcar imagen principal:', err);
      mostrarNotificacion('error', 'Error', 'No se pudo marcar la imagen como principal. Intente nuevamente.');
    }
  };

  // Función para marcar imagen principal de variante
  const handleSetVarianteMainImage = async (idImagen) => {
    try {
      await imagenesApi.setImagenPrincipalVariante(idImagen);
      await fetchProductosConDatos();

      // Actualizar el estado local
      const updatedImages = imagenesVariante.map(img => ({
        ...img,
        esPrincipal: img.idImagen === idImagen
      }));
      setImagenesVariante(updatedImages);
      mostrarNotificacion('success', 'Actualizada', 'La imagen principal de la variante fue actualizada correctamente');
      
      // Forzar recarga de imágenes
      setTimeout(forzarRecargaImagenes, 500);
    } catch (err) {
      console.error('Error al marcar imagen principal de variante:', err);
      mostrarNotificacion('error', 'Error', 'No se pudo marcar la imagen como principal de la variante. Intente nuevamente.');
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    fetchProductosConDatos();
    fetchDatosRelacionados();
  }, [fetchProductosConDatos, fetchDatosRelacionados]);

  // Componente de card de producto
  const ProductoGalleryCard = ({ producto }) => {
    const imagenPrincipal = producto.imagenesProductos?.find(img => img.esPrincipal) || producto.imagenesProductos?.[0];
    const totalImagenes = producto.imagenesProductos?.length || 0;
    const totalVariantes = producto.variantes?.length || 0;

    return (
      <div className="card-3d card-elevated bg-white dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden group">
        {/* Imagen principal */}
        <div className="relative aspect-video bg-gray-100 dark:bg-slate-800/30 overflow-hidden">
          {imagenPrincipal ? (
            <ImagenOptimizada
              src={getImagenUrl(imagenPrincipal.rutaImagen)}
              alt={producto.nombreProducto}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Overlay con acciones */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
                <button
                  onClick={() => openProductGallery(producto)}
                  className="card-3d p-2 bg-white dark:bg-slate-700/40 hover:bg-white text-gray-900 dark:text-gray-200 rounded-lg transition"
                  title="Ver galería de producto"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/admin/productos/${producto.idProducto}/variantes`)}
                  className="card-3d p-2 bg-white dark:bg-slate-700/40 hover:bg-white text-gray-900 dark:text-gray-200 rounded-lg transition"
                  title="Gestionar variantes"
                >
                  <Layers className="w-4 h-4" />
                </button>
            </div>
          </div>

          {/* Indicadores */}
          <div className="absolute top-2 left-2 flex gap-2">
            {totalImagenes > 0 && (
              <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Camera className="w-3 h-3" />
                {totalImagenes}
              </div>
            )}
            {totalVariantes > 0 && (
              <div className="bg-purple-600/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {totalVariantes}
              </div>
            )}
          </div>

          {/* Badge de imagen principal */}
          {imagenPrincipal?.esPrincipal && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full">
              <Star className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
            {producto.nombreProducto}
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            {producto.codigoReferencia}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{producto.categoria?.nombreCategoria || 'Sin categoría'}</span>
            <span>{producto.proveedor?.nombreProveedor || 'Sin proveedor'}</span>
          </div>

          {/* Variantes preview */}
          {producto.variantes && producto.variantes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Variantes</span>
                <button
                  onClick={() => navigate(`/admin/productos/${producto.idProducto}/variantes`)}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  Ver todas
                </button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {producto.variantes.slice(0, 4).map((variante) => (
                  <button
                    key={variante.idVariante}
                    onClick={() => openVariantGallery(variante, producto)}
                    className="group relative"
                    title={`${variante.color?.nombreColor} - ${variante.talla?.nombreTalla}`}
                  >
                    <div className="card-3d p-0 rounded-full inline-flex">
                      <ColorSwatch
                        color={variante.color}
                        size="sm"
                        showName={false}
                      />
                    </div>
                    {variante.imagenesVariantes?.length > 0 && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-3 h-3 rounded-full flex items-center justify-center">
                        {variante.imagenesVariantes.length}
                      </div>
                    )}
                  </button>
                ))}
                {producto.variantes.length > 4 && (
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600">
                    +{producto.variantes.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Modal de galería de producto
  const ProductGalleryModal = () => {
    if (!showProductGallery || !selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Galería de Producto</h2>
                <p className="text-purple-100 mt-1">{selectedProduct.nombreProducto}</p>
              </div>
              <button
                onClick={() => setShowProductGallery(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Upload section */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Arrastra imágenes o haz clic para seleccionar</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleUploadProductoImages(e.target.files)}
                  className="hidden"
                  id="producto-upload"
                />
                <label
                  htmlFor="producto-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Subir imágenes
                </label>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo imágenes... {uploadProgress}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Grid de imágenes */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagenesProducto.map((imagen, index) => (
                <div key={imagen.idImagen} className="relative group">
                  <div className="card-3d card-elevated aspect-square bg-gray-100 dark:bg-slate-800/30 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700/50">
                    <ImagenOptimizada
                      src={getImagenUrl(imagen.rutaImagen)}
                      alt={imagen.descripcion || `Imagen ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      {!imagen.esPrincipal && (
                        <button
                          onClick={() => handleSetProductoMainImage(imagen.idImagen)}
                          className="card-3d p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
                          title="Marcar como principal"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteProductoImage(imagen.idImagen)}
                        className="card-3d p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Indicadores */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {imagen.esPrincipal && (
                      <div className="bg-yellow-500 text-white p-1 rounded-full">
                        <Star className="w-3 h-3" />
                      </div>
                    )}
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {imagenesProducto.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay imágenes para este producto</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal de galería de variante
  const VariantGalleryModal = () => {
    if (!showVariantGallery || !selectedVariant || !selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Galería de Variante</h2>
                <p className="text-purple-100 mt-1">
                  {selectedProduct.nombreProducto} - {selectedVariant.codigoSku}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <ColorSwatch color={selectedVariant.color} size="sm" showName={true} />
                  <span className="text-sm">Talla: {selectedVariant.talla?.nombreTalla}</span>
                </div>
              </div>
              <button
                onClick={() => setShowVariantGallery(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Upload section */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Arrastra imágenes o haz clic para seleccionar</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleUploadVarianteImages(e.target.files)}
                  className="hidden"
                  id="variante-upload"
                />
                <label
                  htmlFor="variante-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Subir imágenes de variante
                </label>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo imágenes... {uploadProgress}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Grid de imágenes */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagenesVariante.map((imagen, index) => (
                <div key={imagen.idImagen} className="relative group">
                  <div className="card-3d card-elevated aspect-square bg-gray-100 dark:bg-slate-800/30 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700/50">
                    <ImagenOptimizada
                      src={getImagenUrl(imagen.rutaImagen)}
                      alt={imagen.descripcion || `Imagen ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Badge de variante */}
                  <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Variante
                  </div>

                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      {!imagen.esPrincipal && (
                        <button
                          onClick={() => handleSetVarianteMainImage(imagen.idImagen)}
                          className="card-3d p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
                          title="Marcar como principal"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteVarianteImage(imagen.idImagen)}
                        className="card-3d p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Indicadores */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {imagen.esPrincipal && (
                      <div className="bg-yellow-500 text-white p-1 rounded-full">
                        <Star className="w-3 h-3" />
                      </div>
                    )}
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {imagenesVariante.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay imágenes para esta variante</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <span className="text-gray-500">Cargando galería de productos...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-700 max-w-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error:</span>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Galería de Productos</h1>
              <p className="text-gray-600">Panel central de gestión visual de imágenes</p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Total Productos</span>
                  <p className="text-2xl font-bold text-gray-900">{productos.length}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Total Imágenes</span>
                  <p className="text-2xl font-bold text-green-600">
                    {productos.reduce((total, p) => total + (p.imagenesProductos?.length || 0), 0)}
                  </p>
                </div>
                <Camera className="w-8 h-8 text-green-600 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Total Variantes</span>
                  <p className="text-2xl font-bold text-blue-600">
                    {productos.reduce((total, p) => total + (p.variantes?.length || 0), 0)}
                  </p>
                </div>
                <Layers className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Imágenes Variantes</span>
                  <p className="text-2xl font-bold text-purple-600">
                    {productos.reduce((total, p) =>
                      total + (p.variantes?.reduce((subtotal, v) => subtotal + (v.imagenesVariantes?.length || 0), 0) || 0), 0
                    )}
                  </p>
                </div>
                <Grid3x3 className="w-8 h-8 text-purple-600 opacity-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos por nombre o código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>

            {/* Botón de nuevo producto */}
            <button
              onClick={() => navigate('/admin/productos/nuevo')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>

          {/* Filtros desplegables */}
          {mostrarFiltros && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="todos">Todas las categorías</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.idCategoria} value={categoria.idCategoria}>
                      {categoria.nombreCategoria}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <select
                  value={filtroProveedor}
                  onChange={(e) => setFiltroProveedor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="todos">Todos los proveedores</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.idProveedor} value={proveedor.idProveedor}>
                      {proveedor.nombreProveedor}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => (
            <ProductoGalleryCard key={producto.idProducto} producto={producto} />
          ))}
        </div>

        {/* Estado vacío */}
        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-600 mb-4">
              {busqueda || filtroCategoria !== 'todos' || filtroProveedor !== 'todos'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer producto'
              }
            </p>
            <button
              onClick={() => navigate('/admin/productos/nuevo')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>
        )}
      </div>

      {/* Modales */}
      <ProductGalleryModal />
      <VariantGalleryModal />
    </div>
  );
}