// Frontend/src/utils/fileUtils.js

const FILES_BASE_URL = import.meta.env.VITE_FILES_URL || '';

/**
 * Construye la URL completa para un archivo (imagen, etc.).
 * @param {string} pathFromServer - La ruta del archivo tal como viene de la base de datos (ej: /uploads/productos/...).
 * @returns {string|null} La URL completa del archivo, o null si la ruta es inválida.
 */
export const getFileUrl = (pathFromServer) => {
  if (!pathFromServer) {
    return null; // O una imagen de fallback
  }
  // La ruta de la BD ya incluye '/uploads', solo se concatena la base del servidor.
  return `${FILES_BASE_URL}${pathFromServer}`;
};
