import { useState, useCallback, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { getCart } from "@/lib/api";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Collection from "@/components/Collection";
import Editorial from "@/components/Editorial";
import About from "@/components/About";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

// E-commerce pages
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderSuccess from "@/pages/OrderSuccess";
import OrderPending from "@/pages/OrderPending";
import OrderCancelled from "@/pages/OrderCancelled";
import ProfilePage from "@/pages/ProfilePage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

// Admin pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import ProductsManager from "@/pages/admin/ProductsManager";
import OrdersManager from "@/pages/admin/OrdersManager";
import CustomersManager from "@/pages/admin/CustomersManager";
import CouponsManager from "@/pages/admin/CouponsManager";
import SettingsPage from "@/pages/admin/SettingsPage";
import LogsPage from "@/pages/admin/LogsPage";

// Vitrine (homepage) - visual untouched, integrated with backend
function Vitrine() {
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();
  const handleLoaderComplete = useCallback(() => setLoading(false), []);

  const fetchCartCount = useCallback(async () => {
    if (!user) { setCartCount(0); return; }
    try {
      const { data } = await getCart();
      setCartCount(data.cart?.item_count || 0);
    } catch { setCartCount(0); }
  }, [user]);

  useEffect(() => { fetchCartCount(); }, [fetchCartCount]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-500">
        <Loader onComplete={handleLoaderComplete} />
        {!loading && (
          <>
            <Navbar cartCount={cartCount} />
            <main>
              <Hero />
              <Marquee />
              <Collection onCartUpdate={fetchCartCount} />
              <Editorial />
              <About />
              <Marquee />
              <FinalCTA />
            </main>
            <Footer />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Vitrine (unchanged) */}
          <Route path="/" element={<Vitrine />} />

          {/* E-commerce pages */}
          <Route path="/cart" element={<ThemeProvider><CartPage /></ThemeProvider>} />
          <Route path="/checkout" element={<ThemeProvider><CheckoutPage /></ThemeProvider>} />
          <Route path="/profile" element={<ThemeProvider><ProfilePage /></ThemeProvider>} />
          <Route path="/order/success" element={<ThemeProvider><OrderSuccess /></ThemeProvider>} />
          <Route path="/order/pending" element={<ThemeProvider><OrderPending /></ThemeProvider>} />
          <Route path="/order/cancelled" element={<ThemeProvider><OrderCancelled /></ThemeProvider>} />

          {/* Auth */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="orders" element={<OrdersManager />} />
            <Route path="customers" element={<CustomersManager />} />
            <Route path="coupons" element={<CouponsManager />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
