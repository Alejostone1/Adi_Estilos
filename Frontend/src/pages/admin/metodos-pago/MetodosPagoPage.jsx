import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Info,
  Layers,
  Search,
  RefreshCcw,
  ShieldCheck,
  Settings2,
  AlertCircle
} from 'lucide-react';
import { metodosPagoApi } from '../../../api/metodosPagoApi';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MetodosPagoPage: Refactorizada para un perfil corporativo y limpio.
 * Utiliza tipografía balanceada, radios profesionales y animaciones estables.
 */
const MetodosPagoPage = () => {
  const [metodos, setMetodos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMetodo, setEditingMetodo] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const hasFetched = useRef(false);
  
  const [formData, setFormData] = useState({
    nombreMetodo: '',
    descripcion: '',
    idTipoMetodo: '',
    requiereReferencia: false
  });

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resMetodos, resTipos] = await Promise.all([
        metodosPagoApi.obtenerTodos(),
        metodosPagoApi.obtenerTipos()
      ]);
      setMetodos(resMetodos.datos || []);
      setTipos(resTipos.datos || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire('Error', 'No se pudieron cargar los métodos de pago', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (metodo = null) => {
    if (metodo) {
      setEditingMetodo(metodo);
      setFormData({
        nombreMetodo: metodo.nombreMetodo,
        descripcion: metodo.descripcion || '',
        idTipoMetodo: metodo.idTipoMetodo,
        requiereReferencia: metodo.requiereReferencia
      });
    } else {
      setEditingMetodo(null);
      setFormData({
        nombreMetodo: '',
        descripcion: '',
        idTipoMetodo: '',
        requiereReferencia: false
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMetodo) {
        await metodosPagoApi.actualizar(editingMetodo.idMetodoPago, formData);
        Swal.fire({
            title: 'Actualizado',
            text: 'Método de pago actualizado correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
      } else {
        await metodosPagoApi.crear(formData);
        Swal.fire({
            title: 'Creado',
            text: 'Nuevo método de pago registrado',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
      }
      setShowModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar:', error);
      Swal.fire('Error', error.response?.data?.msg || 'Error al procesar la solicitud', 'error');
    }
  };

  const confirmarEliminacion = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "El método de pago será desactivado del sistema.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      borderRadius: '20px'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await metodosPagoApi.eliminar(id);
          Swal.fire('¡Desactivado!', 'El método de pago ha sido desactivado.', 'success');
          cargarDatos();
        } catch (error) {
          Swal.fire('Error', 'No se pudo desactivar el método.', 'error');
        }
      }
    });
  };

  const metodosFiltrados = metodos.filter(m => 
    m.nombreMetodo.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.tipoMetodo?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pasarelas de Pago</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Configura los canales de recepción de ingresos.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Buscar pasarela..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all text-sm font-medium"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" />
            Nueva Pasarela
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Sincronizando pasarelas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout' initial={false}>
            {metodosFiltrados.map((metodo) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={metodo.idMetodoPago}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800 overflow-hidden h-full flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    metodo.tipoMetodo?.codigo === 'efectivo' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                    metodo.tipoMetodo?.codigo === 'tarjeta_credito' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                    metodo.tipoMetodo?.codigo === 'transferencia' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' :
                    'bg-slate-50 text-slate-600 dark:bg-slate-800'
                  }`}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(metodo)}
                      className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => confirmarEliminacion(metodo.idMetodoPago)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1 block">Pasarela Administrativa</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate uppercase tracking-tight">{metodo.nombreMetodo}</h3>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 min-h-[2.5rem] leading-relaxed">
                    {metodo.descripcion || 'Sin instrucciones adicionales configuradas.'}
                  </p>

                  <div className="pt-6 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tipo</span>
                      <div className="flex items-center gap-2">
                        <Layers className="h-3 w-3 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{metodo.tipoMetodo?.nombre}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Validación</span>
                      <div className="flex items-center gap-1.5">
                        {metodo.requiereReferencia ? (
                          <>
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded uppercase">Ref. Obligatoria</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Sin referencia</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {metodosFiltrados.length === 0 && !loading && (
             <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <XCircle className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold dark:text-white uppercase">Sin coincidencias</h3>
                <p className="text-slate-400 text-sm mt-1">No hay pasarelas que coincidan con la búsqueda.</p>
             </div>
          )}
        </div>
      )}

      {/* Modal Premium */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 md:p-10 flex-1 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
                      <Settings2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                        {editingMetodo ? 'Actualizar Pasarela' : 'Configurar Pasarela'}
                      </h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gestión de Cobranza</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-red-500 transition-colors">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre Comercial</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500/20 rounded-xl focus:ring-4 focus:ring-indigo-500/5 dark:text-white transition-all font-semibold placeholder:text-slate-300"
                      placeholder="Ej. Transferencia Bancaria, Efectivo..."
                      value={formData.nombreMetodo}
                      onChange={(e) => setFormData({...formData, nombreMetodo: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tipo de Origen</label>
                      <select 
                        required
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-4 focus:ring-indigo-500/5 dark:text-white transition-all font-semibold appearance-none cursor-pointer"
                        value={formData.idTipoMetodo}
                        onChange={(e) => setFormData({...formData, idTipoMetodo: e.target.value})}
                      >
                        <option value="">Seleccionar tipo...</option>
                        {tipos.map(t => (
                          <option key={t.idTipoMetodo} value={t.idTipoMetodo}>{t.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col justify-end pb-3 pl-1">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            className="hidden"
                            checked={formData.requiereReferencia}
                            onChange={(e) => setFormData({...formData, requiereReferencia: e.target.checked})}
                          />
                          <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            formData.requiereReferencia ? 'bg-indigo-600 border-indigo-600 shadow-sm' : 'border-slate-200 dark:border-slate-700'
                          }`}>
                            {formData.requiereReferencia && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Exigir Referencia</span>
                       </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Instrucciones Operativas</label>
                    <textarea 
                      rows="3"
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-4 focus:ring-indigo-500/5 dark:text-white transition-all font-semibold placeholder:text-slate-300 resize-none"
                      placeholder="Indica al personal qué datos registrar para este método..."
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex items-center justify-center gap-3 shadow-md transition-all active:scale-95 text-sm uppercase tracking-wider"
                    >
                      {editingMetodo ? 'Guardar cambios' : 'Instalar pasarela'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MetodosPagoPage;
