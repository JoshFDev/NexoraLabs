import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarRecursos,
    obtenerRecurso,
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso,
    calificarRecurso
} from "../controllers/recursoAprendizajeController";

const router = Router();

//Listar recursos con filtros, paginación y ordenamiento
router.get('/recursos-aprendizaje', listarRecursos);

//Ver un recurso por id
router.get('/recurso-aprendizaje/:id', obtenerRecurso);

//Crear recurso
router.post('/recurso-aprendizaje/agregar', verifyToken, authorize("admin", "mentor"), crearRecurso);

//Actualizar recurso
router.put('/recurso-aprendizaje/:id', verifyToken, authorize("admin", "mentor"), actualizarRecurso);

//Eliminar recurso
router.delete('/recurso-aprendizaje/:id', verifyToken, authorize("admin", "mentor"), eliminarRecurso);

//Lógica de negocio: calificar un recurso (autenticado)
router.post('/recurso-aprendizaje/:id/calificar', verifyToken, calificarRecurso);

export default router;