import { validarCorreo } from "../shared/validarCorreo";
import { badRequest, serverError } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

//GET /correo/validar?email=... → ¿el correo es válido/existente? (público, se usa en el registro)
export const validarCorreoEndpoint = async (req, res) => {
  try {
    const email = String(req.query.email || "").trim();
    if (!email) return res.status(httpStatus.BAD_REQUEST).json(badRequest("Ingresa un correo para validar"));
    if (email.length > 254) return res.status(httpStatus.BAD_REQUEST).json(badRequest("El correo es demasiado largo"));

    const resultado = await validarCorreo(email);
    if (resultado.estado === "invalido" && resultado.motivo === "formato") {
      return res.status(httpStatus.BAD_REQUEST).json(badRequest("Formato de correo no válido"));
    }

    res.json(resultado);
  } catch (error) {
    console.log(error);
    res.status(500).json(serverError(error));
  }
};
