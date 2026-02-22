/**
 * @file localStorage.js
 * @brief Implementación de almacenamiento local para imágenes.
 *
 * Este módulo maneja el almacenamiento de imágenes en el sistema de archivos local,
 * manteniendo compatibilidad con el sistema actual de multer.
 */

const fs = require('fs/promises');
const path = require('path');
const { configuracionServidor } = require('../../config/serverConfig');

/**
 * @typedef {Object} LocalStorageResult
 * @property {string} url - URL pública de la imagen
 * @property {string} path - Ruta absoluta del archivo
 * @property {string} filename - Nombre del archivo
 * @property {boolean} success - Indica si la operación fue exitosa
 */

/**
 * Obtiene la ruta completa para un tipo de archivo
 * @param {string} tipo - Tipo de archivo (productos, categorias, etc.)
 * @returns {string} Ruta completa del directorio
 */
function getDirectorio(tipo) {
  return path.join(configuracionServidor.uploads.directorio, tipo);
}

/**
 * Asegura que el directorio exista
 * @param {string} directorio - Ruta del directorio
 */
async function asegurarDirectorio(directorio) {
  try {
    await fs.access(directorio);
  } catch {
    await fs.mkdir(directorio, { recursive: true });
  }
}

/**
 * Guarda un archivo en almacenamiento local
 * @param {object} file - Archivo de multer (req.file)
 * @param {string} tipo - Tipo de archivo (productos, categorias, etc.)
 * @returns {Promise<LocalStorageResult>}
 */
async function guardar(file, tipo) {
  const directorio = getDirectorio(tipo);
  await asegurarDirectorio(directorio);

  // El archivo ya fue guardado por multer en destination
  // Solo necesitamos retornar la información
  const url = `/uploads/${tipo}/${file.filename}`;

  return {
    url,
    path: file.path,
    filename: file.filename,
    success: true
  };
}

/**
 * Elimina un archivo del almacenamiento local
 * @param {string} url - URL o path del archivo
 * @returns {Promise<boolean>}
 */
async function eliminar(url) {
  try {
    // Determinar la ruta del archivo
    let filePath;
    if (url.startsWith('/uploads')) {
      filePath = path.join(configuracionServidor.uploads.directorio, '..', url);
    } else {
      filePath = path.join(configuracionServidor.uploads.directorio, url);
    }

    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.warn('⚠️ No se pudo eliminar archivo local:', error.message);
    return false;
  }
}

/**
 * Verifica si un archivo existe en almacenamiento local
 * @param {string} url - URL del archivo
 * @returns {Promise<boolean>}
 */
async function existe(url) {
  try {
    let filePath;
    if (url.startsWith('/uploads')) {
      filePath = path.join(configuracionServidor.uploads.directorio, '..', url);
    } else {
      filePath = path.join(configuracionServidor.uploads.directorio, url);
    }

    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene la URL completa para una imagen local
 * @param {string} url - URL relativa
 * @returns {string} URL completa
 */
function getUrlCompleta(url) {
  const baseUrl = configuracionServidor.entorno === 'production'
    ? process.env.BASE_URL || ''
    : 'http://localhost:3000';
  return `${baseUrl}${url}`;
}

module.exports = {
  guardar,
  eliminar,
  existe,
  getUrlCompleta,
  getDirectorio,
  asegurarDirectorio
};
