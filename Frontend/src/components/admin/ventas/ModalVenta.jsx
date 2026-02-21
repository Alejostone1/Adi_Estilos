import React, { useState, useEffect } from 'react';
import { 
  FiX, FiChevronRight, FiChevronLeft, FiCheck, FiShoppingCart, 
  FiUser, FiShoppingBag, FiTruck, FiCreditCard, FiFileText 
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import SelectorCliente from './SelectorCliente';
import SelectorVariantes from './SelectorVariantes';
import TablaDetalleVenta from './TablaDetalleVenta';
import ResumenVenta from './ResumenVenta';
import { ventasApi } from '../../../api/ventasApi';
import { metodosPagoApi } from '../../../api/metodosPagoApi';
import { estadosPedidoApi } from '../../../api/estadosPedidoApi';
import { descuentosApi } from '../../../api/descuentosApi';
import { FiPercent, FiHash, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';

const ModalVenta = ({ isOpen, onClose, onVentaCreada }) => {
  const { usuario } = useAuth();
  const [paso, setPaso] = useState(1);
  const [cliente, setCliente] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [estadosPedido, setEstadosPedido] = useState([]);
  
  // Datos de factura
  const [idMetodoPago, setIdMetodoPago] = useState('');
  const [pagosMultimetodo, setPagosMultimetodo] = useState({});
  const [idEstadoPedido, setIdEstadoPedido] = useState('');
  const [tipoVenta, setTipoVenta] = useState('contado');
  const [notas, setNotas] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Impuestos y Descuentos
  const [aplicaIva, setAplicaIva] = useState(false);
  const [porcentajeIva, setPorcentajeIva] = useState(19);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [infoCupon, setInfoCupon] = useState(null);
  const [validandoCupon, setValidandoCupon] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarDataInicial();
    } else {
      resetModal();
    }
  }, [isOpen]);

  const cargarDataInicial = async () => {
    try {
      const [resMetodos, resEstados] = await Promise.all([
        metodosPagoApi.getMetodosPago(),
        estadosPedidoApi.getEstadosPedido()
      ]);
      setMetodosPago(resMetodos.datos || resMetodos || []);
      setEstadosPedido(resEstados.datos || resEstados || []);
      
      // Defaults
      if (resEstados.datos?.[0]) setIdEstadoPedido(resEstados.datos[0].idEstadoPedido);
      if (resMetodos.datos?.[0]) setIdMetodoPago(resMetodos.datos[0].idMetodoPago);
    } catch (error) {
      console.error("Error cargando data inicial", error);
    }
  };

  const resetModal = () => {
    setPaso(1);
    setCliente(null);
    setCarrito([]);
    setNotas('');
    setDireccionEntrega('');
    setTipoVenta('contado');
    setPagosMultimetodo({ efectivo: 0, tarjeta: 0, credito: 0, referenciaTarjeta: '' });
    setAplicaIva(false);
    setCodigoCupon('');
    setInfoCupon(null);
  };

  const agregarAlCarrito = (variante, producto) => {
    const idVarianteReal = variante.idVariante || variante.id;
    const existe = carrito.find(item => item.idVariante === idVarianteReal);

    if (existe) {
      actualizarCantidad(idVarianteReal, existe.cantidad + 1);
      return;
    }

    const nuevoItem = {
      idVariante: idVarianteReal,
      producto,
      color: variante.color,
      talla: variante.talla,
      cantidad: 1,
      precioUnitario: variante.precioVenta,
      stockActual: variante.cantidadStock,
      imagenVariante: variante.imagenesVariantes?.[0]?.rutaImagen || producto.imagen,
      descuentoLinea: 0
    };

    setCarrito([...carrito, nuevoItem]);
    Swal.fire({
      icon: 'success',
      title: '¡Agregado!',
      text: 'Producto agregado al carrito',
      timer: 800,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const actualizarCantidad = (id, cant) => {
    const item = carrito.find(i => i.idVariante === id);
    if (!item) return;
    
    const nuevaCant = Math.max(1, Math.min(cant, item.stockActual));
    setCarrito(carrito.map(i => i.idVariante === id ? { ...i, cantidad: nuevaCant } : i));
  };

  const actualizarDescuento = (id, desc) => {
    setCarrito(carrito.map(i => i.idVariante === id ? { ...i, descuentoLinea: Number(desc) || 0 } : i));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(i => i.idVariante !== id));
  };

  const aplicarCupon = async () => {
    if (!codigoCupon) return;
    setValidandoCupon(true);
    try {
      const res = await descuentosApi.validarDescuento(codigoCupon, subtotalProductos - totalDescuentosLinea);
      const descuentoEncontrado = res.descuento || res.datos?.descuento || (res.valido ? res : null);
      
      if (!descuentoEncontrado) throw new Error("No se encontró información del descuento");

      setInfoCupon(descuentoEncontrado);
      Swal.fire({
        icon: 'success',
        title: 'Cupón Aplicado',
        text: `Se ha aplicado el descuento: ${descuentoEncontrado.nombreDescuento || 'Promocional'}`,
        timer: 1500,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error validando cupón", error);
      const msgError = error.response?.data?.msg || error.response?.data?.mensaje || 'Código de cupón inválido o expirado';
      Swal.fire('Error', msgError, 'error');
      setInfoCupon(null);
    } finally {
      setValidandoCupon(false);
    }
  };

  // Cálculos detallados
  const subtotalProductos = carrito.reduce((acc, i) => acc + (i.cantidad * i.precioUnitario), 0);
  const totalDescuentosLinea = carrito.reduce((acc, i) => acc + (Number(i.descuentoLinea) || 0), 0);
  const baseAntesDeCupon = subtotalProductos - totalDescuentosLinea;
  
  let valorDescuentoGlobal = 0;
  if (infoCupon) {
    const valorDesc = Number(infoCupon.valorDescuento) || 0;
    if (infoCupon.tipoDescuento === 'porcentaje') {
      valorDescuentoGlobal = baseAntesDeCupon * (valorDesc / 100);
    } else {
      valorDescuentoGlobal = valorDesc;
    }
  }

  const baseImponible = baseAntesDeCupon - valorDescuentoGlobal;
  const impuestosTotal = aplicaIva ? (baseImponible * (porcentajeIva / 100)) : 0;
  const totalFinal = baseImponible + impuestosTotal;

  // Calculos de pagos
  const totalAsignado = Object.entries(pagosMultimetodo)
     .filter(([key]) => !key.includes('referencia'))
     .reduce((acc, [_, val]) => acc + (Number(val) || 0), 0);

  const montoCredito = Object.entries(pagosMultimetodo)
    .filter(([key]) => !key.includes('referencia'))
    .reduce((acc, [key, val]) => {
       const metodo = metodosPago.find(m => m.idMetodoPago.toString() === key);
       if (metodo && metodo.nombreMetodo.toLowerCase().includes('crédito')) {
         return acc + (Number(val) || 0);
       }
       return acc;
    }, 0);

  const montoAbonado = totalAsignado - montoCredito;

  const handleSiguiente = () => {
    if (paso === 1 && !cliente) return Swal.fire('Error', 'Debes seleccionar un cliente', 'error');
    if (paso === 2 && carrito.length === 0) return Swal.fire('Error', 'El carrito está vacío', 'error');
    if (paso < 5) setPaso(paso + 1);
  };

  const UPLOAD_URL = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  const handleAnterior = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  const handleCrearVenta = async () => {
    const diferencia = totalFinal - totalAsignado;

    if (diferencia > 100) {
      return Swal.fire({
        title: 'Venta Incompleta',
        text: `Aún falta cubrir ${formatearPrecio(diferencia)}. Por favor diligencia los montos de pago.`,
        icon: 'warning'
      });
    }

    setProcesando(true);
    try {
      const payload = {
        idUsuario: cliente.idUsuario,
        idUsuarioVendedor: usuario?.idUsuario || null,
        detalleVentas: carrito.map(i => ({
          idVariante: i.idVariante,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuentoLinea: i.descuentoLinea
        })),
        pagos: Object.entries(pagosMultimetodo)
                .filter(([_, monto]) => Number(monto) > 0)
                .map(([idMetodo, monto]) => {
                  const esReferencia = idMetodo.includes('referencia_');
                  if (esReferencia) return null;
                  
                  const metodo = metodosPago.find(m => m.idMetodoPago.toString() === idMetodo);
                  const referencia = pagosMultimetodo[`referencia_${idMetodo}`] || null;
                  
                  return {
                    idMetodoPago: parseInt(idMetodo),
                    monto: Number(monto),
                    referencia
                  };
                }).filter(Boolean),
        tipoVenta: montoCredito > 0 ? 'credito' : 'contado',
        idEstadoPedido: parseInt(idEstadoPedido),
        notas,
        direccionEntrega,
        impuestos: impuestosTotal,
        descuentoTotal: totalDescuentosLinea + valorDescuentoGlobal,
        idDescuento: infoCupon?.idDescuento || null,
        codigoDescuentoUsado: infoCupon ? codigoCupon : null
      };

      await ventasApi.createVenta(payload);
      Swal.fire('¡Éxito!', 'Venta registrada correctamente', 'success');
      onVentaCreada();
      onClose();
    } catch (error) {
      console.error("Error creando venta", error);
      Swal.fire('Error', error.mensaje || 'Error al procesar la venta', 'error');
    } finally {
      setProcesando(false);
    }
  };

  if (!isOpen) return null;

  // Nombres de pasos
  const nombresPasos = { 1: 'Cliente', 2: 'Catálogo', 3: 'Detalle', 4: 'Logística', 5: 'Confirmación' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-[95vw] h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
        
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <FiShoppingCart className="h-5 w-5" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nueva Venta</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Paso {paso} de 5 — {nombresPasos[paso]}
                </p>
              </div>

              {/* Badges de estado */}
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700">
                {cliente && (
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <FiUser className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {cliente.nombres} {cliente.apellidos}
                    </span>
                  </div>
                )}
                {carrito.length > 0 && (
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <FiShoppingBag className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {carrito.reduce((acc, i) => acc + i.cantidad, 0)} items
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex w-full h-1 bg-slate-100 dark:bg-slate-800">
          {[1,2,3,4,5].map(i => (
            <div 
              key={i} 
              className={`flex-1 transition-all duration-500 ${i <= paso ? 'bg-indigo-600' : ''}`}
            />
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {paso === 1 && <SelectorCliente seleccionado={cliente} alSeleccionar={setCliente} />}
            {paso === 2 && <SelectorVariantes alAgregar={agregarAlCarrito} />}
            {paso === 3 && (
              <TablaDetalleVenta 
                carrito={carrito} 
                onActualizarCantidad={actualizarCantidad}
                onActualizarDescuento={actualizarDescuento}
                onEliminar={eliminarDelCarrito}
              />
            )}
            {paso === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* KPIs financieros */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-indigo-600 p-5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                    <p className="text-[11px] font-medium uppercase opacity-70 mb-1">Total Venta</p>
                    <p className="text-xl font-bold">{formatearPrecio(totalFinal)}</p>
                  </div>
                  <div className="bg-emerald-500 p-5 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                    <p className="text-[11px] font-medium uppercase opacity-70 mb-1">Abonado</p>
                    <p className="text-xl font-bold">{formatearPrecio(montoAbonado)}</p>
                  </div>
                  <div className="bg-rose-500 p-5 rounded-xl text-white shadow-lg shadow-rose-500/20">
                    <p className="text-[11px] font-medium uppercase opacity-70 mb-1">A Crédito</p>
                    <p className="text-xl font-bold">{formatearPrecio(montoCredito)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-medium uppercase text-slate-400 mb-1">Faltante / Cambio</p>
                    <p className={`text-xl font-bold ${totalFinal - totalAsignado > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {formatearPrecio(Math.abs(totalFinal - totalAsignado))}
                    </p>
                  </div>
                </div>

                {/* Desglose de Pagos */}
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600">
                         <FiCreditCard className="h-5 w-5" />
                      </div>
                      <div>
                         <h4 className="text-base font-bold text-slate-800 dark:text-white">Desglose de Pagos</h4>
                         <p className="text-xs text-slate-400">Define cómo pagará el cliente esta factura</p>
                      </div>
                   </div>

                   {/* Métodos de pago disponibles */}
                   <div className="mb-5 overflow-x-auto pb-3 custom-scrollbar">
                     <div className="flex gap-2">
                       {metodosPago.filter(m => m.activo).map((metodo) => {
                          const estaSeleccionado = pagosMultimetodo[metodo.idMetodoPago] !== undefined && pagosMultimetodo[metodo.idMetodoPago] !== 0;
                          
                          return (
                            <button
                              key={metodo.idMetodoPago}
                              onClick={() => {
                                if (metodo.nombreMetodo.includes('+')) {
                                   const partes = metodo.nombreMetodo.split('+').map(s => s.trim());
                                   const idsActivados = {};
                                   
                                   partes.forEach(parte => {
                                      let match = metodosPago.find(m => m.nombreMetodo.toLowerCase() === parte.toLowerCase() && !m.nombreMetodo.includes('+'));
                                      
                                      if (!match) {
                                        if (parte.toLowerCase().includes('crédito')) match = metodosPago.find(m => m.nombreMetodo.toLowerCase().includes('crédito tienda'));
                                        if (parte.toLowerCase() === 'tarjeta') match = metodosPago.find(m => m.nombreMetodo.toLowerCase().includes('tarjeta crédito'));
                                      }

                                      if (match) {
                                        idsActivados[match.idMetodoPago] = 0;
                                      }
                                   });

                                   if (Object.keys(idsActivados).length > 0) {
                                     setPagosMultimetodo(prev => ({ ...prev, ...idsActivados }));
                                     return;
                                   }
                                }

                                if (!estaSeleccionado) {
                                  setPagosMultimetodo(prev => ({
                                    ...prev,
                                    [metodo.idMetodoPago]: 0
                                  }));
                                } else {
                                   setPagosMultimetodo(prev => {
                                      const newState = { ...prev };
                                      delete newState[metodo.idMetodoPago];
                                      delete newState[`referencia_${metodo.idMetodoPago}`];
                                      return newState;
                                   });
                                }
                              }}
                              className={`
                                flex-shrink-0 px-4 py-2.5 rounded-xl border font-medium text-xs transition-all
                                ${estaSeleccionado 
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700'
                                }
                              `}
                            >
                              {metodo.nombreMetodo}
                            </button>
                          );
                       })}
                     </div>
                   </div>

                   {/* Pagos Activos */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
                      {Object.keys(pagosMultimetodo)
                        .filter(k => !k.includes('referencia'))
                        .map((idKey) => {
                          const metodo = metodosPago.find(m => m.idMetodoPago.toString() === idKey);
                          if (!metodo) return null;

                          const montoActual = pagosMultimetodo[idKey];
                          const requiresRef = metodo.requiereReferencia;

                          return (
                            <div key={idKey} className="group space-y-2 bg-slate-50/80 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-600 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md">
                               <div className="flex items-center justify-between">
                                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[140px]" title={metodo.nombreMetodo}>
                                    {metodo.nombreMetodo}
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    <button 
                                       onClick={() => {
                                         const totalPagadoOtros = Object.entries(pagosMultimetodo)
                                           .filter(([id]) => id !== idKey && !id.includes('referencia_'))
                                           .reduce((acc, [_, m]) => acc + (Number(m) || 0), 0);
                                         
                                         const restante = Math.max(0, totalFinal - totalPagadoOtros);
                                         
                                         setPagosMultimetodo(prev => ({
                                           ...prev,
                                           [idKey]: restante
                                         }));
                                       }}
                                       className="text-[10px] font-semibold text-indigo-600 hover:underline bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md"
                                    >
                                      Cubrir
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setPagosMultimetodo(prev => {
                                          const newState = { ...prev };
                                          delete newState[idKey];
                                          delete newState[`referencia_${idKey}`];
                                          return newState;
                                        });
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                      <FiX className="h-3 w-3" />
                                    </button>
                                  </div>
                               </div>

                               <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                     <span className="text-slate-400 font-medium text-sm">$</span>
                                  </div>
                                  <input 
                                    type="number"
                                    value={montoActual || ''}
                                    onChange={(e) => {
                                      const val = Math.max(0, Number(e.target.value));
                                      setPagosMultimetodo(prev => ({
                                        ...prev,
                                        [idKey]: val
                                      }));
                                    }}
                                    autoFocus
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg py-2.5 pl-8 pr-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                                    placeholder="0"
                                  />
                               </div>
                               
                               {requiresRef && (
                                 <input 
                                   type="text"
                                   value={pagosMultimetodo[`referencia_${idKey}`] || ''}
                                   onChange={(e) => setPagosMultimetodo(prev => ({
                                     ...prev,
                                     [`referencia_${idKey}`]: e.target.value
                                   }))}
                                   className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 text-xs font-medium text-slate-500 focus:ring-1 focus:ring-indigo-500 mt-1"
                                   placeholder={`Ref. ${metodo.nombreMetodo}...`}
                                 />
                               )}
                            </div>
                          );
                      })}
                      
                      {/* Empty State */}
                      {Object.keys(pagosMultimetodo).filter(k => !k.includes('referencia')).length === 0 && (
                        <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                          <p className="text-sm text-slate-400">Selecciona un método de pago arriba para comenzar</p>
                        </div>
                      )}
                   </div>
                   
                   {/* Alerta de excedente */}
                   {Object.keys(pagosMultimetodo).filter(k => !k.includes('referencia')).length > 0 && (
                     (() => {
                       const totalIngresado = Object.entries(pagosMultimetodo)
                         .filter(([k]) => !k.includes('referencia'))
                         .reduce((acc, [_, v]) => acc + (Number(v) || 0), 0);
                       
                       if (totalIngresado > totalFinal) {
                         return (
                           <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2">
                              <FiInfo className="h-4 w-4 text-amber-500 flex-shrink-0" />
                              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                El total ingresado ({formatearPrecio(totalIngresado)}) excede el total de la venta en {formatearPrecio(totalIngresado - totalFinal)}.
                              </p>
                           </div>
                         );
                       }
                       return null;
                     })()
                   )}
                </div>

                {/* Cupones & Logística */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cupones & IVA */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <FiPercent className="h-4 w-4 text-indigo-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cupones & IVA</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                        <input 
                          type="text"
                          value={codigoCupon}
                          onChange={(e) => setCodigoCupon(e.target.value)}
                          disabled={infoCupon}
                          className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2.5 px-3 text-sm font-medium disabled:opacity-50"
                          placeholder="CÓDIGO..."
                        />
                        {!infoCupon ? (
                          <button onClick={aplicarCupon} className="bg-indigo-600 text-white px-4 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors">Validar</button>
                        ) : (
                          <button onClick={() => setInfoCupon(null)} className="bg-rose-50 text-rose-500 px-3 rounded-lg hover:bg-rose-100 transition-colors"><FiX /></button>
                        )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                       <span className="text-xs font-medium text-slate-500">Aplica IVA ({porcentajeIva}%)</span>
                       <button 
                        onClick={() => setAplicaIva(!aplicaIva)}
                        className={`h-5 w-9 rounded-full transition-all relative ${aplicaIva ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                         <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${aplicaIva ? 'left-4.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Logística & Notas */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <FiTruck className="h-4 w-4 text-indigo-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logística & Notas</span>
                    </div>
                    <input 
                      type="text"
                      value={direccionEntrega}
                      onChange={(e) => setDireccionEntrega(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2.5 px-3 text-sm font-medium mb-3"
                      placeholder="Dirección de entrega..."
                    />
                    <textarea 
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      rows={1}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2.5 px-3 text-sm font-medium resize-none"
                      placeholder="Alguna nota o instrucción especial..."
                    />
                  </div>
                </div>

              </div>
            )}
            {paso === 5 && (
              <div className="flex flex-col items-center justify-center py-4 space-y-6 animate-in zoom-in-95 duration-500 w-full max-w-4xl mx-auto">
                
                <div className="text-center space-y-1 mb-2">
                  <div className="mx-auto h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 shadow-lg shadow-green-500/10 mb-3 animate-bounce">
                    <FiCheck className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirmación Final</h3>
                  <p className="text-sm text-slate-400">Revisa los detalles antes de procesar</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                   
                   {/* Columna Izquierda */}
                   <div className="space-y-4">
                      {/* Datos del Cliente */}
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            <FiUser className="h-4 w-4 text-indigo-500" /> Datos del Cliente
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                             <div>
                                <p className="text-[11px] text-slate-400 font-medium mb-0.5">Nombre Completo</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cliente?.nombres} {cliente?.apellidos}</p>
                             </div>
                             <div>
                                <p className="text-[11px] text-slate-400 font-medium mb-0.5">Identificación</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cliente?.usuario}</p>
                             </div>
                             <div className="col-span-2">
                                <p className="text-[11px] text-slate-400 font-medium mb-0.5">Dirección de Entrega</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{direccionEntrega || 'Misma del perfil'}</p>
                             </div>
                          </div>
                      </div>

                      {/* Detalle de Pagos */}
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            <FiCreditCard className="h-4 w-4 text-indigo-500" /> Detalle de Pagos
                          </h4>
                          
                          <div className="space-y-2.5">
                             <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-xs text-slate-500 font-medium">Tipo de Transacción</span>
                                <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-md">
                                  {montoCredito > 0 && montoAbonado > 0 ? 'Mixto' : montoCredito > 0 ? 'Crédito' : 'Contado'}
                                </span>
                             </div>

                             {Object.entries(pagosMultimetodo)
                              .filter(([k]) => !k.includes('referencia') && Number(pagosMultimetodo[k]) > 0)
                              .map(([key, valor]) => {
                                const metodo = metodosPago.find(m => m.idMetodoPago.toString() === key);
                                return (
                                  <div key={key} className="flex justify-between items-center">
                                     <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{metodo?.nombreMetodo}</span>
                                     <span className="text-xs font-bold text-slate-800 dark:text-white">{formatearPrecio(valor)}</span>
                                  </div>
                                );
                              })}
                             
                             <div className="pt-2.5 mt-2.5 border-t border-dashed border-slate-200 dark:border-slate-600 flex justify-between items-center">
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Total a Pagar</span>
                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatearPrecio(totalFinal)}</span>
                             </div>
                          </div>
                      </div>
                   </div>

                   {/* Columna Derecha: Productos */}
                   <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full max-h-[380px]">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                        <FiShoppingBag className="h-4 w-4 text-indigo-500" /> 
                        Productos 
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 text-[11px] font-medium px-2 py-0.5 rounded-md">{carrito.length}</span>
                      </h4>
                      
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2.5">
                         {carrito.map((item, idx) => (
                           <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-600">
                              <div className="h-14 w-14 bg-white rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                                 <img src={`${UPLOAD_URL}${item.imagenVariante}`} alt="" className="h-full w-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                 <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.producto.titulo}</h5>
                                 <div className="flex flex-wrap gap-1.5 mt-1">
                                    {item.talla && (
                                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                                          {item.talla.nombreTalla}
                                        </span>
                                    )}
                                    {item.color && (
                                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                                          <div className="h-2 w-2 rounded-full border border-slate-300" style={{ backgroundColor: item.color.codigoHex }} />
                                          {item.color.nombreColor}
                                        </div>
                                    )}
                                 </div>
                              </div>
                              <div className="flex flex-col justify-center items-end text-right">
                                 <p className="text-xs text-slate-400 font-medium">x{item.cantidad}</p>
                                 <p className="text-sm font-bold text-indigo-600">{formatearPrecio(item.precioUnitario)}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar / Resumen ── */}
          <div className="w-full md:w-[320px] bg-slate-50/50 dark:bg-slate-800/30 p-6 border-l border-slate-100 dark:border-slate-800 overflow-y-auto custom-scrollbar">
            <ResumenVenta 
              subtotal={subtotalProductos} 
              descuentoTotal={totalDescuentosLinea + valorDescuentoGlobal} 
              impuestos={impuestosTotal} 
              total={totalFinal} 
            />
            
            {/* Items sidebar */}
            {carrito.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Items Seleccionados
                </p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {carrito.map((item, index) => (
                    <div
                      key={`${item.idVariante}-${index}`}
                      className="flex items-center gap-2.5 bg-white dark:bg-slate-800/80 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                      <div className="h-9 w-9 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={`${UPLOAD_URL}${item.imagenVariante}`}
                          alt={item.producto?.titulo}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                          {item.producto?.titulo}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div
                            className="h-2 w-2 rounded-full border border-slate-200 dark:border-slate-600"
                            style={{ backgroundColor: item.color?.codigoHex || '#cbd5e1' }}
                          />
                          <p className="text-[10px] text-slate-400">
                            Cant: {item.cantidad}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-indigo-600">
                        {formatearPrecio(
                          item.cantidad * item.precioUnitario - (item.descuentoLinea || 0)
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
          <button 
            onClick={handleAnterior}
            disabled={paso === 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              paso === 1 ? 'opacity-0 invisible' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FiChevronLeft className="h-4 w-4" /> Anterior
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-[10px] font-medium text-slate-300 uppercase tracking-wider">Enterprise v2026</span>
            {paso < 5 ? (
              <button 
                onClick={handleSiguiente}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm"
              >
                Siguiente <FiChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button 
                onClick={handleCrearVenta}
                disabled={procesando}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:from-green-700 hover:to-emerald-700 active:scale-[0.98] transition-all text-sm disabled:opacity-50 disabled:scale-100"
              >
                {procesando ? 'Procesando...' : 'Confirmar Venta'} <FiCheck className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ModalVenta;
