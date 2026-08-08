import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrder } from "@/lib/api";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);
  const orderId = params.get("id");

  useEffect(() => {
    if (orderId) getOrder(orderId).then(r => setOrder(r.data.order)).catch(() => {});
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6" data-testid="order-success-page">
      <div className="text-center max-w-md">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
        <h1 className="font-heading text-3xl font-black tracking-tighter text-[var(--text-primary)] mb-4">PEDIDO CONFIRMADO</h1>
        {order && <p className="text-sm text-[var(--text-secondary)] mb-2">Pedido #{order.order_number}</p>}
        <p className="text-[var(--text-secondary)] mb-8">Seu pagamento foi confirmado. Voce recebera atualizacoes sobre o envio.</p>
        <Link to="/" className="bg-brand-red text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.15em]" data-testid="order-success-continue">Voltar a Loja</Link>
      </div>
    </div>
  );
}
