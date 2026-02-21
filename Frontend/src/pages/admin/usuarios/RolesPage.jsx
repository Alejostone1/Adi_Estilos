import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Users,
  Info,
  ChevronRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Search,
  Layout,
  UserCheck,
  Package,
  ShoppingCart,
  TrendingUp,
  Globe,
  RefreshCcw,
  X,
  AlertTriangle,
  Settings,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rolesApi } from '../../../api/rolesApi';
import Swal from 'sweetalert2';

// Mapeo de iconos para categorias
const ICONOS_CATEGORIAS = {
  'Dashboard': <Layout size={18} />,
  'Usuarios y Seguridad': <Shield size={18} />,
  'Catálogo de Productos': <Package size={18} />,
  'Ventas y Cobranzas': <ShoppingCart size={18} />,
  'Compras e Inventario': <Grid size={18} />,
  'Reportes y Análisis': <TrendingUp size={18} />,
  'E-commerce (Cliente)': <Globe size={18} />
};

export default function RolesPage() {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombreRol: '',
    descripcion: '',
    activo: true,
    permisos: {}
  });

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesRes, permisosRes] = await Promise.all([
        rolesApi.getRoles(),
        rolesApi.getAvailablePermissions()
      ]);
      setRoles(rolesRes.datos || []);
      setAvailablePermissions(permisosRes.datos || []);
    } catch (error) {
      console.error('Error cargando roles:', error);
      Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Agrupar permisos
  const permisosAgrupados = useMemo(() => {
    return availablePermissions.reduce((acc, curr) => {
      const cat = curr.categoria || 'Otros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(curr);
      return acc;
    }, {});
  }, [availablePermissions]);

  // Handlers
  const handleOpenDrawer = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        nombreRol: role.nombreRol,
        descripcion: role.descripcion || '',
        activo: role.activo,
        permisos: role.permisos || {}
      });
    } else {
      setEditingRole(null);
      setFormData({
        nombreRol: '',
        descripcion: '',
        activo: true,
        permisos: {}
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingRole) {
        await rolesApi.updateRole(editingRole.idRol, formData);
        Swal.fire({
          icon: 'success',
          title: 'Perfil de Seguridad Actualizado',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        await rolesApi.createRole(formData);
        Swal.fire({
          icon: 'success',
          title: 'Nuevo Perfil Creado',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
      setIsDrawerOpen(false);
      cargarDatos();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.mensaje || 'Error al guardar el rol', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role) => {
    const result = await Swal.fire({
      title: '¿Eliminar perfil?',
      text: `El rol "${role.nombreRol}" será eliminado permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await rolesApi.deleteRole(role.idRol);
        cargarDatos();
        Swal.fire('Eliminado', 'El rol ha sido removido.', 'success');
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar. Verifique si hay usuarios asociados.', 'error');
      }
    }
  };

  const toggleStatus = async (role) => {
    try {
      await rolesApi.toggleRoleStatus(role.idRol, !role.activo);
      cargarDatos();
      Swal.fire({
        icon: 'success',
        title: `Perfil ${!role.activo ? 'Activado' : 'Suspendido'}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
    }
  };

  const grantFullAccess = () => {
    const allFull = {};
    availablePermissions.forEach(p => {
      allFull[p.clave] = p.tipo === 'boolean' ? true : 'full';
    });
    setFormData({ ...formData, permisos: allFull });
    Swal.fire({
        icon: 'info',
        title: 'Acceso Total Concedido',
        text: 'Se han marcado todos los módulos con privilegios máximos.',
        timer: 1500,
        showConfirmButton: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6 md:p-10 space-y-10 transition-colors duration-300">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 md:gap-8">
        <div className="space-y-3 md:space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] md:text-xs font-admin-bold uppercase tracking-widest">
              <Lock size={12} className="md:w-3.5 md:h-3.5" />
              Gobernanza de Datos
           </div>
           <h1 className="admin-h1">
              Roles y Seguridad
           </h1>
           <p className="admin-body dark:text-slate-400 max-w-2xl">
              Administra privilegios granulares. Define con precisión qué puede ver y hacer cada integrante de la organización.
           </p>
        </div>

        <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto">
           <button 
             onClick={cargarDatos}
             className="card-3d p-3 md:p-4 bg-white dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 rounded-2xl md:rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all border border-slate-100 dark:border-slate-700/50 shadow-sm"
           >
             <RefreshCcw size={20} className={`md:w-6 md:h-6 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button 
             onClick={() => handleOpenDrawer()}
             className="flex-1 lg:flex-none card-3d card-elevated px-4 py-3 md:px-8 md:py-4 bg-indigo-600 text-white rounded-2xl md:rounded-[2rem] font-admin-semibold text-sm md:text-lg shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 md:gap-3"
           >
             <Plus size={20} className="md:w-6 md:h-6" />
             <span className="hidden sm:inline">Crear Nuevo Perfil</span>
             <span className="sm:hidden">Nuevo Perfil</span>
           </button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <AnimatePresence>
          {roles.map((role, idx) => (
            <motion.div 
              key={role.idRol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`card-3d card-elevated relative group bg-white dark:bg-slate-800/60 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all overflow-hidden ${!role.activo ? 'grayscale opacity-75' : ''}`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 md:top-8 md:right-8">
                 <button 
                    onClick={() => toggleStatus(role)}
                    className={`px-2.5 py-1 md:px-3 md:py-1 rounded-full text-[10px] font-admin-bold uppercase tracking-wide transition-all ${role.activo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}
                 >
                    {role.activo ? 'Activo' : 'Suspendido'}
                 </button>
              </div>

              {/* Icon & Title */}
              <div className="flex items-start gap-3 md:gap-5 mb-6 md:mb-8">
                <div className={`p-3 md:p-4 rounded-2xl md:rounded-3xl ${role.nombreRol === 'Administrador' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'}`}>
                  <Shield size={22} className="md:w-7 md:h-7" />
                </div>
                <div>
                   <h3 className="text-base md:text-xl font-admin-semibold text-slate-900 dark:text-white leading-tight">{role.nombreRol}</h3>
                   <div className="flex items-center gap-2 text-slate-400 font-admin-medium text-[10px] md:text-xs mt-1">
                      <Users size={12} className="md:w-3.5 md:h-3.5" />
                      {role._count?.usuarios || 0} Usuarios asignados
                   </div>
                </div>
              </div>

              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm line-clamp-2 h-8 md:h-10 mb-6 md:mb-8 font-admin-medium italic">
                {role.descripcion || 'Sin descripción técnica del perfil.'}
              </p>

              {/* Progress Summary */}
              <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-admin-bold text-indigo-500 uppercase tracking-wide">Cobertura de Privilegios</span>
                    <span className="text-lg md:text-xl font-admin-semibold text-slate-900 dark:text-white">
                        {Object.values(role.permisos || {}).filter(v => v !== false && v !== 'none').length} / {availablePermissions.length}
                    </span>
                 </div>
                 <div className="w-full h-2 md:h-3 bg-slate-100 dark:bg-slate-700/40 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(Object.values(role.permisos || {}).filter(v => v !== false && v !== 'none').length / availablePermissions.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full"
                    />
                 </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 md:gap-3">
                 <button 
                  onClick={() => { setViewingRole(role); setIsViewDrawerOpen(true); }}
                  className="card-3d flex-1 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 rounded-xl md:rounded-2xl font-admin-semibold text-xs md:text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
                 >
                    <Eye size={16} className="md:w-[18px] md:h-[18px]" />
                    <span className="hidden sm:inline">Ver</span>
                 </button>
                 <button 
                  onClick={() => handleOpenDrawer(role)}
                  className="card-3d p-2.5 md:p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl md:rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-all"
                 >
                    <Edit2 size={18} className="md:w-5 md:h-5" />
                 </button>
                 {role.nombreRol !== 'Administrador' && (
                    <button 
                        onClick={() => handleDelete(role)}
                        className="card-3d p-2.5 md:p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl md:rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-800 transition-all"
                    >
                        <Trash2 size={18} className="md:w-5 md:h-5" />
                    </button>
                 )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- MODAL EDITOR (Full Matrix) --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/50 dark:bg-black/80 backdrop-blur-md p-0 md:p-4 lg:p-6">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 150 }}
              className="w-full max-w-4xl h-full bg-gray-50 dark:bg-slate-900 shadow-2xl overflow-hidden md:rounded-2xl lg:rounded-3xl flex flex-col border-l border-white/10"
            >
              {/* Header */}
              <div className="p-4 md:p-6 lg:p-8 card-3d bg-white dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between sticky top-0 z-10">
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-3 bg-indigo-600 text-white rounded-xl md:rounded-2xl shrink-0">
                       <Settings size={20} className="md:w-6 md:h-6 animate-[spin_30s_linear_infinite]" />
                    </div>
                    <div>
                       <h2 className="text-lg md:text-xl lg:text-2xl font-admin-semibold text-slate-900 dark:text-white">
                         {editingRole ? 'Ajustar Matriz de Seguridad' : 'Nueva Configuración de Acceso'}
                       </h2>
                       <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">Define los límites y capacidades de este perfil</p>
                    </div>
                 </div>
                 <button onClick={() => setIsDrawerOpen(false)} className="card-3d p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl md:rounded-2xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0">
                    <X size={20} className="md:w-6 md:h-6" />
                 </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
                
                {/* Basic Info */}
                <div className="card-3d bg-white dark:bg-slate-800/60 p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-4 md:space-y-6">
                   <h4 className="text-xs md:text-sm font-admin-bold uppercase tracking-wide text-indigo-500 flex items-center gap-2">
                       <Info size={14} /> Identidad del Perfil
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-1.5 md:space-y-2">
                         <label className="text-xs md:text-sm font-admin-medium text-slate-700 dark:text-slate-300 ml-1">Nombre Descriptivo</label>
                         <input 
                            required
                            disabled={editingRole?.nombreRol === 'Administrador'}
                            className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all font-admin-semibold text-sm disabled:opacity-50"
                            placeholder="Ej: Operador de Punto de Venta"
                            value={formData.nombreRol}
                            onChange={(e) => setFormData({...formData, nombreRol: e.target.value})}
                         />
                      </div>
                      <div className="flex flex-col justify-end">
                         <label className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl md:rounded-2xl cursor-pointer border border-indigo-100/50 dark:border-indigo-800/20 group">
                            <input 
                                type="checkbox"
                                disabled={editingRole?.nombreRol === 'Administrador'}
                                className="w-5 h-5 md:w-6 md:h-6 rounded-lg text-indigo-600 focus:ring-indigo-500"
                                checked={formData.activo}
                                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                            />
                            <div>
                                <span className="block font-admin-semibold text-sm text-indigo-700 dark:text-indigo-400">Perfil Habilitado</span>
                                <span className="text-[10px] text-indigo-400 font-admin-bold uppercase tracking-tight">Estado de uso</span>
                            </div>
                         </label>
                      </div>
                   </div>
                   <div className="space-y-1.5 md:space-y-2">
                      <label className="text-xs md:text-sm font-admin-medium text-slate-700 dark:text-slate-300 ml-1">Descripción de Responsabilidades</label>
                      <textarea 
                        rows="2"
                        className="card-3d w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 dark:bg-slate-700/40 border-0 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all font-admin-medium resize-none shadow-inner text-sm"
                        placeholder="Define para qué se usará este rol..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      />
                   </div>
                </div>

                {/* Matrix Header */}
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-6">
                   <div>
                      <h4 className="text-base md:text-lg lg:text-xl font-admin-semibold text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
                         <Lock className="text-indigo-500" size={18} /> Matriz de Privilegios
                      </h4>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-admin-medium">Configura el acceso granular módulo por módulo.</p>
                   </div>
                   <button 
                    type="button"
                    onClick={grantFullAccess}
                    className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white dark:bg-slate-800 border-2 border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl md:rounded-2xl font-admin-semibold text-xs md:text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all hover:border-solid hover:border-indigo-500"
                   >
                     <Unlock size={16} className="md:w-5 md:h-5" /> Entregar Acceso Total
                   </button>
                </div>

                {/* Categories */}
                <div className="space-y-4 md:space-y-6 lg:space-y-8 pb-16 md:pb-20">
                   {Object.entries(permisosAgrupados).map(([cat, permisos], cIdx) => (
                     <motion.div 
                        key={cat}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-slate-800/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden"
                     >
                        <div className="p-3 md:p-4 lg:p-6 bg-slate-50/50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2 md:gap-3">
                           <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-indigo-500 shadow-sm">
                              {ICONOS_CATEGORIAS[cat]}
                           </div>
                           <h5 className="font-admin-semibold text-slate-900 dark:text-white tracking-tight uppercase text-xs md:text-sm">{cat}</h5>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                           {permisos.map(p => (
                             <div key={p.clave} className="p-3 md:p-4 lg:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                                   <div className="flex-1 min-w-0">
                                      <div className="text-sm md:text-base font-admin-semibold text-slate-800 dark:text-white">{p.modulo}</div>
                                      <p className="text-[10px] md:text-xs font-admin-medium text-slate-500 dark:text-slate-400 mt-0.5">{p.descripcion || p.label}</p>
                                   </div>
                                   
                                   <div className="flex gap-2 shrink-0">
                                      {p.tipo === 'boolean' ? (
                                         <label className="flex items-center gap-1.5 md:gap-2 bg-slate-100 dark:bg-slate-700 p-1 md:p-1.5 rounded-lg md:rounded-xl cursor-pointer">
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({ ...formData, permisos: { ...formData.permisos, [p.clave]: true } })}
                                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs font-admin-bold transition-all ${formData.permisos[p.clave] === true ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                            >SÍ</button>
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({ ...formData, permisos: { ...formData.permisos, [p.clave]: false } })}
                                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs font-admin-bold transition-all ${!formData.permisos[p.clave] ? 'bg-white dark:bg-slate-600 text-slate-700 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                            >NO</button>
                                         </label>
                                      ) : (
                                         <div className="flex bg-slate-100 dark:bg-slate-700 p-1 md:p-1.5 rounded-xl md:rounded-2xl gap-1">
                                            {p.opciones.map(opt => {
                                                const isActive = formData.permisos[p.clave] === opt.value;
                                                return (
                                                    <button 
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, permisos: { ...formData.permisos, [p.clave]: opt.value } })}
                                                        className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-admin-bold uppercase tracking-tight transition-all ${isActive ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                         </div>
                                      )}
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </motion.div>
                   ))}
                </div>
              </form>

              {/* Action Footer */}
              <div className="p-4 md:p-6 lg:p-8 card-3d bg-white dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700/50 flex gap-3 md:gap-4 sticky bottom-0 z-10">
                 <button 
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="card-3d flex-1 py-3 md:py-4 bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 rounded-xl md:rounded-2xl font-admin-semibold text-sm md:text-base hover:bg-slate-200 dark:hover:bg-slate-600/60 transition-all"
                 > Descartar </button>
                 <button 
                    type="submit"
                    onClick={handleSave}
                    disabled={submitting}
                    className="card-3d card-elevated flex-[2] py-3 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-admin-semibold text-base md:text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-700 dark:hover:bg-indigo-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50"
                 >
                    {submitting ? 'Procesando...' : (editingRole ? 'Guardar Cambios' : 'Finalizar Creación')}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- QUICK VIEW DRAWER --- */}
      <AnimatePresence>
        {isViewDrawerOpen && viewingRole && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-3 md:p-4 lg:p-6">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               transition={{ type: 'spring', damping: 25, stiffness: 300 }}
               className="card-3d w-full max-w-2xl bg-white dark:bg-slate-800/90 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] border border-slate-200 dark:border-slate-700/50"
             >
                {/* Header */}
                <div className="p-4 md:p-6 lg:p-8 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                   <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg">
                         <UserCheck size={22} className="md:w-6 md:h-6" />
                      </div>
                      <div>
                         <h3 className="text-base md:text-lg lg:text-xl font-admin-semibold">{viewingRole.nombreRol}</h3>
                         <p className="text-emerald-100 text-[10px] md:text-xs font-admin-medium uppercase tracking-wide">Resumen de Atribuciones</p>
                      </div>
                   </div>
                   <button onClick={() => setIsViewDrawerOpen(false)} className="p-2 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all text-white/80 hover:text-white">
                      <X size={20} className="md:w-6 md:h-6" />
                   </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
                   {Object.entries(permisosAgrupados).map(([cat, permisos]) => (
                     <div key={cat} className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 text-indigo-500 mb-2 md:mb-3">
                           {ICONOS_CATEGORIAS[cat]}
                           <span className="text-[10px] md:text-xs font-admin-bold uppercase tracking-wide">{cat}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                           {permisos.map(p => {
                             const valor = viewingRole.permisos[p.clave];
                             const active = valor && valor !== 'none' && valor !== false;
                             return (
                               <div key={p.clave} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border flex items-center justify-between group transition-all ${active ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800' : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-700/50 opacity-60'}`}>
                                  <div className="min-w-0 flex-1 mr-2">
                                     <div className={`text-xs md:text-sm font-admin-semibold truncate ${active ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{p.modulo}</div>
                                     <div className="text-[10px] font-admin-medium text-slate-400 dark:text-slate-500">{optLabel(p, valor)}</div>
                                  </div>
                                  {active ? (
                                    <div className="bg-indigo-500 text-white p-1 md:p-1.5 rounded-lg shrink-0">
                                       <CheckCircle2 size={12} className="md:w-4 md:h-4" />
                                    </div>
                                  ) : (
                                    <div className="text-slate-300 dark:text-slate-600 shrink-0">
                                       <X size={12} className="md:w-4 md:h-4" />
                                    </div>
                                  )}
                               </div>
                             );
                           })}
                        </div>
                     </div>
                   ))}
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 lg:p-8 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-700/30">
                   <button 
                    onClick={() => { setIsViewDrawerOpen(false); handleOpenDrawer(viewingRole); }}
                    className="w-full py-3 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-admin-semibold text-sm md:text-base shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                   >
                      <Edit2 size={16} className="md:w-5 md:h-5" />
                      Modificar Privilegios
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helpers
function optLabel(meta, val) {
    if (!val || val === 'none' || val === false) return 'SIN ACCESO';
    if (val === true) return 'ACCESO TOTAL (B)';
    if (meta.tipo === 'radio') {
        return meta.opciones.find(o => o.value === val)?.label?.toUpperCase() || val;
    }
    return val.toUpperCase();
}
