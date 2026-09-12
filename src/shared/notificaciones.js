import Notificacion from "../models/Notificacion";
import Usuario from "../models/Usuario";
import { enviarAvisoCorreo } from "./mailer";

const CATEGORIA_CORREO = {
    aceptaciones: "correo_aceptaciones",
    intereses: "correo_intereses"
};

// Crea una notificación para un usuario. Nunca lanza error: si falla,
// lo registra en consola para no romper el flujo principal (ej: postularse).
// `email` opcional: "aceptaciones" | "intereses" | true para avisar también por correo
// según las preferencias guardadas en el perfil del usuario.
export const registrarNotificacion = async ({ usuario_id, tipo = "sistema", titulo, mensaje = "", enlace = "", email = false }) => {
    try {
        if (!usuario_id || !titulo) return;
        const notificacion = new Notificacion({ usuario_id, tipo, titulo, mensaje, enlace });
        await notificacion.save();

        if (email) {
            const usuario = await Usuario.findById(usuario_id).select("email nombre preferencias_notificaciones");
            if (usuario) {
                const prefs = usuario.preferencias_notificaciones || {};
                const canalActivado = prefs.correo !== false;
                const categoria = CATEGORIA_CORREO[email];
                const categoriaActivada = categoria ? prefs[categoria] !== false : true;
                if (canalActivado && categoriaActivada) {
                    await enviarAvisoCorreo({
                        para: usuario.email,
                        nombre: usuario.nombre,
                        asunto: titulo,
                        mensaje,
                        enlace
                    });
                }
            }
        }

        return notificacion;
    } catch (error) {
        console.log("Error al registrar notificación:", error);
        return null;
    }
};

export default registrarNotificacion;