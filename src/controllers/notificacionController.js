import Notificacion from "../models/Notificacion";
import { serverError, notFound, badRequest } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

//GET /notificaciones → notificaciones del usuario autenticado (más recientes primero)
export const misNotificaciones = async (req, res) => {
    try {
        const limite = Number(req.query.limite) || 30;
        const notificaciones = await Notificacion.find({ usuario_id: req.usuario.id })
            .sort({ fecha: -1 })
            .limit(limite);

        const no_leidas = await Notificacion.countDocuments({ usuario_id: req.usuario.id, leida: false });

        res.json({ notificaciones, no_leidas });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /notificacion/:id/leida → marcar una notificación como leída (solo del dueño)
export const marcarLeida = async (req, res) => {
    try {
        const notificacion = await Notificacion.findOne({
            _id: req.params.id,
            usuario_id: req.usuario.id
        });
        if (!notificacion) return res.status(httpStatus.NOT_FOUND).json(notFound("Notificación no encontrada"));

        notificacion.leida = true;
        await notificacion.save();
        res.json(notificacion);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /notificaciones/marcar-todas → marcar todas las notificaciones del usuario como leídas
export const marcarTodasLeidas = async (req, res) => {
    try {
        await Notificacion.updateMany(
            { usuario_id: req.usuario.id, leida: false },
            { $set: { leida: true } }
        );
        res.json({ message: "Todas las notificaciones fueron marcadas como leídas" });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /notificacion/:id → eliminar una notificación (solo del dueño)
export const eliminarNotificacion = async (req, res) => {
    try {
        const eliminada = await Notificacion.findOneAndDelete({
            _id: req.params.id,
            usuario_id: req.usuario.id
        });
        if (!eliminada) return res.status(httpStatus.NOT_FOUND).json(notFound("Notificación no encontrada"));
        res.json({ message: "Notificación eliminada", notificacion: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};