import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || `"NexoraLabs" <${SMTP_USER}>`;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

let transporter = null;

// Solo se crea el transporter si hay credenciales y no estamos en tests.
const obtenerTransporter = () => {
    if (transporter) return transporter;
    if (!SMTP_USER || !SMTP_PASS) return null;
    if (process.env.NODE_ENV === "test") return null;
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return transporter;
};

// Envía un correo. Nunca lanza error: si falla o no está configurado,
// lo registra en consola para no romper el flujo principal.
export const enviarCorreo = async ({ para, asunto, html = "", texto = "" }) => {
    try {
        const t = obtenerTransporter();
        if (!t) return false;
        await t.sendMail({ from: MAIL_FROM, to: para, subject: asunto, text: texto, html });
        return true;
    } catch (error) {
        console.log("Error al enviar correo:", error);
        return false;
    }
};

// Plantilla base para correos que piden ingresar un código.
const plantillaConCodigo = ({ titulo, mensaje, codigo, pie, correoSoporte }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f0f8;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0f8;padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6def0;">
                    <tr>
                        <td style="padding:24px 32px;background:#120722;text-align:center;">
                            <div style="font-size:11px;letter-spacing:3px;color:#c4b5fd;text-transform:uppercase;margin-bottom:4px;">NexoraLabs</div>
                            <div style="color:#ffffff;font-size:20px;font-weight:bold;">${titulo}</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 32px;">
                            <p style="margin:0 0 16px;color:#5b4b6e;font-size:15px;line-height:1.6;">${mensaje}</p>
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                                <tr>
                                    <td style="border-radius:10px;background:#f3edfb;border:1px solid #ddcdf3;padding:16px 24px;text-align:center;">
                                        <div style="font-size:13px;color:#8a7f9c;margin-bottom:4px;">Tu código de verificación</div>
                                        <div style="font-size:30px;font-weight:bold;color:#120722;letter-spacing:6px;">${codigo}</div>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0 0 6px;color:#8a7f9c;font-size:13px;">${pie}</p>
                            <p style="margin:0;color:#8a7f9c;font-size:12px;">Si no solicitaste esto, ignora este correo.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 32px;border-top:1px solid #efe8f7;text-align:center;">
                            <span style="color:#9b8fb0;font-size:12px;">© 2026 NexoraLabs</span>
                            <span style="color:#cbbfdc;font-size:12px;">&nbsp;·&nbsp;</span>
                            <a href="mailto:${correoSoporte}" style="color:#7c3aed;font-size:12px;text-decoration:none;">Soporte</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

const cuerpoConCodigo = ({ mensaje, codigo, pie }) =>
    `${mensaje}\n\nTu código de verificación: ${codigo}\n\n${pie}`;

// Código de verificación de correo (registro).
export const enviarCodigoVerificacion = async (usuario, codigo) => {
    const correoSoporte = SMTP_USER || "soporte@nexoralabs.com";
    return enviarCorreo({
        para: usuario.email,
        asunto: "Verifica tu correo en NexoraLabs",
        texto: cuerpoConCodigo({
            mensaje: `Hola ${usuario.nombre}, para terminar de crear tu cuenta ingresa este código.`,
            codigo,
            pie: "El código expira en 10 minutos."
        }),
        html: plantillaConCodigo({
            titulo: "Verifica tu correo",
            mensaje: `Hola <strong>${usuario.nombre}</strong>, para terminar de crear tu cuenta en NexoraLabs ingresa este código:`,
            codigo,
            pie: "El código expira en 10 minutos.",
            correoSoporte
        })
    });
};

// Código para confirmar la eliminación de la cuenta.
export const enviarCodigoEliminacion = async (usuario, codigo) => {
    const correoSoporte = SMTP_USER || "soporte@nexoralabs.com";
    return enviarCorreo({
        para: usuario.email,
        asunto: "Confirmación para eliminar tu cuenta en NexoraLabs",
        texto: cuerpoConCodigo({
            mensaje: "Recibimos una solicitud para eliminar tu cuenta. Si realmente deseas hacerlo, ingresa este código:",
            codigo,
            pie: "El código expira en 15 minutos. Si no fuiste tú, ignora este correo."
        }),
        html: plantillaConCodigo({
            titulo: "Eliminar tu cuenta",
            mensaje: "Recibimos una solicitud para eliminar tu cuenta de NexoraLabs. Si realmente deseas hacerlo, ingresa este código:",
            codigo,
            pie: "El código expira en 15 minutos. Si no fuiste tú, ignora este correo y nadie podrá eliminar tu cuenta sin este código.",
            correoSoporte
        })
    });
};

// Correo de bienvenida al registrarse.
export const enviarBienvenida = async (usuario) => {
    const nombreCompleto = `${usuario.nombre} ${usuario.apellido_paterno || ""}`.trim();
    const fechaRegistro = usuario.fecha_registro
        ? new Date(usuario.fecha_registro).toLocaleString("es-MX", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
          })
        : "";
    const correoSoporte = SMTP_USER || "soporte@nexoralabs.com";
    return enviarCorreo({
        para: usuario.email,
        asunto: "¡Bienvenido a NexoraLabs!",
        texto:
            `Hola ${nombreCompleto},\n\n` +
            `Tu cuenta en NexoraLabs ha sido creada con el correo ${usuario.email}.\n` +
            `Ya puedes iniciar sesión y explorar proyectos, recursos, ofertas de empleo y equipos.\n\n` +
            `Explorar NexoraLabs: ${FRONTEND_URL}\n\n` +
            `${fechaRegistro ? `Cuenta creada el ${fechaRegistro}.\n\n` : ""}` +
            `© 2026 NexoraLabs. Soporte: ${correoSoporte}`,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f0f8;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0f8;padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6def0;">
                    <tr>
                        <td style="padding:24px 32px;background:#120722;text-align:center;">
                            <div style="font-size:11px;letter-spacing:3px;color:#c4b5fd;text-transform:uppercase;margin-bottom:4px;">NexoraLabs</div>
                            <div style="color:#ffffff;font-size:20px;font-weight:bold;">Crea, colabora y crece</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 32px;">
                            <h2 style="margin:0 0 12px;color:#2d2040;font-size:18px;">¡Bienvenido, ${nombreCompleto}!</h2>
                            <p style="margin:0 0 16px;color:#5b4b6e;font-size:15px;line-height:1.6;">
                                Tu cuenta fue creada con el correo <strong>${usuario.email}</strong>.<br>
                                Ya puedes iniciar sesión y explorar proyectos, recursos, ofertas de empleo y equipos.
                            </p>
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                                <tr>
                                    <td style="border-radius:8px;background:#7c3aed;">
                                        <a href="${FRONTEND_URL}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px;">Explorar NexoraLabs</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0 0 6px;color:#8a7f9c;font-size:13px;">Gracias por unirte a NexoraLabs.</p>
                            ${fechaRegistro ? `<p style="margin:0;color:#8a7f9c;font-size:12px;">Cuenta creada el ${fechaRegistro}.</p>` : ""}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 32px;border-top:1px solid #efe8f7;text-align:center;">
                            <span style="color:#9b8fb0;font-size:12px;">© 2026 NexoraLabs</span>
                            <span style="color:#cbbfdc;font-size:12px;">&nbsp;·&nbsp;</span>
                            <a href="mailto:${correoSoporte}" style="color:#7c3aed;font-size:12px;text-decoration:none;">Soporte</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
    });
};

export default enviarBienvenida;