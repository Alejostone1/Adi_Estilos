const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verCategorias() {
  const categorias = await prisma.categoria.findMany({
    select: {
      idCategoria: true,
      nombreCategoria: true,
      imagenCategoria: true
    }
  });

  console.log('=== CATEGORÍAS ===');
  categorias.forEach(cat => {
    console.log(`ID: ${cat.idCategoria} | Imagen: ${cat.imagenCategoria} | Nombre: ${cat.nombreCategoria}`);
  });

  await prisma.$disconnect();
}

verCategorias();
