import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getOrders, getOrder, getAddresses, updateProfile, changePassword, formatError } from "@/lib/api";
import { ArrowLeft, Package, MapPin, User, Mail, Phone, Calendar, ChevronRight, X, Truck, CreditCard, Tag, Sun, Moon, Edit2, Check, Lock } from "lucide-react";

const statusLabels = {
  pending: { label: "Aguardando pagamento", color: "text-yellow-400 bg-yellow-900/20" },
  confirmed: { label: "Pagamento aprovado", color: "text-green-400 bg-green-900/20" },
  processing: { label: "Em separacao", color: "text-blue-400 bg-blue-900/20" },
  production: { label: "Em producao", color: "text-purple-400 bg-purple-900/20" },
  shipped: { label: "Enviado", color: "text-cyan-400 bg-cyan-900/20" },
  out_for_delivery: { label: "Saiu para entrega", color: "text-teal-400 bg-teal-900/20" },
  delivered: { label: "Entregue", color: "text-emerald-400 bg-emerald-900/20" },
  cancelled: { label: "Cancelado", color: "text-red-400 bg-red-900/20" },
  refunded: { label: "Reembolsado", color: "text-orange-400 bg-orange-900/20" },
};

function getStatus(status) {
  return statusLabels[status] || { label: status, color: "text-[var(--text-secondary)] bg-[var(--surface-color)]" };
}

function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(orderId).then(r => setOrder(r.data.order)).catch(() => {}).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"><div className="text-[var(--text-secondary)]">Carregando...</div></div>
  );
  if (!order) return null;

  const st = getStatus(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto pt-8 pb-8 px-4" onClick={onClose}>
      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] w-full max-w-2xl" onClick={e => e.stopPropagation()} data-testid="order-detail-modal">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">Pedido</p>
            <h2 className="font-heading text-lg font-black tracking-tighter text-[var(--text-primary)]">{order.order_number}</h2>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-brand-red" data-testid="order-detail-close"><X size={20} /></button>
        </div>

        <div className="p-6 border-b border-[var(--border-color)]">
          <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1.5 ${st.color}`}>{st.label}</span>
          {order.tracking_code && (
            <p className="text-sm text-[var(--text-secondary)] mt-2"><Truck size={14} className="inline mr-1" /> Rastreio: <span className="text-[var(--text-primary)] font-medium">{order.tracking_code}</span></p>
          )}
        </div>

        <div className="p-6 border-b border-[var(--border-color)]">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-3">Produtos</h3>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-3" data-testid={`order-item-${i}`}>
                {item.image && <img src={item.image} alt="" className="w-14 h-16 object-cover bg-[var(--surface-color)]" />}
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--text-primary)]">{item.product_name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Tamanho: {item.size} {item.sku && `| SKU: ${item.sku}`} | Qtd: {item.quantity}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Unitario: R$ {item.unit_price?.toFixed(2)} | Subtotal: R$ {item.total?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-b border-[var(--border-color)] space-y-2 text-sm">
          <div className="flex justify-between text-[var(--text-secondary)]"><span>Subtotal</span><span>R$ {order.subtotal?.toFixed(2)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-400"><span><Tag size={12} className="inline mr-1" />Desconto {order.coupon_code && `(${order.coupon_code})`}</span><span>-R$ {order.discount?.toFixed(2)}</span></div>}
          <div className="flex justify-between text-[var(--text-secondary)]"><span><Truck size={12} className="inline mr-1" />Frete ({order.shipping_method_name || order.shipping_method})</span><span>R$ {order.shipping_price?.toFixed(2)}</span></div>
          <div className="flex justify-between text-[var(--text-primary)] font-bold text-base pt-2 border-t border-[var(--border-color)]"><span>Total</span><span>R$ {order.total?.toFixed(2)}</span></div>
          <div className="flex justify-between text-[var(--text-secondary)]"><span><CreditCard size={12} className="inline mr-1" />Pagamento</span><span className="uppercase">{order.payment_method}</span></div>
        </div>

        {order.address && (
          <div className="p-6 border-b border-[var(--border-color)]">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2"><MapPin size={12} className="inline mr-1" />Endereco de Entrega</h3>
            <p className="text-sm text-[var(--text-primary)]">{order.address.street}, {order.address.number} {order.address.complement && `- ${order.address.complement}`}</p>
            <p className="text-sm text-[var(--text-secondary)]">{order.address.neighborhood}, {order.address.city}/{order.address.state} - {order.address.zip_code}</p>
          </div>
        )}

        {order.tracking_history?.length > 0 && (
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-3">Historico</h3>
            <div className="space-y-2">
              {order.tracking_history.map((entry, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 bg-brand-red rounded-full mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[var(--text-primary)]">{entry.status} {entry.tracking_code && `— ${entry.tracking_code}`}</p>
                    {entry.notes && <p className="text-xs text-[var(--text-secondary)]">{entry.notes}</p>}
                    <p className="text-xs text-[var(--text-secondary)]">{entry.created_at?.slice(0, 16).replace("T", " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading, logout, checkAuth } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tab, setTab] = useState("orders");

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/profile");
      return;
    }
    if (user) {
      loadData();
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      const [ordersRes, addrRes] = await Promise.all([getOrders({ limit: 50 }), getAddresses()]);
      setOrders(ordersRes.data.orders);
      setAddresses(addrRes.data.addresses);
    } catch {}
    setLoadingData(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setEditMsg("");
    try {
      await updateProfile({ name: editName, phone: editPhone });
      await checkAuth();
      setEditing(false);
      setEditMsg("Dados atualizados!");
      setTimeout(() => setEditMsg(""), 3000);
    } catch (e) {
      setEditMsg(formatError(e.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdMsg("");
    if (!currentPwd || !newPwd) { setPwdMsg("Preencha todos os campos"); return; }
    if (newPwd !== confirmPwd) { setPwdMsg("As senhas nao coincidem"); return; }
    if (newPwd.length < 6) { setPwdMsg("Nova senha deve ter pelo menos 6 caracteres"); return; }
    setPwdSaving(true);
    try {
      await changePassword(currentPwd, newPwd);
      setPwdMsg("Senha alterada com sucesso!");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setShowPasswordForm(false);
      setTimeout(() => setPwdMsg(""), 3000);
    } catch (e) {
      setPwdMsg(formatError(e.response?.data?.detail));
    } finally { setPwdSaving(false); }
  };

  if (authLoading || loadingData) {
    return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center"><div className="text-[var(--text-secondary)]">Carregando...</div></div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-6" data-testid="profile-page">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Top bar with back, theme toggle, logout */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:text-brand-red" data-testid="profile-back">
            <ArrowLeft size={14} /> Voltar
          </Link>
          <div className="flex items-center gap-3">
            <button
              data-testid="profile-theme-toggle"
              onClick={toggleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-brand-red transition-colors"
              aria-label="Alternar tema"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:text-brand-red" data-testid="profile-logout">Sair</button>
          </div>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tighter text-[var(--text-primary)] mb-8">MINHA CONTA</h1>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-[var(--border-color)] mb-8">
          <button
            onClick={() => setTab("orders")}
            className={`pb-3 text-xs font-bold uppercase tracking-[0.15em] border-b-2 transition-colors ${tab === "orders" ? "border-brand-red text-brand-red" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            data-testid="profile-tab-orders"
          >
            <Package size={14} className="inline mr-1" /> Meus Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setTab("profile")}
            className={`pb-3 text-xs font-bold uppercase tracking-[0.15em] border-b-2 transition-colors ${tab === "profile" ? "border-brand-red text-brand-red" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            data-testid="profile-tab-info"
          >
            <User size={14} className="inline mr-1" /> Meus Dados
          </button>
        </div>

        {/* Orders Tab */}
        {tab === "orders" && (
          <div data-testid="profile-orders-list">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <Package size={48} className="mx-auto text-[var(--text-secondary)] mb-4" />
                <p className="text-[var(--text-secondary)] mb-4">Voce ainda nao fez nenhum pedido</p>
                <Link to="/" className="bg-brand-red text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.15em]">Explorar Produtos</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const st = getStatus(order.status);
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order.id)}
                      className="w-full text-left bg-[var(--surface-color)] border border-[var(--border-color)] p-4 hover:border-brand-red/50 transition-colors"
                      data-testid={`profile-order-${order.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">{order.order_number}</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">{order.created_at?.slice(0, 10)} | {order.items?.length || 0} item(s) | {order.payment_method?.toUpperCase()}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 ${st.color}`}>{st.label}</span>
                            <p className="text-sm font-bold text-[var(--text-primary)] mt-1">R$ {order.total?.toFixed(2)}</p>
                          </div>
                          <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === "profile" && (
          <div data-testid="profile-info">
            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-6">
              {/* Header with edit button */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Informacoes Pessoais</h3>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.15em] text-brand-red hover:text-white transition-colors"
                    data-testid="profile-edit-btn"
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                ) : (
                  <button
                    onClick={() => { setEditing(false); setEditName(user.name || ""); setEditPhone(user.phone || ""); setEditMsg(""); }}
                    className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:text-brand-red"
                    data-testid="profile-cancel-edit"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {editMsg && (
                <div className={`text-xs px-3 py-2 mb-4 ${editMsg.includes("atualizado") ? "text-green-400 bg-green-900/10 border border-green-900/20" : "text-red-400 bg-red-900/10 border border-red-900/20"}`} data-testid="profile-edit-msg">{editMsg}</div>
              )}

              {editing ? (
                /* Edit mode */
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Nome</label>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 text-sm focus:border-brand-red outline-none"
                      data-testid="profile-edit-name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Email</label>
                    <p className="text-sm text-[var(--text-secondary)] px-3 py-2">{user.email} <span className="text-xs">(nao editavel)</span></p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Telefone</label>
                    <input
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      placeholder="(21) 99999-0000"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 text-sm focus:border-brand-red outline-none"
                      data-testid="profile-edit-phone"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-brand-red text-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-[#0A0A0A] transition-colors disabled:opacity-50"
                    data-testid="profile-save-btn"
                  >
                    {saving ? "Salvando..." : "Salvar Alteracoes"}
                  </button>
                </div>
              ) : (
                /* View mode */
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-brand-red shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Nome</p>
                      <p className="text-sm font-bold text-[var(--text-primary)]" data-testid="profile-name">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-brand-red shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Email</p>
                      <p className="text-sm text-[var(--text-primary)]" data-testid="profile-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-brand-red shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Telefone</p>
                      <p className="text-sm text-[var(--text-primary)]" data-testid="profile-phone">{user.phone || "Nao informado"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-brand-red shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Membro desde</p>
                      <p className="text-sm text-[var(--text-primary)]" data-testid="profile-since">{user.created_at?.slice(0, 10) || "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Addresses */}
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mt-8 mb-3"><MapPin size={12} className="inline mr-1" />Enderecos Salvos</h3>
            {addresses.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">Nenhum endereco salvo</p>
            ) : (
              <div className="space-y-2">
                {addresses.map(addr => (
                  <div key={addr._id} className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 text-sm" data-testid={`profile-address-${addr._id}`}>
                    <p className="text-[var(--text-primary)]">{addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}</p>
                    <p className="text-[var(--text-secondary)]">{addr.neighborhood}, {addr.city}/{addr.state} - {addr.zip_code}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Change Password */}
            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-3"><Lock size={12} className="inline mr-1" />Seguranca</h3>

              {pwdMsg && (
                <div className={`text-xs px-3 py-2 mb-3 ${pwdMsg.includes("sucesso") ? "text-green-400 bg-green-900/10 border border-green-900/20" : "text-red-400 bg-red-900/10 border border-red-900/20"}`} data-testid="profile-pwd-msg">{pwdMsg}</div>
              )}

              {showPasswordForm ? (
                <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-6 space-y-3">
                  <input type="password" placeholder="Senha atual" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 text-sm focus:border-brand-red outline-none" data-testid="profile-current-password" />
                  <input type="password" placeholder="Nova senha" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 text-sm focus:border-brand-red outline-none" data-testid="profile-new-password" />
                  <input type="password" placeholder="Confirmar nova senha" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 text-sm focus:border-brand-red outline-none" data-testid="profile-confirm-password" />
                  <div className="flex gap-3">
                    <button onClick={handleChangePassword} disabled={pwdSaving} className="bg-brand-red text-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] disabled:opacity-50" data-testid="profile-save-password">{pwdSaving ? "Salvando..." : "Alterar Senha"}</button>
                    <button onClick={() => { setShowPasswordForm(false); setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); setPwdMsg(""); }} className="text-xs text-[var(--text-secondary)] hover:text-brand-red px-4 py-2.5 uppercase font-bold tracking-[0.15em]" data-testid="profile-cancel-password">Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowPasswordForm(true)} className="bg-[var(--surface-color)] border border-[var(--border-color)] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-primary)] hover:border-brand-red transition-colors" data-testid="profile-change-password-btn"><Lock size={12} className="inline mr-2" />Alterar Senha</button>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedOrder && <OrderDetailModal orderId={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}
