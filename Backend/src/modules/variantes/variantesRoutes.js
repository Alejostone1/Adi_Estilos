
/**
 * @file variantesRoutes.js
 * @brief Archivo de rutas para el módulo de Variantes de Producto.
 *
 * Este archivo define los endpoints de la API para gestionar las variantes.
 * Asocia las rutas HTTP con las funciones del controlador correspondientes
 * para realizar operaciones CRUD sobre las variantes.
 */

const express = require('express');
const router = express.Router();
const variantesController = require('./variantesController');
const { subirImagenVariante } = require('../../middleware/uploadMiddleware');
const { rutaAdministrador, verificarTokenMiddleware } = require('../../middleware/authMiddleware');

/**
 * @route GET /api/variantes
 * @description Ruta para listar todas las variantes. Acepta un query param `productoId`
 * para filtrar las variantes por un producto específico.
 * @access Público
 * @example GET /api/variantes?productoId=1
 */
router.get('/', variantesController.listarVariantes);

/**
 * @route GET /api/variantes/producto/:idProducto
 * @description Ruta para obtener variantes de un producto específico.
 * @access Público
 * @example GET /api/variantes/producto/1
 */
router.get('/producto/:idProducto', variantesController.obtenerVariantesPorProducto);

/**
 * @route GET /api/variantes/:id
 * @description Ruta para obtener una variante específica por su ID.
 * @access Público
 */
router.get('/:id', variantesController.obtenerVariantePorId);

/**
 * @route POST /api/variantes
 * @description Ruta para la creación de una nueva variante de producto.
 * @access Protegido (requiere autenticación y autorización)
 */
router.post('/', rutaAdministrador(), variantesController.crearVariante);

/**
 * @route PUT /api/variantes/:id
 * @description Ruta para actualizar una variante existente por su ID.
 * @access Protegido (requiere autenticación y autorización)
 */
router.put('/:id', rutaAdministrador(), variantesController.actualizarVariante);

/**
 * @route DELETE /api/variantes/:id
 * @description Ruta para realizar un borrado lógico (desactivar) de una variante por su ID.
 * @access Protegido (requiere autenticación y autorización)
 */
router.delete('/:id', rutaAdministrador(), variantesController.eliminarVariante);

/**
 * @route POST /api/variantes/upload
 * @description Sube una imagen para una variante y devuelve la URL.
 * @access Protegido
 */
router.post('/upload', verificarTokenMiddleware, subirImagenVariante, (req, res) => {
    if (!req.file) {
      return res.status(400).json({ 
        mensaje: 'No se ha subido ninguna imagen' 
      });
    }
    
    const urlImagen = `/uploads/variantes/${req.file.filename}`;
    res.status(200).json({ 
      mensaje: 'Imagen de variante subida exitosamente',
      url: urlImagen,
      filename: req.file.filename
    });
});

// Exportar el enrutador para su uso en la aplicación principal
module.exports = router;
