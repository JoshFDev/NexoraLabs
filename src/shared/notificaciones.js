import Notificacion from "../models/Notificacion";

// Crea una notificación para un usuario. Nunca lanza error: si falla,
// lo registra en consola para no romper el flujo principal (ej: postularse).
export const registrarNotificacion = async ({ usuario_id, tipo = "sistema", titulo, mensaje = "", enlace = "" }) => {
    try {
        if (!usuario_id || !titulo) return;
        const notificacion = new Notificacion({ usuario_id, tipo, titulo, mensaje, enlace });
        await notificacion.save();
        return notificacion;
    } catch (error) {
        console.log("Error al registrar notificación:", error);
        return null;
    }
};

export default registrarNotificacion;