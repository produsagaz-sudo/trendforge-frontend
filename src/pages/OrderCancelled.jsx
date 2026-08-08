import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function OrderCancelled() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6" data-testid="order-cancelled-page">
      <div className="text-center max-w-md">
        <XCircle size={64} className="mx-auto text-red-500 mb-6" />
        <h1 className="font-heading text-3xl font-black tracking-tighter text-[var(--text-primary)] mb-4">PEDIDO CANCELADO</h1>
        <p className="text-[var(--text-secondary)] mb-8">Seu pedido foi cancelado. Nenhuma cobranca foi realizada.</p>
        <Link to="/" className="bg-brand-red text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.15em]" data-testid="order-cancelled-continue">Voltar a Loja</Link>
      </div>
    </div>
  );
}
