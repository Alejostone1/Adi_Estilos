/**
 * Servicio para la lógica de negocio de Estados de Pedido.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');
const { ErrorNoEncontrado, ErrorValidacion, ErrorConflicto } = require('../../utils/errorHelper');

// --- FUNCIONES DEL SERVICIO ---

/**
 * Obtener todos los estados de pedido
 * @param {boolean} soloActivos - Si es true, solo devuelve activos
 */
async function obtenerTodos(soloActivos = false) {
  const where = soloActivos ? { activo: true } : {};

  const estados = await prisma.estadoPedido.findMany({
    where,
    orderBy: { orden: 'asc' }
  });

  // Contar ventas y compras vinculadas a cada estado
  const estadosConConteo = await Promise.all(
    estados.map(async (estado) => {
      const [ventasCount, comprasCount] = await Promise.all([
        prisma.venta.count({ where: { idEstadoPedido: estado.idEstadoPedido } }),
        prisma.compra.count({ where: { idEstadoPedido: estado.idEstadoPedido } })
      ]);

      return {
        ...estado,
        _count: {
          ventas: ventasCount,
          compras: comprasCount
        }
      };
    })
  );

  return estadosConConteo;
}

/**
 * Obtener un estado por ID
 */
async function obtenerPorId(id) {
  const idEstado = parseInt(id, 10);
  if (isNaN(idEstado)) throw new ErrorValidacion('El ID debe ser un número.');

  const estado = await prisma.estadoPedido.findUnique({
    where: { idEstadoPedido: idEstado }
  });

  if (!estado) throw new ErrorNoEncontrado('Estado de pedido', id);

  // Contar relaciones
  const [ventasCount, comprasCount] = await Promise.all([
    prisma.venta.count({ where: { idEstadoPedido: idEstado } }),
    prisma.compra.count({ where: { idEstadoPedido: idEstado } })
  ]);

  return {
    ...estado,
    _count: { ventas: ventasCount, compras: comprasCount }
  };
}

/**
 * Crear un nuevo estado de pedido
 */
async function crear(datos) {
  const { nombreEstado, descripcion, color, orden } = datos;

  if (!nombreEstado || !nombreEstado.trim()) {
    throw new ErrorValidacion('El nombre del estado es requerido.');
  }

  // Verificar unicidad del nombre
  const existente = await prisma.estadoPedido.findUnique({
    where: { nombreEstado: nombreEstado.trim() }
  });

  if (existente) {
    throw new ErrorConflicto(`Ya existe un estado con el nombre "${nombreEstado.trim()}".`);
  }

  // Determinar el orden si no se proporciona
  let ordenFinal = orden;
  if (ordenFinal === undefined || ordenFinal === null) {
    const ultimo = await prisma.estadoPedido.findFirst({
      orderBy: { orden: 'desc' },
      select: { orden: true }
    });
    ordenFinal = (ultimo?.orden || 0) + 1;
  }

  return prisma.estadoPedido.create({
    data: {
      nombreEstado: nombreEstado.trim(),
      descripcion: descripcion?.trim() || null,
      color: color?.trim() || null,
      orden: parseInt(ordenFinal, 10) || 0,
      activo: true
    }
  });
}

/**
 * Actualizar un estado existente
 */
async function actualizar(id, datos) {
  const idEstado = parseInt(id, 10);
  if (isNaN(idEstado)) throw new ErrorValidacion('El ID debe ser un número.');

  const estadoExistente = await prisma.estadoPedido.findUnique({
    where: { idEstadoPedido: idEstado }
  });

  if (!estadoExistente) throw new ErrorNoEncontrado('Estado de pedido', id);

  const dataUpdate = {};

  if (datos.nombreEstado !== undefined) {
    const nombre = datos.nombreEstado.trim();
    if (!nombre) throw new ErrorValidacion('El nombre del estado no puede estar vacío.');

    // Verificar unicidad excluyendo el actual
    const duplicado = await prisma.estadoPedido.findFirst({
      where: {
        nombreEstado: nombre,
        NOT: { idEstadoPedido: idEstado }
      }
    });

    if (duplicado) throw new ErrorConflicto(`Ya existe un estado con el nombre "${nombre}".`);
    dataUpdate.nombreEstado = nombre;
  }

  if (datos.descripcion !== undefined) dataUpdate.descripcion = datos.descripcion?.trim() || null;
  if (datos.color !== undefined) dataUpdate.color = datos.color?.trim() || null;
  if (datos.orden !== undefined) dataUpdate.orden = parseInt(datos.orden, 10) || 0;
  if (datos.activo !== undefined) dataUpdate.activo = Boolean(datos.activo);

  return prisma.estadoPedido.update({
    where: { idEstadoPedido: idEstado },
    data: dataUpdate
  });
}

/**
 * Soft-delete: desactivar un estado
 * No se elimina por integridad referencial (ventas/compras dependen de él)
 */
async function eliminar(id) {
  const idEstado = parseInt(id, 10);
  if (isNaN(idEstado)) throw new ErrorValidacion('El ID debe ser un número.');

  const estado = await prisma.estadoPedido.findUnique({
    where: { idEstadoPedido: idEstado }
  });

  if (!estado) throw new ErrorNoEncontrado('Estado de pedido', id);

  // Verificar si tiene ventas o compras vinculadas
  const [ventasCount, comprasCount] = await Promise.all([
    prisma.venta.count({ where: { idEstadoPedido: idEstado } }),
    prisma.compra.count({ where: { idEstadoPedido: idEstado } })
  ]);

  const totalRelaciones = ventasCount + comprasCount;

  // Soft-delete: marcar como inactivo
  await prisma.estadoPedido.update({
    where: { idEstadoPedido: idEstado },
    data: { activo: false }
  });

  return {
    mensaje: totalRelaciones > 0
      ? `Estado desactivado exitosamente. Tiene ${ventasCount} venta(s) y ${comprasCount} compra(s) asociadas que conservan su referencia.`
      : `Estado desactivado exitosamente.`,
    ventasVinculadas: ventasCount,
    comprasVinculadas: comprasCount
  };
}


// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
