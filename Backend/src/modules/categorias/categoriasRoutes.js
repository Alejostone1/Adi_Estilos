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
const storageService = require('../../services/storage/storageService');

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
router.post('/upload', middlewareDeGestion, async (req, res) => {
  try {
    // Primero ejecutamos el middleware de multer
    await new Promise((resolve, reject) => {
      subirImagenCategoria(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.file) {
      return res.status(400).json({
        mensaje: 'No se ha subido ninguna imagen'
      });
    }

    // Usar storageService para guardar la imagen (soporta local/cloudinary/hybrid)
    const resultado = await storageService.guardar(req.file, 'categorias');

    res.status(200).json({
      mensaje: 'Imagen subida exitosamente',
      url: resultado.url,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      mensaje: 'Error al subir la imagen',
      error: error.message
    });
  }
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
