import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarEquipos,
    obtenerEquipo,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo
} from "../controllers/equipoController";

const router = Router();

//Toda la lógica vive en src/controllers/equipoController.js

//Listar equipos con filtros, paginación y ordenamiento
router.get('/equipos', listarEquipos);

//Crear equipo
router.post('/equipo/agregar', verifyToken, authorize("admin", "mentor"), crearEquipo);

//Ver un equipo por id
router.get('/equipo/:id', obtenerEquipo);

//Actualizar equipo
router.put('/equipo/:id', verifyToken, authorize("admin", "mentor"), actualizarEquipo);

//Eliminar equipo
router.delete('/equipo/:id', verifyToken, authorize("admin", "mentor"), eliminarEquipo);

export default router;