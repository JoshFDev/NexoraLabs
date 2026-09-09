import Equipo from "../models/Equipo";
import MiembroEquipo from "../models/MiembroEquipo";
import { serverError, notFound, badRequest } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

//GET /equipos → listar con filtros, paginación y ordenamiento
//ej: /equipos?buscar=dev&estado=activo&orden=recientes
export const listarEquipos = async (req, res) => {
    try {
        const { buscar, estado } = req.query;
        const filtros = {};

        if (estado) filtros.estado = estado;

        if (req.query.proyecto) filtros.proyecto_id = req.query.proyecto;

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

        const total = await Equipo.countDocuments(filtros);

        const equipos = await Equipo.find(filtros)
            .sort(sort)
            .skip(salto)
            .limit(limite)
            .populate('proyecto_id', 'titulo creador_id');

        const idsEquipos = equipos.map((e) => e._id);
        const grupos = await MiembroEquipo.aggregate([
            { $match: { equipo_id: { $in: idsEquipos } } },
            { $group: { _id: "$equipo_id", n: { $sum: 1 } } }
        ]);
        const nPorEquipo = Object.fromEntries(grupos.map((g) => [String(g._id), g.n]));

        res.json({
            total,
            pagina,
            limite,
            total_paginas: Math.ceil(total / limite),
            equipos: equipos.map((e) => ({ ...e.toObject(), n_miembros: nPorEquipo[String(e._id)] || 0 }))
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /equipo/:id → ver un equipo por id
export const obtenerEquipo = async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id)
            .populate('proyecto_id', 'titulo creador_id');
        if (!equipo) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));
        const n_miembros = await MiembroEquipo.countDocuments({ equipo_id: equipo._id });
        res.json({ ...equipo.toObject(), n_miembros });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /equipo/:id/miembros → integrantes de un equipo
export const miembrosDeEquipo = async (req, res) => {
    try {
        const miembros = await MiembroEquipo.find({ equipo_id: req.params.id })
            .populate('usuario_id', 'nombre apellido_paterno email rol');
        res.json(miembros);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /equipo/agregar → crear un equipo
export const crearEquipo = async (req, res) => {
    try {
        const { proyecto_id, nombre } = req.body;
        if (!proyecto_id || !nombre) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Todos los campos obligatorios son requeridos (proyecto_id, nombre)"));
        }
        const equipo = new Equipo(req.body);
        const equipoRegistrado = await equipo.save();
        res.status(httpStatus.CREATED).json(equipoRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /equipo/:id → actualizar un equipo
export const actualizarEquipo = async (req, res) => {
    try {
        const actualizado = await Equipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /equipo/:id → eliminar un equipo
export const eliminarEquipo = async (req, res) => {
    try {
        const eliminado = await Equipo.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Equipo no encontrado"));
        res.json({ message: "Equipo eliminado", equipo: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};