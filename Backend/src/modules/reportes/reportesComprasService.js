/**
 * Servicio para la lógica de negocio de Reportes de Compras.
 * Basado exclusivamente en el esquema Prisma actual.
 */

const { prisma } = require('../../config/databaseConfig');

/**
 * Genera un reporte detallado de compras con métricas y gráficos.
 * @param {object} params - Filtros ({ fechaInicio, fechaFin, idProveedor, idEstadoPedido, montoMin, montoMax, page, limit })
 */
async function generarReporteComprasCompleto(params) {
  const { 
    fechaInicio, 
    fechaFin, 
    idProveedor, 
    idEstadoPedido, 
    montoMin, 
    montoMax, 
    page = 1, 
    limit = 10 
  } = params;

  // 1. Construcción del Filtro Dinámico (WHERE)
  const where = {};

  if (fechaInicio && fechaFin) {
    where.fechaCompra = {
      gte: new Date(fechaInicio),
      lte: new Date(fechaFin)
    };
  }

  if (idProveedor) {
    where.idProveedor = parseInt(idProveedor);
  }

  if (idEstadoPedido) {
    where.idEstadoPedido = parseInt(idEstadoPedido);
  }

  if (montoMin || montoMax) {
    where.total = {};
    if (montoMin) where.total.gte = parseFloat(montoMin);
    if (montoMax) where.total.lte = parseFloat(montoMax);
  }

  // 2. Métricas Principales (KPIs)
  const metricasGenerales = await prisma.compra.aggregate({
    _sum: {
      total: true,
      subtotal: true,
      descuento: true,
      impuestos: true
    },
    _count: {
      idCompra: true
    },
    _avg: {
      total: true
    },
    where
  });

  const totalInversion = Number(metricasGenerales._sum.total || 0);
  const totalOrdenes = metricasGenerales._count.idCompra || 0;
  const promedioCompra = Number(metricasGenerales._avg.total || 0);

  // 3. Compras por Estado (Distribución)
  const comprasPorEstado = await prisma.compra.groupBy({
    by: ['idEstadoPedido'],
    _count: { idCompra: true },
    _sum: { total: true },
    where
  });

  const estados = await prisma.estadoPedido.findMany();
  const distributionEstados = comprasPorEstado.map(c => {
    const estado = estados.find(e => e.idEstadoPedido === c.idEstadoPedido);
    return {
      nombre: estado ? estado.nombreEstado : 'Desconocido',
      color: estado ? estado.color : '#64748b',
      cantidad: c._count.idCompra,
      total: Number(c._sum.total || 0)
    };
  });

  // 4. Compras por Proveedor (Top Inversión)
  const comprasPorProveedor = await prisma.compra.groupBy({
    by: ['idProveedor'],
    _sum: { total: true },
    _count: { idCompra: true },
    where,
    orderBy: { _sum: { total: 'desc' } },
    take: 5
  });

  const proveedoresIds = comprasPorProveedor.map(p => p.idProveedor);
  const proveedoresInfo = await prisma.proveedor.findMany({
    where: { idProveedor: { in: proveedoresIds } }
  });

  const distributionProveedores = comprasPorProveedor.map(p => {
    const info = proveedoresInfo.find(prov => prov.idProveedor === p.idProveedor);
    return {
      nombre: info ? info.nombreProveedor : 'Anónimo',
      total: Number(p._sum.total || 0),
      cantidad: p._count.idCompra
    };
  });

  // 5. Evolución Temporal (Inversión Diaria)
  const queryEvolucion = `
    SELECT 
      fecha_compra as fecha,
      COUNT(id_compra) as ordenes,
      SUM(total) as inversion
    FROM compras
    WHERE fecha_compra BETWEEN ? AND ?
    ${idProveedor ? 'AND id_proveedor = ?' : ''}
    ${idEstadoPedido ? 'AND id_estado_pedido = ?' : ''}
    GROUP BY fecha_compra
    ORDER BY fecha_compra ASC
  `;

  const rawParams = [
    where.fechaCompra?.gte || new Date('2020-01-01'),
    where.fechaCompra?.lte || new Date()
  ];
  if (idProveedor) rawParams.push(parseInt(idProveedor));
  if (idEstadoPedido) rawParams.push(parseInt(idEstadoPedido));

  const evolucionTemporal = await prisma.$queryRawUnsafe(queryEvolucion, ...rawParams);

  // 6. Listado Detallado (Tabla con paginación)
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const listadoCompras = await prisma.compra.findMany({
    where,
    include: {
      proveedor: { select: { nombreProveedor: true, nitCC: true } },
      estadoPedido: { select: { nombreEstado: true, color: true } },
      detalleCompras: { select: { idDetalleCompra: true } }
    },
    orderBy: { fechaCompra: 'desc' },
    skip,
    take: parseInt(limit)
  });

  return {
    kpis: {
      totalInversion,
      totalOrdenes,
      promedioCompra,
      totalAhorro: Number(metricasGenerales._sum.descuento || 0)
    },
    graficos: {
      porEstado: distributionEstados,
      porProveedor: distributionProveedores,
      evolucion: evolucionTemporal.map(e => ({
        fecha: new Date(e.fecha).toISOString().split('T')[0],
        ordenes: Number(e.ordenes),
        inversion: Number(e.inversion)
      }))
    },
    tabla: {
      datos: listadoCompras,
      paginacion: {
        totalItems: totalOrdenes,
        totalPages: Math.ceil(totalOrdenes / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    }
  };
}

module.exports = {
  generarReporteComprasCompleto
};
