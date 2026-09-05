import Habilidad from "../models/Habilidad";
import { serverError, notFound, badRequest } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

//GET /habilidades → listar con filtros, paginación y ordenamiento
//ej: /habilidades?buscar=react&categoria=Web&nivel=intermedio&orden=a-z
export const listarHabilidades = async (req, res) => {
    try {
        // req.query = { buscar, categoria, nivel } que el cliente manda en la URL
        const { buscar, categoria, nivel } = req.query;

        // Objeto de filtros acumulados
        const filtros = {};

        // Filtro por categoría exacta
        if (categoria) filtros.categoria = categoria;

        // El campo en BD se llama nivel_minimo, mapeamos "nivel" a ese campo
        if (nivel) filtros.nivel_minimo = nivel;

        // Búsqueda de texto en nombre o descripción (insensible a mayúsculas)
        if (buscar) {
            filtros.$or = [
                { nombre: { $regex: buscar, $options: "i" } },
                { descripcion: { $regex: buscar, $options: "i" } }
            ];
        }

        // ORDENAMIENTO: ?orden=recientes|antiguos|a-z|z-a
        const ordenamientos = {
            recientes: { _id: -1 },
            antiguos: { _id: 1 },
            "a-z": { nombre: 1 },
            "z-a": { nombre: -1 }
        };
        const sort = ordenamientos[req.query.orden] || {};

        // PAGINACIÓN
        const pagina = Number(req.query.pagina) || 1;
        const limite = Number(req.query.limite) || 10;
        const salto = (pagina - 1) * limite;

        const total = await Habilidad.countDocuments(filtros);

        const habilidades = await Habilidad.find(filtros).sort(sort).skip(salto).limit(limite);

        res.json({
            total,
            pagina,
            limite,
            total_paginas: Math.ceil(total / limite),
            habilidades
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /habilidad/:id → ver una habilidad por id
export const obtenerHabilidad = async (req, res) => {
    try {
        const habilidad = await Habilidad.findById(req.params.id);
        if (!habilidad) return res.status(httpStatus.NOT_FOUND).json(notFound("Habilidad no encontrada"));
        res.json(habilidad);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /habilidad/agregar → crear una habilidad
export const crearHabilidad = async (req, res) => {
    try {
        const { nombre, categoria } = req.body;
        if (!nombre || !categoria) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Todos los campos obligatorios son requeridos (nombre, categoria)"));
        }
        const habilidad = new Habilidad(req.body);
        const habilidadRegistrada = await habilidad.save();
        res.status(httpStatus.CREATED).json(habilidadRegistrada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /habilidad/:id → actualizar una habilidad
export const actualizarHabilidad = async (req, res) => {
    try {
        const actualizada = await Habilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(httpStatus.NOT_FOUND).json(notFound("Habilidad no encontrada"));
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /habilidad/:id → eliminar una habilidad
export const eliminarHabilidad = async (req, res) => {
    try {
        const eliminada = await Habilidad.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(httpStatus.NOT_FOUND).json(notFound("Habilidad no encontrada"));
        res.json({ message: "Habilidad eliminada", habilidad: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};