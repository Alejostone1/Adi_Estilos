/**
 * =====================================================
 * SERVICIO DE PRODUCTOS
 * =====================================================
 * Contiene toda la lógica de negocio del módulo:
 *  - Productos
 *  - Variantes (CRÍTICO)
 *  - Inventario
 *  - Imágenes
 *  - Filtros, paginación
 * =====================================================
 */

const { prisma } = require('../../config/databaseConfig');

// =====================================================
// UTILIDADES INTERNAS
// =====================================================

/**
 * Obtener todos los IDs de categorías descendientes de forma recursiva.
 * @param {number} idPadre
 * @returns {Promise<Array<number>>}
 */
const obtenerIdsCategoriasDescendientes = async (idPadre) => {
  const subcategorias = await prisma.categoria.findMany({
    where: { categoriaPadre: idPadre },
    select: { idCategoria: true }
  });

  let ids = subcategorias.map(s => s.idCategoria);
  
  for (const sub of subcategorias) {
    const idsHijos = await obtenerIdsCategoriasDescendientes(sub.idCategoria);
    ids = [...ids, ...idsHijos];
  }

  return ids;
};

/**
 * Construye filtros dinámicos para Prisma
 */
const construirFiltros = async (filtros) => {
  const where = {};

  if (filtros.estado && ['activo', 'inactivo', 'descontinuado'].includes(filtros.estado)) {
    where.estado = filtros.estado;
  } else {
    where.estado = 'activo';
  }

  if (filtros.nombre && filtros.nombre.trim() !== '') {
    where.nombreProducto = { contains: filtros.nombre, mode: 'insensitive' };
  }

  if (filtros.idCategoria) {
    const idCategoriaNum = parseInt(filtros.idCategoria, 10);
    if (!isNaN(idCategoriaNum)) {
      // Implementación recursiva: obtener hijos
      const idsDescendientes = await obtenerIdsCategoriasDescendientes(idCategoriaNum);
      const allIds = [idCategoriaNum, ...idsDescendientes];
      where.idCategoria = { in: allIds };
    }
  }

  if (filtros.idProveedor) {
    const idProveedorNum = parseInt(filtros.idProveedor, 10);
    if (!isNaN(idProveedorNum)) {
      where.idProveedor = idProveedorNum;
    }
  }

  return where;
};



/**
 * Calcula paginación
 */
const construirPaginacion = (pagina, limite, total) => {
  const page = Number(pagina);
  const limit = Number(limite);

  return {
    paginaActual: page,
    totalPaginas: Math.ceil(total / limit),
    totalRegistros: total,
    registrosPorPagina: limit
  };
};

// =====================================================
// PRODUCTOS
// =====================================================

/**
 * Obtener productos con variantes, imágenes y paginación
 */
const obtenerTodos = async (filtros, { pagina = 1, limite = 12 }) => {
  const where = await construirFiltros(filtros);


  const skip = (pagina - 1) * limite;

  const [productos, total] = await prisma.$transaction([
    prisma.producto.findMany({
      where,
      select: {
        idProducto: true,
        nombreProducto: true,
        codigoReferencia: true,
        descripcion: true,
        creadoEn: true,
        actualizadoEn: true,
        estado: true,
        precioVentaSugerido: true,
        tieneColores: true,
        tieneTallas: true,
        idCategoria: true,
        idProveedor: true,
        categoria: {
          select: {
            nombreCategoria: true
          }
        },
        proveedor: {
          select: {
            nombreProveedor: true
          }
        },
        imagenes: {
          select: {
            idImagen: true,
            rutaImagen: true,
            esPrincipal: true
          },
          orderBy: {
            orden: 'asc'
          }
        },
        variantes: {
          where: { estado: 'activo' },
          select: {
            idVariante: true,
            cantidadStock: true,
            precioCosto: true,
            precioVenta: true,
            codigoSku: true,
            color: {
              select: {
                idColor: true,
                nombreColor: true,
                codigoHex: true
              }
            },
            talla: {
              select: {
                idTalla: true,
                nombreTalla: true
              }
            },
            imagenesVariantes: {
              where: { esPrincipal: true },
              take: 1,
              select: {
                idImagenVariante: true,
                rutaImagen: true
              }
            }
          }
        }
      },
      orderBy: { creadoEn: 'desc' },
      skip,
      take: Number(limite)
    }),
    prisma.producto.count({ where })
  ]);

  const productosFormateados = productos.map(p => ({
    ...p,
    precioVentaSugerido: Number(p.precioVentaSugerido),
    imagenPrincipal: p.imagenes.find(img => img.esPrincipal)?.rutaImagen || p.imagenes[0]?.rutaImagen || null,
    variantes: p.variantes.map(v => {
      const precioCosto = Number(v.precioCosto);
      const precioVenta = Number(v.precioVenta);
      const margen = precioVenta - precioCosto;
      const margenPorcentaje = precioVenta > 0 ? Number(((margen / precioVenta) * 100).toFixed(2)) : 0;

      return {
        ...v,
        precioCosto,
        precioVenta,
        cantidadStock: Number(v.cantidadStock),
        margen,
        margenPorcentaje
      };
    })
  }));

  return {
    datos: productosFormateados,
    paginacion: construirPaginacion(pagina, limite, total)
  };
};

/**
 * Obtener producto por ID (con variantes completas)
 */
const obtenerPorId = async (idProducto) => {
  const producto = await prisma.producto.findFirst({
    where: {
      idProducto: Number(idProducto),
      estado: 'activo'
    },
    include: {
      categoria: true,
      proveedor: true,
      variantes: {
        where: { estado: 'activo' },
        include: {
          color: true,
          talla: true,
          imagenesVariantes: true
        }
      },
      imagenes: true
    }
  });

  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  // Enriquecer variantes con cálculo de margen
  const variantesEnriquecidas = producto.variantes.map(v => {
    const precioCosto = Number(v.precioCosto);
    const precioVenta = Number(v.precioVenta);
    const margen = precioVenta - precioCosto;
    const margenPorcentaje = precioVenta > 0 ? Number(((margen / precioVenta) * 100).toFixed(2)) : 0;

    return {
      ...v,
      precioCosto,
      precioVenta,
      cantidadStock: Number(v.cantidadStock),
      margen,
      margenPorcentaje
    };
  });

  return {
    ...producto,
    precioVentaSugerido: Number(producto.precioVentaSugerido),
    variantes: variantesEnriquecidas
  };
};

/**
 * Crear producto base con su imagen principal inicial
 */
const crear = async (data) => {
  const { imagenPrincipal, ...productoBasico } = data;

  return prisma.producto.create({
    data: {
      nombreProducto: productoBasico.nombreProducto,
      codigoReferencia: productoBasico.codigoReferencia,
      descripcion: productoBasico.descripcion,
      precioVentaSugerido: productoBasico.precioVentaSugerido,
      idCategoria: Number(productoBasico.idCategoria),
      idProveedor: productoBasico.idProveedor ? Number(productoBasico.idProveedor) : null,
      unidadMedida: productoBasico.unidadMedida || 'unidad',
      tieneColores: !!productoBasico.tieneColores,
      tieneTallas: !!productoBasico.tieneTallas,
      estado: productoBasico.estado || 'activo',
      // Crear imagen principal si se proporciona
      ...(imagenPrincipal && {
        imagenes: {
          create: {
            rutaImagen: imagenPrincipal,
            esPrincipal: true,
            orden: 0,
            descripcion: `Imagen principal de ${productoBasico.nombreProducto}`
          }
        }
      })
    },
    include: {
      imagenes: true,
      categoria: true,
      proveedor: true
    }
  });
};

/**
 * Actualizar producto y su imagen principal
 */
const actualizar = async (idProducto, data) => {
  const { imagenPrincipal, ...productoBasico } = data;
  const id = Number(idProducto);

  // 1. Si hay una nueva imagen principal, gestionar el cambio
  if (imagenPrincipal) {
    // Desmarcar otras como principales
    await prisma.imagenProducto.updateMany({
      where: { idProducto: id },
      data: { esPrincipal: false }
    });

    // Buscar si ya existe esta ruta o crear una nueva entrada
    const imagenExistente = await prisma.imagenProducto.findFirst({
      where: { idProducto: id, rutaImagen: imagenPrincipal }
    });

    if (imagenExistente) {
      await prisma.imagenProducto.update({
        where: { idImagen: imagenExistente.idImagen },
        data: { esPrincipal: true }
      });
    } else {
      await prisma.imagenProducto.create({
        data: {
          idProducto: id,
          rutaImagen: imagenPrincipal,
          esPrincipal: true,
          orden: 0
        }
      });
    }
  }

  // 2. Actualizar datos básicos
  return prisma.producto.update({
    where: { idProducto: id },
    data: {
      nombreProducto: productoBasico.nombreProducto,
      codigoReferencia: productoBasico.codigoReferencia,
      descripcion: productoBasico.descripcion,
      precioVentaSugerido: productoBasico.precioVentaSugerido,
      idCategoria: productoBasico.idCategoria ? Number(productoBasico.idCategoria) : undefined,
      idProveedor: productoBasico.idProveedor !== undefined ? (productoBasico.idProveedor ? Number(productoBasico.idProveedor) : null) : undefined,
      unidadMedida: productoBasico.unidadMedida,
      tieneColores: productoBasico.tieneColores !== undefined ? !!productoBasico.tieneColores : undefined,
      tieneTallas: productoBasico.tieneTallas !== undefined ? !!productoBasico.tieneTallas : undefined,
      estado: productoBasico.estado
    },
    include: {
      imagenes: true,
      categoria: true,
      proveedor: true
    }
  });
};

/**
 * Soft delete de producto
 */
const eliminar = async (idProducto) => {
  return prisma.producto.update({
    where: { idProducto: Number(idProducto) },
    data: { estado: 'descontinuado' }
  });
};

/**
 * Buscar producto por código (SKU base o variante)
 */
const buscarPorCodigo = async (codigo) => {
  const variante = await prisma.varianteProducto.findFirst({
    where: { codigoSku: codigo },
    include: {
      producto: true,
      imagenesVariantes: true
    }
  });

  if (!variante) {
    throw new Error('Producto no encontrado por código');
  }

  return variante;
};

/**
 * Productos por categoría
 */
const obtenerPorCategoria = async (idCategoria) => {
  const idNum = Number(idCategoria);
  const idsDescendientes = await obtenerIdsCategoriasDescendientes(idNum);
  const allIds = [idNum, ...idsDescendientes];

  return prisma.producto.findMany({
    where: {
      idCategoria: { in: allIds },
      estado: 'activo'
    },

    include: {
      variantes: {
        where: { estado: 'activo' },
        include: {
          color: true,
          talla: true,
          imagenesVariantes: true
        }
      },
      imagenes: true
    }
  });
};

/**
 * Productos por proveedor (con variantes completas para módulo de compras)
 */
const obtenerPorProveedor = async (idProveedor) => {
  return prisma.producto.findMany({
    where: {
      idProveedor: Number(idProveedor),
      estado: 'activo'
    },
    include: {
      categoria: true,
      variantes: {
        where: { estado: 'activo' },
        include: {
          color: true,
          talla: true,
          imagenesVariantes: {
            where: { esPrincipal: true },
            take: 1
          }
        }
      },
      imagenes: {
        where: { esPrincipal: true },
        take: 1
      }
    }
  });
};

// =====================================================
// VARIANTES (CRÍTICO)
// =====================================================

/**
 * Obtener variantes por producto
 */
const obtenerVariantesPorProducto = async (idProducto) => {
  return prisma.varianteProducto.findMany({
    where: {
      idProducto: Number(idProducto),
      estado: 'activo'
    },
    include: {
      color: true,
      talla: true,
      imagenesVariantes: true
    }
  });
};

/**
 * Crear variante de producto
 */
const crearVarianteProducto = async (idProducto, data) => {
    return prisma.varianteProducto.create({
      data: {
        idProducto: Number(idProducto),
        codigoSku: data.codigoSku,
        precioVenta: data.precioVenta,
        cantidadStock: data.cantidadStock,
        idColor: data.idColor,
        idTalla: data.idTalla,
      }
    });
};

/**
 * Actualizar variante
 */
const actualizarVarianteProducto = async (idVariante, data) => {
  return prisma.varianteProducto.update({
    where: { idVariante: Number(idVariante) },
    data
  });
};

/**
 * Eliminar variante (soft delete)
 */
const eliminarVarianteProducto = async (idVariante) => {
  return prisma.varianteProducto.update({
    where: { idVariante: Number(idVariante) },
    data: { estado: 'inactivo' }
  });
};

// =====================================================
// INVENTARIO
// =====================================================

/**
 * Productos sin stock
 */
const obtenerProductosSinStock = async () => {
  return prisma.varianteProducto.findMany({
    where: { cantidadStock: 0, estado: 'activo' },
    include: { producto: true }
  });
};

/**
 * Productos con stock bajo
 */
const obtenerProductosConStockBajo = async (limite = 5) => {
  return prisma.varianteProducto.findMany({
    where: {
      cantidadStock: { lte: limite },
      estado: 'activo'
    },
    include: { producto: true }
  });
};

// =====================================================
// IMÁGENES
// =====================================================

/**
 * Productos sin imágenes
 */
const obtenerProductosSinImagenes = async () => {
  return prisma.producto.findMany({
    where: {
      imagenes: { none: {} },
      estado: 'activo'
    }
  });
};

/**
 * Cambiar imagen principal de una variante
 */
const cambiarImagenPrincipalVariante = async (idVariante, idImagen) => {
  await prisma.imagenVariante.updateMany({
    where: { idVariante: Number(idVariante) },
    data: { esPrincipal: false }
  });

  return prisma.imagenVariante.update({
    where: { idImagenVariante: Number(idImagen) },
    data: { esPrincipal: true }
  });
};

// =====================================================
// ESTADÍSTICAS
// =====================================================

/**
 * Obtener estadísticas completas de un producto
 */
const obtenerEstadisticasProducto = async (idProducto) => {
  const id = Number(idProducto);
  
  // 1. Información básica del producto
  const producto = await prisma.producto.findUnique({
    where: { idProducto: id },
    include: {
      categoria: true,
      proveedor: true
    }
  });

  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  // 2. Variantes del producto
  const variantes = await prisma.varianteProducto.findMany({
    where: { idProducto: id },
    include: {
      color: true,
      talla: true,
      imagenesVariantes: true
    }
  });

  // 3. Ventas del producto (simuladas - en producción vendrían de tabla de ventas)
  const ventasMensuales = await generarVentasMensualesSimuladas(id);

  // 4. Rendimiento por variante
  const variantesRendimiento = await Promise.all(
    variantes.map(async (variante) => {
      // Simular ventas por variante (en producción sería consulta real)
      const ventasSimuladas = Math.floor(Math.random() * 2000000) + 500000;
      
      return {
        idVariante: variante.idVariante,
        nombre: variante.codigoSku,
        codigoSku: variante.codigoSku,
        ventas: ventasSimuladas,
        stock: variante.cantidadStock || 0,
        color: variante.color?.nombreColor || 'N/A',
        talla: variante.talla?.nombreTalla || 'N/A',
        precioVenta: variante.precioVenta || 0,
        precioCosto: variante.precioCosto || 0
      };
    })
  );

  // 5. Métricas calculadas
  const totalVentas = ventasMensuales.reduce((sum, v) => sum + v.ventas, 0);
  const totalUnidades = ventasMensuales.reduce((sum, v) => sum + v.unidades, 0);
  const promedioVenta = ventasMensuales.length > 0 ? totalVentas / ventasMensuales.length : 0;
  
  const crecimiento = ventasMensuales.length > 1 
    ? ((ventasMensuales[ventasMensuales.length - 1].ventas - ventasMensuales[ventasMensuales.length - 2].ventas) / ventasMensuales[ventasMensuales.length - 2].ventas) * 100
    : 0;

  // 6. Stock total
  const stockTotal = variantes.reduce((sum, v) => sum + (v.cantidadStock || 0), 0);
  const stockBajoCount = variantes.filter(v => 
    v.cantidadStock <= (v.stockMinimo || 5)
  ).length;

  return {
    producto: {
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      codigoReferencia: producto.codigoReferencia,
      estado: producto.estado,
      categoria: producto.categoria?.nombreCategoria,
      proveedor: producto.proveedor?.nombreProveedor
    },
    variantes: {
      total: variantes.length,
      stockTotal,
      stockBajoCount,
      detalle: variantes.map(v => ({
        idVariante: v.idVariante,
        codigoSku: v.codigoSku,
        estado: v.estado,
        stock: v.cantidadStock || 0,
        color: v.color?.nombreColor,
        talla: v.talla?.nombreTalla
      }))
    },
    ventas: {
      mensuales: ventasMensuales,
      totalVentas,
      totalUnidades,
      promedioVenta,
      crecimiento
    },
    variantesRendimiento,
    metricas: {
      totalVentas,
      totalUnidades,
      promedioVenta,
      crecimiento,
      stockTotal,
      variantesActivas: variantes.filter(v => v.estado === 'activo').length
    }
  };
};

/**
 * Generar datos simulados de ventas mensuales
 * En producción esto vendría de la tabla de ventas
 */
const generarVentasMensualesSimuladas = async (idProducto) => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  
  return meses.map(mes => ({
    mes,
    ventas: Math.floor(Math.random() * 8000000) + 2000000,
    unidades: Math.floor(Math.random() * 300) + 50
  }));
};

// =====================================================
// EXPORTACIÓN
// =====================================================

module.exports = {
  // Productos
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  buscarPorCodigo,
  obtenerPorCategoria,
  obtenerPorProveedor,

  // Variantes
  obtenerVariantesPorProducto,
  crearVarianteProducto,
  actualizarVarianteProducto,
  eliminarVarianteProducto,

  // Inventario
  obtenerProductosSinStock,
  obtenerProductosConStockBajo,

  // Imágenes
  obtenerProductosSinImagenes,
  cambiarImagenPrincipalVariante,

  // Estadísticas
  obtenerEstadisticasProducto
};