import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Package,
  Tag,
  DollarSign,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import WizardStep1 from './wizard-steps/WizardStep1';
import WizardStep2 from './wizard-steps/WizardStep2';
import WizardStep3 from './wizard-steps/WizardStep3';
import WizardStep4 from './wizard-steps/WizardStep4';
import WizardStep5 from './wizard-steps/WizardStep5';
import { productosApi } from '../../api/productosApi';

const ProductosWizard = ({ isOpen, onClose, producto = null, onSuccess }) => {
  const [pasoActual, setPasoActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombreProducto: '',
    codigoReferencia: '',
    descripcion: '',
    idCategoria: '',
    idProveedor: '',
    unidadMedida: 'unidades',
    precioCompra: '',
    precioVenta: '',
    porcentajeGanancia: '',
    tieneColores: false,
    tieneTallas: false,
    imagenPrincipal: null,
    imagenes: [],
    variantes: []
  });

  const pasos = [
    {
      id: 1,
      titulo: 'Información Básica',
      descripcion: 'Nombre, código y categoría del producto',
      icono: Package
    },
    {
      id: 2,
      titulo: 'Detalles y Proveedor',
      descripcion: 'Descripción, proveedor y unidad de medida',
      icono: Tag
    },
    {
      id: 3,
      titulo: 'Precios',
      descripcion: 'Precio de compra, venta y margen',
      icono: DollarSign
    },
    {
      id: 4,
      titulo: 'Imágenes',
      descripcion: 'Sube foto principal e imágenes adicionales',
      icono: ImageIcon
    },
    {
      id: 5,
      titulo: 'Resumen',
      descripcion: 'Revisa y confirma los datos',
      icono: Check
    }
  ];

  // Cargar producto si está editando
  useEffect(() => {
    if (producto && isOpen) {
      setFormData({
        nombreProducto: producto.nombreProducto || '',
        codigoReferencia: producto.codigoReferencia || '',
        descripcion: producto.descripcion || '',
        idCategoria: producto.idCategoria || '',
        idProveedor: producto.idProveedor || '',
        unidadMedida: producto.unidadMedida || 'unidades',
        precioCompra: producto.precioCompra || producto.variantes?.[0]?.precioCosto || '',
        precioVenta: producto.precioVenta || producto.precioVentaSugerido || producto.variantes?.[0]?.precioVenta || '',
        porcentajeGanancia: producto.porcentajeGanancia || '',
        tieneColores: producto.tieneColores || false,
        tieneTallas: producto.tieneTallas || false,
        imagenPrincipal: producto.imagenPrincipal || null,
        imagenes: producto.imagenes || [],
        variantes: producto.variantes || []
      });
      setPasoActual(1);
    } else if (isOpen) {
      setFormData({
        nombreProducto: '',
        codigoReferencia: '',
        descripcion: '',
        idCategoria: '',
        idProveedor: '',
        unidadMedida: 'unidades',
        precioCompra: '',
        precioVenta: '',
        porcentajeGanancia: '',
        tieneColores: false,
        tieneTallas: false,
        imagenPrincipal: null,
        imagenes: [],
        variantes: []
      });
      setPasoActual(1);
    }
    setError(null);
  }, [isOpen, producto]);

  const handleUpdateFormData = (updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const validateStep = (paso) => {
    switch (paso) {
      case 1:
        if (!formData.nombreProducto.trim()) {
          setError('El nombre del producto es requerido');
          return false;
        }
        if (!formData.codigoReferencia.trim()) {
          setError('El código de referencia es requerido');
          return false;
        }
        if (!formData.idCategoria) {
          setError('La categoría es requerida');
          return false;
        }
        break;

      case 2:
        if (!formData.descripcion.trim()) {
          setError('La descripción es requerida');
          return false;
        }
        break;

      case 3:
        if (!formData.precioCompra || parseFloat(formData.precioCompra) <= 0) {
          setError('El precio de compra es requerido y debe ser mayor a 0');
          return false;
        }
        if (!formData.precioVenta || parseFloat(formData.precioVenta) <= 0) {
          setError('El precio de venta es requerido y debe ser mayor a 0');
          return false;
        }
        break;

      case 4:
        if (!formData.imagenPrincipal) {
          setError('Debe subir al menos una imagen principal');
          return false;
        }
        break;

      default:
        break;
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(pasoActual)) {
      setPasoActual(prev => Math.min(prev + 1, 5));
      setError(null);
    }
  };

  const handlePrev = () => {
    setPasoActual(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imagenPrincipalRuta = null;

      // Si la imagen principal es un File object, subirlo primero
      if (formData.imagenPrincipal instanceof File) {
        const formDataImg = new FormData();
        formDataImg.append('imagen', formData.imagenPrincipal);
        
        const responseImg = await productosApi.uploadImagenProducto(formDataImg);
        imagenPrincipalRuta = responseImg.url || responseImg.data?.url || responseImg.ruta || responseImg.data?.ruta;
      } else if (typeof formData.imagenPrincipal === 'string') {
        imagenPrincipalRuta = formData.imagenPrincipal;
      }

      const dataToSubmit = {
        nombreProducto: formData.nombreProducto,
        codigoReferencia: formData.codigoReferencia,
        descripcion: formData.descripcion,
        idCategoria: parseInt(formData.idCategoria),
        idProveedor: formData.idProveedor ? parseInt(formData.idProveedor) : null,
        unidadMedida: formData.unidadMedida,
        precioVentaSugerido: parseInt(formData.precioVenta),
        tieneColores: !!formData.tieneColores,
        tieneTallas: !!formData.tieneTallas,
        imagenPrincipal: imagenPrincipalRuta,
        estado: 'activo'
      };

      if (producto) {
        await productosApi.updateProducto(producto.idProducto, dataToSubmit);
      } else {
        await productosApi.createProducto(dataToSubmit);
      }

      setPasoActual(1);
      setFormData({
        nombreProducto: '',
        codigoReferencia: '',
        descripcion: '',
        idCategoria: '',
        idProveedor: '',
        unidadMedida: 'unidades',
        precioCompra: '',
        precioVenta: '',
        porcentajeGanancia: '',
        tieneColores: false,
        tieneTallas: false,
        imagenPrincipal: null,
        imagenes: [],
        variantes: []
      });

      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.mensaje || err.message || 'Error al guardar el producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (pasoActual) {
      case 1:
        return (
          <WizardStep1
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
          />
        );
      case 2:
        return (
          <WizardStep2
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
          />
        );
      case 3:
        return (
          <WizardStep3
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
          />
        );
      case 4:
        return (
          <WizardStep4
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
          />
        );
      case 5:
        return (
          <WizardStep5
            formData={formData}
            producto={producto}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Elegante */}
        <div className="px-8 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Configuración Maestro</h3>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {producto ? 'Refinar Producto' : 'Nuevo Catálogo'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all hover:rotate-90 group"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          </button>
        </div>

        {/* Indicador de pasos Maestro */}
        <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
            {pasos.map((paso, idx) => {
              const IconoStep = paso.icono;
              const esActivo = paso.id === pasoActual;
              const esCompletado = paso.id < pasoActual;

              return (
                <div key={paso.id} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-2xl font-bold text-sm
                      transition-all duration-500
                      ${esActivo
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110'
                        : esCompletado
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }
                    `}
                    title={paso.titulo}
                  >
                    {esCompletado ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <IconoStep className="w-4 h-4" />
                    )}
                  </div>

                  {idx < pasos.length - 1 && (
                    <div className="flex-1 h-px mx-2 bg-slate-200 dark:bg-slate-800">
                      <div
                        className={`
                          h-full transition-all duration-700
                          ${esCompletado ? 'bg-emerald-500 w-full' : 'bg-transparent w-0'}
                        `}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              Paso {pasoActual}: {pasos[pasoActual - 1].titulo}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              {pasos[pasoActual - 1].descripcion}
            </p>
          </div>
        </div>

        {/* Contenido del paso - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
          {error && (
            <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">{error}</p>
            </div>
          )}

          <div className="animate-fade-in">
            {renderStep()}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-8 py-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={pasoActual === 1}
            className={`
              flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all
              ${pasoActual === 1
                ? 'opacity-0 pointer-events-none'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </button>

          <div className="hidden sm:flex items-center gap-2">
            {pasos.map((p) => (
              <div 
                key={p.id} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${p.id === pasoActual ? 'bg-indigo-600 w-4' : 'bg-slate-200 dark:bg-slate-800'}`} 
              />
            ))}
          </div>

          {pasoActual === pasos.length ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.15em] shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {producto ? 'Actualizar Producto' : 'Crear Producto'}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] hover:bg-black dark:hover:bg-slate-100 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductosWizard;
