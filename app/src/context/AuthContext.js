import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Api } from "../services/api.js";

export const AuthContext = createContext({
  token: null,
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem("auth_token");
        if (t) {
          setToken(t);
          // try validating token
          const res = await Api.validateToken(t).catch(() => null);
          if (res?.valid) setUser({ username: res.username });
          else {
            await AsyncStorage.removeItem("auth_token");
            setToken(null);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(username, password) {
    const res = await Api.authLogin({ username, password });
    if (res?.token) {
      await AsyncStorage.setItem("auth_token", res.token);
      setToken(res.token);
      setUser({ username });
      return true;
    }
    return false;
  }

  async function logout() {
    await AsyncStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
