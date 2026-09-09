import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
    misSolicitudesEnviadas,
    misSolicitudesEquipo,
    cambiarEstadoSolicitud,
    cancelarSolicitud
} from "../controllers/miembroEquipoController";

const router = Router();

//Solicitudes pendientes que envié a equipos
router.get('/mis-solicitudes-enviadas', verifyToken, misSolicitudesEnviadas);

//Solicitudes pendientes en los equipos de mis proyectos (creador aprueba)
router.get('/mis-solicitudes-equipo', verifyToken, misSolicitudesEquipo);

//Aprobar o rechazar una solicitud (creador del proyecto del equipo o admin)
router.put('/solicitud-equipo/:id/estado', verifyToken, cambiarEstadoSolicitud);

//Cancelar mi propia solicitud pendiente
router.delete('/solicitud-equipo/own/:id', verifyToken, cancelarSolicitud);

export default router;