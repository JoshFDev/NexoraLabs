import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import { proyectosRecomendados, obtenerProyecto, crearProyecto, actualizarProyecto, eliminarProyecto, listarProyectos } from "../controllers/proyectoController";

const router = Router();

//Las rutas SOLO definen: método, path y middlewares que se ejecutan antes del controlador.
//Toda la lógica vive en src/controllers/proyectoController.js

//OJO: la ruta estática /proyecto/recomendados debe ir ANTES de la paramétrica /proyecto/:id,
//si no Express interpretaría "recomendados" como si fuera un :id
router.get('/proyecto/recomendados', verifyToken, proyectosRecomendados);

//Ver un proyecto por id
router.get('/proyecto/:id', obtenerProyecto);

//Crear proyecto
router.post('/proyecto/agregar', verifyToken, authorize("admin", "mentor", "desarrollador", "ingeniero"), crearProyecto);

//Actualizar proyecto
router.put('/proyecto/:id', verifyToken, authorize("admin", "mentor", "desarrollador", "ingeniero"), actualizarProyecto);

//Eliminar proyecto
router.delete('/proyecto/:id', verifyToken, authorize("admin", "mentor", "desarrollador", "ingeniero"), eliminarProyecto);

//Listar proyectos con filtros, paginación y ordenamiento
router.get('/proyectos', listarProyectos);

export default router;