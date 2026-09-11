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
    verificarEmail,
    reenviarCodigoVerificacion,
    solicitarEliminarCuenta,
    confirmarEliminarCuenta,
    actualizarMiPerfil,
    actualizarUsuario,
    eliminarUsuario
} from "../controllers/usuarioController";

const router = Router();

//Las rutas SOLO definen: método, path y middlewares. Toda la lógica vive en usuarioController.

//Listar usuarios con filtros, paginación y ordenamiento
router.get('/usuarios', listarUsuarios);

//Perfil del usuario autenticado (OJO: va ANTES de /usuario/:id)
router.get('/usuario/perfil', verifyToken, verPerfil);

//El usuario autenticado actualiza su propio perfil (va ANTES de /usuario/:id)
router.put('/usuario/perfil', verifyToken, actualizarMiPerfil);

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

//Limitador para códigos de verificación (anti fuerza bruta): 5 intentos por IP cada 15 minutos
const limitadorCodigos = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiados intentos. Espera 15 minutos." }
});

const limitadorCodigosActivo = process.env.NODE_ENV === "test"
    ? (req, res, next) => next()
    : limitadorCodigos;

//Login de usuario (público)
router.post('/usuario/login', limitadorLoginActivo, iniciarSesion);

//Verificar el correo con el código recibido (público)
router.post('/usuario/verificar-email', limitadorCodigosActivo, verificarEmail);

//Reenviar el código de verificación (público)
router.post('/usuario/reenviar-codigo', limitadorCodigosActivo, reenviarCodigoVerificacion);

//Pedir el código para eliminar la cuenta (autenticado)
router.post('/usuario/eliminar/solicitar', verifyToken, limitadorCodigosActivo, solicitarEliminarCuenta);

//Confirmar la eliminación de la cuenta con el código (autenticado)
router.post('/usuario/eliminar/confirmar', verifyToken, confirmarEliminarCuenta);

//Actualizar usuario (solo admin)
router.put('/usuario/:id', verifyToken, authorize("admin"), actualizarUsuario);

//Eliminar usuario (solo admin)
router.delete('/usuario/:id', verifyToken, authorize("admin"), eliminarUsuario);

export default router;