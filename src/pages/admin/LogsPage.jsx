import { useEffect, useState } from "react";
import { getLogs } from "@/lib/api";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLogs({ limit: 100 }).then(r => setLogs(r.data.logs)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-500">Carregando...</div>;

  return (
    <div data-testid="admin-logs">
      <h1 className="text-xl font-bold text-white mb-6">Logs & Auditoria</h1>
      <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase"><th className="text-left p-3">Data</th><th className="text-left p-3">Pedido</th><th className="text-left p-3">Acao</th><th className="text-left p-3">Status</th><th className="text-left p-3">Detalhes</th></tr></thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="p-3 text-zinc-500 text-xs">{l.created_at?.slice(0, 19)}</td>
                <td className="p-3 text-white font-mono text-xs">{l.order_id?.slice(-8)}</td>
                <td className="p-3 text-zinc-400">{l.action}</td>
                <td className="p-3"><span className="text-xs text-zinc-300">{l.status}</span></td>
                <td className="p-3 text-zinc-500 text-xs max-w-xs truncate">{l.details}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-zinc-500">Nenhum log registrado</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
