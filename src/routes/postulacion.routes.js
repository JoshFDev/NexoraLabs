import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarPostulaciones,
    obtenerPostulacion,
    crearPostulacion,
    actualizarPostulacion,
    eliminarPostulacion,
    postularAProyecto,
    misPostulaciones,
    retirarMiPostulacion,
    postulacionesDeMisProyectos,
    cambiarEstadoPostulacion
} from "../controllers/postulacionController";

const router = Router();

//Listar todas las postulaciones
router.get('/postulaciones', listarPostulaciones);

//Postulaciones del usuario autenticado
router.get('/mis-postulaciones', verifyToken, misPostulaciones);

//Retirar la propia postulación (autenticado, solo propietario)
router.delete('/postulacion-own/:id', verifyToken, retirarMiPostulacion);

//Ver una postulación por id
router.get('/postulacion/:id', obtenerPostulacion);

//Crear postulación
router.post('/postulacion/agregar', verifyToken, crearPostulacion);

//Actualizar postulación (admin)
router.put('/postulacion/:id', verifyToken, authorize("admin"), actualizarPostulacion);

//Eliminar postulación (admin)
router.delete('/postulacion/:id', verifyToken, authorize("admin"), eliminarPostulacion);

//Lógica de negocio: postular a un proyecto (autenticado)
router.post('/proyecto/:id/postular', verifyToken, postularAProyecto);

//Postulaciones recibidas en mis proyectos (creador)
router.get('/mis-proyectos/postulaciones', verifyToken, postulacionesDeMisProyectos);

//Aceptar/rechazar una postulación (creador del proyecto o admin)
router.put('/postulacion/:id/estado', verifyToken, cambiarEstadoPostulacion);

export default router;