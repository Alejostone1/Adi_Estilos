-- CreateTable
CREATE TABLE `roles` (
    `id_rol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_rol` VARCHAR(50) NOT NULL,
    `descripcion` TEXT NULL,
    `permisos` JSON NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `roles_nombre_rol_key`(`nombre_rol`),
    INDEX `roles_nombre_rol_idx`(`nombre_rol`),
    INDEX `roles_activo_idx`(`activo`),
    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `usuario` VARCHAR(100) NOT NULL,
    `correo_electronico` VARCHAR(100) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `direccion` TEXT NULL,
    `id_rol` INTEGER NOT NULL DEFAULT 2,
    `estado` ENUM('activo', 'inactivo', 'bloqueado') NOT NULL DEFAULT 'activo',
    `ultima_conexion` DATETIME(0) NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `usuarios_usuario_key`(`usuario`),
    UNIQUE INDEX `usuarios_correo_electronico_key`(`correo_electronico`),
    INDEX `usuarios_usuario_idx`(`usuario`),
    INDEX `usuarios_correo_electronico_idx`(`correo_electronico`),
    INDEX `usuarios_id_rol_idx`(`id_rol`),
    INDEX `usuarios_estado_idx`(`estado`),
    FULLTEXT INDEX `usuarios_nombres_apellidos_idx`(`nombres`, `apellidos`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_categoria` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `imagen_categoria` VARCHAR(255) NULL,
    `categoria_padre` INTEGER NULL,
    `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `categorias_nombre_categoria_key`(`nombre_categoria`),
    INDEX `categorias_estado_idx`(`estado`),
    INDEX `categorias_categoria_padre_idx`(`categoria_padre`),
    INDEX `categorias_nombre_categoria_idx`(`nombre_categoria`),
    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedores` (
    `id_proveedor` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_proveedor` VARCHAR(100) NOT NULL,
    `nit_cc` VARCHAR(20) NOT NULL,
    `contacto` VARCHAR(100) NULL,
    `telefono` VARCHAR(20) NULL,
    `correo_electronico` VARCHAR(100) NULL,
    `direccion` TEXT NULL,
    `imagen_proveedor` VARCHAR(255) NULL,
    `notas` TEXT NULL,
    `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `proveedores_nit_cc_key`(`nit_cc`),
    INDEX `proveedores_nit_cc_idx`(`nit_cc`),
    INDEX `proveedores_estado_idx`(`estado`),
    INDEX `proveedores_nombre_proveedor_idx`(`nombre_proveedor`),
    PRIMARY KEY (`id_proveedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `colores` (
    `id_color` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_color` VARCHAR(50) NOT NULL,
    `codigo_hex` VARCHAR(7) NULL,
    `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `colores_nombre_color_key`(`nombre_color`),
    INDEX `colores_estado_idx`(`estado`),
    INDEX `colores_nombre_color_idx`(`nombre_color`),
    PRIMARY KEY (`id_color`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tallas` (
    `id_talla` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_talla` VARCHAR(80) NOT NULL,
    `tipo_talla` ENUM('numerica', 'alfabetica', 'otra', 'bebe', 'nino', 'mujer', 'hombre', 'adulto', 'calzado', 'especial') NOT NULL DEFAULT 'alfabetica',
    `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tallas_nombre_talla_key`(`nombre_talla`),
    INDEX `tallas_tipo_talla_idx`(`tipo_talla`),
    INDEX `tallas_estado_idx`(`estado`),
    INDEX `tallas_nombre_talla_idx`(`nombre_talla`),
    PRIMARY KEY (`id_talla`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productos` (
    `id_producto` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_referencia` VARCHAR(100) NOT NULL,
    `nombre_producto` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `precio_venta_sugerido` DECIMAL(10, 2) NOT NULL,
    `unidad_medida` VARCHAR(20) NOT NULL DEFAULT 'unidad',
    `tiene_colores` BOOLEAN NOT NULL DEFAULT false,
    `tiene_tallas` BOOLEAN NOT NULL DEFAULT false,
    `datos_tecnicos` JSON NULL,
    `id_categoria` INTEGER NOT NULL,
    `id_proveedor` INTEGER NULL,
    `estado` ENUM('activo', 'inactivo', 'descontinuado') NOT NULL DEFAULT 'activo',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `productos_codigo_referencia_key`(`codigo_referencia`),
    INDEX `productos_codigo_referencia_idx`(`codigo_referencia`),
    INDEX `productos_id_categoria_idx`(`id_categoria`),
    INDEX `productos_id_proveedor_idx`(`id_proveedor`),
    INDEX `productos_estado_idx`(`estado`),
    INDEX `productos_nombre_producto_idx`(`nombre_producto`),
    FULLTEXT INDEX `productos_nombre_producto_descripcion_idx`(`nombre_producto`, `descripcion`),
    PRIMARY KEY (`id_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imagenes_productos` (
    `id_imagen` INTEGER NOT NULL AUTO_INCREMENT,
    `id_producto` INTEGER NOT NULL,
    `ruta_imagen` VARCHAR(255) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `es_principal` BOOLEAN NOT NULL DEFAULT false,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `imagenes_productos_id_producto_idx`(`id_producto`),
    INDEX `imagenes_productos_es_principal_idx`(`es_principal`),
    PRIMARY KEY (`id_imagen`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `variantes_producto` (
    `id_variante` INTEGER NOT NULL AUTO_INCREMENT,
    `id_producto` INTEGER NOT NULL,
    `id_color` INTEGER NULL,
    `id_talla` INTEGER NULL,
    `codigo_sku` VARCHAR(100) NOT NULL,
    `precio_venta` DECIMAL(10, 2) NOT NULL,
    `precio_costo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `cantidad_stock` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `stock_minimo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `stock_maximo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `variantes_producto_codigo_sku_key`(`codigo_sku`),
    INDEX `variantes_producto_codigo_sku_idx`(`codigo_sku`),
    INDEX `variantes_producto_id_producto_idx`(`id_producto`),
    INDEX `variantes_producto_id_color_idx`(`id_color`),
    INDEX `variantes_producto_id_talla_idx`(`id_talla`),
    INDEX `variantes_producto_cantidad_stock_idx`(`cantidad_stock`),
    INDEX `variantes_producto_estado_idx`(`estado`),
    UNIQUE INDEX `variantes_producto_id_producto_id_color_id_talla_key`(`id_producto`, `id_color`, `id_talla`),
    PRIMARY KEY (`id_variante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imagenes_variantes` (
    `id_imagen_variante` INTEGER NOT NULL AUTO_INCREMENT,
    `id_variante` INTEGER NOT NULL,
    `ruta_imagen` VARCHAR(255) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `es_principal` BOOLEAN NOT NULL DEFAULT false,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `imagenes_variantes_id_variante_idx`(`id_variante`),
    INDEX `imagenes_variantes_es_principal_idx`(`es_principal`),
    PRIMARY KEY (`id_imagen_variante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `descuentos` (
    `id_descuento` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_descuento` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `codigo_descuento` VARCHAR(50) NULL,
    `tipo_descuento` ENUM('porcentaje', 'valor_fijo') NOT NULL,
    `valor_descuento` DECIMAL(10, 2) NOT NULL,
    `aplica_a` ENUM('total_venta', 'categoria', 'producto', 'cliente') NOT NULL DEFAULT 'total_venta',
    `id_categoria` INTEGER NULL,
    `id_producto` INTEGER NULL,
    `monto_minimo_compra` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `fecha_inicio` DATE NULL,
    `fecha_fin` DATE NULL,
    `requiere_codigo` BOOLEAN NOT NULL DEFAULT false,
    `cantidad_maxima_usos` INTEGER NULL,
    `usos_actuales` INTEGER NOT NULL DEFAULT 0,
    `uso_por_cliente` INTEGER NOT NULL DEFAULT 1,
    `usuario_creacion` INTEGER NOT NULL,
    `estado` ENUM('activo', 'inactivo', 'vencido') NOT NULL DEFAULT 'activo',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `descuentos_codigo_descuento_key`(`codigo_descuento`),
    INDEX `descuentos_codigo_descuento_idx`(`codigo_descuento`),
    INDEX `descuentos_tipo_descuento_idx`(`tipo_descuento`),
    INDEX `descuentos_estado_idx`(`estado`),
    INDEX `descuentos_fecha_inicio_fecha_fin_idx`(`fecha_inicio`, `fecha_fin`),
    INDEX `descuentos_aplica_a_idx`(`aplica_a`),
    INDEX `descuentos_id_categoria_idx`(`id_categoria`),
    INDEX `descuentos_id_producto_idx`(`id_producto`),
    INDEX `descuentos_usuario_creacion_idx`(`usuario_creacion`),
    PRIMARY KEY (`id_descuento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `descuentos_clientes` (
    `id_descuento_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `id_descuento` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `usos_realizados` INTEGER NOT NULL DEFAULT 0,
    `fecha_asignacion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `descuentos_clientes_id_descuento_idx`(`id_descuento`),
    INDEX `descuentos_clientes_id_usuario_idx`(`id_usuario`),
    UNIQUE INDEX `descuentos_clientes_id_descuento_id_usuario_key`(`id_descuento`, `id_usuario`),
    PRIMARY KEY (`id_descuento_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_descuentos` (
    `id_historial_descuento` INTEGER NOT NULL AUTO_INCREMENT,
    `id_descuento` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `id_venta` INTEGER NOT NULL,
    `valor_aplicado` DECIMAL(10, 2) NOT NULL,
    `fecha_uso` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `historial_descuentos_id_descuento_idx`(`id_descuento`),
    INDEX `historial_descuentos_id_venta_idx`(`id_venta`),
    INDEX `historial_descuentos_id_usuario_idx`(`id_usuario`),
    INDEX `historial_descuentos_fecha_uso_idx`(`fecha_uso`),
    PRIMARY KEY (`id_historial_descuento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compras` (
    `id_compra` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_compra` VARCHAR(50) NOT NULL,
    `id_proveedor` INTEGER NOT NULL,
    `id_usuario_registro` INTEGER NOT NULL,
    `id_estado_pedido` INTEGER NOT NULL DEFAULT 8,
    `fecha_compra` DATE NOT NULL,
    `fecha_entrega` DATE NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `impuestos` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `descuento` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(12, 2) NOT NULL,
    `notas` TEXT NULL,
    `estado` ENUM('pendiente', 'recibida', 'parcial', 'cancelada') NOT NULL DEFAULT 'pendiente',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `compras_numero_compra_key`(`numero_compra`),
    INDEX `compras_estado_idx`(`estado`),
    INDEX `compras_numero_compra_idx`(`numero_compra`),
    INDEX `compras_id_proveedor_idx`(`id_proveedor`),
    INDEX `compras_id_usuario_registro_idx`(`id_usuario_registro`),
    INDEX `compras_fecha_compra_idx`(`fecha_compra`),
    INDEX `compras_id_estado_pedido_idx`(`id_estado_pedido`),
    PRIMARY KEY (`id_compra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_compras` (
    `id_detalle_compra` INTEGER NOT NULL AUTO_INCREMENT,
    `id_compra` INTEGER NOT NULL,
    `id_variante` INTEGER NOT NULL,
    `cantidad` DECIMAL(10, 2) NOT NULL,
    `cantidad_recibida` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    `descuento_linea` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `total_linea` DECIMAL(12, 2) NOT NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `detalle_compras_id_compra_idx`(`id_compra`),
    INDEX `detalle_compras_id_variante_idx`(`id_variante`),
    PRIMARY KEY (`id_detalle_compra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_movimiento` (
    `id_tipo_movimiento` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_tipo` VARCHAR(50) NOT NULL,
    `tipo` ENUM('entrada', 'salida', 'ajuste') NOT NULL,
    `descripcion` TEXT NULL,
    `afecta_costo` BOOLEAN NOT NULL DEFAULT false,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tipos_movimiento_nombre_tipo_key`(`nombre_tipo`),
    INDEX `tipos_movimiento_tipo_idx`(`tipo`),
    INDEX `tipos_movimiento_activo_idx`(`activo`),
    PRIMARY KEY (`id_tipo_movimiento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ajustes_inventario` (
    `id_ajuste` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_ajuste` VARCHAR(50) NOT NULL,
    `id_tipo_movimiento` INTEGER NOT NULL,
    `usuario_registro` INTEGER NOT NULL,
    `fecha_ajuste` DATE NOT NULL,
    `motivo` TEXT NOT NULL,
    `observaciones` TEXT NULL,
    `estado` ENUM('borrador', 'aplicado', 'cancelado') NOT NULL DEFAULT 'borrador',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `ajustes_inventario_numero_ajuste_key`(`numero_ajuste`),
    INDEX `ajustes_inventario_numero_ajuste_idx`(`numero_ajuste`),
    INDEX `ajustes_inventario_fecha_ajuste_idx`(`fecha_ajuste`),
    INDEX `ajustes_inventario_estado_idx`(`estado`),
    INDEX `ajustes_inventario_id_tipo_movimiento_idx`(`id_tipo_movimiento`),
    INDEX `ajustes_inventario_usuario_registro_idx`(`usuario_registro`),
    PRIMARY KEY (`id_ajuste`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_ajustes_inventario` (
    `id_detalle_ajuste` INTEGER NOT NULL AUTO_INCREMENT,
    `id_ajuste` INTEGER NOT NULL,
    `id_variante` INTEGER NOT NULL,
    `cantidad_ajuste` DECIMAL(10, 2) NOT NULL,
    `stock_anterior` DECIMAL(10, 2) NOT NULL,
    `stock_nuevo` DECIMAL(10, 2) NOT NULL,
    `costo_unitario` DECIMAL(10, 2) NULL,
    `observaciones` TEXT NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `detalle_ajustes_inventario_id_ajuste_idx`(`id_ajuste`),
    INDEX `detalle_ajustes_inventario_id_variante_idx`(`id_variante`),
    PRIMARY KEY (`id_detalle_ajuste`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimientos_inventario` (
    `id_movimiento` INTEGER NOT NULL AUTO_INCREMENT,
    `id_variante` INTEGER NOT NULL,
    `id_tipo_movimiento` INTEGER NOT NULL,
    `usuario_registro` INTEGER NOT NULL,
    `cantidad` DECIMAL(10, 2) NOT NULL,
    `stock_anterior` DECIMAL(10, 2) NOT NULL,
    `stock_nuevo` DECIMAL(10, 2) NOT NULL,
    `costo_unitario` DECIMAL(10, 2) NULL,
    `valor_total` DECIMAL(12, 2) NULL,
    `motivo` TEXT NULL,
    `fecha_movimiento` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `id_compra` INTEGER NULL,
    `id_venta` INTEGER NULL,
    `id_ajuste` INTEGER NULL,

    INDEX `movimientos_inventario_id_variante_idx`(`id_variante`),
    INDEX `movimientos_inventario_id_tipo_movimiento_idx`(`id_tipo_movimiento`),
    INDEX `movimientos_inventario_fecha_movimiento_idx`(`fecha_movimiento`),
    INDEX `movimientos_inventario_id_compra_idx`(`id_compra`),
    INDEX `movimientos_inventario_id_venta_idx`(`id_venta`),
    INDEX `movimientos_inventario_id_ajuste_idx`(`id_ajuste`),
    INDEX `movimientos_inventario_usuario_registro_idx`(`usuario_registro`),
    PRIMARY KEY (`id_movimiento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_metodo_pago` (
    `id_tipo_metodo` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tipos_metodo_pago_codigo_key`(`codigo`),
    INDEX `tipos_metodo_pago_codigo_idx`(`codigo`),
    INDEX `tipos_metodo_pago_activo_idx`(`activo`),
    PRIMARY KEY (`id_tipo_metodo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metodos_pago` (
    `id_metodo_pago` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_metodo` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `id_tipo_metodo` INTEGER NOT NULL,
    `requiere_referencia` BOOLEAN NOT NULL DEFAULT false,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `metodos_pago_nombre_metodo_key`(`nombre_metodo`),
    INDEX `metodos_pago_id_tipo_metodo_idx`(`id_tipo_metodo`),
    INDEX `metodos_pago_activo_idx`(`activo`),
    PRIMARY KEY (`id_metodo_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estados_pedido` (
    `id_estado_pedido` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_estado` VARCHAR(50) NOT NULL,
    `descripcion` TEXT NULL,
    `color` VARCHAR(20) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `estados_pedido_nombre_estado_key`(`nombre_estado`),
    INDEX `estados_pedido_activo_idx`(`activo`),
    INDEX `estados_pedido_orden_idx`(`orden`),
    PRIMARY KEY (`id_estado_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ventas` (
    `id_venta` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_factura` VARCHAR(50) NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `id_usuario_vendedor` INTEGER NULL,
    `id_estado_pedido` INTEGER NOT NULL,
    `id_descuento` INTEGER NULL,
    `codigo_descuento_usado` VARCHAR(50) NULL,
    `direccion_entrega` TEXT NULL,
    `tipo_venta` ENUM('contado', 'mixto', 'credito') NOT NULL DEFAULT 'contado',
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `descuento_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `impuestos` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(12, 2) NOT NULL,
    `total_pagado` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `saldo_pendiente` DECIMAL(12, 2) NOT NULL,
    `estado_pago` ENUM('pendiente', 'parcial', 'pagado') NOT NULL DEFAULT 'pendiente',
    `notas` TEXT NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `ventas_numero_factura_key`(`numero_factura`),
    INDEX `ventas_numero_factura_idx`(`numero_factura`),
    INDEX `ventas_id_usuario_idx`(`id_usuario`),
    INDEX `ventas_id_usuario_vendedor_idx`(`id_usuario_vendedor`),
    INDEX `ventas_id_descuento_idx`(`id_descuento`),
    INDEX `ventas_creado_en_idx`(`creado_en`),
    INDEX `ventas_tipo_venta_idx`(`tipo_venta`),
    INDEX `ventas_estado_pago_idx`(`estado_pago`),
    INDEX `ventas_id_estado_pedido_idx`(`id_estado_pedido`),
    PRIMARY KEY (`id_venta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_ventas` (
    `id_detalle_venta` INTEGER NOT NULL AUTO_INCREMENT,
    `id_venta` INTEGER NOT NULL,
    `id_variante` INTEGER NOT NULL,
    `cantidad` DECIMAL(10, 2) NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    `descuento_linea` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `total_linea` DECIMAL(12, 2) NOT NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `detalle_ventas_id_venta_idx`(`id_venta`),
    INDEX `detalle_ventas_id_variante_idx`(`id_variante`),
    PRIMARY KEY (`id_detalle_venta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagos` (
    `id_pago` INTEGER NOT NULL AUTO_INCREMENT,
    `id_venta` INTEGER NOT NULL,
    `id_metodo_pago` INTEGER NOT NULL,
    `usuario_registro` INTEGER NOT NULL,
    `tipo_pago` ENUM('inicial', 'abono', 'liquidacion') NOT NULL DEFAULT 'inicial',
    `monto` DECIMAL(12, 2) NOT NULL,
    `saldo_anterior` DECIMAL(12, 2) NOT NULL,
    `saldo_nuevo` DECIMAL(12, 2) NOT NULL,
    `referencia` VARCHAR(100) NULL,
    `notas` TEXT NULL,
    `fecha_pago` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `pagos_id_venta_idx`(`id_venta`),
    INDEX `pagos_tipo_pago_idx`(`tipo_pago`),
    INDEX `pagos_fecha_pago_idx`(`fecha_pago`),
    INDEX `pagos_id_metodo_pago_idx`(`id_metodo_pago`),
    INDEX `pagos_usuario_registro_idx`(`usuario_registro`),
    PRIMARY KEY (`id_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagos_detalle` (
    `id_pago_detalle` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pago` INTEGER NOT NULL,
    `id_metodo_pago` INTEGER NOT NULL,
    `monto` DECIMAL(12, 2) NOT NULL,
    `referencia` VARCHAR(150) NULL,

    INDEX `pagos_detalle_id_pago_idx`(`id_pago`),
    INDEX `pagos_detalle_id_metodo_pago_idx`(`id_metodo_pago`),
    PRIMARY KEY (`id_pago_detalle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creditos` (
    `id_credito` INTEGER NOT NULL AUTO_INCREMENT,
    `id_venta` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `usuario_registro` INTEGER NOT NULL,
    `monto_inicial` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `monto_credito` DECIMAL(12, 2) NOT NULL,
    `monto_total` DECIMAL(12, 2) NOT NULL,
    `total_abonado` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `saldo_pendiente` DECIMAL(12, 2) NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_vencimiento` DATE NULL,
    `fecha_ultimo_pago` DATE NULL,
    `dias_mora` INTEGER NOT NULL DEFAULT 0,
    `observaciones` TEXT NULL,
    `estado` ENUM('activo', 'pagado', 'vencido', 'cancelado') NOT NULL DEFAULT 'activo',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `creditos_id_venta_key`(`id_venta`),
    INDEX `creditos_id_venta_idx`(`id_venta`),
    INDEX `creditos_id_usuario_idx`(`id_usuario`),
    INDEX `creditos_estado_idx`(`estado`),
    INDEX `creditos_fecha_vencimiento_idx`(`fecha_vencimiento`),
    INDEX `creditos_saldo_pendiente_idx`(`saldo_pendiente`),
    INDEX `creditos_usuario_registro_idx`(`usuario_registro`),
    PRIMARY KEY (`id_credito`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes_credito_resumen` (
    `id_usuario` INTEGER NOT NULL,
    `limite_credito` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `credito_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `saldo_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_abonado` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `cantidad_creditos_activos` INTEGER NOT NULL DEFAULT 0,
    `cantidad_creditos_pagados` INTEGER NOT NULL DEFAULT 0,
    `cantidad_creditos_vencidos` INTEGER NOT NULL DEFAULT 0,
    `fecha_ultimo_credito` DATE NULL,
    `fecha_ultimo_pago` DATE NULL,
    `fecha_actualizacion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `clientes_credito_resumen_saldo_total_idx`(`saldo_total`),
    INDEX `clientes_credito_resumen_limite_credito_idx`(`limite_credito`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `devoluciones` (
    `id_devolucion` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_devolucion` VARCHAR(50) NOT NULL,
    `id_venta` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `usuario_registro` INTEGER NOT NULL,
    `tipo_devolucion` ENUM('total', 'parcial') NOT NULL,
    `motivo` TEXT NOT NULL,
    `subtotal_devolucion` DECIMAL(12, 2) NOT NULL,
    `impuestos_devolucion` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_devolucion` DECIMAL(12, 2) NOT NULL,
    `fecha_devolucion` DATE NOT NULL,
    `observaciones` TEXT NULL,
    `estado` ENUM('pendiente', 'aprobada', 'rechazada', 'procesada') NOT NULL DEFAULT 'pendiente',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `devoluciones_numero_devolucion_key`(`numero_devolucion`),
    INDEX `devoluciones_numero_devolucion_idx`(`numero_devolucion`),
    INDEX `devoluciones_id_venta_idx`(`id_venta`),
    INDEX `devoluciones_id_usuario_idx`(`id_usuario`),
    INDEX `devoluciones_estado_idx`(`estado`),
    INDEX `devoluciones_fecha_devolucion_idx`(`fecha_devolucion`),
    INDEX `devoluciones_usuario_registro_idx`(`usuario_registro`),
    PRIMARY KEY (`id_devolucion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_devoluciones` (
    `id_detalle_devolucion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_devolucion` INTEGER NOT NULL,
    `id_detalle_venta` INTEGER NOT NULL,
    `id_variante` INTEGER NOT NULL,
    `cantidad_devuelta` DECIMAL(10, 2) NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `motivo_linea` TEXT NULL,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `detalle_devoluciones_id_devolucion_idx`(`id_devolucion`),
    INDEX `detalle_devoluciones_id_detalle_venta_idx`(`id_detalle_venta`),
    INDEX `detalle_devoluciones_id_variante_idx`(`id_variante`),
    PRIMARY KEY (`id_detalle_devolucion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_rol_fkey` FOREIGN KEY (`id_rol`) REFERENCES `roles`(`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categorias` ADD CONSTRAINT `categorias_categoria_padre_fkey` FOREIGN KEY (`categoria_padre`) REFERENCES `categorias`(`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_id_proveedor_fkey` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores`(`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imagenes_productos` ADD CONSTRAINT `imagenes_productos_id_producto_fkey` FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variantes_producto` ADD CONSTRAINT `variantes_producto_id_producto_fkey` FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variantes_producto` ADD CONSTRAINT `variantes_producto_id_color_fkey` FOREIGN KEY (`id_color`) REFERENCES `colores`(`id_color`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variantes_producto` ADD CONSTRAINT `variantes_producto_id_talla_fkey` FOREIGN KEY (`id_talla`) REFERENCES `tallas`(`id_talla`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imagenes_variantes` ADD CONSTRAINT `imagenes_variantes_id_variante_fkey` FOREIGN KEY (`id_variante`) REFERENCES `variantes_producto`(`id_variante`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `descuentos` ADD CONSTRAINT `descuentos_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `descuentos` ADD CONSTRAINT `descuentos_id_producto_fkey` FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id_producto`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `descuentos` ADD CONSTRAINT `descuentos_usuario_creacion_fkey` FOREIGN KEY (`usuario_creacion`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `descuentos_clientes` ADD CONSTRAINT `descuentos_clientes_id_descuento_fkey` FOREIGN KEY (`id_descuento`) REFERENCES `descuentos`(`id_descuento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `descuentos_clientes` ADD CONSTRAINT `descuentos_clientes_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_descuentos` ADD CONSTRAINT `historial_descuentos_id_descuento_fkey` FOREIGN KEY (`id_descuento`) REFERENCES `descuentos`(`id_descuento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_descuentos` ADD CONSTRAINT `historial_descuentos_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_descuentos` ADD CONSTRAINT `historial_descuentos_id_venta_fkey` FOREIGN KEY (`id_venta`) REFERENCES `ventas`(`id_venta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_id_proveedor_fkey` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores`(`id_proveedor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_id_usuario_registro_fkey` FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_id_estado_pedido_fkey` FOREIGN KEY (`id_estado_pedido`) REFERENCES `estados_pedido`(`id_estado_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_compras` ADD CONSTRAINT `detalle_compras_id_compra_fkey` FOREIGN KEY (`id_compra`) REFERENCES `compras`(`id_compra`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_compras` ADD CONSTRAINT `detalle_compras_id_variante_fkey` FOREIGN KEY (`id_variante`) REFERENCES `variantes_producto`(`id_variante`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ajustes_inventario` ADD CONSTRAINT `ajustes_inventario_id_tipo_movimiento_fkey` FOREIGN KEY (`id_tipo_movimiento`) REFERENCES `tipos_movimiento`(`id_tipo_movimiento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ajustes_inventario` ADD CONSTRAINT `ajustes_inventario_usuario_registro_fkey` FOREIGN KEY (`usuario_registro`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_ajustes_inventario` ADD CONSTRAINT `detalle_ajustes_inventario_id_ajuste_fkey` FOREIGN KEY (`id_ajuste`) REFERENCES `ajustes_inventario`(`id_ajuste`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_ajustes_inventario` ADD CONSTRAINT `detalle_ajustes_inventario_id_variante_fkey` FOREIGN KEY (`id_variante`) REFERENCES `variantes_producto`(`id_variante`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_id_variante_fkey` FOREIGN KEY (`id_variante`) REFERENCES `variantes_producto`(`id_variante`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_id_tipo_movimiento_fkey` FOREIGN KEY (`id_tipo_movimiento`) REFERENCES `tipos_movimiento`(`id_tipo_movimiento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_usuario_registro_fkey` FOREIGN KEY (`usuario_registro`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_id_compra_fkey` FOREIGN KEY (`id_compra`) REFERENCES `compras`(`id_compra`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_id_venta_fkey` FOREIGN KEY (`id_venta`) REFERENCES `ventas`(`id_venta`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_id_ajuste_fkey` FOREIGN KEY (`id_ajuste`) REFERENCES `ajustes_inventario`(`id_ajuste`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `metodos_pago` ADD CONSTRAINT `metodos_pago_id_tipo_metodo_fkey` FOREIGN KEY (`id_tipo_metodo`) REFERENCES `tipos_metodo_pago`(`id_tipo_metodo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_id_usuario_vendedor_fkey` FOREIGN KEY (`id_usuario_vendedor`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_id_estado_pedido_fkey` FOREIGN KEY (`id_estado_pedido`) REFERENCES `estados_pedido`(`id_estado_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_id_descuento_fkey` FOREIGN KEY (`id_descuento`) REFERENCES `descuentos`(`id_descuento`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_ventas` ADD CONSTRAINT `detalle_ventas_id_venta_fkey` FOREIGN KEY (`id_venta`) REFERENCES `ventas`(`id_venta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_ventas` ADD CONSTRAINT `detalle_ventas_id_variante_fkey` FOREIGN KEY (`id_variante`) REFERENCES `variantes_producto`(`id_variante`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_id_venta_fkey` FOREIGN KEY (`id_venta`) REFERENCES `ventas`(`id_venta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_id_metodo_pago_fkey` FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodos_pago`(`id_metodo_pago`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_usuario_registro_fkey` FOREIGN KEY (`usuario_registro`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos_detalle` ADD CONSTRAINT `pagos_detalle_id_pago_fkey` FOREIGN KEY (`id_pago`) REFERENCES `pagos`(`id_pago`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos_detalle` ADD CONSTRAINT `pagos_detalle_id_metodo_pago_fkey` FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodos_pago`(`id_metodo_pago`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creditos` ADD CONSTRAINT `creditos_id_venta_fkey` FOREIGN KEY (`id_venta`) REFERENCES `ventas`(`id_venta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creditos` ADD CONSTRAINT `creditos_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creditos` ADD CONSTRAINT `creditos_usuario_registro_fkey` FOREIGN KEY (`usuario_registro`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clientes_credito_resumen` ADD CONSTRAINT `clientes_credito_resumen_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devoluciones` ADD CONSTRAINT `devoluciones_id_venta_fkey` FOREIGN KEY (`id_venta`) REFERENCES `ventas`(`id_venta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devoluciones` ADD CONSTRAINT `devoluciones_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devoluciones` ADD CONSTRAINT `devoluciones_usuario_registro_fkey` FOREIGN KEY (`usuario_registro`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_devoluciones` ADD CONSTRAINT `detalle_devoluciones_id_devolucion_fkey` FOREIGN KEY (`id_devolucion`) REFERENCES `devoluciones`(`id_devolucion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_devoluciones` ADD CONSTRAINT `detalle_devoluciones_id_detalle_venta_fkey` FOREIGN KEY (`id_detalle_venta`) REFERENCES `detalle_ventas`(`id_detalle_venta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_devoluciones` ADD CONSTRAINT `detalle_devoluciones_id_variante_fkey` FOREIGN KEY (`id_variante`) REFERENCES `variantes_producto`(`id_variante`) ON DELETE RESTRICT ON UPDATE CASCADE;
