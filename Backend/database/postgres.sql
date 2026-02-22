-- ============================================================================
-- SISTEMA DE GESTIÓN COMERCIAL - BASE DE DATOS POSTGRESQL
-- ============================================================================

-- Base de datos: PostgreSQL
-- ============================================================================

-- ============================================================================
-- ENUMERACIONES (ENUMS)
-- ============================================================================

CREATE TYPE "EstadoUsuario" AS ENUM ('activo', 'inactivo', 'bloqueado');

CREATE TYPE "EstadoCatalogo" AS ENUM ('activo', 'inactivo');

CREATE TYPE "EstadoProducto" AS ENUM ('activo', 'inactivo', 'descontinuado');

CREATE TYPE "TipoTalla" AS ENUM (
  'numerica', 'alfabetica', 'otra', 'bebe', 'nino',
  'mujer', 'hombre', 'adulto', 'calzado', 'especial'
);

CREATE TYPE "TipoDescuento" AS ENUM ('porcentaje', 'valor_fijo');

CREATE TYPE "AplicaDescuento" AS ENUM ('total_venta', 'categoria', 'producto', 'cliente');

CREATE TYPE "EstadoDescuento" AS ENUM ('activo', 'inactivo', 'vencido');

CREATE TYPE "EstadoCompra" AS ENUM ('pendiente', 'recibida', 'parcial', 'cancelada');

CREATE TYPE "TipoMovimientoEnum" AS ENUM ('entrada', 'salida', 'ajuste');

CREATE TYPE "EstadoAjuste" AS ENUM ('borrador', 'aplicado', 'cancelado');

CREATE TYPE "TipoVenta" AS ENUM ('contado', 'mixto', 'credito');

CREATE TYPE "EstadoPago" AS ENUM ('pendiente', 'parcial', 'pagado');

CREATE TYPE "TipoPago" AS ENUM ('inicial', 'abono', 'liquidacion');

CREATE TYPE "EstadoCredito" AS ENUM ('activo', 'pagado', 'vencido', 'cancelado');

CREATE TYPE "TipoDevolucion" AS ENUM ('total', 'parcial');

CREATE TYPE "EstadoDevolucion" AS ENUM ('pendiente', 'aprobada', 'rechazada', 'procesada');


-- ============================================================================
-- MÓDULO: AUTENTICACIÓN Y USUARIOS
-- ============================================================================

CREATE TABLE roles (
  id_rol        SERIAL          PRIMARY KEY,
  nombre_rol    VARCHAR(50)     NOT NULL UNIQUE,
  descripcion   TEXT,
  permisos      JSONB,
  activo        BOOLEAN         NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMP(0)    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roles_nombre_rol ON roles (nombre_rol);
CREATE INDEX idx_roles_activo     ON roles (activo);


CREATE TABLE usuarios (
  id_usuario          SERIAL              PRIMARY KEY,
  nombres             VARCHAR(100)        NOT NULL,
  apellidos           VARCHAR(100)        NOT NULL,
  usuario             VARCHAR(100)        NOT NULL UNIQUE,
  correo_electronico  VARCHAR(100)        NOT NULL UNIQUE,
  contrasena          VARCHAR(255)        NOT NULL,
  telefono            VARCHAR(20),
  direccion           TEXT,
  id_rol              INT                 NOT NULL DEFAULT 2,
  estado              "EstadoUsuario"     NOT NULL DEFAULT 'activo',
  ultima_conexion     TIMESTAMP(0),
  creado_en           TIMESTAMP(0)        NOT NULL DEFAULT NOW(),
  actualizado_en      TIMESTAMP(0)        NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol)
    REFERENCES roles (id_rol) ON UPDATE CASCADE
);

CREATE INDEX idx_usuarios_usuario            ON usuarios (usuario);
CREATE INDEX idx_usuarios_correo_electronico ON usuarios (correo_electronico);
CREATE INDEX idx_usuarios_id_rol             ON usuarios (id_rol);
CREATE INDEX idx_usuarios_estado             ON usuarios (estado);


-- ============================================================================
-- MÓDULO: CATÁLOGOS BASE
-- ============================================================================

CREATE TABLE categorias (
  id_categoria      SERIAL              PRIMARY KEY,
  nombre_categoria  VARCHAR(100)        NOT NULL UNIQUE,
  descripcion       TEXT,
  imagen_categoria  VARCHAR(255),
  categoria_padre   INT,
  estado            "EstadoCatalogo"    NOT NULL DEFAULT 'activo',
  creado_en         TIMESTAMP(0)        NOT NULL DEFAULT NOW(),
  actualizado_en    TIMESTAMP(0)        NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_categoria_padre FOREIGN KEY (categoria_padre)
    REFERENCES categorias (id_categoria) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_categorias_estado           ON categorias (estado);
CREATE INDEX idx_categorias_categoria_padre  ON categorias (categoria_padre);
CREATE INDEX idx_categorias_nombre_categoria ON categorias (nombre_categoria);


CREATE TABLE proveedores (
  id_proveedor        SERIAL              PRIMARY KEY,
  nombre_proveedor    VARCHAR(100)        NOT NULL,
  nit_cc              VARCHAR(20)         NOT NULL UNIQUE,
  contacto            VARCHAR(100),
  telefono            VARCHAR(20),
  correo_electronico  VARCHAR(100),
  direccion           TEXT,
  imagen_proveedor    VARCHAR(255),
  notas               TEXT,
  estado              "EstadoCatalogo"    NOT NULL DEFAULT 'activo',
  creado_en           TIMESTAMP(0)        NOT NULL DEFAULT NOW(),
  actualizado_en      TIMESTAMP(0)        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proveedores_nit_cc           ON proveedores (nit_cc);
CREATE INDEX idx_proveedores_estado           ON proveedores (estado);
CREATE INDEX idx_proveedores_nombre_proveedor ON proveedores (nombre_proveedor);


CREATE TABLE colores (
  id_color      SERIAL              PRIMARY KEY,
  nombre_color  VARCHAR(50)         NOT NULL UNIQUE,
  codigo_hex    VARCHAR(7),
  estado        "EstadoCatalogo"    NOT NULL DEFAULT 'activo',
  creado_en     TIMESTAMP(0)        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_colores_estado       ON colores (estado);
CREATE INDEX idx_colores_nombre_color ON colores (nombre_color);


CREATE TABLE tallas (
  id_talla      SERIAL              PRIMARY KEY,
  nombre_talla  VARCHAR(80)         NOT NULL UNIQUE,
  tipo_talla    "TipoTalla"         NOT NULL DEFAULT 'alfabetica',
  estado        "EstadoCatalogo"    NOT NULL DEFAULT 'activo',
  creado_en     TIMESTAMP(0)        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tallas_tipo_talla   ON tallas (tipo_talla);
CREATE INDEX idx_tallas_estado       ON tallas (estado);
CREATE INDEX idx_tallas_nombre_talla ON tallas (nombre_talla);


-- ============================================================================
-- MÓDULO: PRODUCTOS E INVENTARIO
-- ============================================================================

CREATE TABLE productos (
  id_producto             SERIAL              PRIMARY KEY,
  codigo_referencia       VARCHAR(100)        NOT NULL UNIQUE,
  nombre_producto         VARCHAR(150)        NOT NULL,
  descripcion             TEXT,
  precio_venta_sugerido   INT                 NOT NULL,
  unidad_medida           VARCHAR(20)         NOT NULL DEFAULT 'unidad',
  tiene_colores           BOOLEAN             NOT NULL DEFAULT FALSE,
  tiene_tallas            BOOLEAN             NOT NULL DEFAULT FALSE,
  datos_tecnicos          JSONB,
  id_categoria            INT                 NOT NULL,
  id_proveedor            INT,
  estado                  "EstadoProducto"    NOT NULL DEFAULT 'activo',
  creado_en               TIMESTAMP(0)        NOT NULL DEFAULT NOW(),
  actualizado_en          TIMESTAMP(0)        NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria)
    REFERENCES categorias (id_categoria) ON UPDATE CASCADE,
  CONSTRAINT fk_producto_proveedor FOREIGN KEY (id_proveedor)
    REFERENCES proveedores (id_proveedor) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_productos_codigo_referencia ON productos (codigo_referencia);
CREATE INDEX idx_productos_id_categoria      ON productos (id_categoria);
CREATE INDEX idx_productos_id_proveedor      ON productos (id_proveedor);
CREATE INDEX idx_productos_estado            ON productos (estado);
CREATE INDEX idx_productos_nombre_producto   ON productos (nombre_producto);


CREATE TABLE imagenes_productos (
  id_imagen     SERIAL        PRIMARY KEY,
  id_producto   INT           NOT NULL,
  ruta_imagen   VARCHAR(255)  NOT NULL,
  descripcion   VARCHAR(255),
  orden         INT           NOT NULL DEFAULT 0,
  es_principal  BOOLEAN       NOT NULL DEFAULT FALSE,
  creado_en     TIMESTAMP(0)  NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_imagen_producto FOREIGN KEY (id_producto)
    REFERENCES productos (id_producto) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_imagenes_productos_id_producto  ON imagenes_productos (id_producto);
CREATE INDEX idx_imagenes_productos_es_principal ON imagenes_productos (es_principal);


CREATE TABLE variantes_producto (
  id_variante     SERIAL              PRIMARY KEY,
  id_producto     INT                 NOT NULL,
  id_color        INT,
  id_talla        INT,
  codigo_sku      VARCHAR(100)        NOT NULL UNIQUE,
  precio_venta    DECIMAL(10, 2)      NOT NULL,
  precio_costo    DECIMAL(10, 2)      NOT NULL DEFAULT 0.00,
  cantidad_stock  DECIMAL(10, 2)      NOT NULL DEFAULT 0.00,
  stock_minimo    DECIMAL(10, 2)      NOT NULL DEFAULT 0.00,
  stock_maximo    DECIMAL(10, 2)      NOT NULL DEFAULT 0.00,
  estado          "EstadoCatalogo"    NOT NULL DEFAULT 'activo',
  creado_en       TIMESTAMP(0)        NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMP(0)        NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_variante_producto FOREIGN KEY (id_producto)
    REFERENCES productos (id_producto) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_variante_color FOREIGN KEY (id_color)
    REFERENCES colores (id_color) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_variante_talla FOREIGN KEY (id_talla)
    REFERENCES tallas (id_talla) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT variante_unica UNIQUE (id_producto, id_color, id_talla)
);

CREATE INDEX idx_variantes_codigo_sku     ON variantes_producto (codigo_sku);
CREATE INDEX idx_variantes_id_producto    ON variantes_producto (id_producto);
CREATE INDEX idx_variantes_id_color       ON variantes_producto (id_color);
CREATE INDEX idx_variantes_id_talla       ON variantes_producto (id_talla);
CREATE INDEX idx_variantes_cantidad_stock ON variantes_producto (cantidad_stock);
CREATE INDEX idx_variantes_estado         ON variantes_producto (estado);


CREATE TABLE imagenes_variantes (
  id_imagen_variante  SERIAL        PRIMARY KEY,
  id_variante         INT           NOT NULL,
  ruta_imagen         VARCHAR(255)  NOT NULL,
  descripcion         VARCHAR(255),
  orden               INT           NOT NULL DEFAULT 0,
  es_principal        BOOLEAN       NOT NULL DEFAULT FALSE,
  creado_en           TIMESTAMP(0)  NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_imagen_variante FOREIGN KEY (id_variante)
    REFERENCES variantes_producto (id_variante) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_imagenes_variantes_id_variante  ON imagenes_variantes (id_variante);
CREATE INDEX idx_imagenes_variantes_es_principal ON imagenes_variantes (es_principal);


-- ============================================================================
-- MÓDULO: ESTADOS DE PEDIDO
-- ============================================================================

CREATE TABLE estados_pedido (
  id_estado_pedido  SERIAL        PRIMARY KEY,
  nombre_estado     VARCHAR(50)   NOT NULL UNIQUE,
  descripcion       TEXT,
  color             VARCHAR(20),
  orden             INT           NOT NULL DEFAULT 0,
  activo            BOOLEAN       NOT NULL DEFAULT TRUE,
  creado_en         TIMESTAMP(0)  NOT NULL DEFAULT NOW(),
  actualizado_en    TIMESTAMP(0)  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_estados_pedido_activo ON estados_pedido (activo);
CREATE INDEX idx_estados_pedido_orden  ON estados_pedido (orden);


-- ============================================================================
-- MÓDULO: DESCUENTOS Y PROMOCIONES
-- ============================================================================

CREATE TABLE descuentos (
  id_descuento          SERIAL              PRIMARY KEY,
  nombre_descuento      VARCHAR(100)        NOT NULL,
  descripcion           TEXT,
  codigo_descuento      VARCHAR(50)         UNIQUE,
  tipo_descuento        "TipoDescuento"     NOT NULL,
  valor_descuento       DECIMAL(10, 2)      NOT NULL,
  aplica_a              "AplicaDescuento"   NOT NULL DEFAULT 'total_venta',
  id_categoria          INT,
  id_producto           INT,
  monto_minimo_compra   DECIMAL(10, 2)      NOT NULL DEFAULT 0.00,
  fecha_inicio          DATE,
  fecha_fin             DATE,
  requiere_codigo       BOOLEAN             NOT NULL DEFAULT FALSE,
  cantidad_maxima_usos  INT,
  usos_actuales         INT                 NOT NULL DEFAULT 0,
  uso_por_cliente       INT                 NOT NULL DEFAULT 1,
  usuario_creacion      INT                 NOT NULL,
  estado                "EstadoDescuento"   NOT NULL DEFAULT 'activo',
  creado_en             TIMESTAMP(0)        NOT NULL DEFAULT NOW(),
  actualizado_en        TIMESTAMP(0)        NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_descuento_categoria FOREIGN KEY (id_categoria)
    REFERENCES categorias (id_categoria) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_descuento_producto FOREIGN KEY (id_producto)
    REFERENCES productos (id_producto) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_descuento_usuario_creacion FOREIGN KEY (usuario_creacion)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE
);

CREATE INDEX idx_descuentos_codigo_descuento  ON descuentos (codigo_descuento);
CREATE INDEX idx_descuentos_tipo_descuento    ON descuentos (tipo_descuento);
CREATE INDEX idx_descuentos_estado            ON descuentos (estado);
CREATE INDEX idx_descuentos_fechas            ON descuentos (fecha_inicio, fecha_fin);
CREATE INDEX idx_descuentos_aplica_a          ON descuentos (aplica_a);
CREATE INDEX idx_descuentos_id_categoria      ON descuentos (id_categoria);
CREATE INDEX idx_descuentos_id_producto       ON descuentos (id_producto);
CREATE INDEX idx_descuentos_usuario_creacion  ON descuentos (usuario_creacion);


CREATE TABLE descuentos_clientes (
  id_descuento_cliente  SERIAL        PRIMARY KEY,
  id_descuento          INT           NOT NULL,
  id_usuario            INT           NOT NULL,
  usos_realizados       INT           NOT NULL DEFAULT 0,
  fecha_asignacion      TIMESTAMP(0)  NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_descuento_cliente_descuento FOREIGN KEY (id_descuento)
    REFERENCES descuentos (id_descuento) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_descuento_cliente_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT descuento_cliente_unico UNIQUE (id_descuento, id_usuario)
);

CREATE INDEX idx_descuentos_clientes_id_descuento ON descuentos_clientes (id_descuento);
CREATE INDEX idx_descuentos_clientes_id_usuario   ON descuentos_clientes (id_usuario);


-- ============================================================================
-- MÓDULO: COMPRAS A PROVEEDORES
-- ============================================================================

CREATE TABLE compras (
  id_compra           SERIAL          PRIMARY KEY,
  numero_compra       VARCHAR(50)     NOT NULL UNIQUE,
  id_proveedor        INT             NOT NULL,
  id_usuario_registro INT             NOT NULL,
  id_estado_pedido    INT             NOT NULL DEFAULT 8,
  fecha_compra        DATE            NOT NULL,
  fecha_entrega       DATE,
  subtotal            DECIMAL(12, 2)  NOT NULL,
  impuestos           DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  descuento           DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  total               DECIMAL(12, 2)  NOT NULL,
  notas               TEXT,
  estado              "EstadoCompra"  NOT NULL DEFAULT 'pendiente',
  creado_en           TIMESTAMP(0)    NOT NULL DEFAULT NOW(),
  actualizado_en      TIMESTAMP(0)    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_compra_proveedor FOREIGN KEY (id_proveedor)
    REFERENCES proveedores (id_proveedor) ON UPDATE CASCADE,
  CONSTRAINT fk_compra_usuario_registro FOREIGN KEY (id_usuario_registro)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE,
  CONSTRAINT fk_compra_estado_pedido FOREIGN KEY (id_estado_pedido)
    REFERENCES estados_pedido (id_estado_pedido) ON UPDATE CASCADE
);

CREATE INDEX idx_compras_estado             ON compras (estado);
CREATE INDEX idx_compras_numero_compra      ON compras (numero_compra);
CREATE INDEX idx_compras_id_proveedor       ON compras (id_proveedor);
CREATE INDEX idx_compras_id_usuario_registro ON compras (id_usuario_registro);
CREATE INDEX idx_compras_fecha_compra       ON compras (fecha_compra);
CREATE INDEX idx_compras_id_estado_pedido   ON compras (id_estado_pedido);


CREATE TABLE detalle_compras (
  id_detalle_compra   SERIAL          PRIMARY KEY,
  id_compra           INT             NOT NULL,
  id_variante         INT             NOT NULL,
  cantidad            DECIMAL(10, 2)  NOT NULL,
  cantidad_recibida   DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
  precio_unitario     DECIMAL(10, 2)  NOT NULL,
  descuento_linea     DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  subtotal            DECIMAL(12, 2)  NOT NULL,
  total_linea         DECIMAL(12, 2)  NOT NULL,
  creado_en           TIMESTAMP(0)    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_detalle_compra_compra FOREIGN KEY (id_compra)
    REFERENCES compras (id_compra) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_detalle_compra_variante FOREIGN KEY (id_variante)
    REFERENCES variantes_producto (id_variante) ON UPDATE CASCADE
);

CREATE INDEX idx_detalle_compras_id_compra   ON detalle_compras (id_compra);
CREATE INDEX idx_detalle_compras_id_variante ON detalle_compras (id_variante);


-- ============================================================================
-- MÓDULO: GESTIÓN DE INVENTARIO
-- ============================================================================

CREATE TABLE tipos_movimiento (
  id_tipo_movimiento  SERIAL                PRIMARY KEY,
  nombre_tipo         VARCHAR(50)           NOT NULL UNIQUE,
  tipo                "TipoMovimientoEnum"  NOT NULL,
  descripcion         TEXT,
  afecta_costo        BOOLEAN               NOT NULL DEFAULT FALSE,
  activo              BOOLEAN               NOT NULL DEFAULT TRUE,
  creado_en           TIMESTAMP(0)          NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tipos_movimiento_tipo   ON tipos_movimiento (tipo);
CREATE INDEX idx_tipos_movimiento_activo ON tipos_movimiento (activo);


CREATE TABLE ajustes_inventario (
  id_ajuste           SERIAL          PRIMARY KEY,
  numero_ajuste       VARCHAR(50)     NOT NULL UNIQUE,
  id_tipo_movimiento  INT             NOT NULL,
  usuario_registro    INT             NOT NULL,
  fecha_ajuste        DATE            NOT NULL,
  motivo              TEXT            NOT NULL,
  observaciones       TEXT,
  estado              "EstadoAjuste"  NOT NULL DEFAULT 'borrador',
  creado_en           TIMESTAMP(0)    NOT NULL DEFAULT NOW(),
  actualizado_en      TIMESTAMP(0)    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_ajuste_tipo_movimiento FOREIGN KEY (id_tipo_movimiento)
    REFERENCES tipos_movimiento (id_tipo_movimiento) ON UPDATE CASCADE,
  CONSTRAINT fk_ajuste_usuario_registro FOREIGN KEY (usuario_registro)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE
);

CREATE INDEX idx_ajustes_numero_ajuste      ON ajustes_inventario (numero_ajuste);
CREATE INDEX idx_ajustes_fecha_ajuste       ON ajustes_inventario (fecha_ajuste);
CREATE INDEX idx_ajustes_estado             ON ajustes_inventario (estado);
CREATE INDEX idx_ajustes_id_tipo_movimiento ON ajustes_inventario (id_tipo_movimiento);
CREATE INDEX idx_ajustes_usuario_registro   ON ajustes_inventario (usuario_registro);


CREATE TABLE detalle_ajustes_inventario (
  id_detalle_ajuste   SERIAL          PRIMARY KEY,
  id_ajuste           INT             NOT NULL,
  id_variante         INT             NOT NULL,
  cantidad_ajuste     DECIMAL(10, 2)  NOT NULL,
  stock_anterior      DECIMAL(10, 2)  NOT NULL,
  stock_nuevo         DECIMAL(10, 2)  NOT NULL,
  costo_unitario      DECIMAL(10, 2),
  observaciones       TEXT,
  creado_en           TIMESTAMP(0)    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_detalle_ajuste_ajuste FOREIGN KEY (id_ajuste)
    REFERENCES ajustes_inventario (id_ajuste) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_detalle_ajuste_variante FOREIGN KEY (id_variante)
    REFERENCES variantes_producto (id_variante) ON UPDATE CASCADE
);

CREATE INDEX idx_detalle_ajustes_id_ajuste   ON detalle_ajustes_inventario (id_ajuste);
CREATE INDEX idx_detalle_ajustes_id_variante ON detalle_ajustes_inventario (id_variante);


-- ============================================================================
-- MÓDULO: MÉTODOS DE PAGO
-- ============================================================================

CREATE TABLE tipos_metodo_pago (
  id_tipo_metodo  SERIAL        PRIMARY KEY,
  codigo          VARCHAR(50)   NOT NULL UNIQUE,
  nombre          VARCHAR(100)  NOT NULL,
  descripcion     TEXT,
  activo          BOOLEAN       NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMP(0)  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMP(0)  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tipos_metodo_pago_codigo  ON tipos_metodo_pago (codigo);
CREATE INDEX idx_tipos_metodo_pago_activo  ON tipos_metodo_pago (activo);


CREATE TABLE metodos_pago (
  id_metodo_pago      SERIAL        PRIMARY KEY,
  nombre_metodo       VARCHAR(100)  NOT NULL UNIQUE,
  descripcion         TEXT,
  id_tipo_metodo      INT           NOT NULL,
  requiere_referencia BOOLEAN       NOT NULL DEFAULT FALSE,
  activo              BOOLEAN       NOT NULL DEFAULT TRUE,
  creado_en           TIMESTAMP(0)  NOT NULL DEFAULT NOW(),
  actualizado_en      TIMESTAMP(0)  NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_metodo_pago_tipo FOREIGN KEY (id_tipo_metodo)
    REFERENCES tipos_metodo_pago (id_tipo_metodo) ON UPDATE CASCADE
);

CREATE INDEX idx_metodos_pago_id_tipo_metodo ON metodos_pago (id_tipo_metodo);
CREATE INDEX idx_metodos_pago_activo         ON metodos_pago (activo);


-- ============================================================================
-- MÓDULO: VENTAS
-- ============================================================================

CREATE TABLE ventas (
  id_venta                SERIAL          PRIMARY KEY,
  numero_factura          VARCHAR(50)     NOT NULL UNIQUE,
  id_usuario              INT             NOT NULL,
  id_usuario_vendedor     INT,
  id_estado_pedido        INT             NOT NULL,
  id_descuento            INT,
  codigo_descuento_usado  VARCHAR(50),
  direccion_entrega       TEXT,
  tipo_venta              "TipoVenta"     NOT NULL DEFAULT 'contado',
  subtotal                DECIMAL(12, 2)  NOT NULL,
  descuento_total         DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  impuestos               DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  total                   DECIMAL(12, 2)  NOT NULL,
  total_pagado            DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  saldo_pendiente         DECIMAL(12, 2)  NOT NULL,
  estado_pago             "EstadoPago"    NOT NULL DEFAULT 'pendiente',
  notas                   TEXT,
  creado_en               TIMESTAMP(0)    NOT NULL DEFAULT NOW(),
  actualizado_en          TIMESTAMP(0)    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_venta_usuario_cliente FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE,
  CONSTRAINT fk_venta_usuario_vendedor FOREIGN KEY (id_usuario_vendedor)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE,
  CONSTRAINT fk_venta_estado_pedido FOREIGN KEY (id_estado_pedido)
    REFERENCES estados_pedido (id_estado_pedido) ON UPDATE CASCADE,
  CONSTRAINT fk_venta_descuento FOREIGN KEY (id_descuento)
    REFERENCES descuentos (id_descuento) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_ventas_numero_factura      ON ventas (numero_factura);
CREATE INDEX idx_ventas_id_usuario          ON ventas (id_usuario);
CREATE INDEX idx_ventas_id_usuario_vendedor ON ventas (id_usuario_vendedor);
CREATE INDEX idx_ventas_id_descuento        ON ventas (id_descuento);
CREATE INDEX idx_ventas_creado_en           ON ventas (creado_en);
CREATE INDEX idx_ventas_tipo_venta          ON ventas (tipo_venta);
CREATE INDEX idx_ventas_estado_pago         ON ventas (estado_pago);
CREATE INDEX idx_ventas_id_estado_pedido    ON ventas (id_estado_pedido);


CREATE TABLE detalle_ventas (
  id_detalle_venta  SERIAL          PRIMARY KEY,
  id_venta          INT             NOT NULL,
  id_variante       INT             NOT NULL,
  cantidad          DECIMAL(10, 2)  NOT NULL,
  precio_unitario   DECIMAL(10, 2)  NOT NULL,
  descuento_linea   DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  subtotal          DECIMAL(12, 2)  NOT NULL,
  total_linea       DECIMAL(12, 2)  NOT NULL,
  creado_en         TIMESTAMP(0)    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_detalle_venta_venta FOREIGN KEY (id_venta)
    REFERENCES ventas (id_venta) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_detalle_venta_variante FOREIGN KEY (id_variante)
    REFERENCES variantes_producto (id_variante) ON UPDATE CASCADE
);

CREATE INDEX idx_detalle_ventas_id_venta    ON detalle_ventas (id_venta);
CREATE INDEX idx_detalle_ventas_id_variante ON detalle_ventas (id_variante);


-- ============================================================================
-- MÓDULO: MOVIMIENTOS DE INVENTARIO
-- (Se crea después de ventas y compras por las FK opcionales)
-- ============================================================================

CREATE TABLE movimientos_inventario (
  id_movimiento       SERIAL          PRIMARY KEY,
  id_variante         INT             NOT NULL,
  id_tipo_movimiento  INT             NOT NULL,
  usuario_registro    INT             NOT NULL,
  cantidad            DECIMAL(10, 2)  NOT NULL,
  stock_anterior      DECIMAL(10, 2)  NOT NULL,
  stock_nuevo         DECIMAL(10, 2)  NOT NULL,
  costo_unitario      DECIMAL(10, 2),
  valor_total         DECIMAL(12, 2),
  motivo              TEXT,
  fecha_movimiento    TIMESTAMP(0)    NOT NULL DEFAULT NOW(),
  id_compra           INT,
  id_venta            INT,
  id_ajuste           INT,

  CONSTRAINT fk_movimiento_variante FOREIGN KEY (id_variante)
    REFERENCES variantes_producto (id_variante) ON UPDATE CASCADE,
  CONSTRAINT fk_movimiento_tipo_movimiento FOREIGN KEY (id_tipo_movimiento)
    REFERENCES tipos_movimiento (id_tipo_movimiento) ON UPDATE CASCADE,
  CONSTRAINT fk_movimiento_usuario_registro FOREIGN KEY (usuario_registro)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE,
  CONSTRAINT fk_movimiento_compra FOREIGN KEY (id_compra)
    REFERENCES compras (id_compra) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_movimiento_venta FOREIGN KEY (id_venta)
    REFERENCES ventas (id_venta) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_movimiento_ajuste FOREIGN KEY (id_ajuste)
    REFERENCES ajustes_inventario (id_ajuste) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_movimientos_id_variante        ON movimientos_inventario (id_variante);
CREATE INDEX idx_movimientos_id_tipo_movimiento ON movimientos_inventario (id_tipo_movimiento);
CREATE INDEX idx_movimientos_fecha_movimiento   ON movimientos_inventario (fecha_movimiento);
CREATE INDEX idx_movimientos_id_compra          ON movimientos_inventario (id_compra);
CREATE INDEX idx_movimientos_id_venta           ON movimientos_inventario (id_venta);
CREATE INDEX idx_movimientos_id_ajuste          ON movimientos_inventario (id_ajuste);
CREATE INDEX idx_movimientos_usuario_registro   ON movimientos_inventario (usuario_registro);


-- ============================================================================
-- MÓDULO: PAGOS
-- ============================================================================

CREATE TABLE pagos (
  id_pago           SERIAL          PRIMARY KEY,
  id_venta          INT             NOT NULL,
  id_metodo_pago    INT             NOT NULL,
  usuario_registro  INT             NOT NULL,
  tipo_pago         "TipoPago"      NOT NULL DEFAULT 'inicial',
  monto             DECIMAL(12, 2)  NOT NULL,
  saldo_anterior    DECIMAL(12, 2)  NOT NULL,
  saldo_nuevo       DECIMAL(12, 2)  NOT NULL,
  referencia        VARCHAR(100),
  notas             TEXT,
  fecha_pago        TIMESTAMP(0)    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_pago_venta FOREIGN KEY (id_venta)
    REFERENCES ventas (id_venta) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pago_metodo_pago FOREIGN KEY (id_metodo_pago)
    REFERENCES metodos_pago (id_metodo_pago) ON UPDATE CASCADE,
  CONSTRAINT fk_pago_usuario_registro FOREIGN KEY (usuario_registro)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE
);

CREATE INDEX idx_pagos_id_venta         ON pagos (id_venta);
CREATE INDEX idx_pagos_tipo_pago        ON pagos (tipo_pago);
CREATE INDEX idx_pagos_fecha_pago       ON pagos (fecha_pago);
CREATE INDEX idx_pagos_id_metodo_pago   ON pagos (id_metodo_pago);
CREATE INDEX idx_pagos_usuario_registro ON pagos (usuario_registro);


CREATE TABLE pagos_detalle (
  id_pago_detalle SERIAL          PRIMARY KEY,
  id_pago         INT             NOT NULL,
  id_metodo_pago  INT             NOT NULL,
  monto           DECIMAL(12, 2)  NOT NULL,
  referencia      VARCHAR(150),

  CONSTRAINT fk_pago_detalle_pago FOREIGN KEY (id_pago)
    REFERENCES pagos (id_pago) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pago_detalle_metodo_pago FOREIGN KEY (id_metodo_pago)
    REFERENCES metodos_pago (id_metodo_pago) ON UPDATE CASCADE
);

CREATE INDEX idx_pagos_detalle_id_pago        ON pagos_detalle (id_pago);
CREATE INDEX idx_pagos_detalle_id_metodo_pago ON pagos_detalle (id_metodo_pago);


-- ============================================================================
-- MÓDULO: CRÉDITOS
-- ============================================================================

CREATE TABLE creditos (
  id_credito          SERIAL            PRIMARY KEY,
  id_venta            INT               NOT NULL UNIQUE,
  id_usuario          INT               NOT NULL,
  usuario_registro    INT               NOT NULL,
  monto_inicial       DECIMAL(12, 2)    NOT NULL DEFAULT 0.00,
  monto_credito       DECIMAL(12, 2)    NOT NULL,
  monto_total         DECIMAL(12, 2)    NOT NULL,
  total_abonado       DECIMAL(12, 2)    NOT NULL DEFAULT 0.00,
  saldo_pendiente     DECIMAL(12, 2)    NOT NULL,
  fecha_inicio        DATE              NOT NULL,
  fecha_vencimiento   DATE,
  fecha_ultimo_pago   DATE,
  dias_mora           INT               NOT NULL DEFAULT 0,
  observaciones       TEXT,
  estado              "EstadoCredito"   NOT NULL DEFAULT 'activo',
  creado_en           TIMESTAMP(0)      NOT NULL DEFAULT NOW(),
  actualizado_en      TIMESTAMP(0)      NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_credito_venta FOREIGN KEY (id_venta)
    REFERENCES ventas (id_venta) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_credito_usuario_cliente FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE,
  CONSTRAINT fk_credito_usuario_registro FOREIGN KEY (usuario_registro)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE
);

CREATE INDEX idx_creditos_id_venta          ON creditos (id_venta);
CREATE INDEX idx_creditos_id_usuario        ON creditos (id_usuario);
CREATE INDEX idx_creditos_estado            ON creditos (estado);
CREATE INDEX idx_creditos_fecha_vencimiento ON creditos (fecha_vencimiento);
CREATE INDEX idx_creditos_saldo_pendiente   ON creditos (saldo_pendiente);
CREATE INDEX idx_creditos_usuario_registro  ON creditos (usuario_registro);


CREATE TABLE clientes_credito_resumen (
  id_usuario                  INT             PRIMARY KEY,
  limite_credito              DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  credito_total               DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  saldo_total                 DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  total_abonado               DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  cantidad_creditos_activos   INT             NOT NULL DEFAULT 0,
  cantidad_creditos_pagados   INT             NOT NULL DEFAULT 0,
  cantidad_creditos_vencidos  INT             NOT NULL DEFAULT 0,
  fecha_ultimo_credito        DATE,
  fecha_ultimo_pago           DATE,
  fecha_actualizacion         TIMESTAMP(0)    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_resumen_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_clientes_credito_resumen_saldo_total    ON clientes_credito_resumen (saldo_total);
CREATE INDEX idx_clientes_credito_resumen_limite_credito ON clientes_credito_resumen (limite_credito);


-- ============================================================================
-- MÓDULO: DEVOLUCIONES
-- ============================================================================

CREATE TABLE devoluciones (
  id_devolucion         SERIAL                PRIMARY KEY,
  numero_devolucion     VARCHAR(50)           NOT NULL UNIQUE,
  id_venta              INT                   NOT NULL,
  id_usuario            INT                   NOT NULL,
  usuario_registro      INT                   NOT NULL,
  tipo_devolucion       "TipoDevolucion"      NOT NULL,
  motivo                TEXT                  NOT NULL,
  subtotal_devolucion   DECIMAL(12, 2)        NOT NULL,
  impuestos_devolucion  DECIMAL(12, 2)        NOT NULL DEFAULT 0.00,
  total_devolucion      DECIMAL(12, 2)        NOT NULL,
  fecha_devolucion      DATE                  NOT NULL,
  observaciones         TEXT,
  estado                "EstadoDevolucion"    NOT NULL DEFAULT 'pendiente',
  creado_en             TIMESTAMP(0)          NOT NULL DEFAULT NOW(),
  actualizado_en        TIMESTAMP(0)          NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_devolucion_venta FOREIGN KEY (id_venta)
    REFERENCES ventas (id_venta) ON UPDATE CASCADE,
  CONSTRAINT fk_devolucion_usuario_cliente FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE,
  CONSTRAINT fk_devolucion_usuario_registro FOREIGN KEY (usuario_registro)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE
);

CREATE INDEX idx_devoluciones_numero_devolucion ON devoluciones (numero_devolucion);
CREATE INDEX idx_devoluciones_id_venta          ON devoluciones (id_venta);
CREATE INDEX idx_devoluciones_id_usuario        ON devoluciones (id_usuario);
CREATE INDEX idx_devoluciones_estado            ON devoluciones (estado);
CREATE INDEX idx_devoluciones_fecha_devolucion  ON devoluciones (fecha_devolucion);
CREATE INDEX idx_devoluciones_usuario_registro  ON devoluciones (usuario_registro);


CREATE TABLE detalle_devoluciones (
  id_detalle_devolucion SERIAL          PRIMARY KEY,
  id_devolucion         INT             NOT NULL,
  id_detalle_venta      INT             NOT NULL,
  id_variante           INT             NOT NULL,
  cantidad_devuelta     DECIMAL(10, 2)  NOT NULL,
  precio_unitario       DECIMAL(10, 2)  NOT NULL,
  subtotal              DECIMAL(12, 2)  NOT NULL,
  motivo_linea          TEXT,
  creado_en             TIMESTAMP(0)    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_detalle_devolucion_devolucion FOREIGN KEY (id_devolucion)
    REFERENCES devoluciones (id_devolucion) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_detalle_devolucion_detalle_venta FOREIGN KEY (id_detalle_venta)
    REFERENCES detalle_ventas (id_detalle_venta) ON UPDATE CASCADE,
  CONSTRAINT fk_detalle_devolucion_variante FOREIGN KEY (id_variante)
    REFERENCES variantes_producto (id_variante) ON UPDATE CASCADE
);

CREATE INDEX idx_detalle_devoluciones_id_devolucion  ON detalle_devoluciones (id_devolucion);
CREATE INDEX idx_detalle_devoluciones_id_detalle_venta ON detalle_devoluciones (id_detalle_venta);
CREATE INDEX idx_detalle_devoluciones_id_variante    ON detalle_devoluciones (id_variante);


-- ============================================================================
-- HISTORIAL DE DESCUENTOS
-- (Se crea al final porque depende de ventas y descuentos)
-- ============================================================================

CREATE TABLE historial_descuentos (
  id_historial_descuento  SERIAL          PRIMARY KEY,
  id_descuento            INT             NOT NULL,
  id_usuario              INT             NOT NULL,
  id_venta                INT             NOT NULL,
  valor_aplicado          DECIMAL(10, 2)  NOT NULL,
  fecha_uso               TIMESTAMP(0)    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_historial_descuento_descuento FOREIGN KEY (id_descuento)
    REFERENCES descuentos (id_descuento) ON UPDATE CASCADE,
  CONSTRAINT fk_historial_descuento_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE,
  CONSTRAINT fk_historial_descuento_venta FOREIGN KEY (id_venta)
    REFERENCES ventas (id_venta) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_historial_descuentos_id_descuento ON historial_descuentos (id_descuento);
CREATE INDEX idx_historial_descuentos_id_venta     ON historial_descuentos (id_venta);
CREATE INDEX idx_historial_descuentos_id_usuario   ON historial_descuentos (id_usuario);
CREATE INDEX idx_historial_descuentos_fecha_uso    ON historial_descuentos (fecha_uso);


-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================