const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function corregirRutas() {
  console.log('🔧 Corrigiendo rutas de imágenes de categorías...\n');

  // Imágenes que existen en el servidor
  const imagenes = [
    '/uploads/categorias/cate_1771101388863.jpg',
    '/uploads/categorias/cate_1771101571101.jpg',
    '/uploads/categorias/cate_1771101694602.jpg',
    '/uploads/categorias/cate_1771102619303.jpg',
    '/uploads/categorias/cate_1771102693966.jpg',
    '/uploads/categorias/cate_1771102716660.jpg'
  ];

  // Mapeo de categorías a imágenes
  const mapeo = [
    { id: 1, nombre: 'Mujer', img: imagenes[0] },
    { id: 2, nombre: 'Blusas Mujer', img: imagenes[1] },
    { id: 3, nombre: 'Vestidos Mujer', img: imagenes[2] },
    { id: 4, nombre: 'Hombre', img: imagenes[3] },
    { id: 5, nombre: 'Camisetas Hombre', img: imagenes[4] },
    { id: 6, nombre: 'Pantalones Hombre', img: imagenes[5] }
  ];

  for (const m of mapeo) {
    await prisma.categoria.update({
      where: { idCategoria: m.id },
      data: { imagenCategoria: m.img }
    });
    console.log(`✅ Categoría ${m.id} (${m.nombre}) => ${m.img}`);
  }

  console.log('\n✅ Rutas corregidas');
  await prisma.$disconnect();
}

corregirRutas();
