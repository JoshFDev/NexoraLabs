import Comentario from "../models/Comentario";
import Proyecto from "../models/Proyecto";
import Usuario from "../models/Usuario";
import { registrarNotificacion } from "../shared/notificaciones";
import { serverError, notFound, badRequest, forbidden } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

const nombreDeUsuario = async (usuarioId) => {
    const usuario = await Usuario.findById(usuarioId).select('nombre apellido_paterno');
    return usuario ? `${usuario.nombre}${usuario.apellido_paterno ? ' ' + usuario.apellido_paterno : ''}` : 'Un usuario';
};

//GET /proyecto/:id/comentarios → comentarios de un proyecto (ordenados como hilo)
export const listarComentariosDeProyecto = async (req, res) => {
    try {
        const comentarios = await Comentario.find({ proyecto_id: req.params.id })
            .populate('usuario_id', 'nombre apellido_paterno email rol')
            .sort({ fecha: 1 });
        res.json(comentarios);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /proyecto/:id/comentar → crear un comentario en un proyecto (autenticado)
export const crearComentarioProyecto = async (req, res) => {
    try {
        const contenido = (req.body.contenido || '').trim();
        if (!contenido) return res.status(httpStatus.BAD_REQUEST).json(badRequest("El comentario no puede estar vacío"));

        const proyecto = await Proyecto.findById(req.params.id);
        if (!proyecto) return res.status(httpStatus.NOT_FOUND).json(notFound("Proyecto no encontrado"));

        const comentario = new Comentario({
            proyecto_id: proyecto._id,
            usuario_id: req.usuario.id,
            contenido
        });
        const comentarioRegistrado = await comentario.save();

        //Notificar al creador del proyecto (salvo que él mismo comente)
        if (String(proyecto.creador_id) !== String(req.usuario.id)) {
            const nombreUsuario = await nombreDeUsuario(req.usuario.id);
            await registrarNotificacion({
                usuario_id: proyecto.creador_id,
                tipo: "proyecto",
                titulo: "Nuevo comentario en tu proyecto",
                mensaje: `${nombreUsuario} comentó en "${proyecto.titulo}".`,
                enlace: `/proyecto/${proyecto._id}`
            });
        }

        const conDatos = await Comentario.findById(comentarioRegistrado._id)
            .populate('usuario_id', 'nombre apellido_paterno email rol');
        res.status(httpStatus.CREATED).json(conDatos);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /comentario/:id → eliminar un comentario (autor del comentario, creador del proyecto o admin)
export const eliminarComentario = async (req, res) => {
    try {
        const comentario = await Comentario.findById(req.params.id).populate('proyecto_id', 'creador_id');
        if (!comentario) return res.status(httpStatus.NOT_FOUND).json(notFound("Comentario no encontrado"));

        const esAdmin = req.usuario.rol === "admin";
        const esAutor = String(comentario.usuario_id) === String(req.usuario.id);
        const esCreadorDelProyecto = comentario.proyecto_id && String(comentario.proyecto_id.creador_id) === String(req.usuario.id);

        if (!esAdmin && !esAutor && !esCreadorDelProyecto) {
            return res.status(httpStatus.FORBIDDEN).json(forbidden());
        }

        await Comentario.findByIdAndDelete(comentario._id);
        res.json({ message: "Comentario eliminado" });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};