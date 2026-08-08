import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword, formatError } from "@/lib/api";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e) {
      setError(formatError(e.response?.data?.detail));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6" data-testid="forgot-password-page">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-3xl font-black tracking-tighter text-white mb-2 text-center">TREND FORGE</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 text-center mb-8">Recuperar Senha</p>

        {sent ? (
          <div className="text-center" data-testid="forgot-password-sent">
            <Mail size={40} className="mx-auto text-[#E60000] mb-4" />
            <p className="text-white text-sm mb-2">Email enviado!</p>
            <p className="text-zinc-400 text-xs mb-6">Se o email <strong>{email}</strong> estiver cadastrado, voce recebera um link para redefinir sua senha.</p>
            <Link to="/login" className="text-xs text-[#E60000] font-bold uppercase tracking-[0.15em]" data-testid="forgot-password-back-login">Voltar ao Login</Link>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 mb-4 text-sm" data-testid="forgot-password-error">{error}</div>}

            <p className="text-zinc-400 text-sm mb-6 text-center">Informe seu email e enviaremos um link para redefinir sua senha.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:border-[#E60000] outline-none"
                data-testid="forgot-password-email"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E60000] text-white py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                data-testid="forgot-password-submit"
              >
                {loading ? "Enviando..." : "Enviar Link de Recuperacao"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-xs text-zinc-500 hover:text-[#E60000]" data-testid="forgot-password-back">
                <ArrowLeft size={12} className="inline mr-1" /> Voltar ao Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
