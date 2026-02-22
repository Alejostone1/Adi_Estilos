const express = require('express');
const router = express.Router();

const proveedoresController = require('./proveedoresController');
const { rutaAdministrador } = require('../../middleware/authMiddleware');
const { subirImagenProveedor } = require('../../middleware/uploadMiddleware');
const storageService = require('../../services/storage/storageService');

// ===============================================
//      RUTAS PARA PROVEEDORES (solo admin)
// ===============================================

// GET /api/proveedores
router.get('/', rutaAdministrador(), proveedoresController.listarProveedores);

// GET /api/proveedores/:id
router.get('/:id', rutaAdministrador(), proveedoresController.obtenerProveedor);

// POST /api/proveedores
router.post('/', rutaAdministrador(), proveedoresController.crearProveedor);

// PUT /api/proveedores/:id
router.put('/:id', rutaAdministrador(), proveedoresController.actualizarProveedor);

// DELETE /api/proveedores/:id
router.delete('/:id', rutaAdministrador(), proveedoresController.eliminarProveedor);

// POST /api/proveedores/upload - Subir imagen de proveedor
router.post('/upload', rutaAdministrador(), async (req, res) => {
  try {
    // Ejecutar middleware de multer
    await new Promise((resolve, reject) => {
      subirImagenProveedor(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.file) {
      return res.status(400).json({
        mensaje: 'No se ha subido ninguna imagen'
      });
    }

    // Usar storageService para guardar la imagen
    const resultado = await storageService.guardar(req.file, 'proveedores');

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

module.exports = router;
