import Logro from "../models/Logro";
import LogroUsuario from "../models/LogroUsuario";
import Usuario from "../models/Usuario";
import Proyecto from "../models/Proyecto";
import Postulacion from "../models/Postulacion";
import MiembroEquipo from "../models/MiembroEquipo";
import Comentario from "../models/Comentario";
import RecursoAprendizaje from "../models/RecursoAprendizaje";
import { serverError, notFound } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

const LOGROS_PREDETERMINADOS = [
    {
        clave: "perfil_completo",
        nombre: "Perfil completo",
        descripcion: "Completa todos los campos de tu perfil.",
        icono: "🎯",
        tipo: "completar_perfil",
        cantidad: 1
    },
    {
        clave: "primer_proyecto",
        nombre: "Creador inicial",
        descripcion: "Publica tu primer proyecto.",
        icono: "🚀",
        tipo: "crear_proyecto",
        cantidad: 1
    },
    {
        clave: "cinco_proyectos",
        nombre: "Mentor de ideas",
        descripcion: "Publica 5 proyectos.",
        icono: "💡",
        tipo: "crear_proyecto",
        cantidad: 5
    },
    {
        clave: "primera_postulacion",
        nombre: "Dando el primer paso",
        descripcion: "Postúlate a un proyecto.",
        icono: "✋",
        tipo: "postularse",
        cantidad: 1
    },
    {
        clave: "cinco_postulaciones",
        nombre: "Explorador activo",
        descripcion: "Postúlate a 5 proyectos.",
        icono: "🌍",
        tipo: "postularse",
        cantidad: 5
    },
    {
        clave: "primer_equipo",
        nombre: "Trabajo en equipo",
        descripcion: "Únete a un equipo.",
        icono: "🤝",
        tipo: "unirse_equipo",
        cantidad: 1
    },
    {
        clave: "tres_equipos",
        nombre: "Colaborador nato",
        descripcion: "Forma parte de 3 equipos.",
        icono: "👥",
        tipo: "unirse_equipo",
        cantidad: 3
    },
    {
        clave: "primer_comentario",
        nombre: "Voz en la comunidad",
        descripcion: "Deja tu primer comentario en un proyecto.",
        icono: "💬",
        tipo: "comentar",
        cantidad: 1
    },
    {
        clave: "diez_comentarios",
        nombre: "Comunidad participativa",
        descripcion: "Deja 10 comentarios en proyectos.",
        icono: "🗣️",
        tipo: "comentar",
        cantidad: 10
    },
    {
        clave: "primer_recurso",
        nombre: "Primera reseña",
        descripcion: "Califica tu primer recurso de aprendizaje.",
        icono: "📚",
        tipo: "calificar_recurso",
        cantidad: 1
    }
];

const garantizarLogrosDefinidos = async () => {
    await Promise.all(
        LOGROS_PREDETERMINADOS.map((def) =>
            Logro.updateOne(
                { clave: def.clave },
                { $setOnInsert: def },
                { upsert: true }
            )
        )
    );
};

const cumplimientosUsuario = async (usuarioId) => {
    const [
        totalProyectos,
        totalPostulaciones,
        totalEquipos,
        totalComentarios,
        totalRecursos,
        usuario
    ] = await Promise.all([
        Proyecto.countDocuments({ creador_id: usuarioId }),
        Postulacion.countDocuments({ usuario_id: usuarioId, estado: { $ne: "cancelada" } }),
        MiembroEquipo.countDocuments({ usuario_id: usuarioId }),
        Comentario.countDocuments({ usuario_id: usuarioId }),
        RecursoAprendizaje.countDocuments({ "comentarios.usuario_id": usuarioId }),
        Usuario.findById(usuarioId, "apellido_materno pais provincia acerca_de_mi especialidad_principal intereses idiomas educacion").lean()
    ]);

    const perfilCompleto = Boolean(
        usuario?.apellido_materno &&
        usuario?.pais &&
        usuario?.provincia &&
        usuario?.acerca_de_mi &&
        usuario?.especialidad_principal &&
        Array.isArray(usuario?.intereses) && usuario.intereses.length > 0 &&
        Array.isArray(usuario?.idiomas) && usuario.idiomas.length > 0 &&
        usuario?.educacion?.institucion &&
        usuario?.educacion?.titulo
    );

    return {
        completar_perfil: perfilCompleto ? 1 : 0,
        crear_proyecto: totalProyectos,
        postularse: totalPostulaciones,
        unirse_equipo: totalEquipos,
        comentar: totalComentarios,
        calificar_recurso: totalRecursos
    };
};

const verificarYOtorgarLogros = async (usuarioId) => {
    const cumplimientos = await cumplimientosUsuario(usuarioId);
    const logros = await Logro.find({ activo: true }).lean();

    const obtenibles = logros.filter((l) => (cumplimientos[l.tipo] || 0) >= (l.cantidad || 1));

    const otorgados = await LogroUsuario.find({ usuario_id: usuarioId }).lean();

    const nuevosIds = obtenibles
        .filter((l) => !otorgados.some((o) => String(o.logro_id) === String(l._id)))
        .map((l) => ({ usuario_id: usuarioId, logro_id: l._id }));

    if (nuevosIds.length) {
        await LogroUsuario.insertMany(nuevosIds);
    }

    const porClave = new Map(otorgados.map((o) => [String(o.logro_id), o]));

    return logros.map((l) => {
        const otorgado = porClave.get(String(l._id));
        return {
            ...l,
            obtenido: Boolean(otorgado),
            fecha_obtencion: otorgado?.fecha_obtencion || null
        };
    });
};

//GET /mis-logros → verifica y retorna todos los logros con mi progreso (autenticado)
export const misLogros = async (req, res) => {
    try {
        await garantizarLogrosDefinidos();
        const logros = await verificarYOtorgarLogros(req.usuario.id);
        const obtenidos = logros.filter((l) => l.obtenido);
        res.json({
            logros,
            total_obtenidos: obtenidos.length,
            total_logros: logros.length
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /logros → catálogo público de logros sin estado por usuario
export const listarLogros = async (_req, res) => {
    try {
        await garantizarLogrosDefinidos();
        const logros = await Logro.find({ activo: true }).sort({ tipo: 1 }).lean();
        res.json({ logros });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /logros/usuario/:id → logros obtenidos por un usuario (público)
export const logrosDeUsuario = async (req, res) => {
    try {
        const existe = await Usuario.findById(req.params.id, "nombre").lean();
        if (!existe) return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));

        const otorgados = await LogroUsuario.find({ usuario_id: req.params.id }).populate("logro_id").lean();
        const logros = otorgados
            .filter((o) => o.logro_id)
            .map((o) => ({
                clave: o.logro_id.clave,
                nombre: o.logro_id.nombre,
                descripcion: o.logro_id.descripcion,
                icono: o.logro_id.icono,
                fecha_obtencion: o.fecha_obtencion
            }));

        res.json({ logros });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

export default { misLogros, listarLogros, logrosDeUsuario };