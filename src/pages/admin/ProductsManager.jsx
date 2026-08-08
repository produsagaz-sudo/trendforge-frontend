import { useEffect, useState } from "react";
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, getCategories, formatError } from "@/lib/api";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", price_pix: "", price_card: "", category_id: "",
    is_active: true, featured: false,
    variations: [{ size: "M", sku: "", stock: 0 }, { size: "G", sku: "", stock: 0 }, { size: "GG", sku: "", stock: 0 }],
    images: [{ url: "", alt: "", is_primary: true }],
    tags: [],
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([adminGetProducts(), getCategories()]);
      setProducts(pRes.data.products);
      setCategories(cRes.data.categories);
    } catch (e) {} finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price_pix: "", price_card: "", category_id: "", is_active: true, featured: false, variations: [{ size: "M", sku: "", stock: 0 }, { size: "G", sku: "", stock: 0 }, { size: "GG", sku: "", stock: 0 }], images: [{ url: "", alt: "", is_primary: true }], tags: [] });
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name, description: p.description || "", price_pix: p.price_pix, price_card: p.price_card,
      category_id: p.category_id || "", is_active: p.is_active, featured: p.featured || false,
      variations: p.variations || [], images: p.images || [{ url: "", alt: "", is_primary: true }], tags: p.tags || [],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setError("");
    try {
      const data = { ...form, price_pix: parseFloat(form.price_pix), price_card: parseFloat(form.price_card) };
      data.variations = data.variations.map(v => ({ ...v, stock: parseInt(v.stock) || 0 }));
      if (editing) {
        await adminUpdateProduct(editing, data);
      } else {
        await adminCreateProduct(data);
      }
      resetForm();
      load();
    } catch (e) { setError(formatError(e.response?.data?.detail)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir produto?")) return;
    await adminDeleteProduct(id);
    load();
  };

  const updateVariation = (idx, field, value) => {
    const vars = [...form.variations];
    vars[idx] = { ...vars[idx], [field]: field === "stock" ? parseInt(value) || 0 : value };
    setForm({ ...form, variations: vars });
  };

  const updateImage = (idx, field, value) => {
    const imgs = [...form.images];
    imgs[idx] = { ...imgs[idx], [field]: value };
    setForm({ ...form, images: imgs });
  };

  if (loading) return <div className="text-zinc-500">Carregando...</div>;

  return (
    <div data-testid="admin-products">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-white">Produtos ({products.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#E60000] text-white px-4 py-2 text-xs font-bold uppercase flex items-center gap-2" data-testid="admin-add-product"><Plus size={14} /> Novo Produto</button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto pt-10 pb-10">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white uppercase">{editing ? "Editar" : "Novo"} Produto</h2>
              <button onClick={resetForm} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 mb-4 text-xs">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <input placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" data-testid="product-form-name" />
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm">
                <option value="">Categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" placeholder="Preco PIX" value={form.price_pix} onChange={e => setForm({ ...form, price_pix: e.target.value })} className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" data-testid="product-form-price-pix" />
              <input type="number" placeholder="Preco Cartao" value={form.price_card} onChange={e => setForm({ ...form, price_card: e.target.value })} className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" data-testid="product-form-price-card" />
            </div>
            <textarea placeholder="Descricao" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm mb-4 h-20" />
              {/* Tags */}
<div className="mb-4">
  <h3 className="text-xs font-bold text-zinc-400 uppercase mb-2">
    Tags do Produto
  </h3>

  <input
    type="text"
    placeholder="Ex: oversized, streetwear, masculino"
    value={form.tags.join(", ")}
    onChange={e =>
      setForm({
        ...form,
        tags: e.target.value
          .split(",")
          .map(tag => tag.trim())
          .filter(Boolean)
      })
    }
    className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm"
  />

  <p className="text-zinc-600 text-[10px] mt-1">
    Separe as tags por vírgula.
  </p>
</div>

            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm text-zinc-400"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Ativo</label>
              <label className="flex items-center gap-2 text-sm text-zinc-400"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Destaque</label>
            </div>

            {/* Variations */}
            <h3 className="text-xs font-bold text-zinc-400 uppercase mb-2">Variacoes / Estoque</h3>
            <div className="space-y-2 mb-4">
              {form.variations.map((v, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input value={v.size} onChange={e => updateVariation(i, "size", e.target.value)} placeholder="Tamanho" className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" />
                  <input value={v.sku} onChange={e => updateVariation(i, "sku", e.target.value)} placeholder="SKU" className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" />
                  <input type="number" value={v.stock} onChange={e => updateVariation(i, "stock", e.target.value)} placeholder="Estoque" className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" data-testid={`product-stock-${v.size}`} />
                </div>
              ))}
            </div>

            {/* Images */}
            <h3 className="text-xs font-bold text-zinc-400 uppercase mb-2">Imagens</h3>
            <div className="space-y-2 mb-4">
              {form.images.map((img, i) => (
                <input key={i} value={img.url} onChange={e => updateImage(i, "url", e.target.value)} placeholder={`URL da imagem ${i + 1}`} className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" />
              ))}
              <button onClick={() => setForm({ ...form, images: [...form.images, { url: "", alt: "", is_primary: false }] })} className="text-xs text-[#E60000]">+ Adicionar Imagem</button>
            </div>

            <button onClick={handleSave} className="w-full bg-[#E60000] text-white py-3 text-xs font-bold uppercase" data-testid="product-form-save">{editing ? "Salvar" : "Criar Produto"}</button>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase">
              <th className="text-left p-3">Produto</th>
              <th className="text-left p-3">PIX</th>
              <th className="text-left p-3">Cartao</th>
              <th className="text-left p-3">Estoque</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-zinc-800 hover:bg-zinc-800/50" data-testid={`product-row-${p.id}`}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-10 h-12 object-cover" />}
                    <div>
                      <p className="text-white font-medium">{p.name}</p>
                      <p className="text-zinc-600 text-xs">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-white">R$ {p.price_pix?.toFixed(2)}</td>
                <td className="p-3 text-white">R$ {p.price_card?.toFixed(2)}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {p.variations?.map(v => (
                      <span key={v.size} className={`text-xs px-1.5 py-0.5 ${v.stock <= 5 ? "bg-red-900/30 text-red-400" : "bg-zinc-800 text-zinc-400"}`}>{v.size}:{v.stock}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3"><span className={`text-xs ${p.is_active ? "text-green-400" : "text-zinc-600"}`}>{p.is_active ? "Ativo" : "Inativo"}</span></td>
                <td className="p-3 text-right">
                  <button onClick={() => handleEdit(p)} className="text-zinc-500 hover:text-white mr-2" data-testid={`product-edit-${p.id}`}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-zinc-500 hover:text-red-400" data-testid={`product-delete-${p.id}`}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
