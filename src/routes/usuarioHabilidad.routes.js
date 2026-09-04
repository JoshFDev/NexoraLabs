import { Router } from "express";
import UsuarioHabilidad from "../models/UsuarioHabilidad";
import { serverError, notFound } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";
import verifyToken from "../middleware/verifyToken";

const router = Router();

//Listar todas las habilidades de los usuarios
router.get('/usuarios-habilidades', async (req, res) => {
    try {
        const usuarioHabilidades = await UsuarioHabilidad.find()
            .populate('usuario_id', 'nombre email')
            .populate('habilidad_id', 'nombre');
        res.json(usuarioHabilidades);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Ver una relación usuario-habilidad por id
router.get('/usuario-habilidad/:id', async (req, res) => {
    try {
        const usuarioHabilidad = await UsuarioHabilidad.findById(req.params.id)
            .populate('usuario_id', 'nombre email')
            .populate('habilidad_id', 'nombre');
        if (!usuarioHabilidad) return res.status(httpStatus.NOT_FOUND).json(notFound("Relación usuario-habilidad no encontrada"));
        res.json(usuarioHabilidad);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Crear o actualizar relación usuario-habilidad (upsert)
router.post('/usuario-habilidad/agregar', verifyToken, async (req, res) => {
    try {
        const usuarioHabilidad = await UsuarioHabilidad.findOneAndUpdate(
            { usuario_id: req.body.usuario_id, habilidad_id: req.body.habilidad_id },
            { nivel: req.body.nivel, años_experiencia: req.body.años_experiencia },
            { upsert: true, new: true }
        );
        res.status(httpStatus.CREATED).json(usuarioHabilidad);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Actualizar relación usuario-habilidad
router.put('/usuario-habilidad/:id', verifyToken, async (req, res) => {
    try {
        const actualizada = await UsuarioHabilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(httpStatus.NOT_FOUND).json(notFound("Relación usuario-habilidad no encontrada"));
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Eliminar relación usuario-habilidad
router.delete('/usuario-habilidad/:id', verifyToken, async (req, res) => {
    try {
        const eliminada = await UsuarioHabilidad.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(httpStatus.NOT_FOUND).json(notFound("Relación usuario-habilidad no encontrada"));
        res.json({ message: "Relación eliminada", usuarioHabilidad: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;
