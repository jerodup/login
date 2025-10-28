import { createContext, useState, useContext, useEffect } from "react";
import client, { setAccessToken, clearAccessToken } from "../api/axios";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [errs, setErrs] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Intentar renovar el token usando el refresh token
        const res = await client.get("/auth/refresh");
        if (res.data.user && res.data.accessToken) {
          setAccessToken(res.data.accessToken);
          setUser(res.data.user);
          setIsAuth(true);
        }
      } catch (error) {
        console.log("No hay sesión activa");
        // No hay sesión activa, limpiar estado
        clearAccessToken();
        setUser(null);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login
  const signin = async (data) => {
    try {
      const res = await client.post("/auth/signin", data);
      console.log("Respuesta del login:", res.data); // Para debug
      
      if (res.data.user && res.data.accessToken) {
        setAccessToken(res.data.accessToken); // Establecer el token globalmente
        setUser({ ...res.data.user, accessToken: res.data.accessToken });
        setIsAuth(true);
        setErrs(null);
        return res.data;
      } else {
        throw new Error("Respuesta del servidor incompleta");
      }
    } catch (error) {
      console.error("Error en signin:", error);
      if (error.response?.data) {
        const messages = Array.isArray(error.response.data)
          ? error.response.data
          : [error.response.data.message];
        setErrs(messages);
      } else {
        setErrs(["Error de red o servidor"]);
      }
      setIsAuth(false);
      setUser(null);
      return null;
    }
  };

  // Logout
  const signout = async () => {
    try {
      await client.post("/auth/logout"); // si quieres invalidar refresh token en backend
    } catch (err) {}
    clearAccessToken(); // Limpiar el token globalmente
    setUser(null);
    setIsAuth(false);
    setErrs(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        errs,
        loading,
        signin,
        signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
