import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatError } from "@/lib/api";

export default function AdminLogin() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || null;
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (redirect) {
        navigate(redirect);
      } else {
        navigate(user.role === "admin" ? "/admin" : "/profile");
      }
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        const data = await register(name, email, password);
        navigate(redirect || "/profile");
      } else {
        const data = await login(email, password);
        // user state will update via context, useEffect handles redirect
      }
    } catch (e) {
      setError(formatError(e.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6" data-testid="admin-login-page">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-3xl font-black tracking-tighter text-white mb-2 text-center">TREND FORGE</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 text-center mb-8">{isRegister ? "Criar Conta" : "Entrar"}</p>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 mb-4 text-sm" data-testid="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:border-[#E60000] outline-none"
              data-testid="login-name-input"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:border-[#E60000] outline-none"
            data-testid="login-email-input"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:border-[#E60000] outline-none"
            data-testid="login-password-input"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E60000] text-white py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-colors disabled:opacity-50"
            data-testid="login-submit-button"
          >
            {loading ? "..." : isRegister ? "Criar Conta" : "Entrar"}
          </button>
        </form>

        <button onClick={() => { setIsRegister(!isRegister); setError(""); }} className="w-full mt-4 text-xs text-zinc-500 hover:text-[#E60000] transition-colors" data-testid="login-toggle-mode">
          {isRegister ? "Ja tem conta? Entrar" : "Nao tem conta? Criar agora"}
        </button>

        {!isRegister && (
          <Link to="/forgot-password" className="block w-full mt-2 text-center text-xs text-zinc-600 hover:text-[#E60000] transition-colors" data-testid="login-forgot-password">
            Esqueceu sua senha?
          </Link>
        )}
      </div>
    </div>
  );
}
