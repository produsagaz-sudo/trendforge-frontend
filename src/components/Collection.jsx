import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, addToCart, formatError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { X, ShoppingBag, Check } from "lucide-react";

function QuickBuyModal({ product, onClose, onAdded }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const sizes = product.variations || [];

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login?redirect=/");
      onClose();
      return;
    }
    if (!selectedSize) { setError("Selecione um tamanho"); return; }
    setLoading(true);
    setError("");
    try {
      await addToCart(product.id || product._id, selectedSize, 1);
      setAdded(true);
      if (onAdded) onAdded();
      setTimeout(() => onClose(), 1200);
    } catch (e) {
      setError(formatError(e.response?.data?.detail));
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[var(--bg-primary)] border border-[var(--border-color)] w-full max-w-md p-0 overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        data-testid="quick-buy-modal"
      >
        {/* Product image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={product.images?.[0]?.url || product.image} alt={product.name} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/50 text-white p-2 hover:bg-black/80 transition-colors" data-testid="quick-buy-close">
            <X size={16} />
          </button>
          {added && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <Check size={40} className="mx-auto text-green-400 mb-2" />
                <p className="text-white text-sm font-bold uppercase tracking-wider">Adicionado ao Carrinho!</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="font-heading text-lg font-black tracking-tighter text-[var(--text-primary)] uppercase">{product.name}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-bold text-green-500">R$ {product.price_pix?.toFixed(2)} <span className="text-xs text-[var(--text-secondary)] font-normal">no PIX</span></span>
            <span className="text-sm text-[var(--text-secondary)]">R$ {product.price_card?.toFixed(2)}</span>
          </div>

          {/* Size selection */}
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Tamanho</p>
            <div className="flex gap-2">
              {sizes.map((v) => (
                <button
                  key={v.size}
                  onClick={() => { setSelectedSize(v.size); setError(""); }}
                  disabled={v.stock <= 0}
                  data-testid={`size-select-${v.size}`}
                  className={`px-4 py-2 text-xs font-bold uppercase border transition-colors ${
                    selectedSize === v.size
                      ? "border-brand-red bg-brand-red text-white"
                      : v.stock <= 0
                        ? "border-[var(--border-color)] text-[var(--text-secondary)] opacity-40 cursor-not-allowed line-through"
                        : "border-[var(--border-color)] text-[var(--text-primary)] hover:border-brand-red"
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400 mt-2" data-testid="quick-buy-error">{error}</p>}

          <button
            onClick={handleAddToCart}
            disabled={loading || added}
            className="w-full mt-4 bg-brand-red text-white py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-[#0A0A0A] transition-colors disabled:opacity-50"
            data-testid="quick-buy-add-to-cart"
          >
            {added ? "Adicionado!" : loading ? "..." : user ? "Adicionar ao Carrinho" : "Entrar para Comprar"}
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="w-full mt-2 text-xs text-[var(--text-secondary)] hover:text-brand-red transition-colors uppercase tracking-wider font-bold py-2"
            data-testid="quick-buy-go-to-cart"
          >
            Ver Carrinho
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProductCard({ product, index, onQuickBuy }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState(false);

  const primaryImage = product.images?.[0]?.url || "";
  const secondaryImage = product.images?.[1]?.url || primaryImage;

  return (
    <motion.div
      ref={ref}
      data-testid={`product-card-${product.id || product._id}`}
      className="group"
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className="block cursor-pointer"
        onClick={() => onQuickBuy(product)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >

        {/* IMAGEM */}
        <div className="relative overflow-hidden">
          <img
            src={hovered ? secondaryImage : primaryImage}
            alt={product.name}
            className="w-full aspect-[3/4] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* TAG */}
          {product.tags?.[0] && (
            <div className="absolute top-3 left-3 bg-brand-red text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]">
              {product.tags[0]}
            </div>
          )}

          {/* COMPRAR */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white text-black text-center py-3 text-xs font-bold uppercase tracking-[0.15em]">
              Comprar
            </div>
          </div>
        </div>

        {/* NOME */}
        <div className="mt-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] h-5 overflow-hidden">
  {product.name}
</h3>

          {/* PAGAMENTOS */}
          <div className="mt-2 space-y-1.5 min-h-[54px]">

            {/* PIX */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/pix.svg"
                  alt="PIX"
                  className="w-5 h-5 object-contain"
                />

                <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  PIX
                </span>
              </div>

              <span className="text-sm font-bold text-[var(--text-primary)]">
                R$ {product.price_pix?.toFixed(2).replace(".", ",")}
              </span>
            </div>

            {/* CARTÃO */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/cartao.svg"
                  alt="Cartão"
                  className="w-5 h-5 object-contain"
                />

                <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  CARTÃO
                </span>
              </div>

              <span className="text-sm font-bold text-[var(--text-primary)]">
                R$ {product.price_card?.toFixed(2).replace(".", ",")}
              </span>
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
}
export default function Collection({ onCartUpdate }) {
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: "-80px" });
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    getProducts({ limit: 8 })
      .then((r) => setProducts(r.data.products))
      .catch(() => {});
  }, []);

  return (
    <section
      id="collection"
      data-testid="collection-section"
      className="py-24 lg:py-40 px-6 md:px-12 lg:px-24"
    >
      <motion.div
        ref={headRef}
        className="mb-16"
        initial={{ opacity: 0, y: 40 }}
        animate={headInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red mb-3">
          Season 01
        </p>
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[var(--text-primary)] leading-tight">
          THE DROP
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {products.map((product, i) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            index={i}
            onQuickBuy={setSelectedProduct}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <QuickBuyModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAdded={onCartUpdate}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
