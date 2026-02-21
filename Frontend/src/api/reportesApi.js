/**
 * @file reportesApi.js
 * @brief Funciones para interactuar con los endpoints de reportes de la API.
 */

import apiClient from './axiosConfig';

/**
 * Obtiene los datos del dashboard desde el backend.
 * @returns {Promise<object>} La respuesta del servidor, que incluye las estadísticas del dashboard.
 */
export const getDashboardData = async () => {
  try {
    const response = await apiClient.get('/reportes/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Obtiene el reporte completo de ventas con filtros.
 * @param {object} params - Filtros ({ fechaInicio, fechaFin, idEstadoPedido, idUsuario, page, limit })
 * @returns {Promise<object>} Datos del reporte detallado.
 */
export const getVentasReport = async (params) => {
  try {
    const response = await apiClient.get('/reportes/ventas', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Obtiene reporte de inventario.
 */
export const getInventarioReport = async () => {
  try {
    const response = await apiClient.get('/reportes/inventario');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Obtiene reporte de créditos.
 */
/**
 * Obtiene el reporte avanzado de créditos y cartera.
 */
export const getCreditosReport = async (params) => {
  try {
    const response = await apiClient.get('/reportes/creditos', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Obtiene el reporte detallado de compras con filtros.
 */
export const getComprasReport = async (params) => {
  try {
    const response = await apiClient.get('/reportes/compras', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
