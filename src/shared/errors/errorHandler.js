import httpStatus from "./httpStatus";

const createError = (status, message, details) => ({
    status,
    error: message,
    ...(details ? { details } : {})
});

const badRequest = (message = "Solicitud inválida") => createError(httpStatus.BAD_REQUEST, message);
const notFound = (message = "Recurso no encontrado") => createError(httpStatus.NOT_FOUND, message);
const unauthorized = (message = "No autorizado") => createError(httpStatus.UNAUTHORIZED, message);
const serverError = (error) => createError(error.status || httpStatus.INTERNAL_SERVER_ERROR, error.message || "Error interno del servidor");

export { httpStatus, createError, badRequest, notFound, unauthorized, serverError };