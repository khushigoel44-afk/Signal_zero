import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi, signup as signupApi, getProfile as getProfileApi, updateProfile as updateProfileApi } from "../services/api";
import { clearToken, getToken, saveToken } from "../services/session";

const AuthContext = createContext(null);

const logAuthError = (phase, error) => {
  const payload = {
    phase,
    message: error?.message,
    name: error?.name,
    code: error?.code,
    isAxiosError: error?.isAxiosError,
    responseStatus: error?.response?.status,
    responseHeaders: error?.response?.headers,
    responseData: error?.response?.data,
    requestUrl: error?.config?.url ? `${error?.config?.baseURL || ""}${error.config.url}` : undefined
  };
  console.error("[auth]", payload);
  console.error("[auth] raw error:", error);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const profile = await getProfileApi();
        setUser(profile);
      } catch (error) {
        await clearToken();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: async (email, password) => {
        try {
          const data = await loginApi({ email, password });
          await saveToken(data.token);
          setUser(data.user);
        } catch (error) {
          logAuthError("login", error);
          throw error;
        }
      },
      signup: async (name, email, password) => {
        try {
          const data = await signupApi({ name, email, password });
          await saveToken(data.token);
          setUser(data.user);
        } catch (error) {
          logAuthError("signup", error);
          throw error;
        }
      },
      logout: async () => {
        await clearToken();
        setUser(null);
      },
      refreshProfile: async () => {
        const profile = await getProfileApi();
        setUser(profile);
      },
      updateProfile: async (payload) => {
        const updated = await updateProfileApi(payload);
        setUser(updated);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
