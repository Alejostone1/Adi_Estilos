/**
 * Rutas para el módulo de Categorías.
 */

// --- IMPORTACIONES ---
const { Router } = require('express');
const {
  obtenerTodasLasCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} = require('./categoriasController');
const { verificarTokenMiddleware, verificarRol } = require('../../middleware/authMiddleware');
const { validar, esquemas } = require('../../middleware/validationMiddleware');
const { subirImagenCategoria } = require('../../middleware/uploadMiddleware');

// Crear una instancia del enrutador
const router = Router();

// --- DEFINICIÓN DE RUTAS ---

// =================================================================
// CONFIGURACIÓN DE MIDDLEWARES
// =================================================================

const rolesPermitidos = ['Administrador', 'Bodeguero'];
const middlewareDeGestion = [verificarTokenMiddleware, verificarRol(rolesPermitidos)];

// =================================================================
// RUTAS PÚBLICAS
// =================================================================

/**
 * @route   GET /api/categorias
 * @desc    Obtener todas las categorías (plana o jerárquica).
 * @access  Público
 */
router.get('/', obtenerTodasLasCategorias);

/**
 * @route   GET /api/categorias/:id
 * @desc    Obtener una categoría por ID.
 * @access  Público
 */
router.get('/:id', validar(esquemas.idEnUrl), obtenerCategoriaPorId);

/**
 * @route   POST /api/categorias/upload
 * @desc    Subir imagen de categoría.
 * @access  Administrador, Bodeguero
 */
router.post('/upload', middlewareDeGestion, subirImagenCategoria, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      mensaje: 'No se ha subido ninguna imagen'
    });
  }

  const urlImagen = `/uploads/categorias/${req.file.filename}`;
  res.status(200).json({
    mensaje: 'Imagen subida exitosamente',
    url: urlImagen,
    filename: req.file.filename
  });
});

// =================================================================
// RUTAS PROTEGIDAS (Administración)
// =================================================================

/**
 * @route   POST /api/categorias
 * @desc    Crear una nueva categoría.
 * @access  Administrador, Bodeguero
 */
router.post(
  '/',
  middlewareDeGestion,
  // Aquí se podría añadir un esquema de validación para la creación
  crearCategoria
);

/**
 * @route   PUT /api/categorias/:id
 * @desc    Actualizar una categoría.
 * @access  Administrador, Bodeguero
 */
router.put(
  '/:id',
  middlewareDeGestion,
  validar(esquemas.idEnUrl),
  actualizarCategoria
);

/**
 * @route   DELETE /api/categorias/:id
 * @desc    Eliminar una categoría.
 * @access  Administrador, Bodeguero
 */
router.delete(
  '/:id',
  middlewareDeGestion,
  validar(esquemas.idEnUrl),
  eliminarCategoria
);


// --- EXPORTACIÓN ---
module.exports = router;
