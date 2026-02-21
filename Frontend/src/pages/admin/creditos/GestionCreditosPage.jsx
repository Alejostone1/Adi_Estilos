import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiCheckCircle, FiArrowLeft, FiDollarSign, FiUsers, 
  FiSearch, FiFilter, FiActivity, FiShield, FiTrendingUp
} from 'react-icons/fi';
import { creditosApi } from '../../../api/creditosApi';
import Swal from 'sweetalert2';

const GestionCreditosPage = () => {
  const navigate = useNavigate();
  const [creditos, setCreditos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarCreditosActivos();
  }, []);

  const cargarCreditosActivos = async () => {
    setCargando(true);
    try {
      const res = await creditosApi.getCreditos({ estado: 'activo' });
      setCreditos(res.datos || []);
    } catch (error) {
      console.error('Error cargando gestión', error);
      Swal.fire('Error', 'No se pudo cargar la gestión de cartera', 'error');
    } finally {
      setCargando(false);
    }
  };

  const formatearPrecio = (valor) => {
    const numero = Math.round(Number(valor) || 0);
    return numero.toLocaleString('es-CO');
  };

  const totalPorCobrar = creditos.reduce((acc, c) => acc + Number(c.saldoPendiente), 0);
  
  const creditosFiltrados = creditos.filter(c => 
    `${c.usuarioCliente?.nombres} ${c.usuarioCliente?.apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* Header con Navegación */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="flex items-start gap-6">
            <button
              onClick={() => navigate('/admin')}
              className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 text-slate-500"
            >
              <FiArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <nav className="flex items-center space-x-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-500 mb-2">
                <Link to="/admin" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-400 dark:text-slate-500 font-medium tracking-normal">Cobranza Activa</span>
              </nav>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight leading-none">
                Gestión de Cobranza
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-3 font-normal text-lg max-w-2xl">
                Monitorea y gestiona el estado de los créditos vigentes y la recuperación de cartera.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80 group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar cliente por nombre..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Resumen de Cartera - Diseño Sofisticado */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.8rem] border border-slate-200/60 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
            <div className="flex flex-col lg:flex-row items-stretch">
              {/* Bloque de Métricas Principales */}
              <div className="flex-1 p-10 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                    Monitor de Liquidez
                  </span>
                </div>
                
                <h2 className="text-4xl font-semibold text-slate-900 dark:text-white tracking-tight mb-8">
                  Estado de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300">Cartera Activa</span>
                </h2>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Créditos en Vigencia</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-semibold text-slate-900 dark:text-white tracking-tighter">{creditos.length}</span>
                      <span className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase">Ordenes</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Base de Clientes</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-semibold text-slate-900 dark:text-white tracking-tighter">{new Set(creditos.map(c => c.idUsuarioCliente)).size}</span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase">Titulares</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de Saldo con Diseño Financiero */}
              <div className="bg-slate-50/50 dark:bg-slate-800/20 lg:w-[450px] p-10 lg:p-12 border-l border-slate-100 dark:border-slate-800 flex flex-col justify-center relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <FiShield className="text-indigo-500 h-4 w-4" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Recuperable</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-5xl font-semibold text-slate-900 dark:text-white tracking-tighter">
                      <span className="text-2xl font-medium text-slate-400 mr-2">$</span>
                      {formatearPrecio(totalPorCobrar)}
                    </p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mt-4">
                      <FiActivity className="animate-bounce" />
                      Flujo proyectado según plazos vigentes
                    </p>
                  </div>
                </div>
                
                {/* Elemento gráfico de fondo */}
                <div className="absolute -right-8 -bottom-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                  <FiDollarSign className="w-64 h-64 text-slate-900 dark:text-white rotate-12" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listado de Clientes con Crédito */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Desglose de Cartera</h2>
              <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">
                {creditosFiltrados.length} resultados
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cargando ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-10 h-10 border-[3px] border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">Sincronizando cobranzas...</p>
              </div>
            ) : creditosFiltrados.length === 0 ? (
              <div className="col-span-full text-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
                  <FiCheckCircle className="text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">¡Todo al día!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">No se encontraron créditos activos que coincidan con tu búsqueda en este momento.</p>
              </div>
            ) : (
              creditosFiltrados.map(credito => {
                const porcentajePago = Math.round(((credito.montoTotal - credito.saldoPendiente) / credito.montoTotal) * 100);
                
                return (
                  <div key={credito.idCredito} 
                    onClick={() => navigate(`/admin/creditos/detalle/${credito.idCredito}`)}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-semibold text-lg border border-slate-200 dark:border-slate-700">
                          {credito.usuarioCliente?.nombres?.[0]}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white leading-tight">
                            {credito.usuarioCliente?.nombres}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter mt-1">
                            {credito.usuarioCliente?.apellidos}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-amber-100 dark:border-amber-500/20">
                        Por Cobrar
                      </span>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-center text-sm py-2 border-b border-slate-50 dark:border-slate-800/50">
                        <span className="text-slate-400 font-medium">Capital Otorgado</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-400">$ {formatearPrecio(credito.montoTotal)}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Saldo Pendiente</span>
                          <span className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                            $ {formatearPrecio(credito.saldoPendiente)}
                          </span>
                        </div>
                        
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${porcentajePago > 75 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${porcentajePago}%` }} 
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                           <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                            {porcentajePago}% Recuperado
                          </p>
                          <p className="text-[10px] text-indigo-500 font-bold uppercase">
                            Detalle Interno #{credito.idCredito}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex items-center justify-center gap-2 py-2 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-500/20 transition-all text-xs font-semibold uppercase tracking-wider">
                      Gestionar Cobro <FiActivity className="h-3 w-3" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GestionCreditosPage;
