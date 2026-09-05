import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarMiembros,
    obtenerMiembro,
    crearMiembro,
    actualizarMiembro,
    eliminarMiembro,
    unirseAEquipo
} from "../controllers/miembroEquipoController";

const router = Router();

//Listar todos los miembros de equipos
router.get('/miembros-equipo', listarMiembros);

//Ver un miembro por id
router.get('/miembro-equipo/:id', obtenerMiembro);

//Agregar un miembro a un equipo
router.post('/miembro-equipo/agregar', verifyToken, authorize("admin", "mentor"), crearMiembro);

//Actualizar miembro
router.put('/miembro-equipo/:id', verifyToken, authorize("admin", "mentor"), actualizarMiembro);

//Eliminar miembro
router.delete('/miembro-equipo/:id', verifyToken, authorize("admin", "mentor"), eliminarMiembro);

//Lógica de negocio: unirse a un equipo (autenticado)
router.post('/equipo/:id/unirse', verifyToken, unirseAEquipo);

export default router;