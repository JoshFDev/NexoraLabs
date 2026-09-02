import { Router } from "express";
import Postulacion from "../models/Postulacion";
import { serverError, notFound } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

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
router.post('/postulacion/agregar', async (req, res) => {
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
router.put('/postulacion/:id', async (req, res) => {
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
router.delete('/postulacion/:id', async (req, res) => {
    try {
        const eliminada = await Postulacion.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(httpStatus.NOT_FOUND).json(notFound("Postulación no encontrada"));
        res.json({ message: "Postulación eliminada", postulacion: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;
