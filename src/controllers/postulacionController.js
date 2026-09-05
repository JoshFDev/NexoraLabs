import Postulacion from "../models/Postulacion";
import Proyecto from "../models/Proyecto";
import { serverError, notFound, conflict } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

//GET /postulaciones → listar todas las postulaciones
export const listarPostulaciones = async (req, res) => {
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
};

//GET /postulacion/:id → ver una postulación por id
export const obtenerPostulacion = async (req, res) => {
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
};

//POST /postulacion/agregar → crear una postulación
export const crearPostulacion = async (req, res) => {
    try {
        const postulacion = new Postulacion(req.body);
        const postulacionRegistrada = await postulacion.save();
        res.status(httpStatus.CREATED).json(postulacionRegistrada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /postulacion/:id → actualizar una postulación (admin)
export const actualizarPostulacion = async (req, res) => {
    try {
        const actualizada = await Postulacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(httpStatus.NOT_FOUND).json(notFound("Postulación no encontrada"));
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /postulacion/:id → eliminar una postulación (admin)
export const eliminarPostulacion = async (req, res) => {
    try {
        const eliminada = await Postulacion.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(httpStatus.NOT_FOUND).json(notFound("Postulación no encontrada"));
        res.json({ message: "Postulación eliminada", postulacion: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /proyecto/:id/postular → lógica de negocio: un usuario se postula a un proyecto
export const postularAProyecto = async (req, res) => {
    try {
        const proyectoId = req.params.id;
        const usuarioId = req.usuario.id;

        // El proyecto debe existir
        const proyecto = await Proyecto.findById(proyectoId);
        if (!proyecto) return res.status(httpStatus.NOT_FOUND).json(notFound("Proyecto no encontrado"));

        // No se puede postular dos veces al mismo proyecto
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
};