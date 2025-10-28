import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND || "http://localhost:3000/api";

// Cliente principal con interceptores
const client = axios.create({
  baseURL,
  withCredentials: true,
});

// Cliente independiente para refresh token
const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Token temporal - declarado globalmente para acceso desde AuthContext
export let accessToken = null;

// Función para establecer el token
export const setAccessToken = (token) => {
  accessToken = token;
};

// Función para limpiar el token
export const clearAccessToken = () => {
  accessToken = null;
};

// Función para renovar token (sin bucle)
async function refreshAccessToken() {
  try {
    const res = await refreshClient.get("/auth/refresh");
    accessToken = res.data.accessToken;
    return accessToken;
  } catch (err) {
    console.error("❌ Error al renovar token:", err);
    accessToken = null;
    return null;
  }
}

// Interceptor de request principal
client.interceptors.request.use(async (config) => {
  if (!accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) accessToken = newToken;
  }
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Interceptor de response principal
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
