import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getCart,
  getAddresses,
  createAddress,
  calculateShipping,
  validateCoupon,
  createOrder,
  validateCEP,
  formatError,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  Tag,
} from "lucide-react";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [cartRes, addrRes] = await Promise.all([
        getCart(),
        getAddresses(),
      ]);

      setCart(cartRes.data.cart);
      setAddresses(addrRes.data.addresses);

      if (addrRes.data.addresses.length > 0) {
        setSelectedAddress(addrRes.data.addresses[0]);
      }
    } catch (e) {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/checkout");
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, navigate, loadData]);

  const handleSaveAddress = async () => {
    try {
      const { data } = await createAddress({
        ...newAddress,
        is_default: true,
      });

      setAddresses([...addresses, data.address]);
      setSelectedAddress(data.address);
      setShowAddressForm(false);

      setNewAddress({
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zip_code: "",
      });
    } catch (e) {
      setError(formatError(e.response?.data?.detail));
    }
  };

  const handleCepLookup = async (cep) => {
    setNewAddress({
      ...newAddress,
      zip_code: cep,
    });

    const clean = cep.replace(/\D/g, "");

    if (clean.length === 8) {
      try {
        const { data } = await validateCEP(clean);

        if (data.valid && data.street) {
          setNewAddress((prev) => ({
            ...prev,
            zip_code: cep,
            street: data.street || prev.street,
            neighborhood: data.neighborhood || prev.neighborhood,
            city: data.city || prev.city,
            state: data.state || prev.state,
          }));
        }
      } catch {}
    }
  };

  const handleCalcShipping = async () => {
    if (!selectedAddress) return;

    try {
      const items = cart.items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      }));

      const { data } = await calculateShipping(
        selectedAddress.zip_code,
        items
      );

      setShippingOptions(data.shipping_options);

      if (data.shipping_options.length > 0) {
        setSelectedShipping(data.shipping_options[0]);
      }

      setStep(2);
    } catch (e) {
      setError("Erro ao calcular frete");
    }
  };

  const handleApplyCoupon = async () => {
    try {
      const subtotal =
        paymentMethod === "pix"
          ? cart.subtotal_pix
          : cart.subtotal_card;

      const { data } = await validateCoupon(couponCode, subtotal);

      setCouponDiscount(data.calculated_discount);
      setCouponApplied(true);
      setError("");
    } catch (e) {
      setError(formatError(e.response?.data?.detail));
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddress || !selectedShipping) return;

    setSubmitting(true);
    setError("");

    try {
      const orderData = {
        address_id: selectedAddress._id,
        shipping_method: selectedShipping.service_code,
        payment_method: paymentMethod,
        coupon_code: couponApplied ? couponCode : null,
        items: cart.items.map((i) => ({
          product_id: i.product_id,
          size: i.size,
          quantity: i.quantity,
        })),
      };

      const { data } = await createOrder(orderData);

      const checkoutUrl =
        data.data?.checkoutUrl || data.payment?.checkout_url;

      const orderId =
        data.data?.orderId || data.order?.id;

      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank");
        navigate(`/order/pending?id=${orderId}`);
      } else {
        navigate(`/order/pending?id=${orderId}`);
      }
    } catch (e) {
      setError(formatError(e.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-primary)]">
        Carregando...
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          Carrinho vazio
        </h1>

        <Link
          to="/"
          className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-3 text-xs font-bold uppercase"
        >
          Voltar a Loja
        </Link>
      </div>
    );
  }

  const subtotal =
    paymentMethod === "pix"
      ? cart.subtotal_pix
      : cart.subtotal_card;

  const shippingCost = selectedShipping?.price || 0;
  const total = subtotal - couponDiscount + shippingCost;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8"
        >
          <ArrowLeft size={14} />
          Voltar ao Carrinho
        </Link>

        <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tighter text-[var(--text-primary)] mb-8">
          CHECKOUT
        </h1>

        {error && (
          <div
            className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 mb-6 text-sm"
            data-testid="checkout-error"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          <div className="lg:col-span-2 space-y-8">

            {/* Step 1: Address */}
            <div
              className="bg-[var(--surface-color)] border border-[var(--border-color)] p-6"
              data-testid="checkout-address-section"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-brand-red" />

                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  1. Endereco de Entrega
                </h2>
              </div>

              {addresses.length > 0 && !showAddressForm && (
                <div className="space-y-2">

                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 p-3 cursor-pointer border ${
                        selectedAddress?._id === addr._id
                          ? "border-brand-red"
                          : "border-[var(--border-color)]"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={selectedAddress?._id === addr._id}
                        onChange={() => setSelectedAddress(addr)}
                        className="mt-1"
                      />

                      <div className="text-sm text-[var(--text-primary)]">
                        {addr.street}, {addr.number}{" "}
                        {addr.complement &&
                          `- ${addr.complement}`}
                        <br />

                        <span className="text-[var(--text-secondary)]">
                          {addr.neighborhood}, {addr.city}/
                          {addr.state} - {addr.zip_code}
                        </span>
                      </div>
                    </label>
                  ))}

                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs text-brand-red font-bold uppercase mt-2"
                  >
                    + Novo Endereco
                  </button>
                </div>
              )}

              {(showAddressForm || addresses.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">

                  <input
                    placeholder="CEP"
                    value={newAddress.zip_code}
                    onChange={(e) =>
                      handleCepLookup(e.target.value)
                    }
                    className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 text-sm"
                    data-testid="checkout-address-zip_code"
                  />

                  {[
                    "street",
                    "number",
                    "complement",
                    "neighborhood",
                    "city",
                    "state",
                  ].map((field) => (
                    <input
                      key={field}
                      placeholder={
                        field === "street"
                          ? "Rua"
                          : field === "number"
                          ? "Numero"
                          : field === "complement"
                          ? "Complemento"
                          : field === "neighborhood"
                          ? "Bairro"
                          : field === "city"
                          ? "Cidade"
                          : "Estado"
                      }
                      value={newAddress[field]}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          [field]: e.target.value,
                        })
                      }
                      className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 text-sm"
                      data-testid={`checkout-address-${field}`}
                    />
                  ))}

                  <button
                    onClick={handleSaveAddress}
                    className="sm:col-span-2 bg-brand-red text-white py-2 text-xs font-bold uppercase tracking-[0.15em]"
                    data-testid="checkout-save-address"
                  >
                    Salvar Endereco
                  </button>
                </div>
              )}

              {selectedAddress && step < 2 && (
                <button
                  onClick={handleCalcShipping}
                  className="mt-4 bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-2 text-xs font-bold uppercase tracking-[0.15em]"
                  data-testid="checkout-calc-shipping"
                >
                  Calcular Frete
                </button>
              )}
            </div>

            {/* Step 2: Shipping */}
            {step >= 2 && (
              <div
                className="bg-[var(--surface-color)] border border-[var(--border-color)] p-6"
                data-testid="checkout-shipping-section"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Truck size={16} className="text-brand-red" />

                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    2. Frete
                  </h2>
                </div>

                <div className="space-y-2">

                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.service_code}
                      className={`flex items-center justify-between p-3 cursor-pointer border ${
                        selectedShipping?.service_code ===
                        opt.service_code
                          ? "border-brand-red"
                          : "border-[var(--border-color)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">

                        <input
                          type="radio"
                          checked={
                            selectedShipping?.service_code ===
                            opt.service_code
                          }
                          onChange={() =>
                            setSelectedShipping(opt)
                          }
                        />

                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">
                            {opt.service_name}
                          </p>

                          <p className="text-xs text-[var(--text-secondary)]">
                            {opt.service_code === "uber_moto"
                              ? "Combinaremos a entrega pelo WhatsApp"
                              : opt.description}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {opt.service_code === "uber_moto"
                          ? "A combinar"
                          : `R$ ${opt.price.toFixed(2)}`}
                      </span>
                    </label>
                  ))}
                </div>

                {selectedShipping && step < 3 && (
                  <button
                    onClick={() => setStep(3)}
                    className="mt-4 bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-2 text-xs font-bold uppercase tracking-[0.15em]"
                    data-testid="checkout-continue-payment"
                  >
                    Continuar
                  </button>
                )}
              </div>
            )}

            {/* Step 3: Payment */}
            {step >= 3 && (
              <div
                className="bg-[var(--surface-color)] border border-[var(--border-color)] p-6"
                data-testid="checkout-payment-section"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard
                    size={16}
                    className="text-brand-red"
                  />

                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    3. Pagamento
                  </h2>
                </div>

                <div className="space-y-2">

                  <label
                    className={`flex items-center justify-between p-3 cursor-pointer border ${
                      paymentMethod === "pix"
                        ? "border-brand-red"
                        : "border-[var(--border-color)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">

                      <input
                        type="radio"
                        checked={paymentMethod === "pix"}
                        onChange={() =>
                          setPaymentMethod("pix")
                        }
                      />

                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          PIX
                        </p>

                        
                      </div>
                    </div>

                    <span className="text-sm font-bold text-green-500">
                      R$ {cart.subtotal_pix.toFixed(2)}
                    </span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 cursor-pointer border ${
                      paymentMethod === "card"
                        ? "border-brand-red"
                        : "border-[var(--border-color)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">

                      <input
                        type="radio"
                        checked={paymentMethod === "card"}
                        onChange={() =>
                          setPaymentMethod("card")
                        }
                      />

                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          Cartao de Credito
                        </p>

                        
                      </div>
                    </div>

                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      R$ {cart.subtotal_card.toFixed(2)}
                    </span>
                  </label>
                </div>

                {/* Coupon */}
                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">

                  <div className="flex items-center gap-2 mb-2">
                    <Tag
                      size={14}
                      className="text-brand-red"
                    />

                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Cupom de Desconto
                    </span>
                  </div>

                  <div className="flex gap-2">

                    <input
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Codigo do cupom"
                      className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 text-sm uppercase"
                      data-testid="checkout-coupon-input"
                    />

                    <button
                      onClick={handleApplyCoupon}
                      className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-2 text-xs font-bold uppercase"
                      data-testid="checkout-apply-coupon"
                    >
                      Aplicar
                    </button>
                  </div>

                  {couponApplied && (
                    <p className="text-xs text-green-500 mt-1">
                      Cupom aplicado! -R${" "}
                      {couponDiscount.toFixed(2)}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setStep(4)}
                  className="mt-4 bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-2 text-xs font-bold uppercase tracking-[0.15em]"
                  data-testid="checkout-review-btn"
                >
                  Revisar Pedido
                </button>
              </div>
            )}
          </div>

          {/* Sidebar summary */}
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-6 h-fit sticky top-24">

            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Resumo do Pedido
            </h3>

            <div className="space-y-3 mb-4">

              {cart.items.map((item) => (
                <div
                  key={`${item.product_id}-${item.size}`}
                  className="flex gap-3 text-sm"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="w-12 h-14 object-cover"
                  />

                  <div className="flex-1">

                    <p className="text-[var(--text-primary)] font-medium text-xs">
                      {item.product_name}
                    </p>

                    <p className="text-[var(--text-secondary)] text-xs">
                      {item.size} x{item.quantity}
                    </p>
                  </div>

                  <span className="text-[var(--text-primary)] text-xs font-bold">
                    R${" "}
                    {(
                      paymentMethod === "pix"
                        ? item.total_pix
                        : item.total_card
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border-color)] pt-4 space-y-2 text-sm">

              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Desconto</span>
                  <span>
                    -R$ {couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Frete</span>

                <span>
                  {selectedShipping?.service_code === "uber_moto"
                    ? "A combinar"
                    : shippingCost > 0
                    ? `R$ ${shippingCost.toFixed(2)}`
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between text-[var(--text-primary)] font-bold text-base pt-2 border-t border-[var(--border-color)]">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {step >= 4 && (
              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="w-full mt-6 bg-brand-red text-white py-4 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-[#0A0A0A] transition-colors disabled:opacity-50"
                data-testid="checkout-submit-order"
              >
                {submitting
                  ? "Processando..."
                  : "Finalizar Pedido"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}