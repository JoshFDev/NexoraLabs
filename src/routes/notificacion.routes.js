import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
    misNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
    eliminarNotificacion
} from "../controllers/notificacionController";

const router = Router();

//Mis notificaciones (autenticado)
router.get('/notificaciones', verifyToken, misNotificaciones);

//Marcar todas como leídas (autenticado)
router.post('/notificaciones/marcar-todas', verifyToken, marcarTodasLeidas);

//Marcar una notificación como leída (autenticado)
router.put('/notificacion/:id/leida', verifyToken, marcarLeida);

//Eliminar una notificación (autenticado)
router.delete('/notificacion/:id', verifyToken, eliminarNotificacion);

export default router;