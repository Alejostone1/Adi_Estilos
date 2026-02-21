import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  User,
  Search,
  UserPlus,
  RefreshCcw,
  Edit3,
  Eye,
  Wallet,
  History,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  X,
  Plus,
  Filter,
  Download,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usuariosApi } from "../../../api/usuariosApi";
import { rolesApi } from "../../../api/rolesApi";
import { useAuth } from "../../../context/AuthContext";
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import Swal from 'sweetalert2';

export default function UsuariosPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Estados
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');
  
  // Modales/Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    usuario: '',
    correoElectronico: '',
    telefono: '',
    direccion: '',
    idRol: '',
    estado: 'activo',
    contrasena: ''
  });

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [usrRes, rolesRes] = await Promise.all([
        usuariosApi.getUsuarios(),
        rolesApi.getRoles()
      ]);
      setUsuarios(usrRes.datos || usrRes.data || usrRes || []);
      setRoles(rolesRes.datos || rolesRes || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Filtrado
  const filteredUsers = useMemo(() => {
    return usuarios.filter(u => {
      const fullText = `${u.nombres} ${u.apellidos} ${u.usuario} ${u.correoElectronico}`.toLowerCase();
      const matchesSearch = fullText.includes(searchTerm.toLowerCase());
      const matchesRol = filterRol === 'all' || u.rol?.nombreRol === filterRol;
      const matchesEstado = filterEstado === 'all' || u.estado === filterEstado;
      return matchesSearch && matchesRol && matchesEstado;
    });
  }, [usuarios, searchTerm, filterRol, filterEstado]);

  // Handlers
  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setSelectedUser(user);
      setFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        usuario: user.usuario || '',
        correoElectronico: user.correoElectronico || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        idRol: user.rol?.idRol || '',
        estado: user.estado || 'activo',
        contrasena: ''
      });
    } else {
      setIsEditing(false);
      setSelectedUser(null);
      setFormData({
        nombres: '',
        apellidos: '',
        usuario: '',
        correoElectronico: '',
        telefono: '',
        direccion: '',
        idRol: '',
        estado: 'activo',
        contrasena: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (isEditing) {
        delete data.contrasena; // No enviamos contraseña si estamos editando (a menos que haya un campo separado)
        await usuariosApi.updateUsuario(selectedUser.idUsuario, data);
        Swal.fire({
          icon: 'success',
          title: 'Usuario Actualizado',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        await usuariosApi.createUsuario(data);
        Swal.fire({
          icon: 'success',
          title: 'Usuario Creado',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.mensaje || 'Error al guardar el usuario', 'error');
    }
  };

  const toggleEstado = async (user) => {
    const nuevoEstado = user.estado === 'activo' ? 'inactivo' : 'activo';
    const result = await Swal.fire({
      title: '¿Cambiar estado?',
      text: `El usuario pasará a estar ${nuevoEstado}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await usuariosApi.changeEstadoUsuario(user.idUsuario, nuevoEstado);
        cargarDatos();
        Swal.fire('¡Listo!', 'Estado actualizado.', 'success');
      } catch (error) {
        Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
      }
    }
  };

  // UI Components
  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
    };
    return colorMap[color] || colorMap.blue;
  };

  const StatCard = ({ title, value, color, icon: Icon, subtext }) => (
    <div className="card-3d card-elevated bg-white dark:bg-slate-800/60 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 flex items-center gap-6 overflow-hidden relative group">
      <div className={`p-4 rounded-xl ${getColorClasses(color)} relative z-10 transition-transform group-hover:scale-110 duration-300`}>
        <Icon size={28} />
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{value}</p>
        {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 md:p-8 space-y-8 transition-colors duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="admin-h1 flex items-center gap-4">
            <div className="card-3d p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Users size={32} />
            </div>
            Gestión de Usuarios
          </h1>
          <p className="admin-body dark:text-slate-400 mt-2">Administra tus colaboradores y clientes desde un solo lugar.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={cargarDatos}
            className="card-3d p-3 bg-white dark:bg-slate-800/60 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all shadow-sm"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal()}
            className="card-3d card-elevated flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-admin-semibold text-admin-sm shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} />
        </div>
      </div>

      {/* User List / Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-slate-800/30 text-left">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Identidad</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Contacto</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Rol y Perfil</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Actividad</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Estado</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-right border-b border-slate-100 dark:border-slate-700/50">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            <AnimatePresence>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                        <Users size={40} />
        {/* Filters & Tools */}
        <div className="p-6 border-b border-gray-50 dark:border-slate-700/50 flex flex-col lg:flex-row items-center gap-6 justify-between bg-gray-50/30 dark:bg-slate-800/30">
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nombre, correo o @usuario..."
              className="card-3d w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700/40 border-0 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-400 dark:text-white transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="card-3d flex items-center gap-2 bg-white dark:bg-slate-700/40 p-1.5 rounded-2xl shadow-sm">
              <select 
                className="bg-transparent border-none text-sm font-semibold text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer px-3 py-1.5"
                value={filterRol}
                onChange={(e) => setFilterRol(e.target.value)}
              >
                <option value="all">Todos los Roles</option>
                {roles.map(r => <option key={r.idRol} value={r.nombreRol}>{r.nombreRol}</option>)}
              </select>
              <div className="w-px h-6 bg-gray-100 dark:bg-gray-800" />
              <select 
                className="bg-transparent border-none text-sm font-semibold text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer px-3 py-1.5"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="all">Cualquier Estado</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>
            
            <button className="hidden md:flex items-center gap-2 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-700/30 dark:hover:bg-slate-700/50 rounded-xl transition-colors font-admin-medium">
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>

        {/* User List / Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/30 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Identidad</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Contacto</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Rol y Perfil</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Actividad</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700/50">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-right border-b border-slate-100 dark:border-slate-700/50">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              <AnimatePresence>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                          <Users size={40} />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron usuarios con esos filtros.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <motion.tr 
                      key={u.idUsuario}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`card-3d w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${u.estado === 'activo' ? 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-blue-200/50 dark:shadow-none' : 'bg-gray-400'}`}>
                            {u.nombres?.charAt(0)}{u.apellidos?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{u.nombres} {u.apellidos}</div>
                            <div className="text-xs font-mono text-gray-400 dark:text-gray-500">@{u.usuario}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Mail size={14} className="text-indigo-500" />
                            {u.correoElectronico}
                          </div>
                          {u.telefono && (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <Phone size={14} className="text-emerald-500" />
                              {u.telefono}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight
                          ${u.rol?.nombreRol === 'Administrador' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                            u.rol?.nombreRol === 'Vendedor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                          <Shield size={12} />
                          {u.rol?.nombreRol}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <ShoppingBag size={18} className="text-indigo-400" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">{u._count?.ventasComoCliente || 0}</span>
                          </div>
                          <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
                          <div className="flex flex-col items-center">
                            <Wallet size={18} className={u.resumenCredito?.saldoTotal > 0 ? 'text-amber-500' : 'text-gray-300'} />
                            <span className={`text-xs font-bold mt-1 ${u.resumenCredito?.saldoTotal > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                              {u.resumenCredito?.saldoTotal > 0 ? 'Con Deuda' : 'Al día'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button 
                          onClick={() => toggleEstado(u)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all
                          ${u.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-2 ring-emerald-50 dark:ring-0' : 
                            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 ring-2 ring-rose-50 dark:ring-0'}`}
                        >
                          {u.estado}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedUser(u); setIsDetailsOpen(true); }}
                            className="card-3d p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="Ver Perfil"
                          >
                            <Eye size={18} />
                          </motion.button>
                          
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleOpenModal(u)}
                            className="card-3d p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={18} />
                          </motion.button>
                          
                          <div className="w-px h-6 bg-gray-100 dark:bg-slate-600/50 mx-1" />
                          
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/admin/usuarios/${u.idUsuario}/ventas`)}
                            className="card-3d p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                            title="Ver Ventas"
                          >
                            <History size={18} />
                          </motion.button>
                          
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/admin/usuarios/${u.idUsuario}/creditos`)}
                            className="card-3d p-2 text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                            title="Ver Créditos"
                          >
                            <CreditCard size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-700/50 flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Mostrando <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredUsers.length}</span> de <span className="font-bold">{usuarios.length}</span> registros totales
            </p>
            <div className="flex gap-2">
              <button disabled className="card-3d px-4 py-2 bg-white dark:bg-slate-800/40 rounded-xl text-sm font-bold text-gray-400 dark:text-gray-600 disabled:cursor-not-allowed">Anterior</button>
              <button disabled className="card-3d px-4 py-2 bg-white dark:bg-slate-800/40 rounded-xl text-sm font-bold text-gray-400 dark:text-gray-600 disabled:cursor-not-allowed">Siguiente</button>
            </div>
        </div>
      </div>

      {/* --- FORM MODAL (Modern Drawer) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-3 md:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="card-3d w-full max-w-4xl max-h-[95vh] bg-white dark:bg-slate-800/90 shadow-2xl overflow-hidden rounded-2xl md:rounded-3xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 md:px-8 md:py-8 text-white shrink-0">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all text-white/80 hover:text-white"
                >
                  <X size={20} />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
                    {isEditing ? (
                      <span className="text-2xl md:text-3xl font-bold">{formData.nombres?.charAt(0)}{formData.apellidos?.charAt(0)}</span>
                    ) : (
                      <UserPlus size={28} className="md:w-8 md:h-8" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">
                      {isEditing ? 'Actualizar Información' : 'Nuevo Usuario'}
                    </h2>
                    <p className="text-indigo-100 text-sm mt-0.5">
                      {isEditing ? 'Modifica los datos del colaborador o cliente' : 'Registra un nuevo colaborador o cliente'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="p-4 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-y-auto">
                
                {/* Section: Datos Personales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base">Datos Personales</h3>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/50 ml-2"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombres */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">Nombres *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          required
                          type="text" 
                          className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all text-sm"
                          placeholder="Ej: Juan Camilo"
                          value={formData.nombres}
                          onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Apellidos */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">Apellidos *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          required
                          type="text" 
                          className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all text-sm"
                          placeholder="Ej: Pérez García"
                          value={formData.apellidos}
                          onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">Dirección de Domicilio</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all text-sm"
                        placeholder="Calle, Carrera, Barrio, Ciudad..."
                        value={formData.direccion}
                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Credenciales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <Shield size={16} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base">Credenciales de Acceso</h3>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/50 ml-2"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Usuario */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">@Usuario (Login) *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                        <input 
                          required
                          type="text" 
                          className="w-full pl-8 pr-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all text-sm font-mono"
                          placeholder="nombre_usuario"
                          value={formData.usuario}
                          onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">Correo Electrónico *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          required
                          type="email" 
                          className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all text-sm"
                          placeholder="usuario@ejemplo.com"
                          value={formData.correoElectronico}
                          onChange={(e) => setFormData({...formData, correoElectronico: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contraseña (solo en creación) */}
                  {!isEditing && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">Contraseña *</label>
                      <div className="relative">
                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          required
                          type="password" 
                          className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all text-sm"
                          placeholder="Mínimo 8 caracteres"
                          value={formData.contrasena}
                          onChange={(e) => setFormData({...formData, contrasena: e.target.value})}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 ml-1">El usuario podrá cambiarla después de su primer ingreso.</p>
                    </div>
                  )}
                </div>

                {/* Section: Permisos y Contacto */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Phone size={16} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base">Perfil y Contacto</h3>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/50 ml-2"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rol */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">Perfil / Rol *</label>
                      <div className="relative">
                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                          required
                          className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all text-sm appearance-none cursor-pointer"
                          value={formData.idRol}
                          onChange={(e) => setFormData({...formData, idRol: e.target.value})}
                        >
                          <option value="">Selecciona un perfil...</option>
                          {roles.map(r => <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>)}
                        </select>
                        <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">Teléfono Móvil</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="tel" 
                          className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all text-sm"
                          placeholder="300 000 0000"
                          value={formData.telefono}
                          onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Estado Toggle */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={formData.estado === 'activo'}
                          onChange={(e) => setFormData({...formData, estado: e.target.checked ? 'activo' : 'inactivo'})}
                        />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Usuario Activo</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Permitir inmediatamente el ingreso al sistema</p>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        formData.estado === 'activo' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {formData.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Action Buttons - Centered */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600/60 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-900/30 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Edit3 size={16} />
                    {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DETAILS MODAL --- */}
      <AnimatePresence>
        {isDetailsOpen && selectedUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-3 md:p-4 lg:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="card-3d w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] bg-white dark:bg-slate-800/60 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden relative border border-slate-200 dark:border-slate-700/50 flex flex-col"
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-lg md:text-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none">
                    {selectedUser.nombres?.charAt(0)}{selectedUser.apellidos?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">{selectedUser.nombres} {selectedUser.apellidos}</h2>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">@{selectedUser.usuario}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  
                  {/* Left Panel - Profile Summary */}
                  <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-blue-700 p-4 md:p-6 lg:p-8 text-white">
                    
                    {/* Role Badge */}
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs md:text-sm font-medium flex items-center gap-2">
                        <Shield size={14} />
                        {selectedUser.rol?.nombreRol}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        selectedUser.estado === 'activo' 
                          ? 'bg-emerald-400/30 text-emerald-100' 
                          : 'bg-rose-400/30 text-rose-100'
                      }`}>
                        {selectedUser.estado}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-black/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-1 md:mb-2">
                          <ShoppingBag size={16} className="text-indigo-200" />
                          <span className="text-[10px] md:text-xs text-indigo-200 uppercase tracking-wide">Compras</span>
                        </div>
                        <p className="text-xl md:text-2xl font-semibold">{selectedUser._count?.ventasComoCliente || 0}</p>
                      </div>
                      <div className="bg-black/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-1 md:mb-2">
                          <Wallet size={16} className={selectedUser.resumenCredito?.saldoTotal > 0 ? 'text-amber-300' : 'text-emerald-300'} />
                          <span className="text-[10px] md:text-xs text-indigo-200 uppercase tracking-wide">Saldo</span>
                        </div>
                        <p className={`text-lg md:text-xl font-semibold ${selectedUser.resumenCredito?.saldoTotal > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                          <PrecioFormateado precio={selectedUser.resumenCredito?.saldoTotal || 0} />
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions Mobile */}
                    <div className="lg:hidden grid grid-cols-2 gap-2 mb-4">
                      <button 
                        onClick={() => navigate(`/admin/usuarios/${selectedUser.idUsuario}/ventas`)}
                        className="py-2.5 px-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-xs md:text-sm font-medium text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <History size={14} />
                        Ventas
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/usuarios/${selectedUser.idUsuario}/creditos`)}
                        className="py-2.5 px-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-xs md:text-sm font-medium text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <CreditCard size={14} />
                        Créditos
                      </button>
                    </div>

                    {/* Edit Button */}
                    <button 
                      onClick={() => { setIsDetailsOpen(false); handleOpenModal(selectedUser); }}
                      className="w-full py-3 md:py-4 bg-white text-indigo-700 rounded-xl md:rounded-2xl font-semibold shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 size={18} />
                      Editar Perfil
                    </button>
                  </div>

                  {/* Right Panel - Contact Info */}
                  <div className="lg:col-span-2 p-4 md:p-6 lg:p-8 bg-white dark:bg-slate-800/50">
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Información de Contacto
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {/* Email */}
                      <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl md:rounded-2xl">
                        <div className="p-2 md:p-2.5 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg md:rounded-xl shrink-0">
                          <Mail size={18} className="md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Correo electrónico</p>
                          <p className="text-sm md:text-base font-medium text-slate-900 dark:text-slate-200 truncate">{selectedUser.correoElectronico}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl md:rounded-2xl">
                        <div className="p-2 md:p-2.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg md:rounded-xl shrink-0">
                          <Phone size={18} className="md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Teléfono / WhatsApp</p>
                          <p className="text-sm md:text-base font-medium text-slate-900 dark:text-slate-200">
                            {selectedUser.telefono || <span className="text-slate-400 italic">No registrado</span>}
                          </p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl md:rounded-2xl">
                        <div className="p-2 md:p-2.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg md:rounded-xl shrink-0">
                          <MapPin size={18} className="md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Dirección</p>
                          <p className="text-sm md:text-base font-medium text-slate-900 dark:text-slate-200">
                            {selectedUser.direccion || <span className="text-slate-400 italic">No registrada</span>}
                          </p>
                        </div>
                      </div>

                      {/* Registration Date */}
                      <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl md:rounded-2xl">
                        <div className="p-2 md:p-2.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg md:rounded-xl shrink-0">
                          <Calendar size={18} className="md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Fecha de registro</p>
                          <p className="text-sm md:text-base font-medium text-slate-900 dark:text-slate-200">
                            {new Date(selectedUser.creadoEn).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Quick Actions */}
                    <div className="hidden lg:block mt-6 md:mt-8">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                        <History size={16} className="text-indigo-500" />
                        Accesos Rápidos
                      </h4>
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <button 
                          onClick={() => navigate(`/admin/usuarios/${selectedUser.idUsuario}/ventas`)}
                          className="card-3d py-3 md:py-4 px-4 md:px-6 bg-white dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl md:rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                              <History size={16} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Historial Ventas</span>
                          </div>
                          <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/usuarios/${selectedUser.idUsuario}/creditos`)}
                          className="card-3d py-3 md:py-4 px-4 md:px-6 bg-white dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl md:rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                              <CreditCard size={16} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Gestión Créditos</span>
                          </div>
                          <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}