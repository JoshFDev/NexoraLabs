import { Router } from "express";
import Habilidad from "../models/Habilidad";
import { serverError, notFound, badRequest } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";
import verifyToken from "../middleware/verifyToken";

const router = Router();

//Listar todas las habilidades
router.get('/habilidades', async (req, res) => {
    try {
        const habilidades = await Habilidad.find();
        res.json(habilidades);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Ver una habilidad por id
router.get('/habilidad/:id', async (req, res) => {
    try {
        const habilidad = await Habilidad.findById(req.params.id);
        if (!habilidad) return res.status(httpStatus.NOT_FOUND).json(notFound("Habilidad no encontrada"));
        res.json(habilidad);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Crear habilidad
router.post('/habilidad/agregar', verifyToken, async (req, res) => {
    try {
        const { nombre, categoria } = req.body;
        if (!nombre || !categoria) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Todos los campos obligatorios son requeridos (nombre, categoria)"));
        }
        const habilidad = new Habilidad(req.body);
        const habilidadRegistrada = await habilidad.save();
        res.status(httpStatus.CREATED).json(habilidadRegistrada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Actualizar habilidad
router.put('/habilidad/:id', verifyToken, async (req, res) => {
    try {
        const actualizada = await Habilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(httpStatus.NOT_FOUND).json(notFound("Habilidad no encontrada"));
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Eliminar habilidad
router.delete('/habilidad/:id', verifyToken, async (req, res) => {
    try {
        const eliminada = await Habilidad.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(httpStatus.NOT_FOUND).json(notFound("Habilidad no encontrada"));
        res.json({ message: "Habilidad eliminada", habilidad: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;
