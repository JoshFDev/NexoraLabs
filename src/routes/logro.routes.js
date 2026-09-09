import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import { misLogros, listarLogros, logrosDeUsuario } from "../controllers/logroController";

const router = Router();

//Catálogo de logros (público)
router.get('/logros', listarLogros);

//Verificar y listar mis logros con su estado (autenticado)
router.get('/mis-logros', verifyToken, misLogros);

//Logros obtenidos por un usuario (público)
router.get('/logros/usuario/:id', logrosDeUsuario);

export default router;