import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import {
    listarComentariosDeProyecto,
    crearComentarioProyecto,
    eliminarComentario
} from "../controllers/comentarioController";

const router = Router();

//Comentarios de un proyecto (público, ordenados como hilo)
router.get('/proyecto/:id/comentarios', listarComentariosDeProyecto);

//Crear comentario en un proyecto (autenticado)
router.post('/proyecto/:id/comentar', verifyToken, crearComentarioProyecto);

//Eliminar comentario (autor, creador del proyecto o admin)
router.delete('/comentario/:id', verifyToken, eliminarComentario);

export default router;