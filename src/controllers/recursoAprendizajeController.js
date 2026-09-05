import RecursoAprendizaje from "../models/RecursoAprendizaje";
import { serverError, notFound, badRequest, conflict } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

//GET /recursos-aprendizaje → listar con filtros, paginación y ordenamiento
//ej: /recursos-aprendizaje?buscar=javascript&tipo=video&nivel=intermedio&orden=a-z
export const listarRecursos = async (req, res) => {
    try {
        const { buscar, tipo, nivel } = req.query;
        const filtros = {};

        // Filtro por tipo exacto (curso/documentación/video/artículo/libro)
        if (tipo) filtros.tipo = tipo;

        // Filtro por nivel exacto
        if (nivel) filtros.nivel = nivel;

        // Búsqueda de texto en título o descripción
        if (buscar) {
            filtros.$or = [
                { titulo: { $regex: buscar, $options: "i" } },
                { descripcion: { $regex: buscar, $options: "i" } }
            ];
        }

        // ORDENAMIENTO: ?orden=recientes|antiguos|a-z|z-a
        const ordenamientos = {
            recientes: { _id: -1 },
            antiguos: { _id: 1 },
            "a-z": { titulo: 1 },
            "z-a": { titulo: -1 }
        };
        const sort = ordenamientos[req.query.orden] || {};

        // PAGINACIÓN
        const pagina = Number(req.query.pagina) || 1;
        const limite = Number(req.query.limite) || 10;
        const salto = (pagina - 1) * limite;

        const total = await RecursoAprendizaje.countDocuments(filtros);

        const recursos = await RecursoAprendizaje.find(filtros).sort(sort).skip(salto).limit(limite);

        res.json({
            total,
            pagina,
            limite,
            total_paginas: Math.ceil(total / limite),
            recursos
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /recurso-aprendizaje/:id → ver un recurso por id
export const obtenerRecurso = async (req, res) => {
    try {
        const recurso = await RecursoAprendizaje.findById(req.params.id);
        if (!recurso) return res.status(httpStatus.NOT_FOUND).json(notFound("Recurso no encontrado"));
        res.json(recurso);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /recurso-aprendizaje/agregar → crear un recurso
export const crearRecurso = async (req, res) => {
    try {
        const { titulo } = req.body;
        if (!titulo) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("El campo titulo es obligatorio"));
        }
        const recurso = new RecursoAprendizaje(req.body);
        const recursoRegistrado = await recurso.save();
        res.status(httpStatus.CREATED).json(recursoRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /recurso-aprendizaje/:id → actualizar un recurso
export const actualizarRecurso = async (req, res) => {
    try {
        const actualizado = await RecursoAprendizaje.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Recurso no encontrado"));
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /recurso-aprendizaje/:id → eliminar un recurso
export const eliminarRecurso = async (req, res) => {
    try {
        const eliminado = await RecursoAprendizaje.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Recurso no encontrado"));
        res.json({ message: "Recurso eliminado", recurso: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /recurso-aprendizaje/:id/calificar → lógica de negocio: calificar un recurso (1-5)
export const calificarRecurso = async (req, res) => {
    try {
        const recursoId = req.params.id;
        const usuarioId = req.usuario.id;
        const { calificacion, texto } = req.body;

        if (!calificacion || calificacion < 1 || calificacion > 5) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("La calificación debe ser un número entre 1 y 5"));
        }

        const recurso = await RecursoAprendizaje.findById(recursoId);
        if (!recurso) return res.status(httpStatus.NOT_FOUND).json(notFound("Recurso no encontrado"));

        // Un usuario solo puede calificar una vez el mismo recurso
        const yaComento = recurso.comentarios.find(c => c.usuario_id && c.usuario_id.toString() === usuarioId);
        if (yaComento) {
            return res.status(httpStatus.CONFLICT).json(conflict("Ya has calificado este recurso"));
        }

        recurso.comentarios.push({
            usuario_id: usuarioId,
            texto: texto || "",
            calificacion
        });

        recurso.num_valoraciones += 1;
        const total = recurso.comentarios.reduce((acc, c) => acc + c.calificacion, 0);
        recurso.valoracion_promedio = total / recurso.comentarios.length;

        const recursoActualizado = await recurso.save();
        res.status(httpStatus.CREATED).json(recursoActualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};