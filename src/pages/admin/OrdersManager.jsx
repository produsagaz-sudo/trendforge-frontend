import { useEffect, useState, useCallback } from "react";
import { adminGetOrders, adminUpdateOrder, formatError } from "@/lib/api";
import { Eye, X } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-900/30 text-yellow-400",
  confirmed: "bg-green-900/30 text-green-400",
  processing: "bg-blue-900/30 text-blue-400",
  shipped: "bg-purple-900/30 text-purple-400",
  delivered: "bg-emerald-900/30 text-emerald-400",
  cancelled: "bg-red-900/30 text-red-400",
};

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [updateForm, setUpdateForm] = useState({
    status: "",
    tracking_code: "",
    notes: "",
  });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await adminGetOrders(params);

      setOrders(data.orders);
    } catch (e) {
      console.error("Erro ao carregar pedidos:", e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateOrder = async () => {
    if (!selected) return;

    setError("");

    try {
      const update = {};

      if (updateForm.status) {
        update.status = updateForm.status;
      }

      if (updateForm.tracking_code) {
        update.tracking_code = updateForm.tracking_code;
      }

      if (updateForm.notes) {
        update.notes = updateForm.notes;
      }

      await adminUpdateOrder(selected.id, update);

      setSelected(null);
      await load();
    } catch (e) {
      setError(formatError(e.response?.data?.detail));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Pedidos</h1>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm"
          data-testid="orders-status-filter"
        >
          <option value="">Todos</option>
          <option value="pending">Pendente</option>
          <option value="confirmed">Confirmado</option>
          <option value="processing">Processando</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregue</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {loading ? (
        <div className="text-zinc-500">Carregando...</div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase">
                <th className="text-left p-3">Pedido</th>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Total</th>
                <th className="text-left p-3">Frete</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Data</th>
                <th className="text-right p-3">Acoes</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/50"
                  data-testid={`order-row-${o.id}`}
                >
                  <td className="p-3 text-white font-medium">
                    {o.order_number}
                  </td>

                  <td className="p-3 text-zinc-400">
                    {o.user_name || o.user_email}
                  </td>

                  <td className="p-3 text-white">
                    R$ {o.total?.toFixed(2)}
                  </td>

                  <td className="p-3">
                    {o.shipping_method === "uber_moto" ? (
                      <span className="text-xs px-2 py-0.5 bg-yellow-900/30 text-yellow-400 font-bold uppercase">
                        Uber/Moto
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">
                        {o.shipping_method_name || o.shipping_method}
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-0.5 uppercase ${
                        statusColors[o.status] || "text-zinc-400"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>

                  <td className="p-3 text-zinc-500 text-xs">
                    {o.created_at?.slice(0, 10)}
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelected(o);
                        setError("");
                        setUpdateForm({
                          status: o.status,
                          tracking_code: o.tracking_code || "",
                          notes: "",
                        });
                      }}
                      className="text-zinc-500 hover:text-white"
                      data-testid={`order-view-${o.id}`}
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-zinc-500"
                  >
                    Nenhum pedido encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto pt-10 pb-10">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white uppercase">
                Pedido {selected.order_number}
              </h2>

              <button
                onClick={() => setSelected(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 mb-4 text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-zinc-500">Cliente:</span>{" "}
                <span className="text-white">
                  {selected.user_name}
                </span>
              </div>

              <div>
                <span className="text-zinc-500">Email:</span>{" "}
                <span className="text-white">
                  {selected.user_email}
                </span>
              </div>

              <div>
                <span className="text-zinc-500">Telefone:</span>{" "}
                <span
                  className={
                    selected.user_phone
                      ? "text-white"
                      : "text-zinc-600"
                  }
                >
                  {selected.user_phone || "Nao informado"}
                </span>
              </div>

              <div>
                <span className="text-zinc-500">Total:</span>{" "}
                <span className="text-white">
                  R$ {selected.total?.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-zinc-500">Frete:</span>{" "}
                <span
                  className={
                    selected.shipping_method === "uber_moto"
                      ? "text-yellow-400 font-bold"
                      : "text-white"
                  }
                >
                  {selected.shipping_method_name ||
                    selected.shipping_method}

                  {selected.shipping_method === "uber_moto"
                    ? " (COMBINAR VIA WHATSAPP)"
                    : ` - R$ ${selected.shipping_price?.toFixed(2)}`}
                </span>
              </div>

              <div>
                <span className="text-zinc-500">Pagamento:</span>{" "}
                <span className="text-white uppercase">
                  {selected.payment_method}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase mb-2">
                Itens
              </h3>

              {selected.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between py-1 text-sm border-b border-zinc-800"
                >
                  <span className="text-white">
                    {item.product_name} ({item.size}) x{item.quantity}
                  </span>

                  <span className="text-white">
                    R$ {item.total?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {selected.address && (
              <div className="mb-4 text-sm">
                <h3 className="text-xs font-bold text-zinc-400 uppercase mb-1">
                  Endereco
                </h3>

                <p className="text-zinc-300">
                  {selected.address.street},{" "}
                  {selected.address.number} -{" "}
                  {selected.address.neighborhood},{" "}
                  {selected.address.city}/
                  {selected.address.state} -{" "}
                  {selected.address.zip_code}
                </p>
              </div>
            )}

            <div className="border-t border-zinc-800 pt-4 space-y-3">
              <select
                value={updateForm.status}
                onChange={(e) =>
                  setUpdateForm({
                    ...updateForm,
                    status: e.target.value,
                  })
                }
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm"
                data-testid="order-update-status"
              >
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="processing">Processando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>

              <input
                value={updateForm.tracking_code}
                onChange={(e) =>
                  setUpdateForm({
                    ...updateForm,
                    tracking_code: e.target.value,
                  })
                }
                placeholder="Codigo de rastreio"
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm"
                data-testid="order-tracking-input"
              />

              <textarea
                value={updateForm.notes}
                onChange={(e) =>
                  setUpdateForm({
                    ...updateForm,
                    notes: e.target.value,
                  })
                }
                placeholder="Notas"
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm h-16"
              />

              <button
                onClick={handleUpdateOrder}
                className="w-full bg-[#E60000] text-white py-2 text-xs font-bold uppercase"
                data-testid="order-update-btn"
              >
                Atualizar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}