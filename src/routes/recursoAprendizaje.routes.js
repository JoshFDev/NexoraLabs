import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarRecursos,
    obtenerRecurso,
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso,
    calificarRecurso,
    eliminarMiCalificacion
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

//Lógica de negocio: crear/actualizar mi reseña de un recurso (autenticado)
router.post('/recurso-aprendizaje/:id/calificar', verifyToken, calificarRecurso);

//Eliminar mi reseña de un recurso (autenticado)
router.delete('/recurso-aprendizaje/own/:id/calificacion', verifyToken, eliminarMiCalificacion);

export default router;