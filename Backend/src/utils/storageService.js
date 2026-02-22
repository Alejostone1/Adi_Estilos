/**
 * @file storageService.js
 * @brief Servicio unificado de almacenamiento de imágenes.
 *
 * Este servicio proporciona una abstracción sobre el almacenamiento de imágenes,
 * soportando tanto Cloudinary (producción) como almacenamiento local (desarrollo).
 *
 * Mantiene backward compatibility con el sistema existente.
 */

const fs = require('fs/promises');
const path = require('path');
const { configuracionServidor } = require('../config/serverConfig');
const {
  usarCloudinary,
  subirImagenCloudinary,
  eliminarImagenCloudinary
} = require('../config/cloudinaryConfig');

/**
 * @typedef {Object} StorageResult
 * @property {string} url - URL pública de la imagen
 * @property {string} path - Ruta interna (para eliminación local)
 * @property {string} publicId - ID público de Cloudinary (si aplica)
 * @property {boolean} isCloud - Indica si se usó Cloudinary
 */

/**
 * @typedef {Object} UploadOptions
 * @property {string} folder - Carpeta destino (productos, categorias, etc.)
 * @property {string} filename - Nombre del archivo
 */

/**
 * Sube una imagen al almacenamiento configurado
 * @param {object} file - Archivo de multer (req.file)
 * @param {UploadOptions} options - Opciones de subida
 * @returns {Promise<StorageResult>}
 */
async function subirImagen(file, options = {}) {
  const { folder = 'general', filename } = options;

  if (usarCloudinary()) {
    return await subirImagenACloudinary(file, folder);
  } else {
    return await guardarImagenLocal(file, folder, filename);
  }
}

/**
 * Sube imagen a Cloudinary
 * @param {object} file - Archivo de multer
 * @param {string} folder - Carpeta en Cloudinary
 * @returns {Promise<StorageResult>}
 */
async function subirImagenACloudinary(file, folder) {
  try {
    // Determinar el folder según el tipo
    const folderMap = {
      'productos': 'adi_estilos/productos',
      'categorias': 'adi_estilos/categorias',
      'variantes': 'adi_estilos/variantes',
      'proveedores': 'adi_estilos/proveedores',
      'perfiles': 'adi_estilos/perfiles'
    };

    const cloudFolder = folderMap[folder] || `adi_estilos/${folder}`;

    const result = await subirImagenCloudinary(file.path, {
      folder: cloudFolder,
      public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined
    });

    return {
      url: result.secure_url,
      path: file.path, // Mantener para posible limpieza
      publicId: result.public_id,
      isCloud: true
    };
  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error.message);
    // Fallback a almacenamiento local si falla Cloudinary
    console.warn('⚠️ Falling back to local storage...');
    return guardarImagenLocal(file, folder, filename);
  }
}

/**
 * Guarda imagen en almacenamiento local
 * @param {object} file - Archivo de multer
 * @param {string} subfolder - Subcarpeta (productos, categorias, etc.)
 * @param {string} filename - Nombre opcional del archivo
 * @returns {Promise<StorageResult>}
 */
async function guardarImagenLocal(file, subfolder, filename) {
  // El archivo ya fue guardado por multer, solo generamos la URL
  const nombreArchivo = filename || file.filename;
  const url = `/uploads/${subfolder}/${nombreArchivo}`;

  return {
    url: url,
    path: file.path,
    publicId: null,
    isCloud: false
  };
}

/**
 * Elimina una imagen del almacenamiento
 * @param {string} url - URL o path de la imagen
 * @param {string} [publicId] - ID público de Cloudinary (si aplica)
 * @returns {Promise<boolean>}
 */
async function eliminarImagen(url, publicId) {
  // Determinar si es una imagen de Cloudinary o local
  const isCloudinary = publicId || url.includes('cloudinary') || url.includes('res.cloudinary');

  if (isCloudinary && usarCloudinary()) {
    try {
      const id = publicId || extractPublicIdFromUrl(url);
      if (id) {
        await eliminarImagenCloudinary(id);
        console.log('🗑️ Imagen eliminada de Cloudinary:', id);
        return true;
      }
    } catch (error) {
      console.error('❌ Error deleting from Cloudinary:', error.message);
      return false;
    }
  }

  // Eliminar archivo local
  try {
    const localPath = url.startsWith('/uploads')
      ? path.join(configuracionServidor.uploads.directorio, '..', url)
      : path.join(configuracionServidor.uploads.directorio, url);

    await fs.unlink(localPath);
    console.log('🗑️ Imagen eliminada local:', localPath);
    return true;
  } catch (error) {
    console.warn('⚠️ No se pudo eliminar archivo local:', error.message);
    return false;
  }
}

/**
 * Extrae el public ID de una URL de Cloudinary
 * @param {string} url - URL de Cloudinary
 * @returns {string|null}
 */
function extractPublicIdFromUrl(url) {
  try {
    // Formato typical: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/image.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
      // Skip 'v123' version and get folder + filename
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
 * Limpia archivos temporales subidos por multer
 * @param {string} tempPath - Ruta temporal del archivo
 */
async function limpiarArchivoTemporal(tempPath) {
  try {
    await fs.unlink(tempPath);
  } catch (error) {
    // Ignorar errores de limpieza
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

module.exports = {
  subirImagen,
  eliminarImagen,
  limpiarArchivoTemporal,
  esUrlCloudinary,
  extractPublicIdFromUrl
};
