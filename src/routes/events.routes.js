import Router from "express-promise-router";
import { getEvents, createEvent } from "../controllers/events.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas de eventos requieren autenticación
router.use(authRequired);

// GET /api/events - Obtener eventos del usuario
router.get("/", getEvents);

// POST /api/events - Crear nuevo evento
router.post("/", createEvent);

export default router;


