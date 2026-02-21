
const express = require('express');
const router = express.Router();
const {
  obtenerTodosEstadosPedido,
  obtenerEstadoPedidoPorId,
  crearEstadoPedido,
  actualizarEstadoPedido,
  eliminarEstadoPedido,
} = require('./estadosPedidoController');
const { verificarTokenMiddleware, rutaAdministrador } = require('../../middleware/authMiddleware');

// Rutas para los estados de pedido

// Obtener todos los estados de pedido (protegido)
router.get('/', verificarTokenMiddleware, obtenerTodosEstadosPedido);

// Obtener un estado de pedido por ID (protegido)
router.get('/:id', verificarTokenMiddleware, obtenerEstadoPedidoPorId);

// Crear un nuevo estado de pedido (solo administradores)
router.post('/', rutaAdministrador(), crearEstadoPedido);

// Actualizar un estado de pedido (solo administradores)
router.put('/:id', rutaAdministrador(), actualizarEstadoPedido);

// Eliminar (desactivar) un estado de pedido (solo administradores)
router.delete('/:id', rutaAdministrador(), eliminarEstadoPedido);

module.exports = router;
