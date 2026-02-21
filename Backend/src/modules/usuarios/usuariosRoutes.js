/**
 * Rutas para el módulo de gestión de usuarios.
 * Define los endpoints para las operaciones CRUD de usuarios.
 */

// --- IMPORTACIONES ---
const { Router } = require('express');
const {
  obtenerTodosLosUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstadoUsuario,
  obtenerUsuariosConCredito,
  obtenerMetricasUsuario,
  obtenerHistorialVentasUsuario,
  obtenerHistorialCreditosUsuario
} = require('./usuariosController');
const { verificarTokenMiddleware, verificarRol } = require('../../middleware/authMiddleware');

// Crear una instancia del enrutador
const router = Router();

// --- MIDDLEWARE DE AUTENTICACIÓN ---
router.use(verificarTokenMiddleware);

// --- IMPORTAR MIDDLEWARES ADICIONALES ---
const { verificarPropiedad } = require('../../middleware/authMiddleware');

// --- DEFINICIÓN DE RUTAS ---

/**
 * @route   GET /api/usuarios
 * @desc    Obtener todos los usuarios.
 * @access  Administrador
 */
router.get('/', verificarRol('Administrador'), obtenerTodosLosUsuarios);

/**
 * @route   POST /api/usuarios
 * @desc    Crear un nuevo usuario.
 * @access  Administrador
 */
router.post('/', verificarRol('Administrador'), crearUsuario);

/**
 * @route   GET /api/usuarios/con-credito
 * @desc    Obtener clientes con crédito activo.
 * @access  Administrador, Vendedor
 */
router.get('/con-credito', verificarRol(['Administrador', 'Vendedor']), obtenerUsuariosConCredito);

/**
 * @route   GET /api/usuarios/:id
 * @desc    Obtener un usuario por su ID.
 * @access  Administrador o Propietario
 */
router.get('/:id', verificarPropiedad('id'), obtenerUsuarioPorId);

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Actualizar un usuario existente.
 * @access  Administrador
 */
router.put('/:id', verificarRol('Administrador'), actualizarUsuario);

/**
 * @route   DELETE /api/usuarios/:id
 * @desc    Eliminar (soft delete) un usuario.
 * @access  Administrador
 */
router.delete('/:id', verificarRol('Administrador'), eliminarUsuario);

/**
 * @route   PATCH /api/usuarios/:id/estado
 * @desc    Cambiar el estado de un usuario.
 * @access  Administrador
 */
router.patch('/:id/estado', verificarRol('Administrador'), cambiarEstadoUsuario);

/**
 * @route   GET /api/usuarios/:id/metricas
 * @desc    Obtener métricas de un usuario.
 * @access  Administrador o Propietario
 */
router.get('/:id/metricas', verificarPropiedad('id'), obtenerMetricasUsuario);

/**
 * @route   GET /api/usuarios/:id/ventas
 * @desc    Obtener historial de ventas de un usuario.
 * @access  Administrador o Propietario
 */
router.get('/:id/ventas', verificarPropiedad('id'), obtenerHistorialVentasUsuario);

/**
 * @route   GET /api/usuarios/:id/creditos
 * @desc    Obtener historial de créditos de un usuario.
 * @access  Administrador o Propietario
 */
router.get('/:id/creditos', verificarPropiedad('id'), obtenerHistorialCreditosUsuario);


// --- EXPORTACIÓN ---
module.exports = router;
