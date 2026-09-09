import MiembroEquipo from "../models/MiembroEquipo";
import Equipo from "../models/Equipo";
import Proyecto from "../models/Proyecto";
import Usuario from "../models/Usuario";
import SolicitudEquipo from "../models/SolicitudEquipo";
import { registrarNotificacion } from "../shared/notificaciones";
import { serverError, notFound, badRequest, conflict, forbidden } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

//Devuelve el creador y título del proyecto vinculado al equipo (null si no aplica)
const creadorDelEquipo = async (equipo) => {
    if (!equipo.proyecto_id) return null;
    const proyecto = await Proyecto.findById(equipo.proyecto_id).select('creador_id titulo');
    return proyecto ? { creador: proyecto.creador_id, titulo: proyecto.titulo } : null;
};

const nombreDeUsuario = async (usuarioId) => {
    const usuario = await Usuario.findById(usuarioId).select('nombre apellido_paterno');
    return usuario ? `${usuario.nombre}${usuario.apellido_paterno ? ' ' + usuario.apellido_paterno : ''}` : 'Un usuario';
};

//¿Puede el usuario gestionar el equipo? (admin, mentor o creador del proyecto del equipo)
const esResponsableDelEquipo = async (usuarioId, rol, equipo) => {
    if (rol === "admin" || rol === "mentor") return true;
    const datosProyecto = await creadorDelEquipo(equipo);
    return datosProyecto ? String(datosProyecto.creador) === String(usuarioId) : false;
};

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

//GET /mis-equipos → equipos donde soy miembro
export const misEquipos = async (req, res) => {
    try {
        const misMiembros = await MiembroEquipo.find({ usuario_id: req.usuario.id });
        const idsEquipos = misMiembros.map((m) => m.equipo_id);
        const equipos = await Equipo.find({ _id: { $in: idsEquipos } })
            .populate('proyecto_id', 'titulo');
        res.json(equipos);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /equipo/:id/miembros/:miembroId/rol → cambiar el rol de un integrante (creador del equipo o admin/mentor)
export const cambiarRolMiembro = async (req, res) => {
    try {
        const { rol } = req.body;
        const rolesValidos = ["lider", "colaborador", "miembro"];
        if (!rolesValidos.includes(rol)) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Rol no válido (lider, colaborador, miembro)"));
        }

        const equipo = await Equipo.findById(req.params.id);
        if (!equipo) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));

        const responsable = await esResponsableDelEquipo(req.usuario.id, req.usuario.rol, equipo);
        if (!responsable) return res.status(httpStatus.FORBIDDEN).json(forbidden());

        const miembro = await MiembroEquipo.findOne({
            _id: req.params.miembroId,
            equipo_id: equipo._id
        });
        if (!miembro) return res.status(httpStatus.NOT_FOUND).json(notFound("El integrante no pertenece a este equipo"));

        miembro.rol = rol;
        await miembro.save();

        const miembroConDatos = await MiembroEquipo.findById(miembro._id)
            .populate('usuario_id', 'nombre apellido_paterno email rol');
        res.json(miembroConDatos);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /equipo/:id/miembros/:miembroId → quitar a un integrante del equipo (creador del equipo o admin/mentor)
export const eliminarMiembroDeEquipo = async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id);
        if (!equipo) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));

        const responsable = await esResponsableDelEquipo(req.usuario.id, req.usuario.rol, equipo);
        if (!responsable) return res.status(httpStatus.FORBIDDEN).json(forbidden());

        const miembro = await MiembroEquipo.findOneAndDelete({
            _id: req.params.miembroId,
            equipo_id: equipo._id
        });
        if (!miembro) return res.status(httpStatus.NOT_FOUND).json(notFound("El integrante no pertenece a este equipo"));

        const nombreMiembro = await nombreDeUsuario(miembro.usuario_id);
        const datosProyecto = await creadorDelEquipo(equipo);

        if (datosProyecto) {
            await registrarNotificacion({
                usuario_id: miembro.usuario_id,
                tipo: "equipo",
                titulo: "Fuiste removido del equipo",
                mensaje: `${nombreMiembro} ya no forma parte del equipo del proyecto "${datosProyecto.titulo}".`,
                enlace: `/equipos`
            });
        }

        res.json({ message: "Integrante removido del equipo", miembro });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /equipo/:id/salir → el usuario deja un equipo
export const salirDeEquipo = async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id);
        if (!equipo) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));

        const eliminado = await MiembroEquipo.findOneAndDelete({
            equipo_id: req.params.id,
            usuario_id: req.usuario.id
        });
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("No formas parte de este equipo"));

        const datosProyecto = await creadorDelEquipo(equipo);
        if (datosProyecto) {
            const nombreUsuario = await nombreDeUsuario(req.usuario.id);
            await registrarNotificacion({
                usuario_id: datosProyecto.creador,
                tipo: "equipo",
                titulo: "Un integrante salió del equipo",
                mensaje: `${nombreUsuario} salió del equipo del proyecto "${datosProyecto.titulo}".`,
                enlace: `/equipos`
            });
        }

        res.json({ message: "Saliste del equipo", miembro: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /equipo/:id/solicitar → un usuario solicita unirse a un equipo activo (espera aprobación del creador)
export const solicitarIngreso = async (req, res) => {
    try {
        const equipoId = req.params.id;
        const usuarioId = req.usuario.id;

        // El equipo debe existir
        const equipo = await Equipo.findById(equipoId);
        if (!equipo) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));

        // Solo se puede solicitar entrar a equipos activos
        if (equipo.estado !== "activo") {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("El equipo no está activo"));
        }

        // No se puede solicitar si ya eres miembro
        const yaEsMiembro = await MiembroEquipo.findOne({ equipo_id: equipoId, usuario_id: usuarioId });
        if (yaEsMiembro) {
            return res.status(httpStatus.CONFLICT).json(conflict("Ya formas parte de este equipo"));
        }

        // No se puede repetir una solicitud pendiente
        const yaPendiente = await SolicitudEquipo.findOne({ equipo_id: equipoId, usuario_id: usuarioId, estado: "pendiente" });
        if (yaPendiente) {
            return res.status(httpStatus.CONFLICT).json(conflict("Ya enviaste una solicitud para este equipo"));
        }

        const solicitud = new SolicitudEquipo({
            equipo_id: equipoId,
            usuario_id: usuarioId,
            estado: "pendiente"
        });
        const solicitudRegistrada = await solicitud.save();

        const datosProyecto = await creadorDelEquipo(equipo);
        if (datosProyecto) {
            const nombreUsuario = await nombreDeUsuario(usuarioId);
            await registrarNotificacion({
                usuario_id: datosProyecto.creador,
                tipo: "equipo",
                titulo: "Nueva solicitud para tu equipo",
                mensaje: `${nombreUsuario} solicitó unirse al equipo del proyecto "${datosProyecto.titulo}".`,
                enlace: `/equipos`
            });
        }

        res.status(httpStatus.CREATED).json(solicitudRegistrada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /mis-solicitudes-enviadas → solicitudes pendientes que envié a equipos
export const misSolicitudesEnviadas = async (req, res) => {
    try {
        const solicitudes = await SolicitudEquipo.find({ usuario_id: req.usuario.id })
            .populate('equipo_id', 'nombre estado');
        res.json(solicitudes);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /mis-solicitudes-equipo → solicitudes pendientes en los equipos de mis proyectos (creador aprueba); admins ven todas
export const misSolicitudesEquipo = async (req, res) => {
    try {
        let filtroEquipos = null;

        if (req.usuario.rol !== "admin") {
            const proyectos = await Proyecto.find({ creador_id: req.usuario.id }).select('_id');
            const idsProyectos = proyectos.map((p) => p._id);
            const equipos = await Equipo.find({ proyecto_id: { $in: idsProyectos } }).select('_id');
            filtroEquipos = { $in: equipos.map((e) => e._id) };
            if (filtroEquipos.$in.length === 0) return res.json([]);
        }

        const solicitudes = await SolicitudEquipo.find({
            ...(filtroEquipos ? { equipo_id: filtroEquipos } : {}),
            estado: "pendiente"
        })
            .populate('equipo_id', 'nombre')
            .populate('usuario_id', 'nombre apellido_paterno email rol')
            .sort({ fecha: -1 });

        res.json(solicitudes);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /solicitud-equipo/:id/estado → aprobar o rechazar (creador del proyecto del equipo o admin)
export const cambiarEstadoSolicitud = async (req, res) => {
    try {
        const { estado } = req.body;
        const estadosValidos = ["aprobada", "rechazada", "pendiente"];
        if (!estadosValidos.includes(estado)) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Estado no válido"));
        }

        const solicitud = await SolicitudEquipo.findById(req.params.id)
            .populate('equipo_id', 'estado');
        if (!solicitud) return res.status(httpStatus.NOT_FOUND).json(notFound("Solicitud no encontrada"));

        const esAdmin = req.usuario.rol === "admin";
        const datosProyecto = await creadorDelEquipo(solicitud.equipo_id);
        const esCreador = datosProyecto && String(datosProyecto.creador) === String(req.usuario.id);
        if (!esAdmin && !esCreador) {
            return res.status(httpStatus.FORBIDDEN).json(forbidden());
        }

        if (estado === "aprobada" && solicitud.equipo_id?.estado !== "activo") {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("El equipo no está activo"));
        }

        solicitud.estado = estado;
        await solicitud.save();

        if (estado === "aprobada") {
            const yaMiembro = await MiembroEquipo.findOne({
                equipo_id: solicitud.equipo_id._id,
                usuario_id: solicitud.usuario_id
            });
            if (!yaMiembro) {
                await MiembroEquipo.create({
                    equipo_id: solicitud.equipo_id._id,
                    usuario_id: solicitud.usuario_id,
                    rol: "miembro"
                });
            }
        }

        const solicitudConDatos = await SolicitudEquipo.findById(solicitud._id)
            .populate('equipo_id', 'nombre')
            .populate('usuario_id', 'nombre apellido_paterno');

        await registrarNotificacion({
            usuario_id: solicitud.usuario_id,
            tipo: "equipo",
            titulo: estado === "aprobada" ? "Solicitud aceptada" : "Solicitud rechazada",
            mensaje: estado === "aprobada"
                ? `Tu solicitud para unirte al equipo "${
                    solicitudConDatos?.equipo_id?.nombre || ''
                  }" fue aceptada. Ya eres parte del equipo.`
                : `Tu solicitud para unirte al equipo "${
                    solicitudConDatos?.equipo_id?.nombre || ''
                  }" no fue aprobada.`,
            enlace: `/equipos`
        });

        res.json(solicitudConDatos);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /solicitud-equipo/own/:id → cancelo mi propia solicitud pendiente
export const cancelarSolicitud = async (req, res) => {
    try {
        const eliminada = await SolicitudEquipo.findOneAndDelete({
            _id: req.params.id,
            usuario_id: req.usuario.id,
            estado: "pendiente"
        });
        if (!eliminada) return res.status(httpStatus.NOT_FOUND).json(notFound("Solicitud no encontrada"));
        res.json({ message: "Solicitud cancelada", solicitud: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};