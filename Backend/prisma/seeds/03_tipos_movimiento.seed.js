/**
 * Seed - Tipos de Movimiento de Inventario
 * Modelo compatible:
 * id_tipo_movimiento, nombre_tipo, tipo, descripcion,
 * afecta_costo, activo, creado_en
 *
 * Convención:
 * - tipo = 'entrada' => suma inventario
 * - tipo = 'salida'  => resta inventario
 * - tipo = 'ajuste'  => suma o resta según el caso
 */

module.exports = async function seedTiposMovimiento(prisma) {
  const tipos = [
    {
      nombreTipo: 'Compra a Proveedor',
      tipo: 'entrada',
      descripcion: 'Entrada positiva de inventario por compra a proveedor',
      afectaCosto: true,
      activo: true
    },
    {
      nombreTipo: 'Venta a Cliente',
      tipo: 'salida',
      descripcion: 'Salida negativa de inventario por venta al cliente',
      afectaCosto: false,
      activo: true
    },
    {
      nombreTipo: 'Devolución de Cliente',
      tipo: 'entrada',
      descripcion: 'Entrada positiva de inventario por devolución del cliente',
      afectaCosto: false,
      activo: true
    },
    {
      nombreTipo: 'Devolución a Proveedor',
      tipo: 'salida',
      descripcion: 'Salida negativa de inventario por devolución al proveedor',
      afectaCosto: true,
      activo: true
    },
    {
      nombreTipo: 'Ajuste Positivo de Inventario',
      tipo: 'ajuste',
      descripcion: 'Ajuste que incrementa el inventario por sobrante físico',
      afectaCosto: false,
      activo: true
    },
    {
      nombreTipo: 'Ajuste Negativo de Inventario',
      tipo: 'ajuste',
      descripcion: 'Ajuste que reduce el inventario por faltante físico',
      afectaCosto: false,
      activo: true
    },
    {
      nombreTipo: 'Inventario Inicial',
      tipo: 'entrada',
      descripcion: 'Entrada positiva de inventario inicial sin compra asociada',
      afectaCosto: false,
      activo: true
    },
    {
      nombreTipo: 'Merma o Pérdida',
      tipo: 'salida',
      descripcion: 'Salida negativa de inventario por daño, caducidad o pérdida',
      afectaCosto: false,
      activo: true
    },
    {
      nombreTipo: 'Traslado Entrada',
      tipo: 'entrada',
      descripcion: 'Entrada positiva de inventario por traslado entre almacenes',
      afectaCosto: false,
      activo: true
    },
    {
      nombreTipo: 'Traslado Salida',
      tipo: 'salida',
      descripcion: 'Salida negativa de inventario por traslado entre almacenes',
      afectaCosto: false,
      activo: true
    },
    {
      nombreTipo: 'Donación',
      tipo: 'salida',
      descripcion: 'Salida negativa de inventario por donación',
      afectaCosto: false,
      activo: true
    },
    {
      nombreTipo: 'Muestra o Promoción',
      tipo: 'salida',
      descripcion: 'Salida negativa de inventario por muestra o promoción',
      afectaCosto: false,
      activo: true
    }
  ];

  console.log('🌱 Iniciando seed de Tipos de Movimiento...');

  for (const tipoMovimiento of tipos) {
    await prisma.tipoMovimiento.upsert({
      where: { nombreTipo: tipoMovimiento.nombreTipo },
      update: {
        tipo: tipoMovimiento.tipo,
        descripcion: tipoMovimiento.descripcion,
        afectaCosto: tipoMovimiento.afectaCosto,
        activo: tipoMovimiento.activo
      },
      create: tipoMovimiento
    });

    console.log(`✔ Tipo asegurado: ${tipoMovimiento.nombreTipo}`);
  }

  console.log('✅ Seed Tipos de Movimiento completado correctamente');
};
