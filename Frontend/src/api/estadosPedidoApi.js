import apiClient from './axiosConfig';

const getEstadosPedido = async (soloActivos = false) => {
  try {
    const params = soloActivos ? { activos: 'true' } : {};
    const response = await apiClient.get('/estados-pedido', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const getEstadoPedidoById = async (id) => {
  try {
    const response = await apiClient.get(`/estados-pedido/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const crearEstadoPedido = async (datos) => {
  try {
    const response = await apiClient.post('/estados-pedido', datos);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const actualizarEstadoPedido = async (id, datos) => {
  try {
    const response = await apiClient.put(`/estados-pedido/${id}`, datos);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const eliminarEstadoPedido = async (id) => {
  try {
    const response = await apiClient.delete(`/estados-pedido/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const estadosPedidoApi = {
  getEstadosPedido,
  getEstadoPedidoById,
  crearEstadoPedido,
  actualizarEstadoPedido,
  eliminarEstadoPedido,
};
