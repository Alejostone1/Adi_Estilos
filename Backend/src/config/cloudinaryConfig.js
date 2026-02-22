/**
 * @file cloudinaryConfig.js
 * @brief Configuración de Cloudinary para almacenamiento de imágenes en la nube.
 *
 * Este archivo configura la conexión con Cloudinary para almacenar imágenes
 * de forma persistente en la nube, reemplazando el almacenamiento local.
 */

const cloudinary = require('cloudinary').v2;
const { configuracionServidor } = require('./serverConfig');

// Configuración de Cloudinary desde variables de entorno
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dm5qezkoc',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
};

// Validar que las credenciales estén configuradas
if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️ Cloudinary credentials not fully configured. Using local storage.');
}

// Configurar Cloudinary
cloudinary.config(cloudinaryConfig);

/**
 * Función para verificar la conexión con Cloudinary
 * @returns {Promise<boolean>}
 */
async function verificarConexionCloudinary() {
  try {
    const result = await cloudinary.api.ping();
    return result.status === 'ok';
  } catch (error) {
    console.error('❌ Error connecting to Cloudinary:', error.message);
    return false;
  }
}

/**
 * Determina si se debe usar Cloudinary o almacenamiento local
 * @returns {boolean}
 */
function usarCloudinary() {
  // Usar Cloudinary si está configurado y no estamos en modo desarrollo forzado
  const usarCloud = process.env.USE_CLOUDINARY === 'true' || configuracionServidor.entorno === 'production';
  const tieneCredenciales = !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

  return usarCloud && tieneCredenciales;
}

/**
 * Sube una imagen a Cloudinary
 * @param {string} filePath - Ruta temporal del archivo
 * @param {object} options - Opciones de Cloudinary (folder, public_id, etc.)
 * @returns {Promise<object>}
 */
async function subirImagenCloudinary(filePath, options = {}) {
  const defaultOptions = {
    folder: options.folder || 'adi_estilos',
    resource_type: 'image',
    transformation: [
      { quality: 'auto:good', fetch_format: 'auto' }
    ]
  };

  const uploadOptions = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, uploadOptions, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Elimina una imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen en Cloudinary
 * @returns {Promise<object>}
 */
async function eliminarImagenCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

/**
 * Genera una URL optimizada para una imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen
 * @param {object} transformations - Transformaciones a aplicar
 * @returns {string}
 */
function obtenerUrlCloudinary(publicId, transformations = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations
  });
}

module.exports = {
  cloudinary,
  cloudinaryConfig,
  verificarConexionCloudinary,
  usarCloudinary,
  subirImagenCloudinary,
  eliminarImagenCloudinary,
  obtenerUrlCloudinary
};
