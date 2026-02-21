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
        delete data.contrasena;
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

  const StatCard = ({ title, value, color, icon: Icon, subtext, trend }) => {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
        <div className="flex justify-between items-start mb-3">
          <div className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors">
            <Icon size={18} strokeWidth={1.5} />
          </div>
          {trend && (
            <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
              {trend}
            </span>
          )}
        </div>
        <div className="space-y-0.5">
          <h3 className="text-2xl font-light text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {title}
          </p>
        </div>
        {subtext && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 italic">
              {subtext}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Human-Centric Mobile User Card
  const MobileUserCard = ({ user, idx }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user.nombres?.[0]}{user.apellidos?.[0]}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{user.nombres} {user.apellidos}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{user.usuario}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
          user.estado === 'activo' 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
        }`}>
          {user.estado}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Mail size={14} className="text-indigo-500" />
          {user.correoElectronico}
        </div>
        {user.telefono && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Phone size={14} className="text-emerald-500" />
            {user.telefono}
          </div>
        )}
      </div>

      {/* Role Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight
          ${user.rol?.nombreRol === 'Administrador' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
            user.rol?.nombreRol === 'Vendedor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
          <Shield size={12} />
          {user.rol?.nombreRol}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-center">
          <ShoppingBag size={16} className="text-indigo-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900 dark:text-white">{user._count?.ventasComoCliente || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ventas</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-center">
          <Wallet size={16} className={user.resumenCredito?.saldoTotal > 0 ? 'text-amber-500' : 'text-emerald-500'} />
          <p className={`text-lg font-bold ${user.resumenCredito?.saldoTotal > 0 ? 'text-amber-600' : 'text-emerald-600'} text-slate-900 dark:text-white`}>
            {user.resumenCredito?.saldoTotal > 0 ? 'Deuda' : 'Al día'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Crédito</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}
          className="flex-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          Ver Perfil
        </button>
        <button 
          onClick={() => handleOpenModal(user)}
          className="flex-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
        >
          <Edit3 size={16} />
          Editar
        </button>
      </div>

      {/* More Actions */}
      <div className="flex gap-2 mt-2">
        <button 
          onClick={() => navigate(`/admin/usuarios/${user.idUsuario}/ventas`)}
          className="flex-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
        >
          <History size={16} />
          Ventas
        </button>
        <button 
          onClick={() => navigate(`/admin/usuarios/${user.idUsuario}/creditos`)}
          className="flex-1 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
        >
          <CreditCard size={16} />
          Créditos
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 sm:p-6 lg:p-10 space-y-10 transition-colors duration-300">
      
      {/* Professional Dashboard Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">
            <Users size={14} strokeWidth={3} />
            Administración de Sistema
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Directorio de Usuarios
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-medium max-w-xl">
            Gestiona los niveles de acceso y el estado de actividad de los colaboradores de la plataforma.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={cargarDatos}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
            title="Sincronizar datos"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
          >
            <UserPlus size={18} />
            <span className="hidden sm:inline">Añadir Colaborador</span>
            <span className="sm:hidden">Añadir</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - Professional View */}
      <div className="grid grid-cols-1 sm:grid-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Personal Total" 
          value={usuarios.length} 
          color="blue" 
          icon={Users}
          subtext="Contrato activo y registrados"
          trend="+2 nuevos"
        />
        <StatCard 
          title="Colaboradores Online" 
          value={usuarios.filter(u => u.estado === 'activo').length} 
          color="emerald" 
          icon={CheckCircle2}
          subtext="Con privilegios de acceso"
          trend="94% Ratio"
        />
        <StatCard 
          title="Cartera por Cobrar" 
          value={<PrecioFormateado precio={usuarios.reduce((acc, u) => acc + (parseFloat(u.resumenCredito?.saldoTotal) || 0), 0)} />} 
          color="amber" 
          icon={Wallet}
          subtext="Total créditos pendientes"
          trend="Monitorizado"
        />
        <StatCard 
          title="Roles Activos" 
          value={roles.length} 
          color="purple" 
          icon={Shield}
          subtext="Perfiles de seguridad"
        />
      </div>

      {/* Filters & Workspace */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-18" />
            <input 
              type="text"
              placeholder="Filtrar por nombre, identificación o correo corporativo..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
              <select 
                className="bg-transparent border-none text-[13px] font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer px-4 py-2"
                value={filterRol}
                onChange={(e) => setFilterRol(e.target.value)}
              >
                <option value="all">Cualquier Rol</option>
                {roles.map(r => <option key={r.idRol} value={r.nombreRol}>{r.nombreRol}</option>)}
              </select>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
              <select 
                className="bg-transparent border-none text-[13px] font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer px-4 py-2"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="all">Estado: Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
            <button className="hidden lg:flex items-center gap-2 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-700/30 dark:hover:bg-slate-700/50 rounded-xl transition-colors font-medium">
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>

        {/* User List - Responsive */}
        <div className="p-4 sm:p-6">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                <Users size={32} className="sm:size-40" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-center text-sm sm:text-base">No se encontraron usuarios con esos filtros.</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="space-y-4 lg:hidden">
                <AnimatePresence>
                  {filteredUsers.map((user, idx) => (
                    <MobileUserCard key={user.idUsuario} user={user} idx={idx} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
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
                      {filteredUsers.map((u, idx) => (
                        <motion.tr 
                          key={u.idUsuario}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
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
                            <div className="flex items-center justify-end gap-2">
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setSelectedUser(u); setIsDetailsOpen(true); }}
                                className="card-3d p-3 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                title="Ver Perfil"
                              >
                                <Eye size={18} />
                              </motion.button>
                              
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleOpenModal(u)}
                                className="card-3d p-3 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit3 size={18} />
                              </motion.button>
                              
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/admin/usuarios/${u.idUsuario}/ventas`)}
                                className="card-3d p-3 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                title="Ver Ventas"
                              >
                                <History size={18} />
                              </motion.button>
                              
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/admin/usuarios/${u.idUsuario}/creditos`)}
                                className="card-3d p-3 text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                                title="Ver Créditos"
                              >
                                <CreditCard size={18} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 sm:p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium text-center">
            Mostrando <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredUsers.length}</span> de <span className="font-bold">{usuarios.length}</span> registros totales
          </p>
          <div className="flex gap-2">
            <button disabled className="card-3d px-4 py-2 bg-white dark:bg-slate-800/40 rounded-xl text-sm font-bold text-gray-400 dark:text-gray-600 disabled:cursor-not-allowed">Anterior</button>
            <button disabled className="card-3d px-4 py-2 bg-white dark:bg-slate-800/40 rounded-xl text-sm font-bold text-gray-400 dark:text-gray-600 disabled:cursor-not-allowed">Siguiente</button>
          </div>
        </div>
      </div>

      {/* Modal de Creación/Edición - Responsivo y Natural */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full sm:h-auto max-h-[100vh] sm:max-h-[90vh] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header Fijo */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    {isEditing ? 'Modificar ficha' : 'Nueva incorporación'}
                  </h2>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Gestión de talento humano</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cuerpo Scrolleable */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-1 gap-12">
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <User size={16} />
                      </div>
                      <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Identificación</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Nombres completos</label>
                        <input
                          required
                          className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white text-sm font-semibold transition-all"
                          value={formData.nombres}
                          onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                          placeholder="p. ej. Javier"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Apellidos</label>
                        <input
                          required
                          className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white text-sm font-semibold transition-all"
                          value={formData.apellidos}
                          onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                          placeholder="p. ej. Montenegro"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Shield size={16} />
                      </div>
                      <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Acceso al sistema</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Email corporativo</label>
                        <input
                          required
                          type="email"
                          className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white text-sm font-semibold transition-all"
                          value={formData.correoElectronico}
                          onChange={(e) => setFormData({...formData, correoElectronico: e.target.value})}
                          placeholder="javier@empresa.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Nombre de usuario</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                          <input
                            required
                            className="w-full pl-9 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white text-sm font-semibold transition-all"
                            value={formData.usuario}
                            onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                            placeholder="jmontenegro"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Asignación de perfil</label>
                        <select
                          required
                          className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white text-sm font-semibold transition-all"
                          value={formData.idRol}
                          onChange={(e) => setFormData({...formData, idRol: e.target.value})}
                        >
                          <option value="">Selecciona un rol...</option>
                          {roles.map(r => (
                            <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>
                          ))}
                        </select>
                      </div>
                      {!isEditing && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Contraseña temporal</label>
                          <input
                            required={!isEditing}
                            type="password"
                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white text-sm font-semibold transition-all"
                            value={formData.contrasena}
                            onChange={(e) => setFormData({...formData, contrasena: e.target.value})}
                            placeholder="Min. 8 caracteres"
                          />
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Phone size={16} />
                      </div>
                      <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contacto Directo</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Teléfono móvil</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white text-sm font-semibold transition-all"
                          value={formData.telefono}
                          onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                          placeholder="+57 300 000 0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Dirección residencial</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white text-sm font-semibold transition-all"
                          value={formData.direccion}
                          onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                          placeholder="Barrio, Ciudad"
                        />
                      </div>
                    </div>
                  </section>
                </div>
              </form>

              {/* Acciones Fijas */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:flex-1 py-4 px-6 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-100 transition-all text-sm border border-slate-200 dark:border-slate-700"
                >
                  Descartar
                </button>
                <button
                  onClick={handleSave}
                  className="w-full sm:flex-1 py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:bg-black dark:hover:bg-slate-100 transition-all text-sm"
                >
                  {isEditing ? 'Confirmar Cambios' : 'Registrar Colaborador'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Detalle de Usuario - Responsivo Extremo */}
      <AnimatePresence>
        {isDetailsOpen && selectedUser && (
          <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="relative w-full max-w-full sm:max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header Detalle */}
              <div className="px-6 py-8 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Perfil Profesional</h3>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Contenido Perfil */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8">
                  <div className="flex flex-col items-center text-center space-y-6 mb-12">
                    <div className="relative">
                      <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-white shadow-2xl ${selectedUser.estado === 'activo' ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                        {selectedUser.nombres?.charAt(0)}{selectedUser.apellidos?.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-2 -right-2 w-10 h-10 border-4 border-white dark:border-slate-900 rounded-2xl ${selectedUser.estado === 'activo' ? 'bg-emerald-500' : 'bg-slate-300'} flex items-center justify-center`}>
                        {selectedUser.estado === 'activo' ? <CheckCircle2 size={16} className="text-white" /> : <XCircle size={16} className="text-white" />}
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {selectedUser.nombres} {selectedUser.apellidos}
                      </h2>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-sm">@{selectedUser.usuario}</span>
                        <span className="text-slate-400 font-bold">/</span>
                        <span className="text-slate-500 dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest">{selectedUser.rol?.nombreRol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl space-y-6">
                        <div className="flex items-start gap-4">
                          <Mail className="mt-1 text-slate-400" size={18} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contacto Directo</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 break-all">{selectedUser.correoElectronico}</p>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{selectedUser.telefono || 'Sin registro telefónico'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <MapPin className="mt-1 text-slate-400" size={18} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localización</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedUser.direccion || 'Sin dirección asignada'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
                          <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedUser._count?.ventasComoCliente || 0}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Ventas</p>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
                          <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                            <PrecioFormateado precio={selectedUser.resumenCredito?.saldoTotal || 0} />
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Saldo</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6">
                      <button 
                        onClick={() => { setIsDetailsOpen(false); handleOpenModal(selectedUser); }}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] shadow-xl"
                      >
                        Editar Colaborador
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/usuarios/${selectedUser.idUsuario}/ventas`)}
                        className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm transition-all hover:bg-slate-100"
                      >
                        Consultar Historial
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Detalle de Usuario */}
      <AnimatePresence>
        {isDetailsOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg ml-auto h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto border-l border-slate-200 dark:border-slate-800"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Perfil de Usuario</h3>
                  <button 
                    onClick={() => setIsDetailsOpen(false)}
                    className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                  >
                    <X size={20} className="text-slate-500" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-4 mb-10">
                  <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-white shadow-2xl ${selectedUser.estado === 'activo' ? 'bg-gradient-to-br from-indigo-500 to-blue-600' : 'bg-slate-400'}`}>
                    {selectedUser.nombres?.charAt(0)}{selectedUser.apellidos?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                      {selectedUser.nombres} {selectedUser.apellidos}
                    </h2>
                    <p className="text-indigo-500 font-bold text-lg">@{selectedUser.usuario}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${selectedUser.estado === 'activo' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10'}`}>
                      {selectedUser.estado}
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-tighter">
                      {selectedUser.rol?.nombreRol}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-10">
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 space-y-4">
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Mail size={14} /> Contacto & Ubicación
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-indigo-500">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedUser.correoElectronico}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-emerald-500">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teléfono</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedUser.telefono || 'No registrado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-amber-500">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dirección</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedUser.direccion || 'No registrada'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 space-y-2">
                      <ShoppingBag className="text-indigo-600 mb-2" size={24} />
                      <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{selectedUser._count?.ventasComoCliente || 0}</p>
                      <p className="text-[10px] font-bold text-indigo-600/60 uppercase tracking-wider">Ventas Totales</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-500/10 space-y-2">
                      <Wallet className="text-amber-600 mb-2" size={24} />
                      <p className="text-2xl font-black text-amber-700 dark:text-amber-400">
                        <PrecioFormateado precio={selectedUser.resumenCredito?.saldoTotal || 0} />
                      </p>
                      <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-wider">Saldo Pendiente</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => { setIsDetailsOpen(false); handleOpenModal(selectedUser); }}
                    className="w-full py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]"
                  >
                    <Edit3 size={18} /> Editar Este Perfil
                  </button>
                  <button 
                    onClick={() => navigate(`/admin/usuarios/${selectedUser.idUsuario}/ventas`)}
                    className="w-full py-4 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]"
                  >
                    <History size={18} /> Ver Historial
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
