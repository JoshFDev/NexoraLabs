import Oferta from "../models/Oferta";
import PostulacionOferta from "../models/PostulacionOferta";
import Usuario from "../models/Usuario";
import { registrarNotificacion } from "../shared/notificaciones";
import { serverError, notFound, badRequest, forbidden, conflict } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

const esPublicadorORecrutador = (req, oferta = null) => {
    if (req.usuario.rol === "admin" || req.usuario.rol === "mentor") return true;
    if (oferta && String(oferta.publicado_por) === String(req.usuario.id)) return true;
    return false;
};

const nombreDeUsuario = async (usuarioId) => {
    const usuario = await Usuario.findById(usuarioId).select('nombre apellido_paterno');
    return usuario ? `${usuario.nombre}${usuario.apellido_paterno ? ' ' + usuario.apellido_paterno : ''}` : 'Un usuario';
};

//GET /ofertas → listar ofertas con filtros (público)
export const listarOfertas = async (req, res) => {
    try {
        const { pagina = 1, limite = 9, busqueda, tipo, modalidad, nivel, estado, habilidad } = req.query;
        const page = Math.max(1, parseInt(pagina, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(limite, 10) || 9));

        const filtros = {};
        if (estado) filtros.estado = estado;
        else if (!req.usuario || !esPublicadorORecrutador(req)) filtros.estado = "abierta";
        if (tipo) filtros.tipo = tipo;
        if (modalidad) filtros.modalidad = modalidad;
        if (nivel) filtros.nivel = nivel;
        if (habilidad) filtros.habilidades_requeridas = habilidad;
        if (busqueda) {
            const regex = new RegExp(busqueda.trim(), "i");
            filtros.$or = [{ titulo: regex }, { empresa: regex }, { descripcion: regex }];
        }

        const total = await Oferta.countDocuments(filtros);
        const ofertas = await Oferta.find(filtros)
            .populate("habilidades_requeridas", "nombre")
            .populate("publicado_por", "nombre apellido_paterno rol")
            .sort({ fecha_publicacion: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const miEstado = new Map();
        if (req.usuario) {
            const misPostulaciones = await PostulacionOferta.find({ usuario_id: req.usuario.id }).lean();
            misPostulaciones.forEach((p) => {
                if (!miEstado.has(String(p.oferta_id))) miEstado.set(String(p.oferta_id), p.estado);
            });
        }

        res.json({
            ofertas: ofertas.map((o) => ({
                ...o,
                _miestado: miEstado.get(String(o._id)) || "no_aplicada"
            })),
            total,
            pagina: page,
            paginas: Math.max(1, Math.ceil(total / limit))
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /oferta/:id → ver una oferta (público)
export const obtenerOferta = async (req, res) => {
    try {
        const oferta = await Oferta.findById(req.params.id)
            .populate("habilidades_requeridas", "nombre")
            .populate("publicado_por", "nombre apellido_paterno rol");
        if (!oferta) return res.status(httpStatus.NOT_FOUND).json(notFound("Oferta no encontrada"));
        res.json(oferta);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /oferta/agregar → crear oferta (admin/mentor)
export const crearOferta = async (req, res) => {
    try {
        const { titulo, empresa, descripcion, tipo, modalidad, ubicacion, salario, nivel, habilidades_requeridas, estado, fecha_limite } = req.body;

        if (!titulo || (titulo || "").trim().length < 5) return res.status(httpStatus.BAD_REQUEST).json(badRequest("Escribe un título de al menos 5 caracteres"));
        if (!descripcion || (descripcion || "").trim().length < 20) return res.status(httpStatus.BAD_REQUEST).json(badRequest("Escribe una descripción de al menos 20 caracteres"));

        const oferta = new Oferta({
            titulo: titulo.trim(),
            empresa,
            descripcion: descripcion.trim(),
            tipo,
            modalidad,
            ubicacion,
            salario,
            nivel,
            habilidades_requeridas: habilidades_requeridas || [],
            estado,
            fecha_limite: fecha_limite || undefined,
            publicado_por: req.usuario.id
        });

        const registrada = await oferta.save();
        const conDatos = await Oferta.findById(registrada._id)
            .populate("habilidades_requeridas", "nombre")
            .populate("publicado_por", "nombre apellido_paterno rol");
        res.status(httpStatus.CREATED).json(conDatos);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /oferta/:id → actualizar una oferta (admin/mentor o quien la publicó)
export const actualizarOferta = async (req, res) => {
    try {
        const oferta = await Oferta.findById(req.params.id);
        if (!oferta) return res.status(httpStatus.NOT_FOUND).json(notFound("Oferta no encontrada"));
        if (!esPublicadorORecrutador(req, oferta)) return res.status(httpStatus.FORBIDDEN).json(forbidden());

        const actualizada = await Oferta.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate("habilidades_requeridas", "nombre")
            .populate("publicado_por", "nombre apellido_paterno rol");
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /oferta/:id → eliminar una oferta (admin/mentor o quien la publicó)
export const eliminarOferta = async (req, res) => {
    try {
        const oferta = await Oferta.findById(req.params.id);
        if (!oferta) return res.status(httpStatus.NOT_FOUND).json(notFound("Oferta no encontrada"));
        if (!esPublicadorORecrutador(req, oferta)) return res.status(httpStatus.FORBIDDEN).json(forbidden());

        await PostulacionOferta.deleteMany({ oferta_id: oferta._id });
        await Oferta.findByIdAndDelete(oferta._id);
        res.json({ message: "Oferta eliminada y sus postulaciones" });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /oferta/:id/postular → postular a una oferta (autenticado)
export const postularAOferta = async (req, res) => {
    try {
        const oferta = await Oferta.findById(req.params.id);
        if (!oferta) return res.status(httpStatus.NOT_FOUND).json(notFound("Oferta no encontrada"));
        if (oferta.estado !== "abierta") return res.status(httpStatus.CONFLICT).json(conflict("Esta oferta ya no acepta postulaciones"));

        if (String(oferta.publicado_por) === String(req.usuario.id)) {
            return res.status(httpStatus.CONFLICT).json(conflict("No puedes postularte a tu propia oferta"));
        }

        const existePendiente = await PostulacionOferta.findOne({ oferta_id: oferta._id, usuario_id: req.usuario.id, estado: "pendiente" });
        if (existePendiente) return res.status(httpStatus.CONFLICT).json(conflict("Ya tienes una postulación pendiente en esta oferta"));

        const postulacion = new PostulacionOferta({
            oferta_id: oferta._id,
            usuario_id: req.usuario.id,
            mensaje: (req.body.mensaje || "").trim()
        });
        const registrada = await postulacion.save();

        const nombreUsuario = await nombreDeUsuario(req.usuario.id);
        await registrarNotificacion({
            usuario_id: oferta.publicado_por,
            tipo: "oferta",
            titulo: "Nueva postulación a tu oferta",
            mensaje: `${nombreUsuario} se postuló a "${oferta.titulo}".`,
            enlace: `/ofertas`
        });

        res.status(httpStatus.CREATED).json(registrada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /mis-postulaciones-ofertas → mis postulaciones a ofertas (autenticado)
export const misPostulacionesOfertas = async (req, res) => {
    try {
        const postulaciones = await PostulacionOferta.find({ usuario_id: req.usuario.id })
            .populate("oferta_id", "titulo empresa tipo modalidad nivel estado habilidades_requeridas publicado_por")
            .populate({ path: "oferta_id", populate: { path: "habilidades_requeridas", select: "nombre" } })
            .sort({ fecha: -1 });
        res.json(postulaciones);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /postulacion-oferta-own/:id → retirar mi postulación pendiente (autenticado)
export const retirarMiPostulacionOferta = async (req, res) => {
    try {
        const postulacion = await PostulacionOferta.findById(req.params.id);
        if (!postulacion) return res.status(httpStatus.NOT_FOUND).json(notFound("Postulación no encontrada"));
        if (String(postulacion.usuario_id) !== String(req.usuario.id)) return res.status(httpStatus.FORBIDDEN).json(forbidden());
        if (postulacion.estado !== "pendiente") return res.status(httpStatus.CONFLICT).json(conflict("Solo puedes retirar una postulación pendiente"));

        postulacion.estado = "cancelada";
        await postulacion.save();
        res.json(postulacion);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /oferta/:id/postulaciones → postulaciones de una oferta (admin/mentor o quien la publicó)
export const postulacionesDeOferta = async (req, res) => {
    try {
        const oferta = await Oferta.findById(req.params.id);
        if (!oferta) return res.status(httpStatus.NOT_FOUND).json(notFound("Oferta no encontrada"));
        if (!esPublicadorORecrutador(req, oferta)) return res.status(httpStatus.FORBIDDEN).json(forbidden());

        const postulaciones = await PostulacionOferta.find({ oferta_id: oferta._id })
            .populate("usuario_id", "nombre apellido_paterno email rol especialidad_principal pais")
            .sort({ fecha: 1 });
        res.json(postulaciones);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /postulacion-oferta/:id/estado → aprobar/rechazar postulación (admin/mentor o quien la publicó)
export const cambiarEstadoPostulacionOferta = async (req, res) => {
    try {
        const { estado } = req.body;
        if (!["aceptada", "rechazada"].includes(estado)) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Estado inválido. Usa aceptada o rechazada"));
        }

        const postulacion = await PostulacionOferta.findById(req.params.id).populate("oferta_id", "titulo publicado_por");
        if (!postulacion) return res.status(httpStatus.NOT_FOUND).json(notFound("Postulación no encontrada"));
        if (!esPublicadorORecrutador(req, postulacion.oferta_id)) return res.status(httpStatus.FORBIDDEN).json(forbidden());
        if (postulacion.estado !== "pendiente") return res.status(httpStatus.CONFLICT).json(conflict("Solo puedes responder postulaciones pendientes"));

        postulacion.estado = estado;
        await postulacion.save();

        const tituloOferta = postulacion.oferta_id.titulo;
        await registrarNotificacion({
            usuario_id: postulacion.usuario_id,
            tipo: "oferta",
            titulo: estado === "aceptada" ? "¡Postulación aceptada!" : "Postulación no seleccionada",
            mensaje: estado === "aceptada"
                ? `Tu postulación a "${tituloOferta}" fue aceptada.`
                : `Tu postulación a "${tituloOferta}" no fue seleccionada.`,
            enlace: `/ofertas`
        });

        res.json(postulacion);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};