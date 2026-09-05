import MiembroEquipo from "../models/MiembroEquipo";
import Equipo from "../models/Equipo";
import { serverError, notFound, badRequest, conflict } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

//GET /miembros-equipo → listar todos los miembros de equipos
export const listarMiembros = async (req, res) => {
    try {
        const miembros = await MiembroEquipo.find()
            .populate('equipo_id', 'nombre')
            .populate('usuario_id', 'nombre email rol');
        res.json(miembros);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /miembro-equipo/:id → ver un miembro por id
export const obtenerMiembro = async (req, res) => {
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
};

//POST /miembro-equipo/agregar → agregar un miembro a un equipo
export const crearMiembro = async (req, res) => {
    try {
        const miembro = new MiembroEquipo(req.body);
        const miembroRegistrado = await miembro.save();
        res.status(httpStatus.CREATED).json(miembroRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /miembro-equipo/:id → actualizar un miembro
export const actualizarMiembro = async (req, res) => {
    try {
        const actualizado = await MiembroEquipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Miembro no encontrado"));
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /miembro-equipo/:id → eliminar un miembro
export const eliminarMiembro = async (req, res) => {
    try {
        const eliminado = await MiembroEquipo.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Miembro no encontrado"));
        res.json({ message: "Miembro eliminado", miembro: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /equipo/:id/unirse → lógica de negocio: un usuario se une a un equipo activo
export const unirseAEquipo = async (req, res) => {
    try {
        const equipoId = req.params.id;
        const usuarioId = req.usuario.id;

        // El equipo debe existir
        const equipo = await Equipo.findById(equipoId);
        if (!equipo) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));

        // Solo se puede entrar a equipos activos
        if (equipo.estado !== "activo") {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("El equipo no está activo"));
        }

        // No se puede estar dos veces en el mismo equipo
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
};