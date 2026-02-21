/**
 * Servicio para la lógica de negocio de Reportes de Ventas.
 * Genera métricas detalladas y reportes consolidados basados en el esquema Prisma actual.
 */

const { prisma } = require('../../config/databaseConfig');
const { ErrorValidacion } = require('../../utils/errorHelper');

/**
 * Genera un reporte de ventas completo con métricas, gráficos y detalles.
 * @param {object} params - Parámetros de filtro ({ fechaInicio, fechaFin, idEstadoPedido, idUsuario, page, limit })
 */
async function generarReporteVentasCompleto(params) {
  const { 
    fechaInicio, 
    fechaFin, 
    idEstadoPedido, 
    idUsuario, 
    page = 1, 
    limit = 10 
  } = params;

  // 1. Construir el filtro dinámico (WHERE)
  const where = {};

  if (fechaInicio && fechaFin) {
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    where.creadoEn = {
      gte: inicio,
      lte: fin
    };
  }

  if (idEstadoPedido) {
    where.idEstadoPedido = parseInt(idEstadoPedido);
  }

  if (idUsuario) {
    where.idUsuario = parseInt(idUsuario);
  }

  // 2. Métricas Principales (Dashboard Cards)
  const metricasGenerales = await prisma.venta.aggregate({
    _sum: {
      total: true,
      subtotal: true,
      descuentoTotal: true
    },
    _count: {
      idVenta: true
    },
    _avg: {
      total: true
    },
    where
  });

  const totalVentas = Number(metricasGenerales._sum.total || 0);
  const totalPedidos = metricasGenerales._count.idVenta || 0;
  const ticketPromedio = Number(metricasGenerales._avg.total || 0);

  // 3. Ventas por Estado (Gráfico Circular)
  const ventasPorEstado = await prisma.venta.groupBy({
    by: ['idEstadoPedido'],
    _count: {
      idVenta: true
    },
    _sum: {
      total: true
    },
    where
  });

  // Enriquecer con nombres de estados
  const estados = await prisma.estadoPedido.findMany();
  const ventasPorEstadoFormateado = ventasPorEstado.map(v => {
    const estado = estados.find(e => e.idEstadoPedido === v.idEstadoPedido);
    return {
      idEstado: v.idEstadoPedido,
      nombre: estado ? estado.nombreEstado : 'Desconocido',
      color: estado ? estado.color : '#cbd5e1',
      cantidad: v._count.idVenta,
      total: Number(v._sum.total || 0)
    };
  });

  // 4. Ventas por Día (Gráfico de Líneas)
  // Usamos queryRaw para agrupar por fecha en MySQL
  const queryVentasDia = `
    SELECT 
      DATE(creado_en) as fecha,
      COUNT(id_venta) as pedidos,
      SUM(total) as total
    FROM ventas
    WHERE creado_en BETWEEN ? AND ?
    ${idEstadoPedido ? 'AND id_estado_pedido = ?' : ''}
    ${idUsuario ? 'AND id_usuario = ?' : ''}
    GROUP BY DATE(creado_en)
    ORDER BY fecha ASC
  `;

  const rawParams = [
    where.creadoEn?.gte || new Date('2000-01-01'),
    where.creadoEn?.lte || new Date(),
  ];
  if (idEstadoPedido) rawParams.push(parseInt(idEstadoPedido));
  if (idUsuario) rawParams.push(parseInt(idUsuario));

  const ventasPorDia = await prisma.$queryRawUnsafe(queryVentasDia, ...rawParams);

  // 5. Top Productos más vendidos (Gráfico de Barras)
  const topProductosRaw = await prisma.detalleVenta.groupBy({
    by: ['idVariante'],
    _sum: {
      cantidad: true,
      totalLinea: true
    },
    where: {
      venta: where
    },
    orderBy: {
      _sum: {
        cantidad: 'desc'
      }
    },
    take: 5
  });

  // Enriquecer datos de productos
  const topProductos = await Promise.all(topProductosRaw.map(async (item) => {
    const variante = await prisma.varianteProducto.findUnique({
      where: { idVariante: item.idVariante },
      include: {
        producto: true,
        color: true,
        talla: true
      }
    });
    return {
      idVariante: item.idVariante,
      nombre: variante ? `${variante.producto.nombreProducto} (${variante.color?.nombreColor || ''} - ${variante.talla?.nombreTalla || ''})` : 'Variante Eliminada',
      cantidadVendida: Number(item._sum.cantidad || 0),
      ingresos: Number(item._sum.totalLinea || 0)
    };
  }));

  // 6. Listado Detallado (Tabla con paginación)
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const ventasDetalle = await prisma.venta.findMany({
    where,
    include: {
      usuarioCliente: {
        select: { nombres: true, apellidos: true }
      },
      estadoPedido: {
        select: { nombreEstado: true, color: true }
      }
    },
    orderBy: {
      creadoEn: 'desc'
    },
    skip,
    take: parseInt(limit)
  });

  return {
    kpis: {
      totalVentas,
      totalPedidos,
      ticketPromedio,
      ahorroPorDescuentos: Number(metricasGenerales._sum.descuentoTotal || 0)
    },
    graficos: {
      ventasPorEstado: ventasPorEstadoFormateado,
      ventasPorDia: ventasPorDia.map(v => ({
        fecha: v.fecha.toISOString().split('T')[0],
        pedidos: Number(v.pedidos),
        total: Number(v.total)
      })),
      topProductos
    },
    tablaDetalle: {
      datos: ventasDetalle,
      paginacion: {
        totalItems: totalPedidos,
        totalPages: Math.ceil(totalPedidos / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    }
  };
}

module.exports = {
  generarReporteVentasCompleto
};
