import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Settings, FileText, LogOut, ChevronLeft, Menu } from "lucide-react";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/admin/products", label: "Produtos", icon: Package },
  { path: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { path: "/admin/customers", label: "Clientes", icon: Users },
  { path: "/admin/coupons", label: "Cupons", icon: Tag },
  { path: "/admin/settings", label: "Configuracoes", icon: Settings },
  { path: "/admin/logs", label: "Logs", icon: FileText },
];

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/admin/login");
      } else if (user.role !== "admin") {
        navigate("/");
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="text-zinc-500">Carregando...</div></div>;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex" data-testid="admin-layout">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-[#0f0f0f] border-r border-zinc-800 flex flex-col transform transition-transform lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-zinc-800">
          <Link to="/" className="font-heading text-xl font-black tracking-tighter text-white hover:text-[#E60000] transition-colors" data-testid="admin-logo">
            TREND FORGE
          </Link>
          <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon, exact }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              data-testid={`admin-nav-${label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                isActive(path, exact)
                  ? "bg-[#E60000]/10 text-[#E60000] border-l-2 border-[#E60000]"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-600 mb-2">{user.email}</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-zinc-500 hover:text-[#E60000] transition-colors" data-testid="admin-logout">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-[#0A0A0A]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-zinc-400" data-testid="admin-menu-toggle">
            <Menu size={20} />
          </button>
          <Link to="/" className="text-xs text-zinc-500 hover:text-[#E60000] flex items-center gap-1" data-testid="admin-back-to-store">
            <ChevronLeft size={14} /> Voltar a Loja
          </Link>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
