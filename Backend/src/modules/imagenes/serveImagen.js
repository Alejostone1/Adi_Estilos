/**
 * @file serveImagen.js
 * @brief Controlador para servir imágenes a través de la API (alternativa a archivos estáticos)
 */

const path = require('path');
const fs = require('fs');
const { configuracionServidor } = require('../../config/serverConfig');

/**
 * @function servirImagen
 * @brief Sirve una imagen específica desde la carpeta uploads
 */
const servirImagen = (req, res) => {
  try {
    const { ruta } = req.params;
    
    // Seguridad: validar que la ruta no contenga caracteres peligrosos
    if (!ruta || ruta.includes('..') || ruta.includes('\\')) {
      return res.status(400).json({ error: 'Ruta no válida' });
    }

    // Construir la ruta completa al archivo
    const rutaCompleta = path.join(configuracionServidor.uploads.directorio, ruta);
    
    console.log('🖼️ Sirviendo imagen desde:', rutaCompleta);

    // Verificar que el archivo existe
    if (!fs.existsSync(rutaCompleta)) {
      console.log('❌ Archivo no encontrado:', rutaCompleta);
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    // Obtener la extensión del archivo para determinar el MIME type
    const extension = path.extname(ruta).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    const mimeType = mimeTypes[extension] || 'image/jpeg';

    // Configurar headers CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');

    // Establecer el Content-Type
    res.contentType(mimeType);

    // Enviar el archivo
    res.sendFile(rutaCompleta);
    
  } catch (error) {
    console.error('💥 Error al servir imagen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  servirImagen
};
