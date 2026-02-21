/**
 * @file Sidebar.jsx
 * @brief Sidebar de administración premium - Diseño profesional moderno
 * @description Inspirado en Linear, Vercel, Notion - Minimalista y elegante
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Store,
  Truck,
  Coins,
  Undo2,
  Percent,
  CreditCard,
  BarChart3,
  UserCog,
  LogOut,
  ChevronRight,
  ChevronDown,
  Search,
  Menu,
  X,
  Heart,
  Tags,
  Palette,
  Ruler,
  ClipboardList,
  Warehouse,
  FileText,
  Receipt,
  TrendingUp,
  SearchIcon,
  Sun,
  Moon,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { tienePermiso } from "../../utils/permisosHelper";
import Swal from "sweetalert2";

// Theme Toggle Premium Component
const ThemeToggle = ({ collapsed }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center justify-center
        ${collapsed ? 'w-10 h-10' : 'w-full h-10 px-3'}
        rounded-xl transition-all duration-300 ease-out
        ${isDark 
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-400' 
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
        }
        group
      `}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className={`
        flex items-center gap-2.5 transition-all duration-300
        ${collapsed ? 'scale-100' : 'scale-100'}
      `}>
        {/* Icono con animación de rotación */}
        <div className="relative w-4 h-4">
          <Sun 
            className={`
              absolute inset-0 w-4 h-4 transition-all duration-500
              ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
            `}
          />
          <Moon 
            className={`
              absolute inset-0 w-4 h-4 transition-all duration-500
              ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
            `}
          />
        </div>
        
        {!collapsed && (
          <span className="text-xs font-medium tracking-wide">
            {isDark ? 'Modo oscuro' : 'Modo claro'}
          </span>
        )}
      </div>

      {/* Indicador visual */}
      <div className={`
        absolute ${collapsed ? 'bottom-0.5 right-0.5' : 'right-3'}
        w-1.5 h-1.5 rounded-full transition-all duration-300
        ${isDark ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-slate-400'}
      `} />
    </button>
  );
};

// Logout Button Premium Component
const LogoutButton = ({ collapsed, onLogout }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onLogout}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden
        ${collapsed ? 'w-10 h-10' : 'w-full h-10 px-3'}
        rounded-xl transition-all duration-300 ease-out
        bg-rose-50 hover:bg-rose-500 
        dark:bg-rose-500/10 dark:hover:bg-rose-500
        text-rose-500 hover:text-white
        dark:text-rose-400 dark:hover:text-white
        group
      `}
    >
      {/* Efecto de onda al hover */}
      <div className={`
        absolute inset-0 rounded-xl transition-transform duration-500 ease-out
        bg-rose-500
        ${isHovered ? 'scale-100' : 'scale-0'}
        origin-center
      `} />
      
      <div className="relative flex items-center gap-2.5 z-10">
        <LogOut className={`
          w-4 h-4 transition-all duration-300
          ${isHovered ? 'rotate-12 translate-x-0.5' : 'rotate-0'}
        `} />
        
        {!collapsed && (
          <span className="text-xs font-medium tracking-wide">
            Cerrar sesión
          </span>
        )}
      </div>
    </button>
  );
};

// User Profile Component
const UserProfile = ({ usuario, collapsed }) => {
  const iniciales = usuario?.nombre 
    ? usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-xl
      bg-slate-50 dark:bg-slate-800/50
      border border-slate-200 dark:border-slate-700/50
      transition-all duration-300
      ${collapsed ? 'justify-center' : ''}
    `}>
      {/* Avatar */}
      <div className={`
        relative flex-shrink-0
        w-9 h-9 rounded-lg
        bg-gradient-to-br from-blue-500 to-indigo-600
        flex items-center justify-center
        text-white text-xs font-bold
        shadow-lg shadow-blue-500/20
      `}>
        {iniciales}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
      </div>

      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {usuario?.nombre || 'Admin'}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {usuario?.rol?.nombreRol || 'Administrador'}
          </p>
        </div>
      )}
    </div>
  );
};

// Nav Item Component
const NavItem = ({ item, isActive, isCollapsed, depth = 0 }) => {
  const hasChildren = item.items && item.items.length > 0;
  const [isOpen, setIsOpen] = useState(false);
  const isExpanded = isOpen || item.items?.some(sub => sub.isActive);

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            transition-all duration-200 ease-out
            ${isExpanded 
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800/50' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm'
            }
            ${isCollapsed ? 'justify-center px-2' : ''}
          `}
        >
          <span className={`
            flex-shrink-0 transition-transform duration-200
            ${isExpanded ? 'text-blue-600 dark:text-blue-400 scale-110' : ''}
          `}>
            {item.icon}
          </span>
          
          {!isCollapsed && (
            <>
              <span className="flex-1 text-sm font-medium text-left">
                {item.title}
              </span>
              <ChevronDown className={`
                w-4 h-4 transition-transform duration-200
                ${isExpanded ? 'rotate-180' : ''}
              `} />
            </>
          )}
        </button>

        {/* Submenu */}
        {!isCollapsed && (
          <div className={`
            overflow-hidden transition-all duration-200 ease-out
            ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <div className="pl-10 pr-2 space-y-0.5 relative">
              {/* Línea guía */}
              <div className="absolute left-[18px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700/50" />
              
              {item.items.map((subItem) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg
                    text-sm transition-all duration-200 relative
                    ${subItem.isActive 
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold shadow-sm' 
                      : 'text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                    }
                  `}
                >
                  {subItem.isActive && (
                    <div className="absolute -left-[11px] w-2 h-2 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900" />
                  )}
                  <span className="truncate">{subItem.text}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200 ease-out group
        ${isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20 ring-offset-1 ring-offset-white dark:ring-offset-slate-900' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm'
        }
        ${isCollapsed ? 'justify-center px-2' : ''}
      `}
    >
      {/* Indicador lateral izquierdo para activo */}
      {isActive && !isCollapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full shadow-sm" />
      )}
      
      <span className={`
        flex-shrink-0 transition-all duration-200
        ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110 group-hover:text-blue-500'}
      `}>
        {item.icon}
      </span>
      
      {!isCollapsed && (
        <span className="text-sm font-medium relative z-10">
          {item.title}
        </span>
      )}

      {/* Tooltip para collapsed */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
          {item.title}
        </div>
      )}
    </Link>
  );
};

// Main Sidebar Component
const Sidebar = () => {
  const { logout, usuario, estaAutenticado } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  if (!estaAutenticado || !usuario) {
    return null;
  }

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión actual",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#64748b",
      customClass: {
        popup: 'dark:bg-slate-800 dark:text-white rounded-2xl',
        title: 'dark:text-white font-semibold',
        htmlContainer: 'dark:text-slate-300'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  // Navigation structure
  const menuSections = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/admin/dashboard",
      key: "dashboard",
      items: []
    },
    {
      title: "Usuarios",
      icon: <Users className="w-5 h-5" />,
      key: "usuarios",
      items: [
        { text: "Usuarios", icon: <Users className="w-4 h-4" />, path: "/admin/usuarios" },
        { text: "Roles", icon: <UserCog className="w-4 h-4" />, path: "/admin/roles" }
      ]
    },
    {
      title: "Productos",
      icon: <Store className="w-5 h-5" />,
      key: "productos",
      items: [
        { text: "Productos", icon: <ShoppingCart className="w-4 h-4" />, path: "/admin/productos" },
        { text: "Variantes", icon: <Tags className="w-4 h-4" />, path: "/admin/productos/variantes" },
        { text: "Galería", icon: <Palette className="w-4 h-4" />, path: "/admin/productos/galeria" },
        { text: "Categorías", icon: <Tags className="w-4 h-4" />, path: "/admin/categorias" },
        { text: "Colores", icon: <Palette className="w-4 h-4" />, path: "/admin/colores" },
        { text: "Tallas", icon: <Ruler className="w-4 h-4" />, path: "/admin/tallas" }
      ]
    },
    {
      title: "Inventario",
      icon: <Warehouse className="w-5 h-5" />,
      key: "inventario",
      items: [
        { text: "Inventario", icon: <Package className="w-4 h-4" />, path: "/admin/inventario" },
        { text: "Movimientos", icon: <ClipboardList className="w-4 h-4" />, path: "/admin/inventario/movimientos" },
        { text: "Tipos Mov.", icon: <FileText className="w-4 h-4" />, path: "/admin/inventario/tipos-movimiento" },
        { text: "Ajustes", icon: <Warehouse className="w-4 h-4" />, path: "/admin/inventario/ajustes" }
      ]
    },
    {
      title: "Ventas",
      icon: <ShoppingCart className="w-5 h-5" />,
      key: "ventas",
      items: [
        { text: "Ventas", icon: <ShoppingCart className="w-4 h-4" />, path: "/admin/ventas" },
        { text: "Detalles", icon: <Receipt className="w-4 h-4" />, path: "/admin/ventas/detalles" },
        { text: "Estados", icon: <ClipboardList className="w-4 h-4" />, path: "/admin/estados-pedido" }
      ]
    },
    {
      title: "Compras",
      icon: <Truck className="w-5 h-5" />,
      key: "compras",
      items: [
        { text: "Compras", icon: <Truck className="w-4 h-4" />, path: "/admin/compras" },
        { text: "Detalle", icon: <Receipt className="w-4 h-4" />, path: "/admin/compras/detalle" },
        { text: "Proveedores", icon: <UserCog className="w-4 h-4" />, path: "/admin/proveedores" }
      ]
    },
    {
      title: "Créditos",
      icon: <Coins className="w-5 h-5" />,
      key: "creditos",
      items: [
        { text: "Gestión", icon: <Coins className="w-4 h-4" />, path: "/admin/creditos/gestion" },
        { text: "Historial", icon: <ClipboardList className="w-4 h-4" />, path: "/admin/creditos/historial" },
        { text: "Detalle", icon: <SearchIcon className="w-4 h-4" />, path: "/admin/creditos/detalle" }
      ]
    },
    {
      title: "Devoluciones",
      icon: <Undo2 className="w-5 h-5" />,
      key: "devoluciones",
      items: [
        { text: "Devoluciones", icon: <Undo2 className="w-4 h-4" />, path: "/admin/devoluciones" },
        { text: "Detalle", icon: <Receipt className="w-4 h-4" />, path: "/admin/devoluciones/detalle" }
      ]
    },
    {
      title: "Descuentos",
      icon: <Percent className="w-5 h-5" />,
      key: "descuentos",
      items: [
        { text: "Descuentos", icon: <Percent className="w-4 h-4" />, path: "/admin/descuentos" },
        { text: "Historial", icon: <TrendingUp className="w-4 h-4" />, path: "/admin/descuentos/historial" }
      ]
    },
    {
      title: "Pagos",
      icon: <CreditCard className="w-5 h-5" />,
      key: "pagos",
      items: [
        { text: "Métodos", icon: <CreditCard className="w-4 h-4" />, path: "/admin/metodos-pago" }
      ]
    },
    {
      title: "Reportes",
      icon: <BarChart3 className="w-5 h-5" />,
      key: "reportes",
      items: [
        { text: "Ventas", icon: <BarChart3 className="w-4 h-4" />, path: "/admin/reportes/ventas" },
        { text: "Compras", icon: <Truck className="w-4 h-4" />, path: "/admin/reportes/compras" },
        { text: "Créditos", icon: <Coins className="w-4 h-4" />, path: "/admin/reportes/creditos" },
        { text: "Pagos", icon: <Receipt className="w-4 h-4" />, path: "/admin/reportes/pagos" },
        { text: "Inventario", icon: <Warehouse className="w-4 h-4" />, path: "/admin/reportes/inventario" }
      ]
    }
  ];

  // Filter by permissions
  const menuPermitido = menuSections.filter(section => {
    if (!section.items || section.items.length === 0) {
      return tienePermiso(usuario, section.key, 'read');
    }

    const subitemsPermitidos = section.items.filter(item => {
      let clavePermiso = section.key;
      if (item.path.includes('/roles')) clavePermiso = 'roles';
      if (item.path.includes('/categorias')) clavePermiso = 'categorias';
      if (item.path.includes('/proveedores')) clavePermiso = 'proveedores';
      if (item.path.includes('/galeria')) clavePermiso = 'galeria';

      return tienePermiso(usuario, clavePermiso, 'read');
    });

    section.items = subitemsPermitidos;
    return subitemsPermitidos.length > 0;
  });

  // Filter by search
  const filteredSections = menuPermitido.filter(section => {
    if (!searchQuery) return true;
    const sectionMatches = section.title.toLowerCase().includes(searchQuery.toLowerCase());
    const itemMatches = section.items?.some(item =>
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return sectionMatches || itemMatches;
  });

  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard" || location.pathname === "/admin";
    }
    return location.pathname === path;
  };

  // Prepare navigation items with active state
  const navItems = filteredSections.map(section => ({
    ...section,
    isActive: section.path ? isActive(section.path) : false,
    items: section.items?.map(item => ({
      ...item,
      isActive: isActive(item.path)
    }))
  }));

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen
        bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-slate-800
        transition-all duration-300 ease-out
        ${isCollapsed ? 'w-20' : 'w-72'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          
          {/* Header - Logo */}
          <div className={`
            flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800
            ${isCollapsed ? 'justify-center' : ''}
          `}>
            <div 
              onClick={() => navigate('/admin/dashboard')}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 text-white" />
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  Adi Estilos
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Admin Panel
                </p>
              </div>
            )}
          </div>

          {/* Search */}
          {!isCollapsed && (
            <div className="p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {navItems.map((section) => (
              <NavItem 
                key={section.title} 
                item={section} 
                isActive={section.isActive}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            
            {/* User Profile */}
            <UserProfile usuario={usuario} collapsed={isCollapsed} />

            {/* Controls */}
            <div className={`
              flex gap-2
              ${isCollapsed ? 'flex-col items-center' : ''}
            `}>
              <div className={isCollapsed ? 'w-10' : 'flex-1'}>
                <ThemeToggle collapsed={isCollapsed} />
              </div>
              
              <div className={isCollapsed ? 'w-10' : 'flex-1'}>
                <LogoutButton collapsed={isCollapsed} onLogout={handleLogout} />
              </div>
            </div>

            {/* Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`
                w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
                text-slate-500 dark:text-slate-400
                hover:bg-slate-100 dark:hover:bg-slate-800/50
                transition-all duration-200
                ${isCollapsed ? 'px-2' : ''}
              `}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 rotate-180" />
              ) : (
                <>
                  <ChevronRight className={`
                    w-4 h-4 transition-transform duration-200
                    ${isCollapsed ? '' : 'rotate-180'}
                  `} />
                  <span className="text-xs font-medium">Contraer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;