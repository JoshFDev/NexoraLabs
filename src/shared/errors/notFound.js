import httpStatus from "./httpStatus";

const notFound = (req, res, next) => {
    res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
};

export default notFound;
