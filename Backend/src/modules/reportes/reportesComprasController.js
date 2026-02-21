/**
 * Controlador para Reportes de Compras.
 */

const reportesComprasService = require('./reportesComprasService');
const { respuestaExitosa } = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

/**
 * Obtiene el reporte analítico de compras basado en filtros de búsqueda.
 * @route GET /api/reportes/compras
 */
const obtenerReporteCompras = capturarErroresAsync(async (req, res) => {
  const { 
    fechaInicio, 
    fechaFin, 
    idProveedor, 
    idEstadoPedido, 
    montoMin, 
    montoMax, 
    page, 
    limit 
  } = req.query;

  const reporte = await reportesComprasService.generarReporteComprasCompleto({
    fechaInicio,
    fechaFin,
    idProveedor,
    idEstadoPedido,
    montoMin,
    montoMax,
    page,
    limit
  });

  res.status(200).json(respuestaExitosa(reporte, 'Reporte de compras generado exitosamente.'));
});

module.exports = {
  obtenerReporteCompras
};
