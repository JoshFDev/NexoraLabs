import { Router } from "express";
import Habilidad from "../models/Habilidad";
import { serverError, notFound, badRequest } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";

const router = Router();

//Listar todas las habilidades (con filtros)
//GET /habilidades?buscar=react&categoria=Web&nivel=intermedio
router.get('/habilidades', async (req, res) => {
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

        // PAGINACIÓN
        const pagina = Number(req.query.pagina) || 1;
        const limite = Number(req.query.limite) || 10;
        const salto = (pagina - 1) * limite;

        const total = await Habilidad.countDocuments(filtros);

        const habilidades = await Habilidad.find(filtros).skip(salto).limit(limite);

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
});

//Ver una habilidad por id
router.get('/habilidad/:id', async (req, res) => {
    try {
        const habilidad = await Habilidad.findById(req.params.id);
        if (!habilidad) return res.status(httpStatus.NOT_FOUND).json(notFound("Habilidad no encontrada"));
        res.json(habilidad);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Crear habilidad
router.post('/habilidad/agregar', verifyToken, authorize("admin", "mentor"), async (req, res) => {
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
});

//Actualizar habilidad
router.put('/habilidad/:id', verifyToken, authorize("admin", "mentor"), async (req, res) => {
    try {
        const actualizada = await Habilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(httpStatus.NOT_FOUND).json(notFound("Habilidad no encontrada"));
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Eliminar habilidad
router.delete('/habilidad/:id', verifyToken, authorize("admin", "mentor"), async (req, res) => {
    try {
        const eliminada = await Habilidad.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(httpStatus.NOT_FOUND).json(notFound("Habilidad no encontrada"));
        res.json({ message: "Habilidad eliminada", habilidad: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;
