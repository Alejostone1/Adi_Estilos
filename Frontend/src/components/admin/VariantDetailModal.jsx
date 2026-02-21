import React, { useState, useEffect } from 'react';
import {
  X, Package, Tag, DollarSign, Box, Palette, Ruler,
  Calendar, TrendingUp, User, MapPin, Eye, ArrowLeft,
  ChevronLeft, ChevronRight, Image as ImageIcon, Grid3x3,
  Layers, Info, Settings, BarChart3, Edit, ExternalLink,
  ShoppingCart, Activity
} from 'lucide-react';
import VariantImageGallery from './VariantImageGallery';
import ColorSwatch from './ColorSwatch';
import StatusBadge from './StatusBadge';
import StockIndicator from './StockIndicator';
import PrecioFormateado from '../common/PrecioFormateado';
import { useNavigate } from 'react-router-dom';

const VariantDetailModal = ({
  variante,
  producto,
  categoria,
  proveedor,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('imagenes');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  // Función segura para formatear precios
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0.00';

    // Convertir a número si es string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (typeof numPrice === 'number' && !isNaN(numPrice)) {
      return numPrice.toFixed(2);
    }
    return '0.00';
  };

  if (!isOpen || !variante) return null;

  // Combinar imágenes de producto y variante
  const variantImages = variante.imagenesVariantes || [];
  const productImages = producto?.imagenesProductos || [];
  const allImages = [
    ...variantImages.map(img => ({ ...img, type: 'variant', source: 'Variante' })),
    ...productImages.map(img => ({ ...img, type: 'product', source: 'Producto' }))
  ];

  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return '/placeholder.png';
    if (imagenPath.startsWith('http')) return imagenPath;
    return imagenPath;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Funciones de acciones rápidas
  const handleVerEnTienda = () => {
    // Abrir la variante en una nueva pestaña en la tienda principal
    const tiendaUrl = `http://localhost:5174/producto/${variante.idProducto}`;
    window.open(tiendaUrl, '_blank');
  };

  const handleEditarVariante = () => {
    // Navegar a la página de gestión de variantes del producto
    navigate(`/admin/productos/${variante.idProducto}/variantes`);
    onClose();
  };

  const handleVerEstadisticas = () => {
    /*
     * 📊 PANEL DE ESTADÍSTICAS DEL PRODUCTO
     * 
     * Este panel proporciona análisis completos del rendimiento del producto:
     * 
     * 📈 Métricas de Ventas:
     * - Ventas totales y tendencia mensual
     * - Productos más vendidos por período
     * - Ingresos generados y crecimiento
     * 
     * 📦 Análisis de Inventario:
     * - Niveles de stock actuales vs históricos
     * - Variantes con mayor rotación
     * - Alertas de stock bajo y reposición
     * 
     * 💰 Indicadores Financieros:
     * - Margen de ganancia por variante
     * - Rentabilidad del producto
     * - Comparación costo vs venta
     * 
     * 🎯 Insights de Comportamiento:
     * - Preferencias de color/talla
     * - Patrones de compra estacionales
     * - Demanda por región/categoría
     * 
     * 📋 Reportes y Exportación:
     * - Gráficos interactivos con filtros
     * - Exportación a PDF/Excel
     * - Comparación con períodos anteriores
     */
    navigate(`/admin/productos/${variante.idProducto}/estadisticas`);
    onClose();
  };

  const handleVerProducto = () => {
    // Navegar a la página del producto (ya existe)
    navigate(`/admin/productos/${variante.idProducto}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold">Detalles de Variante</h2>
                <p className="text-purple-100 mt-1">{variante.codigoSku}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Panel Izquierdo - Imágenes */}
          <div className="lg:w-1/2 bg-gray-50 dark:bg-slate-900/50 p-6 border-r border-gray-200 dark:border-slate-700">
            <div className="h-full flex flex-col">
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('imagenes')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === 'imagenes'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4 inline mr-2" />
                  Imágenes
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === 'info'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
                  }`}
                >
                  <Info className="w-4 h-4 inline mr-2" />
                  Información
                </button>
              </div>

              {/* Contenido del tab */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'imagenes' ? (
                  <div className="space-y-4">
                    {/* Galería principal */}
                    <div className="relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm">
                      <div className="aspect-square">
                        {allImages.length > 0 ? (
                          <img
                            src={getImagenUrl(allImages[currentImageIndex].rutaImagen)}
                            alt={`Imagen ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800">
                            <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Navegación */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Información de la imagen */}
                      {allImages[currentImageIndex] && (
                        <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {allImages[currentImageIndex].source}
                              </span>
                            </div>
                            <span className="text-sm">
                              {currentImageIndex + 1} / {allImages.length}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                              index === currentImageIndex
                                ? 'border-purple-500 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={getImagenUrl(image.rutaImagen)}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Información del producto */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-600" />
                        Información del Producto
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nombre:</span>
                          <span className="font-medium text-gray-900">
                            {producto?.nombreProducto || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Código:</span>
                          <span className="font-medium text-gray-900">
                            {producto?.codigoReferencia || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Categoría:</span>
                          <span className="font-medium text-gray-900">
                            {categoria?.nombreCategoria || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Proveedor:</span>
                          <span className="font-medium text-gray-900">
                            {proveedor?.nombreProveedor || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-purple-600" />
                        Configuración
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stock Mínimo:</span>
                          <span className="font-medium text-gray-900">
                            {variante.stockMinimo || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stock Máximo:</span>
                          <span className="font-medium text-gray-900">
                            {variante.stockMaximo || 'Sin límite'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha Creación:</span>
                          <span className="font-medium text-gray-900">
                            {variante.creadoEn ? new Date(variante.creadoEn).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel Derecho - Detalles de la variante */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Header de la variante */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {variante.codigoSku}
                    </h3>
                    <StatusBadge
                      status={variante.estado}
                      size="md"
                      className="mt-2"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      <PrecioFormateado precio={variante.precioVenta} />
                    </div>
                    <div className="text-sm text-gray-600">
                      Precio de venta
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <ColorSwatch
                      color={variante.color}
                      size="md"
                      showName={true}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {variante.talla?.nombreTalla || 'Sin talla'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de precios */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Información de Precios
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-900/50">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-1">Precio Venta</div>
                    <div className="text-xl font-bold text-green-700 dark:text-green-300">
                      ${formatPrice(variante.precioVenta)}
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-900/50">
                    <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">Precio Costo</div>
                    <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                      ${formatPrice(variante.precioCosto)}
                    </div>
                  </div>
                </div>
                {typeof variante.precioVenta === 'number' && typeof variante.precioCosto === 'number' && variante.precioCosto > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-600 dark:text-blue-400">Margen de Ganancia:</span>
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {((variante.precioVenta - variante.precioCosto) / variante.precioCosto * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Información de stock */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Box className="w-5 h-5 text-blue-600" />
                  Gestión de Stock
                </h4>
                <StockIndicator
                  currentStock={variante.cantidadStock}
                  minStock={variante.stockMinimo}
                  maxStock={variante.stockMaximo}
                  variant="detailed"
                />
              </div>

              {/* Acciones rápidas */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h4 className="admin-h3 text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Acciones Rápidas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={handleVerEnTienda}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-200/20 dark:shadow-none"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="admin-body">Ver en Tienda</span>
                  </button>
                  <button 
                    onClick={handleEditarVariante}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-200/20 dark:shadow-none"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="admin-body">Editar Variante</span>
                  </button>
                  <button 
                    onClick={handleVerEstadisticas}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-200/20 dark:shadow-none"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="admin-body">Ver Estadísticas</span>
                  </button>
                  <button 
                    onClick={handleVerProducto}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-200/20 dark:shadow-none"
                  >
                    <Package className="w-4 h-4" />
                    <span className="admin-body">Ver Producto</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantDetailModal;
