import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrder } from "@/lib/api";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export default function OrderPending() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [checking, setChecking] = useState(true);
  const orderId = params.get("id");

  useEffect(() => {
    if (!orderId) { setChecking(false); return; }

    const checkStatus = async () => {
      try {
        const { data } = await getOrder(orderId);
        setOrder(data.order);
        // Redirect based on real status from backend
        if (data.order.payment_status === "confirmed" || data.order.status === "confirmed") {
          navigate(`/order/success?id=${orderId}`, { replace: true });
        } else if (data.order.status === "cancelled") {
          navigate(`/order/cancelled?id=${orderId}`, { replace: true });
        }
      } catch {}
      setChecking(false);
    };

    checkStatus();
    // Poll every 5 seconds to check for payment confirmation
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [orderId, navigate]);

  if (checking && !order) {
    return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center"><div className="text-[var(--text-secondary)]">Verificando pagamento...</div></div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6" data-testid="order-pending-page">
      <div className="text-center max-w-md">
        <Clock size={64} className="mx-auto text-yellow-500 mb-6" />
        <h1 className="font-heading text-3xl font-black tracking-tighter text-[var(--text-primary)] mb-4">AGUARDANDO PAGAMENTO</h1>
        {order && (
          <>
            <p className="text-sm text-[var(--text-secondary)] mb-2">Pedido #{order.order_number}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-2">R$ {order.total?.toFixed(2)}</p>
            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 my-6 text-left">
              <p className="text-xs font-bold uppercase text-brand-red mb-2">Pagamento em processamento</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {order.checkout_url
                  ? "Voce sera redirecionado para o checkout InfinitePay. Caso a pagina nao tenha aberto, clique no botao abaixo."
                  : "Seu pedido esta aguardando a confirmacao do pagamento. Esta pagina atualiza automaticamente."
                }
              </p>
              {order.checkout_url && (
                <a
                  href={order.checkout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 bg-brand-red text-white px-6 py-2 text-xs font-bold uppercase tracking-[0.15em]"
                  data-testid="order-checkout-link"
                >
                  Ir para Pagamento
                </a>
              )}
            </div>
          </>
        )}
        <p className="text-xs text-[var(--text-secondary)] mb-8 animate-pulse">Verificando pagamento automaticamente...</p>
        <Link to="/" className="bg-brand-red text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.15em]" data-testid="order-pending-continue">Voltar a Loja</Link>
      </div>
    </div>
  );
}
