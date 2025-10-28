import { pool } from "../db.js";
import bcrypt from "bcrypt";
import { createAccessToken, verifyToken, createRefreshToken, verifyRefreshToken } from "../libs/jwrt.js";
import { verificationEmail } from "../config/mail.config.js";
import jwt from "jsonwebtoken";


//ruta para registrar usuarios
export const signUp = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validación básica (despues hacerla con zod como midleware)
    if (!username || !password || !email) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailLowerCase = email.toLowerCase();

    // Crear usuario
    const result = await pool.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *",
      [username, hashedPassword, emailLowerCase]
    );

    const user = result.rows[0];

    // Crear token de verificación
    const token = await createAccessToken({ userId: user.id, email: user.email });

    // Enviar email
    const mailResponse = await verificationEmail(user.email, token);
    console.log("📧 Mail enviado:", mailResponse);

    return res.status(201).json({
      message: "Usuario creado. Revisá tu correo para verificar tu cuenta.",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("❌ Error en signUp:", error);

    if (error.code === "23505") {
      return res.status(409).json({ message: "El usuario o correo ya existe." });
    }

    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

//ruta para verificar el email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params; // <- lo recibimos desde la URL /verify/:token

    const decoded = await verifyToken(token);
    //console.log(decoded);
    if (!decoded) {
      return res.status(400).json({ message: "Token inválido." });
    }
    const userId = decoded.userId;

    await pool.query("UPDATE users SET verified = true WHERE id = $1", [userId]);

    return res.redirect("http://localhost:5173");

  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Token inválido o expirado." });
  }
};

//ruta para iniciar sesion
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica (despues hacerla con zod como midleware)
    if (!email || !password) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);  

    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    if (!user.rows[0].verified) {
      return res.status(403).json({ message: "Por favor, verifica tu correo antes de iniciar sesión." });      
    }  

    const accessToken = await createAccessToken({
      userId: user.rows[0].id,
      email: user.rows[0].email,
    });

    const refreshToken = await createRefreshToken({
      userId: user.rows[0].id,
      email: user.rows[0].email,
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: false, // Cambiado a false para desarrollo local
      sameSite: "lax", // Cambiado a lax para desarrollo local
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ 
      accessToken, 
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email,
      },
      message: "Inicio de sesión exitoso." 
    });
  } catch (error) {
    console.error("❌ Error en signIn:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};


//ruta para cerrar sesion
export const logout = async (req, res) => {
  try {
    // Limpiar la cookie del refresh token
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.json({ message: "Sesión cerrada exitosamente." });
  } catch (error) {
    console.error("❌ Error en logout:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

//ruta para verificar y renovar token
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    if (!token) return res.status(401).json({ message: "No hay token de actualización." });

    // Verificar refresh token usando la función específica para refresh tokens
    let decoded;
    try {
      decoded = await verifyRefreshToken(token);
    } catch (err) {
      console.error("❌ Error al verificar refreshToken:", err);
      return res.status(403).json({ message: "Token inválido o expirado." });
    }

    // Buscar usuario (corregido: usar username en lugar de name)
    const result = await pool.query(
      "SELECT id, email, username FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const user = result.rows[0];

    // Crear nuevo accessToken
    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
    });

    // Devolver token y datos del usuario
    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });

  } catch (error) {
    console.error("❌ Error en /refresh:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};