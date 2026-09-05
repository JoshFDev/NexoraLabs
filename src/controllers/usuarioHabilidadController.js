import UsuarioHabilidad from "../models/UsuarioHabilidad";
import { serverError, notFound } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

//GET /usuarios-habilidades → listar las relaciones usuario-habilidad
export const listarUsuarioHabilidades = async (req, res) => {
    try {
        const usuarioHabilidades = await UsuarioHabilidad.find()
            .populate('usuario_id', 'nombre email')
            .populate('habilidad_id', 'nombre');
        res.json(usuarioHabilidades);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /usuario-habilidad/:id → ver una relación por id
export const obtenerUsuarioHabilidad = async (req, res) => {
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
};

//POST /usuario-habilidad/agregar → crear o actualizar la relación (upsert)
//upsert: si ya existe, la actualiza; si no existe, la crea
export const crearUsuarioHabilidad = async (req, res) => {
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
};

//PUT /usuario-habilidad/:id → actualizar una relación
export const actualizarUsuarioHabilidad = async (req, res) => {
    try {
        const actualizada = await UsuarioHabilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(httpStatus.NOT_FOUND).json(notFound("Relación usuario-habilidad no encontrada"));
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /usuario-habilidad/:id → eliminar una relación (admin)
export const eliminarUsuarioHabilidad = async (req, res) => {
    try {
        const eliminada = await UsuarioHabilidad.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(httpStatus.NOT_FOUND).json(notFound("Relación usuario-habilidad no encontrada"));
        res.json({ message: "Relación eliminada", usuarioHabilidad: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};