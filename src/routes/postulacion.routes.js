import { Router } from "express";
import Postulacion from "../models/Postulacion";
import Proyecto from "../models/Proyecto";
import { serverError, notFound, badRequest, conflict } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";

const router = Router();

//Listar todas las postulaciones
router.get('/postulaciones', async (req, res) => {
    try {
        const postulaciones = await Postulacion.find()
            .populate('proyecto_id', 'titulo')
            .populate('usuario_id', 'nombre email')
            .populate('habilidades_ofrecidas', 'nombre');
        res.json(postulaciones);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Ver una postulación por id
router.get('/postulacion/:id', async (req, res) => {
    try {
        const postulacion = await Postulacion.findById(req.params.id)
            .populate('proyecto_id', 'titulo')
            .populate('usuario_id', 'nombre email')
            .populate('habilidades_ofrecidas', 'nombre');
        if (!postulacion) return res.status(httpStatus.NOT_FOUND).json(notFound("Postulación no encontrada"));
        res.json(postulacion);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Crear postulación
router.post('/postulacion/agregar', verifyToken, async (req, res) => {
    try {
        const postulacion = new Postulacion(req.body);
        const postulacionRegistrada = await postulacion.save();
        res.status(httpStatus.CREATED).json(postulacionRegistrada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Actualizar postulación
router.put('/postulacion/:id', verifyToken, authorize("admin"), async (req, res) => {
    try {
        const actualizada = await Postulacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(httpStatus.NOT_FOUND).json(notFound("Postulación no encontrada"));
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Eliminar postulación
router.delete('/postulacion/:id', verifyToken, authorize("admin"), async (req, res) => {
    try {
        const eliminada = await Postulacion.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(httpStatus.NOT_FOUND).json(notFound("Postulación no encontrada"));
        res.json({ message: "Postulación eliminada", postulacion: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Postular a un proyecto (lógica de negocio)
router.post('/proyecto/:id/postular', verifyToken, async (req, res) => {
    try {
        const proyectoId = req.params.id;
        const usuarioId = req.usuario.id;

        const proyecto = await Proyecto.findById(proyectoId);
        if (!proyecto) return res.status(httpStatus.NOT_FOUND).json(notFound("Proyecto no encontrado"));

        const yaPostulo = await Postulacion.findOne({ proyecto_id: proyectoId, usuario_id: usuarioId });
        if (yaPostulo) {
            return res.status(httpStatus.CONFLICT).json(conflict("Ya te has postulado a este proyecto"));
        }

        const postulacion = new Postulacion({
            proyecto_id: proyectoId,
            usuario_id: usuarioId,
            mensaje: req.body.mensaje,
            habilidades_ofrecidas: req.body.habilidades_ofrecidas || []
        });

        const postulacionRegistrada = await postulacion.save();
        res.status(httpStatus.CREATED).json(postulacionRegistrada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;
