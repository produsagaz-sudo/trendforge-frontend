import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-500">Carregando dashboard...</div>;
  if (!data) return <div className="text-zinc-500">Erro ao carregar</div>;

  const { stats, recent_orders, top_products, low_stock_products } = data;

  const statCards = [
    { label: "Pedidos", value: stats.total_orders, icon: ShoppingCart, color: "text-blue-400" },
    { label: "Pendentes", value: stats.pending_orders, icon: AlertTriangle, color: "text-yellow-400" },
    { label: "Produtos", value: stats.total_products, icon: Package, color: "text-purple-400" },
    { label: "Clientes", value: stats.total_customers, icon: Users, color: "text-green-400" },
    { label: "Receita", value: `R$ ${stats.total_revenue.toFixed(2)}`, icon: DollarSign, color: "text-[#E60000]" },
    { label: "Confirmados", value: stats.confirmed_orders, icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <div data-testid="admin-dashboard">
      <h1 className="text-xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 p-4" data-testid={`stat-${label.toLowerCase()}`}>
            <Icon size={16} className={`${color} mb-2`} />
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Pedidos Recentes</h2>
          {recent_orders.length === 0 ? (
            <p className="text-zinc-500 text-sm">Nenhum pedido ainda</p>
          ) : (
            <div className="space-y-2">
              {recent_orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex justify-between items-center text-sm py-2 border-b border-zinc-800 last:border-0">
                  <div>
                    <span className="text-white font-medium">{order.order_number}</span>
                    <span className="text-zinc-500 ml-2">{order.user_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 ${order.status === "confirmed" ? "bg-green-900/30 text-green-400" : order.status === "cancelled" ? "bg-red-900/30 text-red-400" : "bg-yellow-900/30 text-yellow-400"}`}>
                      {order.status}
                    </span>
                    <span className="text-white font-medium">R$ {order.total?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Estoque Baixo</h2>
          {low_stock_products.length === 0 ? (
            <p className="text-zinc-500 text-sm">Tudo em ordem</p>
          ) : (
            <div className="space-y-2">
              {low_stock_products.map(p => (
                <div key={p.id} className="flex justify-between items-center text-sm py-2 border-b border-zinc-800 last:border-0">
                  <span className="text-white">{p.name}</span>
                  <div className="flex gap-2">
                    {p.variations?.map(v => (
                      <span key={v.size} className={`text-xs px-2 py-0.5 ${v.stock <= 5 ? "bg-red-900/30 text-red-400" : "bg-zinc-800 text-zinc-400"}`}>
                        {v.size}: {v.stock}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
