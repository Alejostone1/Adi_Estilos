/**
 * Controlador para Estados de Pedido.
 */

// --- IMPORTACIONES ---
const estadosPedidoService = require('./estadosPedidoService');
const { respuestaExitosa, respuestaCreada } = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADORES ---

const obtenerTodosEstadosPedido = capturarErroresAsync(async (req, res) => {
  const soloActivos = req.query.activos === 'true';
  const estados = await estadosPedidoService.obtenerTodos(soloActivos);
  res.status(200).json(respuestaExitosa(estados));
});

const obtenerEstadoPedidoPorId = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const estado = await estadosPedidoService.obtenerPorId(id);
  res.status(200).json(respuestaExitosa(estado));
});

const crearEstadoPedido = capturarErroresAsync(async (req, res) => {
  const nuevoEstado = await estadosPedidoService.crear(req.body);
  res.status(201).json(respuestaCreada(nuevoEstado));
});

const actualizarEstadoPedido = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const estadoActualizado = await estadosPedidoService.actualizar(id, req.body);
  res.status(200).json(respuestaExitosa(estadoActualizado));
});

const eliminarEstadoPedido = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const resultado = await estadosPedidoService.eliminar(id);
  res.status(200).json(respuestaExitosa(resultado));
});


// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodosEstadosPedido,
  obtenerEstadoPedidoPorId,
  crearEstadoPedido,
  actualizarEstadoPedido,
  eliminarEstadoPedido
};
