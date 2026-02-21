import React, { useState, useEffect } from 'react';
import { usuariosApi } from '../../../api/usuariosApi';
import { 
  FiUser, FiSearch, FiCheck, FiChevronDown, FiMail, 
  FiFileText, FiPhone, FiMapPin, FiX 
} from 'react-icons/fi';

const SelectorCliente = ({ seleccionado, alSeleccionar }) => {
  const [consulta, setConsulta] = useState('');
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  useEffect(() => {
    const cargarClientes = async () => {
      setCargando(true);
      try {
        const resultado = await usuariosApi.getUsuarios({ idRol: 2 }); 
        const lista = resultado.datos || resultado || [];
        setClientes(Array.isArray(lista) ? lista : []);
      } catch (error) {
        console.error("Error al cargar clientes", error);
      } finally {
        setCargando(false);
      }
    };
    cargarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const term = consulta.toLowerCase();
    const nombres = `${cliente.nombres} ${cliente.apellidos}`.toLowerCase();
    const documento = (cliente.usuario || '').toLowerCase();
    const correo = (cliente.correoElectronico || '').toLowerCase();
    return nombres.includes(term) || documento.includes(term) || correo.includes(term);
  });

  const handleSeleccionar = (cliente) => {
    alSeleccionar(cliente);
    setMostrarOpciones(false);
    setConsulta('');
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <FiUser className="h-4 w-4" />
          </div>
          Información del Cliente
        </h3>
        <p className="text-xs text-slate-500 ml-10">Busca y selecciona el cliente para esta venta</p>
      </div>

      <div className="relative">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className={`h-4 w-4 transition-colors ${mostrarOpciones ? 'text-indigo-500' : 'text-slate-400'}`} />
          </div>
          <input
            type="text"
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-12 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="Buscar por nombre, documento o correo..."
            value={consulta}
            onChange={(e) => {
              setConsulta(e.target.value);
              if (!mostrarOpciones) setMostrarOpciones(true);
            }}
            onFocus={() => setMostrarOpciones(true)}
          />
          {consulta && (
            <button
              onClick={() => setConsulta('')}
              className="absolute inset-y-0 right-12 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-4"
            onClick={() => setMostrarOpciones(!mostrarOpciones)}
          >
            <FiChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${mostrarOpciones ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {mostrarOpciones && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setMostrarOpciones(false)}
            />
            <div className="absolute mt-2 max-h-72 w-full overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-black/5 z-20 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="overflow-auto max-h-72 custom-scrollbar py-1">
                {cargando ? (
                  <div className="py-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-3 text-xs text-slate-400 font-medium">Cargando clientes...</p>
                  </div>
                ) : clientesFiltrados.length === 0 ? (
                  <div className="py-8 text-center">
                    <FiSearch className="h-7 w-7 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-500">No hay coincidencias</p>
                    <p className="text-xs text-slate-400 mt-0.5">Intenta con otro término</p>
                  </div>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <div
                      key={cliente.idUsuario}
                      className={`cursor-pointer select-none py-3 px-4 mx-1 my-0.5 rounded-lg transition-all duration-150 group ${
                        seleccionado?.idUsuario === cliente.idUsuario
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                      onClick={() => handleSeleccionar(cliente)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                          seleccionado?.idUsuario === cliente.idUsuario
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                        }`}>
                          {cliente.nombres[0]}{cliente.apellidos[0]}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="block truncate font-semibold text-sm">
                            {cliente.nombres} {cliente.apellidos}
                          </span>
                          <div className={`flex items-center gap-3 mt-0.5 text-xs ${
                             seleccionado?.idUsuario === cliente.idUsuario ? 'text-indigo-200' : 'text-slate-400'
                          }`}>
                            <span className="flex items-center gap-1">
                              <FiFileText className="h-3 w-3" />
                              {cliente.usuario || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <FiMail className="h-3 w-3" />
                              {cliente.correoElectronico}
                            </span>
                          </div>
                        </div>
                        {seleccionado?.idUsuario === cliente.idUsuario && (
                          <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center text-indigo-600">
                            <FiCheck className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {seleccionado && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/15 transition-all duration-700" />
            <div className="absolute -left-10 -bottom-10 h-24 w-24 bg-indigo-400/20 rounded-full blur-2xl" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-5">
              <div className="h-16 w-16 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/30">
                {seleccionado.nombres[0]}{seleccionado.apellidos[0]}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-bold tracking-tight">{seleccionado.nombres} {seleccionado.apellidos}</h4>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                    <FiFileText className="h-3.5 w-3.5 text-indigo-200" />
                    <span className="text-xs font-medium">{seleccionado.usuario || 'NO REGISTRADO'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                    <FiMail className="h-3.5 w-3.5 text-indigo-200" />
                    <span className="text-xs font-medium">{seleccionado.correoElectronico}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] font-medium text-indigo-200 mb-0.5">Teléfono</p>
                  <div className="flex items-center gap-1.5">
                    <FiPhone className="h-3 w-3" />
                    <span className="text-xs font-medium">{seleccionado.telefono || 'Sin registro'}</span>
                  </div>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] font-medium text-indigo-200 mb-0.5">Ubicación</p>
                  <div className="flex items-center gap-1.5">
                    <FiMapPin className="h-3 w-3" />
                    <span className="text-xs font-medium truncate max-w-[100px]">{seleccionado.direccion || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center relative">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] font-medium text-indigo-100">Cliente Verificado</span>
              </div>
              <button 
                onClick={() => alSeleccionar(null)}
                className="text-xs font-semibold bg-white text-indigo-600 px-4 py-1.5 rounded-lg shadow hover:bg-slate-50 transition-colors"
              >
                Cambiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectorCliente;
