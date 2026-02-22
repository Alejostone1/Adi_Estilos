/**
 * Script para corregir las rutas de imágenes de categorías
 * Asigna imágenes existentes a las categorías que no tienen imagen válida
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function corregirImagenes() {
  console.log('🔧 Corrigiendo imágenes de categorías...\n');

  try {
    // Obtener todas las categorías
    const categorias = await prisma.categoria.findMany({
      select: {
        idCategoria: true,
        nombreCategoria: true,
        imagenCategoria: true
      }
    });

    // Imágenes disponibles en el servidor
    const imagenesDisponibles = [
      '/uploads/categorias/cate_1771101388863.jpg',
      '/uploads/categorias/cate_1771101571101.jpg',
      '/uploads/categorias/cate_1771101694602.jpg',
      '/uploads/categorias/cate_1771102619303.jpg',
      '/uploads/categorias/cate_1771102693966.jpg',
      '/uploads/categorias/cate_1771102716660.jpg'
    ];

    // Categorías que necesitan imagen
    const categoriasAModificar = [
      { nombre: 'Ropa y accesorios para mujer', nombreBusqueda: 'Mujer' },
      { nombre: 'Ropa y accesorios para hombre', nombreBusqueda: 'Hombre' },
      { nombre: 'Blusas y camisas para mujer', nombreBusqueda: 'Blusa' },
      { nombre: 'Vestidos casuales y formales para mujer', nombreBusqueda: 'Vestido' },
      { nombre: 'Camisetas y polos para hombre', nombreBusqueda: 'Camiseta' },
      { nombre: 'Jeans y pantalones para hombre', nombreBusqueda: 'Pantalon' }
    ];

    for (const cat of categorias) {
      const tieneImagenValida = cat.imagenCategoria &&
        cat.imagenCategoria.startsWith('/uploads/');

      // Buscar si esta categoría necesita ser corregida
      const catPorCorregir = categoriasAModificar.find(c =>
        cat.nombreCategoria.toLowerCase().includes(c.nombreBusqueda.toLowerCase())
      );

      if (catPorCorregir && !tieneImagenValida) {
        // Asignar una imagen de las disponibles
        const indice = categorias.indexOf(cat) % imagenesDisponibles.length;

        await prisma.categoria.update({
          where: { idCategoria: cat.idCategoria },
          data: { imagenCategoria: imagenesDisponibles[indice] }
        });

        console.log(`✅ ${cat.nombreCategoria} => ${imagenesDisponibles[indice]}`);
      } else if (tieneImagenValida) {
        console.log(`✓ ${cat.nombreCategoria} (ya tiene imagen)`);
      } else {
        // Asignar imagen por defecto
        await prisma.categoria.update({
          where: { idCategoria: cat.idCategoria },
          data: { imagenCategoria: imagenesDisponibles[0] }
        });
        console.log(`⚠️ ${cat.nombreCategoria} => imagen por defecto`);
      }
    }

    console.log('\n✅ Proceso completado');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

corregirImagenes();
