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

//Crear habilidad (solo el creador/admin del catálogo)
router.post('/habilidad/agregar', verifyToken, authorize("admin"), crearHabilidad);

//Actualizar habilidad (solo el creador/admin del catálogo)
router.put('/habilidad/:id', verifyToken, authorize("admin"), actualizarHabilidad);

//Eliminar habilidad (solo el creador/admin del catálogo)
router.delete('/habilidad/:id', verifyToken, authorize("admin"), eliminarHabilidad);

export default router;