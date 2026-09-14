import Equipo from "../models/Equipo";
import MensajeEquipo from "../models/MensajeEquipo";
import MiembroEquipo from "../models/MiembroEquipo";
import Usuario from "../models/Usuario";
import { registrarNotificacion } from "../shared/notificaciones";
import { serverError, notFound, badRequest, forbidden } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

//¿El usuario forma parte del equipo? (miembro activo registrado en MiembroEquipo)
const esMiembroDelEquipo = async (usuarioId, equipoId) => {
  const miembro = await MiembroEquipo.findOne({ equipo_id: equipoId, usuario_id: usuarioId });
  return Boolean(miembro);
};

//GET /equipo/:id/mensajes → historial de chat del equipo (solo integrantes)
export const listarMensajes = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));

    const esMiembro = await esMiembroDelEquipo(req.usuario.id, equipo._id);
    if (!esMiembro) return res.status(httpStatus.FORBIDDEN).json(forbidden());

    const mensajes = await MensajeEquipo.find({ equipo_id: equipo._id })
      .sort({ fecha: 1, _id: 1 })
      .limit(200)
      .populate("usuario_id", "nombre apellido_paterno foto");

    res.json(mensajes);
  } catch (error) {
    console.log(error);
    res.status(500).json(serverError(error));
  }
};

//POST /equipo/:id/mensajes → enviar un mensaje al chat del equipo (solo integrantes)
export const enviarMensaje = async (req, res) => {
  try {
    const { contenido } = req.body;
    if (!contenido || !contenido.trim()) {
      return res.status(httpStatus.BAD_REQUEST).json(badRequest("El mensaje no puede estar vacío"));
    }
    if (contenido.length > 1000) {
      return res.status(httpStatus.BAD_REQUEST).json(badRequest("El mensaje no puede superar 1000 caracteres"));
    }

    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));

    const esMiembro = await esMiembroDelEquipo(req.usuario.id, equipo._id);
    if (!esMiembro) return res.status(httpStatus.FORBIDDEN).json(forbidden());

    const mensaje = new MensajeEquipo({
      equipo_id: equipo._id,
      usuario_id: req.usuario.id,
      contenido: contenido.trim()
    });
    const registrado = await mensaje.save();
    const conDatos = await MensajeEquipo.findById(registrado._id).populate(
      "usuario_id",
      "nombre apellido_paterno foto"
    );

    //Avisar al resto del equipo (salvo quien escribe y quien silenció este chat)
    try {
      const otrosMiembros = await MiembroEquipo.find({
        equipo_id: equipo._id,
        usuario_id: { $ne: req.usuario.id }
      });
      const idsOtros = otrosMiembros.map((m) => m.usuario_id);

      const silenciados = await Usuario.find({
        _id: { $in: idsOtros },
        equipos_silenciados: equipo._id
      }).select("_id");
      const idsSilenciados = new Set(silenciados.map((s) => String(s._id)));

      const autor = await Usuario.findById(req.usuario.id).select("nombre apellido_paterno");
      const resumen = contenido.trim().length > 120 ? contenido.trim().slice(0, 120) + "…" : contenido.trim();

      await Promise.all(
        idsOtros
          .filter((uid) => !idsSilenciados.has(String(uid)))
          .map((uid) =>
            registrarNotificacion({
              usuario_id: uid,
              tipo: "equipo",
              titulo: `Nuevo mensaje en ${equipo.nombre}`,
              mensaje: `${autor?.nombre || "Alguien"}${autor?.apellido_paterno ? " " + autor.apellido_paterno : ""}: ${resumen}`,
              enlace: "/mi-equipo"
            })
          )
      );
    } catch (error) {
      console.log("No se pudieron crear las notificaciones del chat:", error);
    }

    res.status(httpStatus.CREATED).json(conDatos);
  } catch (error) {
    console.log(error);
    res.status(500).json(serverError(error));
  }
};

//PUT /equipo/:id/silenciar → activar o quitar el silencio del chat del equipo (solo integrantes)
export const silenciarEquipo = async (req, res) => {
  try {
    const { silenciado } = req.body;
    if (typeof silenciado !== "boolean") {
      return res.status(httpStatus.BAD_REQUEST).json(badRequest("El campo silenciado debe ser booleano"));
    }

    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));

    const esMiembro = await esMiembroDelEquipo(req.usuario.id, equipo._id);
    if (!esMiembro) return res.status(httpStatus.FORBIDDEN).json(forbidden());

    if (silenciado) {
      await Usuario.findByIdAndUpdate(req.usuario.id, { $addToSet: { equipos_silenciados: equipo._id } });
    } else {
      await Usuario.findByIdAndUpdate(req.usuario.id, { $pull: { equipos_silenciados: equipo._id } });
    }

    res.json({ message: silenciado ? "Grupo silenciado" : "Grupo reactivado", silenciado });
  } catch (error) {
    console.log(error);
    res.status(500).json(serverError(error));
  }
};
