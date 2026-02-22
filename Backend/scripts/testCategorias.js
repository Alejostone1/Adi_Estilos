const publicService = require('../src/modules/public/publicService');

publicService.obtenerCategoriasActivas()
  .then(cats => {
    console.log('=== CATEGORÍAS DEVUELTAS ===');
    console.log('Total:', cats.length);
    cats.forEach(cat => {
      console.log(`- ${cat.nombreCategoria} (ID: ${cat.idCategoria}, Principal: ${cat.esPrincipal})`);
      console.log(`  Imagen: ${cat.imagenCategoria}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
