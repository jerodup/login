import { verifyToken } from "../libs/jwrt.js";

// Middleware para validar JWT tokens
export const authRequired = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Token de acceso requerido." });
    }

    const decoded = await verifyToken(token);
    req.user = decoded; // Agregar información del usuario al request
    next();
  } catch (error) {
    console.error("❌ Error en authRequired:", error);
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};

// Middleware para validar esquemas (ya existía)
export const validateSchema = (schema) => async (req, res, next) => {
  try {
    await schema.parse(req.body);
    next();
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: error.errors[0].message });
  }
};