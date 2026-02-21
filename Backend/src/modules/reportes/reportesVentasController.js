/**
 * Controlador para Reportes de Ventas.
 * Maneja las solicitudes para generar análisis detallados de la operación comercial.
 */

const reportesVentasService = require('./reportesVentasService');
const { respuestaExitosa } = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

/**
 * Genera el reporte completo de ventas basado en filtros.
 * @route GET /api/reportes/ventas
 */
const obtenerReporteVentas = capturarErroresAsync(async (req, res) => {
  const { 
    fechaInicio, 
    fechaFin, 
    idEstadoPedido, 
    idUsuario, 
    page, 
    limit 
  } = req.query;

  const reporte = await reportesVentasService.generarReporteVentasCompleto({
    fechaInicio,
    fechaFin,
    idEstadoPedido,
    idUsuario,
    page,
    limit
  });

  res.status(200).json(respuestaExitosa(reporte, 'Reporte de ventas generado exitosamente.'));
});

module.exports = {
  obtenerReporteVentas
};
