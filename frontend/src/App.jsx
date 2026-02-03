import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductGrid from './components/ProductGrid';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Returns from './pages/Returns';
import AdminLayout from './layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProductList from './pages/admin/AdminProductList';
import ProductEditor from './pages/admin/ProductEditor';
import AdminOrders from './pages/admin/Orders';
import AdminCustomers from './pages/admin/AdminCustomers';
import Settings from './pages/admin/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import CookieConsent from './components/CookieConsent';
import './i18n';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { StoreConfigProvider } from './context/StoreConfigContext';

function App() {
  return (
    <Router>
      <StoreConfigProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes>
                {/* ... existing routes ... */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductGrid />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Legal Routes */}
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/returns" element={<Returns />} />

                {/* Admin Routes - Protected */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProductList />} />
                  <Route path="products/new" element={<ProductEditor />} />
                  <Route path="products/edit/:id" element={<ProductEditor />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>

      </StoreConfigProvider>
      <CookieConsent />
    </Router >
  );
}

export default App;
