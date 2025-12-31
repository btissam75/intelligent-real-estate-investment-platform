import React, { createContext, useContext, useEffect, useState } from "react";

type User = { id: string; email: string; full_name?: string };
type AuthCtx = {
  user: User | null;
  token: string | null;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  signout: () => void;
};

const AuthContext = createContext<AuthCtx>({} as any);
const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [user, setUser] = useState<User | null>(null);

  // au chargement: si token, fetch /auth/me
  useEffect(() => {
    if (!token) return setUser(null);
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(u => setUser(u || null))
      .catch(() => setUser(null));
  }, [token]);

  async function signin(email: string, password: string) {
    const r = await fetch(`${API}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error("Email ou mot de passe incorrect");
    const { token } = await r.json();
    localStorage.setItem("auth_token", token);
    setToken(token);
  }

  async function signup(email: string, password: string, fullName?: string) {
    const r = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (!r.ok) throw new Error("Impossible de créer le compte");
    // Option 1: auto-login après signup
    await signin(email, password);
  }

  function signout() {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, signin, signup, signout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() { return useContext(AuthContext); }
