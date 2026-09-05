import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarUsuarioHabilidades,
    obtenerUsuarioHabilidad,
    crearUsuarioHabilidad,
    actualizarUsuarioHabilidad,
    eliminarUsuarioHabilidad
} from "../controllers/usuarioHabilidadController";

const router = Router();

//Listar todas las habilidades de los usuarios
router.get('/usuarios-habilidades', listarUsuarioHabilidades);

//Ver una relación usuario-habilidad por id
router.get('/usuario-habilidad/:id', obtenerUsuarioHabilidad);

//Crear o actualizar relación usuario-habilidad (upsert)
router.post('/usuario-habilidad/agregar', verifyToken, crearUsuarioHabilidad);

//Actualizar relación usuario-habilidad
router.put('/usuario-habilidad/:id', verifyToken, actualizarUsuarioHabilidad);

//Eliminar relación usuario-habilidad (admin)
router.delete('/usuario-habilidad/:id', verifyToken, authorize("admin"), eliminarUsuarioHabilidad);

export default router;