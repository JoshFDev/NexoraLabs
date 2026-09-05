import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarProyectoHabilidades,
    obtenerProyectoHabilidad,
    crearProyectoHabilidad,
    actualizarProyectoHabilidad,
    eliminarProyectoHabilidad
} from "../controllers/proyectoHabilidadController";

const router = Router();

//Listar todas las habilidades de los proyectos
router.get('/proyectos-habilidades', listarProyectoHabilidades);

//Ver una relación proyecto-habilidad por id
router.get('/proyecto-habilidad/:id', obtenerProyectoHabilidad);

//Crear relación proyecto-habilidad
router.post('/proyecto-habilidad/agregar', verifyToken, authorize("admin", "mentor"), crearProyectoHabilidad);

//Actualizar relación proyecto-habilidad
router.put('/proyecto-habilidad/:id', verifyToken, authorize("admin", "mentor"), actualizarProyectoHabilidad);

//Eliminar relación proyecto-habilidad
router.delete('/proyecto-habilidad/:id', verifyToken, authorize("admin", "mentor"), eliminarProyectoHabilidad);

export default router;