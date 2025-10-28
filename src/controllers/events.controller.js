import { pool } from "../db.js";

// Controlador para obtener eventos del usuario autenticado
export const getEvents = async (req, res) => {
  try {
    const userId = req.user.userId; // Obtenido del middleware authRequired

    // Consulta para obtener eventos del usuario
    const result = await pool.query(
      "SELECT * FROM events WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error en getEvents:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Controlador para crear un nuevo evento
export const createEvent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, date, location } = req.body;

    // Validación básica
    if (!title) {
      return res.status(400).json({ message: "El título es requerido." });
    }

    const result = await pool.query(
      "INSERT INTO events (title, description, date, location, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, date, location, userId]
    );

    res.status(201).json({
      message: "Evento creado exitosamente.",
      event: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Error en createEvent:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};


