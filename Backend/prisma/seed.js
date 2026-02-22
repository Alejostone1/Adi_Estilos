const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const seedRoles = require('./seeds/01_roles.seed');
const seedEstadosPedido = require('./seeds/02_estados_pedido.seed');
const seedTiposMovimiento = require('./seeds/03_tipos_movimiento.seed');
const seedColores = require('./seeds/04_colores.seed');
const seedTallas = require('./seeds/05_tallas.seed');
const seedCategorias = require('./seeds/06_categorias.seed');
const seedProveedores = require('./seeds/07_proveedores.seed');
const seedTiposMetodoPago = require('./seeds/08_tipos_metodo_pago.seed');
const seedMetodosPago = require('./seeds/09_metodos_pago.seed');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Iniciando seeds...');

    await seedRoles(prisma);
    await seedEstadosPedido(prisma);
    await seedTiposMovimiento(prisma);
    await seedColores(prisma);
    await seedTallas(prisma);
    await seedCategorias(prisma);
    await seedProveedores(prisma);
    await seedTiposMetodoPago(prisma);
    await seedMetodosPago(prisma);

    // Crear usuario administrador por defecto
    const adminRole = await prisma.rol.findUnique({ where: { nombreRol: 'Administrador' } });

    if (adminRole) {
      const adminExists = await prisma.usuario.findFirst({
        where: { usuario: 'admin' }
      });

      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.usuario.create({
          data: {
            nombres: 'Administrador',
            apellidos: 'Sistema',
            usuario: 'admin',
            correoElectronico: 'admin@adi-estilos.com',
            contrasena: hashedPassword,
            telefono: '3000000000',
            idRol: adminRole.idRol,
            estado: 'activo'
          }
        });
        console.log('✅ Usuario administrador creado: admin / admin123');
      }
    }

    console.log('✅ Seeds ejecutados correctamente');
  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
