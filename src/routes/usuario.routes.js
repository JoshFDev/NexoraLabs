import { Router } from "express";
import rateLimit from "express-rate-limit";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarUsuarios,
    verPerfil,
    obtenerUsuario,
    registrarUsuario,
    iniciarSesion,
    actualizarUsuario,
    eliminarUsuario
} from "../controllers/usuarioController";

const router = Router();

//Las rutas SOLO definen: método, path y middlewares. Toda la lógica vive en usuarioController.

//Listar usuarios con filtros, paginación y ordenamiento
router.get('/usuarios', listarUsuarios);

//Perfil del usuario autenticado (OJO: va ANTES de /usuario/:id)
router.get('/usuario/perfil', verifyToken, verPerfil);

//Ver un usuario por id
router.get('/usuario/:id', obtenerUsuario);

//Registro de usuario (público)
router.post('/usuario/registro', registrarUsuario);

//Limitador ESTRICTO solo para el login (anti fuerza bruta):
//10 intentos por IP cada 15 minutos; al superarlos responde 429
const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000, // ventana de 15 minutos
    limit: 10,                // solo 10 intentos por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiados intentos de login, espera 15 minutos" }
});

//En modo test se salta el limitador para no bloquearse al repetir las pruebas
const limitadorLoginActivo = process.env.NODE_ENV === "test"
    ? (req, res, next) => next()
    : limitadorLogin;

//Login de usuario (público)
router.post('/usuario/login', limitadorLoginActivo, iniciarSesion);

//Actualizar usuario (solo admin)
router.put('/usuario/:id', verifyToken, authorize("admin"), actualizarUsuario);

//Eliminar usuario (solo admin)
router.delete('/usuario/:id', verifyToken, authorize("admin"), eliminarUsuario);

export default router;