import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCart, updateCartItem, removeFromCart } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/cart");
      return;
    }
    if (user) fetchCart();
  }, [user, authLoading, navigate]);

  const fetchCart = async () => {
    try {
      const { data } = await getCart();
      setCart(data.cart);
    } catch {
      setCart({ items: [], subtotal_pix: 0, subtotal_card: 0, item_count: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantity = async (productId, newQty) => {
    try {
      const { data } = await updateCartItem(productId, { quantity: newQty });
      setCart(data.cart);
    } catch (e) {
      alert(e.response?.data?.detail || "Erro ao atualizar");
    }
  };

  const handleRemove = async (productId) => {
    const { data } = await removeFromCart(productId);
    setCart(data.cart);
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center"><div className="text-[var(--text-secondary)]">Carregando...</div></div>;
  }

  const isEmpty = !cart?.items?.length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20" data-testid="cart-page">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:text-brand-red mb-8" data-testid="cart-back-link">
          <ArrowLeft size={14} /> Voltar
        </Link>

        <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tighter text-[var(--text-primary)] mb-8">CARRINHO</h1>

        {isEmpty ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-[var(--text-secondary)] mb-4" />
            <p className="text-[var(--text-secondary)] mb-6">Seu carrinho esta vazio</p>
            <Link to="/" className="bg-brand-red text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.15em]" data-testid="cart-continue-shopping">Continuar Comprando</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={`${item.product_id}-${item.size}`} className="flex gap-4 p-4 bg-[var(--surface-color)] border border-[var(--border-color)]" data-testid={`cart-item-${item.product_id}`}>
                  <img src={item.image} alt={item.product_name} className="w-20 h-24 object-cover" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold uppercase text-[var(--text-primary)]">{item.product_name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Tamanho: {item.size}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => handleQuantity(item.product_id, item.quantity - 1)} className="p-1 text-[var(--text-secondary)] hover:text-brand-red" data-testid={`cart-decrease-${item.product_id}`}><Minus size={14} /></button>
                      <span className="text-sm font-bold text-[var(--text-primary)] w-6 text-center">{item.quantity}</span>
                      <button onClick={() => handleQuantity(item.product_id, item.quantity + 1)} className="p-1 text-[var(--text-secondary)] hover:text-brand-red" data-testid={`cart-increase-${item.product_id}`}><Plus size={14} /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--text-primary)]">R$ {item.total_pix.toFixed(2)}</p>
                    <p className="text-xs text-[var(--text-secondary)]">no PIX</p>
                    <button onClick={() => handleRemove(item.product_id)} className="mt-3 text-[var(--text-secondary)] hover:text-brand-red" data-testid={`cart-remove-${item.product_id}`}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-6 h-fit">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>{cart.item_count} item(s)</span>
                </div>
                <div className="flex justify-between text-[var(--text-primary)] font-bold">
                  <span>PIX</span>
                  <span>R$ {cart.subtotal_pix.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Cartao</span>
                  <span>R$ {cart.subtotal_card.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-[var(--border-color)] mt-4 pt-4">
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-brand-red text-white py-4 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-[#0A0A0A] transition-colors"
                  data-testid="cart-checkout-button"
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
