/**
 * @file cloudinaryStorage.js
 * @brief Implementación de almacenamiento en Cloudinary para imágenes.
 *
 * Este módulo maneja la subida y eliminación de imágenes en Cloudinary,
 * proporcionando almacenamiento cloud profesional.
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises');
const path = require('path');

// Configuración de Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dm5qezkoc',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
};

// Inicializar solo si hay credenciales
if (cloudinaryConfig.api_key && cloudinaryConfig.api_secret) {
  cloudinary.config(cloudinaryConfig);
}

/**
 * @typedef {Object} CloudinaryStorageResult
 * @property {string} url - URL pública de la imagen en Cloudinary
 * @property {string} publicId - ID público de Cloudinary
 * @property {string} version - Versión de la imagen
 * @property {boolean} success - Indica si la operación fue exitosa
 */

/**
 * Mapeo de tipos a carpetas en Cloudinary
 */
const folderMap = {
  'productos': 'adi_estilos/productos',
  'categorias': 'adi_estilos/categorias',
  'variantes': 'adi_estilos/variantes',
  'proveedores': 'adi_estilos/proveedores',
  'perfiles': 'adi_estilos/perfiles',
  'general': 'adi_estilos/general'
};

/**
 * Sube una imagen a Cloudinary
 * @param {object} file - Archivo de multer (req.file)
 * @param {string} tipo - Tipo de archivo
 * @returns {Promise<CloudinaryStorageResult>}
 */
async function guardar(file, tipo) {
  const folder = folderMap[tipo] || `adi_estilos/${tipo}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    }, (error, result) => {
      if (error) {
        console.error('❌ Error uploading to Cloudinary:', error.message);
        reject(error);
      } else {
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          version: result.version,
          success: true
        });
      }
    });
  });
}

/**
 * Elimina una imagen de Cloudinary
 * @param {string} publicId - ID público de Cloudinary
 * @returns {Promise<boolean>}
 */
async function eliminar(publicId) {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('❌ Error deleting from Cloudinary:', error.message);
        resolve(false);
      } else {
        console.log('🗑️ Imagen eliminada de Cloudinary:', publicId);
        resolve(result.result === 'ok');
      }
    });
  });
}

/**
 * Elimina una imagen de Cloudinary usando URL
 * @param {string} url - URL de la imagen
 * @returns {Promise<boolean>}
 */
async function eliminarPorUrl(url) {
  const publicId = extraerPublicId(url);
  if (publicId) {
    return eliminar(publicId);
  }
  return false;
}

/**
 * Extrae el public ID de una URL de Cloudinary
 * @param {string} url - URL de Cloudinary
 * @returns {string|null}
 */
function extraerPublicId(url) {
  try {
    // Formato: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/image.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
      const version = parts[uploadIndex + 1];
      if (version.startsWith('v')) {
        return parts.slice(uploadIndex + 2).join('/').replace(/\.[^/.]+$/, '');
      }
      return parts.slice(uploadIndex + 1).join('/').replace(/\.[^/.]+$/, '');
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Verifica si una URL es de Cloudinary
 * @param {string} url - URL a verificar
 * @returns {boolean}
 */
function esUrlCloudinary(url) {
  return url.includes('res.cloudinary') || url.includes('cloudinary.com');
}

/**
 * Obtiene una URL optimizada con transformaciones
 * @param {string} url - URL original
 * @param {object} options - Opciones de transformación
 * @returns {string}
 */
function obtenerUrlTransformada(url, options = {}) {
  const publicId = extraerPublicId(url);
  if (!publicId) return url;

  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
}

/**
 * Verifica la conexión con Cloudinary
 * @returns {Promise<boolean>}
 */
async function verificarConexion() {
  try {
    const result = await cloudinary.api.ping();
    return result.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Verifica si Cloudinary está configurado
 * @returns {boolean}
 */
function estaConfigurado() {
  return !!(cloudinaryConfig.api_key && cloudinaryConfig.api_secret);
}

module.exports = {
  guardar,
  eliminar,
  eliminarPorUrl,
  extraerPublicId,
  esUrlCloudinary,
  obtenerUrlTransformada,
  verificarConexion,
  estaConfigurado,
  cloudinary
};
