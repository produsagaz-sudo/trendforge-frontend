import { useEffect, useState } from "react";
import { adminGetCustomers, adminGetOrders, formatError } from "@/lib/api";
import { Eye, X, Edit2, Check, Package } from "lucide-react";
import api from "@/lib/api";

const statusColors = {
  pending: "bg-yellow-900/30 text-yellow-400",
  confirmed: "bg-green-900/30 text-green-400",
  processing: "bg-blue-900/30 text-blue-400",
  shipped: "bg-purple-900/30 text-purple-400",
  delivered: "bg-emerald-900/30 text-emerald-400",
  cancelled: "bg-red-900/30 text-red-400",
};

export default function CustomersManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await adminGetCustomers();
      setCustomers(data.customers);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  const openCustomer = async (customer) => {
    setSelected(customer);
    setEditing(false);
    setEditMsg("");
    setEditName(customer.name || "");
    setEditPhone(customer.phone || "");
    setLoadingOrders(true);
    try {
      // Fetch orders for this customer via admin orders endpoint filtered by user
      const { data } = await api.get(`/admin/orders`, { params: { limit: 50 } });
      // Filter client-side by user_id since we don't have a user filter on the admin endpoint
      const customerOrders = data.orders.filter(o => o.user_id === customer.id);
      setOrders(customerOrders);
    } catch {
      setOrders([]);
    } finally { setLoadingOrders(false); }
  };

  const handleSaveCustomer = async () => {
    if (!selected) return;
    setSaving(true);
    setEditMsg("");
    try {
      const update = {};
      if (editName.trim()) update.name = editName.trim();
      if (editPhone !== undefined) update.phone = editPhone.trim();
      update.updated_at = new Date().toISOString();

      await api.put(`/admin/customers/${selected.id}`, update);
      setEditMsg("Dados atualizados!");
      setEditing(false);
      // Update local state
      setSelected({ ...selected, name: editName.trim(), phone: editPhone.trim() });
      setCustomers(customers.map(c => c.id === selected.id ? { ...c, name: editName.trim(), phone: editPhone.trim() } : c));
      setTimeout(() => setEditMsg(""), 3000);
    } catch (e) {
      setEditMsg(formatError(e.response?.data?.detail));
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-zinc-500">Carregando...</div>;

  return (
    <div data-testid="admin-customers">
      <h1 className="text-xl font-bold text-white mb-6">Clientes ({total})</h1>
      <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase">
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Telefone</th>
              <th className="text-left p-3">Pedidos</th>
              <th className="text-left p-3">Desde</th>
              <th className="text-right p-3">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-b border-zinc-800 hover:bg-zinc-800/50" data-testid={`customer-row-${c.id}`}>
                <td className="p-3 text-white">{c.name}</td>
                <td className="p-3 text-zinc-400">{c.email}</td>
                <td className="p-3 text-zinc-400">{c.phone || "—"}</td>
                <td className="p-3 text-white">{c.order_count || 0}</td>
                <td className="p-3 text-zinc-500 text-xs">{c.created_at?.slice(0, 10)}</td>
                <td className="p-3 text-right">
                  <button onClick={() => openCustomer(c)} className="text-zinc-500 hover:text-white" data-testid={`customer-view-${c.id}`}><Eye size={14} /></button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-zinc-500">Nenhum cliente ainda</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto pt-8 pb-8">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl mx-4 p-6" data-testid="customer-detail-modal">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white uppercase">Cliente</h2>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>

            {editMsg && (
              <div className={`text-xs px-3 py-2 mb-4 ${editMsg.includes("atualizado") ? "text-green-400 bg-green-900/20 border border-green-900/30" : "text-red-400 bg-red-900/20 border border-red-900/30"}`}>{editMsg}</div>
            )}

            {/* Customer Info */}
            <div className="bg-zinc-800/50 border border-zinc-700 p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase">Dados do Cliente</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-bold text-[#E60000] uppercase" data-testid="customer-edit-btn"><Edit2 size={12} /> Editar</button>
                ) : (
                  <button onClick={() => { setEditing(false); setEditName(selected.name || ""); setEditPhone(selected.phone || ""); }} className="text-xs text-zinc-500 uppercase font-bold">Cancelar</button>
                )}
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Nome</label>
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" data-testid="customer-edit-name" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Telefone</label>
                    <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="(21) 99999-0000" className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" data-testid="customer-edit-phone" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Email</label>
                    <p className="text-sm text-zinc-500 px-3 py-2">{selected.email} <span className="text-xs">(nao editavel)</span></p>
                  </div>
                  <button onClick={handleSaveCustomer} disabled={saving} className="bg-[#E60000] text-white px-6 py-2 text-xs font-bold uppercase disabled:opacity-50" data-testid="customer-save-btn">{saving ? "Salvando..." : "Salvar"}</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-zinc-500">Nome:</span> <span className="text-white">{selected.name}</span></div>
                  <div><span className="text-zinc-500">Email:</span> <span className="text-white">{selected.email}</span></div>
                  <div><span className="text-zinc-500">Telefone:</span> <span className={selected.phone ? "text-white" : "text-zinc-600"}>{selected.phone || "Nao informado"}</span></div>
                  <div><span className="text-zinc-500">Desde:</span> <span className="text-white">{selected.created_at?.slice(0, 10)}</span></div>
                </div>
              )}
            </div>

            {/* Order History */}
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase mb-3"><Package size={12} className="inline mr-1" />Historico de Pedidos ({orders.length})</h3>
              {loadingOrders ? (
                <p className="text-zinc-500 text-sm">Carregando pedidos...</p>
              ) : orders.length === 0 ? (
                <p className="text-zinc-500 text-sm">Nenhum pedido encontrado</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {orders.map(o => (
                    <div key={o.id} className="bg-zinc-800/50 border border-zinc-700 p-3 text-sm" data-testid={`customer-order-${o.id}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">{o.order_number}</p>
                          <p className="text-xs text-zinc-500">{o.created_at?.slice(0, 10)} | {o.items?.length || 0} item(s) | {o.payment_method?.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 uppercase ${statusColors[o.status] || "text-zinc-400"}`}>{o.status}</span>
                          <p className="text-white font-medium mt-1">R$ {o.total?.toFixed(2)}</p>
                        </div>
                      </div>
                      {o.shipping_method === "uber_moto" && (
                        <p className="text-xs text-yellow-400 font-bold mt-1">UBER/MOTO — COMBINAR VIA WHATSAPP</p>
                      )}
                      <div className="mt-2 text-xs text-zinc-500">
                        {o.items?.map((item, i) => (
                          <span key={i}>{i > 0 && " | "}{item.product_name} ({item.size}) x{item.quantity}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
