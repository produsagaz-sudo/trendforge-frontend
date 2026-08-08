import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword, formatError } from "@/lib/api";
import { CheckCircle, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("As senhas nao coincidem"); return; }
    if (password.length < 6) { setError("Senha deve ter pelo menos 6 caracteres"); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (e) {
      setError(formatError(e.response?.data?.detail));
    } finally { setLoading(false); }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">Link invalido ou expirado.</p>
          <Link to="/forgot-password" className="text-xs text-[#E60000] font-bold uppercase">Solicitar novo link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6" data-testid="reset-password-page">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-3xl font-black tracking-tighter text-white mb-2 text-center">TREND FORGE</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 text-center mb-8">Nova Senha</p>

        {done ? (
          <div className="text-center" data-testid="reset-password-done">
            <CheckCircle size={40} className="mx-auto text-green-400 mb-4" />
            <p className="text-white text-sm mb-2">Senha redefinida!</p>
            <p className="text-zinc-400 text-xs mb-6">Sua senha foi alterada com sucesso.</p>
            <Link to="/login" className="bg-[#E60000] text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.15em]" data-testid="reset-password-go-login">Fazer Login</Link>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 mb-4 text-sm" data-testid="reset-password-error">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:border-[#E60000] outline-none"
                  data-testid="reset-password-input"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:border-[#E60000] outline-none"
                  data-testid="reset-password-confirm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E60000] text-white py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                data-testid="reset-password-submit"
              >
                {loading ? "Salvando..." : "Redefinir Senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
