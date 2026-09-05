import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarHabilidades,
    obtenerHabilidad,
    crearHabilidad,
    actualizarHabilidad,
    eliminarHabilidad
} from "../controllers/habilidadController";

const router = Router();

//Listar habilidades con filtros, paginación y ordenamiento
router.get('/habilidades', listarHabilidades);

//Ver una habilidad por id
router.get('/habilidad/:id', obtenerHabilidad);

//Crear habilidad
router.post('/habilidad/agregar', verifyToken, authorize("admin", "mentor"), crearHabilidad);

//Actualizar habilidad
router.put('/habilidad/:id', verifyToken, authorize("admin", "mentor"), actualizarHabilidad);

//Eliminar habilidad
router.delete('/habilidad/:id', verifyToken, authorize("admin", "mentor"), eliminarHabilidad);

export default router;