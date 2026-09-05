import { Router } from "express";
import MiembroEquipo from "../models/MiembroEquipo";
import Equipo from "../models/Equipo";
import { serverError, notFound, badRequest, conflict } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";

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

router.post('/miembro-equipo/agregar', verifyToken, authorize("admin", "mentor"), async (req, res) => {
    try {
        const miembro = new MiembroEquipo(req.body);
        const miembroRegistrado = await miembro.save();
        res.status(httpStatus.CREATED).json(miembroRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

router.put('/miembro-equipo/:id', verifyToken, authorize("admin", "mentor"), async (req, res) => {
    try {
        const actualizado = await MiembroEquipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Miembro no encontrado"));
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

router.delete('/miembro-equipo/:id', verifyToken, authorize("admin", "mentor"), async (req, res) => {
    try {
        const eliminado = await MiembroEquipo.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Miembro no encontrado"));
        res.json({ message: "Miembro eliminado", miembro: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Unirse a un equipo (lógica de negocio)
router.post('/equipo/:id/unirse', verifyToken, async (req, res) => {
    try {
        const equipoId = req.params.id;
        const usuarioId = req.usuario.id;

        const equipo = await Equipo.findById(equipoId);
        if (!equipo) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));

        if (equipo.estado !== "activo") {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("El equipo no está activo"));
        }

        const yaEsMiembro = await MiembroEquipo.findOne({ equipo_id: equipoId, usuario_id: usuarioId });
        if (yaEsMiembro) {
            return res.status(httpStatus.CONFLICT).json(conflict("Ya formas parte de este equipo"));
        }

        const miembro = new MiembroEquipo({
            equipo_id: equipoId,
            usuario_id: usuarioId,
            rol: req.body.rol || "miembro"
        });

        const miembroRegistrado = await miembro.save();
        res.status(httpStatus.CREATED).json(miembroRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;
