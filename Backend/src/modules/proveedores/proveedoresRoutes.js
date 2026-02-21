const express = require('express');
const router = express.Router();

const proveedoresController = require('./proveedoresController');
const { rutaAdministrador } = require('../../middleware/authMiddleware');
const { subirImagenProveedor } = require('../../middleware/uploadMiddleware');

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
router.post('/upload', rutaAdministrador(), subirImagenProveedor, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      mensaje: 'No se ha subido ninguna imagen' 
    });
  }
  
  const urlImagen = `/uploads/proveedores/${req.file.filename}`;
  res.status(200).json({ 
    mensaje: 'Imagen subida exitosamente',
    url: urlImagen,
    filename: req.file.filename
  });
});

module.exports = router;
