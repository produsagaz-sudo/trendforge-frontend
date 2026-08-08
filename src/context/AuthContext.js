import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe, login as loginApi, register as registerApi, logout as logoutApi, formatError } from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await getMe();
      setUser(data.user);
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await loginApi(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await registerApi(name, email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await logoutApi();
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
