import axios from "axios";
import { useUserStore } from "../stores/useUserStore";

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export const api = axios.create({
  baseURL: apiBaseUrl || undefined,
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const userId = useUserStore.getState().userId;

  if (userId) {
    config.headers.set("X-User-Id", userId);
  }

  return config;
});
