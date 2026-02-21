
/**
 * @file main.jsx
 * @brief Punto de entrada principal de la aplicación de React.
 *
 * Este archivo renderiza la aplicación en el DOM, configurando los
 * proveedores de contexto globales (autenticación, carrito) y el
 * enrutador principal para la navegación de la aplicación.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/admin-typography.css';

// Importar estilos globales de Tailwind CSS

// Importar proveedores de contexto
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Importar el componente principal de la aplicación
import App from './App';
import ScrollToTop from './components/layout/ScrollToTop';

// Renderizar la aplicación en el elemento 'root' del DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* El BrowserRouter con future flags para eliminar advertencias y preparar v7 */}
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      {/* El AuthProvider maneja el estado de autenticación global */}
      <AuthProvider>
        {/* El CartProvider maneja el estado del carrito de compras */}
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);