import { Router } from "express";
import MiembroEquipo from "../models/MiembroEquipo";
import { serverError, notFound } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get('/miembros-equipo', async (req, res) => {
    try {
        const miembros = await MiembroEquipo.find()
            .populate('equipo_id', 'nombre')
            .populate('usuario_id', 'nombre email rol');
        res.json(miembros);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

router.get('/miembro-equipo/:id', async (req, res) => {
    try {
        const miembro = await MiembroEquipo.findById(req.params.id)
            .populate('equipo_id', 'nombre')
            .populate('usuario_id', 'nombre email rol');
        if (!miembro) return res.status(httpStatus.NOT_FOUND).json(notFound("Miembro no encontrado"));
        res.json(miembro);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

router.post('/miembro-equipo/agregar', verifyToken, async (req, res) => {
    try {
        const miembro = new MiembroEquipo(req.body);
        const miembroRegistrado = await miembro.save();
        res.status(httpStatus.CREATED).json(miembroRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

router.put('/miembro-equipo/:id', verifyToken, async (req, res) => {
    try {
        const actualizado = await MiembroEquipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Miembro no encontrado"));
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

router.delete('/miembro-equipo/:id', verifyToken, async (req, res) => {
    try {
        const eliminado = await MiembroEquipo.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Miembro no encontrado"));
        res.json({ message: "Miembro eliminado", miembro: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;
