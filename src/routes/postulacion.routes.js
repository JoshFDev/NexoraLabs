import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarPostulaciones,
    obtenerPostulacion,
    crearPostulacion,
    actualizarPostulacion,
    eliminarPostulacion,
    postularAProyecto
} from "../controllers/postulacionController";

const router = Router();

//Listar todas las postulaciones
router.get('/postulaciones', listarPostulaciones);

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

export default router;