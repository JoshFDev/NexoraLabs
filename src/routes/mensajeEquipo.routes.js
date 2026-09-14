import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import { listarMensajes, enviarMensaje, silenciarEquipo } from "../controllers/mensajeEquipoController";

const router = Router();

//Historial de chat de un equipo (solo integrantes)
router.get("/equipo/:id/mensajes", verifyToken, listarMensajes);

//Enviar un mensaje al chat del equipo (solo integrantes)
router.post("/equipo/:id/mensajes", verifyToken, enviarMensaje);

//Silenciar/activar las notificaciones del chat del equipo (solo integrantes)
router.put("/equipo/:id/silenciar", verifyToken, silenciarEquipo);

export default router;
