/**
 * @file storageService.js
 * @brief Servicio unificado de almacenamiento de imágenes.
 *
 * Este servicio es el DECISOR que determina dónde guardar las imágenes
 * según la configuración (local, cloudinary, o hybrid).
 *
 * Mantiene backward compatibility 100% con el sistema existente.
 */

const localStorage = require('./localStorage');
const cloudinaryStorage = require('./cloudinaryStorage');

/**
 * Modos de almacenamiento disponibles
 */
const STORAGE_MODES = {
  LOCAL: 'local',
  CLOUDINARY: 'cloudinary',
  HYBRID: 'hybrid'
};

/**
 * Obtiene el modo de almacenamiento configurado
 * @returns {string} Modo de almacenamiento
 */
function getModo() {
  return process.env.STORAGE_MODE || STORAGE_MODES.LOCAL;
}

/**
 * Verifica si el modo es local
 * @returns {boolean}
 */
function isLocal() {
  return getModo() === STORAGE_MODES.LOCAL;
}

/**
 * Verifica si el modo es cloudinary
 * @returns {boolean}
 */
function isCloudinary() {
  return getModo() === STORAGE_MODES.CLOUDINARY;
}

/**
 * Verifica si el modo es hybrid
 * @returns {boolean}
 */
function isHybrid() {
  return getModo() === STORAGE_MODES.HYBRID;
}

/**
 * Guarda una imagen según el modo configurado
 * @param {object} file - Archivo de multer (req.file)
 * @param {string} tipo - Tipo de archivo (productos, categorias, etc.)
 * @returns {Promise<Object>} Resultado con url, publicId (si aplica), y metadata
 */
async function guardar(file, tipo) {
  const modo = getModo();

  console.log(`📦 Guardando imagen en modo: ${modo} (tipo: ${tipo})`);

  if (modo === STORAGE_MODES.LOCAL) {
    return await localStorage.guardar(file, tipo);
  }

  if (modo === STORAGE_MODES.CLOUDINARY) {
    // Verificar si Cloudinary está configurado
    if (!cloudinaryStorage.estaConfigurado()) {
      console.warn('⚠️ Cloudinary no configurado, usando modo local...');
      return await localStorage.guardar(file, tipo);
    }
    return await cloudinaryStorage.guardar(file, tipo);
  }

  if (modo === STORAGE_MODES.HYBRID) {
    return await guardarHybrid(file, tipo);
  }

  // Por defecto, usar local
  return await localStorage.guardar(file, tipo);
}

/**
 * Guarda una imagen en modo híbrido (local + cloudinary)
 * @param {object} file - Archivo de multer
 * @param {string} tipo - Tipo de archivo
 * @returns {Promise<Object>}
 */
async function guardarHybrid(file, tipo) {
  const cloudConfigured = cloudinaryStorage.estaConfigurado();

  if (cloudConfigured) {
    try {
      // 1. Primero guardar en Cloudinary
      const cloudResult = await cloudinaryStorage.guardar(file, tipo);

      // 2. También guardar localmente como backup
      try {
        await localStorage.guardar(file, tipo);
      } catch (localError) {
        console.warn('⚠️ Error guardando backup local:', localError.message);
      }

      // 3. Retornar resultado de Cloudinary como principal
      return {
        ...cloudResult,
        backupLocal: true
      };
    } catch (cloudError) {
      console.error('❌ Error en Cloudinary, usando local:', cloudError.message);
      return await localStorage.guardar(file, tipo);
    }
  }

  // Si Cloudinary no está configurado, usar solo local
  console.warn('⚠️ Cloudinary no configurado en modo hybrid, usando local...');
  return await localStorage.guardar(file, tipo);
}

/**
 * Elimina una imagen según el modo configurado
 * @param {string} url - URL de la imagen
 * @returns {Promise<boolean>}
 */
async function eliminar(url) {
  const modo = getModo();

  console.log(`🗑️ Eliminando imagen en modo: ${modo}`);

  if (modo === STORAGE_MODES.LOCAL) {
    return await localStorage.eliminar(url);
  }

  if (modo === STORAGE_MODES.CLOUDINARY) {
    if (cloudinaryStorage.esUrlCloudinary(url)) {
      return await cloudinaryStorage.eliminarPorUrl(url);
    }
    // Si es URL local, intentar eliminar local
    return await localStorage.eliminar(url);
  }

  if (modo === STORAGE_MODES.HYBRID) {
    // Eliminar de ambos lugares
    let success = true;

    // Eliminar de Cloudinary si es URL cloud
    if (cloudinaryStorage.esUrlCloudinary(url)) {
      const cloudSuccess = await cloudinaryStorage.eliminarPorUrl(url);
      success = success && cloudSuccess;
    }

    // También eliminar local como backup
    const localSuccess = await localStorage.eliminar(url);
    success = success && localSuccess;

    return success;
  }

  return await localStorage.eliminar(url);
}

/**
 * Verifica si una imagen existe
 * @param {string} url - URL de la imagen
 * @returns {Promise<boolean>}
 */
async function existe(url) {
  if (cloudinaryStorage.esUrlCloudinary(url)) {
    // Las imágenes de Cloudinary siempre existen si la URL es válida
    return true;
  }
  return await localStorage.existe(url);
}

/**
 * Obtiene la URL completa para una imagen local
 * @param {string} url - URL relativa
 * @returns {string} URL completa
 */
function getUrlCompleta(url) {
  return localStorage.getUrlCompleta(url);
}

/**
 * Verifica si el almacenamiento está configurado correctamente
 * @returns {Object} Estado de la configuración
 */
function getEstado() {
  const modo = getModo();
  const cloudConfigured = cloudinaryStorage.estaConfigurado();

  return {
    modo,
    local: true,
    cloudinary: cloudConfigured,
    hybrid: modo === STORAGE_MODES.HYBRID && cloudConfigured,
    list: Object.values(STORAGE_MODES)
  };
}

module.exports = {
  // Constantes
  STORAGE_MODES,

  // Funciones principales
  guardar,
  eliminar,
  existe,
  getUrlCompleta,
  getEstado,

  // Funciones utilitarias
  getModo,
  isLocal,
  isCloudinary,
  isHybrid,

  // Módulos internos (para uso directo si es necesario)
  localStorage,
  cloudinaryStorage
};
