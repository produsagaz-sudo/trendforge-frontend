import { useEffect, useState } from "react";
import { getSettings, updateSettings, formatError } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getSettings().then(r => setSettings(r.data.settings || {})).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setMsg("");
    try {
      await updateSettings(settings);
      setMsg("Configuracoes salvas!");
    } catch (e) { setMsg(formatError(e.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-zinc-500">Carregando...</div>;

  return (
    <div data-testid="admin-settings">
      <h1 className="text-xl font-bold text-white mb-6">Configuracoes da Loja</h1>

      <div className="bg-zinc-900 border border-zinc-800 p-6 max-w-2xl space-y-4">
        <div>
          <label className="text-xs text-zinc-500 uppercase mb-1 block">Nome da Loja</label>
          <input value={settings.store_name || ""} onChange={e => setSettings({ ...settings, store_name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" data-testid="settings-store-name" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase mb-1 block">Email</label>
          <input value={settings.store_email || ""} onChange={e => setSettings({ ...settings, store_email: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase mb-1 block">Telefone</label>
          <input value={settings.store_phone || ""} onChange={e => setSettings({ ...settings, store_phone: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase mb-1 block">CEP Origem (Frete)</label>
          <input value={settings.shipping_origin_zip || ""} onChange={e => setSettings({ ...settings, shipping_origin_zip: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm" data-testid="settings-origin-zip" />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" checked={settings.local_delivery_enabled || false} onChange={e => setSettings({ ...settings, local_delivery_enabled: e.target.checked })} />
            Entrega Local (Moto/Flash) Habilitada
          </label>
        </div>

        {msg && <p className={`text-sm ${msg.includes("salv") ? "text-green-400" : "text-red-400"}`}>{msg}</p>}

        <button onClick={handleSave} disabled={saving} className="bg-[#E60000] text-white px-6 py-2 text-xs font-bold uppercase disabled:opacity-50" data-testid="settings-save">{saving ? "Salvando..." : "Salvar"}</button>
      </div>
    </div>
  );
}
