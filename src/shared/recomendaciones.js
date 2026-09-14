import Usuario from "../models/Usuario";
import { registrarNotificacion } from "./notificaciones";

// Avisa por campanita y correo (si el usuario lo tiene activado) a quienes tengan
// intereses que coincidan con el contenido nuevo (proyectos, ofertas, recursos...).
export const notificarInteresados = async ({
  tipo,
  titulo,
  descripcion,
  coincidencias = [],
  enlace,
  creadorExcluido
}) => {
  try {
    const texto = `${titulo} ${descripcion} ${coincidencias.join(" ")}`.toLowerCase();
    if (texto.trim().length < 10) return 0;

    const usuarios = await Usuario.find({
      _id: { $ne: creadorExcluido },
      email_verificado: { $ne: false },
      intereses: { $exists: true, $ne: [] }
    }).select("_id intereses preferencias_notificaciones nombre");

    let enviadas = 0;
    for (const usuario of usuarios) {
      const intereses = Array.isArray(usuario.intereses) ? usuario.intereses : [];
      const coincide = intereses.some((i) => i && texto.includes(String(i).toLowerCase()));
      if (!coincide) continue;

      await registrarNotificacion({
        usuario_id: usuario._id,
        tipo,
        titulo: `Nuevo ${tituloEtiqueta(tipo)} para ti`,
        mensaje: `${tituloEtiqueta(tipo).charAt(0).toUpperCase() + tituloEtiqueta(tipo).slice(1)} "${titulo}" puede interesarte según tus intereses.`,
        enlace,
        email: "intereses"
      });
      enviadas += 1;
    }
    return enviadas;
  } catch (error) {
    console.log("Error al notificar interesados:", error);
    return 0;
  }
};

const tituloEtiqueta = (tipo) => {
  const etiquetas = {
    proyecto: "proyecto",
    oferta: "oferta de empleo",
    recurso: "recurso de aprendizaje"
  };
  return etiquetas[tipo] || "publicación";
};

export default notificarInteresados;
