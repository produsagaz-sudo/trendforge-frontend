import { useEffect, useState } from "react";
import { adminGetCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon, formatError } from "@/lib/api";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export default function CouponsManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: "", min_purchase: "", max_uses: "", is_active: true });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminGetCoupons(); setCoupons(data.coupons); } catch {} finally { setLoading(false); }
  };

  const resetForm = () => { setForm({ code: "", discount_type: "percentage", discount_value: "", min_purchase: "", max_uses: "", is_active: true }); setEditing(null); setShowForm(false); setError(""); };

  const handleSave = async () => {
    setError("");
    try {
      const data = { ...form, discount_value: parseFloat(form.discount_value), min_purchase: parseFloat(form.min_purchase) || 0, max_uses: parseInt(form.max_uses) || null };
      if (editing) { await adminUpdateCoupon(editing, data); } else { await adminCreateCoupon(data); }
      resetForm(); load();
    } catch (e) { setError(formatError(e.response?.data?.detail)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir cupom?")) return;
    await adminDeleteCoupon(id); load();
  };

  if (loading) return <div className="text-zinc-500">Carregando...</div>;

  return (
    <div data-testid="admin-coupons">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-white">Cupons ({coupons.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#E60000] text-white px-4 py-2 text-xs font-bold uppercase flex items-center gap-2" data-testid="admin-add-coupon"><Plus size={14} /> Novo Cupom</button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-white uppercase">{editing ? "Editar" : "Novo"} Cupom</h2>
            <button onClick={resetForm} className="text-zinc-500"><X size={16} /></button>
          </div>
          {error && <div className="bg-red-500/10 text-red-400 px-3 py-2 mb-3 text-xs">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input placeholder="Codigo" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm uppercase" data-testid="coupon-form-code" />
            <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm">
              <option value="percentage">Porcentagem</option>
              <option value="fixed">Valor Fixo (R$)</option>
            </select>
            <input type="number" placeholder="Valor" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" data-testid="coupon-form-value" />
            <input type="number" placeholder="Compra minima (R$)" value={form.min_purchase} onChange={e => setForm({ ...form, min_purchase: e.target.value })} className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" />
            <input type="number" placeholder="Maximo de usos" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm text-zinc-400"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Ativo</label>
          </div>
          <button onClick={handleSave} className="bg-[#E60000] text-white px-6 py-2 text-xs font-bold uppercase" data-testid="coupon-form-save">{editing ? "Salvar" : "Criar"}</button>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase"><th className="text-left p-3">Codigo</th><th className="text-left p-3">Tipo</th><th className="text-left p-3">Valor</th><th className="text-left p-3">Min.</th><th className="text-left p-3">Usos</th><th className="text-left p-3">Status</th><th className="text-right p-3">Acoes</th></tr></thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="p-3 text-white font-medium">{c.code}</td>
                <td className="p-3 text-zinc-400">{c.discount_type === "percentage" ? "%" : "R$"}</td>
                <td className="p-3 text-white">{c.discount_value}{c.discount_type === "percentage" ? "%" : ""}</td>
                <td className="p-3 text-zinc-400">R$ {c.min_purchase || 0}</td>
                <td className="p-3 text-zinc-400">{c.used_count || 0}/{c.max_uses || "∞"}</td>
                <td className="p-3"><span className={c.is_active ? "text-green-400 text-xs" : "text-zinc-600 text-xs"}>{c.is_active ? "Ativo" : "Inativo"}</span></td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing(c.id); setForm({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, min_purchase: c.min_purchase || "", max_uses: c.max_uses || "", is_active: c.is_active }); setShowForm(true); }} className="text-zinc-500 hover:text-white mr-2"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-zinc-500 hover:text-red-400"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
