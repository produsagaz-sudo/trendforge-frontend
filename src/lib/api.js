import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          refreshPromise = api.post("/auth/refresh").finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
        }

        await refreshPromise;

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshPromise = null;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const register = (name, email, password) =>
  api.post("/auth/register", { name, email, password });

export const logout = () => api.post("/auth/logout");

export const getMe = () => api.get("/auth/me");

export const refreshToken = () => api.post("/auth/refresh");

export const updateProfile = (data) =>
  api.put("/auth/profile", data);

export const changePassword = (current_password, new_password) =>
  api.put("/auth/change-password", {
    current_password,
    new_password,
  });

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (token, new_password) =>
  api.post("/auth/reset-password", {
    token,
    new_password,
  });

// Products
export const getProducts = (params) =>
  api.get("/products", { params });

export const getProduct = (id) =>
  api.get(`/products/${id}`);

// Cart
export const getCart = () =>
  api.get("/cart");

export const addToCart = (product_id, size, quantity) =>
  api.post("/cart/items", {
    product_id,
    size,
    quantity,
  });

export const updateCartItem = (product_id, data) =>
  api.put(`/cart/items/${product_id}`, data);

export const removeFromCart = (product_id) =>
  api.delete(`/cart/items/${product_id}`);

export const clearCart = () =>
  api.delete("/cart");

// Shipping
export const calculateShipping = (zip_code, items) =>
  api.post("/shipping/calculate", {
    zip_code,
    items,
  });

export const validateCEP = (zip_code) =>
  api.post("/shipping/validate-cep", {
    zip_code,
  });

// Coupons
export const validateCoupon = (code, subtotal) =>
  api.post("/coupons/validate", {
    code,
    subtotal,
  });

// Orders
export const createOrder = (data) =>
  api.post("/orders", data);

export const getOrders = (params) =>
  api.get("/orders", { params });

export const getOrder = (id) =>
  api.get(`/orders/${id}`);

// Addresses
export const getAddresses = () =>
  api.get("/auth/addresses");

export const createAddress = (data) =>
  api.post("/auth/addresses", data);

export const deleteAddress = (id) =>
  api.delete(`/auth/addresses/${id}`);

// Admin
export const getDashboard = () =>
  api.get("/admin/dashboard");

export const adminGetOrders = (params) =>
  api.get("/admin/orders", { params });

export const adminUpdateOrder = (id, data) =>
  api.put(`/admin/orders/${id}`, data);

export const adminGetProducts = (params) =>
  api.get("/admin/products", { params });

export const adminCreateProduct = (data) =>
  api.post("/products", data);

export const adminUpdateProduct = (id, data) =>
  api.put(`/admin/products/${id}`, data);

export const adminDeleteProduct = (id) =>
  api.delete(`/admin/products/${id}`);

export const adminGetCustomers = (params) =>
  api.get("/admin/customers", { params });

export const adminGetCoupons = () =>
  api.get("/coupons");

export const adminCreateCoupon = (data) =>
  api.post("/coupons", data);

export const adminUpdateCoupon = (id, data) =>
  api.put(`/coupons/${id}`, data);

export const adminDeleteCoupon = (id) =>
  api.delete(`/coupons/${id}`);

export const getSettings = () =>
  api.get("/admin/settings");

export const updateSettings = (data) =>
  api.put("/admin/settings", data);

export const getLogs = (params) =>
  api.get("/admin/logs", { params });

export const getSalesReport = (days) =>
  api.get("/admin/reports/sales", {
    params: { days },
  });

export const getCategories = () =>
  api.get("/categories");

export const createCategory = (data) =>
  api.post("/categories", data);

export function formatError(detail) {
  if (detail == null) return "Algo deu errado. Tente novamente.";

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((e) => e?.msg || JSON.stringify(e))
      .filter(Boolean)
      .join(" ");
  }

  if (detail?.msg) return detail.msg;

  return String(detail);
}

export default api;