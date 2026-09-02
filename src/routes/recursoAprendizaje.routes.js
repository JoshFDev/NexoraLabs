import { Router } from "express";
import RecursoAprendizaje from "../models/RecursoAprendizaje";
import { serverError, notFound } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

const router = Router();

//Listar todos los recursos de aprendizaje
router.get('/recursos-aprendizaje', async (req, res) => {
    try {
        const recursos = await RecursoAprendizaje.find();
        res.json(recursos);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Ver un recurso de aprendizaje por id
router.get('/recurso-aprendizaje/:id', async (req, res) => {
    try {
        const recurso = await RecursoAprendizaje.findById(req.params.id);
        if (!recurso) return res.status(httpStatus.NOT_FOUND).json(notFound("Recurso no encontrado"));
        res.json(recurso);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Crear recurso de aprendizaje
router.post('/recurso-aprendizaje/agregar', async (req, res) => {
    try {
        const recurso = new RecursoAprendizaje(req.body);
        const recursoRegistrado = await recurso.save();
        res.status(httpStatus.CREATED).json(recursoRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Actualizar recurso de aprendizaje
router.put('/recurso-aprendizaje/:id', async (req, res) => {
    try {
        const actualizado = await RecursoAprendizaje.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Recurso no encontrado"));
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Eliminar recurso de aprendizaje
router.delete('/recurso-aprendizaje/:id', async (req, res) => {
    try {
        const eliminado = await RecursoAprendizaje.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Recurso no encontrado"));
        res.json({ message: "Recurso eliminado", recurso: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;
