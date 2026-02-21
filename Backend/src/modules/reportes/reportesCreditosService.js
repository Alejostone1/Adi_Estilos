/**
 * Servicio para Reportes de Créditos y Cartera.
 * Basado exclusivamente en el esquema Prisma actual.
 */

const { prisma } = require('../../config/databaseConfig');

/**
 * Genera un reporte exhaustivo de la situación de créditos.
 * @param {object} params - Filtros ({ fechaInicio, fechaFin, idUsuario, estado, soloVencidos, page, limit })
 */
async function generarReporteCreditosCompleto(params) {
  const { 
    fechaInicio, 
    fechaFin, 
    idUsuario, 
    estado, 
    soloVencidos, 
    page = 1, 
    limit = 10 
  } = params;

  const now = new Date();

  // 1. Construcción del WHERE dinámico
  const where = {};

  if (fechaInicio && fechaInicio !== '' && fechaFin && fechaFin !== '') {
    where.fechaInicio = {
      gte: new Date(fechaInicio),
      lte: new Date(fechaFin)
    };
  }

  if (idUsuario && idUsuario !== '') {
    const idU = parseInt(idUsuario);
    if (!isNaN(idU)) where.idUsuario = idU;
  }

  if (estado && estado !== '') {
    where.estado = estado;
  }

  if (soloVencidos === 'true' || soloVencidos === true) {
    where.fechaVencimiento = { lt: now };
    where.estado = { not: 'pagado' };
  }

  // 2. KPIs de Cartera
  const metricas = await prisma.credito.aggregate({
    _sum: {
      montoTotal: true,
      totalAbonado: true,
      saldoPendiente: true
    },
    _count: {
      idCredito: true
    },
    where
  });

  const sumVals = metricas._sum || {};
  const totalOtorgado = Number(sumVals.montoTotal || 0);
  const totalRecuperado = Number(sumVals.totalAbonado || 0);
  const totalPendiente = Number(sumVals.saldoPendiente || 0);
  const porcentajeRecuperacion = totalOtorgado > 0 ? (totalRecuperado / totalOtorgado) * 100 : 0;

  // 3. Créditos Vencidos (Conteo específico)
  const countVencidos = await prisma.credito.count({
    where: {
      ...where,
      fechaVencimiento: { lt: now },
      estado: { not: 'pagado' }
    }
  });

  // 4. Distribución por Estado
  const porEstado = await prisma.credito.groupBy({
    by: ['estado'],
    _count: { idCredito: true },
    _sum: { saldoPendiente: true },
    where
  });

  // 5. Evolución Mensual de Cartera (Créditos otorgados por mes)
  let evolucionMensual = [];
  try {
    const queryMensual = `
      SELECT 
        DATE_FORMAT(fecha_inicio, '%Y-%m') as mes,
        COUNT(id_credito) as cantidad,
        SUM(monto_total) as otorgado
      FROM creditos
      WHERE fecha_inicio IS NOT NULL
      GROUP BY mes
      ORDER BY mes DESC
      LIMIT 6
    `;
    const results = await prisma.$queryRawUnsafe(queryMensual);
    evolucionMensual = Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Error en queryMensual de créditos:", error);
    evolucionMensual = [];
  }

  // 6. Listado Detallado con diagnóstico
  const takeValue = Math.max(1, parseInt(limit) || 10);
  const skipValue = Math.max(0, (parseInt(page) - 1 || 0) * takeValue);

  let listado = [];
  try {
    console.log("[ReporteCreditos] Ejecutando findMany con where:", JSON.stringify(where));
    listado = await prisma.credito.findMany({
      where,
      include: {
        usuarioCliente: {
          select: {
            nombres: true,
            apellidos: true,
            cedula: true
          }
        },
        venta: {
          select: {
            numeroFactura: true,
            pagos: {
              select: {
                idPago: true,
                monto: true,
                fechaPago: true,
                metodoPago: {
                  select: {
                    nombreMetodo: true
                  }
                }
              },
              orderBy: { fechaPago: 'desc' },
              take: 3
            }
          }
        }
      },
      orderBy: { fechaVencimiento: 'asc' },
      skip: skipValue,
      take: takeValue
    });
  } catch (error) {
    console.error("[ReporteCreditos] Error en findMany:", error.message);
    // No lanzamos para ver si otros KPIs sí cargan, pero podrías lanzarlo si es crítico
    listado = [];
  }

  // Enriquecer listado
  const creditosProcesados = listado.map(c => {
    let moraCalculada = c.diasMora || 0;
    
    if (c.estado !== 'pagado' && c.fechaVencimiento && new Date(c.fechaVencimiento) < now) {
      const diffTime = Math.abs(now - new Date(c.fechaVencimiento));
      moraCalculada = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return { 
      ...c, 
      usuario: c.usuarioCliente || { nombres: 'N/A', apellidos: '', cedula: 'N/A' },
      diasMora: moraCalculada 
    };
  });

  return {
    kpis: {
      totalOtorgado,
      totalRecuperado,
      totalPendiente,
      porcentajeRecuperacion,
      countCreditos: (metricas._count && metricas._count.idCredito) ? metricas._count.idCredito : 0,
      countVencidos: countVencidos || 0
    },
    graficos: {
      estados: porEstado || [],
      evolucion: (evolucionMensual || []).map(e => ({
        mes: e.mes || 'N/A',
        otorgado: Number(e.otorgado || 0),
        cantidad: Number(e.cantidad || 0)
      }))
    },
    tabla: {
      datos: creditosProcesados,
      paginacion: {
        totalItems: (metricas._count && metricas._count.idCredito) ? metricas._count.idCredito : 0,
        totalPages: Math.ceil(((metricas._count && metricas._count.idCredito) ? metricas._count.idCredito : 0) / takeValue),
        currentPage: parseInt(page) || 1,
        limit: takeValue
      }
    }
  };
}

module.exports = {
  generarReporteCreditosCompleto
};
