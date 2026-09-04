import { Router } from "express";
import Equipo from "../models/Equipo";
import { serverError, notFound, badRequest } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";

const router = Router();

router.get('/equipos', async (req, res) => {
    try {
        const equipos = await Equipo.find()
            .populate('proyecto_id', 'titulo');
        res.json(equipos);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

router.post('/equipo/agregar', verifyToken, authorize("admin", "mentor"), async (req, res) => {
    try {
        const { proyecto_id, nombre } = req.body;
        if (!proyecto_id || !nombre) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Todos los campos obligatorios son requeridos (proyecto_id, nombre)"));
        }
        const equipo = new Equipo(req.body);
        const equipoRegistrado = await equipo.save();
        res.status(httpStatus.CREATED).json(equipoRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

router.get('/equipo/:id', async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id)
            .populate('proyecto_id', 'titulo');
        if (!equipo) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));
        res.json(equipo);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

router.put('/equipo/:id', verifyToken, authorize("admin", "mentor"), async (req, res) => {
    try {
        const actualizado = await Equipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

router.delete('/equipo/:id', verifyToken, authorize("admin", "mentor"), async (req, res) => {
    try {
        const eliminado = await Equipo.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));
        res.json({ message: "Equipo eliminado", equipo: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;
