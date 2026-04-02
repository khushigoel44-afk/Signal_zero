import axios from "axios";
import Constants from "expo-constants";
import { DEV_MACHINE_LAN_API_BASE } from "../constants/apiBaseUrl";
import { getToken } from "./session";

const configuredUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL || Constants?.expoConfig?.extra?.apiBaseUrl;

const baseUrl = configuredUrl || DEV_MACHINE_LAN_API_BASE;

if (__DEV__) {
  console.log("[api] EXPO_PUBLIC_API_BASE_URL:", process.env.EXPO_PUBLIC_API_BASE_URL || "(not set)");
  console.log("[api] resolved axios baseURL:", baseUrl);
}

const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchRoutes = async () => (await api.get("/api/routes")).data;
export const fetchRouteById = async (id) => (await api.get(`/api/routes/${id}`)).data;
export const postTrack = async (payload) => (await api.post("/api/track", payload)).data;
export const fetchHistory = async (deviceId) => (await api.get(`/api/track/${deviceId}/history`)).data;
export const fetchStatus = async (deviceId) => (await api.get(`/api/track/${deviceId}/status`)).data;
export const syncLogs = async (payload) => (await api.post("/api/sync", payload)).data;
export const syncStatus = async (deviceId) => (await api.get(`/api/sync/status/${deviceId}`)).data;
export const predictETA = async (payload) => (await api.post("/api/predict", payload)).data;
export const signup = async (payload) => (await api.post("/api/auth/signup", payload)).data;
export const login = async (payload) => (await api.post("/api/auth/login", payload)).data;
export const getProfile = async () => (await api.get("/api/auth/me")).data;
export const updateProfile = async (payload) => (await api.put("/api/auth/me", payload)).data;

export default api;
