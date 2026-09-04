import { forbidden } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

const authorize = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(httpStatus.UNAUTHORIZED).json(forbidden("Acceso denegado, no hay token"));
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(httpStatus.FORBIDDEN).json(forbidden(`Rol ${req.usuario.rol} no autorizado para esta acción`));
        }

        next();
    };
};

export default authorize;
