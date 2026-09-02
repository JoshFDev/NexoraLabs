import jwt from "jsonwebtoken";
import { unauthorized } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

export default (req, res, next) => {
    const token = req.header("Authorization");

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
