import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarMiembros,
    obtenerMiembro,
    crearMiembro,
    actualizarMiembro,
    eliminarMiembro,
    solicitarIngreso,
    misEquipos,
    salirDeEquipo,
    cambiarRolMiembro,
    eliminarMiembroDeEquipo
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

//Lógica de negocio: solicitar unirse a un equipo (autenticado, el creador aprueba)
router.post('/equipo/:id/solicitar', verifyToken, solicitarIngreso);

//Equipos donde soy miembro
router.get('/mis-equipos', verifyToken, misEquipos);

//Salir de un equipo (autenticado)
router.delete('/equipo/:id/salir', verifyToken, salirDeEquipo);

//Cambiar el rol de un integrante (creador del equipo o admin/mentor)
router.put('/equipo/:id/miembros/:miembroId/rol', verifyToken, cambiarRolMiembro);

//Quitar a un integrante del equipo (creador del equipo o admin/mentor)
router.delete('/equipo/:id/miembros/:miembroId', verifyToken, eliminarMiembroDeEquipo);

export default router;