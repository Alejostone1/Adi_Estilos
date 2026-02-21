/**
 * Controlador para Reportes de Créditos.
 */

const reportesCreditosService = require('./reportesCreditosService');
const { respuestaExitosa } = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

/**
 * Obtiene el reporte analítico de cartera y créditos.
 * @route GET /api/reportes/creditos/detallado
 */
const obtenerReporteCreditosFull = capturarErroresAsync(async (req, res) => {
  const { 
    fechaInicio, 
    fechaFin, 
    idUsuario, 
    estado, 
    soloVencidos,
    page, 
    limit 
  } = req.query;

  const reporte = await reportesCreditosService.generarReporteCreditosCompleto({
    fechaInicio,
    fechaFin,
    idUsuario,
    estado,
    soloVencidos,
    page,
    limit
  });

  res.status(200).json(respuestaExitosa(reporte, 'Reporte de cartera generado exitosamente.'));
});

module.exports = {
  obtenerReporteCreditosFull
};
