import jwt from "jsonwebtoken";
import { unauthorized } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

export default (req, res, next) => {
    const cabecera = req.header("Authorization") || "";
    //El cliente envía "Bearer <token>"; quitamos el prefijo para verificarlo
    const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : cabecera;

    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json(unauthorized("Acceso denegado, no hay token"));
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado;
        next();
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).json(unauthorized("Token no válido"));
    }
};
