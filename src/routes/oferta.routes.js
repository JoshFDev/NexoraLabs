import { Router } from "express";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import {
    listarOfertas,
    obtenerOferta,
    crearOferta,
    actualizarOferta,
    eliminarOferta,
    postularAOferta,
    misPostulacionesOfertas,
    retirarMiPostulacionOferta,
    postulacionesDeOferta,
    cambiarEstadoPostulacionOferta
} from "../controllers/ofertaController";

const router = Router();

//Si hay token válido lo usa (para conocer mi estado), pero no exige estar logueado
const tokenOpcional = (req, res, next) => {
    const cabecera = req.header("Authorization") || "";
    const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : cabecera;
    if (!token) return next();
    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_e) {
        //token inválido: continúa como anónimo
    }
    next();
};

//Listar ofertas (público, con token opcional)
router.get('/ofertas', tokenOpcional, listarOfertas);

//Ver una oferta (público)
router.get('/oferta/:id', obtenerOferta);

//Crear oferta (admin/mentor)
router.post('/oferta/agregar', verifyToken, authorize("admin", "mentor"), crearOferta);

//Actualizar oferta (admin/mentor o quien la publicó)
router.put('/oferta/:id', verifyToken, actualizarOferta);

//Eliminar oferta (admin/mentor o quien la publicó)
router.delete('/oferta/:id', verifyToken, eliminarOferta);

//Postular a una oferta (autenticado)
router.post('/oferta/:id/postular', verifyToken, postularAOferta);

//Mis postulaciones a ofertas (autenticado)
router.get('/mis-postulaciones-ofertas', verifyToken, misPostulacionesOfertas);

//Retirar mi postulación pendiente (autenticado)
router.delete('/postulacion-oferta-own/:id', verifyToken, retirarMiPostulacionOferta);

//Postulaciones de una oferta (admin/mentor o quien la publicó)
router.get('/oferta/:id/postulaciones', verifyToken, postulacionesDeOferta);

//Responder postulación (admin/mentor o quien la publicó)
router.put('/postulacion-oferta/:id/estado', verifyToken, cambiarEstadoPostulacionOferta);

export default router;