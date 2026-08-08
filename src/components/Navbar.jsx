import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Sun, Moon, Menu, X, ShoppingBag, User } from "lucide-react";

const navLinks = [
  { label: "Coleção", href: "#collection" },
  { label: "PORTFÓLIO", href: "#editorial" },
  { label: "Quem somos", href: "#about" },
];

export default function Navbar({ cartCount = 0 }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        data-testid="navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--nav-border)]"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-12 lg:px-24 py-4">
          <a
            href="#hero"
            data-testid="nav-logo"
            className="font-heading text-2xl font-black tracking-tighter text-[var(--text-primary)] hover:text-brand-red transition-colors"
            onClick={(e) => handleNavClick(e, "#hero")}
          >
            TREND FORGE
          </a>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-brand-red transition-colors duration-300"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              data-testid="theme-toggle"
              onClick={toggleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-brand-red transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Cart icon */}
            <button
              data-testid="nav-cart-button"
              onClick={() => navigate("/cart")}
              className="relative p-2 text-[var(--text-secondary)] hover:text-brand-red transition-colors"
              aria-label="Carrinho"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-red text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User icon */}
            <button
              data-testid="nav-user-button"
              onClick={() => {
                if (!user) navigate("/login");
                else if (user.role === "admin") navigate("/admin");
                else navigate("/profile");
              }}
              className="p-2 text-[var(--text-secondary)] hover:text-brand-red transition-colors"
              aria-label={user ? "Minha Conta" : "Entrar"}
            >
              <User size={18} />
            </button>

            <a
              href="#collection"
              data-testid="nav-cta-button"
              className="hidden md:block bg-brand-red text-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-[#0A0A0A] transition-colors duration-300"
              onClick={(e) => handleNavClick(e, "#collection")}
            >
              COMPRE AGORA
            </a>

            <button
              data-testid="mobile-menu-toggle"
              className="md:hidden p-2 text-[var(--text-primary)]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-heading text-3xl font-black tracking-tighter text-[var(--text-primary)] hover:text-brand-red transition-colors"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMobileOpen(false); navigate("/cart"); }}
              className="font-heading text-3xl font-black tracking-tighter text-[var(--text-primary)] hover:text-brand-red transition-colors"
            >
              Carrinho {cartCount > 0 && `(${cartCount})`}
            </button>
            <a
              href="#collection"
              className="mt-4 bg-brand-red text-white px-10 py-4 text-sm font-bold uppercase tracking-[0.15em]"
              onClick={(e) => handleNavClick(e, "#collection")}
            >
              COMPRE AGORA
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
