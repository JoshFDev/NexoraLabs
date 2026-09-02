import httpStatus from "./httpStatus";

const errorHandlerMiddleware = (err, req, res, next) => {
    console.log(err.stack);

    const status = err.status || httpStatus.INTERNAL_SERVER_ERROR;
    const message = err.message || "Error interno del servidor";

    res.status(status).json({
        status,
        error: message
    });
};

export default errorHandlerMiddleware;
