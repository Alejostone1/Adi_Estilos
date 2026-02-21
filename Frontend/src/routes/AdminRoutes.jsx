import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Dashboard - Mantener en bundle principal (acceso frecuente)
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";

// Gestión principal - Lazy loading
const UsuariosPage = lazy(() => import("../pages/admin/usuarios/UsuariosPage"));
const UsuariosVentas = lazy(() => import("../pages/admin/usuarios/UsuariosVentas"));
const UsuariosDetalleVenta = lazy(() => import("../pages/admin/usuarios/UsuariosDetalleVenta"));
const UsuariosCreditos = lazy(() => import("../pages/admin/usuarios/UsuariosCreditos"));
const RolesPage = lazy(() => import("../pages/admin/usuarios/RolesPage"));
const ProductosPage = lazy(() => import("../pages/admin/productos/ProductosPage"));
const VariantesPage = lazy(() => import("../pages/admin/variantes/VariantesPage"));
const VariantesProductoPage = lazy(() => import("../pages/admin/variantes/VariantesProductoPage"));
const ProductoEstadisticasPage = lazy(() => import("../pages/admin/productos/ProductoEstadisticasPage"));
const CategoriasPage = lazy(() => import("../pages/admin/productos/CategoriasPage"));
const ColoresPage = lazy(() => import("../pages/admin/productos/ColoresPage"));
const TallasPage = lazy(() => import("../pages/admin/productos/TallasPage"));
const ProveedoresPage = lazy(() => import("../pages/admin/productos/ProveedoresPage"));
const GaleriaProductosPage = lazy(() => import("../pages/admin/productos/GaleriaProductosPage"));
const GalleryLayout = lazy(() => import("../pages/admin/gallery/GalleryLayout"));

// Ventas y pedidos - Lazy loading
const VentasPage = lazy(() => import("../pages/admin/ventas/VentasPage"));
const DetallesVentasPage = lazy(() => import("../pages/admin/ventas/DetallesVentasPage"));
const EstadosPedidoPage = lazy(() => import("../pages/admin/ventas/EstadosPedidoPage"));
const MetodosPagoPage = lazy(() => import("../pages/admin/metodos-pago/MetodosPagoPage"));

// Compras e inventario - Lazy loading
const ComprasPage = lazy(() => import("../pages/admin/compras/ComprasPage"));
const DetalleComprasPage = lazy(() => import("../pages/admin/compras/DetalleCompras"));
const InventarioPage = lazy(() => import("../pages/admin/inventario/InventarioPage"));
const AjustesInventarioPage = lazy(() => import("../pages/admin/inventario/AjustesInventarioPage"));
const MovimientosInventarioPage = lazy(() => import("../pages/admin/inventario/MovimientosInventarioPage"));
const TiposMovimientoPage = lazy(() => import("../pages/admin/inventario/TiposMovimientoPage"));

// Créditos, pagos y descuentos - Lazy loading
const GestionCreditosPage = lazy(() => import("../pages/admin/creditos/GestionCreditosPage"));
const HistorialCreditosPage = lazy(() => import("../pages/admin/creditos/HistorialCreditosPage"));
const DetalleCreditoPage = lazy(() => import("../pages/admin/creditos/DetalleCreditoPage"));
const DescuentosPage = lazy(() => import("../pages/admin/descuentos/DescuentosPage"));
const HistorialDescuentosPage = lazy(() => import("../pages/admin/descuentos/HistorialDescuentosPage"));

// Devoluciones - Lazy loading
const DevolucionesPage = lazy(() => import("../pages/admin/devoluciones/DevolucionesPage"));
const DetalleDevolucionPage = lazy(() => import("../pages/admin/devoluciones/DetalleDevolucionPage"));

// Reportes - Lazy loading
const VentasReportesPage = lazy(() => import("../pages/admin/reportes/VentasReportesPage"));
const ReportesInventarioPage = lazy(() => import("../pages/admin/reportes/ReportesInventarioPage"));
const CreditosReportesPage = lazy(() => import("../pages/admin/reportes/CreditosReportesPage"));
const ComprasReportesPage = lazy(() => import("../pages/admin/reportes/ComprasReportesPage"));
const ReportesPagosPage = lazy(() => import("../pages/admin/reportes/ReportesPagosPage"));


const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<AdminLayout />}>
        {/* Dashboard */}
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />

        {/* Gestión principal */}
        <Route path="usuarios" element={<Suspense fallback={<LoadingSpinner />}><UsuariosPage /></Suspense>} />
        <Route path="usuarios/:id/ventas" element={<Suspense fallback={<LoadingSpinner />}><UsuariosVentas /></Suspense>} />
        <Route path="usuarios/:id/ventas/:idVenta" element={<Suspense fallback={<LoadingSpinner />}><UsuariosDetalleVenta /></Suspense>} />
        <Route path="usuarios/:id/creditos" element={<Suspense fallback={<LoadingSpinner />}><UsuariosCreditos /></Suspense>} />
        <Route path="roles" element={<Suspense fallback={<LoadingSpinner />}><RolesPage /></Suspense>} />

        {/* Productos */}
        <Route path="productos" element={<Suspense fallback={<LoadingSpinner />}><ProductosPage /></Suspense>} />
        <Route path="productos/variantes" element={<Suspense fallback={<LoadingSpinner />}><VariantesPage /></Suspense>} />
        <Route path="productos/:idProducto/variantes" element={<Suspense fallback={<LoadingSpinner />}><VariantesProductoPage /></Suspense>} />
        <Route path="productos/:idProducto/variantes/nueva" element={<Suspense fallback={<LoadingSpinner />}><VariantesProductoPage /></Suspense>} />
        <Route path="productos/:idProducto/estadisticas" element={<Suspense fallback={<LoadingSpinner />}><ProductoEstadisticasPage /></Suspense>} />
        <Route path="variantes/:idVariante/editar" element={<Suspense fallback={<LoadingSpinner />}><VariantesProductoPage /></Suspense>} />
        <Route path="productos/galeria" element={<Suspense fallback={<LoadingSpinner />}><GalleryLayout /></Suspense>} />
        <Route path="categorias" element={<Suspense fallback={<LoadingSpinner />}><CategoriasPage /></Suspense>} />
        <Route path="colores" element={<Suspense fallback={<LoadingSpinner />}><ColoresPage /></Suspense>} />
        <Route path="tallas" element={<Suspense fallback={<LoadingSpinner />}><TallasPage /></Suspense>} />

        {/* Proveedores y compras */}
        <Route path="proveedores" element={<Suspense fallback={<LoadingSpinner />}><ProveedoresPage /></Suspense>} />
        <Route path="compras" element={<Suspense fallback={<LoadingSpinner />}><ComprasPage /></Suspense>} />
        <Route path="compras/detalle/:id?" element={<Suspense fallback={<LoadingSpinner />}><DetalleComprasPage /></Suspense>} />

        {/* Ventas */}
        <Route path="ventas" element={<Suspense fallback={<LoadingSpinner />}><VentasPage /></Suspense>} />
        <Route path="ventas/detalle/:id?" element={<Suspense fallback={<LoadingSpinner />}><DetallesVentasPage /></Suspense>} />
        <Route path="estados-pedido" element={<Suspense fallback={<LoadingSpinner />}><EstadosPedidoPage /></Suspense>} />

        {/* Inventario */}
        <Route path="inventario" element={<Suspense fallback={<LoadingSpinner />}><InventarioPage /></Suspense>} />
        <Route path="inventario/ajustes" element={<Suspense fallback={<LoadingSpinner />}><AjustesInventarioPage /></Suspense>} />
        <Route
          path="inventario/movimientos"
          element={<Suspense fallback={<LoadingSpinner />}><MovimientosInventarioPage /></Suspense>}
        />
        <Route
          path="inventario/tipos-movimiento"
          element={<Suspense fallback={<LoadingSpinner />}><TiposMovimientoPage /></Suspense>}
        />

        {/* Créditos y Cobranzas */}
        <Route path="ventas-credito" element={<Suspense fallback={<LoadingSpinner />}><HistorialCreditosPage /></Suspense>} /> {/* Legacy Redirect */}
        <Route path="creditos/gestion" element={<Suspense fallback={<LoadingSpinner />}><GestionCreditosPage /></Suspense>} />
        <Route path="creditos/historial" element={<Suspense fallback={<LoadingSpinner />}><HistorialCreditosPage /></Suspense>} />
        <Route path="creditos/detalle" element={<Suspense fallback={<LoadingSpinner />}><DetalleCreditoPage /></Suspense>} /> {/* Se encarga de mostrar buscador si no hay ID */}
        <Route path="creditos/detalle/:id" element={<Suspense fallback={<LoadingSpinner />}><DetalleCreditoPage /></Suspense>} />

        {/* Descuentos */}
        <Route path="descuentos" element={<Suspense fallback={<LoadingSpinner />}><DescuentosPage /></Suspense>} />
        <Route
          path="descuentos/historial"
          element={<Suspense fallback={<LoadingSpinner />}><HistorialDescuentosPage /></Suspense>}
        />

        {/* Métodos de pago */}
        <Route path="metodos-pago" element={<Suspense fallback={<LoadingSpinner />}><MetodosPagoPage /></Suspense>} />

        {/* Devoluciones */}
        <Route path="devoluciones" element={<Suspense fallback={<LoadingSpinner />}><DevolucionesPage /></Suspense>} />
        <Route path="devoluciones/detalle/:id?" element={<Suspense fallback={<LoadingSpinner />}><DetalleDevolucionPage /></Suspense>} />

        {/* Reportes */}
        <Route path="reportes/ventas" element={<Suspense fallback={<LoadingSpinner />}><VentasReportesPage /></Suspense>} />
        <Route
          path="reportes/inventario"
          element={<Suspense fallback={<LoadingSpinner />}><ReportesInventarioPage /></Suspense>}
        />
        <Route
          path="reportes/creditos"
          element={<Suspense fallback={<LoadingSpinner />}><CreditosReportesPage /></Suspense>}
        />
        <Route path="reportes/compras" element={<Suspense fallback={<LoadingSpinner />}><ComprasReportesPage /></Suspense>} />
        <Route path="reportes/pagos" element={<Suspense fallback={<LoadingSpinner />}><ReportesPagosPage /></Suspense>} />

      </Route>
    </Routes>
  );
};

export default AdminRoutes;
