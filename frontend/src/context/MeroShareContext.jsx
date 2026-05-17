// MeroShareContext.jsx — Auth state + API helpers
import { createContext, useContext, useState, useCallback } from "react";

const Ctx = createContext(null);

const BASE = "/api";

async function apiFetch(path, token, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-meroshare-token": token } : {}),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data;
}

export function MeroShareProvider({ children }) {
  const [token,   setToken]   = useState(() => sessionStorage.getItem("ms_token") || null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const login = useCallback(async ({ clientId, username, password } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/login", null, {
        method: "POST",
        body:   JSON.stringify({ clientId, username, password }),
      });
      sessionStorage.setItem("ms_token", data.token);
      setToken(data.token);

      const prof = await apiFetch("/profile", data.token);
      setProfile(prof);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("ms_token");
    setToken(null);
    setProfile(null);
  }, []);

  const fetchShares    = useCallback(() => apiFetch("/shares",    token), [token]);
  const fetchPortfolio = useCallback(() => apiFetch("/portfolio", token), [token]);
  const fetchIpos      = useCallback(() => apiFetch("/ipos",      token), [token]);
  const fetchWacc      = useCallback(() => apiFetch("/wacc",      token), [token]);

  // Hydrate profile if token exists but profile is null
  const hydrateProfile = useCallback(async () => {
    if (token && !profile) {
      try {
        const prof = await apiFetch("/profile", token);
        setProfile(prof);
      } catch {
        logout();
      }
    }
  }, [token, profile, logout]);

  return (
    <Ctx.Provider value={{
      token, profile, loading, error,
      isLoggedIn: !!token,
      login, logout, hydrateProfile,
      fetchShares, fetchPortfolio, fetchIpos, fetchWacc,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useMeroShare = () => useContext(Ctx);
