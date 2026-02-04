import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authApi } from "../lib/api/auth";
import type { User } from "../lib/api/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("curioed_token")
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    authApi
      .me(token)
      .then(setUser)
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("curioed_token");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setToken(res.accessToken);
    localStorage.setItem("curioed_token", res.accessToken);
    setUser(res.user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("curioed_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signIn: login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
